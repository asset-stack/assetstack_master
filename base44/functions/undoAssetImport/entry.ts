import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { import_batch_id } = await req.json();
    if (!import_batch_id) {
      return Response.json({ error: 'import_batch_id is required' }, { status: 400 });
    }

    // Find all equipment in this batch
    const assets = await base44.entities.Equipment.filter({ import_batch_id });
    if (!assets || assets.length === 0) {
      return Response.json({ success: true, deleted_count: 0 });
    }

    const locationId = assets[0].location_id;

    // Delete them all
    for (const asset of assets) {
      await base44.entities.Equipment.delete(asset.id);
    }

    // Decrement location count
    if (locationId) {
      const location = await base44.entities.Location.get(locationId);
      if (location) {
        const newCount = Math.max(0, (location.total_assets || 0) - assets.length);
        await base44.entities.Location.update(locationId, { total_assets: newCount });
      }
    }

    return Response.json({ success: true, deleted_count: assets.length });
  } catch (error) {
    console.error('Undo error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});