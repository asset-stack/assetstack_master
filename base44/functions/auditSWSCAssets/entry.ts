import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import * as XLSX from 'npm:xlsx@0.18.5';

// Audit & optionally fix SWSC (BLD 1941) assets against the authoritative spreadsheet.
//
// Modes:
//   - "audit" (default): downloads the spreadsheet, parses the "2025 Assessment" sheet
//     (760 rows for BLD 1941), compares to current Equipment records for SWSC, and
//     returns a reconciliation report:
//       missing_in_db   — rows present in spreadsheet but no matching Equipment
//       extra_in_db     — Equipment records that don't appear in spreadsheet
//       field_mismatches — assets where condition/criticality/baselife/price differ
//   - "fix": applies the corrections detected in audit (creates missing, updates mismatched).
//     Does NOT delete extras automatically — they're reported only.
//
// Matching key: room_id + component_type + component_subtype (the lookup that uniquely
// identifies an asset within SWSC).

const SWSC_BLD_ID = 1941;
const SWSC_LOCATION_NAME = 'South West Sports Centre';
const SPREADSHEET_URL = 'https://media.base44.com/files/public/6a0a6a5d4d043b0e41a16d90/27cbf9e4c_Bunbury2025ConditionData-JHBRAG.xlsx';

const TRIM = (v) => (v == null ? '' : String(v).trim());
const NUM = (v) => {
  if (v == null || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

// Build the unique key for a spreadsheet row or Equipment record
function buildKey(roomId, componentType, subtype) {
  return [TRIM(roomId), TRIM(componentType), TRIM(subtype)].join('|').toLowerCase();
}

// Map a spreadsheet condition grade (1-5) to our Equipment.health_score (0-100)
// 1 = excellent (95), 2 = good (75), 3 = fair (55), 4 = poor (30), 5 = failed (10)
function gradeToHealth(g) {
  const n = NUM(g);
  if (n == null) return null;
  return Math.max(10, Math.round(110 - n * 20));
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Admin required' }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    const action = body.action || 'audit'; // "audit" | "fix"
    const maxUpdates = Math.max(1, Math.min(parseInt(body.max_updates) || 200, 1000));

    // 1. Fetch and parse the spreadsheet
    const xlsxResp = await fetch(SPREADSHEET_URL);
    if (!xlsxResp.ok) {
      return Response.json({ error: `Failed to fetch spreadsheet: ${xlsxResp.status}` }, { status: 502 });
    }
    const buffer = new Uint8Array(await xlsxResp.arrayBuffer());
    const wb = XLSX.read(buffer, { type: 'array' });

    const sheet = wb.Sheets['2025 Assessment'];
    if (!sheet) {
      return Response.json({ error: 'Sheet "2025 Assessment" not found' }, { status: 500 });
    }
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: null });

    // Filter to SWSC only
    const swscRows = rows.filter((r) => NUM(r['BLD ID#']) === SWSC_BLD_ID);

    // Resolve column names dynamically — Excel column headers may contain newlines
    // that get rendered/parsed differently. Find the actual keys present in the data.
    const sampleRow = swscRows[0] || rows[0] || {};
    const allKeys = Object.keys(sampleRow);
    const findKey = (...needles) => {
      for (const k of allKeys) {
        const norm = k.replace(/\s+/g, ' ').toLowerCase().trim();
        if (needles.some((n) => norm === n.toLowerCase() || norm.startsWith(n.toLowerCase()))) {
          return k;
        }
      }
      return null;
    };
    const KEY_COMP_TYPE = findKey('component type');
    const KEY_SUBTYPE = findKey('component (subtype', 'component (subtype, material');
    const KEY_ROOM_ID = findKey('roomid');
    const KEY_ROOM_LOC = findKey('room / location', 'room /');
    const KEY_GROUP = findKey('group');
    const KEY_GRADE = findKey('2025 condition grade');
    const KEY_BASELIFE = findKey('baselife');
    const KEY_CRIT = findKey('component criticality');
    const KEY_LOS = findKey('level of service');
    const KEY_PRICE = findKey('price per unit (2025)', 'price per unit');
    const KEY_QTY_2025 = findKey('2025 qty');
    const KEY_QTY = findKey('qty');
    const KEY_UNIT = findKey('unit');
    const KEY_REMAIN = findKey('remaining life (years)', 'remaining life');

    // 2. Build authoritative map from spreadsheet
    const authoritative = new Map();
    for (const row of swscRows) {
      const roomId = TRIM(row[KEY_ROOM_ID]);
      const compType = TRIM(row[KEY_COMP_TYPE]);
      const subtype = TRIM(row[KEY_SUBTYPE]);
      if (!roomId || !compType) continue;
      const key = buildKey(roomId, compType, subtype);

      const grade = NUM(row[KEY_GRADE]);
      const baselife = NUM(row[KEY_BASELIFE]);
      const criticality = NUM(row[KEY_CRIT]);
      const los = NUM(row[KEY_LOS]);
      const priceUnit = NUM(row[KEY_PRICE]);
      const qty = NUM(row[KEY_QTY_2025]) || NUM(row[KEY_QTY]);
      const remainingLife = NUM(row[KEY_REMAIN]);

      authoritative.set(key, {
        room_id: roomId,
        room: TRIM(row[KEY_ROOM_LOC]),
        group: TRIM(row[KEY_GROUP]),
        component_type: compType,
        component_subtype: subtype,
        condition_grade: grade,
        health_score: gradeToHealth(grade),
        baselife_years: baselife,
        criticality,
        level_of_service: los,
        price_per_unit: priceUnit,
        qty,
        unit: TRIM(row[KEY_UNIT]),
        remaining_life_years: remainingLife,
        replacement_value: priceUnit && qty ? priceUnit * qty : null,
        unit_label: TRIM(row[KEY_UNIT]),
      });
    }

    // 3. Load all SWSC Equipment from DB
    const allEquipment = await base44.asServiceRole.entities.Equipment.list(null, 5000);
    const swscEquipment = allEquipment.filter((eq) => {
      const fac = TRIM(eq.specifications?.facility).toLowerCase();
      return fac === SWSC_LOCATION_NAME.toLowerCase() ||
             fac === 'southwest sports centre' ||
             TRIM(eq.location).toLowerCase() === SWSC_LOCATION_NAME.toLowerCase();
    });

    // 4. Build DB lookup by same key
    const dbByKey = new Map();
    for (const eq of swscEquipment) {
      const roomId = TRIM(eq.specifications?.room_id || eq.room?.match(/^R\d+/)?.[0]);
      const compType = TRIM(eq.specifications?.component_type);
      const subtype = TRIM(eq.specifications?.component_subtype);
      if (!roomId || !compType) continue;
      const key = buildKey(roomId, compType, subtype);
      if (!dbByKey.has(key)) dbByKey.set(key, []);
      dbByKey.get(key).push(eq);
    }

    // 5. Compare
    const missingInDb = [];
    const fieldMismatches = [];

    for (const [key, src] of authoritative) {
      const matches = dbByKey.get(key);
      if (!matches || matches.length === 0) {
        missingInDb.push({ key, ...src });
        continue;
      }
      // Use the first match for comparison
      const eq = matches[0];
      const diffs = [];
      const cmp = (label, current, expected) => {
        if (expected == null) return;
        if (current == null || Math.abs((Number(current) || 0) - Number(expected)) > 0.5) {
          diffs.push({ field: label, current, expected });
        }
      };
      cmp('health_score', eq.health_score, src.health_score);
      cmp('criticality', eq.specifications?.criticality, src.criticality);
      cmp('baselife_years', eq.specifications?.baselife_years, src.baselife_years);
      cmp('price_per_unit', eq.specifications?.price_per_unit, src.price_per_unit);
      cmp('level_of_service', eq.specifications?.level_of_service, src.level_of_service);

      if (diffs.length > 0) {
        fieldMismatches.push({
          equipment_id: eq.id,
          equipment_name: eq.name,
          room: src.room,
          key,
          diffs,
          src,
        });
      }
    }

    // Extras: db keys not in authoritative
    const extraInDb = [];
    for (const [key, eqs] of dbByKey) {
      if (!authoritative.has(key)) {
        for (const eq of eqs) {
          extraInDb.push({
            equipment_id: eq.id,
            name: eq.name,
            room: eq.room,
            key,
            component_type: eq.specifications?.component_type,
          });
        }
      }
    }

    const summary = {
      spreadsheet_rows_swsc: swscRows.length,
      authoritative_unique_assets: authoritative.size,
      db_swsc_equipment_total: swscEquipment.length,
      db_swsc_equipment_keyed: dbByKey.size,
      missing_in_db_count: missingInDb.length,
      field_mismatches_count: fieldMismatches.length,
      extra_in_db_count: extraInDb.length,
    };

    if (action !== 'fix') {
      return Response.json({
        mode: 'audit',
        summary,
        missing_in_db: missingInDb.slice(0, 500),
        field_mismatches: fieldMismatches.slice(0, 500),
        extra_in_db: extraInDb.slice(0, 500),
      });
    }

    // 6. FIX MODE — apply corrections (capped by max_updates)
    // Find the SWSC Location id
    const locs = await base44.asServiceRole.entities.Location.filter({ name: SWSC_LOCATION_NAME }, null, 5);
    const swscLocationId = locs[0]?.id || null;

    let updatesUsed = 0;
    const created = [];
    const updated = [];
    const errors = [];

    // 6a. Update mismatches
    for (const mm of fieldMismatches) {
      if (updatesUsed >= maxUpdates) break;
      try {
        const patch = {
          health_score: mm.src.health_score,
          specifications: {
            ...(swscEquipment.find((e) => e.id === mm.equipment_id)?.specifications || {}),
            criticality: mm.src.criticality,
            baselife_years: mm.src.baselife_years,
            price_per_unit: mm.src.price_per_unit,
            level_of_service: mm.src.level_of_service,
            condition_grade: mm.src.condition_grade,
          },
        };
        await base44.asServiceRole.entities.Equipment.update(mm.equipment_id, patch);
        updated.push(mm.equipment_id);
        updatesUsed++;
      } catch (e) {
        errors.push({ id: mm.equipment_id, error: e.message });
      }
    }

    // 6b. Create missing
    for (const m of missingInDb) {
      if (updatesUsed >= maxUpdates) break;
      try {
        const newEq = await base44.asServiceRole.entities.Equipment.create({
          name: `${m.component_type} — ${m.component_subtype || ''} (${m.room_id})`.trim(),
          type: 'building',
          location: SWSC_LOCATION_NAME,
          location_id: swscLocationId,
          room: m.room,
          health_score: m.health_score,
          status: m.condition_grade >= 4 ? 'critical' : m.condition_grade >= 3 ? 'degraded' : 'operational',
          specifications: {
            facility: SWSC_LOCATION_NAME,
            room_id: m.room_id,
            group: m.group,
            component_type: m.component_type,
            component_subtype: m.component_subtype,
            condition_grade: m.condition_grade,
            baselife_years: m.baselife_years,
            criticality: m.criticality,
            level_of_service: m.level_of_service,
            price_per_unit: m.price_per_unit,
            qty: m.qty,
            unit: m.unit,
            replacement_value: m.replacement_value,
            remaining_life_years: m.remaining_life_years,
          },
        });
        created.push(newEq.id);
        updatesUsed++;
      } catch (e) {
        errors.push({ key: m.key, error: e.message });
      }
    }

    return Response.json({
      mode: 'fix',
      summary,
      actions: {
        updated_count: updated.length,
        created_count: created.length,
        errors,
        hit_limit: updatesUsed >= maxUpdates,
        remaining_to_fix: Math.max(0, fieldMismatches.length + missingInDb.length - updatesUsed),
      },
    });
  } catch (error) {
    return Response.json({ error: error.message, stack: error.stack }, { status: 500 });
  }
});