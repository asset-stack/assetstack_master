import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// AssetMind aggregator — answers natural-language portfolio questions using the LLM
// with structured aggregations done in code (the LLM only chooses which aggregation to run).
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { question } = await req.json();
    if (!question) return Response.json({ error: 'No question provided' }, { status: 400 });

    // Load all equipment
    const all = [];
    let page = 0;
    while (true) {
      const batch = await base44.asServiceRole.entities.Equipment.list('-created_date', 200, page * 200);
      all.push(...batch);
      if (batch.length < 200) break;
      page++;
      if (page > 50) break;
    }

    // Compute aggregations
    const agg = computeAggregations(all);

    // Pass aggregations to LLM with the question
    const llm = await base44.integrations.Core.InvokeLLM({
      prompt: `You are an asset management analyst. Answer the question using ONLY the data provided.

QUESTION: "${question}"

PORTFOLIO DATA:
- Total assets: ${agg.totalAssets}
- Total replacement value (CRC): $${agg.totalCRC.toLocaleString()}
- Total written-down value (WDV): $${agg.totalWDV.toLocaleString()}
- Average condition grade: ${agg.avgCondition.toFixed(2)}
- Average life consumed: ${(agg.avgLifeConsumed * 100).toFixed(1)}%
- Critical-condition assets (grade 4-5): ${agg.criticalCount}
- Over-life assets (>=85% consumed): ${agg.overLifeCount}
- Estimated annual depreciation: $${agg.annualDepreciation.toLocaleString()}

BY LOCATION:
${agg.byLocation.map((l) => `  ${l.name}: ${l.count} assets, $${l.crc.toLocaleString()} CRC, avg condition ${l.avgCondition.toFixed(2)}`).join('\n')}

BY COMPONENT TYPE (top 10):
${agg.byComponentType.slice(0, 10).map((c) => `  ${c.type}: ${c.count} units, $${c.crc.toLocaleString()} CRC`).join('\n')}

DEFECTS:
- High urgency: ${agg.defectsHigh}
- Medium urgency: ${agg.defectsMedium}
- Low urgency: ${agg.defectsLow}

Provide a concise, data-driven answer. Use bullet points and round dollar figures. Always cite specific numbers.`,
    });

    return Response.json({ answer: llm, aggregations: agg });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function computeAggregations(all) {
  const CONDITION_FACTOR = { 1: 1.0, 2: 0.85, 3: 0.65, 4: 0.4, 5: 0.15 };
  let totalCRC = 0, totalWDV = 0, annualDepreciation = 0;
  let condSum = 0, condCount = 0, lcSum = 0, lcCount = 0;
  let criticalCount = 0, overLifeCount = 0;
  let defectsHigh = 0, defectsMedium = 0, defectsLow = 0;
  const locMap = {}, ctMap = {};

  for (const eq of all) {
    const s = eq.specifications || {};
    const crc = Number(s.replacement_value) || (Number(s.price_per_unit) || 0) * (Number(s.quantity) || 0);
    const lc = Math.max(0, Math.min(1, Number(s.life_consumed) || 0));
    const grade = Number(s.condition_grade);
    const baseLife = Number(s.baselife_years);

    totalCRC += crc;
    totalWDV += crc * (1 - lc);
    if (baseLife > 0) annualDepreciation += crc / baseLife;
    if (Number.isFinite(grade)) { condSum += grade; condCount++; }
    if (Number.isFinite(lc)) { lcSum += lc; lcCount++; }
    if (grade >= 4) criticalCount++;
    if (lc >= 0.85) overLifeCount++;
    const u = (s.defect_urgency || '').toLowerCase();
    if (u.includes('high')) defectsHigh++;
    else if (u.includes('med')) defectsMedium++;
    else if (u.includes('low')) defectsLow++;

    const loc = eq.location || 'Unassigned';
    if (!locMap[loc]) locMap[loc] = { name: loc, count: 0, crc: 0, condSum: 0, condN: 0 };
    locMap[loc].count++;
    locMap[loc].crc += crc;
    if (Number.isFinite(grade)) { locMap[loc].condSum += grade; locMap[loc].condN++; }

    const ct = s.component_type || 'Other';
    if (!ctMap[ct]) ctMap[ct] = { type: ct, count: 0, crc: 0 };
    ctMap[ct].count++;
    ctMap[ct].crc += crc;
  }

  return {
    totalAssets: all.length,
    totalCRC: Math.round(totalCRC),
    totalWDV: Math.round(totalWDV),
    annualDepreciation: Math.round(annualDepreciation),
    avgCondition: condCount > 0 ? condSum / condCount : 0,
    avgLifeConsumed: lcCount > 0 ? lcSum / lcCount : 0,
    criticalCount,
    overLifeCount,
    defectsHigh, defectsMedium, defectsLow,
    byLocation: Object.values(locMap)
      .map((l) => ({ ...l, avgCondition: l.condN > 0 ? l.condSum / l.condN : 0 }))
      .sort((a, b) => b.crc - a.crc),
    byComponentType: Object.values(ctMap).sort((a, b) => b.crc - a.crc),
  };
}