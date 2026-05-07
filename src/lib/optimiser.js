// Funding-Constrained Renewal Optimiser
// Greedy knapsack: select assets that maximise risk_reduction per dollar within budget.

import { deriveCRC, deriveLifeConsumed, deriveCondition, deriveRiskLevel } from './assetMetrics';

const RISK_WEIGHT = { low: 1, medium: 3, high: 7, critical: 15 };

export function scoreAsset(eq) {
  const crc = deriveCRC(eq);
  if (crc <= 0) return null;
  const lc = deriveLifeConsumed(eq) ?? 0;
  const grade = deriveCondition(eq) ?? 3;
  const risk = deriveRiskLevel(eq);
  const crit = Number(eq?.specifications?.criticality_score) || 1;

  // Risk reduction = renewing this asset removes its current risk
  const riskReduction = (RISK_WEIGHT[risk] || 1) * (1 + lc) * (grade / 3);
  const value = riskReduction / Math.max(crc, 1);

  return {
    equipment: eq,
    cost: crc,
    riskReduction,
    valueScore: value,
    lifeConsumed: lc,
    conditionGrade: grade,
    risk,
    criticality: crit,
  };
}

export function optimiseRenewals(equipment, budget) {
  const scored = equipment
    .map(scoreAsset)
    .filter((s) => s && s.cost <= budget)
    .sort((a, b) => b.valueScore - a.valueScore);

  let spend = 0;
  let totalRiskReduction = 0;
  const selected = [];
  const deferred = [];

  for (const s of scored) {
    if (spend + s.cost <= budget) {
      selected.push(s);
      spend += s.cost;
      totalRiskReduction += s.riskReduction;
    } else {
      deferred.push(s);
    }
  }

  return {
    selected,
    deferred,
    spend,
    budget,
    utilisation: budget > 0 ? Math.min(100, (spend / budget) * 100) : 0,
    totalRiskReduction,
    candidateCount: scored.length,
  };
}

// What-If 10-year backlog projection.
// Assumes degradation at 1/baselife per year if not renewed; renewals reset life_consumed to 0.
export function projectBacklog({
  equipment,
  annualBudget = 500000,
  inflation = 0.03,
  deferralRate = 0,
  climateStress = 1.0, // multiplier on degradation
  years = 10,
}) {
  const startYear = new Date().getFullYear();
  // Working copies — track life_consumed mutation per year
  let state = equipment.map((eq) => ({
    id: eq.id,
    crc: deriveCRC(eq),
    baseLife: Number(eq?.specifications?.baselife_years) || 25,
    lc: deriveLifeConsumed(eq) ?? 0,
    grade: deriveCondition(eq) ?? 3,
    crit: Number(eq?.specifications?.criticality_score) || 1,
  })).filter((s) => s.crc > 0);

  const points = [];
  let inflated = annualBudget;

  for (let i = 0; i < years; i++) {
    const yr = startYear + i;
    const effectiveBudget = inflated * (1 - deferralRate);

    // Need = sum of CRC of assets where lc >= 0.85
    const renewalCandidates = state
      .filter((s) => s.lc >= 0.85)
      .sort((a, b) => b.lc * b.crit - a.lc * a.crit);

    const totalNeed = renewalCandidates.reduce((sum, s) => sum + s.crc, 0);

    let spent = 0;
    const renewedIds = new Set();
    for (const s of renewalCandidates) {
      if (spent + s.crc <= effectiveBudget) {
        spent += s.crc;
        renewedIds.add(s.id);
      }
    }

    // Backlog = unfunded renewal need
    const backlog = totalNeed - spent;

    points.push({
      year: yr,
      need: Math.round(totalNeed),
      spent: Math.round(spent),
      backlog: Math.round(backlog),
      budget: Math.round(effectiveBudget),
      candidates: renewalCandidates.length,
      renewed: renewedIds.size,
    });

    // Advance state: renew selected, age the rest
    state = state.map((s) => {
      if (renewedIds.has(s.id)) {
        return { ...s, lc: 0, grade: 1, crc: s.crc * (1 + inflation) };
      }
      const ageRate = (1 / s.baseLife) * climateStress;
      return { ...s, lc: Math.min(1, s.lc + ageRate), crc: s.crc * (1 + inflation) };
    });

    inflated *= 1 + inflation;
  }

  return points;
}