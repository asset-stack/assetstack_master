import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Records the user's reaction to a piece of advice (accept/reject/modify) and
// nudges AdvisorMemory toward the user's revealed preferences (lightweight
// learning loop). Best-effort: never blocks the UI.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { advice_log_id, user_action, user_reasoning } = await req.json();
    if (!advice_log_id || !user_action) {
      return Response.json({ error: 'advice_log_id and user_action required' }, { status: 400 });
    }

    const svc = base44.asServiceRole;
    await svc.entities.AssetMindAdviceLog.update(advice_log_id, {
      user_action,
      user_reasoning: user_reasoning || '',
    });

    // Recompute simple acceptance pattern across recent logs
    const recent = await svc.entities.AssetMindAdviceLog.list('-created_date', 50).catch(() => []);
    const accepted = recent.filter((l) => l.user_action === 'accepted').length;
    const rejected = recent.filter((l) => l.user_action === 'rejected').length;
    const total = accepted + rejected;

    if (total >= 4) {
      const memoryList = await svc.entities.AdvisorMemory.list('-last_updated', 1).catch(() => []);
      const acceptRate = accepted / total;
      // Infer capital risk appetite from acceptance behaviour
      const inferredCapital = acceptRate > 0.7 ? 'aggressive' : acceptRate < 0.35 ? 'conservative' : 'balanced';
      const patch = {
        risk_appetite_capital: inferredCapital,
        decision_patterns: { accepted, rejected, accept_rate: Number(acceptRate.toFixed(2)) },
        last_updated: new Date().toISOString(),
      };
      if (memoryList[0]) {
        await svc.entities.AdvisorMemory.update(memoryList[0].id, patch);
      } else {
        await svc.entities.AdvisorMemory.create({
          client_account_id: user.active_client_account_id || '',
          strategic_theme: 'asset_renewal',
          ...patch,
        });
      }
    }

    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});