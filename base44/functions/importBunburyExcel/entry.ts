import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import * as XLSX from 'npm:xlsx';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json();
    const url = payload.file_url || "https://media.base44.com/files/public/6970c68cc08dbe7897c72f22/39d0b3dbc_Bunbury2025ConditionData-JHBRAG.xlsx";
    
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    
    const workbook = XLSX.read(arrayBuffer, { type: 'buffer' });
    const sheetName = "Bunbury-Condition";
    const sheet = workbook.Sheets[sheetName];
    
    if (!sheet) {
        return Response.json({ error: 'Sheet not found' }, { status: 400 });
    }
    
    const data = XLSX.utils.sheet_to_json(sheet);
    
    // Create the DigitalTwinModel
    const twin = await base44.asServiceRole.entities.DigitalTwinModel.create({
        name: "Bunbury 2025 Condition Scan",
        description: "Data imported from Bunbury2025ConditionData-JHBRAG.xlsx",
        model_type: "photogrammetry",
        status: "ready",
        file_url: "https://media.base44.com/images/public/6970c68cc08dbe7897c72f22/015a5218f_colorplan_001.jpg",
        preview_image_url: "https://media.base44.com/images/public/6970c68cc08dbe7897c72f22/015a5218f_colorplan_001.jpg"
    });
    
    const reports = [];
    const equipmentMap = new Map();
    
    for (const row of data.slice(0, 1000)) { // process 1000 rows
        const eqName = row['Room /\nLocation'] || row['Room / Location'] || row['Location'] || 'Unknown Area';
        const type = String(row['Component Type'] || 'other').toLowerCase();
        
        // map type to Equipment type enum if possible
        let eqType = "other";
        if (type.includes('hvac') || type.includes('air con')) eqType = 'hvac_system';
        else if (type.includes('building') || type.includes('wall') || type.includes('door')) eqType = 'building';
        
        let eqId = equipmentMap.get(eqName);
        if (!eqId) {
            const eq = await base44.asServiceRole.entities.Equipment.create({
                name: eqName,
                type: eqType,
                location: 'Bunbury',
                status: row['2025 Condition Grade'] >= 4 ? 'critical' : row['2025 Condition Grade'] === 3 ? 'degraded' : 'operational'
            });
            eqId = eq.id;
            equipmentMap.set(eqName, eqId);
        }
        
        reports.push({
            digital_twin_model_id: twin.id,
            digital_twin_model_name: twin.name,
            equipment_id: eqId,
            equipment_name: eqName,
            anomaly_type: "other",
            severity: row['2025 Condition Grade'] >= 4 ? 'critical' : row['2025 Condition Grade'] === 3 ? 'major' : 'minor',
            condition_score: Number(row['2025 Condition Grade']) || 1,
            ai_description: row['Revised Condition Description'] || String(row['Component Type'] || ''),
            review_status: 'approved'
        });
    }
    
    const chunks = [];
    for (let i = 0; i < reports.length; i += 50) {
        chunks.push(reports.slice(i, i + 50));
    }
    for (const chunk of chunks) {
        await base44.asServiceRole.entities.ConditionReport.bulkCreate(chunk);
    }
    
    return Response.json({ success: true, twin_id: twin.id, reports_count: reports.length, equipment_count: equipmentMap.size });
  } catch(e) {
    return Response.json({ error: String(e.message || e) }, { status: 500 });
  }
});