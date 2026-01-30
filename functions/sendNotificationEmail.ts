import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { type, data } = await req.json();

    // Get admin users to notify
    const users = await base44.asServiceRole.entities.User.list();
    const admins = users.filter(u => u.role === 'admin');
    
    if (admins.length === 0) {
      return Response.json({ success: false, message: 'No admin users to notify' });
    }

    let subject = '';
    let body = '';

    switch (type) {
      case 'critical_anomaly':
        subject = `🚨 Critical Anomaly Detected - ${data.equipment_name || 'Equipment'}`;
        body = `
A critical anomaly has been detected and requires immediate attention.

Equipment: ${data.equipment_name || 'N/A'}
Location: ${data.location || 'N/A'}
Anomaly Type: ${data.anomaly_type || 'N/A'}
Severity: ${data.severity || 'Critical'}
Description: ${data.description || 'N/A'}

Detected At: ${new Date().toLocaleString()}

Please investigate this issue immediately.

--
AssetStack Alert System
        `.trim();
        break;

      case 'predicted_failure':
        subject = `⚠️ Equipment Failure Predicted - ${data.equipment_name || 'Equipment'}`;
        body = `
An AI prediction indicates high probability of equipment failure.

Equipment: ${data.equipment_name || 'N/A'}
Location: ${data.location || 'N/A'}
Failure Probability: ${data.failure_probability || 'N/A'}%
Predicted Failure Date: ${data.predicted_failure_date || 'N/A'}
Remaining Useful Life: ${data.remaining_useful_life_days || 'N/A'} days

Risk Level: ${data.risk_level || 'High'}

Recommended Action: Schedule preventive maintenance immediately.

--
AssetStack Predictive Analytics
        `.trim();
        break;

      case 'task_assigned':
        subject = `📋 New Maintenance Task Assigned - ${data.title || 'Task'}`;
        body = `
A new maintenance task has been assigned.

Task: ${data.title || 'N/A'}
Type: ${data.type || 'N/A'}
Priority: ${data.priority || 'Medium'}
Equipment: ${data.equipment_name || 'N/A'}
Scheduled Date: ${data.scheduled_date || 'N/A'}
Estimated Duration: ${data.estimated_duration_hours || 'N/A'} hours

Description: ${data.description || 'No description provided'}

Assigned To: ${data.assigned_to || 'Unassigned'}

--
AssetStack Maintenance System
        `.trim();
        break;

      case 'task_updated':
        subject = `🔄 Maintenance Task Updated - ${data.title || 'Task'}`;
        body = `
A maintenance task has been updated.

Task: ${data.title || 'N/A'}
New Status: ${data.status || 'N/A'}
Priority: ${data.priority || 'Medium'}
Equipment: ${data.equipment_name || 'N/A'}

${data.notes ? `Notes: ${data.notes}` : ''}

--
AssetStack Maintenance System
        `.trim();
        break;

      case 'health_degradation':
        subject = `📉 Health Score Alert - ${data.equipment_name || 'Equipment'}`;
        body = `
Equipment health has degraded significantly.

Equipment: ${data.equipment_name || 'N/A'}
Location: ${data.location || 'N/A'}
Current Health Score: ${data.health_score || 'N/A'}%
Previous Health Score: ${data.previous_health_score || 'N/A'}%
Status: ${data.status || 'Degraded'}

This equipment may require inspection or maintenance.

--
AssetStack Health Monitoring
        `.trim();
        break;

      case 'lidar_scan_complete':
        subject = `📡 LiDAR Scan Analysis Complete - ${data.name || 'Scan'}`;
        body = `
A LiDAR scan has been processed and analyzed.

Scan Name: ${data.name || 'N/A'}
Location: ${data.location || 'N/A'}
Scan Date: ${data.scan_date || 'N/A'}
Point Count: ${data.point_count?.toLocaleString() || 'N/A'}
Anomalies Detected: ${data.anomalies_count || 0}

${data.critical_anomalies > 0 ? `⚠️ ${data.critical_anomalies} critical anomalies require attention!` : 'No critical anomalies detected.'}

--
AssetStack Digital Twin
        `.trim();
        break;

      case 'low_inventory':
        subject = `📦 Low Inventory Alert - ${data.name || 'Part'}`;
        body = `
A spare part is running low on stock.

Part: ${data.name || 'N/A'}
Part Number: ${data.part_number || 'N/A'}
Category: ${data.category || 'N/A'}
Current Stock: ${data.quantity_in_stock || 0}
Minimum Level: ${data.minimum_stock_level || 'N/A'}
Reorder Quantity: ${data.reorder_quantity || 'N/A'}

Supplier: ${data.supplier || 'N/A'}
Lead Time: ${data.lead_time_days || 'N/A'} days

Please reorder this part to avoid maintenance delays.

--
AssetStack Inventory Management
        `.trim();
        break;

      case 'trigger_activated':
        subject = `⚡ Maintenance Trigger Activated - ${data.trigger_name || 'Trigger'}`;
        body = `
A maintenance trigger has been activated.

Trigger: ${data.trigger_name || 'N/A'}
Type: ${data.trigger_type || 'N/A'}
Equipment: ${data.equipment_name || 'N/A'}

Trigger Reason: ${data.trigger_reason || 'Threshold exceeded'}
Triggered Value: ${data.trigger_value || 'N/A'}

Tasks Generated: ${data.tasks_generated || 0}

--
AssetStack Automation
        `.trim();
        break;

      default:
        return Response.json({ success: false, message: 'Unknown notification type' });
    }

    // Send email to all admins
    const emailPromises = admins.map(admin => 
      base44.integrations.Core.SendEmail({
        to: admin.email,
        subject,
        body
      })
    );

    await Promise.all(emailPromises);

    return Response.json({ 
      success: true, 
      message: `Notification sent to ${admins.length} admin(s)`,
      recipients: admins.map(a => a.email)
    });

  } catch (error) {
    console.error('Error sending notification:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});