import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Demo profile datasets — inlined (backend functions cannot import local files).
// Cross-entity refs use `_location_key` / `_equipment_key` resolved at seed time.
const DEMO_PROFILES = {
  snowy_hydro: {
    id: 'snowy_hydro',
    name: 'Snowy Hydro',
    data: {
      Location: [
        { _key: 'tumut1', name: 'Tumut 1 Power Station', code: 'T1', client_name: 'Snowy Hydro', location_type: 'facility', city: 'Cabramurra', region: 'NSW', gps_lat: -35.939, gps_lng: 148.379, status: 'active' },
        { _key: 'tumut3', name: 'Tumut 3 Power Station', code: 'T3', client_name: 'Snowy Hydro', location_type: 'facility', city: 'Talbingo', region: 'NSW', gps_lat: -35.642, gps_lng: 148.295, status: 'active' },
        { _key: 'murray1', name: 'Murray 1 Power Station', code: 'M1', client_name: 'Snowy Hydro', location_type: 'facility', city: 'Khancoban', region: 'NSW', gps_lat: -36.245, gps_lng: 148.135, status: 'active' },
        { _key: 'talbingo', name: 'Talbingo Dam', code: 'TAL', client_name: 'Snowy Hydro', location_type: 'facility', city: 'Talbingo', region: 'NSW', gps_lat: -35.617, gps_lng: 148.301, status: 'active' },
        { _key: 'snowy2', name: 'Snowy 2.0 Cavern', code: 'S2', client_name: 'Snowy Hydro', location_type: 'facility', city: 'Lobs Hole', region: 'NSW', gps_lat: -35.778, gps_lng: 148.418, status: 'active' },
        { _key: 'colongra', name: 'Colongra Power Station', code: 'COL', client_name: 'Snowy Hydro', location_type: 'facility', city: 'Lake Munmorah', region: 'NSW', gps_lat: -33.187, gps_lng: 151.581, status: 'active' },
      ],
      Equipment: [
        { _key: 't1u1', _location_key: 'tumut1', name: 'Tumut 1 Unit 1 Turbine', type: 'turbine', location: 'Tumut 1', manufacturer: 'Toshiba', health_score: 82, status: 'operational', criticality: 'mission_critical', risk_level: 'medium' },
        { _key: 't1u2', _location_key: 'tumut1', name: 'Tumut 1 Unit 2 Turbine', type: 'turbine', location: 'Tumut 1', manufacturer: 'Toshiba', health_score: 67, status: 'degraded', criticality: 'mission_critical', risk_level: 'high', failure_probability: 38 },
        { _key: 't3pump', _location_key: 'tumut3', name: 'Tumut 3 Pump-Storage Unit 1', type: 'pump', location: 'Tumut 3', health_score: 91, status: 'operational', criticality: 'mission_critical' },
        { _key: 'talbingo_piezo', _location_key: 'talbingo', name: 'Talbingo Dam Piezometer Array', type: 'valve', location: 'Talbingo Dam', health_score: 74, status: 'operational', criticality: 'high' },
        { _key: 'colongra_gt1', _location_key: 'colongra', name: 'Colongra GT-1 Peaker', type: 'generator', location: 'Colongra', health_score: 58, status: 'degraded', criticality: 'high', risk_level: 'high', failure_probability: 45 },
        { _key: 's2_tbm', _location_key: 'snowy2', name: 'Snowy 2.0 TBM Lady Eileen', type: 'compressor', location: 'Snowy 2.0', health_score: 88, status: 'operational', criticality: 'mission_critical' },
      ],
      Technician: [
        { name: 'Mark Stevens', employee_id: 'SH-001', email: 'm.stevens@snowyhydro.com.au', skills: ['hydro turbines', 'governor systems'], certification_level: 'expert', hourly_rate: 110, availability_status: 'available' },
        { name: 'Priya Patel', employee_id: 'SH-002', email: 'p.patel@snowyhydro.com.au', skills: ['piezometers', 'dam safety'], certification_level: 'senior', hourly_rate: 95, availability_status: 'available' },
      ],
      ComplianceRequirement: [
        { name: 'NSW Dam Safety Annual Surveillance — Talbingo', regulation: 'NSW Dams Safety Act 2015', frequency: 'annual', category: 'structural', responsible_party: 'external_certified', next_due_date: '2026-09-30', compliance_status: 'due_soon' },
        { name: 'Booroolong Frog habitat survey', regulation: 'EPBC Act 1999', frequency: 'annual', category: 'environmental', responsible_party: 'external_certified', next_due_date: '2026-11-15', compliance_status: 'compliant' },
        { name: 'EPA Water Quality discharge', regulation: 'POEO Act 1997', frequency: 'quarterly', category: 'environmental', responsible_party: 'internal', next_due_date: '2026-06-30', compliance_status: 'compliant' },
      ],
      Budget: [
        { name: 'Snowy 2.0 Construction', fiscal_year: 'FY2026', scope_type: 'department', allocated_amount: 12500000, spent_amount: 8200000, committed_amount: 2100000, category: 'capital_replacement', status: 'active', currency: 'AUD' },
        { name: 'Hydro fleet preventive maintenance', fiscal_year: 'FY2026', scope_type: 'organisation', allocated_amount: 4200000, spent_amount: 2800000, category: 'preventive_maintenance', status: 'active', currency: 'AUD' },
      ],
      CapitalPlanItem: [
        { equipment_name: 'Tumut 1 Unit 2 runner replacement', location_name: 'Tumut 1', asset_type: 'turbine', replacement_year: 2027, replacement_cost: 4800000, priority: 'high', funding_source: 'capital', status: 'approved', rationale: 'RUL approaching end, vibration trending up' },
        { equipment_name: 'Colongra GT-1 hot section overhaul', location_name: 'Colongra', asset_type: 'generator', replacement_year: 2026, replacement_cost: 1900000, priority: 'urgent', funding_source: 'operational', status: 'approved' },
      ],
      SavingsLedgerEntry: [
        { title: 'Tumut 3 bearing replacement (predicted)', equipment_name: 'Tumut 3 Unit 1', trigger_source: 'ai_prediction', predicted_failure_cost: 2400000, intervention_cost: 185000, verified_savings: 2215000, currency: 'AUD', status: 'verified' },
        { title: 'Snowy 2.0 cavern overbreak early detection', equipment_name: 'TBM Lady Eileen', trigger_source: 'scan_anomaly', predicted_failure_cost: 7500000, intervention_cost: 420000, verified_savings: 7080000, currency: 'AUD', status: 'verified' },
      ],
    },
  },

  bunbury_council: {
    id: 'bunbury_council',
    name: 'City of Bunbury',
    data: {
      Location: [
        { _key: 'townhall', name: 'Bunbury Town Hall', code: 'BTH', client_name: 'City of Bunbury', location_type: 'building', address: '4 Stephen St', city: 'Bunbury', region: 'WA', gps_lat: -33.327, gps_lng: 115.640, status: 'active' },
        { _key: 'swsc', name: 'South West Sports Centre', code: 'SWSC', client_name: 'City of Bunbury', location_type: 'facility', city: 'Bunbury', region: 'WA', gps_lat: -33.337, gps_lng: 115.652, status: 'active' },
        { _key: 'museum', name: 'Bunbury Museum (Paisley Centre)', code: 'BM', client_name: 'City of Bunbury', location_type: 'building', city: 'Bunbury', region: 'WA', gps_lat: -33.325, gps_lng: 115.637, status: 'active' },
        { _key: 'admin', name: 'Council Admin Building', code: 'CAB', client_name: 'City of Bunbury', location_type: 'building', city: 'Bunbury', region: 'WA', gps_lat: -33.326, gps_lng: 115.639, status: 'active' },
        { _key: 'seawall', name: 'Ocean Drive Seawall', code: 'OCD', client_name: 'City of Bunbury', location_type: 'other', city: 'Bunbury', region: 'WA', gps_lat: -33.318, gps_lng: 115.635, status: 'active' },
      ],
      Equipment: [
        { _key: 'lift1', _location_key: 'admin', name: 'Council Admin Lift 1', type: 'elevator', location: 'Council Admin', manufacturer: 'KONE', health_score: 76, status: 'operational', criticality: 'high' },
        { _key: 'lift2', _location_key: 'admin', name: 'Council Admin Lift 2', type: 'elevator', location: 'Council Admin', manufacturer: 'KONE', health_score: 62, status: 'degraded', criticality: 'high', risk_level: 'medium' },
        { _key: 'firepanel', _location_key: 'townhall', name: 'Town Hall Fire Panel', type: 'fire_suppression', location: 'Town Hall', health_score: 88, status: 'operational', criticality: 'mission_critical' },
        { _key: 'hvac_swsc', _location_key: 'swsc', name: 'SWSC HVAC System', type: 'hvac_system', location: 'Sports Centre', health_score: 71, status: 'operational', criticality: 'medium' },
        { _key: 'seawall_s3', _location_key: 'seawall', name: 'Ocean Drive Seawall Section 3', type: 'retaining_wall', location: 'Ocean Drive', health_score: 35, status: 'critical', criticality: 'mission_critical', risk_level: 'critical' },
        { _key: 'museum_ceiling', _location_key: 'museum', name: 'Museum Ceiling Paint Finish', type: 'building', location: 'Museum', health_score: 65, status: 'operational', criticality: 'low' },
      ],
      Technician: [
        { name: 'Dave Wilson', employee_id: 'BC-001', email: 'd.wilson@bunbury.wa.gov.au', skills: ['HVAC', 'electrical'], certification_level: 'senior', hourly_rate: 78, availability_status: 'available' },
        { name: 'Lisa Tran', employee_id: 'BC-002', email: 'l.tran@bunbury.wa.gov.au', skills: ['compliance', 'inspections'], certification_level: 'expert', hourly_rate: 82, availability_status: 'available' },
      ],
      ComplianceRequirement: [
        { name: 'Annual lift inspection — Council Admin', regulation: 'AS 1735.1', frequency: 'annual', category: 'lift', responsible_party: 'external_certified', next_due_date: '2026-06-15', compliance_status: 'compliant', last_completed_date: '2025-06-12' },
        { name: 'Fire panel monthly test', regulation: 'AS 1851', frequency: 'monthly', category: 'fire', responsible_party: 'internal', next_due_date: '2026-05-15', compliance_status: 'due_soon' },
        { name: 'Annual electrical RCD test', regulation: 'AS/NZS 3760', frequency: 'annual', category: 'electrical', responsible_party: 'external_certified', next_due_date: '2026-09-01', compliance_status: 'compliant' },
        { name: 'Asbestos register review', regulation: 'WA OSH Regulations 1996', frequency: 'annual', category: 'safety', responsible_party: 'external_certified', next_due_date: '2026-12-01', compliance_status: 'compliant' },
      ],
      Budget: [
        { name: 'Preventive maintenance — Sports Centre', fiscal_year: 'FY2026', scope_type: 'location', scope_name: 'SWSC', allocated_amount: 110000, spent_amount: 68400, committed_amount: 14200, category: 'preventive_maintenance', status: 'active' },
        { name: 'Capital — Lifts replacement', fiscal_year: 'FY2026', scope_type: 'asset_class', scope_name: 'Lifts', allocated_amount: 200000, spent_amount: 14800, committed_amount: 185000, category: 'capital_replacement', status: 'active' },
        { name: 'Compliance & inspections', fiscal_year: 'FY2026', scope_type: 'organisation', allocated_amount: 65000, spent_amount: 38700, category: 'operational', status: 'active' },
      ],
      CapitalPlanItem: [
        { equipment_name: 'Ocean Drive seawall Section 3', location_name: 'Ocean Drive - Koombana Bay', asset_type: 'Seawall', replacement_year: 2026, replacement_cost: 480000, priority: 'urgent', funding_source: 'grant', status: 'approved', rationale: 'Critical condition — coastal defence priority', condition_score: 35, likelihood_of_failure: 'almost_certain', consequence_of_failure: 'catastrophic' },
        { equipment_name: 'Council Admin Lift 2 modernisation', location_name: 'Council Admin Building', asset_type: 'Lift', replacement_year: 2030, replacement_cost: 95000, priority: 'medium', funding_source: 'capital', status: 'proposed', condition_score: 78 },
        { equipment_name: 'SWSF Fire Suppression upgrade', location_name: 'South West Sports Centre', asset_type: 'Fire', replacement_year: 2030, replacement_cost: 95000, priority: 'medium', funding_source: 'capital', status: 'proposed', rationale: 'Compliance-driven; AS 1851 inspection due', condition_score: 72 },
      ],
    },
  },

  mining: {
    id: 'mining',
    name: 'Iron Ore Mining Co',
    data: {
      Location: [
        { _key: 'pit_a', name: 'Pit A — Open Cut', code: 'PIT-A', client_name: 'Iron Ore Mining Co', location_type: 'facility', city: 'Newman', region: 'WA', gps_lat: -23.357, gps_lng: 119.732, status: 'active' },
        { _key: 'crusher', name: 'Primary Crusher Plant', code: 'CRSH', client_name: 'Iron Ore Mining Co', location_type: 'facility', city: 'Newman', region: 'WA', status: 'active' },
        { _key: 'rail_load', name: 'Train Loadout Facility', code: 'TLO', client_name: 'Iron Ore Mining Co', location_type: 'facility', city: 'Newman', region: 'WA', status: 'active' },
        { _key: 'workshop', name: 'Heavy Vehicle Workshop', code: 'HVW', client_name: 'Iron Ore Mining Co', location_type: 'depot', city: 'Newman', region: 'WA', status: 'active' },
      ],
      Equipment: [
        { _key: 'haul1', _location_key: 'pit_a', name: 'Haul Truck 797F #12', type: 'generator', location: 'Pit A', manufacturer: 'Caterpillar', health_score: 84, status: 'operational', criticality: 'high' },
        { _key: 'haul2', _location_key: 'pit_a', name: 'Haul Truck 797F #08', type: 'generator', location: 'Pit A', manufacturer: 'Caterpillar', health_score: 52, status: 'degraded', criticality: 'high', failure_probability: 55, risk_level: 'high' },
        { _key: 'crusher_primary', _location_key: 'crusher', name: 'Primary Gyratory Crusher', type: 'compressor', location: 'Crusher Plant', health_score: 78, status: 'operational', criticality: 'mission_critical' },
        { _key: 'conveyor1', _location_key: 'crusher', name: 'Conveyor CV-101', type: 'conveyor', location: 'Crusher Plant', health_score: 69, status: 'operational', criticality: 'high' },
        { _key: 'loadout', _location_key: 'rail_load', name: 'Train Loadout Bin', type: 'valve', location: 'Loadout', health_score: 88, status: 'operational', criticality: 'mission_critical' },
      ],
      Technician: [
        { name: 'Robbo Jenkins', employee_id: 'MIN-001', email: 'r.jenkins@ironoreco.com.au', skills: ['heavy diesel', 'hydraulics'], certification_level: 'expert', hourly_rate: 135, availability_status: 'available' },
        { name: 'Kelly Nguyen', employee_id: 'MIN-002', email: 'k.nguyen@ironoreco.com.au', skills: ['fixed plant', 'conveyors'], certification_level: 'senior', hourly_rate: 115, availability_status: 'available' },
      ],
      ComplianceRequirement: [
        { name: 'WA Mines Safety Inspection Levy', regulation: 'WA Mines Safety and Inspection Act 1994', frequency: 'quarterly', category: 'safety', responsible_party: 'external_certified', next_due_date: '2026-06-30', compliance_status: 'compliant' },
        { name: 'Tailings dam annual integrity audit', regulation: 'ANCOLD Guidelines', frequency: 'annual', category: 'structural', responsible_party: 'external_certified', next_due_date: '2026-10-15', compliance_status: 'due_soon' },
      ],
      Budget: [
        { name: 'Mobile fleet maintenance', fiscal_year: 'FY2026', scope_type: 'asset_class', allocated_amount: 8500000, spent_amount: 5200000, committed_amount: 940000, category: 'corrective_maintenance', status: 'active', currency: 'AUD' },
        { name: 'Fixed plant preventive', fiscal_year: 'FY2026', scope_type: 'asset_class', allocated_amount: 3400000, spent_amount: 1980000, category: 'preventive_maintenance', status: 'active', currency: 'AUD' },
      ],
      CapitalPlanItem: [
        { equipment_name: 'Haul Truck 797F #08 engine overhaul', location_name: 'Pit A', asset_type: 'mobile_plant', replacement_year: 2026, replacement_cost: 1450000, priority: 'urgent', funding_source: 'operational', status: 'approved' },
        { equipment_name: 'Conveyor CV-101 belt replacement', location_name: 'Crusher Plant', asset_type: 'conveyor', replacement_year: 2027, replacement_cost: 380000, priority: 'high', funding_source: 'capital', status: 'proposed' },
      ],
    },
  },

  rail: {
    id: 'rail',
    name: 'Regional Rail Authority',
    data: {
      Location: [
        { _key: 'central', name: 'Central Station', code: 'CEN', client_name: 'Regional Rail', location_type: 'station', city: 'Sydney', region: 'NSW', gps_lat: -33.883, gps_lng: 151.207, status: 'active' },
        { _key: 'depot_n', name: 'Northern Maintenance Depot', code: 'NMD', client_name: 'Regional Rail', location_type: 'depot', city: 'Hornsby', region: 'NSW', status: 'active' },
        { _key: 'bridge_h', name: 'Hawkesbury River Bridge', code: 'HRB', client_name: 'Regional Rail', location_type: 'bridge', region: 'NSW', gps_lat: -33.547, gps_lng: 151.234, status: 'active' },
        { _key: 'tunnel_e', name: 'Eastern Tunnel', code: 'ETN', client_name: 'Regional Rail', location_type: 'other', region: 'NSW', status: 'active' },
      ],
      Equipment: [
        { _key: 'track_km45', _location_key: 'central', name: 'Track Section KM45-50', type: 'railway_track', location: 'Main Line', health_score: 72, status: 'operational', criticality: 'mission_critical' },
        { _key: 'switch_12', _location_key: 'central', name: 'Switch Point SW-12', type: 'railway_switch', location: 'Central Yard', health_score: 64, status: 'degraded', criticality: 'high', failure_probability: 32 },
        { _key: 'signal_e22', _location_key: 'central', name: 'Signal E-22', type: 'railway_signal', location: 'Eastern Approach', health_score: 89, status: 'operational', criticality: 'mission_critical' },
        { _key: 'bridge_main', _location_key: 'bridge_h', name: 'Hawkesbury Bridge Main Span', type: 'bridge', location: 'Hawkesbury', health_score: 68, status: 'operational', criticality: 'mission_critical', risk_level: 'medium' },
        { _key: 'tunnel_lining', _location_key: 'tunnel_e', name: 'Eastern Tunnel Lining', type: 'tunnel', location: 'Eastern Tunnel', health_score: 55, status: 'degraded', criticality: 'high', risk_level: 'high' },
      ],
      Technician: [
        { name: 'Tom Bradley', employee_id: 'RR-001', email: 't.bradley@regionalrail.com.au', skills: ['track', 'rail welding'], certification_level: 'expert', hourly_rate: 98, availability_status: 'available' },
        { name: 'Aisha Khan', employee_id: 'RR-002', email: 'a.khan@regionalrail.com.au', skills: ['signalling', 'electronics'], certification_level: 'senior', hourly_rate: 92, availability_status: 'available' },
      ],
      ComplianceRequirement: [
        { name: 'Track geometry inspection', regulation: 'ONRSR Rail Safety National Law', frequency: 'monthly', category: 'safety', responsible_party: 'internal', next_due_date: '2026-05-30', compliance_status: 'compliant' },
        { name: 'Bridge structural assessment — Hawkesbury', regulation: 'AS 5100', frequency: 'biennial', category: 'structural', responsible_party: 'external_certified', next_due_date: '2026-08-15', compliance_status: 'due_soon' },
        { name: 'Signal interlocking annual test', regulation: 'ONRSR', frequency: 'annual', category: 'safety', responsible_party: 'external_certified', next_due_date: '2026-11-01', compliance_status: 'compliant' },
      ],
      Budget: [
        { name: 'Track maintenance program', fiscal_year: 'FY2026', scope_type: 'asset_class', allocated_amount: 6200000, spent_amount: 3800000, committed_amount: 720000, category: 'preventive_maintenance', status: 'active', currency: 'AUD' },
        { name: 'Bridge & tunnel capital', fiscal_year: 'FY2026', scope_type: 'asset_class', allocated_amount: 4500000, spent_amount: 1200000, category: 'capital_replacement', status: 'active', currency: 'AUD' },
      ],
      CapitalPlanItem: [
        { equipment_name: 'Eastern Tunnel lining remediation', location_name: 'Eastern Tunnel', asset_type: 'tunnel', replacement_year: 2027, replacement_cost: 2800000, priority: 'high', funding_source: 'capital', status: 'approved', condition_score: 55 },
        { equipment_name: 'Switch SW-12 replacement', location_name: 'Central Yard', asset_type: 'railway_switch', replacement_year: 2026, replacement_cost: 180000, priority: 'high', funding_source: 'operational', status: 'approved' },
      ],
    },
  },
};

const WIPE_ENTITIES = [
  'WorkOrder', 'MaintenanceTask', 'SensorReading', 'SensorConfiguration',
  'Alert', 'ConditionReport', 'DigitalTwinModel', 'CapitalPlanItem',
  'Budget', 'ComplianceRequirement', 'ComplianceDocument', 'SavingsLedgerEntry',
  'SavedScenario', 'Supplier', 'SparePart', 'PurchaseOrder',
  'Technician', 'Equipment', 'Location',
];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { profile_id, confirm } = await req.json();

    if (!confirm) {
      return Response.json({ error: 'confirm flag required' }, { status: 400 });
    }

    const profile = DEMO_PROFILES[profile_id];
    if (!profile) {
      return Response.json({ error: `Unknown profile: ${profile_id}` }, { status: 400 });
    }

    // SAFETY: only run in dev/test environment
    const envHeader = req.headers.get('x-base44-environment') || req.headers.get('x-data-env') || '';
    const isDev = envHeader === 'dev' || envHeader === 'test';
    if (!isDev) {
      return Response.json({
        error: 'Refusing to run: loadDemoProfile only operates on the Test database. Switch to Test mode and retry.',
        env_header: envHeader,
      }, { status: 400 });
    }

    const wipeResults = {};
    const seedResults = {};

    for (const entity of WIPE_ENTITIES) {
      try {
        const existing = await base44.asServiceRole.entities[entity].list(null, 5000);
        let deleted = 0;
        for (const rec of existing) {
          try {
            await base44.asServiceRole.entities[entity].delete(rec.id);
            deleted++;
          } catch (_) { /* skip individual failures */ }
        }
        wipeResults[entity] = deleted;
      } catch (e) {
        wipeResults[entity] = `error: ${e.message}`;
      }
    }

    const seedOrder = [
      'Location', 'Equipment', 'Technician',
      'SensorConfiguration', 'ComplianceRequirement', 'Budget',
      'CapitalPlanItem', 'WorkOrder', 'MaintenanceTask',
      'Alert', 'DigitalTwinModel', 'SavingsLedgerEntry',
    ];

    const locationIdMap = {};
    const equipmentIdMap = {};

    for (const entity of seedOrder) {
      const items = profile.data[entity];
      if (!items || items.length === 0) continue;

      try {
        let count = 0;
        for (const rec of items) {
          const copy = { ...rec };
          const key = copy._key;
          delete copy._key;

          if (copy._location_key) {
            if (locationIdMap[copy._location_key]) {
              copy.location_id = locationIdMap[copy._location_key];
            }
            delete copy._location_key;
          }
          if (copy._equipment_key) {
            if (equipmentIdMap[copy._equipment_key]) {
              copy.equipment_id = equipmentIdMap[copy._equipment_key];
            }
            delete copy._equipment_key;
          }

          const result = await base44.asServiceRole.entities[entity].create(copy);
          if (entity === 'Location' && key) locationIdMap[key] = result.id;
          if (entity === 'Equipment' && key) equipmentIdMap[key] = result.id;
          count++;
        }
        seedResults[entity] = count;
      } catch (e) {
        seedResults[entity] = `error: ${e.message}`;
      }
    }

    return Response.json({
      success: true,
      profile_id,
      profile_name: profile.name,
      wiped: wipeResults,
      seeded: seedResults,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});