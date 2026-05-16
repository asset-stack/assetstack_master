import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { prompt, capital_plan_item_ids = [], location_ids = [] } = await req.json();
    if (!prompt) {
      return Response.json({ error: 'prompt is required' }, { status: 400 });
    }

    // Pull context: locations, equipment summary, capital plan items if provided
    const [locations, capitalItems] = await Promise.all([
      base44.entities.Location.list().catch(() => []),
      capital_plan_item_ids.length
        ? Promise.all(capital_plan_item_ids.map((id) =>
            base44.entities.CapitalPlanItem.get(id).catch(() => null)
          )).then((r) => r.filter(Boolean))
        : Promise.resolve([])
    ]);

    const contextSummary = {
      locations_count: locations.length,
      location_samples: locations.slice(0, 8).map((l) => ({ id: l.id, name: l.name, city: l.city })),
      capital_items: capitalItems.map((c) => ({
        id: c.id,
        equipment_name: c.equipment_name,
        location_name: c.location_name,
        replacement_year: c.replacement_year,
        replacement_cost: c.replacement_cost,
        priority: c.priority,
        rationale: c.rationale
      }))
    };

    const llm = await base44.integrations.Core.InvokeLLM({
      prompt: `You are AssetMind, an asset-management AI helping a portfolio manager draft a delivery project.

User request: "${prompt}"

Context available:
${JSON.stringify(contextSummary, null, 2)}

Draft a realistic, deliverable project plan. Keep budget figures in whole dollars. Use 3-6 phases. Be specific to the prompt.`,
      response_json_schema: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          description: { type: 'string' },
          project_type: {
            type: 'string',
            enum: ['renewal', 'upgrade', 'new_build', 'compliance_program', 'disposal', 'grant_funded', 'maintenance_program', 'other']
          },
          priority: { type: 'string', enum: ['low', 'medium', 'high', 'critical'] },
          funding_source: { type: 'string', enum: ['operational', 'capital', 'grant', 'external', 'mixed', 'tbd'] },
          start_date: { type: 'string', description: 'YYYY-MM-DD' },
          target_end_date: { type: 'string', description: 'YYYY-MM-DD' },
          budget: { type: 'number' },
          phases: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                start_date: { type: 'string' },
                end_date: { type: 'string' },
                owner: { type: 'string' },
                notes: { type: 'string' }
              }
            }
          },
          risks: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                likelihood: { type: 'string', enum: ['unlikely', 'possible', 'likely', 'almost_certain'] },
                impact: { type: 'string', enum: ['minor', 'moderate', 'major', 'severe'] },
                mitigation: { type: 'string' }
              }
            }
          },
          rationale: { type: 'string', description: 'Why this scope, budget, and timing' }
        },
        required: ['name', 'project_type', 'phases']
      }
    });

    // Stamp ids + defaults
    const phases = (llm.phases || []).map((p, i) => ({
      ...p,
      id: `phase_${Date.now()}_${i}`,
      status: 'not_started',
      progress_percent: 0
    }));
    const risks = (llm.risks || []).map((r, i) => ({
      ...r,
      id: `risk_${Date.now()}_${i}`,
      status: 'open'
    }));

    return Response.json({
      draft: {
        ...llm,
        phases,
        risks,
        status: 'planning',
        health: 'on_track',
        progress_percent: 0,
        ai_generated: true,
        ai_prompt: prompt,
        capital_plan_item_ids,
        location_ids,
        location_names: capitalItems.map((c) => c.location_name).filter(Boolean)
      },
      rationale: llm.rationale
    });
  } catch (error) {
    console.error('composeProjectFromPrompt error', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});