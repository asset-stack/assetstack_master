import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  const startTime = Date.now();
  
  try {
    const base44 = createClientFromRequest(req);

    // Auth: require either an authenticated user OR a valid shared secret
    // (for IoT/webhook callers). Set INGEST_SECRET in env to enable shared-secret mode.
    const url = new URL(req.url);
    const providedSecret = url.searchParams.get('secret') || req.headers.get('x-ingest-secret');
    const expectedSecret = Deno.env.get('INGEST_SECRET');
    const hasValidSecret = expectedSecret && providedSecret === expectedSecret;

    if (!hasValidSecret) {
      const user = await base44.auth.me().catch(() => null);
      if (!user) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    const body = await req.json();
    const { readings, equipment_external_id, sensor_external_id, batch_id } = body;
    
    // Validate input
    if (!readings || !Array.isArray(readings) || readings.length === 0) {
      return Response.json({ 
        error: 'Invalid payload. Expected { readings: [{equipment_id, sensor_type, value}, ...] }' 
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
        
        // Determine equipment_id — either direct or lookup by external ID
        let resolvedEquipmentId = equipment_id;
        
        if (!resolvedEquipmentId && (external_equipment_id || equipment_external_id)) {
          const extId = external_equipment_id || equipment_external_id;
          const equipmentList = await base44.asServiceRole.entities.Equipment.filter({ 
            serial_number: extId 
          });
          if (equipmentList.length > 0) {
            resolvedEquipmentId = equipmentList[0].id;
          } else {
            // Try by name
            const byName = await base44.asServiceRole.entities.Equipment.filter({ name: extId });
            if (byName.length > 0) {
              resolvedEquipmentId = byName[0].id;
            }
          }
        }
        
        if (!resolvedEquipmentId || !sensor_type || value === undefined || value === null) {
          results.failed++;
          results.errors.push(`Missing required fields (equipment_id, sensor_type, value) for reading: ${JSON.stringify(reading).slice(0, 120)}`);
          continue;
        }
        
        // Look up thresholds from sensor config if not provided
        let effectiveThresholdMin = threshold_min;
        let effectiveThresholdMax = threshold_max;
        const sensorExtId = external_sensor_id || sensor_external_id;
        
        let matchedSensorConfig = null;
        if (sensorExtId) {
          const configs = await base44.asServiceRole.entities.SensorConfiguration.filter({ external_sensor_id: sensorExtId });
          if (configs.length > 0) matchedSensorConfig = configs[0];
        }
        if (!matchedSensorConfig) {
          const configs = await base44.asServiceRole.entities.SensorConfiguration.filter({ equipment_id: resolvedEquipmentId, sensor_type });
          if (configs.length > 0) matchedSensorConfig = configs[0];
        }
        
        if (matchedSensorConfig) {
          if (effectiveThresholdMin === undefined) effectiveThresholdMin = matchedSensorConfig.threshold_min;
          if (effectiveThresholdMax === undefined) effectiveThresholdMax = matchedSensorConfig.threshold_max;
        }
        
        // Check anomaly
        let isAnomaly = false;
        let anomalyScore = 0;
        
        if (effectiveThresholdMin !== undefined && effectiveThresholdMin !== null && value < effectiveThresholdMin) {
          isAnomaly = true;
          const denominator = Math.abs(effectiveThresholdMin) || 1;
          anomalyScore = Math.min(100, Math.abs((effectiveThresholdMin - value) / denominator) * 100);
        }
        if (effectiveThresholdMax !== undefined && effectiveThresholdMax !== null && value > effectiveThresholdMax) {
          isAnomaly = true;
          const denominator = Math.abs(effectiveThresholdMax) || 1;
          anomalyScore = Math.min(100, Math.abs((value - effectiveThresholdMax) / denominator) * 100);
        }
        
        // Create sensor reading
        await base44.asServiceRole.entities.SensorReading.create({
          equipment_id: resolvedEquipmentId,
          sensor_type,
          value: parseFloat(value),
          unit: unit || getDefaultUnit(sensor_type),
          timestamp: timestamp || new Date().toISOString(),
          threshold_min: effectiveThresholdMin,
          threshold_max: effectiveThresholdMax,
          is_anomaly: isAnomaly,
          anomaly_score: anomalyScore
        });
        
        results.processed++;
        results.equipment_ids.add(resolvedEquipmentId);
        results.sensor_types.add(sensor_type);
        
        // If anomaly detected, create an alert
        if (isAnomaly && anomalyScore > 30) {
          let equipmentName = 'Unknown Equipment';
          try {
            const eqList = await base44.asServiceRole.entities.Equipment.filter({ id: resolvedEquipmentId });
            if (eqList.length > 0) equipmentName = eqList[0].name;
          } catch (_) { /* ignore lookup failure */ }
          
          await base44.asServiceRole.entities.Alert.create({
            equipment_id: resolvedEquipmentId,
            title: `${sensor_type.replace(/_/g, ' ')} threshold exceeded on ${equipmentName}`,
            message: `${sensor_type.replace(/_/g, ' ')} reading of ${value} ${unit || getDefaultUnit(sensor_type)} exceeded configured thresholds`,
            severity: anomalyScore > 70 ? 'critical' : anomalyScore > 50 ? 'warning' : 'info',
            type: 'threshold_exceeded',
            triggered_value: value,
            threshold_value: value > (effectiveThresholdMax || Infinity) ? effectiveThresholdMax : effectiveThresholdMin,
            sensor_type,
            status: 'active'
          });
        }
        
        // Update sensor configuration last reading
        if (matchedSensorConfig) {
          await base44.asServiceRole.entities.SensorConfiguration.update(matchedSensorConfig.id, {
            last_reading_at: new Date().toISOString(),
            last_reading_value: parseFloat(value),
            status: 'online'
          });
        }
        
      } catch (readingError) {
        results.failed++;
        results.errors.push(readingError.message);
      }
    }
    
    // Log the ingestion
    try {
      await base44.asServiceRole.entities.DataIngestionLog.create({
        source: 'api',
        status: results.failed === 0 ? 'success' : results.processed > 0 ? 'partial' : 'failed',
        records_received: results.received,
        records_processed: results.processed,
        records_failed: results.failed,
        equipment_ids: Array.from(results.equipment_ids),
        sensor_types: Array.from(results.sensor_types),
        error_message: results.errors.length > 0 ? results.errors.slice(0, 5).join('; ') : null,
        processing_time_ms: Date.now() - startTime
      });
    } catch (_) { /* don't fail if logging fails */ }
    
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