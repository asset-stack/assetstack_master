import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { event, data, old_data } = await req.json();

    // Only notify when processing is complete (status changed to 'analyzed')
    if (event.type === 'update' && old_data) {
      if (old_data.processing_status !== 'analyzed' && data.processing_status === 'analyzed') {
        const anomalies = data.anomalies_detected || [];
        const criticalAnomalies = anomalies.filter(a => a.severity === 'critical' || a.severity === 'high').length;

        await base44.asServiceRole.functions.invoke('sendNotificationEmail', {
          type: 'lidar_scan_complete',
          data: {
            name: data.name,
            location: data.location,
            scan_date: data.scan_date,
            point_count: data.point_count,
            anomalies_count: anomalies.length,
            critical_anomalies: criticalAnomalies
          }
        });
      }
    }

    return Response.json({ success: true });

  } catch (error) {
    console.error('Error handling LiDAR notification:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});