// Shared utilities for the Asset Register

export const STATUS_DOT = {
  operational: '#10b981',
  degraded: '#f59e0b',
  critical: '#ef4444',
  maintenance: '#3b82f6',
  offline: '#94a3b8',
};

export const RISK_BADGE = {
  low: 'bg-emerald-50 text-emerald-700',
  medium: 'bg-amber-50 text-amber-700',
  high: 'bg-orange-50 text-orange-700',
  critical: 'bg-rose-50 text-rose-700',
};

export const CRITICALITY_BADGE = {
  low: 'bg-slate-50 text-slate-600',
  medium: 'bg-blue-50 text-blue-700',
  high: 'bg-violet-50 text-violet-700',
  mission_critical: 'bg-rose-50 text-rose-700',
};

// Compute a 0-100 data quality score based on completeness of key fields
export function computeDataQuality(asset) {
  const fields = [
    'manufacturer', 'model', 'serial_number', 'installation_date',
    'last_maintenance_date', 'rated_capacity', 'criticality', 'location',
    'health_score', 'operating_hours',
  ];
  const filled = fields.filter((f) => asset[f] !== undefined && asset[f] !== null && asset[f] !== '').length;
  return Math.round((filled / fields.length) * 100);
}

// Generate a deterministic-ish 12-point sparkline from the asset's current health
export function generateSparkline(asset) {
  const base = Number(asset.health_score) || 60;
  const seed = (asset.id || asset.name || 'x').split('').reduce((s, c) => s + c.charCodeAt(0), 0);
  const points = [];
  for (let i = 0; i < 12; i++) {
    const drift = Math.sin((seed + i) * 0.7) * 6 + Math.cos((seed + i) * 1.3) * 4;
    const trend = (i / 11) * (base < 60 ? -8 : base > 80 ? 4 : 0);
    points.push(Math.max(0, Math.min(100, base + drift + trend)));
  }
  return points;
}

// Apply faceted filters and free-text search
export function applyFilters(assets, filters, search) {
  const q = (search || '').toLowerCase().trim();
  return assets.filter((a) => {
    if (filters.status?.length && !filters.status.includes(a.status)) return false;
    if (filters.risk?.length && !filters.risk.includes(a.risk_level)) return false;
    if (filters.criticality?.length && !filters.criticality.includes(a.criticality)) return false;
    if (filters.location?.length && !filters.location.includes(a.location)) return false;
    if (filters.type?.length && !filters.type.includes(a.type)) return false;
    if (q) {
      const hay = `${a.name || ''} ${a.location || ''} ${a.type || ''} ${a.manufacturer || ''} ${a.model || ''} ${a.serial_number || ''}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

// Group assets by a field, returning [{ key, items, count, critical, avgHealth }]
export function groupAssets(assets, groupBy) {
  if (groupBy === 'none') {
    return [{ key: 'all', items: assets, count: assets.length, critical: 0, avgHealth: null }];
  }
  const buckets = new Map();
  for (const a of assets) {
    const key = a[groupBy] || 'Unassigned';
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key).push(a);
  }
  return Array.from(buckets.entries())
    .map(([key, items]) => {
      const critical = items.filter((i) => i.status === 'critical' || i.risk_level === 'critical').length;
      const avgHealth = items.length
        ? Math.round(items.reduce((s, i) => s + (Number(i.health_score) || 0), 0) / items.length)
        : null;
      return { key, items, count: items.length, critical, avgHealth };
    })
    .sort((a, b) => b.count - a.count);
}

// Export a simple CSV from a list of assets
export function exportToCSV(assets) {
  if (!assets?.length) return;
  const cols = [
    'name', 'type', 'location', 'manufacturer', 'model', 'serial_number',
    'status', 'risk_level', 'criticality', 'health_score', 'failure_probability',
    'operating_hours', 'installation_date', 'last_maintenance_date',
  ];
  const escape = (v) => {
    if (v === undefined || v === null) return '';
    const s = String(v).replace(/"/g, '""');
    return /[",\n]/.test(s) ? `"${s}"` : s;
  };
  const header = cols.join(',');
  const rows = assets.map((a) => cols.map((c) => escape(a[c])).join(','));
  const csv = [header, ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `asset-register-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}