import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Admin-only: writes maintenance tasks across the entire fleet.
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // Service role for automated task generation
    const equipment = await base44.asServiceRole.entities.Equipment.list('-failure_probability', 100);
    const existingTasks = await base44.asServiceRole.entities.MaintenanceTask.list('-created_date', 500);
    
    const generatedTasks = [];
    const now = new Date();
    
    for (const asset of equipment) {
      // Skip if already has scheduled/in-progress tasks
      // Check both exact ID match and name-based match for legacy data
      const hasPendingTask = existingTasks.some(
        t => (t.equipment_id === asset.id || 
              t.title?.toLowerCase().includes(asset.name?.toLowerCase())) && 
        (t.status === 'scheduled' || t.status === 'in_progress')
      );
      
      if (hasPendingTask) continue;
      
      const failureProbability = asset.failure_probability || 0;
      const rul = asset.remaining_useful_life_days || 999;
      const healthScore = asset.health_score || 100;
      const criticality = asset.criticality || 'medium';
      
      // Determine if maintenance is needed
      let shouldGenerateTask = false;
      let taskType = 'preventive';
      let priority = 'medium';
      let scheduledDays = 30;
      let confidence = 0;
      
      // Critical failure risk
      if (failureProbability > 60 || rul < 30 || healthScore < 40) {
        shouldGenerateTask = true;
        taskType = 'emergency';
        priority = 'urgent';
        scheduledDays = 1;
        confidence = 95;
      }
      // High failure risk
      else if (failureProbability > 40 || rul < 60 || healthScore < 60) {
        shouldGenerateTask = true;
        taskType = 'predictive';
        priority = 'high';
        scheduledDays = 7;
        confidence = 88;
      }
      // Moderate risk
      else if (failureProbability > 25 || rul < 90 || healthScore < 75) {
        shouldGenerateTask = true;
        taskType = 'predictive';
        priority = 'medium';
        scheduledDays = 14;
        confidence = 78;
      }
      // Preventive (mission critical assets)
      else if (criticality === 'mission_critical' && rul < 180) {
        shouldGenerateTask = true;
        taskType = 'preventive';
        priority = 'medium';
        scheduledDays = 30;
        confidence = 70;
      }
      
      if (!shouldGenerateTask) continue;
      
      // Calculate failure cost
      const baseCost = {
        'low': 5000,
        'medium': 15000,
        'high': 50000,
        'mission_critical': 200000
      }[criticality] || 15000;
      
      const estimatedFailureCost = baseCost * (failureProbability / 100) * 2;
      const maintenanceCost = Math.round(baseCost * 0.15);
      
      // AI-suggested personnel based on asset type
      const personnelSuggestions = {
        'motor': 'Electrical Technician',
        'pump': 'Mechanical Engineer',
        'compressor': 'HVAC Specialist',
        'turbine': 'Turbine Technician',
        'generator': 'Electrical Engineer',
        'transformer': 'High Voltage Technician',
        'railway_track': 'Track Maintenance Crew',
        'bridge': 'Structural Engineer',
        'building': 'Facilities Manager',
        'tunnel': 'Civil Engineer',
        'dam': 'Hydraulic Engineer',
        'wind_turbine': 'Wind Technician'
      };
      
      const assignedTo = personnelSuggestions[asset.type] || 'Maintenance Technician';
      
      // AI-suggested parts based on common failure modes
      const partsSuggestions = {
        'motor': ['Bearings', 'Motor Winding', 'Coupling'],
        'pump': ['Impeller', 'Seal Kit', 'Bearings'],
        'compressor': ['Valve Plate', 'Piston Rings', 'Oil Filter'],
        'turbine': ['Blades', 'Bearings', 'Seals'],
        'generator': ['Brushes', 'Voltage Regulator', 'Cooling Fan'],
        'transformer': ['Insulation Oil', 'Bushings', 'Cooling System'],
        'railway_track': ['Rail Sections', 'Fasteners', 'Ballast'],
        'bridge': ['Expansion Joints', 'Bearings', 'Protective Coating'],
        'building': ['HVAC Filters', 'Structural Reinforcement', 'Waterproofing'],
        'wind_turbine': ['Gearbox Oil', 'Brake Pads', 'Pitch System']
      };
      
      const partsRequired = partsSuggestions[asset.type] || ['General Maintenance Kit'];
      
      const scheduledDate = new Date(now.getTime() + scheduledDays * 24 * 60 * 60 * 1000);
      
      const task = {
        equipment_id: asset.id,
        title: `AI-Recommended ${taskType.charAt(0).toUpperCase() + taskType.slice(1)} Maintenance - ${asset.name}`,
        description: `Automated task generated based on: Failure Probability: ${failureProbability.toFixed(1)}%, RUL: ${rul} days, Health: ${healthScore}%. Estimated failure cost: $${Math.round(estimatedFailureCost).toLocaleString()}. Recommended maintenance cost: $${maintenanceCost.toLocaleString()}.`,
        type: taskType,
        priority: priority,
        status: 'scheduled',
        scheduled_date: scheduledDate.toISOString().split('T')[0],
        estimated_duration_hours: taskType === 'emergency' ? 8 : taskType === 'predictive' ? 4 : 2,
        assigned_to: assignedTo,
        cost_estimate: maintenanceCost,
        parts_required: partsRequired,
        ai_recommended: true,
        ai_confidence: confidence,
        notes: `Critical factors - Criticality: ${criticality}, Risk Level: ${asset.risk_level}, Status: ${asset.status}`
      };
      
      const created = await base44.asServiceRole.entities.MaintenanceTask.create(task);
      generatedTasks.push(created);
    }
    
    return Response.json({
      success: true,
      tasksGenerated: generatedTasks.length,
      tasks: generatedTasks,
      message: `Successfully generated ${generatedTasks.length} AI-recommended maintenance tasks`
    });
    
  } catch (error) {
    return Response.json({ 
      success: false,
      error: error.message,
      tasksGenerated: 0
    }, { status: 500 });
  }
});