import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  const startTime = Date.now();
  
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await req.json();
    const { csv_content, file_name, column_mapping } = body;
    
    if (!csv_content) {
      return Response.json({ error: 'Missing csv_content' }, { status: 400 });
    }
    
    // Parse CSV
    const lines = csv_content.trim().split('\n');
    if (lines.length < 2) {
      return Response.json({ error: 'CSV must have header and at least one data row' }, { status: 400 });
    }
    
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/"/g, ''));
    
    // Default column mapping or use provided
    const mapping = column_mapping || {
      equipment_id: headers.find(h => h.includes('equipment') && h.includes('id')) || headers.find(h => h === 'equipment_id') || 'equipment_id',
      sensor_type: headers.find(h => h.includes('sensor') && h.includes('type')) || headers.find(h => h === 'sensor_type') || 'sensor_type',
      value: headers.find(h => h === 'value' || h === 'reading') || 'value',
      timestamp: headers.find(h => h.includes('timestamp') || h.includes('time') || h.includes('date')) || 'timestamp',
      unit: headers.find(h => h === 'unit') || 'unit'
    };
    
    const results = {
      received: lines.length - 1,
      processed: 0,
      failed: 0,
      errors: [],
      equipment_ids: new Set(),
      sensor_types: new Set()
    };
    
    // Process each row
    for (let i = 1; i < lines.length; i++) {
      try {
        const values = parseCSVLine(lines[i]);
        if (values.length === 0 || values.every(v => !v.trim())) continue;
        
        const row = {};
        headers.forEach((header, idx) => {
          row[header] = values[idx]?.trim().replace(/"/g, '');
        });
        
        const equipment_id = row[mapping.equipment_id];
        const sensor_type = row[mapping.sensor_type];
        const value = parseFloat(row[mapping.value]);
        const timestamp = row[mapping.timestamp] || new Date().toISOString();
        const unit = row[mapping.unit];
        
        if (!equipment_id || !sensor_type || isNaN(value)) {
          results.failed++;
          results.errors.push(`Row ${i + 1}: Missing required fields (equipment_id="${equipment_id}", sensor_type="${sensor_type}", value="${row[mapping.value]}")`);
          continue;
        }
        
        // Lookup equipment
        let resolvedEquipmentId = equipment_id;
        
        // Check if it's a valid UUID format or need to lookup
        if (!equipment_id.match(/^[a-f0-9-]{36}$/i)) {
          // Try to find by name or serial number
          const equipmentList = await base44.entities.Equipment.filter({ name: equipment_id });
          if (equipmentList.length > 0) {
            resolvedEquipmentId = equipmentList[0].id;
          } else {
            const bySerial = await base44.entities.Equipment.filter({ serial_number: equipment_id });
            if (bySerial.length > 0) {
              resolvedEquipmentId = bySerial[0].id;
            } else {
              results.failed++;
              results.errors.push(`Row ${i + 1}: Equipment not found: "${equipment_id}"`);
              continue;
            }
          }
        }
        
        // Get thresholds from sensor configuration if exists
        let threshold_min, threshold_max;
        const sensorConfigs = await base44.entities.SensorConfiguration.filter({
          equipment_id: resolvedEquipmentId,
          sensor_type: sensor_type
        });
        if (sensorConfigs.length > 0) {
          threshold_min = sensorConfigs[0].threshold_min;
          threshold_max = sensorConfigs[0].threshold_max;
        }
        
        // Check anomaly
        let isAnomaly = false;
        let anomalyScore = 0;
        if (threshold_min !== undefined && threshold_min !== null && value < threshold_min) {
          isAnomaly = true;
          const denom = Math.abs(threshold_min) || 1;
          anomalyScore = Math.min(100, Math.abs((threshold_min - value) / denom) * 100);
        }
        if (threshold_max !== undefined && threshold_max !== null && value > threshold_max) {
          isAnomaly = true;
          const denom = Math.abs(threshold_max) || 1;
          anomalyScore = Math.min(100, Math.abs((value - threshold_max) / denom) * 100);
        }
        
        await base44.entities.SensorReading.create({
          equipment_id: resolvedEquipmentId,
          sensor_type,
          value,
          unit,
          timestamp,
          threshold_min,
          threshold_max,
          is_anomaly: isAnomaly,
          anomaly_score: anomalyScore
        });
        
        // Update sensor config last reading
        if (sensorConfigs.length > 0) {
          await base44.entities.SensorConfiguration.update(sensorConfigs[0].id, {
            last_reading_at: new Date().toISOString(),
            last_reading_value: value,
            status: 'online'
          });
        }
        
        results.processed++;
        results.equipment_ids.add(resolvedEquipmentId);
        results.sensor_types.add(sensor_type);
        
      } catch (rowError) {
        results.failed++;
        results.errors.push(`Row ${i + 1}: ${rowError.message}`);
      }
    }
    
    // Log the import
    await base44.entities.DataIngestionLog.create({
      source: 'csv_import',
      status: results.failed === 0 ? 'success' : results.processed > 0 ? 'partial' : 'failed',
      records_received: results.received,
      records_processed: results.processed,
      records_failed: results.failed,
      equipment_ids: Array.from(results.equipment_ids),
      sensor_types: Array.from(results.sensor_types),
      error_message: results.errors.length > 0 ? results.errors.slice(0, 5).join('; ') : null,
      processing_time_ms: Date.now() - startTime,
      file_name
    });
    
    return Response.json({
      success: true,
      received: results.received,
      processed: results.processed,
      failed: results.failed,
      errors: results.errors.slice(0, 20),
      processing_time_ms: Date.now() - startTime
    });
    
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}