// CFO / IPWEA / AAS27 standard asset register ratios.
// All inputs come from already-derived totals so they are cheap to compute.

import { deriveCRC, deriveWDV, deriveAnnualDepreciation, deriveDefectUrgency } from './assetMetrics';

// Sustainability Ratio = Annual capex spend ÷ Annual depreciation expense
// Healthy >= 1.0 (replacing assets at the rate they wear out)
export function sustainabilityRatio({ annualCapexSpend, annualDepreciation }) {
  if (!annualDepreciation || annualDepreciation <= 0) return null;
  return annualCapexSpend / annualDepreciation;
}

// Asset Consumption Ratio = WDV ÷ CRC
// How "used up" is the portfolio. Lower = older portfolio.
// Healthy 0.6 - 0.75. Below 0.4 = renewal crisis.
export function assetConsumptionRatio({ totalWDV, totalCRC }) {
  if (!totalCRC || totalCRC <= 0) return null;
  return totalWDV / totalCRC;
}

// Backlog Ratio = Defect remediation cost ÷ CRC
// Industry benchmark: <2% healthy, 2-5% watch, >5% critical.
export function backlogRatio({ totalDefectCost, totalCRC }) {
  if (!totalCRC || totalCRC <= 0) return null;
  return totalDefectCost / totalCRC;
}

// Renewal Gap Index = Required renewal $ ÷ Available capital
// Above 1.0 means underfunded. The single number councils get grilled on.
export function renewalGapIndex({ requiredRenewal, availableCapital }) {
  if (!availableCapital || availableCapital <= 0) return null;
  return requiredRenewal / availableCapital;
}

// Aggregate everything in one pass over equipment + budgets + capital items.
export function computeCFORatios({ equipment = [], budgets = [], capitalItems = [] }) {
  let totalCRC = 0, totalWDV = 0, totalDefectCost = 0, annualDepreciation = 0;
  for (const e of equipment) {
    const c = deriveCRC(e);
    totalCRC += c;
    totalWDV += deriveWDV(e);
    annualDepreciation += deriveAnnualDepreciation(e);
    if (deriveDefectUrgency(e)) {
      totalDefectCost += Number(e?.specifications?.defect_cost) || c * 0.2;
    }
  }

  const capitalBudgets = budgets.filter(b => b.category === 'capital_replacement' && b.status === 'active');
  const annualCapexSpend = capitalBudgets.reduce((s, b) => s + (b.spent_amount || 0) + (b.committed_amount || 0), 0);
  const availableCapital = capitalBudgets.reduce((s, b) => s + (b.allocated_amount || 0), 0);

  const requiredRenewal = capitalItems
    .filter(i => i.status !== 'completed' && i.status !== 'cancelled')
    .reduce((s, i) => s + (i.replacement_cost || 0), 0);

  return {
    totalCRC,
    totalWDV,
    totalDefectCost,
    annualDepreciation,
    annualCapexSpend,
    availableCapital,
    requiredRenewal,
    sustainability: sustainabilityRatio({ annualCapexSpend, annualDepreciation }),
    consumption: assetConsumptionRatio({ totalWDV, totalCRC }),
    backlog: backlogRatio({ totalDefectCost, totalCRC }),
    renewalGap: renewalGapIndex({ requiredRenewal, availableCapital }),
  };
}

// Tone helpers — green / amber / red bands per industry convention
export function toneFor(metric, value) {
  if (value == null || !Number.isFinite(value)) return 'slate';
  if (metric === 'sustainability') {
    if (value >= 0.95) return 'emerald';
    if (value >= 0.7) return 'amber';
    return 'rose';
  }
  if (metric === 'consumption') {
    if (value >= 0.6) return 'emerald';
    if (value >= 0.45) return 'amber';
    return 'rose';
  }
  if (metric === 'backlog') {
    if (value <= 0.02) return 'emerald';
    if (value <= 0.05) return 'amber';
    return 'rose';
  }
  if (metric === 'renewalGap') {
    if (value <= 1.0) return 'emerald';
    if (value <= 1.5) return 'amber';
    return 'rose';
  }
  return 'slate';
}

export function fmtRatio(v) {
  if (v == null || !Number.isFinite(v)) return '—';
  return v.toFixed(2);
}

export function fmtPct(v) {
  if (v == null || !Number.isFinite(v)) return '—';
  return `${(v * 100).toFixed(1)}%`;
}