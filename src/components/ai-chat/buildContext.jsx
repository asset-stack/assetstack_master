export function buildContextSummary(data) {
  const lines = [];

  if (data?.equipment?.length) {
    lines.push(`## Equipment (${data.equipment.length} assets)`);
    data.equipment.forEach(e => {
      lines.push(`- **${e.name}** (${e.type}) | Location: ${e.location} | Status: ${e.status} | Health: ${e.health_score ?? 'N/A'}/100 | Risk: ${e.risk_level} | Operating Hours: ${e.operating_hours ?? 'N/A'} | RUL: ${e.remaining_useful_life_days ?? 'N/A'} days | Failure Prob: ${e.failure_probability ?? 'N/A'}%`);
    });
  }

  if (data?.tasks?.length) {
    lines.push(`\n## Maintenance Tasks (${data.tasks.length})`);
    data.tasks.forEach(t => {
      lines.push(`- **${t.title}** | Type: ${t.type} | Priority: ${t.priority} | Status: ${t.status} | Scheduled: ${t.scheduled_date || 'N/A'} | Assigned: ${t.assigned_to || 'Unassigned'} | AI Recommended: ${t.ai_recommended ? 'Yes' : 'No'}`);
    });
  }

  if (data?.workOrders?.length) {
    lines.push(`\n## Work Orders (${data.workOrders.length})`);
    data.workOrders.forEach(w => {
      lines.push(`- **${w.title}** (${w.work_order_number || 'N/A'}) | Type: ${w.type} | Priority: ${w.priority} | Status: ${w.status} | Assigned: ${w.assigned_to || 'Unassigned'} | Est Cost: $${w.estimated_cost ?? 'N/A'} | Actual Cost: $${w.actual_total_cost ?? 'N/A'}`);
    });
  }

  if (data?.technicians?.length) {
    lines.push(`\n## Technicians (${data.technicians.length})`);
    data.technicians.forEach(t => {
      lines.push(`- **${t.name}** (${t.employee_id}) | Type: ${t.worker_type} | Level: ${t.certification_level} | Status: ${t.availability_status} | Rating: ${t.performance_rating ?? 'N/A'}/100 | Fix Rate: ${t.first_time_fix_rate ?? 'N/A'}% | Completed: ${t.completed_tasks_count ?? 0} tasks | Rate: $${t.hourly_rate ?? 'N/A'}/hr`);
    });
  }

  if (data?.alerts?.length) {
    lines.push(`\n## Active Alerts (${data.alerts.length})`);
    data.alerts.forEach(a => {
      lines.push(`- **${a.title}** | Severity: ${a.severity} | Type: ${a.type} | Status: ${a.status} | Action: ${a.recommended_action || 'N/A'}`);
    });
  }

  if (data?.spareParts?.length) {
    lines.push(`\n## Spare Parts Inventory (${data.spareParts.length})`);
    data.spareParts.forEach(p => {
      lines.push(`- **${p.name}** (${p.part_number}) | Category: ${p.category} | Stock: ${p.quantity_in_stock} | Min Level: ${p.minimum_stock_level} | Status: ${p.status} | Cost: $${p.unit_cost ?? 'N/A'}`);
    });
  }

  if (data?.sensors?.length) {
    lines.push(`\n## Sensor Configurations (${data.sensors.length})`);
    data.sensors.forEach(s => {
      lines.push(`- **${s.sensor_name}** (${s.sensor_type}) | Status: ${s.status} | Last Value: ${s.last_reading_value ?? 'N/A'} ${s.unit || ''}`);
    });
  }

  return lines.join('\n');
}