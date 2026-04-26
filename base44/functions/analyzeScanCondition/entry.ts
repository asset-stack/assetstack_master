import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// AI-powered condition analysis for uploaded scan images.
// Uses InvokeLLM (gemini_3_1_pro with vision) to detect anomalies and score severity.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { image_url, digital_twin_model_id, digital_twin_model_name, equipment_name, criteria } = body;

    if (!image_url || !digital_twin_model_id) {
      return Response.json({ error: 'image_url and digital_twin_model_id are required' }, { status: 400 });
    }

    // Get the latest active condition ML model version (if any)
    const models = await base44.asServiceRole.entities.MLModel.filter({
      model_type: 'failure_classification',
      status: 'active',
    }, '-training_date', 1);
    const modelVersion = models?.[0]?.version || 'baseline-v1.0';

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
- description with the exact visual evidence and location, e.g. "visible crack on lower-right chair leg"
- bounding_box normalized to 0-1 range {x, y, width, height} where (0,0) is top-left

Return an array of findings. If no clear defect is visible, return an empty array.`;

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

    const findings = result?.findings || [];
    const created = [];

    for (const f of findings) {
      const report = await base44.asServiceRole.entities.ConditionReport.create({
        digital_twin_model_id,
        digital_twin_model_name,
        equipment_name,
        image_url,
        anomaly_type: f.anomaly_type || 'other',
        severity: f.severity || 'minor',
        condition_score: f.condition_score || 1,
        ai_confidence: f.confidence || 0,
        ai_description: f.description || '',
        ai_model_version: modelVersion,
        bounding_box: f.bounding_box || null,
        review_status: 'pending',
      });
      created.push(report);
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
    } catch (e) {
      console.warn('Could not update scan counts:', e.message);
    }

    return Response.json({
      success: true,
      findings_count: created.length,
      overall_summary: result?.overall_summary || '',
      reports: created,
      model_version: modelVersion,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});