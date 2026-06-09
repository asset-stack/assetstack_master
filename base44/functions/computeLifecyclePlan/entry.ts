import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// ── Deterministic lifecycle math (mirrors lib/lifecycleEngine.js) ──
const DEFAULT_LIFE_REMAINING = { 1: 0.85, 2: 0.55, 3: 0.40, 4: 0.15, 5: 0.01 };

function lifeRemainingPct(grade, lifeMap) {
  const g = Number(grade);
  return lifeMap[g] ?? DEFAULT_LIFE_REMAINING[g] ?? 0.5;
}
function adjustmentFactor(los, crit, matrixMap) {
  return matrixMap[`${Number(los)}|${Number(crit)}`] ?? 1.0;
}
function gradeToScore(grade) {
  return ({ 1: 95, 2: 75, 3: 55, 4: 30, 5: 8 })[Number(grade)] ?? 50;
}
function deriveRisk(crit, grade) {
  const c = Number(crit), g = Number(grade);
  const consequence = c <= 1 ? 'catastrophic' : c === 2 ? 'major' : c === 3 ? 'moderate' : 'minor';
  const likelihood = g >= 5 ? 'almost_certain' : g === 4 ? 'likely' : g === 3 ? 'possible' : 'unlikely';
  const consScore = { minor: 1, moderate: 2, major: 4, catastrophic: 5 }[consequence];
  const likeScore = { unlikely: 1, possible: 3, likely: 4, almost_certain: 5 }[likelihood];
  return { consequence, likelihood, riskScore: consScore * likeScore };
}
function riskToPriority(r) {
  if (r >= 16) return 'urgent';
  if (r >= 9) return 'high';
  if (r >= 4) return 'medium';
  return 'low';
}
function includeInScenario(scenario, crit, grade) {
  const c = Number(crit), g = Number(grade);
  if (scenario === 'Premium') return true;
  if (scenario === 'Balanced') return c <= 3 || g >= 3;
  if (scenario === 'Must Do') return c <= 2 || g >= 4;
  return true;
}
function round(n, dp = 0) {
  const f = Math.pow(10, dp);
  return Math.round((Number(n) || 0) * f) / f;
}
function norm(s) {
  return String(s ?? '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const {
      assessment_id,
      scenario = 'Balanced',
      escalation_pct = 3,
      current_year = new Date().getFullYear(),
      client_account_id,
      replace_existing = true,
    } = body || {};

    if (!assessment_id) return Response.json({ error: 'assessment_id required' }, { status: 400 });
    if (!['Premium', 'Balanced', 'Must Do'].includes(scenario)) {
      return Response.json({ error: 'Invalid scenario' }, { status: 400 });
    }

    const svc = base44.asServiceRole.entities;

    // Resolve tenant: prefer explicit, else the assessment's own tenant.
    const assessment = await svc.ConditionAssessment.get(assessment_id);
    if (!assessment) return Response.json({ error: 'Assessment not found' }, { status: 404 });
    const tenantId = client_account_id || assessment.client_account_id || null;

    // Prefer the assessment's own inflation rate if caller left the default.
    const effEscalation = (body?.escalation_pct == null && assessment.inflation_rate != null)
      ? Number(assessment.inflation_rate) * 100
      : escalation_pct;

    // ── Load reference data (tenant-scoped + global fallbacks) ──
    const [libAll, losAll, lifeAll, components, rooms] = await Promise.all([
      svc.AssetLibraryItem.list('-created_date', 5000),
      svc.LOSMatrixEntry.list('-created_date', 500),
      svc.LifeRemainingEntry.list('-created_date', 100),
      svc.AssessmentComponent.filter({ assessment_id }, '-created_date', 5000),
      svc.AssessmentRoom.filter({ assessment_id }, '-created_date', 1000),
    ]);

    const scoped = (arr) => {
      const t = arr.filter((r) => r.client_account_id === tenantId);
      return t.length ? t : arr; // fall back to global defaults
    };

    // Life-remaining map
    const lifeMap = { ...DEFAULT_LIFE_REMAINING };
    for (const e of scoped(lifeAll)) {
      if (e.condition_rating != null && e.life_remaining_pct != null) {
        lifeMap[Number(e.condition_rating)] = Number(e.life_remaining_pct);
      }
    }
    // LOS matrix map
    const matrixMap = {};
    for (const e of scoped(losAll)) {
      if (e.level_of_service != null && e.component_criticality != null && e.adjustment_factor != null) {
        matrixMap[`${Number(e.level_of_service)}|${Number(e.component_criticality)}`] = Number(e.adjustment_factor);
      }
    }
    // Asset library lookup by normalized key
    const lib = scoped(libAll);
    const libByKey = {};
    for (const l of lib) {
      if (l.asset_lookup_type) libByKey[norm(l.asset_lookup_type)] = l;
    }
    // Secondary lookup by group+component+subtype
    const libByComposite = {};
    for (const l of lib) {
      libByComposite[norm(`${l.group}${l.component_type}${l.component_subtype}`)] = l;
    }
    // LOS per room
    const losByRoom = {};
    for (const r of rooms) {
      const code = norm(r.room_code);
      if (code && r.level_of_service != null) losByRoom[code] = Number(r.level_of_service);
    }

    // ── Optionally clear a previous run for this assessment+scenario ──
    if (replace_existing) {
      const prior = await svc.CapitalPlanItem.filter({
        source_assessment_id: assessment_id,
        scenario,
        ai_generated: true,
      }, '-created_date', 5000);
      const DCHUNK = 25;
      for (let i = 0; i < prior.length; i += DCHUNK) {
        await Promise.all(prior.slice(i, i + DCHUNK).map((p) => svc.CapitalPlanItem.delete(p.id)));
      }
    }

    const batchId = `lcp_${Date.now()}`;
    const toCreate = [];
    let skipped = 0;
    let included = 0;

    for (const comp of components) {
      const grade = Number(comp.condition_grade_current ?? comp.condition_grade_baseline ?? 3);

      // Find library row → baselife, unit rate, criticality
      const key1 = norm(comp.linked_asset_lookup_type || comp.asset_lookup_type || comp.component_type);
      const key2 = norm(`${comp.group}${comp.component_type}${comp.subtype || comp.material}`);
      const libRow = libByKey[key1] || libByComposite[key2] || null;

      const baselife = Number(comp.useful_life_years ?? libRow?.baselife ?? 0);
      const unitRate = Number(libRow?.unit_rate ?? 0);
      const criticality = Number(comp.criticality ?? libRow?.component_criticality ?? 3);
      const qty = Number(comp.quantity ?? 0);
      const unit = comp.unit || libRow?.unit || 'each';

      // Skip rows we can't cost
      if (!baselife || !unitRate || !qty) { skipped++; continue; }

      // Scenario gate
      if (!includeInScenario(scenario, criticality, grade)) { skipped++; continue; }
      included++;

      const los = losByRoom[norm(comp.room_code)] ?? 3;

      // Calculation chain
      const lifePct = lifeRemainingPct(grade, lifeMap);
      const remainingLife = baselife * lifePct;
      const adjFactor = adjustmentFactor(los, criticality, matrixMap);
      const adjustedLife = remainingLife * adjFactor;
      const replacementYear = Math.round(current_year + adjustedLife);
      const yearsToReplace = Math.max(0, replacementYear - current_year);
      const costToday = qty * unitRate;
      const futureCost = costToday * Math.pow(1 + effEscalation / 100, yearsToReplace);

      const { consequence, likelihood, riskScore } = deriveRisk(criticality, grade);

      toCreate.push({
        client_account_id: tenantId,
        equipment_name: comp.component_type
          ? `${comp.component_type}${comp.subtype ? ' – ' + comp.subtype : ''}`
          : (comp.asset_lookup_type || 'Asset'),
        location_id: assessment.location_id,
        location_name: assessment.location_name,
        room_code: comp.room_code,
        room_name: comp.room_name,
        asset_type: comp.component_type || libRow?.component_type,
        quantity: qty,
        unit,
        unit_rate_base: unitRate,
        baselife_years: baselife,
        expected_useful_life_years: round(adjustedLife, 1),
        condition_grade: grade,
        condition_score: gradeToScore(grade),
        component_criticality: criticality,
        level_of_service: los,
        los_adjustment_factor: adjFactor,
        remaining_life_years: round(remainingLife, 1),
        escalation_percent_pa: effEscalation,
        replacement_year: replacementYear,
        replacement_cost: round(futureCost),
        replacement_cost_today: round(costToday),
        scenario,
        source_assessment_id: assessment_id,
        generated_batch_id: batchId,
        ai_generated: true,
        consequence_of_failure: consequence,
        likelihood_of_failure: likelihood,
        risk_score: riskScore,
        priority: riskToPriority(riskScore),
        status: 'proposed',
        funding_source: 'capital',
        rationale: `Grade ${grade} → ${Math.round(lifePct * 100)}% life remaining; LOS ${los} × criticality ${criticality} → factor ${adjFactor}.`,
      });
    }

    // ── Bulk insert in chunks to stay under rate limits ──
    const created = [];
    const CHUNK = 100;
    for (let i = 0; i < toCreate.length; i += CHUNK) {
      const batch = await svc.CapitalPlanItem.bulkCreate(toCreate.slice(i, i + CHUNK));
      created.push(...(Array.isArray(batch) ? batch : []));
    }

    return Response.json({
      data: {
        batch_id: batchId,
        scenario,
        components_total: components.length,
        included,
        skipped,
        created: created.length || toCreate.length,
        total_cost: round(toCreate.reduce((s, i) => s + (i.replacement_cost || 0), 0)),
      },
    });
  } catch (err) {
    return Response.json({ error: err.message || String(err) }, { status: 500 });
  }
});