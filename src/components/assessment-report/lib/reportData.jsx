// Pure helpers — no entity calls, just transforms over (engine result + rooms + components + defects).
// Derives all aggregates needed by the 14 report pages.

export const PROGRAMS = ['balanced', 'must_do', 'premium'];
export const PROGRAM_LABELS = { balanced: 'Balanced', must_do: 'Must Do', premium: 'Premium' };

// AssetStack-styled palette (replaces Power BI's harsh blues with the app's indigo system)
export const COLORS = {
  primary: '#4f46e5',
  primaryLight: '#818cf8',
  primaryDark: '#3730a3',
  defect: '#ef4444',
  planned: '#4f46e5',
  good: '#10b981',
  warn: '#f59e0b',
  bad: '#ef4444',
  axis: '#94a3b8',
  grid: '#e2e8f0',
  text: '#0f172a',
  muted: '#64748b',
};

// Distinct categorical palette for groups / rooms
export const CATEGORICAL = [
  '#4f46e5', '#06b6d4', '#10b981', '#f59e0b', '#ef4444',
  '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#84cc16',
  '#3b82f6', '#a855f7', '#22c55e', '#eab308', '#dc2626',
  '#0ea5e9', '#d946ef', '#0d9488', '#ea580c', '#65a30d',
];

export const colorFor = (key, idx = 0) => CATEGORICAL[idx % CATEGORICAL.length];

export const fmtMoney = (n, decimals = 0) => {
  if (n == null || isNaN(n)) return '—';
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals,
  }).format(n);
};

export const fmtCompact = (n) => {
  if (n == null || isNaN(n)) return '—';
  if (Math.abs(n) >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  if (Math.abs(n) >= 1e3) return `$${(n / 1e3).toFixed(1)}K`;
  return `$${Math.round(n)}`;
};

export const fmtNumber = (n, decimals = 0) =>
  n == null || isNaN(n) ? '—' : new Intl.NumberFormat('en-AU', { maximumFractionDigits: decimals }).format(n);

// Convert engine.byYear into recharts data: [{year, balanced, must_do, premium}, ...]
export function yearSeries(engine) {
  if (!engine?.byYear) return [];
  return Object.entries(engine.byYear)
    .map(([year, vals]) => ({ year: Number(year), ...vals }))
    .sort((a, b) => a.year - b.year);
}

// For a chosen program, return [{year, defects, planned, total}]
export function defectsVsPlannedSeries(engine, program) {
  if (!engine?.byYear) return [];
  const years = Object.keys(engine.byYear).map(Number).sort((a, b) => a - b);
  return years.map(year => {
    const total = engine.byYear[year]?.[program] || 0;
    const defects = engine.defectsByYear?.[year]?.[program] || 0;
    return { year, defects, planned: Math.max(0, total - defects), total };
  });
}

// Room totals over horizon for chosen program: [{roomKey, room_code, name, total}, ...]
export function roomTotals(engine, rooms, program) {
  if (!engine?.byRoomYear) return [];
  return rooms.map(r => {
    const yearMap = engine.byRoomYear[r.id] || {};
    const total = Object.values(yearMap).reduce((acc, yv) => acc + (yv[program] || 0), 0);
    return {
      room_id: r.id,
      room_code: r.room_code,
      name: r.name,
      label: `${r.room_code}/${r.name}`,
      total,
    };
  }).sort((a, b) => b.total - a.total);
}

// Build pivot: rows = rooms, cols = years, cell = program cost.
export function roomYearPivot(engine, rooms, program) {
  if (!engine?.horizon) return { years: [], rows: [] };
  const years = engine.horizon.years;
  const rows = rooms.map(r => {
    const yearMap = engine.byRoomYear?.[r.id] || {};
    const cells = {};
    let rowTotal = 0;
    years.forEach(y => {
      const v = yearMap[y]?.[program] || 0;
      cells[y] = v;
      rowTotal += v;
    });
    return {
      room_id: r.id,
      room_code: r.room_code,
      name: r.name,
      label: `${r.room_code}/${r.name}`,
      cells,
      rowTotal,
    };
  });
  // Totals per column
  const colTotals = {};
  years.forEach(y => {
    colTotals[y] = rows.reduce((acc, r) => acc + (r.cells[y] || 0), 0);
  });
  return { years, rows, colTotals };
}

// Group breakdown by year for program: [{year, group1: $, group2: $, ...}]
export function groupYearSeries(engine, program) {
  if (!engine?.byGroupYear) return { data: [], groups: [] };
  const groups = Object.keys(engine.byGroupYear);
  const years = engine.horizon?.years || [];
  const data = years.map(year => {
    const row = { year };
    groups.forEach(g => {
      row[g] = engine.byGroupYear[g]?.[year]?.[program] || 0;
    });
    return row;
  });
  return { data, groups };
}

// Component type — small multiples (top N types)
export function topComponentTypes(engine, program, n = 6) {
  if (!engine?.byComponentTypeYear) return [];
  const totals = Object.entries(engine.byComponentTypeYear).map(([type, yearMap]) => {
    const total = Object.values(yearMap).reduce((acc, yv) => acc + (yv[program] || 0), 0);
    return { type, total, yearMap };
  });
  return totals.sort((a, b) => b.total - a.total).slice(0, n);
}

// Criticality histogram for chosen program: [{criticality, total}]
export function criticalitySeries(engine, program) {
  if (!engine?.byCriticality) return [];
  return [1, 2, 3, 4, 5].map(c => ({
    criticality: c,
    total: engine.byCriticality[c]?.[program] || 0,
  }));
}

// Condition change rows: combine engine.roomCondition with computed delta.
export function conditionChange(engine) {
  return (engine?.roomCondition || []).map(rc => ({
    ...rc,
    delta: rc.change,
  })).sort((a, b) => (b.delta ?? -99) - (a.delta ?? -99));
}

// Asset count pivot: rows = rooms, cols = component types
export function componentCountPivot(components, rooms) {
  const types = Array.from(new Set(components.map(c => c.component_type))).filter(Boolean).sort();
  const rows = rooms.map(r => {
    const cells = {};
    let total = 0;
    types.forEach(t => { cells[t] = 0; });
    components.filter(c => c.room_id === r.id).forEach(c => {
      const t = c.component_type || 'Unknown';
      cells[t] = (cells[t] || 0) + 1;
      total += 1;
    });
    return { room_id: r.id, room_code: r.room_code, label: `${r.room_code}/${r.name}`, cells, total };
  });
  const colTotals = {};
  types.forEach(t => { colTotals[t] = rows.reduce((a, r) => a + (r.cells[t] || 0), 0); });
  return { types, rows, colTotals, grand: rows.reduce((a, r) => a + r.total, 0) };
}

// First instance of replacement/repair for each component (next year >= startYear)
export function firstReplacementRows(components, rooms, engine) {
  const startYear = engine?.horizon?.startYear || (new Date().getFullYear() + 1);
  const endYear = engine?.horizon?.endYear || (startYear + 19);
  const roomById = Object.fromEntries(rooms.map(r => [r.id, r]));
  return components.map(c => {
    const installed = c.year_installed || (startYear - 10);
    const life = c.useful_life_years || 20;
    let next = installed + life;
    while (next < startYear) next += life;
    const room = roomById[c.room_id];
    return {
      component_id: c.id,
      room_code: room?.room_code || '',
      room_label: room ? `${room.room_code}/${room.name}` : '',
      component_type: c.component_type,
      subtype: c.subtype,
      material: c.material,
      size: c.size,
      first_year: next <= endYear ? next : null,
      condition: c.condition_grade_current,
      criticality: c.criticality,
    };
  }).sort((a, b) => {
    if (a.room_code !== b.room_code) return a.room_code.localeCompare(b.room_code);
    return (a.first_year || 9999) - (b.first_year || 9999);
  });
}

// LOS Summary — group rooms by level_of_service
export function losSummary(rooms) {
  const grouped = {};
  rooms.forEach(r => {
    const los = r.level_of_service ?? 0;
    if (!grouped[los]) grouped[los] = [];
    grouped[los].push(r);
  });
  return Object.entries(grouped)
    .map(([los, rs]) => ({ los: Number(los), rooms: rs.sort((a, b) => a.room_code.localeCompare(b.room_code)) }))
    .sort((a, b) => b.los - a.los);
}