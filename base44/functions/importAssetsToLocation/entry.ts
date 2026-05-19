import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const VALID_TYPES = [
  'motor', 'pump', 'compressor', 'turbine', 'conveyor', 'hvac', 'generator',
  'transformer', 'valve', 'heat_exchanger', 'railway_track', 'railway_switch',
  'railway_signal', 'bridge', 'building', 'tunnel', 'dam', 'power_line',
  'wind_turbine', 'elevator', 'escalator', 'hvac_system', 'fire_suppression',
  'water_treatment', 'road_surface', 'retaining_wall', 'parking_structure'
];

const VALID_STATUS = ['operational', 'degraded', 'critical', 'offline', 'maintenance'];
const VALID_RISK = ['low', 'medium', 'high', 'critical'];

// Fuzzy type matching — normalises common variants to enum
function normaliseType(raw) {
  if (!raw) return null;
  const s = String(raw).toLowerCase().trim().replace(/[-\s]+/g, '_');
  if (VALID_TYPES.includes(s)) return s;
  // common aliases
  const aliases = {
    'asphalt': 'road_surface', 'road': 'road_surface', 'pavement': 'road_surface',
    'lift': 'elevator', 'a/c': 'hvac', 'air_conditioning': 'hvac', 'aircon': 'hvac',
    'wind': 'wind_turbine', 'solar': 'power_line',
    'parking': 'parking_structure', 'parking_lot': 'parking_structure',
    'water': 'water_treatment', 'sewer': 'water_treatment',
    'rail': 'railway_track', 'track': 'railway_track',
    'office': 'building', 'house': 'building', 'facility': 'building',
    'gate': 'valve', 'switch': 'railway_switch',
  };
  if (aliases[s]) return aliases[s];
  // partial contains match
  for (const v of VALID_TYPES) {
    if (s.includes(v) || v.includes(s)) return v;
  }
  return null;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { location_id, rows } = await req.json();
    if (!location_id || !Array.isArray(rows) || rows.length === 0) {
      return Response.json({ error: 'location_id and rows[] are required' }, { status: 400 });
    }

    // Fetch the location
    const location = await base44.entities.Location.get(location_id);
    if (!location) return Response.json({ error: 'Location not found' }, { status: 404 });

    const importBatchId = `batch_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const prepared = [];
    const skipped = [];

    for (const row of rows) {
      // name is required
      const name = row.name?.toString().trim();
      if (!name) {
        skipped.push({ row, reason: 'missing name' });
        continue;
      }

      // type fallback to "building" if unrecognised
      const type = normaliseType(row.type) || 'building';

      const record = {
        name,
        type,
        location: location.name,
        location_id: location.id,
        import_batch_id: importBatchId,
      };

      // Optional fields — only set if present and valid
      if (row.room) record.room = String(row.room).trim();
      if (row.manufacturer) record.manufacturer = String(row.manufacturer);
      if (row.model) record.model = String(row.model);
      if (row.serial_number) record.serial_number = String(row.serial_number);
      if (row.installation_date) record.installation_date = String(row.installation_date);
      if (row.last_maintenance_date) record.last_maintenance_date = String(row.last_maintenance_date);
      if (row.operating_hours != null && !isNaN(Number(row.operating_hours))) record.operating_hours = Number(row.operating_hours);
      if (row.rated_capacity != null && !isNaN(Number(row.rated_capacity))) record.rated_capacity = Number(row.rated_capacity);
      if (row.capacity_unit) record.capacity_unit = String(row.capacity_unit);
      if (row.health_score != null && !isNaN(Number(row.health_score))) record.health_score = Number(row.health_score);
      if (row.failure_probability != null && !isNaN(Number(row.failure_probability))) record.failure_probability = Number(row.failure_probability);
      if (row.remaining_useful_life_days != null && !isNaN(Number(row.remaining_useful_life_days))) record.remaining_useful_life_days = Number(row.remaining_useful_life_days);
      if (row.predicted_failure_date) record.predicted_failure_date = String(row.predicted_failure_date);
      if (row.status && VALID_STATUS.includes(String(row.status).toLowerCase())) record.status = String(row.status).toLowerCase();
      if (row.risk_level && VALID_RISK.includes(String(row.risk_level).toLowerCase())) record.risk_level = String(row.risk_level).toLowerCase();
      if (Array.isArray(row.tags)) record.tags = row.tags.map(String);
      if (row.image_url) record.image_url = String(row.image_url);

      // Stash any extra/unmapped fields under specifications
      const knownKeys = new Set([
        'name', 'type', 'manufacturer', 'model', 'serial_number', 'location', 'location_id',
        'room',
        'installation_date', 'last_maintenance_date', 'operating_hours', 'rated_capacity',
        'capacity_unit', 'health_score', 'status', 'risk_level', 'predicted_failure_date',
        'remaining_useful_life_days', 'failure_probability', 'criticality', 'image_url',
        'specifications', 'tags', 'import_batch_id'
      ]);
      const extras = {};
      for (const [k, v] of Object.entries(row)) {
        if (!knownKeys.has(k) && v != null && v !== '') extras[k] = v;
      }
      if (Object.keys(extras).length > 0) {
        record.specifications = { ...(row.specifications || {}), ...extras };
      }

      prepared.push(record);
    }

    if (prepared.length === 0) {
      return Response.json({ error: 'No valid rows to import', skipped }, { status: 400 });
    }

    // Bulk create
    const created = await base44.entities.Equipment.bulkCreate(prepared);

    // Update location's cached asset count
    const existingCount = location.total_assets || 0;
    await base44.entities.Location.update(location_id, {
      total_assets: existingCount + prepared.length
    });

    return Response.json({
      success: true,
      import_batch_id: importBatchId,
      created_count: prepared.length,
      skipped_count: skipped.length,
      skipped,
      location_name: location.name,
    });
  } catch (error) {
    console.error('Import error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});