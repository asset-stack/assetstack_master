import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Bulk update condition grade and/or life_consumed across many assets.
// Body: { equipment_ids: string[], updates: { condition_grade?, life_consumed?, defect_urgency?, defect_description? } }
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const ids = Array.isArray(body?.equipment_ids) ? body.equipment_ids : [];
    const updates = body?.updates || {};
    if (!ids.length) return Response.json({ error: 'No equipment_ids provided' }, { status: 400 });

    let updated = 0;
    let failed = 0;

    // Process in chunks to respect rate limits
    for (let i = 0; i < ids.length; i += 5) {
      const chunk = ids.slice(i, i + 5);
      await Promise.all(chunk.map(async (id) => {
        try {
          const eq = await base44.asServiceRole.entities.Equipment.get(id);
          if (!eq) { failed++; return; }
          const newSpecs = { ...(eq.specifications || {}) };
          if (updates.condition_grade != null) newSpecs.condition_grade = Number(updates.condition_grade);
          if (updates.life_consumed != null) newSpecs.life_consumed = Number(updates.life_consumed);
          if (updates.defect_urgency != null) newSpecs.defect_urgency = updates.defect_urgency;
          if (updates.defect_description != null) newSpecs.defect_description = updates.defect_description;

          await base44.asServiceRole.entities.Equipment.update(id, {
            specifications: newSpecs,
            last_maintenance_date: new Date().toISOString().slice(0, 10),
          });
          updated++;
        } catch (err) {
          console.error('Bulk update failed for', id, err.message);
          failed++;
        }
      }));
      await new Promise((r) => setTimeout(r, 150));
    }

    // Audit
    try {
      await base44.asServiceRole.entities.AuditLogEntry.create({
        actor_email: user.email,
        action: 'asset.bulk_update',
        category: 'data',
        severity: 'notice',
        target_entity: 'Equipment',
        summary: `Bulk-updated ${updated} of ${ids.length} assets`,
        metadata: { updates, requested: ids.length, updated, failed },
      });
    } catch (_) {}

    return Response.json({ success: true, updated, failed, requested: ids.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});