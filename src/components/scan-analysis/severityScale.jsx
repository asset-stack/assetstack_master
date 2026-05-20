// Single source of truth for the severity ↔ condition_score mapping.
// Scale: 1 = excellent, 5 = failed. Matches the ConditionReport schema.
export const SEVERITY_TO_SCORE = {
  minor: 2,
  moderate: 3,
  major: 4,
  critical: 5,
};

export function scoreForSeverity(severity) {
  return SEVERITY_TO_SCORE[severity] ?? 1;
}