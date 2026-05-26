import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Default matrices (Condition 1-5 rows × Criticality 1-5 cols)
// Lower condition (better) + lower criticality => lower multiplier (defer)
// Higher condition (worse) + higher criticality => higher multiplier (act now / premium replacement)
const DEFAULT_MATRICES = {
  balanced: [
    [0.00, 0.00, 0.00, 0.00, 0.00],
    [0.00, 0.00, 0.10, 0.20, 0.30],
    [0.10, 0.20, 0.50, 0.70, 0.90],
    [0.30, 0.50, 0.80, 1.00, 1.10],
    [0.60, 0.80, 1.00, 1.20, 1.30],
  ],
  must_do: [
    [0.00, 0.00, 0.00, 0.00, 0.00],
    [0.00, 0.00, 0.00, 0.00, 0.10],
    [0.00, 0.00, 0.20, 0.40, 0.60],
    [0.10, 0.20, 0.50, 0.80, 1.00],
    [0.40, 0.60, 0.90, 1.10, 1.30],
  ],
  premium: [
    [0.10, 0.10, 0.20, 0.30, 0.40],
    [0.20, 0.30, 0.40, 0.50, 0.60],
    [0.40, 0.50, 0.70, 0.90, 1.00],
    [0.60, 0.80, 1.00, 1.10, 1.20],
    [0.90, 1.00, 1.20, 1.30, 1.40],
  ],
};

function getMultiplier(matrix, condition, criticality) {
  const c = Math.max(1, Math.min(5, Math.round(condition || 3)));
  const k = Math.max(1, Math.min(5, Math.round(criticality || 3)));
  if (!matrix || !matrix[c - 1]) return 0;
  return matrix[c - 1][k - 1] || 0;
}

function computeReplacementYears(component, startYear, endYear) {
  const installed = component.year_installed || (startYear - 10);
  const life = component.useful_life_years || 20;
  const years = [];
  let next = installed + life;
  while (next <= endYear) {
    if (next >= startYear) years.push(next);
    next += life;
  }
  // If never reaches (life > horizon), still flag first replacement if within horizon
  if (years.length === 0) {
    const first = installed + life;
    if (first >= startYear && first <= endYear) years.push(first);
  }
  return years;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { assessment_id, persist = true } = body || {};
    if (!assessment_id) return Response.json({ error: 'assessment_id required' }, { status: 400 });

    const assessment = await base44.entities.ConditionAssessment.get(assessment_id);
    if (!assessment) return Response.json({ error: 'Assessment not found' }, { status: 404 });

    const [rooms, components, defects] = await Promise.all([
      base44.entities.AssessmentRoom.filter({ assessment_id }),
      base44.entities.AssessmentComponent.filter({ assessment_id }),
      base44.entities.AssessmentDefect.filter({ assessment_id }),
    ]);

    const startYear = (assessment.assessment_year || new Date().getFullYear()) + 1;
    const horizon = assessment.forecast_years || 20;
    const endYear = startYear + horizon - 1;
    const inflation = assessment.inflation_rate ?? 0.03;
    const years = Array.from({ length: horizon }, (_, i) => startYear + i);

    const hasMatrix = (m) => Array.isArray(m) && m.length === 5 && m.every(row => Array.isArray(row) && row.length === 5);
    const matrices = {
      balanced: hasMatrix(assessment.matrix_balanced) ? assessment.matrix_balanced : DEFAULT_MATRICES.balanced,
      must_do: hasMatrix(assessment.matrix_must_do) ? assessment.matrix_must_do : DEFAULT_MATRICES.must_do,
      premium: hasMatrix(assessment.matrix_premium) ? assessment.matrix_premium : DEFAULT_MATRICES.premium,
    };

    const programs = ['balanced', 'must_do', 'premium'];
    const empty = () => programs.reduce((acc, p) => ({ ...acc, [p]: 0 }), {});

    const byYear = {}; // year -> {balanced, must_do, premium}
    const byRoomYear = {}; // roomId -> year -> {programs}
    const byGroupYear = {}; // group -> year -> {programs}
    const byComponentTypeYear = {}; // compType -> year -> {programs}
    const byCriticality = {}; // 1-5 -> {programs}
    const totals = empty();

    years.forEach(y => { byYear[y] = empty(); });

    for (const comp of components) {
      const replacementYears = computeReplacementYears(comp, startYear, endYear);
      const baseCost = comp.base_replacement_cost || 0;
      if (baseCost === 0 || replacementYears.length === 0) continue;

      for (const year of replacementYears) {
        const inflationFactor = Math.pow(1 + inflation, year - startYear);
        for (const program of programs) {
          const mult = getMultiplier(matrices[program], comp.condition_grade_current, comp.criticality);
          const cost = baseCost * mult * inflationFactor;
          if (cost <= 0) continue;

          byYear[year][program] += cost;
          totals[program] += cost;

          if (!byRoomYear[comp.room_id]) byRoomYear[comp.room_id] = {};
          if (!byRoomYear[comp.room_id][year]) byRoomYear[comp.room_id][year] = empty();
          byRoomYear[comp.room_id][year][program] += cost;

          const grp = comp.group || 'Other';
          if (!byGroupYear[grp]) byGroupYear[grp] = {};
          if (!byGroupYear[grp][year]) byGroupYear[grp][year] = empty();
          byGroupYear[grp][year][program] += cost;

          const ct = comp.component_type || 'Unknown';
          if (!byComponentTypeYear[ct]) byComponentTypeYear[ct] = {};
          if (!byComponentTypeYear[ct][year]) byComponentTypeYear[ct][year] = empty();
          byComponentTypeYear[ct][year][program] += cost;

          const crit = Math.max(1, Math.min(5, Math.round(comp.criticality || 3)));
          if (!byCriticality[crit]) byCriticality[crit] = empty();
          byCriticality[crit][program] += cost;
        }
      }
    }

    // Defects: add their cost in the target year per program
    const defectsByYear = {};
    years.forEach(y => { defectsByYear[y] = empty(); });
    for (const d of defects) {
      const cost = d.rectification_cost || 0;
      if (cost <= 0) continue;
      const targets = {
        balanced: d.target_year_balanced,
        must_do: d.target_year_must_do,
        premium: d.target_year_premium,
      };
      for (const program of programs) {
        const ty = targets[program];
        if (ty && ty >= startYear && ty <= endYear) {
          const inflationFactor = Math.pow(1 + inflation, ty - startYear);
          const adjusted = cost * inflationFactor;
          defectsByYear[ty][program] += adjusted;
          byYear[ty][program] += adjusted;
          totals[program] += adjusted;
        }
      }
    }

    // Condition summary by room
    const roomCondition = rooms.map(r => {
      const roomComps = components.filter(c => c.room_id === r.id);
      const grades = roomComps.map(c => c.condition_grade_current).filter(Boolean);
      const baselines = roomComps.map(c => c.condition_grade_baseline).filter(Boolean);
      const avg = grades.length ? grades.reduce((a, b) => a + b, 0) / grades.length : null;
      const baselineAvg = baselines.length ? baselines.reduce((a, b) => a + b, 0) / baselines.length : null;
      return {
        room_id: r.id,
        room_code: r.room_code,
        name: r.name,
        level_of_service: r.level_of_service,
        component_count: roomComps.length,
        average_condition: avg,
        baseline_condition: baselineAvg,
        change: avg && baselineAvg ? avg - baselineAvg : null,
      };
    });

    const result = {
      assessment: {
        id: assessment.id,
        title: assessment.title,
        location_name: assessment.location_name,
        building_type: assessment.building_type,
        assessment_year: assessment.assessment_year,
        assessor_name: assessment.assessor_name,
      },
      horizon: { startYear, endYear, years },
      totals,
      byYear,
      byRoomYear,
      byGroupYear,
      byComponentTypeYear,
      byCriticality,
      defectsByYear,
      roomCondition,
      counts: {
        rooms: rooms.length,
        components: components.length,
        defects: defects.length,
      },
      calculated_at: new Date().toISOString(),
    };

    if (persist) {
      await base44.entities.ConditionAssessment.update(assessment_id, {
        totals_balanced: totals.balanced,
        totals_must_do: totals.must_do,
        totals_premium: totals.premium,
        last_calculated_at: result.calculated_at,
      });
    }

    return Response.json(result);
  } catch (error) {
    return Response.json({ error: error.message, stack: error.stack }, { status: 500 });
  }
});