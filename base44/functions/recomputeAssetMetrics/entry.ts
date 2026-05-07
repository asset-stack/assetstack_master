import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Phase 2 backfill: Compute health_score, remaining_useful_life_days, risk_level, status
// from the rich `specifications` data (condition_grade, life_consumed, baselife_years, criticality_score)
// for every Equipment record in the register. Idempotent — safe to re-run.

const CONDITION_FACTOR = { 1: 1.0, 2: 0.85, 3: 0.65, 4: 0.4, 5: 0.15 };

function deriveAll(eq) {
  const specs = eq.specifications || {};
  const rawGrade = typeof specs.condition_grade === 'number' ? specs.condition_grade : parseInt(specs.condition_grade, 10);
  const grade = Number.isFinite(rawGrade) && rawGrade >= 1 && rawGrade <= 5 ? rawGrade : null;
  const lc = Number.isFinite(Number(specs.life_consumed)) ? Math.max(0, Math.min(1, Number(specs.life_consumed))) : null;
  const baseLife = Number(specs.baselife_years);
  const crit = Number(specs.criticality_score);

  let health = null;
  if (grade != null && lc != null) {
    health = Math.round((1 - lc) * (CONDITION_FACTOR[grade] ?? 0.5) * 100);
  } else if (grade != null) {
    health = Math.round((CONDITION_FACTOR[grade] ?? 0.5) * 100);
  } else if (lc != null) {
    health = Math.round((1 - lc) * 100);
  }

  let rul = null;
  if (Number.isFinite(baseLife) && baseLife > 0 && lc != null) {
    rul = Math.round(baseLife * (1 - lc) * 365);
  }

  let risk = 'low';
  if (Number.isFinite(crit) && lc != null) {
    const score = lc * crit;
    if (score >= 3.5) risk = 'critical';
    else if (score >= 2.0) risk = 'high';
    else if (score >= 1.0) risk = 'medium';
  }

  let status = 'operational';
  if (grade === 5 || (lc != null && lc >= 0.95)) status = 'critical';
  else if (grade === 4 || (lc != null && lc >= 0.8)) status = 'degraded';

  return { health, rul, risk, status };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });

    const pageSize = 500;
    let updated = 0;
    let skipped = 0;
    let processed = 0;

    for (let page = 0; page < 30; page++) {
      const batch = await base44.asServiceRole.entities.Equipment.list('-created_date', pageSize, page * pageSize);
      if (!batch?.length) break;
      processed += batch.length;

      const updates = [];
      for (const eq of batch) {
        const { health, rul, risk, status } = deriveAll(eq);
        const patch = {};
        if (health != null && health !== eq.health_score) patch.health_score = health;
        if (rul != null && rul !== eq.remaining_useful_life_days) patch.remaining_useful_life_days = rul;
        if (risk !== eq.risk_level) patch.risk_level = risk;
        if (status !== eq.status) patch.status = status;
        if (Object.keys(patch).length === 0) {
          skipped++;
        } else {
          updates.push(base44.asServiceRole.entities.Equipment.update(eq.id, patch).then(() => updated++).catch(() => null));
        }
      }
      // Run each batch in parallel chunks of 5 with a small delay to stay under rate limits
      for (let i = 0; i < updates.length; i += 5) {
        await Promise.all(updates.slice(i, i + 5));
        await new Promise((r) => setTimeout(r, 120));
      }
      if (batch.length < pageSize) break;
    }

    try {
      await base44.asServiceRole.entities.AuditLogEntry.create({
        actor_email: user.email,
        actor_role: user.role,
        action: 'data.recompute_metrics',
        category: 'data',
        severity: 'notice',
        target_entity: 'Equipment',
        summary: `Recomputed metrics on ${updated} of ${processed} assets`,
        metadata: { updated, skipped, processed },
        outcome: 'success',
      });
    } catch (_) {}

    return Response.json({ success: true, processed, updated, skipped });
  } catch (error) {
    console.error('recomputeAssetMetrics error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});