// Condition grade helpers — shared across the condition register UI.

export const GRADE_LABELS = {
  1: 'Excellent',
  2: 'Good',
  3: 'Fair',
  4: 'Poor',
  5: 'Failed',
};

export function gradeBadgeClass(grade) {
  const g = Math.round(Number(grade) || 0);
  if (g <= 1) return 'bg-emerald-100 text-emerald-700 border-emerald-200';
  if (g === 2) return 'bg-lime-100 text-lime-700 border-lime-200';
  if (g === 3) return 'bg-amber-100 text-amber-700 border-amber-200';
  if (g === 4) return 'bg-orange-100 text-orange-700 border-orange-200';
  return 'bg-rose-100 text-rose-700 border-rose-200';
}

export function gradeLabel(grade) {
  const g = Math.round(Number(grade) || 0);
  return GRADE_LABELS[g] || '—';
}