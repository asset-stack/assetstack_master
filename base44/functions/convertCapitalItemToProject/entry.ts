import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { capital_plan_item_ids = [] } = await req.json();
    if (!capital_plan_item_ids.length) {
      return Response.json({ error: 'capital_plan_item_ids required' }, { status: 400 });
    }

    const items = await Promise.all(
      capital_plan_item_ids.map((id) =>
        base44.entities.CapitalPlanItem.get(id).catch(() => null)
      )
    );
    const validItems = items.filter(Boolean);
    if (!validItems.length) {
      return Response.json({ error: 'No valid capital plan items' }, { status: 404 });
    }

    const totalBudget = validItems.reduce(
      (sum, i) => sum + (Number(i.replacement_cost) || 0),
      0
    );
    const equipmentIds = [...new Set(validItems.map((i) => i.equipment_id).filter(Boolean))];
    const locationIds = [...new Set(validItems.map((i) => i.location_id).filter(Boolean))];
    const locationNames = [...new Set(validItems.map((i) => i.location_name).filter(Boolean))];
    const earliestYear = Math.min(...validItems.map((i) => i.replacement_year || 9999));
    const highestPriority = validItems.some((i) => i.priority === 'urgent')
      ? 'critical'
      : validItems.some((i) => i.priority === 'high')
      ? 'high'
      : 'medium';

    const projectName =
      validItems.length === 1
        ? `${validItems[0].equipment_name} Renewal`
        : `Renewal Program FY${earliestYear} (${validItems.length} assets)`;

    const project = await base44.entities.Project.create({
      name: projectName,
      code: `PRJ-${Date.now().toString().slice(-6)}`,
      description: `Auto-generated from ${validItems.length} capital plan item(s).`,
      project_type: 'renewal',
      status: 'planning',
      priority: highestPriority,
      health: 'on_track',
      project_manager: user.email,
      location_ids: locationIds,
      location_names: locationNames,
      equipment_ids: equipmentIds,
      capital_plan_item_ids,
      start_date: `${earliestYear}-01-01`,
      target_end_date: `${earliestYear}-12-31`,
      budget: totalBudget,
      currency: 'USD',
      funding_source: validItems[0].funding_source || 'capital',
      progress_percent: 0,
      phases: [
        {
          id: `phase_${Date.now()}_1`,
          name: 'Scope & Design',
          start_date: `${earliestYear}-01-01`,
          end_date: `${earliestYear}-03-31`,
          status: 'not_started',
          progress_percent: 0
        },
        {
          id: `phase_${Date.now()}_2`,
          name: 'Procurement',
          start_date: `${earliestYear}-04-01`,
          end_date: `${earliestYear}-06-30`,
          status: 'not_started',
          progress_percent: 0
        },
        {
          id: `phase_${Date.now()}_3`,
          name: 'Delivery',
          start_date: `${earliestYear}-07-01`,
          end_date: `${earliestYear}-11-30`,
          status: 'not_started',
          progress_percent: 0
        },
        {
          id: `phase_${Date.now()}_4`,
          name: 'Commissioning & Handover',
          start_date: `${earliestYear}-12-01`,
          end_date: `${earliestYear}-12-31`,
          status: 'not_started',
          progress_percent: 0
        }
      ]
    });

    // Mark capital plan items as funded
    await Promise.all(
      capital_plan_item_ids.map((id) =>
        base44.entities.CapitalPlanItem.update(id, { status: 'funded' }).catch(() => null)
      )
    );

    return Response.json({ project });
  } catch (error) {
    console.error('convertCapitalItemToProject error', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});