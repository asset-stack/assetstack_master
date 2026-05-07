// Smart filter presets — apply to an Equipment array using derive helpers.
// Each view returns the filter predicate. Pure, testable.

import {
  deriveCondition, deriveLifeConsumed, deriveDefectUrgency, deriveCRC,
  dataCompleteness, deriveRiskLevel,
} from './assetMetrics';

export const SAVED_VIEWS = [
  {
    id: 'critical_condition',
    label: 'Critical Condition',
    icon: 'AlertOctagon',
    color: 'red',
    description: 'Condition grade 4 or 5',
    predicate: (eq) => {
      const g = deriveCondition(eq);
      return g === 4 || g === 5;
    },
  },
  {
    id: 'over_life',
    label: 'Over-Life Assets',
    icon: 'Hourglass',
    color: 'orange',
    description: 'Life consumed ≥ 90%',
    predicate: (eq) => {
      const lc = deriveLifeConsumed(eq);
      return lc != null && lc >= 0.9;
    },
  },
  {
    id: 'defects_high',
    label: 'High-Urgency Defects',
    icon: 'AlertTriangle',
    color: 'amber',
    description: 'Defect urgency = High',
    predicate: (eq) => {
      const u = deriveDefectUrgency(eq);
      return typeof u === 'string' && /high/i.test(u);
    },
  },
  {
    id: 'high_value',
    label: 'High-Value (>$50k)',
    icon: 'Banknote',
    color: 'emerald',
    description: 'Replacement value over $50,000',
    predicate: (eq) => deriveCRC(eq) >= 50000,
  },
  {
    id: 'critical_risk',
    label: 'Critical Risk',
    icon: 'Flame',
    color: 'red',
    description: 'Likelihood × Consequence is critical',
    predicate: (eq) => deriveRiskLevel(eq) === 'critical',
  },
  {
    id: 'missing_data',
    label: 'Missing Data',
    icon: 'CircleDashed',
    color: 'slate',
    description: 'Data completeness below 70%',
    predicate: (eq) => dataCompleteness(eq) < 70,
  },
  {
    id: 'no_replacement_value',
    label: 'No Replacement Value',
    icon: 'HelpCircle',
    color: 'slate',
    description: 'CRC = 0 or missing',
    predicate: (eq) => deriveCRC(eq) <= 0,
  },
  {
    id: 'fy26_renewals',
    label: 'FY26 Renewals',
    icon: 'CalendarClock',
    color: 'indigo',
    description: 'Predicted to need renewal this fiscal year',
    predicate: (eq) => {
      const lc = deriveLifeConsumed(eq);
      return lc != null && lc >= 0.85 && lc < 1;
    },
  },
];

export function getView(id) {
  return SAVED_VIEWS.find((v) => v.id === id);
}

export function applyView(equipment, viewId) {
  const v = getView(viewId);
  if (!v) return equipment;
  return equipment.filter(v.predicate);
}