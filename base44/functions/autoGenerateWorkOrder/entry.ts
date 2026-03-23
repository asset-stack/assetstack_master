import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { source_type, source_id, equipment_id, data_env } = await req.json();

    // Use the appropriate data environment (dev for test, prod for production)
    const entities = data_env === 'dev' ? base44.devEntities : base44.entities;

    // Fetch all necessary data
    const [equipment, technicians, spareParts, tasks, alerts] = await Promise.all([
      entities.Equipment.list('-created_date', 200),
      entities.Technician.list('-created_date', 50),
      entities.SparePart.list('-created_date', 200),
      entities.MaintenanceTask.list('-created_date', 100),
      entities.Alert.list('-created_date', 100)
    ]);

    const equipmentMap = equipment.reduce((acc, e) => { acc[e.id] = e; return acc; }, {});
    
    let sourceData = null;
    let eq = null;
    let workOrderData = {};

    // Get source data (task or alert)
    if (source_type === 'task') {
      sourceData = tasks.find(t => t.id === source_id);
      if (!sourceData) {
        return Response.json({ error: 'Task not found' }, { status: 404 });
      }
      eq = equipmentMap[sourceData.equipment_id];
      
      workOrderData = {
        maintenance_task_id: source_id,
        equipment_id: sourceData.equipment_id,
        title: sourceData.title,
        description: sourceData.description || `Work order for maintenance task: ${sourceData.title}`,
        type: sourceData.type,
        priority: sourceData.priority,
        estimated_hours: sourceData.estimated_duration_hours,
        estimated_cost: sourceData.cost_estimate
      };
    } else if (source_type === 'alert') {
      sourceData = alerts.find(a => a.id === source_id);
      if (!sourceData) {
        return Response.json({ error: 'Alert not found' }, { status: 404 });
      }
      eq = equipmentMap[sourceData.equipment_id];
      
      // Map alert severity to priority
      const priorityMap = {
        emergency: 'urgent',
        critical: 'high',
        warning: 'medium',
        info: 'low'
      };
      
      // Map alert type to work order type
      const typeMap = {
        anomaly_detected: 'predictive',
        threshold_exceeded: 'corrective',
        failure_predicted: 'predictive',
        maintenance_due: 'preventive',
        degradation_trend: 'predictive',
        sensor_fault: 'corrective'
      };

      workOrderData = {
        equipment_id: sourceData.equipment_id,
        title: `${sourceData.title} - ${eq?.name || 'Equipment'}`,
        description: `${sourceData.message}\n\nRecommended Action: ${sourceData.recommended_action || 'Inspect and address the issue'}`,
        type: typeMap[sourceData.type] || 'corrective',
        priority: priorityMap[sourceData.severity] || 'medium',
        estimated_hours: sourceData.severity === 'emergency' ? 4 : sourceData.severity === 'critical' ? 6 : 3
      };
    } else if (equipment_id) {
      // Direct equipment-based work order
      eq = equipmentMap[equipment_id];
      if (!eq) {
        return Response.json({ error: 'Equipment not found' }, { status: 404 });
      }
      workOrderData = {
        equipment_id: equipment_id,
        title: `Maintenance for ${eq.name}`,
        description: `Scheduled maintenance work order for ${eq.name}`,
        type: 'preventive',
        priority: eq.risk_level === 'critical' ? 'urgent' : eq.risk_level === 'high' ? 'high' : 'medium',
        estimated_hours: 4
      };
    } else {
      return Response.json({ error: 'Invalid source type or missing equipment_id' }, { status: 400 });
    }

    // Suggest technician based on skills and availability
    const suggestedTechnician = suggestTechnician(technicians, eq, workOrderData.type);
    
    // Pre-fill parts based on equipment type and work order type
    const suggestedParts = suggestParts(spareParts, eq, workOrderData.type);

    // Generate work order number
    const woNumber = `WO-${Date.now().toString().slice(-8)}`;

    // Calculate estimated cost
    const laborCost = (workOrderData.estimated_hours || 4) * (suggestedTechnician?.hourly_rate || 75);
    const partsCost = suggestedParts.reduce((sum, p) => sum + (p.unit_cost * p.quantity), 0);
    const estimatedCost = laborCost + partsCost;

    // Create the work order
    const workOrder = await entities.WorkOrder.create({
      work_order_number: woNumber,
      ...workOrderData,
      status: 'draft',
      assigned_to: suggestedTechnician?.id || '',
      assigned_team: suggestedTechnician ? [suggestedTechnician.id] : [],
      parts_used: suggestedParts,
      estimated_cost: estimatedCost,
      history: [{
        timestamp: new Date().toISOString(),
        action: 'Work Order Auto-Generated',
        user: 'System',
        details: `Automatically created from ${source_type || 'equipment'}: ${sourceData?.title || eq?.name}`
      }]
    });

    return Response.json({
      success: true,
      workOrder,
      suggestedTechnician: suggestedTechnician ? {
        id: suggestedTechnician.id,
        name: suggestedTechnician.name,
        matchScore: suggestedTechnician.matchScore
      } : null,
      suggestedParts
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function suggestTechnician(technicians, equipment, workOrderType) {
  if (!technicians.length) return null;

  const availableTechs = technicians.filter(t => t.availability_status === 'available');
  if (!availableTechs.length) return null;

  // Score each technician
  const scored = availableTechs.map(tech => {
    let score = 0;

    // Equipment type match (40 points)
    if (equipment && tech.equipment_specializations?.includes(equipment.type)) {
      score += 40;
    }

    // Skill relevance (20 points)
    const relevantSkills = getRelevantSkills(workOrderType);
    const matchingSkills = tech.skills?.filter(s => relevantSkills.includes(s)).length || 0;
    score += matchingSkills * 10;

    // Certification level (15 points)
    const certScores = { master: 15, expert: 12, senior: 9, intermediate: 6, junior: 3 };
    score += certScores[tech.certification_level] || 0;

    // Performance rating (15 points max)
    score += (tech.performance_rating || 70) * 0.15;

    // Availability/workload (10 points max)
    const availableHours = (tech.max_weekly_hours || 40) - (tech.current_workload_hours || 0);
    score += Math.min(10, availableHours / 4);

    return { ...tech, matchScore: Math.round(score) };
  });

  // Sort by score and return best match
  scored.sort((a, b) => b.matchScore - a.matchScore);
  return scored[0];
}

function getRelevantSkills(workOrderType) {
  const skillMap = {
    preventive: ['mechanical', 'lubrication', 'inspection', 'alignment'],
    predictive: ['vibration analysis', 'thermography', 'ultrasonic testing', 'oil analysis'],
    corrective: ['mechanical', 'electrical', 'troubleshooting', 'welding'],
    emergency: ['mechanical', 'electrical', 'troubleshooting', 'hydraulic'],
    inspection: ['inspection', 'thermography', 'ultrasonic testing', 'visual inspection']
  };
  return skillMap[workOrderType] || ['mechanical'];
}

function suggestParts(spareParts, equipment, workOrderType) {
  if (!spareParts.length || !equipment) return [];

  // Filter parts compatible with equipment type
  const compatibleParts = spareParts.filter(p => 
    p.compatible_equipment_types?.includes(equipment.type) ||
    p.category === 'consumable'
  );

  // Suggest based on work order type
  const suggestions = [];
  
  if (workOrderType === 'preventive' || workOrderType === 'predictive') {
    // Suggest filters, lubricants, seals
    const filters = compatibleParts.filter(p => p.category === 'filter');
    const lubricants = compatibleParts.filter(p => p.category === 'consumable' && p.name?.toLowerCase().includes('lubri'));
    const seals = compatibleParts.filter(p => p.category === 'seal');
    
    if (filters.length) suggestions.push({ ...formatPart(filters[0]), quantity: 1 });
    if (lubricants.length) suggestions.push({ ...formatPart(lubricants[0]), quantity: 1 });
    if (seals.length) suggestions.push({ ...formatPart(seals[0]), quantity: 1 });
  }
  
  if (workOrderType === 'corrective' || workOrderType === 'emergency') {
    // Suggest bearings, seals based on criticality
    const bearings = compatibleParts.filter(p => p.category === 'bearing');
    const seals = compatibleParts.filter(p => p.category === 'seal');
    
    if (bearings.length) suggestions.push({ ...formatPart(bearings[0]), quantity: 2 });
    if (seals.length) suggestions.push({ ...formatPart(seals[0]), quantity: 1 });
  }

  // Add critical parts that are low/out of stock warning
  const criticalLowStock = compatibleParts.filter(p => 
    p.criticality === 'critical' && 
    (p.quantity_in_stock || 0) <= (p.minimum_stock_level || 5)
  );

  return suggestions.slice(0, 5);
}

function formatPart(part) {
  return {
    part_name: part.name,
    part_number: part.part_number,
    unit_cost: part.unit_cost || 0,
    notes: `Available: ${part.quantity_in_stock || 0} in stock`
  };
}