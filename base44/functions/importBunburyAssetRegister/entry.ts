import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import * as XLSX from 'npm:xlsx';

/**
 * Imports the Bunbury Asset Register (2 sheets: Southwest Sports Centre, Museum/Paisley).
 * Maps each row to an Equipment record with rich specifications metadata.
 *
 * Expected payload: { file_url: string, location_map?: { [bldId]: locationName } }
 * - bldId 1941 → Southwest Sports Centre
 * - bldId 1933 → Museum, Paisley Centre
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const payload = await req.json().catch(() => ({}));
    const url = payload.file_url || 'https://media.base44.com/files/public/6970c68cc08dbe7897c72f22/f72fc69f5_BunburyAssetRegister1.xlsx';

    const response = await fetch(url);
    if (!response.ok) return Response.json({ error: `Failed to fetch file: ${response.status}` }, { status: 500 });
    const arrayBuffer = await response.arrayBuffer();

    const workbook = XLSX.read(arrayBuffer, { type: 'buffer' });

    const BLD_TO_LOCATION = {
      1941: 'Southwest Sports Centre',
      1933: 'Museum, Paisley Centre',
    };

    const get = (row, ...keys) => {
      for (const k of keys) {
        if (row[k] !== undefined && row[k] !== null && row[k] !== '') return row[k];
        // try newline variants
        const variants = [k, k.replace(/ /g, '\n'), k.replace(/ /g, '\r\n')];
        for (const v of variants) {
          if (row[v] !== undefined && row[v] !== null && row[v] !== '') return row[v];
        }
      }
      return null;
    };

    const findKey = (row, ...patterns) => {
      const keys = Object.keys(row);
      for (const p of patterns) {
        const found = keys.find(k => k.toLowerCase().replace(/[\s\n\r]+/g, ' ').trim() === p.toLowerCase());
        if (found) return found;
      }
      // fallback: substring match
      for (const p of patterns) {
        const found = keys.find(k => k.toLowerCase().replace(/[\s\n\r]+/g, ' ').includes(p.toLowerCase()));
        if (found) return found;
      }
      return null;
    };

    // Condition grade (1-5) → health_score 0-100, status
    const gradeToHealth = (g) => {
      if (!g || isNaN(g)) return null;
      const grade = Number(g);
      // 1 = excellent (100), 5 = failed (0)
      return Math.max(0, Math.round(100 - ((grade - 1) / 4) * 100));
    };
    const gradeToStatus = (g) => {
      if (!g) return 'operational';
      const grade = Number(g);
      if (grade >= 4.5) return 'critical';
      if (grade >= 3.5) return 'degraded';
      if (grade >= 2.5) return 'operational';
      return 'operational';
    };
    const gradeToRisk = (g) => {
      if (!g) return 'low';
      const grade = Number(g);
      if (grade >= 4.5) return 'critical';
      if (grade >= 3.5) return 'high';
      if (grade >= 2.5) return 'medium';
      return 'low';
    };
    const criticalityToLevel = (c) => {
      if (!c) return 'medium';
      const v = Number(c);
      if (v >= 4) return 'mission_critical';
      if (v >= 3) return 'high';
      if (v >= 2) return 'medium';
      return 'low';
    };

    let totalImported = 0;
    const sheetSummaries = [];
    const errors = [];

    const onlySheet = payload.only_sheet; // optional: filter to one sheet
    const startRow = Number(payload.start_row) || 0; // optional: skip first N rows of each sheet

    for (const sheetName of workbook.SheetNames) {
      if (onlySheet && sheetName !== onlySheet) continue;
      const sheet = workbook.Sheets[sheetName];
      let rows = XLSX.utils.sheet_to_json(sheet, { defval: null });
      if (!rows.length) continue;
      if (startRow > 0) rows = rows.slice(startRow);

      // Detect column keys for this sheet (column names vary slightly across sheets)
      const sample = rows[0];
      const K = {
        bldId: findKey(sample, 'BLD ID#', 'BLD ID'),
        group: findKey(sample, 'Group'),
        groupId: findKey(sample, 'GroupID'),
        compType: findKey(sample, 'Component Type'),
        compSubtype: findKey(sample, 'Component (Subtype, Material , Size, Dimensions)', 'Component'),
        roomLoc: findKey(sample, 'Room / Location', 'Location'),
        roomId: findKey(sample, 'RoomID'),
        condGrade: findKey(sample, '2025 Condition Grade', '2026 Condition Grade', 'Condition Grade'),
        baseGrade: findKey(sample, 'Condition Grade'),
        condDesc: findKey(sample, 'Revised Condition Description'),
        lifeConsumed: findKey(sample, 'Life Consumed'),
        condition: findKey(sample, 'Condition'),
        qty: findKey(sample, '2025 Qty', 'Qty'),
        unit: findKey(sample, 'Unit'),
        baselife: findKey(sample, 'Baselife'),
        criticality: findKey(sample, 'Component Criticality'),
        levelOfService: findKey(sample, 'Level of Service'),
        pricePerUnit: findKey(sample, 'Price Per Unit'),
        defectCost: findKey(sample, 'Defect Cost'),
        defectUrgency: findKey(sample, 'Defect Urgency'),
        defectResponse: findKey(sample, 'Defect Response (Year)'),
        action: findKey(sample, 'Action'),
        description: findKey(sample, 'Description'),
        comments: findKey(sample, 'Comments'),
        compCode: findKey(sample, 'Component Code'),
        code: findKey(sample, 'Code'),
      };

      const equipmentBatch = [];

      for (const row of rows) {
        const bldId = K.bldId ? row[K.bldId] : null;
        const compType = K.compType ? row[K.compType] : null;
        const compSubtype = K.compSubtype ? row[K.compSubtype] : null;

        // Skip empty/junk rows
        if (!compType && !compSubtype) continue;

        const locationName = (bldId && BLD_TO_LOCATION[bldId]) || sheetName;
        const roomLoc = K.roomLoc ? row[K.roomLoc] : null;
        const group = K.group ? row[K.group] : null;

        const name = [compType, compSubtype].filter(Boolean).join(' — ') || 'Unnamed component';
        const grade = K.condGrade ? row[K.condGrade] : (K.baseGrade ? row[K.baseGrade] : null);
        const qty = K.qty ? row[K.qty] : null;
        const pricePerUnit = K.pricePerUnit ? row[K.pricePerUnit] : null;
        const replacementValue = (qty && pricePerUnit) ? Number(qty) * Number(pricePerUnit) : null;

        const tags = [];
        if (group) tags.push(String(group));
        if (compType) tags.push(String(compType));
        if (locationName) tags.push(locationName);

        // Normalize room: strip leading "R01/" code prefix if present
        const roomClean = roomLoc ? String(roomLoc).replace(/^R\d+\s*\/\s*/i, '').trim() : null;

        const eq = {
          name: `${name}${roomClean ? ` (${roomClean})` : ''}`.slice(0, 250),
          type: 'building',
          location: locationName,
          room: roomClean,
          status: gradeToStatus(grade),
          risk_level: gradeToRisk(grade),
          health_score: gradeToHealth(grade),
          criticality: criticalityToLevel(K.criticality ? row[K.criticality] : null),
          tags,
          specifications: {
            bld_id: bldId,
            facility: locationName,
            group,
            component_type: compType,
            component_subtype: compSubtype,
            room_location: roomLoc,
            room_id: K.roomId ? row[K.roomId] : null,
            condition_grade: grade,
            condition: K.condition ? row[K.condition] : null,
            condition_description: K.condDesc ? row[K.condDesc] : null,
            life_consumed: K.lifeConsumed ? row[K.lifeConsumed] : null,
            quantity: qty,
            unit: K.unit ? row[K.unit] : null,
            baselife_years: K.baselife ? row[K.baselife] : null,
            criticality_score: K.criticality ? row[K.criticality] : null,
            level_of_service: K.levelOfService ? row[K.levelOfService] : null,
            price_per_unit: pricePerUnit,
            replacement_value: replacementValue,
            defect_cost: K.defectCost ? row[K.defectCost] : null,
            defect_urgency: K.defectUrgency ? row[K.defectUrgency] : null,
            defect_response_year: K.defectResponse ? row[K.defectResponse] : null,
            action: K.action ? row[K.action] : null,
            description: K.description ? row[K.description] : null,
            comments: K.comments ? row[K.comments] : null,
            component_code: K.compCode ? row[K.compCode] : null,
            code: K.code ? row[K.code] : null,
          },
        };

        equipmentBatch.push(eq);
      }

      // Bulk insert in chunks of 50, with a small delay to avoid rate limits
      let imported = 0;
      for (let i = 0; i < equipmentBatch.length; i += 50) {
        const chunk = equipmentBatch.slice(i, i + 50);
        let attempt = 0;
        while (attempt < 3) {
          try {
            await base44.asServiceRole.entities.Equipment.bulkCreate(chunk);
            imported += chunk.length;
            break;
          } catch (e) {
            attempt++;
            if (String(e.message || e).includes('Rate limit') && attempt < 3) {
              await new Promise(r => setTimeout(r, 2000 * attempt));
            } else {
              errors.push({ sheet: sheetName, chunk_start: i, error: String(e.message || e) });
              break;
            }
          }
        }
        // small pause between chunks to be gentle
        await new Promise(r => setTimeout(r, 250));
      }

      totalImported += imported;
      sheetSummaries.push({ sheet: sheetName, rows_total: rows.length, imported });
    }

    return Response.json({
      success: true,
      total_imported: totalImported,
      sheets: sheetSummaries,
      errors,
    });
  } catch (e) {
    return Response.json({ error: String(e.message || e), stack: e.stack }, { status: 500 });
  }
});