import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { project_id } = await req.json();
    if (!project_id) {
      return Response.json({ error: 'project_id required' }, { status: 400 });
    }

    const project = await base44.entities.Project.get(project_id);
    if (!project) {
      return Response.json({ error: 'Project not found' }, { status: 404 });
    }

    // Pull all work orders for equipment in this project
    const equipmentIds = project.equipment_ids || [];
    let allWO = [];
    if (equipmentIds.length) {
      const results = await Promise.all(
        equipmentIds.map((eid) =>
          base44.entities.WorkOrder.filter({ equipment_id: eid }).catch(() => [])
        )
      );
      allWO = results.flat();
    }

    const actual_cost = allWO.reduce(
      (sum, wo) => sum + (Number(wo.actual_total_cost) || 0),
      0
    );
    const estimated = allWO.reduce(
      (sum, wo) => sum + (Number(wo.estimated_cost) || 0),
      0
    );
    const committed_cost = allWO
      .filter((wo) => ['open', 'assigned', 'in_progress'].includes(wo.status))
      .reduce((sum, wo) => sum + (Number(wo.estimated_cost) || 0), 0);

    const completedWO = allWO.filter((wo) => wo.status === 'completed' || wo.status === 'closed');
    const progress_percent = allWO.length
      ? Math.round((completedWO.length / allWO.length) * 100)
      : project.progress_percent || 0;

    // Health: variance vs budget
    const budget = Number(project.budget) || 0;
    const variance_pct = budget > 0 ? ((actual_cost + committed_cost - budget) / budget) * 100 : 0;
    let health = 'on_track';
    if (variance_pct > 15) health = 'off_track';
    else if (variance_pct > 5) health = 'at_risk';

    await base44.entities.Project.update(project_id, {
      actual_cost,
      committed_cost,
      forecast_cost: actual_cost + committed_cost,
      progress_percent,
      health
    });

    return Response.json({
      project_id,
      actual_cost,
      committed_cost,
      estimated_cost: estimated,
      forecast_cost: actual_cost + committed_cost,
      progress_percent,
      health,
      work_order_count: allWO.length,
      completed_count: completedWO.length
    });
  } catch (error) {
    console.error('rollupProjectCosts error', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});