import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Targeted, rate-limit-friendly fix: rename equipment specifications.facility from
// "Southwest Sports Centre" to "South West Sports Centre" and set location_id.
// Processes a small batch per invocation — call repeatedly until { remaining: 0 }.

const STALE_NAME = 'Southwest Sports Centre';
const CANONICAL_NAME = 'South West Sports Centre';
const CANONICAL_LOCATION_ID = '69fbee67c7dd311edefd6608';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Admin required' }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    const batchSize = Math.max(1, Math.min(parseInt(body.batch_size) || 100, 250));
    const delayMs = Math.max(0, parseInt(body.delay_ms) || 120);
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

    // Pull a small batch of equipment still tagged with the stale facility name
    const stale = await base44.asServiceRole.entities.Equipment.filter(
      { 'specifications.facility': STALE_NAME },
      null,
      batchSize
    );

    if (!stale || stale.length === 0) {
      return Response.json({ done: true, updated: 0, remaining: 0 });
    }

    let updated = 0;
    const errors = [];
    for (const eq of stale) {
      try {
        const newSpecs = { ...(eq.specifications || {}), facility: CANONICAL_NAME };
        await base44.asServiceRole.entities.Equipment.update(eq.id, {
          specifications: newSpecs,
          location_id: CANONICAL_LOCATION_ID,
        });
        updated++;
        if (delayMs) await sleep(delayMs);
      } catch (e) {
        errors.push({ id: eq.id, error: e.message });
        if (e.message?.includes('rate limit') || e.message?.includes('429')) {
          // back off and stop this batch
          break;
        }
      }
    }

    // Re-check remaining
    let remaining = null;
    try {
      const more = await base44.asServiceRole.entities.Equipment.filter(
        { 'specifications.facility': STALE_NAME },
        null,
        1
      );
      remaining = more.length > 0 ? '1+' : 0;
    } catch (_) { /* skip */ }

    return Response.json({
      updated,
      batch_attempted: stale.length,
      errors: errors.slice(0, 5),
      error_count: errors.length,
      remaining,
      done: remaining === 0,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});