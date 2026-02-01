import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const generateWorkOrderEmailHTML = (data) => {
  const priorityColors = {
    low: '#22c55e',
    medium: '#f59e0b', 
    high: '#f97316',
    urgent: '#ef4444'
  };
  
  const statusColors = {
    draft: '#94a3b8',
    open: '#3b82f6',
    assigned: '#8b5cf6',
    in_progress: '#f59e0b',
    on_hold: '#6b7280',
    completed: '#22c55e',
    closed: '#64748b',
    cancelled: '#ef4444'
  };
  
  const priorityColor = priorityColors[data.priority] || '#6b7280';
  const statusColor = statusColors[data.status] || '#6b7280';
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f1f5f9; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%); padding: 30px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">🔧 Work Order ${data.action === 'assigned' ? 'Assigned' : data.action === 'updated' ? 'Updated' : 'Notification'}</h1>
                    <p style="margin: 8px 0 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">AssetStack Maintenance System</p>
                  </td>
                  <td align="right" style="vertical-align: top;">
                    <span style="background-color: rgba(255,255,255,0.2); color: #ffffff; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;">
                      #${data.work_order_number || 'N/A'}
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Status & Priority Badges -->
          <tr>
            <td style="padding: 24px 40px 0 40px;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding-right: 10px;">
                    <span style="display: inline-block; background-color: ${statusColor}; color: #ffffff; padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: 600; text-transform: uppercase;">
                      ${(data.status || 'open').replace('_', ' ')}
                    </span>
                  </td>
                  <td>
                    <span style="display: inline-block; background-color: ${priorityColor}; color: #ffffff; padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: 600; text-transform: uppercase;">
                      ${data.priority || 'medium'} priority
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Title -->
          <tr>
            <td style="padding: 20px 40px;">
              <h2 style="margin: 0; color: #1e293b; font-size: 22px; font-weight: 600;">${data.title || 'Work Order'}</h2>
              ${data.description ? `<p style="margin: 10px 0 0 0; color: #64748b; font-size: 14px; line-height: 1.6;">${data.description}</p>` : ''}
            </td>
          </tr>
          
          <!-- Details Card -->
          <tr>
            <td style="padding: 0 40px 24px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
                <tr>
                  <td style="padding: 20px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="50%" style="padding: 8px 0; vertical-align: top;">
                          <p style="margin: 0; color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Equipment</p>
                          <p style="margin: 4px 0 0 0; color: #1e293b; font-size: 14px; font-weight: 500;">${data.equipment_name || 'N/A'}</p>
                        </td>
                        <td width="50%" style="padding: 8px 0; vertical-align: top;">
                          <p style="margin: 0; color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Type</p>
                          <p style="margin: 4px 0 0 0; color: #1e293b; font-size: 14px; font-weight: 500;">${(data.type || 'maintenance').replace('_', ' ')}</p>
                        </td>
                      </tr>
                      <tr>
                        <td width="50%" style="padding: 8px 0; vertical-align: top;">
                          <p style="margin: 0; color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Assigned To</p>
                          <p style="margin: 4px 0 0 0; color: #1e293b; font-size: 14px; font-weight: 500;">${data.assigned_to || 'Unassigned'}</p>
                        </td>
                        <td width="50%" style="padding: 8px 0; vertical-align: top;">
                          <p style="margin: 0; color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Scheduled</p>
                          <p style="margin: 4px 0 0 0; color: #1e293b; font-size: 14px; font-weight: 500;">${data.scheduled_start ? new Date(data.scheduled_start).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Not scheduled'}</p>
                        </td>
                      </tr>
                      ${data.estimated_hours ? `
                      <tr>
                        <td width="50%" style="padding: 8px 0; vertical-align: top;">
                          <p style="margin: 0; color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Estimated Hours</p>
                          <p style="margin: 4px 0 0 0; color: #1e293b; font-size: 14px; font-weight: 500;">${data.estimated_hours} hrs</p>
                        </td>
                        <td width="50%" style="padding: 8px 0; vertical-align: top;">
                          <p style="margin: 0; color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Est. Cost</p>
                          <p style="margin: 4px 0 0 0; color: #1e293b; font-size: 14px; font-weight: 500;">${data.estimated_cost ? '$' + data.estimated_cost.toLocaleString() : 'N/A'}</p>
                        </td>
                      </tr>
                      ` : ''}
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          ${data.checklist && data.checklist.length > 0 ? `
          <!-- Checklist Preview -->
          <tr>
            <td style="padding: 0 40px 24px 40px;">
              <p style="margin: 0 0 12px 0; color: #1e293b; font-size: 14px; font-weight: 600;">📋 Checklist Items (${data.checklist.length})</p>
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fefce8; border-radius: 8px; border: 1px solid #fef08a;">
                <tr>
                  <td style="padding: 16px;">
                    ${data.checklist.slice(0, 3).map(item => `
                      <p style="margin: 0 0 8px 0; color: #713f12; font-size: 13px;">
                        ${item.completed ? '✅' : '⬜'} ${item.question}
                      </p>
                    `).join('')}
                    ${data.checklist.length > 3 ? `<p style="margin: 0; color: #a16207; font-size: 12px; font-style: italic;">+ ${data.checklist.length - 3} more items</p>` : ''}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          ` : ''}
          
          ${data.notes ? `
          <!-- Notes -->
          <tr>
            <td style="padding: 0 40px 24px 40px;">
              <p style="margin: 0 0 8px 0; color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Notes</p>
              <p style="margin: 0; color: #475569; font-size: 14px; line-height: 1.6; background-color: #f8fafc; padding: 12px; border-radius: 6px; border-left: 3px solid #6366f1;">${data.notes}</p>
            </td>
          </tr>
          ` : ''}
          
          <!-- Action Button -->
          <tr>
            <td style="padding: 0 40px 30px 40px;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%); border-radius: 8px;">
                    <a href="#" style="display: inline-block; padding: 14px 28px; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 600;">
                      View Work Order →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 24px 40px; border-top: 1px solid #e2e8f0;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <p style="margin: 0; color: #64748b; font-size: 12px;">
                      This is an automated notification from <strong>AssetStack</strong>
                    </p>
                    <p style="margin: 4px 0 0 0; color: #94a3b8; font-size: 11px;">
                      Generated on ${new Date().toLocaleString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </td>
                  <td align="right">
                    <p style="margin: 0; color: #94a3b8; font-size: 11px;">Asset Management Platform</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
};

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
    let isHTML = false;

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