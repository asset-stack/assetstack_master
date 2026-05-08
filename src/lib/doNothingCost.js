// "Do-nothing cost" — what failure costs if a CapitalPlanItem is NOT funded.
// Combines: failure-mode multiplier × likelihood × consequence weight.

const CONSEQUENCE_MULTIPLIER = {
  minor: 1.2,
  moderate: 2.0,
  major: 3.5,
  catastrophic: 6.0,
};

const LIKELIHOOD_PROBABILITY = {
  unlikely: 0.1,
  possible: 0.3,
  likely: 0.6,
  almost_certain: 0.9,
};

/**
 * Estimated cost-of-failure if this item is deferred indefinitely.
 * = replacement_cost × consequence_multiplier × likelihood
 * Captures: emergency repair premium, collateral damage, downtime, reputational cost.
 */
export function calcDoNothingCost(item) {
  const base = Number(item?.replacement_cost) || 0;
  if (!base) return 0;
  const cons = CONSEQUENCE_MULTIPLIER[item?.consequence_of_failure] ?? 2.0;
  const like = LIKELIHOOD_PROBABILITY[item?.likelihood_of_failure] ?? 0.3;
  return Math.round(base * cons * like);
}

/**
 * Net benefit of acting now: do-nothing cost - replacement cost.
 * If positive, deferring is more expensive than acting.
 */
export function calcNetBenefit(item) {
  return calcDoNothingCost(item) - (Number(item?.replacement_cost) || 0);
}