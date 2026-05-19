import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // Fetch all active maintenance plans
    const plans = await base44.asServiceRole.entities.MaintenancePlan.filter({ is_active: true }, '-created_date', 500);
    const equipment = await base44.asServiceRole.entities.Equipment.list();
    const technicians = await base44.asServiceRole.entities.Technician.filter({ 
      availability_status: 'available' 
    });
    const existingTasks = await base44.asServiceRole.entities.MaintenanceTask.filter({
      status: 'scheduled'
    });

    const equipmentMap = equipment.reduce((acc, e) => { acc[e.id] = e; return acc; }, {});
    const today = new Date();
    const tasksGenerated = [];

    for (const plan of plans) {
      // Determine which equipment this plan applies to
      let targetEquipment = [];
      
      if (plan.equipment_ids?.length > 0) {
        targetEquipment = plan.equipment_ids.map(id => equipmentMap[id]).filter(Boolean);
      } else if (plan.equipment_types?.length > 0) {
        targetEquipment = equipment.filter(e => plan.equipment_types.includes(e.type));
      }

      for (const eq of targetEquipment) {
        // Check if maintenance is needed based on schedule type
        let shouldSchedule = false;
        let reason = '';

        if (plan.schedule_type === 'time_based' || plan.schedule_type === 'hybrid') {
          // Check last maintenance date
          const lastMaintenance = eq.last_maintenance_date ? new Date(eq.last_maintenance_date) : null;
          const daysSinceLastMaintenance = lastMaintenance 
            ? Math.floor((today - lastMaintenance) / (1000 * 60 * 60 * 24))
            : Infinity;

          let frequencyInDays = plan.frequency_value;
          if (plan.frequency_unit === 'weeks') frequencyInDays *= 7;
          if (plan.frequency_unit === 'months') frequencyInDays *= 30;
          if (plan.frequency_unit === 'years') frequencyInDays *= 365;

          if (daysSinceLastMaintenance >= frequencyInDays - (plan.advance_notice_days || 7)) {
            shouldSchedule = true;
            reason = `Time-based: ${daysSinceLastMaintenance} days since last maintenance`;
          }
        }

        if (plan.schedule_type === 'usage_based' || plan.schedule_type === 'hybrid') {
          // Check operating hours
          const operatingHours = eq.operating_hours || 0;
          // Would need to track last maintenance hours to properly calculate
          // For now, use a simple threshold check
          if (operatingHours > 0 && plan.usage_threshold) {
            const hoursSinceService = operatingHours % plan.usage_threshold;
            if (hoursSinceService >= plan.usage_threshold - 100) {
              shouldSchedule = true;
              reason = `Usage-based: ${operatingHours} operating hours`;
            }
          }
        }

        if (plan.schedule_type === 'condition_based' || plan.schedule_type === 'hybrid') {
          // Check health score
          if (plan.health_score_threshold && eq.health_score < plan.health_score_threshold) {
            shouldSchedule = true;
            reason = `Condition-based: Health score ${eq.health_score}% below threshold ${plan.health_score_threshold}%`;
          }
        }

        if (!shouldSchedule) continue;

        // Check if task already exists for this equipment and plan
        const existingTask = existingTasks.find(t => 
          t.equipment_id === eq.id && 
          t.title?.includes(plan.task_template?.title || plan.name)
        );
        
        if (existingTask) continue;

        // Calculate scheduled date
        const scheduledDate = new Date(today);
        scheduledDate.setDate(scheduledDate.getDate() + (plan.advance_notice_days || 7));

        // Find best technician if auto-assign is enabled
        let assignedTo = null;
        if (plan.auto_assign && technicians.length > 0) {
          // Score technicians
          const scoredTechs = technicians.map(tech => {
            let score = 0;
            
            // Prefer specialists
            if (plan.assignment_rules?.prefer_specialist) {
              if (tech.equipment_specializations?.includes(eq.type)) {
                score += 30;
              }
            }
            
            // Balance workload
            if (plan.assignment_rules?.balance_workload) {
              const loadPercent = (tech.current_workload_hours || 0) / (tech.max_weekly_hours || 40);
              score += (1 - loadPercent) * 20;
            }
            
            // Check skill level
            const minLevel = plan.assignment_rules?.min_skill_level || 'junior';
            const levelOrder = { junior: 1, intermediate: 2, senior: 3, expert: 4, master: 5 };
            if (levelOrder[tech.certification_level] >= levelOrder[minLevel]) {
              score += 10;
            }
            
            // Performance rating
            score += ((tech.performance_rating || 70) / 100) * 15;
            
            return { technician: tech, score };
          }).sort((a, b) => b.score - a.score);

          if (scoredTechs.length > 0) {
            assignedTo = scoredTechs[0].technician.id;
          }
        }

        // Create the maintenance task
        const taskTitle = plan.task_template?.title 
          ? plan.task_template.title.replace('{equipment_name}', eq.name)
          : `${plan.name} - ${eq.name}`;

        const newTask = await base44.asServiceRole.entities.MaintenanceTask.create({
          equipment_id: eq.id,
          title: taskTitle,
          description: plan.task_template?.description || `Scheduled maintenance per plan: ${plan.name}. ${reason}`,
          type: plan.task_template?.type || 'preventive',
          priority: plan.task_template?.priority || 'medium',
          status: 'scheduled',
          scheduled_date: scheduledDate.toISOString().split('T')[0],
          estimated_duration_hours: plan.task_template?.estimated_hours || 4,
          assigned_to: assignedTo,
          ai_recommended: true,
          ai_confidence: 85,
          parts_required: plan.task_template?.required_parts || [],
          notes: `Auto-generated from maintenance plan: ${plan.name}`
        });

        tasksGenerated.push({
          taskId: newTask.id,
          equipmentName: eq.name,
          planName: plan.name,
          reason,
          assignedTo
        });

        // Update plan statistics
        await base44.asServiceRole.entities.MaintenancePlan.update(plan.id, {
          last_generated_date: today.toISOString().split('T')[0],
          tasks_generated_count: (plan.tasks_generated_count || 0) + 1,
          next_scheduled_date: scheduledDate.toISOString().split('T')[0]
        });

        // Update technician workload if assigned
        if (assignedTo) {
          const tech = technicians.find(t => t.id === assignedTo);
          if (tech) {
            await base44.asServiceRole.entities.Technician.update(assignedTo, {
              current_workload_hours: (tech.current_workload_hours || 0) + (plan.task_template?.estimated_hours || 4)
            });
          }
        }
      }
    }

    return Response.json({
      success: true,
      tasksGenerated: tasksGenerated.length,
      details: tasksGenerated
    });

  } catch (error) {
    console.error('Error generating scheduled maintenance:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});