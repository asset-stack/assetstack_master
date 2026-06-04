import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// AssetMind multi-lens strategic synthesis engine.
// Loads portfolio context + advisor memory, detects the advisory "mode",
// runs a 9-lens evaluation via Gemini 3.1 Pro, logs the advice, and returns
// a structured recommendation.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { question, conversation_id } = await req.json();
    if (!question) return Response.json({ error: 'No question provided' }, { status: 400 });

    const svc = base44.asServiceRole;

    // ---- Gather portfolio context (bounded) ----
    const [equipment, alerts, tasks, capitalItems, memoryList] = await Promise.all([
      svc.entities.Equipment.list('-created_date', 300).catch(() => []),
      svc.entities.Alert.filter({ status: 'active' }, '-created_date', 50).catch(() => []),
      svc.entities.MaintenanceTask.list('-created_date', 100).catch(() => []),
      svc.entities.CapitalPlanItem.list('-created_date', 100).catch(() => []),
      svc.entities.AdvisorMemory.list('-last_updated', 1).catch(() => []),
    ]);

    const memory = memoryList[0] || null;

    const criticalAlerts = alerts.filter((a) => ['critical', 'emergency'].includes(a.severity)).length;
    const deferredCost = capitalItems.reduce((s, c) => s + (Number(c.estimated_cost) || 0), 0);
    const urgentTasks = tasks.filter((t) => ['urgent', 'high'].includes(t.priority)).length;

    const context_snapshot = {
      equipment_count: equipment.length,
      critical_alerts_count: criticalAlerts,
      active_alerts: alerts.length,
      total_deferred_cost: Math.round(deferredCost),
      urgent_tasks: urgentTasks,
      capital_items: capitalItems.length,
    };

    const memoryBlock = memory
      ? `STRATEGIC MEMORY (learned preferences):
- Strategic theme: ${memory.strategic_theme}
- Risk appetite (equipment / capital): ${memory.risk_appetite_equipment} / ${memory.risk_appetite_capital}
- Funding appetite: ${memory.funding_appetite}
- Prioritized categories: ${(memory.asset_categories_prioritized || []).join(', ') || 'none recorded'}
- Deprioritized categories: ${(memory.asset_categories_deprioritized || []).join(', ') || 'none recorded'}
- Sector: ${memory.sector_context || 'unknown'}
- Board approval threshold: ${memory.board_approval_threshold ? '$' + memory.board_approval_threshold.toLocaleString() : 'not set'}
- Learned insights: ${(memory.learned_insights || []).map((i) => i.insight).join('; ') || 'none yet'}`
      : 'STRATEGIC MEMORY: none recorded yet (first interaction — infer a sensible default profile).';

    const topAssets = equipment.slice(0, 40).map((e) =>
      `- ${e.name} (${e.type}) @ ${e.location} | health ${e.health_score ?? 'N/A'} | risk ${e.risk_level} | failure prob ${e.failure_probability ?? 'N/A'}%`
    ).join('\n');

    const prompt = `You are AssetMind — an elite strategic advisor for an asset/facilities operator. Think like a board of specialists, then synthesize one clear recommendation.

USER QUESTION: "${question}"

PORTFOLIO SNAPSHOT:
- Equipment: ${context_snapshot.equipment_count} assets
- Active alerts: ${context_snapshot.active_alerts} (${context_snapshot.critical_alerts_count} critical)
- Urgent/high tasks: ${context_snapshot.urgent_tasks}
- Capital plan items: ${context_snapshot.capital_items} (total est. $${context_snapshot.total_deferred_cost.toLocaleString()})

TOP ASSETS:
${topAssets || 'No equipment data.'}

${memoryBlock}

INSTRUCTIONS:
1. Detect the advisory MODE that best fits the question: risk_mitigation, cost_optimization, growth_operator, emergency_triage, strategic_board, or compliance_audit.
2. Evaluate through up to 9 lenses where relevant: Researcher (what the data says), Strategist (strategic fit), Investor (ROI/capital), Operator (execution feasibility), Risk Officer (failure modes), Compliance Auditor (standards), Technology Scout (better options), Contrarian (what if we're wrong), Quality Gate (is this actionable & novel).
3. Respect the strategic memory — align with their themes and risk appetite; flag if you deliberately diverge.
4. Lead with the answer. Use markdown. Cite specific numbers. End with 1-2 concrete next steps.

Return a thorough, decision-grade response in the "response" field.`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      model: 'gemini_3_1_pro',
      response_json_schema: {
        type: 'object',
        properties: {
          response: { type: 'string', description: 'Full markdown recommendation' },
          advisor_mode_detected: { type: 'string' },
          confidence_score: { type: 'number' },
          lenses_engaged: { type: 'array', items: { type: 'string' } },
          recommended_action: { type: 'string' },
          estimated_impact: {
            type: 'object',
            properties: {
              cost_savings: { type: 'number' },
              risk_reduction_pct: { type: 'number' },
              revenue_potential: { type: 'number' },
            },
          },
        },
        required: ['response'],
      },
    });

    // ---- Log the advice ----
    let logId = null;
    try {
      const log = await svc.entities.AssetMindAdviceLog.create({
        client_account_id: user.active_client_account_id || '',
        conversation_id: conversation_id || '',
        query_text: question,
        advisor_mode_detected: result.advisor_mode_detected || undefined,
        context_snapshot,
        lenses_engaged: result.lenses_engaged || [],
        recommendation: result.response,
        confidence_score: result.confidence_score ?? null,
        recommended_action: result.recommended_action || '',
        estimated_impact: result.estimated_impact || {},
        user_action: 'pending',
        outcome: 'pending',
        created_at: new Date().toISOString(),
      });
      logId = log.id;
    } catch (_) { /* logging is best-effort */ }

    return Response.json({ ...result, advice_log_id: logId, context_snapshot });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});