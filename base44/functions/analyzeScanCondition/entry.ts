import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// In-memory concurrency guard — prevents duplicate runs for the same scan within the same instance.
const inFlight = new Set();

// Compute simple IoU for bounding-box dedup
function iou(a, b) {
  if (!a || !b) return 0;
  const x1 = Math.max(a.x, b.x);
  const y1 = Math.max(a.y, b.y);
  const x2 = Math.min(a.x + a.width, b.x + b.width);
  const y2 = Math.min(a.y + a.height, b.y + b.height);
  if (x2 <= x1 || y2 <= y1) return 0;
  const inter = (x2 - x1) * (y2 - y1);
  const areaA = a.width * a.height;
  const areaB = b.width * b.height;
  return inter / (areaA + areaB - inter);
}

// AI-powered condition analysis for uploaded scan images.
// Uses InvokeLLM (gemini_3_1_pro with vision) to detect anomalies and score severity.
// Hardened: idempotent, dedup-aware, auto-creates work orders for critical/major findings.
Deno.serve(async (req) => {
  let lockKey = null;
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { image_url, digital_twin_model_id, digital_twin_model_name, equipment_name, equipment_id, criteria, frame_id, replace_previous } = body;

    if (!image_url || !digital_twin_model_id) {
      return Response.json({ error: 'image_url and digital_twin_model_id are required' }, { status: 400 });
    }

    // Concurrency guard — block duplicate concurrent runs on the same target
    lockKey = `${digital_twin_model_id}::${image_url}`;
    if (inFlight.has(lockKey)) {
      return Response.json({ error: 'Analysis already in progress for this image. Please wait.' }, { status: 429 });
    }
    inFlight.add(lockKey);

    // Get the latest active condition ML model version (if any)
    const models = await base44.asServiceRole.entities.MLModel.filter({
      model_type: 'failure_classification',
      status: 'active',
    }, '-training_date', 1);
    const modelVersion = models?.[0]?.version || 'baseline-v1.0';

    // If replace_previous, soft-clear previous AI findings for this exact image (only pending ones — keep verified)
    if (replace_previous) {
      const previous = await base44.asServiceRole.entities.ConditionReport.filter({
        digital_twin_model_id,
        image_url,
        review_status: 'pending',
      });
      for (const r of previous) {
        await base44.asServiceRole.entities.ConditionReport.delete(r.id);
      }
    }

    // Load tagged frame context so findings inherit room/component metadata.
    let frameContext = null;
    if (frame_id) {
      const matchingFrames = await base44.asServiceRole.entities.ScanFrame.filter({ id: frame_id }, null, 1);
      frameContext = matchingFrames?.[0] || null;
    }

    // Load scan + location assets so defects can be linked to fixed assets when visible.
    let scanContext = null;
    let knownEquipment = [];
    try {
      const scans = await base44.asServiceRole.entities.DigitalTwinModel.filter({ id: digital_twin_model_id }, null, 1);
      scanContext = scans?.[0] || null;
      if (scanContext?.location_id) {
        knownEquipment = await base44.asServiceRole.entities.Equipment.filter({ location_id: scanContext.location_id }, '-created_date', 200);
      } else if (scanContext?.location_name) {
        knownEquipment = await base44.asServiceRole.entities.Equipment.filter({ location: scanContext.location_name }, '-created_date', 200);
      }
    } catch (ctxErr) {
      console.warn('Asset context load failed:', ctxErr.message);
    }

    // Load existing reports on this image (for IoU-based dedup against any status)
    const existing = await base44.asServiceRole.entities.ConditionReport.filter({
      digital_twin_model_id,
      image_url,
    });

    const criteriaText = criteria || `
Standard facility condition criteria:
- Scratches: minor surface marks on floors/walls/surfaces
- Dents: physical indentations or impact damage
- Cracks: fractures in walls, floors, or structural elements
- Corrosion: rust or chemical degradation on metal
- Stains: discoloration from liquids, grease, or chemicals
- Broken parts: fractured furniture, fittings, or fixtures (e.g. broken chair legs)
- Missing parts: absent components
- Wear: general aging or usage-related degradation
- Water damage: moisture stains, warping, mould
- Graffiti: unauthorized markings
- Misalignment: components not properly positioned

Severity scale:
- minor (condition 1-2): cosmetic only, no functional impact
- moderate (condition 3): visible but functional
- major (condition 4): impacts function or safety
- critical (condition 5): immediate action required, unsafe
`;

    const prompt = `You are an expert asset condition inspector analyzing a facility scan image.

${criteriaText}

Asset context: ${equipment_name || 'General facility scan'}
Scan: ${digital_twin_model_name || 'Unknown'}

Analyze the image like a careful human asset inspector. Only report defects that are clearly visible in the provided real asset photo; do not invent issues, do not flag shadows/reflections, and skip anything with low visual confidence.

For each confirmed visible issue, provide:
- anomaly_type (from the list above)
- severity (minor/moderate/major/critical)
- condition_score (1-5)
- confidence (0-100)
- asset_type if the defect is on/near a fixed asset: light, door, window, ceiling, floor, wall, hvac, fire_equipment, security_camera, display_case, furniture, plumbing, electrical, other
- asset_name_hint using plain language, e.g. "ceiling light", "entry door", "gallery window"
- description with the exact visual evidence and location, e.g. "visible crack on lower-right chair leg"
- bounding_box normalized to 0-1 range {x, y, width, height} where (0,0) is top-left

Return an array of findings. If no clear defect is visible, return an empty array. Be conservative on warped, blurry, or poorly lit MatterPak JPEGs.`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      file_urls: [image_url],
      model: 'gemini_3_1_pro',
      response_json_schema: {
        type: 'object',
        properties: {
          findings: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                anomaly_type: { type: 'string' },
                severity: { type: 'string' },
                condition_score: { type: 'number' },
                confidence: { type: 'number' },
                asset_type: { type: 'string' },
                asset_name_hint: { type: 'string' },
                description: { type: 'string' },
                bounding_box: {
                  type: 'object',
                  properties: {
                    x: { type: 'number' },
                    y: { type: 'number' },
                    width: { type: 'number' },
                    height: { type: 'number' },
                  },
                },
              },
            },
          },
          overall_summary: { type: 'string' },
        },
      },
    });

    const allowedTypes = ['scratch', 'dent', 'crack', 'corrosion', 'stain', 'broken_part', 'missing_part', 'wear', 'water_damage', 'graffiti', 'misalignment', 'other'];
    const allowedSeverity = ['minor', 'moderate', 'major', 'critical'];
    const allowedAssetTypes = ['light', 'lighting', 'door', 'window', 'ceiling', 'floor', 'wall', 'hvac', 'air_conditioning', 'fire_equipment', 'security_camera', 'display_case', 'furniture', 'plumbing', 'electrical', 'other'];
    const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, Number(value) || 0));
    const normalizeText = (value) => String(value || '').toLowerCase().replace(/[_-]/g, ' ');
    const matchEquipmentForFinding = (finding) => {
      const text = normalizeText(`${finding.asset_name_hint || ''} ${finding.asset_type || ''} ${finding.description || ''}`);
      if (!text || knownEquipment.length === 0) return null;

      let best = null;
      let bestScore = 0;
      for (const eq of knownEquipment) {
        const eqName = normalizeText(eq.name);
        const eqType = normalizeText(eq.type);
        const eqTags = normalizeText((eq.tags || []).join(' '));
        let score = 0;
        if (eqName && text.includes(eqName)) score += 6;
        if (eqType && text.includes(eqType)) score += 4;
        if (eqTags && eqTags.split(' ').some((tag) => tag && text.includes(tag))) score += 2;
        if (text.includes('light') && (eqType.includes('light') || eqName.includes('light') || eqTags.includes('light'))) score += 4;
        if (text.includes('door') && (eqName.includes('door') || eqTags.includes('door'))) score += 4;
        if (text.includes('window') && (eqName.includes('window') || eqTags.includes('window'))) score += 4;
        if ((text.includes('hvac') || text.includes('air')) && (eqType.includes('hvac') || eqName.includes('hvac') || eqTags.includes('hvac'))) score += 4;
        if (score > bestScore) {
          best = eq;
          bestScore = score;
        }
      }
      return bestScore >= 4 ? best : null;
    };
    const rawFindings = (result?.findings || []).filter((f) => Number(f.confidence || 0) >= 60);

    const created = [];
    const skippedDuplicates = [];

    for (const f of rawFindings) {
      const normalizedType = allowedTypes.includes(f.anomaly_type) ? f.anomaly_type : 'other';
      const normalizedSeverity = allowedSeverity.includes(f.severity) ? f.severity : 'minor';
      const normalizedAssetType = allowedAssetTypes.includes(f.asset_type) ? f.asset_type : null;
      const matchedEquipment = matchEquipmentForFinding(f);
      const linkedEquipmentId = equipment_id || matchedEquipment?.id || frameContext?.equipment_id || null;
      const linkedEquipmentName = equipment_name || matchedEquipment?.name || frameContext?.equipment_name || null;
      const normalizedBox = f.bounding_box ? {
        x: clamp(f.bounding_box.x),
        y: clamp(f.bounding_box.y),
        width: clamp(f.bounding_box.width, 0.02, 1),
        height: clamp(f.bounding_box.height, 0.02, 1),
      } : null;

      // Dedup: same anomaly_type + IoU > 0.5 with an existing report on this image
      const isDuplicate = existing.some((e) =>
        e.anomaly_type === normalizedType && iou(e.bounding_box, normalizedBox) > 0.5
      );
      if (isDuplicate) {
        skippedDuplicates.push(normalizedType);
        continue;
      }

      const report = await base44.asServiceRole.entities.ConditionReport.create({
        digital_twin_model_id,
        digital_twin_model_name,
        room_code: frameContext?.room_code || null,
        room_name: frameContext?.room_name || null,
        component_type: normalizedAssetType || frameContext?.component_type || null,
        equipment_id: linkedEquipmentId,
        equipment_name: linkedEquipmentName,
        image_url,
        anomaly_type: normalizedType,
        severity: normalizedSeverity,
        condition_score: Math.max(1, Math.min(5, Number(f.condition_score) || 1)),
        ai_confidence: Math.max(0, Math.min(100, Number(f.confidence) || 0)),
        ai_description: f.description || '',
        ai_model_version: modelVersion,
        bounding_box: normalizedBox,
        review_status: 'pending',
        used_for_training: false,
      });
      created.push(report);

      // Auto-create work order for critical/major findings on a known asset
      if ((normalizedSeverity === 'critical' || normalizedSeverity === 'major') && linkedEquipmentId) {
        try {
          await base44.asServiceRole.entities.WorkOrder.create({
            work_order_number: `WO-SCAN-${Date.now().toString().slice(-8)}`,
            equipment_id: linkedEquipmentId,
            title: `${normalizedSeverity.toUpperCase()}: ${normalizedType.replace(/_/g, ' ')} on ${linkedEquipmentName || 'asset'}`,
            description: `AI scan detected ${normalizedType} (${Math.round(f.confidence)}% confidence).\n\n${f.description || ''}\n\nSource: ${digital_twin_model_name || 'scan'}`,
            type: 'corrective',
            priority: normalizedSeverity === 'critical' ? 'urgent' : 'high',
            status: 'draft',
            estimated_hours: normalizedSeverity === 'critical' ? 6 : 4,
            history: [{
              timestamp: new Date().toISOString(),
              action: 'Auto-Generated from Scan',
              user: 'Scan AI',
              details: `From condition report ${report.id} (model ${modelVersion})`,
            }],
          });
        } catch (woErr) {
          console.warn('Auto WO creation failed:', woErr.message);
        }
      }
    }

    // Update model counts (best-effort — don't fail the whole call if scan was deleted)
    try {
      const allReports = await base44.asServiceRole.entities.ConditionReport.filter({
        digital_twin_model_id,
      });
      await base44.asServiceRole.entities.DigitalTwinModel.update(digital_twin_model_id, {
        total_anomalies: allReports.length,
        pending_review_count: allReports.filter((r) => r.review_status === 'pending').length,
      });

      // Update frame status if frame_id provided
      if (frame_id) {
        await base44.asServiceRole.entities.ScanFrame.update(frame_id, {
          analysis_status: 'completed',
          findings_count: created.length,
        });
      }
    } catch (e) {
      console.warn('Could not update scan/frame counts:', e.message);
    }

    // Audit log
    try {
      const ipHint = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
      await base44.asServiceRole.entities.AuditLogEntry.create({
        actor_email: user.email,
        actor_role: user.role || 'user',
        action: 'scan.analyze',
        category: 'ai',
        severity: created.length > 0 ? 'notice' : 'info',
        target_entity: 'DigitalTwinModel',
        target_id: digital_twin_model_id,
        target_name: digital_twin_model_name,
        summary: `AI scan produced ${created.length} new finding(s) (${skippedDuplicates.length} duplicate(s) skipped)`,
        metadata: {
          findings_count: created.length,
          duplicates_skipped: skippedDuplicates.length,
          model_version: modelVersion,
          equipment_name: equipment_name || null,
          detected_asset_type: normalizedAssetType || null,
          frame_id: frame_id || null,
        },
        ip_hint: ipHint,
        user_agent: req.headers.get('user-agent') || 'unknown',
        outcome: 'success',
      });
    } catch (e) {
      console.warn('Audit log write failed:', e.message);
    }

    return Response.json({
      success: true,
      findings_count: created.length,
      duplicates_skipped: skippedDuplicates.length,
      overall_summary: result?.overall_summary || '',
      reports: created,
      model_version: modelVersion,
    });
  } catch (error) {
    console.error('analyzeScanCondition error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  } finally {
    if (lockKey) inFlight.delete(lockKey);
  }
});