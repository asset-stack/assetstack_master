// Pure helpers — derive standard asset register metrics from an Equipment record's specifications.
// Aligned with IIMM / ISO 55000 condition + valuation conventions.

const CONDITION_FACTOR = { 1: 1.0, 2: 0.85, 3: 0.65, 4: 0.4, 5: 0.15 };

export function deriveCondition(equipment) {
  const raw = equipment?.specifications?.condition_grade;
  const grade = typeof raw === 'number' ? raw : parseInt(raw, 10);
  return Number.isFinite(grade) && grade >= 1 && grade <= 5 ? grade : null;
}

export function deriveLifeConsumed(equipment) {
  const lc = Number(equipment?.specifications?.life_consumed);
  if (!Number.isFinite(lc)) return null;
  return Math.max(0, Math.min(1, lc));
}

export function deriveHealthScore(equipment) {
  // Prefer derived from real data; only fall back to stored value if specs are absent
  const grade = deriveCondition(equipment);
  const lc = deriveLifeConsumed(equipment);
  if (grade != null && lc != null) {
    const conditionFactor = CONDITION_FACTOR[grade] ?? 0.5;
    return Math.round(Math.max(0, Math.min(100, (1 - lc) * conditionFactor * 100)));
  }
  if (grade != null) return Math.round((CONDITION_FACTOR[grade] ?? 0.5) * 100);
  if (lc != null) return Math.round((1 - lc) * 100);
  return equipment?.health_score ?? null;
}

export function deriveRULDays(equipment) {
  const lc = deriveLifeConsumed(equipment);
  const baseLife = Number(equipment?.specifications?.baselife_years);
  if (!Number.isFinite(baseLife) || baseLife <= 0 || lc == null) {
    return equipment?.remaining_useful_life_days ?? null;
  }
  return Math.round(baseLife * (1 - lc) * 365);
}

export function deriveCRC(equipment) {
  // Current Replacement Cost
  const direct = Number(equipment?.specifications?.replacement_value);
  if (Number.isFinite(direct) && direct > 0) return direct;
  const ppu = Number(equipment?.specifications?.price_per_unit);
  const qty = Number(equipment?.specifications?.quantity);
  if (Number.isFinite(ppu) && Number.isFinite(qty)) return ppu * qty;
  return 0;
}

export function deriveWDV(equipment) {
  // Written-Down Value = CRC × (1 - life_consumed)
  const crc = deriveCRC(equipment);
  const lc = deriveLifeConsumed(equipment) ?? 0;
  return Math.round(crc * (1 - lc));
}

export function deriveAnnualDepreciation(equipment) {
  const crc = deriveCRC(equipment);
  const baseLife = Number(equipment?.specifications?.baselife_years);
  if (!crc || !Number.isFinite(baseLife) || baseLife <= 0) return 0;
  return Math.round(crc / baseLife);
}

export function deriveDefectUrgency(equipment) {
  const u = equipment?.specifications?.defect_urgency;
  return typeof u === 'string' && u.length ? u : null;
}

export function deriveRiskLevel(equipment) {
  // Likelihood (life_consumed) × Consequence (criticality_score)
  const lc = deriveLifeConsumed(equipment) ?? 0;
  const crit = Number(equipment?.specifications?.criticality_score);
  if (!Number.isFinite(crit)) return equipment?.risk_level || 'low';
  const score = lc * crit; // 0–5
  if (score >= 3.5) return 'critical';
  if (score >= 2.0) return 'high';
  if (score >= 1.0) return 'medium';
  return 'low';
}

export function deriveStatus(equipment) {
  const grade = deriveCondition(equipment);
  const lc = deriveLifeConsumed(equipment);
  if (grade === 5 || (lc != null && lc >= 0.95)) return 'critical';
  if (grade === 4 || (lc != null && lc >= 0.8)) return 'degraded';
  return equipment?.status || 'operational';
}

export function dataCompleteness(equipment) {
  const fields = [
    'condition_grade', 'life_consumed', 'baselife_years', 'replacement_value',
    'criticality_score', 'quantity', 'unit', 'price_per_unit',
    'component_type', 'component_subtype', 'room_location',
  ];
  const filled = fields.filter((f) => {
    const v = equipment?.specifications?.[f];
    return v !== null && v !== undefined && v !== '' && v !== '-';
  }).length;
  return Math.round((filled / fields.length) * 100);
}

export function fmtMoney(n) {
  if (!Number.isFinite(Number(n))) return '$0';
  const v = Number(n);
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(2)}M`;
  if (v >= 1_000) return `$${(v / 1_000).toFixed(1)}k`;
  return `$${Math.round(v).toLocaleString()}`;
}