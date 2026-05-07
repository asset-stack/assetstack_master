// Recommended re-inspection frequency (months) by component type / category.
// Aligned with IIMM and common AU council practice.

export const INSPECTION_FREQ_MONTHS = {
  // Critical infrastructure
  bridge: 12,
  building: 36,
  dam: 12,
  retaining_wall: 24,
  tunnel: 12,
  // Mechanical
  pump: 12,
  motor: 12,
  hvac: 6,
  hvac_system: 6,
  compressor: 12,
  generator: 12,
  // Electrical
  transformer: 12,
  power_line: 24,
  // Vertical transport
  elevator: 6,
  escalator: 6,
  // Safety
  fire_suppression: 6,
  // Default
  __default__: 24,
};

// Specific component_type names from Bunbury data
const COMPONENT_FREQ = {
  'Spa Surrounding Tiles': 24,
  'Toilet Suite': 24,
  'Hand Basin': 24,
  'Paint Finish': 36,
  'Ceiling Tiles': 24,
  'Carpet': 24,
  'Door Hardware': 36,
  'Air Conditioning': 6,
  'Lighting': 24,
  'Fire Extinguisher': 6,
  'Smoke Detector': 12,
  'Exit Sign': 12,
  'Roof Sheeting': 36,
  'Gutter': 24,
  'Window Glazing': 36,
};

export function recommendedFrequencyMonths(equipment) {
  const ct = equipment?.specifications?.component_type;
  if (ct && COMPONENT_FREQ[ct]) return COMPONENT_FREQ[ct];
  if (equipment?.type && INSPECTION_FREQ_MONTHS[equipment.type]) {
    return INSPECTION_FREQ_MONTHS[equipment.type];
  }
  // Critical assets: more frequent
  const crit = Number(equipment?.specifications?.criticality_score);
  if (crit >= 4) return 12;
  if (crit >= 3) return 24;
  return INSPECTION_FREQ_MONTHS.__default__;
}

export function nextInspectionDate(equipment) {
  const months = recommendedFrequencyMonths(equipment);
  const last = equipment?.last_maintenance_date
    ? new Date(equipment.last_maintenance_date)
    : equipment?.installation_date
      ? new Date(equipment.installation_date)
      : null;
  if (!last || isNaN(last.getTime())) return null;
  const next = new Date(last);
  next.setMonth(next.getMonth() + months);
  return next;
}

export function inspectionStatus(equipment) {
  const next = nextInspectionDate(equipment);
  if (!next) return { status: 'unknown', daysUntilDue: null };
  const today = new Date();
  const days = Math.floor((next - today) / (1000 * 60 * 60 * 24));
  if (days < 0) return { status: 'overdue', daysUntilDue: days, nextDate: next };
  if (days <= 30) return { status: 'due_soon', daysUntilDue: days, nextDate: next };
  return { status: 'ok', daysUntilDue: days, nextDate: next };
}