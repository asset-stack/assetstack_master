import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Phase 5: Recompute Location.total_assets by counting Equipment whose `location` string
// starts with the location's name. Idempotent and admin-gated.

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });

    const locations = await base44.asServiceRole.entities.Location.list('-created_date', 500);

    // Build all equipment locations once
    const all = [];
    for (let page = 0; page < 30; page++) {
      const batch = await base44.asServiceRole.entities.Equipment.list('-created_date', 500, page * 500);
      if (!batch?.length) break;
      all.push(...batch);
      if (batch.length < 500) break;
    }

    const results = [];
    for (const loc of locations) {
      const count = all.filter((e) => {
        if (!e.location || !loc.name) return false;
        return e.location === loc.name || e.location.startsWith(loc.name + ' ·') || e.location.startsWith(loc.name + ',');
      }).length;
      if (count !== loc.total_assets) {
        await base44.asServiceRole.entities.Location.update(loc.id, { total_assets: count }).catch(() => null);
      }
      results.push({ name: loc.name, count });
    }

    return Response.json({ success: true, locations: results, total_equipment: all.length });
  } catch (error) {
    console.error('refreshLocationAssetCounts error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});