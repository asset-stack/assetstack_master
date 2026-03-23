import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { event, data } = await req.json();

    // Only notify for critical/emergency alerts
    if (data.severity !== 'critical' && data.severity !== 'emergency') {
      return Response.json({ skipped: true, reason: 'Not a critical alert' });
    }

    // Get equipment details
    let equipmentName = 'Unknown Equipment';
    let location = 'Unknown';
    
    if (data.equipment_id) {
      const equipment = await base44.asServiceRole.entities.Equipment.list();
      const equip = equipment.find(e => e.id === data.equipment_id);
      if (equip) {
        equipmentName = equip.name;
        location = equip.location;
      }
    }

    // Send notification
    await base44.asServiceRole.functions.invoke('sendNotificationEmail', {
      type: 'critical_anomaly',
      data: {
        equipment_name: equipmentName,
        location,
        anomaly_type: data.type,
        severity: data.severity,
        description: data.message
      }
    });

    return Response.json({ success: true, notified: true });

  } catch (error) {
    console.error('Error handling alert notification:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});