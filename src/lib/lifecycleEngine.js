// Deterministic asset lifecycle math — the single source of truth for the
// Condition Register → Financial Plan calculation chain.
//
// This mirrors the 9-step workflow:
//   1-3  Asset Library lookup (baselife, unit rate, criticality)
//   4    Remaining life      = baselife × lifeRemaining%(condition)
//   5    LOS overlay         = remaining × adjustmentFactor(LOS, criticality)
//   6    Replacement year    = currentYear + adjustedLife
//   7    Future cost         = qty × unitRate × (1+escalation)^yearsToReplace
//
// All functions are pure so the backend engine and the frontend
// traceability UI produce identical numbers.

// Default Life-Remaining table (from base data "Life Remaining" sheet).
// condition grade 1-5 → fraction of base life still remaining.
export const DEFAULT_LIFE_REMAINING = {
  1: 0.85,
  2: 0.55,
  3: 0.40,
  4: 0.15,
  5: 0.01,
};

// Build a lookup map from LifeRemainingEntry records, falling back to defaults.
export function buildLifeRemainingMap(entries = []) {
  const map = { ...DEFAULT_LIFE_REMAINING };
  for (const e of entries) {
    if (e.condition_rating != null && e.life_remaining_pct != null) {
      map[Number(e.condition_rating)] = Number(e.life_remaining_pct);
    }
  }
  return map;
}

// Build a "LOS|Criticality" → adjustment factor map from LOSMatrixEntry records.
export function buildLOSMatrixMap(entries = []) {
  const map = {};
  for (const e of entries) {
    if (e.level_of_service != null && e.component_criticality != null && e.adjustment_factor != null) {
      map[`${Number(e.level_of_service)}|${Number(e.component_criticality)}`] = Number(e.adjustment_factor);
    }
  }
  return map;
}

export function lifeRemainingPct(conditionGrade, lifeMap = DEFAULT_LIFE_REMAINING) {
  const g = Number(conditionGrade);
  if (lifeMap[g] != null) return lifeMap[g];
  return DEFAULT_LIFE_REMAINING[g] ?? 0.5;
}

export function adjustmentFactor(los, criticality, matrixMap = {}) {
  const key = `${Number(los)}|${Number(criticality)}`;
  if (matrixMap[key] != null) return matrixMap[key];
  return 1.0; // neutral when no matrix entry exists
}

// Core per-asset calculation. Returns the full traceable breakdown.
export function computeAssetLifecycle({
  quantity = 0,
  unitRate = 0,
  baselife = 0,
  conditionGrade = 3,
  criticality = 3,
  los = 3,
  escalationPct = 3,
  currentYear = new Date().getFullYear(),
  lifeMap = DEFAULT_LIFE_REMAINING,
  matrixMap = {},
}) {
  const lifePct = lifeRemainingPct(conditionGrade, lifeMap);
  const remainingLife = baselife * lifePct;

  const adjFactor = adjustmentFactor(los, criticality, matrixMap);
  const adjustedLife = remainingLife * adjFactor;

  const replacementYear = Math.round(currentYear + adjustedLife);
  const yearsToReplace = Math.max(0, replacementYear - currentYear);

  const costToday = quantity * unitRate;
  const escalationMult = Math.pow(1 + escalationPct / 100, yearsToReplace);
  const futureCost = costToday * escalationMult;

  return {
    lifeRemainingPct: lifePct,
    remainingLifeYears: round(remainingLife, 1),
    losAdjustmentFactor: adjFactor,
    adjustedLifeYears: round(adjustedLife, 1),
    replacementYear,
    yearsToReplace,
    replacementCostToday: round(costToday),
    replacementCost: round(futureCost),
    escalationMult: round(escalationMult, 3),
  };
}

// Map a 1-5 condition grade to a 0-100 condition score for display.
export function gradeToScore(grade) {
  const map = { 1: 95, 2: 75, 3: 55, 4: 30, 5: 8 };
  return map[Number(grade)] ?? 50;
}

// Derive risk dimensions from criticality + condition for the risk matrix.
export function deriveRisk(criticality, conditionGrade) {
  const c = Number(criticality);
  const g = Number(conditionGrade);
  const consequence = c <= 1 ? 'catastrophic' : c === 2 ? 'major' : c === 3 ? 'moderate' : 'minor';
  const likelihood = g >= 5 ? 'almost_certain' : g === 4 ? 'likely' : g === 3 ? 'possible' : 'unlikely';
  const consScore = { minor: 1, moderate: 2, major: 4, catastrophic: 5 }[consequence];
  const likeScore = { unlikely: 1, possible: 3, likely: 4, almost_certain: 5 }[likelihood];
  return { consequence, likelihood, riskScore: consScore * likeScore };
}

// Priority from risk score.
export function riskToPriority(riskScore) {
  if (riskScore >= 16) return 'urgent';
  if (riskScore >= 9) return 'high';
  if (riskScore >= 4) return 'medium';
  return 'low';
}

// Scenario gating — which assets are included in each program.
// Premium = everything. Balanced = criticality<=3 OR poor condition.
// Must Do = only critical/failing assets.
export function includeInScenario(scenario, criticality, conditionGrade) {
  const c = Number(criticality);
  const g = Number(conditionGrade);
  if (scenario === 'Premium') return true;
  if (scenario === 'Balanced') return c <= 3 || g >= 3;
  if (scenario === 'Must Do') return c <= 2 || g >= 4;
  return true;
}

function round(n, dp = 0) {
  const f = Math.pow(10, dp);
  return Math.round((Number(n) || 0) * f) / f;
}