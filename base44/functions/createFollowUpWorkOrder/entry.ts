import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { completed_work_order_id, follow_up_type, custom_title, custom_description } = await req.json();

    // Fetch the completed work order
    const workOrders = await base44.entities.WorkOrder.list('-created_date', 500);
    const completedWO = workOrders.find(wo => wo.id === completed_work_order_id);
    
    if (!completedWO) {
      return Response.json({ error: 'Work order not found' }, { status: 404 });
    }

    // Fetch related data
    const [equipment, technicians, spareParts] = await Promise.all([
      base44.entities.Equipment.list('-created_date', 200),
      base44.entities.Technician.list('-created_date', 50),
      base44.entities.SparePart.list('-created_date', 200)
    ]);

    const eq = equipment.find(e => e.id === completedWO.equipment_id);
    const equipmentMap = equipment.reduce((acc, e) => { acc[e.id] = e; return acc; }, {});

    // Determine follow-up type and details
    let followUpData = {};
    
    if (follow_up_type === 'inspection') {
      // Follow-up inspection after repair
      const inspectionDate = new Date();
      inspectionDate.setDate(inspectionDate.getDate() + 7); // 7 days later
      
      followUpData = {
        title: custom_title || `Follow-up Inspection: ${eq?.name || 'Equipment'}`,
        description: custom_description || `Follow-up inspection after work order ${completedWO.work_order_number}.\n\nOriginal work: ${completedWO.title}\n\nFindings: ${completedWO.findings || 'N/A'}\n\nVerify that repairs are holding and equipment is operating normally.`,
        type: 'inspection',
        priority: 'medium',
        estimated_hours: 1,
        scheduled_start: inspectionDate.toISOString()
      };
    } else if (follow_up_type === 'preventive') {
      // Schedule next preventive maintenance
      const nextPMDate = new Date();
      nextPMDate.setMonth(nextPMDate.getMonth() + 3); // 3 months later
      
      followUpData = {
        title: custom_title || `Scheduled PM: ${eq?.name || 'Equipment'}`,
        description: custom_description || `Scheduled preventive maintenance following work order ${completedWO.work_order_number}.\n\nBased on equipment history and manufacturer recommendations.`,
        type: 'preventive',
        priority: 'low',
        estimated_hours: completedWO.estimated_hours || 4,
        scheduled_start: nextPMDate.toISOString()
      };
    } else if (follow_up_type === 'corrective') {
      // Additional corrective work needed
      followUpData = {
        title: custom_title || `Additional Repairs: ${eq?.name || 'Equipment'}`,
        description: custom_description || `Additional corrective work required based on findings from work order ${completedWO.work_order_number}.\n\nFollow-up notes: ${completedWO.follow_up_notes || 'Additional repairs needed'}`,
        type: 'corrective',
        priority: completedWO.priority || 'medium',
        estimated_hours: Math.ceil((completedWO.estimated_hours || 4) * 0.5)
      };
    } else if (follow_up_type === 'ai_recommended') {
      // AI-based recommendation using equipment health and history
      const recommendation = generateAIRecommendation(completedWO, eq, workOrders);
      followUpData = {
        title: custom_title || recommendation.title,
        description: custom_description || recommendation.description,
        type: recommendation.type,
        priority: recommendation.priority,
        estimated_hours: recommendation.estimated_hours,
        scheduled_start: recommendation.scheduled_start
      };
    } else {
      // Default: use completed work order's follow-up notes
      followUpData = {
        title: custom_title || `Follow-up: ${completedWO.title}`,
        description: custom_description || completedWO.follow_up_notes || 'Follow-up work required',
        type: completedWO.type,
        priority: 'medium',
        estimated_hours: 2
      };
    }

    // Generate work order number
    const woNumber = `WO-${Date.now().toString().slice(-8)}`;

    // Suggest technician (prefer same technician for continuity)
    let suggestedTechnician = null;
    if (completedWO.assigned_to) {
      suggestedTechnician = technicians.find(t => t.name === completedWO.assigned_to && t.availability_status === 'available');
    }
    if (!suggestedTechnician) {
      const availableTechs = technicians.filter(t => t.availability_status === 'available');
      if (availableTechs.length && eq) {
        suggestedTechnician = availableTechs.find(t => t.equipment_specializations?.includes(eq.type)) || availableTechs[0];
      }
    }

    // Create the follow-up work order
    const followUpWO = await base44.entities.WorkOrder.create({
      work_order_number: woNumber,
      equipment_id: completedWO.equipment_id,
      ...followUpData,
      status: 'draft',
      assigned_to: suggestedTechnician?.name || '',
      assigned_team: suggestedTechnician ? [suggestedTechnician.name] : [],
      estimated_cost: (followUpData.estimated_hours || 2) * (suggestedTechnician?.hourly_rate || 75),
      history: [{
        timestamp: new Date().toISOString(),
        action: 'Follow-up Work Order Created',
        user: 'System',
        details: `Auto-generated follow-up from completed work order ${completedWO.work_order_number}. Type: ${follow_up_type}`
      }]
    });

    // Update original work order to link to follow-up
    await base44.entities.WorkOrder.update(completed_work_order_id, {
      history: [
        ...(completedWO.history || []),
        {
          timestamp: new Date().toISOString(),
          action: 'Follow-up Work Order Created',
          user: 'System',
          details: `Follow-up work order ${woNumber} created`
        }
      ]
    });

    return Response.json({
      success: true,
      followUpWorkOrder: followUpWO,
      parentWorkOrderNumber: completedWO.work_order_number,
      suggestedTechnician: suggestedTechnician ? { name: suggestedTechnician.name } : null
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function generateAIRecommendation(completedWO, equipment, allWorkOrders) {
  // Analyze work order history for this equipment
  const equipmentHistory = allWorkOrders.filter(wo => 
    wo.equipment_id === completedWO.equipment_id && 
    wo.status === 'completed'
  );

  // Count corrective vs preventive
  const correctiveCount = equipmentHistory.filter(wo => wo.type === 'corrective' || wo.type === 'emergency').length;
  const preventiveCount = equipmentHistory.filter(wo => wo.type === 'preventive' || wo.type === 'predictive').length;

  // Equipment health-based recommendation
  const healthScore = equipment?.health_score || 70;
  const riskLevel = equipment?.risk_level || 'medium';

  let recommendation = {
    title: '',
    description: '',
    type: 'preventive',
    priority: 'medium',
    estimated_hours: 2,
    scheduled_start: null
  };

  if (healthScore < 60 || riskLevel === 'critical' || riskLevel === 'high') {
    // High risk - schedule predictive maintenance soon
    const schedDate = new Date();
    schedDate.setDate(schedDate.getDate() + 3);
    
    recommendation = {
      title: `AI Recommended: Predictive Maintenance for ${equipment?.name || 'Equipment'}`,
      description: `AI Analysis:\n- Equipment health: ${healthScore}%\n- Risk level: ${riskLevel}\n- Recent corrective work: ${correctiveCount} incidents\n\nRecommendation: Perform predictive maintenance to prevent potential failure. Focus on vibration analysis and thermal inspection.`,
      type: 'predictive',
      priority: healthScore < 50 ? 'high' : 'medium',
      estimated_hours: 4,
      scheduled_start: schedDate.toISOString()
    };
  } else if (correctiveCount > preventiveCount * 2) {
    // Too many corrective actions - increase preventive frequency
    const schedDate = new Date();
    schedDate.setDate(schedDate.getDate() + 14);
    
    recommendation = {
      title: `AI Recommended: Increased PM Frequency for ${equipment?.name || 'Equipment'}`,
      description: `AI Analysis:\n- Corrective maintenance ratio: ${correctiveCount}:${preventiveCount}\n- Pattern indicates reactive maintenance mode\n\nRecommendation: Increase preventive maintenance frequency to reduce unplanned downtime.`,
      type: 'preventive',
      priority: 'medium',
      estimated_hours: 3,
      scheduled_start: schedDate.toISOString()
    };
  } else {
    // Standard follow-up inspection
    const schedDate = new Date();
    schedDate.setDate(schedDate.getDate() + 30);
    
    recommendation = {
      title: `AI Recommended: Routine Inspection for ${equipment?.name || 'Equipment'}`,
      description: `AI Analysis:\n- Equipment health: ${healthScore}%\n- Maintenance balance: Good\n\nRecommendation: Schedule routine inspection to maintain current performance levels.`,
      type: 'inspection',
      priority: 'low',
      estimated_hours: 1,
      scheduled_start: schedDate.toISOString()
    };
  }

  return recommendation;
}