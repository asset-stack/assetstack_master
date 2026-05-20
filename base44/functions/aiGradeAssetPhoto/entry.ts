import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { photo_url, asset_name, asset_type, current_grade } = await req.json();
    if (!photo_url) return Response.json({ error: 'photo_url required' }, { status: 400 });

    const prompt = `You are an expert civil/facility asset inspector grading the physical condition of an asset from a photo.

ASSET CONTEXT:
- Name: ${asset_name || 'Unknown'}
- Type: ${asset_type || 'Unknown'}
- Previously graded: ${current_grade ?? 'never graded'}

INSPECT THE PHOTO and return a strict JSON object with:
- condition_grade: integer 1–5 where 1=Excellent (like new), 2=Good (minor wear), 3=Fair (visible wear, functional), 4=Poor (significant defects, needs intervention), 5=Failed (non-functional/unsafe)
- confidence: 0–100 (how confident you are based on photo clarity/visibility)
- defect_type: one of [none, corrosion, crack, wear, dent, stain, missing_part, broken_part, water_damage, dirt, other]
- defect_description: 1-sentence plain-English description of what you observe
- recommended_action: short imperative ("Replace within 12 months", "Service in 6 months", "Monitor", "No action required")
- urgency: one of [none, low, medium, high, urgent]
- estimated_cost_aud: rough AUD repair/replacement cost estimate (number, 0 if no action)
- photo_quality: one of [good, acceptable, poor] — if blurry/dark/poor framing, mark poor and lower confidence

Be conservative — if photo is unclear, set lower confidence and photo_quality=poor.`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      file_urls: [photo_url],
      response_json_schema: {
        type: 'object',
        properties: {
          condition_grade: { type: 'number' },
          confidence: { type: 'number' },
          defect_type: { type: 'string' },
          defect_description: { type: 'string' },
          recommended_action: { type: 'string' },
          urgency: { type: 'string' },
          estimated_cost_aud: { type: 'number' },
          photo_quality: { type: 'string' },
        },
        required: ['condition_grade', 'confidence', 'defect_type', 'defect_description', 'recommended_action', 'urgency', 'photo_quality'],
      },
    });

    return Response.json({ ok: true, result });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});