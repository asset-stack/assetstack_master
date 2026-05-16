// Shared utilities for the Projects module

export const STATUS_LANES = [
  { key: 'planning', label: 'Planning', color: 'slate', statuses: ['planning', 'approved'] },
  { key: 'in_delivery', label: 'In Delivery', color: 'indigo', statuses: ['in_delivery', 'on_hold'] },
  { key: 'complete', label: 'Complete', color: 'emerald', statuses: ['complete'] }
];

export const STATUS_META = {
  planning: { label: 'Planning', color: 'bg-slate-100 text-slate-700' },
  approved: { label: 'Approved', color: 'bg-blue-100 text-blue-700' },
  in_delivery: { label: 'In Delivery', color: 'bg-indigo-100 text-indigo-700' },
  on_hold: { label: 'On Hold', color: 'bg-amber-100 text-amber-700' },
  complete: { label: 'Complete', color: 'bg-emerald-100 text-emerald-700' },
  cancelled: { label: 'Cancelled', color: 'bg-rose-100 text-rose-700' }
};

export const HEALTH_META = {
  on_track: { label: 'On Track', color: 'bg-emerald-500', text: 'text-emerald-600' },
  at_risk: { label: 'At Risk', color: 'bg-amber-500', text: 'text-amber-600' },
  off_track: { label: 'Off Track', color: 'bg-rose-500', text: 'text-rose-600' }
};

export const PRIORITY_META = {
  low: { label: 'Low', color: 'bg-slate-100 text-slate-600' },
  medium: { label: 'Medium', color: 'bg-blue-100 text-blue-700' },
  high: { label: 'High', color: 'bg-amber-100 text-amber-700' },
  critical: { label: 'Critical', color: 'bg-rose-100 text-rose-700' }
};

export const TYPE_META = {
  renewal: { label: 'Renewal' },
  upgrade: { label: 'Upgrade' },
  new_build: { label: 'New Build' },
  compliance_program: { label: 'Compliance' },
  disposal: { label: 'Disposal' },
  grant_funded: { label: 'Grant-Funded' },
  maintenance_program: { label: 'Maintenance Program' },
  other: { label: 'Other' }
};

export function formatCurrency(value, currency = 'USD') {
  if (value === null || value === undefined || isNaN(value)) return '—';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0
  }).format(value);
}

export function budgetVariancePct(project) {
  const budget = Number(project.budget) || 0;
  if (budget === 0) return 0;
  const forecast = Number(project.forecast_cost) || Number(project.actual_cost) || 0;
  return ((forecast - budget) / budget) * 100;
}

export function projectStats(projects = []) {
  return {
    total: projects.length,
    inDelivery: projects.filter((p) => p.status === 'in_delivery').length,
    atRisk: projects.filter((p) => p.health === 'at_risk' || p.health === 'off_track').length,
    totalBudget: projects.reduce((sum, p) => sum + (Number(p.budget) || 0), 0),
    totalActual: projects.reduce((sum, p) => sum + (Number(p.actual_cost) || 0), 0)
  };
}