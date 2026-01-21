import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { mode = 'analyze', auto_create = false, notify_technicians = false } = await req.json();

    // Fetch all necessary data
    const [equipment, technicians, spareParts, tasks, workOrders, alerts] = await Promise.all([
      base44.entities.Equipment.list('-created_date', 500),
      base44.entities.Technician.list('-created_date', 100),
      base44.entities.SparePart.list('-created_date', 500),
      base44.entities.MaintenanceTask.list('-created_date', 500),
      base44.entities.WorkOrder.list('-created_date', 500),
      base44.entities.Alert.list('-created_date', 200)
    ]);

    // Build context maps
    const equipmentMap = equipment.reduce((acc, e) => { acc[e.id] = e; return acc; }, {});
    const techniciansBySkill = buildTechnicianSkillMap(technicians);
    const partsByEquipmentType = buildPartsMap(spareParts);
    
    // Analyze equipment for maintenance needs
    const maintenanceRecommendations = analyzeEquipmentForMaintenance(
      equipment, 
      tasks, 
      workOrders, 
      alerts,
      technicians,
      spareParts
    );

    // Generate optimized schedule
    const optimizedSchedule = generateOptimizedSchedule(
      maintenanceRecommendations,
      technicians,
      spareParts
    );

    const createdItems = { tasks: [], workOrders: [] };
    const notifications = [];

    if (auto_create && optimizedSchedule.recommendations.length > 0) {
      // Create maintenance tasks and work orders for high-priority items
      for (const rec of optimizedSchedule.recommendations.filter(r => r.urgency >= 70)) {
        const eq = equipmentMap[rec.equipment_id];
        
        // Create maintenance task
        const task = await base44.entities.MaintenanceTask.create({
          equipment_id: rec.equipment_id,
          title: rec.title,
          description: rec.description,
          type: rec.type,
          priority: rec.priority,
          status: 'scheduled',
          scheduled_date: rec.recommended_date,
          estimated_duration_hours: rec.estimated_hours,
          cost_estimate: rec.estimated_cost,
          assigned_to: rec.suggested_technician,
          parts_required: rec.required_parts.map(p => p.name),
          ai_recommended: true,
          ai_confidence: rec.confidence
        });
        createdItems.tasks.push(task);

        // Create draft work order
        const woNumber = `WO-${Date.now().toString().slice(-8)}-${createdItems.workOrders.length}`;
        const workOrder = await base44.entities.WorkOrder.create({
          work_order_number: woNumber,
          maintenance_task_id: task.id,
          equipment_id: rec.equipment_id,
          title: rec.title,
          description: rec.description,
          type: rec.type,
          priority: rec.priority,
          status: 'draft',
          assigned_to: rec.suggested_technician,
          scheduled_start: rec.recommended_date,
          estimated_hours: rec.estimated_hours,
          estimated_cost: rec.estimated_cost,
          parts_used: rec.required_parts.map(p => ({
            part_name: p.name,
            part_number: p.part_number,
            quantity: p.quantity,
            unit_cost: p.unit_cost
          })),
          history: [{
            timestamp: new Date().toISOString(),
            action: 'AI Auto-Generated',
            user: 'AI Scheduler',
            details: `Auto-generated based on ${rec.trigger_reason}. Confidence: ${rec.confidence}%`
          }]
        });
        createdItems.workOrders.push(workOrder);

        // Prepare notification
        if (notify_technicians && rec.suggested_technician) {
          const tech = technicians.find(t => t.name === rec.suggested_technician);
          if (tech?.email) {
            notifications.push({
              technician: tech,
              equipment: eq,
              task: task,
              workOrder: workOrder,
              recommendation: rec
            });
          }
        }
      }

      // Send notifications
      if (notifications.length > 0) {
        await sendNotifications(base44, notifications);
      }
    }

    return Response.json({
      success: true,
      analysis: {
        total_equipment: equipment.length,
        equipment_needing_maintenance: maintenanceRecommendations.length,
        high_priority_count: maintenanceRecommendations.filter(r => r.urgency >= 70).length,
        critical_count: maintenanceRecommendations.filter(r => r.urgency >= 90).length
      },
      schedule: optimizedSchedule,
      created: auto_create ? createdItems : null,
      notifications_sent: notifications.length
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function buildTechnicianSkillMap(technicians) {
  const map = {};
  technicians.forEach(tech => {
    (tech.equipment_specializations || []).forEach(spec => {
      if (!map[spec]) map[spec] = [];
      map[spec].push(tech);
    });
  });
  return map;
}

function buildPartsMap(spareParts) {
  const map = {};
  spareParts.forEach(part => {
    (part.compatible_equipment_types || []).forEach(type => {
      if (!map[type]) map[type] = [];
      map[type].push(part);
    });
  });
  return map;
}

function analyzeEquipmentForMaintenance(equipment, tasks, workOrders, alerts, technicians, spareParts) {
  const recommendations = [];
  const now = new Date();
  
  // Get pending tasks and active work orders per equipment
  const pendingTasksByEquipment = {};
  tasks.filter(t => t.status !== 'completed' && t.status !== 'cancelled')
    .forEach(t => {
      if (!pendingTasksByEquipment[t.equipment_id]) pendingTasksByEquipment[t.equipment_id] = [];
      pendingTasksByEquipment[t.equipment_id].push(t);
    });

  const activeWOByEquipment = {};
  workOrders.filter(wo => !['completed', 'closed', 'cancelled'].includes(wo.status))
    .forEach(wo => {
      if (!activeWOByEquipment[wo.equipment_id]) activeWOByEquipment[wo.equipment_id] = [];
      activeWOByEquipment[wo.equipment_id].push(wo);
    });

  // Active alerts by equipment
  const activeAlerts = {};
  alerts.filter(a => a.status === 'active')
    .forEach(a => {
      if (!activeAlerts[a.equipment_id]) activeAlerts[a.equipment_id] = [];
      activeAlerts[a.equipment_id].push(a);
    });

  equipment.forEach(eq => {
    // Skip if already has pending maintenance
    if ((pendingTasksByEquipment[eq.id]?.length || 0) > 2) return;
    if ((activeWOByEquipment[eq.id]?.length || 0) > 1) return;

    let urgency = 0;
    let triggerReasons = [];
    let maintenanceType = 'preventive';

    // Factor 1: Failure probability (0-40 points)
    const failureProb = eq.failure_probability || 0;
    if (failureProb > 0) {
      urgency += Math.min(40, failureProb * 0.4);
      if (failureProb > 50) {
        triggerReasons.push(`High failure probability: ${failureProb}%`);
        maintenanceType = 'predictive';
      }
    }

    // Factor 2: Remaining useful life (0-30 points)
    const rulDays = eq.remaining_useful_life_days;
    if (rulDays !== undefined && rulDays !== null) {
      if (rulDays <= 7) {
        urgency += 30;
        triggerReasons.push(`Critical RUL: ${rulDays} days`);
        maintenanceType = 'emergency';
      } else if (rulDays <= 30) {
        urgency += 20;
        triggerReasons.push(`Low RUL: ${rulDays} days`);
        maintenanceType = 'predictive';
      } else if (rulDays <= 60) {
        urgency += 10;
        triggerReasons.push(`RUL within 60 days`);
      }
    }

    // Factor 3: Health score (0-20 points)
    const healthScore = eq.health_score || 100;
    if (healthScore < 50) {
      urgency += 20;
      triggerReasons.push(`Low health score: ${healthScore}%`);
    } else if (healthScore < 70) {
      urgency += 10;
      triggerReasons.push(`Degraded health: ${healthScore}%`);
    }

    // Factor 4: Status and risk level (0-15 points)
    if (eq.status === 'critical') {
      urgency += 15;
      triggerReasons.push('Equipment in critical status');
      maintenanceType = 'corrective';
    } else if (eq.status === 'degraded') {
      urgency += 8;
      triggerReasons.push('Equipment degraded');
    }

    if (eq.risk_level === 'critical') urgency += 10;
    else if (eq.risk_level === 'high') urgency += 5;

    // Factor 5: Active alerts (0-15 points)
    const eqAlerts = activeAlerts[eq.id] || [];
    if (eqAlerts.some(a => a.severity === 'emergency' || a.severity === 'critical')) {
      urgency += 15;
      triggerReasons.push(`Active critical alerts: ${eqAlerts.length}`);
      maintenanceType = 'corrective';
    } else if (eqAlerts.length > 0) {
      urgency += 5;
      triggerReasons.push(`Active alerts: ${eqAlerts.length}`);
    }

    // Factor 6: Time since last maintenance (0-10 points)
    if (eq.last_maintenance_date) {
      const daysSinceMaint = Math.floor((now - new Date(eq.last_maintenance_date)) / (1000 * 60 * 60 * 24));
      if (daysSinceMaint > 180) {
        urgency += 10;
        triggerReasons.push(`${daysSinceMaint} days since last maintenance`);
      } else if (daysSinceMaint > 90) {
        urgency += 5;
      }
    }

    // Factor 7: Equipment criticality bonus
    if (eq.criticality === 'mission_critical') urgency *= 1.3;
    else if (eq.criticality === 'high') urgency *= 1.15;

    urgency = Math.min(100, Math.round(urgency));

    // Only recommend if urgency is significant
    if (urgency >= 30 || triggerReasons.length > 0) {
      // Find best technician
      const availableTechs = technicians.filter(t => 
        t.availability_status === 'available' &&
        (t.equipment_specializations?.includes(eq.type) || t.certification_level === 'expert' || t.certification_level === 'master')
      );
      
      const bestTech = availableTechs.sort((a, b) => {
        const aMatch = a.equipment_specializations?.includes(eq.type) ? 50 : 0;
        const bMatch = b.equipment_specializations?.includes(eq.type) ? 50 : 0;
        const aPerf = a.performance_rating || 70;
        const bPerf = b.performance_rating || 70;
        return (bMatch + bPerf) - (aMatch + aPerf);
      })[0];

      // Find required parts
      const compatibleParts = spareParts.filter(p => 
        p.compatible_equipment_types?.includes(eq.type) && 
        (p.quantity_in_stock || 0) > 0
      );

      const requiredParts = [];
      if (maintenanceType === 'preventive' || maintenanceType === 'predictive') {
        const filter = compatibleParts.find(p => p.category === 'filter');
        const seal = compatibleParts.find(p => p.category === 'seal');
        if (filter) requiredParts.push({ ...filter, quantity: 1 });
        if (seal) requiredParts.push({ ...seal, quantity: 1 });
      }
      if (maintenanceType === 'corrective' || maintenanceType === 'emergency') {
        const bearing = compatibleParts.find(p => p.category === 'bearing');
        if (bearing) requiredParts.push({ ...bearing, quantity: 2 });
      }

      // Calculate schedule date
      let recommendedDate = new Date();
      if (urgency >= 90) {
        recommendedDate.setDate(recommendedDate.getDate() + 1);
      } else if (urgency >= 70) {
        recommendedDate.setDate(recommendedDate.getDate() + 3);
      } else if (urgency >= 50) {
        recommendedDate.setDate(recommendedDate.getDate() + 7);
      } else {
        recommendedDate.setDate(recommendedDate.getDate() + 14);
      }

      // Estimate cost
      const laborHours = maintenanceType === 'emergency' ? 6 : maintenanceType === 'corrective' ? 4 : 3;
      const laborCost = laborHours * (bestTech?.hourly_rate || 75);
      const partsCost = requiredParts.reduce((sum, p) => sum + ((p.unit_cost || 0) * (p.quantity || 1)), 0);

      recommendations.push({
        equipment_id: eq.id,
        equipment_name: eq.name,
        equipment_type: eq.type,
        equipment_location: eq.location,
        urgency,
        confidence: Math.min(95, 60 + (triggerReasons.length * 10)),
        trigger_reason: triggerReasons.join('; ') || 'Scheduled preventive maintenance',
        type: maintenanceType,
        priority: urgency >= 90 ? 'urgent' : urgency >= 70 ? 'high' : urgency >= 50 ? 'medium' : 'low',
        title: `${maintenanceType.charAt(0).toUpperCase() + maintenanceType.slice(1)} Maintenance: ${eq.name}`,
        description: `AI-recommended ${maintenanceType} maintenance.\n\nTriggers:\n- ${triggerReasons.join('\n- ') || 'Routine schedule'}\n\nEquipment Health: ${healthScore}%\nFailure Probability: ${failureProb}%\nRUL: ${rulDays || 'N/A'} days`,
        recommended_date: recommendedDate.toISOString().split('T')[0],
        estimated_hours: laborHours,
        estimated_cost: laborCost + partsCost,
        suggested_technician: bestTech?.name || null,
        technician_match_score: bestTech ? (bestTech.equipment_specializations?.includes(eq.type) ? 95 : 70) : 0,
        required_parts: requiredParts.map(p => ({
          name: p.name,
          part_number: p.part_number,
          quantity: p.quantity,
          unit_cost: p.unit_cost || 0,
          in_stock: p.quantity_in_stock || 0
        })),
        parts_available: requiredParts.every(p => (p.quantity_in_stock || 0) >= (p.quantity || 1))
      });
    }
  });

  return recommendations.sort((a, b) => b.urgency - a.urgency);
}

function generateOptimizedSchedule(recommendations, technicians, spareParts) {
  // Group by week
  const weeklySchedule = {};
  const technicianLoad = {};
  
  technicians.forEach(t => {
    technicianLoad[t.name] = t.current_workload_hours || 0;
  });

  recommendations.forEach(rec => {
    const weekStart = getWeekStart(new Date(rec.recommended_date));
    const weekKey = weekStart.toISOString().split('T')[0];
    
    if (!weeklySchedule[weekKey]) {
      weeklySchedule[weekKey] = {
        week_start: weekKey,
        tasks: [],
        total_hours: 0,
        total_cost: 0,
        technicians_needed: new Set()
      };
    }

    // Check technician availability
    if (rec.suggested_technician) {
      const currentLoad = technicianLoad[rec.suggested_technician] || 0;
      const tech = technicians.find(t => t.name === rec.suggested_technician);
      const maxHours = tech?.max_weekly_hours || 40;
      
      if (currentLoad + rec.estimated_hours > maxHours) {
        // Find alternative technician
        const alternative = technicians.find(t => 
          t.availability_status === 'available' &&
          (technicianLoad[t.name] || 0) + rec.estimated_hours <= (t.max_weekly_hours || 40)
        );
        if (alternative) {
          rec.suggested_technician = alternative.name;
          rec.technician_match_score = alternative.equipment_specializations?.includes(rec.equipment_type) ? 80 : 60;
        }
      }
      technicianLoad[rec.suggested_technician] = (technicianLoad[rec.suggested_technician] || 0) + rec.estimated_hours;
    }

    weeklySchedule[weekKey].tasks.push(rec);
    weeklySchedule[weekKey].total_hours += rec.estimated_hours;
    weeklySchedule[weekKey].total_cost += rec.estimated_cost;
    if (rec.suggested_technician) {
      weeklySchedule[weekKey].technicians_needed.add(rec.suggested_technician);
    }
  });

  // Convert Sets to arrays
  Object.values(weeklySchedule).forEach(week => {
    week.technicians_needed = Array.from(week.technicians_needed);
  });

  // Calculate summary
  const totalTasks = recommendations.length;
  const criticalTasks = recommendations.filter(r => r.urgency >= 90).length;
  const highPriorityTasks = recommendations.filter(r => r.urgency >= 70).length;
  const totalCost = recommendations.reduce((sum, r) => sum + r.estimated_cost, 0);
  const totalHours = recommendations.reduce((sum, r) => sum + r.estimated_hours, 0);
  const partsUnavailable = recommendations.filter(r => !r.parts_available).length;

  return {
    recommendations,
    weekly_breakdown: Object.values(weeklySchedule).sort((a, b) => a.week_start.localeCompare(b.week_start)),
    summary: {
      total_tasks: totalTasks,
      critical_tasks: criticalTasks,
      high_priority_tasks: highPriorityTasks,
      total_estimated_cost: totalCost,
      total_estimated_hours: totalHours,
      tasks_with_parts_issue: partsUnavailable,
      weeks_scheduled: Object.keys(weeklySchedule).length
    }
  };
}

function getWeekStart(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

async function sendNotifications(base44, notifications) {
  for (const notif of notifications) {
    const { technician, equipment, task, workOrder, recommendation } = notif;
    
    const emailBody = `
Hello ${technician.name},

You have been assigned a new AI-scheduled maintenance task:

WORK ORDER: ${workOrder.work_order_number}
EQUIPMENT: ${equipment.name} (${equipment.type})
LOCATION: ${equipment.location}
PRIORITY: ${recommendation.priority.toUpperCase()}

SCHEDULED DATE: ${recommendation.recommended_date}
ESTIMATED DURATION: ${recommendation.estimated_hours} hours

REASON FOR MAINTENANCE:
${recommendation.trigger_reason}

DESCRIPTION:
${recommendation.description}

${recommendation.required_parts.length > 0 ? `
REQUIRED PARTS:
${recommendation.required_parts.map(p => `- ${p.name} (${p.part_number}): Qty ${p.quantity}`).join('\n')}
` : ''}

Please review and confirm your availability for this assignment.

This task was auto-generated by the AI Maintenance Scheduler.

Best regards,
PredictAI Maintenance System
    `.trim();

    try {
      await base44.integrations.Core.SendEmail({
        to: technician.email,
        subject: `[${recommendation.priority.toUpperCase()}] New Maintenance Assignment: ${equipment.name}`,
        body: emailBody
      });
    } catch (err) {
      console.error(`Failed to send email to ${technician.email}:`, err);
    }
  }
}