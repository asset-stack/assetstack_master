import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import * as XLSX from 'npm:xlsx';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Admin-only: this performs bulk service-role writes across the workspace.
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (user.role !== 'admin') {
      // Log the denial — non-admins attempting privileged actions is security-relevant
      try {
        await base44.asServiceRole.entities.AuditLogEntry.create({
          actor_email: user.email,
          actor_role: user.role || 'user',
          action: 'data.import',
          category: 'security',
          severity: 'warning',
          target_entity: 'Equipment',
          summary: 'Non-admin attempted to run Bunbury Excel import',
          ip_hint: req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown',
          user_agent: req.headers.get('user-agent') || 'unknown',
          outcome: 'denied',
        });
      } catch (_) {}
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

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
    const equipmentPromises = [];
    
    for (const row of data.slice(0, 1000)) { // process 1000 rows
        const eqName = row['Room /\r\nLocation'] || row['Room /\nLocation'] || row['Room / Location'] || row['Location'] || 'Unknown Area';
        const type = String(row['Component\r\nType'] || row['Component Type'] || 'other').toLowerCase();
        
        // map type to Equipment type enum if possible
        let eqType = "other";
        if (type.includes('hvac') || type.includes('air con')) eqType = 'hvac_system';
        else if (type.includes('building') || type.includes('wall') || type.includes('door')) eqType = 'building';
        
        if (!equipmentMap.has(eqName)) {
            equipmentMap.set(eqName, null); // reserve
            equipmentPromises.push((async () => {
                const eq = await base44.asServiceRole.entities.Equipment.create({
                    name: eqName,
                    type: eqType,
                    location: 'Bunbury',
                    status: row['2025 Condition Grade'] >= 4 ? 'critical' : row['2025 Condition Grade'] === 3 ? 'degraded' : 'operational'
                });
                equipmentMap.set(eqName, eq.id);
            })());
        }
    }
    
    // Execute in batches
    for (let i = 0; i < equipmentPromises.length; i += 20) {
        await Promise.all(equipmentPromises.slice(i, i + 20));
    }
    
    for (const row of data.slice(0, 1000)) { // process 1000 rows
        const eqName = row['Room /\r\nLocation'] || row['Room /\nLocation'] || row['Room / Location'] || row['Location'] || 'Unknown Area';
        const eqId = equipmentMap.get(eqName);
        
        reports.push({
            digital_twin_model_id: twin.id,
            digital_twin_model_name: twin.name,
            equipment_id: eqId,
            equipment_name: eqName,
            anomaly_type: "other",
            severity: row['2025 Condition Grade'] >= 4 ? 'critical' : row['2025 Condition Grade'] === 3 ? 'major' : 'minor',
            condition_score: Number(row['2025 Condition Grade']) || 1,
            ai_description: row['Revised Condition Description'] || String(row['Component\r\nType'] || row['Component Type'] || ''),
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
    
    // Audit log — bulk data import is a high-impact admin event
    try {
      await base44.asServiceRole.entities.AuditLogEntry.create({
        actor_email: user.email,
        actor_role: user.role,
        action: 'data.import',
        category: 'admin',
        severity: 'critical',
        target_entity: 'DigitalTwinModel',
        target_id: twin.id,
        target_name: twin.name,
        summary: `Bunbury Excel import: ${equipmentMap.size} equipment, ${reports.length} condition reports created`,
        metadata: { equipment_count: equipmentMap.size, reports_count: reports.length },
        ip_hint: req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown',
        user_agent: req.headers.get('user-agent') || 'unknown',
        outcome: 'success',
      });
    } catch (_) {}

    return Response.json({ success: true, twin_id: twin.id, reports_count: reports.length, equipment_count: equipmentMap.size });
  } catch(e) {
    return Response.json({ error: String(e.message || e) }, { status: 500 });
  }
});