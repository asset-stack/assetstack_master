import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Export full asset register as CSV in the original Bunbury column format.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const all = [];
    let page = 0;
    const pageSize = 200;
    while (true) {
      const batch = await base44.asServiceRole.entities.Equipment.list('-created_date', pageSize, page * pageSize);
      all.push(...batch);
      if (batch.length < pageSize) break;
      page++;
      if (page > 50) break;
    }

    const cols = [
      'id', 'name', 'location', 'component_type', 'component_subtype',
      'room_location', 'condition_grade', 'life_consumed', 'baselife_years',
      'quantity', 'unit', 'price_per_unit', 'replacement_value',
      'criticality_score', 'defect_urgency', 'defect_description',
      'defect_response_year', 'defect_cost', 'material', 'manufacturer',
      'serial_number', 'installation_date',
    ];

    const escape = (v) => {
      if (v === null || v === undefined) return '';
      const s = String(v);
      if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
      return s;
    };

    const lines = [cols.join(',')];
    for (const eq of all) {
      const s = eq.specifications || {};
      const row = [
        eq.id, eq.name, eq.location,
        s.component_type, s.component_subtype, s.room_location,
        s.condition_grade, s.life_consumed, s.baselife_years,
        s.quantity, s.unit, s.price_per_unit, s.replacement_value,
        s.criticality_score, s.defect_urgency, s.defect_description,
        s.defect_response_year, s.defect_cost, s.material, eq.manufacturer,
        eq.serial_number, eq.installation_date,
      ];
      lines.push(row.map(escape).join(','));
    }

    const csv = lines.join('\n');
    return new Response(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="bunbury-asset-register-${new Date().toISOString().slice(0,10)}.csv"`,
      },
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});