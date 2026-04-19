import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    // Fetch all relevant data in parallel
    const [equipment, tasks, workOrders, alerts, technicians, spareParts] = await Promise.all([
      base44.entities.Equipment.list('-updated_date', 200),
      base44.entities.MaintenanceTask.list('-updated_date', 100),
      base44.entities.WorkOrder.list('-updated_date', 100),
      base44.entities.Alert.filter({ status: 'active' }, '-created_date', 50),
      base44.entities.Technician.list('-updated_date', 100),
      base44.entities.SparePart.list('-updated_date', 100).catch(() => []),
    ]);

    // Build a compact summary for the LLM
    const summary = {
      totalAssets: equipment.length,
      criticalAssets: equipment.filter(e => e.risk_level === 'critical').length,
      highRiskAssets: equipment.filter(e => e.risk_level === 'high').length,
      operational: equipment.filter(e => e.status === 'operational').length,
      offline: equipment.filter(e => e.status === 'offline').length,
      avgHealth: equipment.length ? Math.round(equipment.reduce((s, e) => s + (e.health_score || 0), 0) / equipment.length) : 0,
      activeAlerts: alerts.length,
      criticalAlerts: alerts.filter(a => a.severity === 'critical' || a.severity === 'emergency').length,
      overdueTasks: tasks.filter(t => t.status === 'overdue').length,
      pendingTasks: tasks.filter(t => t.status === 'scheduled' || t.status === 'in_progress').length,
      openWorkOrders: workOrders.filter(w => w.status === 'open' || w.status === 'in_progress' || w.status === 'assigned').length,
      availableTechnicians: technicians.filter(t => t.availability_status === 'available').length,
      lowStockParts: spareParts.filter(p => p.quantity_in_stock <= p.minimum_stock_level).length,
    };

    // Top 10 at-risk equipment
    const atRiskList = equipment
      .filter(e => e.risk_level === 'critical' || e.risk_level === 'high' || (e.failure_probability || 0) > 30)
      .sort((a, b) => (b.failure_probability || 0) - (a.failure_probability || 0))
      .slice(0, 10)
      .map(e => ({
        name: e.name,
        type: e.type,
        location: e.location,
        health: e.health_score,
        risk: e.risk_level,
        failureProbability: e.failure_probability,
        rulDays: e.remaining_useful_life_days,
      }));

    const urgentAlerts = alerts
      .filter(a => a.severity === 'critical' || a.severity === 'emergency' || a.severity === 'warning')
      .slice(0, 10)
      .map(a => ({ title: a.title, severity: a.severity, message: a.message, action: a.recommended_action }));

    const prompt = `You are AssetMind, the intelligent command center for an asset management platform. Generate a structured morning briefing for the operations manager.

Current State:
${JSON.stringify(summary, null, 2)}

Top At-Risk Assets:
${JSON.stringify(atRiskList, null, 2)}

Urgent Alerts:
${JSON.stringify(urgentAlerts, null, 2)}

Generate a concise, actionable briefing. Be specific (use asset names, numbers). Prioritize what needs attention TODAY.`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      model: 'claude_sonnet_4_6',
      response_json_schema: {
        type: 'object',
        properties: {
          headline: { type: 'string', description: 'One-sentence summary of fleet state (max 120 chars)' },
          status: { type: 'string', enum: ['healthy', 'attention', 'critical'], description: 'Overall fleet health status' },
          briefing: { type: 'string', description: '2-3 sentence morning briefing highlighting the most important things to know today' },
          priority_actions: {
            type: 'array',
            description: 'Top 5 things the manager should do today, in priority order',
            items: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                reason: { type: 'string', description: 'Why this is urgent' },
                urgency: { type: 'string', enum: ['critical', 'high', 'medium'] },
                asset_name: { type: 'string' },
                action_type: { type: 'string', enum: ['inspect', 'repair', 'replace', 'review', 'schedule', 'order_parts'] },
              },
              required: ['title', 'reason', 'urgency']
            }
          },
          insights: {
            type: 'array',
            description: '3-5 non-obvious patterns or insights from the data',
            items: {
              type: 'object',
              properties: {
                type: { type: 'string', enum: ['trend', 'anomaly', 'opportunity', 'risk', 'efficiency'] },
                title: { type: 'string' },
                description: { type: 'string' },
              },
              required: ['type', 'title', 'description']
            }
          },
          key_metrics: {
            type: 'object',
            properties: {
              fleet_health_trend: { type: 'string', enum: ['improving', 'stable', 'declining'] },
              risk_delta: { type: 'string', description: 'Short note on how risk is trending' },
              cost_outlook: { type: 'string', description: 'Brief cost/budget outlook' },
            }
          }
        },
        required: ['headline', 'status', 'briefing', 'priority_actions', 'insights']
      }
    });

    return Response.json({
      briefing: result,
      summary,
      generated_at: new Date().toISOString(),
      user: user.full_name,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});