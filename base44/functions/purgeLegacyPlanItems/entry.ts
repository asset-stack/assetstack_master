import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Deletes legacy CapitalPlanItem rows created before the upsert model
// (ai_generated rows that lack a source_component_id key).
// Deadline-bounded — call repeatedly until purged_remaining is 0.

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function withRetry(fn, tries = 4) {
  let delay = 800;
  for (let i = 0; i < tries; i++) {
    try {
      return await fn();
    } catch (err) {
      const msg = String(err?.message || err);
      if (i === tries - 1 || (!msg.includes('429') && !msg.toLowerCase().includes('rate limit'))) throw err;
      await sleep(delay);
      delay *= 2;
    }
  }
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const svc = base44.asServiceRole.entities;
    const deadline = Date.now() + 80_000;
    let removed = 0;
    let remaining = 0;

    while (Date.now() < deadline) {
      const batch = await withRetry(() =>
        svc.CapitalPlanItem.filter({ ai_generated: true }, '-created_date', 500)
      );
      const legacy = (batch || []).filter((r) => !r.source_component_id);
      remaining = legacy.length;
      if (legacy.length === 0 && (batch || []).length < 500) break;
      if (legacy.length === 0) break;

      for (const row of legacy) {
        if (Date.now() > deadline) break;
        await withRetry(() => svc.CapitalPlanItem.delete(row.id));
        await sleep(60);
        removed++;
        remaining--;
      }
    }

    return Response.json({ data: { removed, legacy_remaining_in_last_batch: remaining } });
  } catch (err) {
    return Response.json({ error: err.message || String(err) }, { status: 500 });
  }
});