// Data Quality Anomaly Detection — flags suspicious / contradictory records.

import { deriveCondition, deriveLifeConsumed, deriveCRC } from './assetMetrics';

export const ISSUE_SEVERITY = {
  critical: { label: 'Critical', color: 'red' },
  high: { label: 'High', color: 'orange' },
  medium: { label: 'Medium', color: 'amber' },
  low: { label: 'Low', color: 'slate' },
};

export function detectIssues(equipment) {
  const issues = [];
  const grade = deriveCondition(equipment);
  const lc = deriveLifeConsumed(equipment);
  const crc = deriveCRC(equipment);
  const crit = Number(equipment?.specifications?.criticality_score);
  const baseLife = Number(equipment?.specifications?.baselife_years);

  // Contradiction: very-good condition but high life consumed
  if (grade != null && grade <= 2 && lc != null && lc >= 0.7) {
    issues.push({
      type: 'condition_life_mismatch',
      severity: 'high',
      message: `Reported condition (C${grade}) contradicts life consumed (${Math.round(lc * 100)}%)`,
    });
  }

  // Missing CRC for critical asset
  if (crc <= 0 && crit >= 4) {
    issues.push({
      type: 'missing_crc',
      severity: 'critical',
      message: 'No replacement value on a high-criticality asset',
    });
  }

  // No baselife
  if (!Number.isFinite(baseLife) || baseLife <= 0) {
    issues.push({
      type: 'missing_baselife',
      severity: 'medium',
      message: 'Useful life is missing — RUL cannot be calculated',
    });
  }

  // No condition grade
  if (grade == null) {
    issues.push({
      type: 'missing_condition',
      severity: 'medium',
      message: 'No condition grade has been recorded',
    });
  }

  // No location
  if (!equipment.location || equipment.location === '-') {
    issues.push({
      type: 'missing_location',
      severity: 'high',
      message: 'No location assigned',
    });
  }

  // Past-dated install date in the future
  if (equipment.installation_date) {
    const d = new Date(equipment.installation_date);
    if (d > new Date()) {
      issues.push({
        type: 'future_install_date',
        severity: 'low',
        message: 'Installation date is in the future',
      });
    }
  }

  // Implausibly high CRC
  if (crc > 5_000_000) {
    issues.push({
      type: 'implausible_crc',
      severity: 'low',
      message: 'Replacement value over $5M — verify',
    });
  }

  return issues;
}

export function detectDuplicates(allEquipment) {
  // Group by name + location
  const groups = new Map();
  for (const eq of allEquipment) {
    const key = `${(eq.name || '').toLowerCase().trim()}|${(eq.location || '').toLowerCase().trim()}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(eq);
  }
  const duplicates = [];
  for (const [, group] of groups) {
    if (group.length > 1) duplicates.push(group);
  }
  return duplicates;
}

export function summariseQuality(allEquipment) {
  let total = 0;
  let withIssues = 0;
  const counts = { critical: 0, high: 0, medium: 0, low: 0 };
  const byType = {};
  for (const eq of allEquipment) {
    total++;
    const issues = detectIssues(eq);
    if (issues.length > 0) {
      withIssues++;
      for (const i of issues) {
        counts[i.severity] = (counts[i.severity] || 0) + 1;
        byType[i.type] = (byType[i.type] || 0) + 1;
      }
    }
  }
  return { total, withIssues, healthy: total - withIssues, counts, byType };
}