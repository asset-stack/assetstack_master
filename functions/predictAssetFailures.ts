import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const { equipment_id } = body;
    
    // Fetch all required data
    const equipmentQuery = equipment_id 
      ? base44.asServiceRole.entities.Equipment.filter({ id: equipment_id })
      : base44.asServiceRole.entities.Equipment.list('-failure_probability', 100);
    
    const [equipment, sensorReadings, maintenanceTasks, predictions] = await Promise.all([
      equipmentQuery,
      base44.asServiceRole.entities.SensorReading.list('-created_date', 1000),
      base44.asServiceRole.entities.MaintenanceTask.list('-created_date', 500),
      base44.asServiceRole.entities.PredictionLog.list('-created_date', 200)
    ]);

    const results = [];

    for (const asset of (Array.isArray(equipment) ? equipment : [equipment])) {
      // Get asset-specific sensor readings
      const assetReadings = sensorReadings.filter(r => r.equipment_id === asset.id);
      const assetTasks = maintenanceTasks.filter(t => t.equipment_id === asset.id);
      
      // Analyze sensor patterns
      const sensorAnalysis = analyzeSensorPatterns(assetReadings, asset.type);
      
      // Analyze maintenance history
      const maintenanceAnalysis = analyzeMaintenanceHistory(assetTasks, asset);
      
      // Calculate failure indicators based on asset type
      const assetTypeFactors = getAssetTypeFactors(asset.type);
      
      // Compute weighted failure probability
      const failurePrediction = computeFailurePrediction(
        asset, 
        sensorAnalysis, 
        maintenanceAnalysis, 
        assetTypeFactors
      );

      // Generate early warnings
      const warnings = generateWarnings(failurePrediction, asset, sensorAnalysis);

      // Update equipment with new predictions
      await base44.asServiceRole.entities.Equipment.update(asset.id, {
        failure_probability: failurePrediction.probability,
        predicted_failure_date: failurePrediction.predictedDate,
        remaining_useful_life_days: failurePrediction.rulDays,
        risk_level: failurePrediction.riskLevel,
        health_score: failurePrediction.healthScore
      });

      // Log prediction
      await base44.asServiceRole.entities.PredictionLog.create({
        equipment_id: asset.id,
        prediction_type: 'failure_probability',
        model_version: 'v2.0-multiasset',
        input_features: {
          sensorMetrics: sensorAnalysis.metrics,
          maintenanceMetrics: maintenanceAnalysis.metrics,
          assetAge: maintenanceAnalysis.assetAgeDays
        },
        prediction_result: failurePrediction,
        confidence_score: failurePrediction.confidence,
        risk_factors: failurePrediction.riskFactors,
        recommendations: warnings.recommendations
      });

      results.push({
        asset_id: asset.id,
        asset_name: asset.name,
        asset_type: asset.type,
        prediction: failurePrediction,
        warnings: warnings,
        sensor_summary: sensorAnalysis.summary,
        maintenance_summary: maintenanceAnalysis.summary
      });
    }

    return Response.json({
      success: true,
      timestamp: new Date().toISOString(),
      predictions_count: results.length,
      results: results,
      high_risk_assets: results.filter(r => r.prediction.riskLevel === 'critical' || r.prediction.riskLevel === 'high')
    });

  } catch (error) {
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
});

function analyzeSensorPatterns(readings, assetType) {
  if (!readings || readings.length === 0) {
    return { 
      metrics: {}, 
      summary: 'No sensor data available',
      anomalyRate: 0,
      trendScore: 50
    };
  }

  const sensorTypes = [...new Set(readings.map(r => r.sensor_type))];
  const metrics = {};
  let totalAnomalies = 0;
  let totalReadings = readings.length;
  let degradationScore = 0;

  for (const sensorType of sensorTypes) {
    const typeReadings = readings.filter(r => r.sensor_type === sensorType);
    const values = typeReadings.map(r => r.value);
    const anomalies = typeReadings.filter(r => r.is_anomaly).length;
    
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const max = Math.max(...values);
    const min = Math.min(...values);
    const stdDev = Math.sqrt(values.reduce((sq, n) => sq + Math.pow(n - avg, 2), 0) / values.length);
    
    // Calculate trend (recent vs older readings)
    const recentReadings = typeReadings.slice(0, Math.ceil(typeReadings.length / 3));
    const olderReadings = typeReadings.slice(-Math.ceil(typeReadings.length / 3));
    const recentAvg = recentReadings.reduce((a, r) => a + r.value, 0) / recentReadings.length || 0;
    const olderAvg = olderReadings.reduce((a, r) => a + r.value, 0) / olderReadings.length || 0;
    const trendDirection = recentAvg > olderAvg ? 'increasing' : recentAvg < olderAvg ? 'decreasing' : 'stable';
    const trendMagnitude = olderAvg !== 0 ? Math.abs((recentAvg - olderAvg) / olderAvg) * 100 : 0;

    // Check threshold violations
    const thresholdViolations = typeReadings.filter(r => 
      (r.threshold_max && r.value > r.threshold_max) || 
      (r.threshold_min && r.value < r.threshold_min)
    ).length;

    metrics[sensorType] = {
      average: avg,
      max,
      min,
      stdDev,
      anomalyCount: anomalies,
      anomalyRate: (anomalies / typeReadings.length) * 100,
      trend: trendDirection,
      trendMagnitude,
      thresholdViolations,
      readingCount: typeReadings.length
    };

    totalAnomalies += anomalies;
    
    // Add to degradation score based on concerning patterns
    if (trendDirection === 'increasing' && ['vibration', 'temperature', 'crack_width', 'corrosion'].includes(sensorType)) {
      degradationScore += trendMagnitude * 2;
    }
    if (anomalies > typeReadings.length * 0.1) {
      degradationScore += 15;
    }
    if (thresholdViolations > 0) {
      degradationScore += thresholdViolations * 5;
    }
  }

  return {
    metrics,
    summary: `${sensorTypes.length} sensor types, ${totalAnomalies} anomalies detected`,
    anomalyRate: (totalAnomalies / totalReadings) * 100,
    degradationScore: Math.min(degradationScore, 100),
    trendScore: 100 - Math.min(degradationScore, 100)
  };
}

function analyzeMaintenanceHistory(tasks, asset) {
  const completedTasks = tasks.filter(t => t.status === 'completed');
  const overdueTasks = tasks.filter(t => t.status === 'overdue');
  const emergencyTasks = tasks.filter(t => t.type === 'emergency');
  const correctiveTasks = tasks.filter(t => t.type === 'corrective');
  
  // Calculate asset age
  const installDate = asset.installation_date ? new Date(asset.installation_date) : null;
  const assetAgeDays = installDate ? Math.floor((Date.now() - installDate.getTime()) / (1000 * 60 * 60 * 24)) : 365;
  
  // Days since last maintenance
  const lastMaintenance = asset.last_maintenance_date ? new Date(asset.last_maintenance_date) : null;
  const daysSinceLastMaintenance = lastMaintenance 
    ? Math.floor((Date.now() - lastMaintenance.getTime()) / (1000 * 60 * 60 * 24))
    : 180;

  // Calculate maintenance frequency score
  const expectedMaintenanceFrequency = 90; // days
  const maintenanceScore = Math.max(0, 100 - (daysSinceLastMaintenance / expectedMaintenanceFrequency) * 50);

  // Emergency/corrective ratio indicates reactive vs proactive maintenance
  const reactiveRatio = tasks.length > 0 
    ? ((emergencyTasks.length + correctiveTasks.length) / tasks.length) * 100 
    : 0;

  return {
    metrics: {
      completedCount: completedTasks.length,
      overdueCount: overdueTasks.length,
      emergencyCount: emergencyTasks.length,
      correctiveCount: correctiveTasks.length,
      daysSinceLastMaintenance,
      assetAgeDays,
      reactiveRatio
    },
    summary: `${completedTasks.length} completed, ${overdueTasks.length} overdue, ${daysSinceLastMaintenance} days since last maintenance`,
    maintenanceScore,
    assetAgeDays
  };
}

function getAssetTypeFactors(assetType) {
  const factors = {
    // Industrial machinery
    motor: { lifespan: 15, criticalSensors: ['vibration', 'temperature', 'current'], degradationRate: 1.0 },
    pump: { lifespan: 12, criticalSensors: ['vibration', 'pressure', 'flow_rate'], degradationRate: 1.2 },
    compressor: { lifespan: 15, criticalSensors: ['vibration', 'pressure', 'temperature'], degradationRate: 1.1 },
    turbine: { lifespan: 25, criticalSensors: ['vibration', 'temperature', 'rpm'], degradationRate: 0.8 },
    generator: { lifespan: 30, criticalSensors: ['voltage', 'current', 'temperature'], degradationRate: 0.7 },
    transformer: { lifespan: 35, criticalSensors: ['temperature', 'oil_quality', 'moisture'], degradationRate: 0.6 },
    
    // Infrastructure
    railway_track: { lifespan: 30, criticalSensors: ['rail_profile', 'track_geometry', 'strain'], degradationRate: 0.9 },
    railway_switch: { lifespan: 20, criticalSensors: ['displacement', 'strain', 'vibration'], degradationRate: 1.0 },
    railway_signal: { lifespan: 25, criticalSensors: ['voltage', 'current'], degradationRate: 0.8 },
    bridge: { lifespan: 75, criticalSensors: ['strain', 'deflection', 'crack_width', 'corrosion'], degradationRate: 0.4 },
    building: { lifespan: 50, criticalSensors: ['settlement', 'tilt', 'crack_width', 'moisture'], degradationRate: 0.5 },
    tunnel: { lifespan: 100, criticalSensors: ['concrete_integrity', 'water_level', 'crack_width'], degradationRate: 0.3 },
    dam: { lifespan: 80, criticalSensors: ['water_level', 'seismic_activity', 'displacement', 'settlement'], degradationRate: 0.35 },
    power_line: { lifespan: 40, criticalSensors: ['temperature', 'voltage', 'wind_speed'], degradationRate: 0.6 },
    wind_turbine: { lifespan: 25, criticalSensors: ['vibration', 'wind_speed', 'rpm', 'temperature'], degradationRate: 0.9 },
    
    // Building systems
    elevator: { lifespan: 20, criticalSensors: ['vibration', 'current', 'noise_level'], degradationRate: 1.0 },
    escalator: { lifespan: 20, criticalSensors: ['vibration', 'current', 'noise_level'], degradationRate: 1.0 },
    hvac_system: { lifespan: 15, criticalSensors: ['temperature', 'pressure', 'humidity'], degradationRate: 1.1 },
    fire_suppression: { lifespan: 25, criticalSensors: ['pressure', 'flow_rate'], degradationRate: 0.8 },
    water_treatment: { lifespan: 20, criticalSensors: ['flow_rate', 'pressure', 'chloride_content'], degradationRate: 1.0 },
    
    // Roads & parking
    road_surface: { lifespan: 20, criticalSensors: ['crack_width', 'deflection', 'moisture'], degradationRate: 1.2 },
    retaining_wall: { lifespan: 50, criticalSensors: ['tilt', 'displacement', 'crack_width'], degradationRate: 0.5 },
    parking_structure: { lifespan: 40, criticalSensors: ['concrete_integrity', 'corrosion', 'crack_width'], degradationRate: 0.6 }
  };

  return factors[assetType] || { lifespan: 20, criticalSensors: ['vibration', 'temperature'], degradationRate: 1.0 };
}

function computeFailurePrediction(asset, sensorAnalysis, maintenanceAnalysis, assetTypeFactors) {
  const riskFactors = [];
  let baseScore = 100;

  // Age factor
  const ageYears = maintenanceAnalysis.assetAgeDays / 365;
  const lifespanRatio = ageYears / assetTypeFactors.lifespan;
  if (lifespanRatio > 0.8) {
    baseScore -= 30;
    riskFactors.push(`Asset at ${(lifespanRatio * 100).toFixed(0)}% of expected lifespan`);
  } else if (lifespanRatio > 0.6) {
    baseScore -= 15;
    riskFactors.push(`Asset aging (${(lifespanRatio * 100).toFixed(0)}% of lifespan)`);
  }

  // Operating hours factor
  if (asset.operating_hours) {
    const expectedHours = assetTypeFactors.lifespan * 365 * 12; // ~12 hrs/day avg
    const hoursRatio = asset.operating_hours / expectedHours;
    if (hoursRatio > 0.7) {
      baseScore -= 20;
      riskFactors.push(`High operating hours (${asset.operating_hours.toLocaleString()})`);
    }
  }

  // Sensor degradation factor
  if (sensorAnalysis.degradationScore > 50) {
    baseScore -= sensorAnalysis.degradationScore * 0.4;
    riskFactors.push(`Sensor degradation detected (score: ${sensorAnalysis.degradationScore.toFixed(0)})`);
  }

  // Anomaly rate factor
  if (sensorAnalysis.anomalyRate > 15) {
    baseScore -= 25;
    riskFactors.push(`High anomaly rate (${sensorAnalysis.anomalyRate.toFixed(1)}%)`);
  } else if (sensorAnalysis.anomalyRate > 5) {
    baseScore -= 10;
    riskFactors.push(`Elevated anomaly rate (${sensorAnalysis.anomalyRate.toFixed(1)}%)`);
  }

  // Maintenance history factor
  if (maintenanceAnalysis.metrics.daysSinceLastMaintenance > 180) {
    baseScore -= 20;
    riskFactors.push(`Overdue for maintenance (${maintenanceAnalysis.metrics.daysSinceLastMaintenance} days)`);
  }
  
  if (maintenanceAnalysis.metrics.overdueCount > 0) {
    baseScore -= maintenanceAnalysis.metrics.overdueCount * 10;
    riskFactors.push(`${maintenanceAnalysis.metrics.overdueCount} overdue maintenance tasks`);
  }

  if (maintenanceAnalysis.metrics.reactiveRatio > 50) {
    baseScore -= 15;
    riskFactors.push(`High reactive maintenance ratio (${maintenanceAnalysis.metrics.reactiveRatio.toFixed(0)}%)`);
  }

  // Current status factor
  if (asset.status === 'critical') {
    baseScore -= 30;
    riskFactors.push('Asset currently in critical status');
  } else if (asset.status === 'degraded') {
    baseScore -= 15;
    riskFactors.push('Asset currently degraded');
  }

  // Calculate final scores
  const healthScore = Math.max(0, Math.min(100, baseScore));
  const failureProbability = Math.min(100, Math.max(0, (100 - healthScore) * assetTypeFactors.degradationRate));
  
  // Estimate RUL
  const baseRUL = assetTypeFactors.lifespan * 365 * (1 - lifespanRatio);
  const adjustedRUL = Math.max(1, Math.round(baseRUL * (healthScore / 100)));
  
  // Predict failure date
  const predictedDate = new Date();
  predictedDate.setDate(predictedDate.getDate() + adjustedRUL);

  // Determine risk level
  let riskLevel = 'low';
  if (failureProbability > 60 || adjustedRUL < 30) riskLevel = 'critical';
  else if (failureProbability > 40 || adjustedRUL < 90) riskLevel = 'high';
  else if (failureProbability > 20 || adjustedRUL < 180) riskLevel = 'medium';

  // Confidence based on data availability
  const dataPoints = Object.keys(sensorAnalysis.metrics).length * 10 + maintenanceAnalysis.metrics.completedCount * 5;
  const confidence = Math.min(95, 50 + dataPoints);

  return {
    probability: Math.round(failureProbability * 10) / 10,
    healthScore: Math.round(healthScore),
    rulDays: adjustedRUL,
    predictedDate: predictedDate.toISOString().split('T')[0],
    riskLevel,
    confidence: Math.round(confidence),
    riskFactors
  };
}

function generateWarnings(prediction, asset, sensorAnalysis) {
  const warnings = [];
  const recommendations = [];

  if (prediction.riskLevel === 'critical') {
    warnings.push({
      level: 'emergency',
      message: `CRITICAL: ${asset.name} has ${prediction.probability}% failure probability within ${prediction.rulDays} days`,
      action: 'Immediate inspection required'
    });
    recommendations.push('Schedule emergency inspection within 24 hours');
    recommendations.push('Prepare backup/redundancy plans');
  } else if (prediction.riskLevel === 'high') {
    warnings.push({
      level: 'warning',
      message: `HIGH RISK: ${asset.name} showing degradation patterns`,
      action: 'Schedule preventive maintenance'
    });
    recommendations.push('Schedule maintenance within 7 days');
    recommendations.push('Monitor sensor readings closely');
  } else if (prediction.riskLevel === 'medium') {
    warnings.push({
      level: 'info',
      message: `MODERATE: ${asset.name} requires attention`,
      action: 'Plan maintenance activities'
    });
    recommendations.push('Schedule routine inspection within 30 days');
  }

  // Sensor-specific warnings
  for (const [sensorType, metrics] of Object.entries(sensorAnalysis.metrics)) {
    if (metrics.anomalyRate > 20) {
      warnings.push({
        level: 'warning',
        message: `High anomaly rate in ${sensorType} sensor (${metrics.anomalyRate.toFixed(1)}%)`,
        action: 'Investigate sensor or component'
      });
    }
    if (metrics.trend === 'increasing' && ['vibration', 'temperature', 'crack_width'].includes(sensorType)) {
      recommendations.push(`Monitor ${sensorType} closely - showing increasing trend`);
    }
  }

  return { warnings, recommendations };
}