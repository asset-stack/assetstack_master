import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Autonomous opportunity scanner. Uses an internet-grounded LLM to surface
// real, current external opportunities (government grants, ASX/market signals,
// tenders, tech innovations), scores each against the live portfolio, and
// persists high-relevance matches as ExternalOpportunity records.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    // Allow both interactive (user) and automation (service-role) invocation.
    const user = await base44.auth.me().catch(() => null);

    const body = await req.json().catch(() => ({}));
    const minRelevance = Number(body.min_relevance) || 55;

    const svc = base44.asServiceRole;

    const [equipment, locations, memoryList] = await Promise.all([
      svc.entities.Equipment.list('-created_date', 200).catch(() => []),
      svc.entities.Location.list('-created_date', 100).catch(() => []),
      svc.entities.AdvisorMemory.list('-last_updated', 1).catch(() => []),
    ]);
    const memory = memoryList[0] || null;

    // Build a compact portfolio profile for matching
    const typeCounts = {};
    equipment.forEach((e) => { typeCounts[e.type] = (typeCounts[e.type] || 0) + 1; });
    const assetProfile = Object.entries(typeCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .map(([t, c]) => `${t} x${c}`)
      .join(', ');
    const locProfile = locations.slice(0, 20).map((l) => `${l.name} (${l.location_type || 'site'}, ${l.region || l.city || 'AU'})`).join('; ');

    const sector = memory?.sector_context || 'local government / facilities operator';
    const theme = memory?.strategic_theme || 'asset renewal and cost optimization';

    const prompt = `You are an opportunity-intelligence analyst for an Australian ${sector}. Find REAL, CURRENT external opportunities this organisation could pursue. Today is ${new Date().toISOString().slice(0, 10)}.

THEIR PORTFOLIO:
- Asset mix: ${assetProfile || 'mixed infrastructure & facilities'}
- Locations: ${locProfile || 'multiple regional sites'}
- Strategic theme: ${theme}

SCAN THESE SOURCE TYPES (use current web context):
- government_grant: federal/state infrastructure, sustainability, community & water/energy grants currently open
- asx_announcement: listed suppliers/technology vendors relevant to their asset types
- tender_db: open tenders or partnership RFPs they could bid on or benefit from
- technology_innovation: emerging tech that improves their asset performance or cuts cost
- sustainability_initiative: rebates, carbon, energy-efficiency programs
- industry_report: notable sector signals affecting strategy

For EACH opportunity, score relevance 0-100 against THIS portfolio and explain why. Only return opportunities scoring >= ${minRelevance}. Return up to 8.`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      add_context_from_internet: true,
      model: 'gemini_3_1_pro',
      response_json_schema: {
        type: 'object',
        properties: {
          opportunities: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                source: { type: 'string' },
                source_name: { type: 'string' },
                title: { type: 'string' },
                summary: { type: 'string' },
                url: { type: 'string' },
                closing_date: { type: 'string' },
                category: { type: 'string' },
                geographic_scope: { type: 'string' },
                relevant_sectors: { type: 'array', items: { type: 'string' } },
                relevance_score: { type: 'number' },
                relevance_reason: { type: 'string' },
                estimated_value: { type: 'number' },
                effort_required: { type: 'string' },
                risk_factors: { type: 'array', items: { type: 'string' } },
                eligibility_criteria: { type: 'string' },
                recommendation: { type: 'string' },
                next_steps: { type: 'array', items: { type: 'string' } },
              },
              required: ['title', 'summary', 'relevance_score'],
            },
          },
        },
        required: ['opportunities'],
      },
    });

    const found = (result.opportunities || []).filter((o) => (o.relevance_score || 0) >= minRelevance);

    // Validate AI-supplied URLs. LLMs often hallucinate deep links that 404.
    // We HEAD/GET each URL; if it's unreachable or malformed we drop it so the
    // card falls back to a trustworthy Google search instead of a dead link.
    async function urlIsLive(rawUrl) {
      if (!rawUrl || typeof rawUrl !== 'string') return false;
      let u;
      try {
        u = new URL(rawUrl.trim());
        if (u.protocol !== 'http:' && u.protocol !== 'https:') return false;
      } catch { return false; }
      try {
        const ctrl = new AbortController();
        const t = setTimeout(() => ctrl.abort(), 6000);
        let res = await fetch(u.href, { method: 'HEAD', redirect: 'follow', signal: ctrl.signal });
        // Some servers reject HEAD — retry with a ranged GET.
        if (res.status === 405 || res.status === 501) {
          res = await fetch(u.href, { method: 'GET', redirect: 'follow', signal: ctrl.signal, headers: { Range: 'bytes=0-0' } });
        }
        clearTimeout(t);
        return res.ok || res.status === 206;
      } catch { return false; }
    }

    await Promise.all(found.map(async (o) => {
      const live = await urlIsLive(o.url);
      if (!live) o.url = ''; // blank → card builds a verified search link instead
    }));

    const validSources = ['government_grant', 'asx_announcement', 'tender_db', 'partnership_network', 'industry_report', 'sustainability_initiative', 'technology_innovation'];
    const validCats = ['funding', 'partnership', 'technology', 'market', 'compliance', 'sustainability', 'workforce'];
    const validEffort = ['low', 'medium', 'high'];
    const validRec = ['pursue_aggressively', 'pursue_carefully', 'monitor', 'skip', 'unassessed'];

    const now = new Date();
    const records = found.map((o) => {
      let days = null;
      if (o.closing_date) {
        const d = new Date(o.closing_date);
        if (!isNaN(d)) days = Math.round((d - now) / 86400000);
      }
      return {
        client_account_id: user?.active_client_account_id || '',
        source: validSources.includes(o.source) ? o.source : 'government_grant',
        source_name: o.source_name || '',
        title: o.title,
        summary: o.summary,
        url: o.url || '',
        closing_date: o.closing_date && !isNaN(new Date(o.closing_date)) ? o.closing_date : undefined,
        days_until_close: days,
        category: validCats.includes(o.category) ? o.category : 'funding',
        geographic_scope: o.geographic_scope || '',
        relevant_sectors: o.relevant_sectors || [],
        relevance_score: Math.round(o.relevance_score || 0),
        relevance_reason: o.relevance_reason || '',
        estimated_value: Number(o.estimated_value) || null,
        effort_required: validEffort.includes(o.effort_required) ? o.effort_required : undefined,
        risk_factors: o.risk_factors || [],
        eligibility_criteria: o.eligibility_criteria || '',
        recommendation: validRec.includes(o.recommendation) ? o.recommendation : 'monitor',
        next_steps: o.next_steps || [],
        status: 'assessed',
        created_at: now.toISOString(),
      };
    });

    let created = [];
    if (records.length) {
      created = await svc.entities.ExternalOpportunity.bulkCreate(records);
    }

    return Response.json({
      scanned_at: now.toISOString(),
      opportunities_found: found.length,
      records_created: created.length,
      highest: found.sort((a, b) => (b.relevance_score || 0) - (a.relevance_score || 0))[0] || null,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});