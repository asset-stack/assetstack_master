import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Undo an asset import batch.
// Hardened: authorizes that the caller created the batch (or is an admin)
// before deleting — prevents cross-tenant data deletion via guessed batch IDs.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { import_batch_id } = await req.json();
    if (!import_batch_id || typeof import_batch_id !== 'string') {
      return Response.json({ error: 'import_batch_id is required' }, { status: 400 });
    }

    // Find all equipment in this batch (service-role so we can authoritatively check ownership)
    const assets = await base44.asServiceRole.entities.Equipment.filter({ import_batch_id });
    if (!assets || assets.length === 0) {
      return Response.json({ success: true, deleted_count: 0 });
    }

    // AUTHORIZATION — only the user who created the batch OR an admin may undo it.
    // This blocks IDOR where a different tenant guesses a batch_id and wipes assets.
    const isAdmin = user.role === 'admin';
    const isOwner = assets.every((a) => a.created_by === user.email);
    if (!isAdmin && !isOwner) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const locationId = assets[0].location_id;

    // Delete in parallel batches of 10 (was sequential) — bounded to respect rate limits.
    let deleted = 0;
    const CHUNK = 10;
    for (let i = 0; i < assets.length; i += CHUNK) {
      const chunk = assets.slice(i, i + CHUNK);
      const results = await Promise.allSettled(
        chunk.map((a) => base44.asServiceRole.entities.Equipment.delete(a.id))
      );
      deleted += results.filter((r) => r.status === 'fulfilled').length;
    }

    // Decrement location count
    if (locationId) {
      const location = await base44.asServiceRole.entities.Location.get(locationId).catch(() => null);
      if (location) {
        const newCount = Math.max(0, (location.total_assets || 0) - deleted);
        await base44.asServiceRole.entities.Location.update(locationId, { total_assets: newCount }).catch(() => null);
      }
    }

    return Response.json({ success: true, deleted_count: deleted });
  } catch (error) {
    console.error('undoAssetImport error:', error);
    return Response.json({ error: 'Internal error' }, { status: 500 });
  }
});