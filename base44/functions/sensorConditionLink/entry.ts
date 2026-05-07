import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Sensor → Condition Auto-Update.
// For each piece of equipment that has recent anomalous sensor readings,
// drop its condition_grade by 1 and create a ConditionReport.
// Run periodically via scheduled automation.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    // Fetch recent anomalous readings (last 24h)
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const readings = await base44.asServiceRole.entities.SensorReading.filter({
      is_anomaly: true,
    }, '-timestamp', 500);

    const recent = readings.filter((r) => r.timestamp > cutoff);

    // Group by equipment
    const byEq = {};
    for (const r of recent) {
      if (!r.equipment_id) continue;
      if (!byEq[r.equipment_id]) byEq[r.equipment_id] = [];
      byEq[r.equipment_id].push(r);
    }

    let updated = 0;
    const actions = [];

    for (const [equipmentId, anomalies] of Object.entries(byEq)) {
      if (anomalies.length < 3) continue; // require sustained anomaly
      try {
        const eq = await base44.asServiceRole.entities.Equipment.get(equipmentId);
        if (!eq) continue;
        const currentGrade = Number(eq.specifications?.condition_grade) || 2;
        const newGrade = Math.min(5, currentGrade + 1);
        if (newGrade === currentGrade) continue;

        await base44.asServiceRole.entities.Equipment.update(equipmentId, {
          specifications: { ...(eq.specifications || {}), condition_grade: newGrade },
          status: newGrade >= 4 ? 'critical' : 'degraded',
        });

        await base44.asServiceRole.entities.ConditionReport.create({
          digital_twin_model_id: 'sensor-driven',
          equipment_id: equipmentId,
          equipment_name: eq.name,
          anomaly_type: 'wear',
          severity: newGrade >= 4 ? 'major' : 'moderate',
          condition_score: newGrade,
          ai_confidence: 80,
          ai_description: `Sustained sensor anomalies detected (${anomalies.length} readings in 24h). Auto-reduced condition from C${currentGrade} to C${newGrade}.`,
          ai_model_version: 'sensor-rule-1.0',
          review_status: 'pending',
        });

        updated++;
        actions.push({ equipment_id: equipmentId, name: eq.name, from: currentGrade, to: newGrade, anomaly_count: anomalies.length });
      } catch (err) {
        console.error('Failed for', equipmentId, err.message);
      }
    }

    return Response.json({ success: true, updated, anomalous_assets: Object.keys(byEq).length, actions });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});