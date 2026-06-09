import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Imports the three lifecycle lookup tables from the AssetStack base-data workbook:
//   • Asset Library      → AssetLibraryItem  (baselife, unit rate, criticality)
//   • LOS_Criticality    → LOSMatrixEntry     (adjustment factor grid)
//   • Life Remaining     → LifeRemainingEntry (condition grade → % remaining)
//
// Accepts pre-parsed rows from the frontend (which uses ExtractDataFromUploadedFile),
// OR raw arrays. Idempotent per tenant: clears existing reference rows first when
// replace=true.

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const {
      client_account_id = null,
      asset_library = [],
      los_matrix = [],          // either grid rows or flat {los, criticality, factor}
      life_remaining = [],
      replace = true,
    } = body || {};

    const svc = base44.asServiceRole.entities;
    const num = (v) => {
      const n = parseFloat(String(v).replace(/[$,%\s]/g, ''));
      return isNaN(n) ? null : n;
    };

    if (replace) {
      for (const name of ['AssetLibraryItem', 'LOSMatrixEntry', 'LifeRemainingEntry']) {
        const existing = await svc[name].filter({ client_account_id }, '-created_date', 5000);
        for (const r of existing) await svc[name].delete(r.id);
      }
    }

    // ── Asset Library ──
    const libRows = [];
    for (const r of asset_library) {
      const lookup = r['Asset Lookup type'] || r.asset_lookup_type;
      const baselife = num(r['Baselife'] ?? r.baselife);
      const rate = num(r['2025 Unit Rate'] ?? r.unit_rate);
      if (!lookup || baselife == null || rate == null) continue;
      libRows.push({
        client_account_id,
        asset_lookup_type: String(lookup).trim(),
        group: r['Group'] ?? r.group ?? '',
        component_type: r['Component\nType'] ?? r['Component Type'] ?? r.component_type ?? '',
        component_subtype: r['Component\n(Subtype, Material , Size, Dimensions)'] ?? r.component_subtype ?? '',
        unit: r['Unit'] ?? r.unit ?? 'each',
        component_criticality: num(r['Component Criticality'] ?? r.component_criticality) ?? 3,
        baselife,
        unit_rate: rate,
        rate_year: 2025,
      });
    }
    // Dedupe by lookup type (workbook has repeats)
    const seen = new Set();
    const libDeduped = libRows.filter((r) => {
      const k = r.asset_lookup_type.toLowerCase();
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
    let libCreated = 0;
    for (let i = 0; i < libDeduped.length; i += 100) {
      const chunk = libDeduped.slice(i, i + 100);
      await svc.AssetLibraryItem.bulkCreate(chunk);
      libCreated += chunk.length;
    }

    // ── LOS × Criticality matrix ──
    // Supports flat rows {level_of_service, component_criticality, adjustment_factor}
    // or grid rows where col_1 = LOS label and col_2..col_6 = criticality 1..5.
    const losRows = [];
    for (const r of los_matrix) {
      if (r.level_of_service != null && r.component_criticality != null) {
        const f = num(r.adjustment_factor);
        if (f != null) {
          losRows.push({
            client_account_id,
            level_of_service: Number(r.level_of_service),
            component_criticality: Number(r.component_criticality),
            adjustment_factor: f,
          });
        }
        continue;
      }
      // Grid form: col_1 holds "1 Very High ..." → LOS number is leading digit
      const losLabel = r.col_1 ?? r['LOS \\ Component Criticality'];
      const losNum = num(String(losLabel).match(/\d/)?.[0]);
      if (losNum == null) continue;
      const cols = ['col_2', 'col_3', 'col_4', 'col_5', 'col_6'];
      cols.forEach((c, idx) => {
        const f = num(r[c]);
        if (f != null) {
          losRows.push({
            client_account_id,
            level_of_service: losNum,
            component_criticality: idx + 1,
            adjustment_factor: f,
          });
        }
      });
    }
    if (losRows.length) await svc.LOSMatrixEntry.bulkCreate(losRows);

    // ── Life Remaining ──
    const lifeRows = [];
    for (const r of life_remaining) {
      const rating = num(r['Rating'] ?? r.condition_rating);
      const remaining = num(r['Life Remaining (%)'] ?? r.life_remaining_pct);
      if (rating == null || remaining == null) continue;
      lifeRows.push({
        client_account_id,
        condition_rating: rating,
        life_remaining_pct: remaining > 1 ? remaining / 100 : remaining,
        life_consumed_pct: num(r['Life Consumed'] ?? r.life_consumed_pct),
      });
    }
    if (lifeRows.length) await svc.LifeRemainingEntry.bulkCreate(lifeRows);

    return Response.json({
      data: {
        asset_library_created: libCreated,
        los_matrix_created: losRows.length,
        life_remaining_created: lifeRows.length,
      },
    });
  } catch (err) {
    return Response.json({ error: err.message || String(err) }, { status: 500 });
  }
});