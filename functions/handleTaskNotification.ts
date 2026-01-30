import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { event, data, old_data } = await req.json();

    // Get equipment name
    let equipmentName = 'Unknown Equipment';
    if (data.equipment_id) {
      const equipment = await base44.asServiceRole.entities.Equipment.list();
      const equip = equipment.find(e => e.id === data.equipment_id);
      if (equip) {
        equipmentName = equip.name;
      }
    }

    if (event.type === 'create') {
      // New task created
      await base44.asServiceRole.functions.invoke('sendNotificationEmail', {
        type: 'task_assigned',
        data: {
          title: data.title,
          type: data.type,
          priority: data.priority,
          equipment_name: equipmentName,
          scheduled_date: data.scheduled_date,
          estimated_duration_hours: data.estimated_duration_hours,
          description: data.description,
          assigned_to: data.assigned_to
        }
      });
    } else if (event.type === 'update') {
      // Task status changed
      if (old_data && old_data.status !== data.status) {
        await base44.asServiceRole.functions.invoke('sendNotificationEmail', {
          type: 'task_updated',
          data: {
            title: data.title,
            status: data.status,
            priority: data.priority,
            equipment_name: equipmentName,
            notes: data.notes
          }
        });
      }
    }

    return Response.json({ success: true });

  } catch (error) {
    console.error('Error handling task notification:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});