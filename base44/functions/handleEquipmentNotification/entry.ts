import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { event, data, old_data } = await req.json();

    // Check for predicted failure (high failure probability)
    if (data.failure_probability >= 70 || data.risk_level === 'critical') {
      await base44.asServiceRole.functions.invoke('sendNotificationEmail', {
        type: 'predicted_failure',
        data: {
          equipment_name: data.name,
          location: data.location,
          failure_probability: data.failure_probability,
          predicted_failure_date: data.predicted_failure_date,
          remaining_useful_life_days: data.remaining_useful_life_days,
          risk_level: data.risk_level
        }
      });
    }

    // Check for health score degradation (dropped by 20+ points or below 50)
    if (old_data && old_data.health_score && data.health_score) {
      const healthDrop = old_data.health_score - data.health_score;
      if (healthDrop >= 20 || (data.health_score < 50 && old_data.health_score >= 50)) {
        await base44.asServiceRole.functions.invoke('sendNotificationEmail', {
          type: 'health_degradation',
          data: {
            equipment_name: data.name,
            location: data.location,
            health_score: data.health_score,
            previous_health_score: old_data.health_score,
            status: data.status
          }
        });
      }
    }

    return Response.json({ success: true });

  } catch (error) {
    console.error('Error handling equipment notification:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});