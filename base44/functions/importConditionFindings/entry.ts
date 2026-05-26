import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Import a CSV/Excel of inspector findings and AI-match each finding to the
// best existing ScanFrame for that asset using vision LLM.
//
// Input:
//   { file_url: string, digital_twin_model_id?: string }
//
// Expected spreadsheet columns (case-insensitive, flexible):
//   asset_name (or equipment_name, asset)
//   anomaly_type        (scratch | dent | crack | corrosion | stain | broken_part | missing_part | wear | water_damage | graffiti | misalignment | other)
//   severity            (minor | moderate | major | critical)
//   description (optional)
//
// Output: { success, imported, unmatched, rows: [{ asset, status, reason, report_id?, frame_id?, match_confidence? }] }

const ANOMALY_TYPES = ['scratch','dent','crack','corrosion','stain','broken_part','missing_part','wear','water_damage','graffiti','misalignment','other'];
const SEVERITIES = ['minor','moderate','major','critical'];
const SEV_TO_SCORE = { minor: 2, moderate: 3, major: 4, critical: 5 };

function norm(s) {
  return (s || '').toString().trim().toLowerCase();
}

function pickField(row, ...keys) {
  for (const k of keys) {
    const found = Object.keys(row).find((rk) => norm(rk) === norm(k));
    if (found && row[found] != null && row[found] !== '') return row[found];
  }
  return '';
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { file_url, digital_twin_model_id } = body || {};
    if (!file_url) return Response.json({ error: 'file_url is required' }, { status: 400 });

    // Extract structured rows from the spreadsheet
    const extracted = await base44.integrations.Core.ExtractDataFromUploadedFile({
      file_url,
      json_schema: {
        type: 'object',
        properties: {
          rows: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                asset_name: { type: 'string' },
                anomaly_type: { type: 'string' },
                severity: { type: 'string' },
                description: { type: 'string' },
              },
            },
          },
        },
      },
    });

    if (extracted?.status !== 'success') {
      return Response.json({ error: `Could not parse file: ${extracted?.details || 'unknown error'}` }, { status: 400 });
    }

    const rawRows = Array.isArray(extracted.output?.rows) ? extracted.output.rows
      : Array.isArray(extracted.output) ? extracted.output
      : [];

    if (rawRows.length === 0) {
      return Response.json({ error: 'No rows detected in the file.' }, { status: 400 });
    }

    // Load assets & scan context once
    const equipment = await base44.asServiceRole.entities.Equipment.list('-created_date', 1000);
    const equipByName = new Map();
    for (const e of equipment) equipByName.set(norm(e.name), e);

    // Optional scan scope
    let scopedScan = null;
    if (digital_twin_model_id) {
      try {
        const scans = await base44.asServiceRole.entities.DigitalTwinModel.filter({ id: digital_twin_model_id }, '-created_date', 1);
        scopedScan = scans?.[0] || null;
      } catch (_) { /* ignore */ }
    }

    const results = [];
    let imported = 0;
    let unmatched = 0;

    for (const raw of rawRows) {
      const assetName = pickField(raw, 'asset_name', 'equipment_name', 'asset', 'name');
      const anomalyType = norm(pickField(raw, 'anomaly_type', 'defect_type', 'type'));
      const severity = norm(pickField(raw, 'severity', 'priority'));
      const description = pickField(raw, 'description', 'notes', 'finding');

      if (!assetName) {
        results.push({ asset: '', status: 'skipped', reason: 'Missing asset name' });
        unmatched++;
        continue;
      }

      const eq = equipByName.get(norm(assetName));
      if (!eq) {
        results.push({ asset: assetName, status: 'skipped', reason: 'Asset not found in register' });
        unmatched++;
        continue;
      }

      // Find scan frames for this asset. Strategy: prefer frames inside the scoped scan and tagged
      // with this equipment_id; fall back to any ScanFrame whose equipment_id matches.
      let candidateFrames = [];
      if (scopedScan) {
        candidateFrames = await base44.asServiceRole.entities.ScanFrame.filter({
          digital_twin_model_id: scopedScan.id,
          equipment_id: eq.id,
        }, '-created_date', 12);
      }
      if (candidateFrames.length === 0) {
        candidateFrames = await base44.asServiceRole.entities.ScanFrame.filter({
          equipment_id: eq.id,
        }, '-created_date', 12);
      }

      // Filter to frames that have an actual image URL
      candidateFrames = candidateFrames.filter((f) => !!f.image_url);

      if (candidateFrames.length === 0) {
        results.push({ asset: assetName, status: 'unmatched', reason: 'No scan frames found for this asset' });
        unmatched++;
        continue;
      }

      // Ask vision LLM to pick the frame that best matches the finding
      let bestFrame = candidateFrames[0];
      let matchConfidence = 0;
      let matchRationale = '';

      try {
        const finding = `${anomalyType || 'defect'} (${severity || 'unknown severity'}): ${description || 'no description'}`;
        const llm = await base44.integrations.Core.InvokeLLM({
          prompt: `You are matching an inspector's written finding to the most visually relevant photo of an asset.

Asset: ${eq.name} (${eq.type || 'asset'})
Inspector finding: ${finding}

Below are ${candidateFrames.length} photo(s) of this asset. Pick the ONE that most clearly shows the described defect. If none clearly shows it, pick the most representative photo of the asset.

Respond with the 1-based index of the best photo, a confidence 0-100, and a short rationale.`,
          file_urls: candidateFrames.map((f) => f.image_url),
          model: 'gemini_3_1_pro',
          response_json_schema: {
            type: 'object',
            properties: {
              best_index: { type: 'number' },
              confidence: { type: 'number' },
              rationale: { type: 'string' },
            },
          },
        });
        const idx = Math.max(1, Math.min(candidateFrames.length, Math.round(llm?.best_index || 1))) - 1;
        bestFrame = candidateFrames[idx] || candidateFrames[0];
        matchConfidence = Math.max(0, Math.min(100, Number(llm?.confidence) || 0));
        matchRationale = llm?.rationale || '';
      } catch (e) {
        // Fall back to first frame
        matchRationale = `LLM match failed: ${e.message}`;
      }

      // Create a ConditionReport, attached to the matched frame's scan/image
      const safeType = ANOMALY_TYPES.includes(anomalyType) ? anomalyType : 'other';
      const safeSeverity = SEVERITIES.includes(severity) ? severity : 'moderate';
      const scanId = bestFrame.digital_twin_model_id || scopedScan?.id || null;
      let scanName = '';
      if (scanId) {
        try {
          const s = await base44.asServiceRole.entities.DigitalTwinModel.filter({ id: scanId }, '-created_date', 1);
          scanName = s?.[0]?.name || '';
        } catch (_) { /* ignore */ }
      }

      const report = await base44.asServiceRole.entities.ConditionReport.create({
        digital_twin_model_id: scanId,
        digital_twin_model_name: scanName,
        room_code: bestFrame.room_code || null,
        room_name: bestFrame.room_name || null,
        component_type: bestFrame.component_type || null,
        equipment_id: eq.id,
        equipment_name: eq.name,
        image_url: bestFrame.image_url,
        anomaly_type: safeType,
        severity: safeSeverity,
        condition_score: SEV_TO_SCORE[safeSeverity] || 3,
        ai_confidence: matchConfidence,
        ai_description: `[Imported finding] ${description || ''}`.trim(),
        ai_model_version: 'inspector-import-v1',
        review_status: 'pending',
        reviewer_notes: matchRationale ? `Photo match: ${matchRationale}` : '',
        used_for_training: false,
      });

      results.push({
        asset: assetName,
        status: 'imported',
        report_id: report.id,
        frame_id: bestFrame.id,
        scan_id: scanId,
        match_confidence: matchConfidence,
      });
      imported++;
    }

    // Audit
    try {
      await base44.asServiceRole.entities.AuditLogEntry.create({
        actor_email: user.email,
        actor_role: user.role || 'user',
        action: 'scan.import_findings',
        category: 'data',
        severity: 'notice',
        target_entity: 'ConditionReport',
        target_name: 'Inspector findings import',
        summary: `Imported ${imported} finding(s); ${unmatched} unmatched`,
        metadata: { total_rows: rawRows.length, imported, unmatched, scoped_scan_id: digital_twin_model_id || null },
        outcome: 'success',
      });
    } catch (_) { /* best-effort */ }

    return Response.json({ success: true, imported, unmatched, total: rawRows.length, rows: results });
  } catch (error) {
    console.error('importConditionFindings error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});