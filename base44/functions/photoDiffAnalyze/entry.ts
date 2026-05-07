import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// AI photo diff — compares before/after photos of an asset.
// Body: { equipment_id, before_url, after_url }
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { equipment_id, before_url, after_url } = await req.json();
    if (!before_url || !after_url) {
      return Response.json({ error: 'before_url and after_url are required' }, { status: 400 });
    }

    const eq = equipment_id
      ? await base44.asServiceRole.entities.Equipment.get(equipment_id).catch(() => null)
      : null;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are an asset condition inspector. Compare these two photos of the same asset taken at different times. The first image is the BEFORE/baseline, the second is the AFTER/current.

Asset: ${eq?.name || 'Unknown'}
Component: ${eq?.specifications?.component_type || 'Unknown'}

Identify visible changes: degradation, damage, repairs, missing parts, wear patterns, discoloration, cracks, structural shifts. Score the change.`,
      file_urls: [before_url, after_url],
      response_json_schema: {
        type: 'object',
        properties: {
          summary: { type: 'string' },
          condition_change: {
            type: 'string',
            enum: ['improved', 'unchanged', 'minor_degradation', 'major_degradation', 'failure'],
          },
          confidence: { type: 'number', description: '0-100' },
          changes: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                area: { type: 'string' },
                description: { type: 'string' },
                severity: { type: 'string', enum: ['minor', 'moderate', 'major', 'critical'] },
              },
            },
          },
          recommended_action: { type: 'string' },
          suggested_grade_change: { type: 'number', description: 'Suggested new condition grade 1-5' },
        },
      },
      model: 'claude_sonnet_4_6',
    });

    // Audit
    try {
      await base44.asServiceRole.entities.AuditLogEntry.create({
        actor_email: user.email,
        action: 'photo.diff_analyze',
        category: 'ai',
        target_entity: 'Equipment',
        target_id: equipment_id,
        summary: `Photo diff: ${result?.condition_change || 'unknown'}`,
        metadata: { before_url, after_url, confidence: result?.confidence },
      });
    } catch (_) {}

    return Response.json({ success: true, analysis: result });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});