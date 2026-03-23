import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { event, data, old_data } = await req.json();

    // Notify when a trigger is activated (tasks_generated_count increased)
    if (event.type === 'update' && old_data) {
      const tasksGenerated = (data.tasks_generated_count || 0) - (old_data.tasks_generated_count || 0);
      
      if (tasksGenerated > 0 && data.last_triggered_at !== old_data.last_triggered_at) {
        await base44.asServiceRole.functions.invoke('sendNotificationEmail', {
          type: 'trigger_activated',
          data: {
            trigger_name: data.name,
            trigger_type: data.trigger_type,
            trigger_reason: data.description,
            trigger_value: data.threshold_value,
            tasks_generated: tasksGenerated
          }
        });
      }
    }

    return Response.json({ success: true });

  } catch (error) {
    console.error('Error handling trigger notification:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});