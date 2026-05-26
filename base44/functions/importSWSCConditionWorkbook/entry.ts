import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import * as XLSX from 'npm:xlsx@0.18.5';

const FILE_URL = 'https://media.base44.com/files/public/6a0a6a5d4d043b0e41a16d90/0b413e9da_Bunbury2025ConditionData-JHBRAG.xlsx';
const PORTALS = [
  { clientId: '6a0fb3de1b2d3b266ab40d62', name: 'Bunbury Council' },
  { clientId: '6a0fb3de1b2d3b266ab40d63', name: 'Council Demo' },
];

function cleanKey(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function normalize(value) {
  return cleanKey(value).toLowerCase();
}

function pick(row, names) {
  const keys = Object.keys(row || {});
  for (const name of names) {
    const found = keys.find((key) => normalize(key) === normalize(name));
    if (found && row[found] !== undefined && row[found] !== null && row[found] !== '') return row[found];
  }
  return null;
}

function numberOrNull(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function isoDate(value) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
}

function roomParts(roomLocation, fallbackRoom) {
  const text = cleanKey(roomLocation || fallbackRoom || 'Unknown Room');
  const match = text.match(/^(R\d+)/i);
  const roomCode = cleanKey(fallbackRoom || match?.[1] || 'R00');
  const roomName = cleanKey(text.replace(/^R\d+\s*\/\s*/i, '') || text);
  return { roomCode, roomName, roomLocation: text };
}

function toGroup(value) {
  const allowed = new Set(['Air Con','Bathroom','Ceiling','Door','Electrical','External','Floor','Garden','Hot Water','Internal','Kitchen','Laundry','Roof','Services','Window','Plumbing','Structural','Fire','Security','Other']);
  const text = cleanKey(value);
  return allowed.has(text) ? text : 'Other';
}

function toUnit(value) {
  const text = cleanKey(value).replace('m2', 'm²');
  const allowed = new Set(['each','m²','lin.m','m³','kg','set','lot']);
  if (allowed.has(text)) return text;
  if (['pce', 'pcs', 'item', ''].includes(text.toLowerCase())) return 'each';
  return 'each';
}

function severityFromGrade(grade) {
  const n = Number(grade);
  if (n >= 5) return 'critical';
  if (n >= 4) return 'major';
  if (n >= 3) return 'moderate';
  return 'minor';
}

function anomalyFromText(text) {
  const s = normalize(text);
  if (s.includes('rust') || s.includes('corrosion')) return 'corrosion';
  if (s.includes('water') || s.includes('stain') || s.includes('mark')) return 'water_damage';
  if (s.includes('crack')) return 'crack';
  if (s.includes('dent')) return 'dent';
  if (s.includes('broken')) return 'broken_part';
  if (s.includes('missing')) return 'missing_part';
  if (s.includes('wear')) return 'wear';
  if (s.includes('graffiti')) return 'graffiti';
  return 'other';
}

function isUrl(value) {
  const text = cleanKey(value);
  return /^https?:\/\//i.test(text);
}

function sheetRowsWithLinks(workbook, sheetName) {
  const sheet = workbook.Sheets[sheetName];
  if (!sheet) return [];
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: null });
  const range = XLSX.utils.decode_range(sheet['!ref'] || 'A1:A1');
  const header = [];
  for (let c = range.s.c; c <= range.e.c; c++) {
    const cell = sheet[XLSX.utils.encode_cell({ r: range.s.r, c })];
    header[c] = cleanKey(cell?.v || `col_${c}`);
  }
  return rows.map((row, index) => {
    const links = [];
    const excelRow = index + range.s.r + 2;
    for (let c = range.s.c; c <= range.e.c; c++) {
      const cell = sheet[XLSX.utils.encode_cell({ r: excelRow - 1, c })];
      const link = cell?.l?.Target || cell?.l?.target;
      const visible = cell?.v;
      const key = header[c];
      if (isUrl(link)) links.push(link);
      if (/photo|hyperlink|image/i.test(key || '') && isUrl(visible)) links.push(visible);
    }
    return { row, sourceRow: excelRow, links: [...new Set(links)] };
  });
}

async function upsertOne(entityApi, filter, data) {
  const existing = await entityApi.filter(filter, '-created_date', 1);
  if (existing?.[0]) return await entityApi.update(existing[0].id, data);
  return await entityApi.create(data);
}

async function bulkCreateOrUpdate(entityApi, records, keyField, clientPrefix) {
  const existingRows = await entityApi.list('-created_date', 5000);
  const existingByKey = new Map();
  for (const row of existingRows || []) {
    const key = row?.[keyField];
    if (key && (!clientPrefix || String(key).startsWith(clientPrefix))) {
      existingByKey.set(key, row);
    }
  }

  const toCreate = [];
  let updated = 0;
  for (const record of records) {
    const existing = existingByKey.get(record[keyField]);
    if (existing?.id) {
      await entityApi.update(existing.id, record);
      updated++;
    } else {
      toCreate.push(record);
    }
  }

  let created = 0;
  for (let i = 0; i < toCreate.length; i += 50) {
    const chunk = toCreate.slice(i, i + 50);
    if (chunk.length) {
      await entityApi.bulkCreate(chunk);
      created += chunk.length;
    }
  }
  return { created, updated };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });

    const payload = await req.json().catch(() => ({}));
    const fileUrl = payload.file_url || FILE_URL;
    const response = await fetch(fileUrl);
    const workbook = XLSX.read(await response.arrayBuffer(), { type: 'array', cellDates: true, cellStyles: false });

    const buildingSheet = XLSX.utils.sheet_to_json(workbook.Sheets['Building Information'] || {}, { defval: null });
    const swscInfo = buildingSheet.find((r) => Number(pick(r, ['col_3', 'Building ID'])) === 1941) || {};
    const buildingName = cleanKey(pick(swscInfo, ['col_4', 'Building Name:']) || 'South West Sports Centre');
    const address = cleanKey(pick(swscInfo, ['col_5', 'Address:']) || '1 Rotary Ave, Bunbury');
    const buildingType = cleanKey(pick(swscInfo, ['col_6', 'Building Type:']) || 'Sports Pavilion');
    const internalArea = numberOrNull(pick(swscInfo, ['col_8', 'Internal Area (m2):']));
    const assessmentDate = isoDate(pick(swscInfo, ['col_1', 'Date of Assessment:'])) || '2025-05-20';
    const assessorName = cleanKey(pick(swscInfo, ['col_2', 'Assessor:']) || 'Stuart Sutherland & Dale Smith');

    const componentRows = sheetRowsWithLinks(workbook, 'Bunbury-Condition')
      .filter(({ row }) => Number(pick(row, ['BLD ID#'])) === 1941);
    const defectRows = sheetRowsWithLinks(workbook, 'Defect Reponses')
      .filter(({ row }) => String(pick(row, ['RoomID', 'Room / Location']) || '').trim());

    const summary = { portals: [], source_components: componentRows.length, source_defects: defectRows.length };

    for (const portal of PORTALS) {
      const locations = await base44.asServiceRole.entities.Location.filter({ name: 'Southwest Sports Centre', client_account_id: portal.clientId }, '-created_date', 1);
      const fallbackLocations = await base44.asServiceRole.entities.Location.filter({ name: 'Southwest Sports Centre' }, '-created_date', 1);
      const location = locations?.[0] || fallbackLocations?.[0] || await base44.asServiceRole.entities.Location.create({
        name: 'Southwest Sports Centre', code: 'SWSC', address, city: 'Bunbury', client_name: portal.name, client_account_id: portal.clientId, location_type: 'facility', status: 'active'
      });

      const assessment = await upsertOne(base44.asServiceRole.entities.ConditionAssessment, {
        client_account_id: portal.clientId,
        location_id: location.id,
        assessment_year: 2025,
      }, {
        title: `${buildingName} - 2025 Condition Assessment`,
        location_id: location.id,
        location_name: location.name,
        client_account_id: portal.clientId,
        assessment_year: 2025,
        assessment_date: assessmentDate,
        assessor_name: assessorName,
        assessor_company: 'Lycopodium',
        building_type: buildingType,
        building_address: address,
        internal_area_sqm: internalArea,
        forecast_years: 20,
        inflation_rate: 0.0533,
        status: 'draft',
        notes: 'Matched and updated from Bunbury 2025 Condition Data workbook. Original spreadsheet fields preserved on each row.'
      });

      const scans = await base44.asServiceRole.entities.DigitalTwinModel.filter({ client_account_id: portal.clientId, location_name: 'Southwest Sports Centre' }, '-created_date', 5);
      const scan = scans.find((s) => /matterport|southwest/i.test(s.name || '')) || scans[0];

      const roomMap = new Map();
      const componentRecords = [];
      const scanFrames = [];
      const conditionReports = [];
      let imageIndex = 0;

      for (const { row, sourceRow, links } of componentRows) {
        const { roomCode, roomName, roomLocation } = roomParts(pick(row, ['Room / Location', 'Room /\nLocation']), pick(row, ['RoomID']));
        if (!roomMap.has(roomCode)) {
          const room = await upsertOne(base44.asServiceRole.entities.AssessmentRoom, { assessment_id: assessment.id, room_code: roomCode }, {
            assessment_id: assessment.id,
            room_code: roomCode,
            name: roomName,
            level_of_service: numberOrNull(pick(row, ['Level of Service'])),
            average_condition: numberOrNull(pick(row, ['2025 Condition Grade'])),
            notes: roomLocation,
          });
          roomMap.set(roomCode, room);
        }
        const room = roomMap.get(roomCode);
        const componentType = cleanKey(pick(row, ['Component Type', 'Component\nType']));
        const subtype = cleanKey(pick(row, ['Component (Subtype, Material , Size, Dimensions)', 'Component\n(Subtype, Material , Size, Dimensions)']));
        const grade = numberOrNull(pick(row, ['2025 Condition Grade']));
        const qty = numberOrNull(pick(row, ['2025 Qty', 'Qty'])) || 0;
        const unitRate = numberOrNull(pick(row, ['Price Per Unit', 'Price per unit (2025)'])) || 0;
        const importKey = `${portal.clientId}:SWSC:component:${sourceRow}:${roomCode}:${componentType}:${subtype}`;

        componentRecords.push({
          assessment_id: assessment.id,
          room_id: room.id,
          room_code: roomCode,
          room_name: roomName,
          component_type: componentType || 'Unknown Component',
          group: toGroup(pick(row, ['Group'])),
          subtype,
          material: subtype,
          quantity: qty,
          unit: toUnit(pick(row, ['Unit'])),
          base_replacement_cost: qty * unitRate,
          useful_life_years: numberOrNull(pick(row, ['Baselife'])),
          condition_grade_baseline: numberOrNull(pick(row, ['Condition Grade', '2017 Condition Grade', '2015_Condition Grade'])),
          baseline_year: 2017,
          condition_grade_current: grade,
          criticality: numberOrNull(pick(row, ['Component Criticality'])),
          photos: links,
          notes: cleanKey(pick(row, ['Revised Condition Description', 'Comments', 'Condition'])),
          spreadsheet_fields: row,
          source_sheet: 'Bunbury-Condition',
          source_row_number: sourceRow,
          import_key: importKey,
        });

        if (scan?.id && links.length > 0) {
          for (const link of links) {
            const frameKey = `${portal.clientId}:SWSC:frame:${sourceRow}:${imageIndex}`;
            scanFrames.push({
              digital_twin_model_id: scan.id,
              digital_twin_model_name: scan.name,
              frame_index: imageIndex++,
              angle_label: `${roomCode} ${componentType}`.trim(),
              image_url: link,
              room_code: roomCode,
              room_name: roomName,
              component_type: componentType,
              analysis_status: 'completed',
              findings_count: 1,
              spreadsheet_fields: row,
              source_sheet: 'Bunbury-Condition',
              source_row_number: sourceRow,
              import_key: frameKey,
            });
            conditionReports.push({
              digital_twin_model_id: scan.id,
              digital_twin_model_name: scan.name,
              image_url: link,
              anomaly_type: anomalyFromText(pick(row, ['Revised Condition Description', 'Comments', 'Component Type'])),
              severity: severityFromGrade(grade),
              condition_score: grade || 3,
              ai_confidence: 100,
              ai_description: cleanKey(pick(row, ['Revised Condition Description']) || `${componentType} - ${subtype}`),
              ai_model_version: 'swsc-workbook-import-v1',
              review_status: 'approved',
              reviewer_notes: `Matched from spreadsheet row ${sourceRow} (${roomCode} / ${componentType}).`,
              used_for_training: false,
              spreadsheet_fields: row,
              source_sheet: 'Bunbury-Condition',
              source_row_number: sourceRow,
              import_key: `${portal.clientId}:SWSC:report:${sourceRow}:${link}`,
            });
          }
        }
      }

      const clientPrefix = `${portal.clientId}:SWSC:`;
      const componentResult = await bulkCreateOrUpdate(base44.asServiceRole.entities.AssessmentComponent, componentRecords, 'import_key', clientPrefix);
      const frameResult = await bulkCreateOrUpdate(base44.asServiceRole.entities.ScanFrame, scanFrames, 'import_key', clientPrefix);
      const reportResult = await bulkCreateOrUpdate(base44.asServiceRole.entities.ConditionReport, conditionReports, 'import_key', clientPrefix);

      const defects = [];
      for (const { row, sourceRow, links } of defectRows) {
        const { roomCode, roomName } = roomParts(pick(row, ['Room / Location']), pick(row, ['RoomID']));
        const defectId = cleanKey(pick(row, ['DEFECT ID']) || `SWSC-${sourceRow}`);
        defects.push({
          assessment_id: assessment.id,
          room_id: roomMap.get(roomCode)?.id || '',
          room_code: roomCode,
          room_name: roomName,
          defect_id: defectId,
          description: cleanKey(pick(row, ['DEFECT Description']) || defectId),
          recommended_action: cleanKey(pick(row, ['DEFECT Rectification'])),
          photo_url: links[0] || '',
          photos: links,
          rectification_cost: numberOrNull(pick(row, ['Factored Cost (based on Talis report)', 'Factored Cost', 'Repair cost'])),
          severity: normalize(pick(row, ['Prioirty', 'Priority'])) === 'high' ? 'major' : normalize(pick(row, ['Prioirty', 'Priority'])) === 'medium' ? 'moderate' : 'minor',
          status: 'open',
          notes: `Origin: ${cleanKey(pick(row, ['DEFECT Origin']))}; Year: ${cleanKey(pick(row, ['Year']))}`,
          spreadsheet_fields: row,
          source_sheet: 'Defect Reponses',
          source_row_number: sourceRow,
          import_key: `${portal.clientId}:SWSC:defect:${defectId}:${sourceRow}`,
        });
      }
      const defectResult = await bulkCreateOrUpdate(base44.asServiceRole.entities.AssessmentDefect, defects, 'import_key', clientPrefix);

      await base44.asServiceRole.entities.DigitalTwinModel.update(scan.id, {
        total_anomalies: (conditionReports.length || scan.total_anomalies || 0),
        pending_review_count: 0,
        status: 'ready',
      });

      summary.portals.push({
        portal: portal.name,
        assessment_id: assessment.id,
        scan_id: scan?.id,
        components: componentResult,
        defects: defectResult,
        scan_frames: frameResult,
        condition_reports: reportResult,
      });
    }

    await base44.asServiceRole.entities.AuditLogEntry.create({
      actor_email: user.email,
      actor_role: user.role,
      action: 'swsc.workbook.match_update',
      category: 'data',
      severity: 'notice',
      target_entity: 'ConditionAssessment',
      target_name: 'SWSC condition workbook',
      summary: `SWSC workbook matched and updated in ${summary.portals.length} portals`,
      metadata: summary,
      outcome: 'success',
    });

    return Response.json({ success: true, ...summary });
  } catch (error) {
    console.error('importSWSCConditionWorkbook error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});