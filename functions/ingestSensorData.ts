import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  const startTime = Date.now();
  
  try {
    const base44 = createClientFromRequest(req);
    
    // This endpoint can be called with or without auth for webhook/IoT scenarios
    // For production, you'd want to validate an API key from headers
    const apiKey = req.headers.get('x-api-key');
    
    const body = await req.json();
    const { readings, equipment_external_id, sensor_external_id, batch_id } = body;
    
    // Validate input
    if (!readings || !Array.isArray(readings)) {
      return Response.json({ 
        error: 'Invalid payload. Expected { readings: [...] }' 
      }, { status: 400 });
    }
    
    const results = {
      received: readings.length,
      processed: 0,
      failed: 0,
      errors: [],
      equipment_ids: new Set(),
      sensor_types: new Set()
    };
    
    // Process each reading
    for (const reading of readings) {
      try {
        const {
          equipment_id,
          sensor_type,
          value,
          unit,
          timestamp,
          threshold_min,
          threshold_max,
          external_equipment_id,
          external_sensor_id
        } = reading;
        
        // Determine equipment_id - either direct or lookup by external ID
        let resolvedEquipmentId = equipment_id;
        
        if (!resolvedEquipmentId && (external_equipment_id || equipment_external_id)) {
          // Look up equipment by external ID or serial number
          const extId = external_equipment_id || equipment_external_id;
          const equipmentList = await base44.asServiceRole.entities.Equipment.filter({ 
            serial_number: extId 
          });
          if (equipmentList.length > 0) {
            resolvedEquipmentId = equipmentList[0].id;
          }
        }
        
        if (!resolvedEquipmentId || !sensor_type || value === undefined) {
          results.failed++;
          results.errors.push(`Missing required fields for reading: ${JSON.stringify(reading).slice(0, 100)}`);
          continue;
        }
        
        // Check if value exceeds thresholds
        let isAnomaly = false;
        let anomalyScore = 0;
        
        if (threshold_min !== undefined && value < threshold_min) {
          isAnomaly = true;
          anomalyScore = Math.min(100, Math.abs((threshold_min - value) / threshold_min) * 100);
        }
        if (threshold_max !== undefined && value > threshold_max) {
          isAnomaly = true;
          anomalyScore = Math.min(100, Math.abs((value - threshold_max) / threshold_max) * 100);
        }
        
        // Create sensor reading
        await base44.asServiceRole.entities.SensorReading.create({
          equipment_id: resolvedEquipmentId,
          sensor_type,
          value,
          unit: unit || getDefaultUnit(sensor_type),
          timestamp: timestamp || new Date().toISOString(),
          threshold_min,
          threshold_max,
          is_anomaly: isAnomaly,
          anomaly_score: anomalyScore
        });
        
        results.processed++;
        results.equipment_ids.add(resolvedEquipmentId);
        results.sensor_types.add(sensor_type);
        
        // If anomaly detected, create an alert
        if (isAnomaly && anomalyScore > 30) {
          const equipment = await base44.asServiceRole.entities.Equipment.filter({ id: resolvedEquipmentId });
          const equipmentName = equipment.length > 0 ? equipment[0].name : 'Unknown Equipment';
          
          await base44.asServiceRole.entities.Alert.create({
            equipment_id: resolvedEquipmentId,
            title: `${sensor_type} threshold exceeded on ${equipmentName}`,
            message: `${sensor_type} reading of ${value} ${unit || ''} exceeded configured thresholds`,
            severity: anomalyScore > 70 ? 'critical' : anomalyScore > 50 ? 'warning' : 'info',
            type: 'threshold_exceeded',
            triggered_value: value,
            threshold_value: value > (threshold_max || Infinity) ? threshold_max : threshold_min,
            sensor_type,
            status: 'active'
          });
        }
        
        // Update sensor configuration last reading
        if (external_sensor_id || sensor_external_id) {
          const sensorId = external_sensor_id || sensor_external_id;
          const sensorConfigs = await base44.asServiceRole.entities.SensorConfiguration.filter({
            external_sensor_id: sensorId
          });
          if (sensorConfigs.length > 0) {
            await base44.asServiceRole.entities.SensorConfiguration.update(sensorConfigs[0].id, {
              last_reading_at: new Date().toISOString(),
              last_reading_value: value,
              status: 'online'
            });
          }
        }
        
      } catch (readingError) {
        results.failed++;
        results.errors.push(readingError.message);
      }
    }
    
    // Log the ingestion
    await base44.asServiceRole.entities.DataIngestionLog.create({
      source: apiKey ? 'api' : 'webhook',
      status: results.failed === 0 ? 'success' : results.processed > 0 ? 'partial' : 'failed',
      records_received: results.received,
      records_processed: results.processed,
      records_failed: results.failed,
      equipment_ids: Array.from(results.equipment_ids),
      sensor_types: Array.from(results.sensor_types),
      error_message: results.errors.length > 0 ? results.errors.slice(0, 5).join('; ') : null,
      processing_time_ms: Date.now() - startTime
    });
    
    return Response.json({
      success: true,
      received: results.received,
      processed: results.processed,
      failed: results.failed,
      errors: results.errors.slice(0, 10),
      processing_time_ms: Date.now() - startTime
    });
    
  } catch (error) {
    return Response.json({ 
      error: error.message,
      success: false 
    }, { status: 500 });
  }
});

function getDefaultUnit(sensorType) {
  const units = {
    vibration: 'mm/s',
    temperature: '°C',
    pressure: 'bar',
    current: 'A',
    voltage: 'V',
    flow_rate: 'L/min',
    rpm: 'RPM',
    humidity: '%',
    noise_level: 'dB',
    strain: 'με',
    displacement: 'mm',
    crack_width: 'mm',
    tilt: '°',
    acceleration: 'm/s²',
    moisture: '%',
    wind_speed: 'm/s',
    water_level: 'm'
  };
  return units[sensorType] || '';
}