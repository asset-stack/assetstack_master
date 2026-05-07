import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Predictive Defect Cascade — for an asset with a defect, predict adjacent / related assets that
// are likely to develop defects within 12 months, based on co-occurrence of room_location + component_type.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { equipment_id } = await req.json();
    if (!equipment_id) return Response.json({ error: 'equipment_id required' }, { status: 400 });

    const seed = await base44.asServiceRole.entities.Equipment.get(equipment_id);
    if (!seed) return Response.json({ error: 'Asset not found' }, { status: 404 });

    const room = seed.specifications?.room_location;
    const seedType = seed.specifications?.component_type;
    if (!room) return Response.json({ predictions: [], reason: 'No room_location for cascade analysis' });

    // Find all assets in same room
    const all = [];
    let page = 0;
    while (true) {
      const batch = await base44.asServiceRole.entities.Equipment.list('-created_date', 200, page * 200);
      all.push(...batch);
      if (batch.length < 200) break;
      page++;
      if (page > 30) break;
    }

    const sameRoom = all.filter((eq) =>
      eq.id !== equipment_id && eq.specifications?.room_location === room
    );

    // Score each: combine life_consumed, condition_grade, and existing defect status
    const predictions = sameRoom.map((eq) => {
      const lc = Number(eq.specifications?.life_consumed) || 0;
      const grade = Number(eq.specifications?.condition_grade) || 3;
      const hasDefect = !!eq.specifications?.defect_description;
      const probability = Math.min(95, Math.round(
        (lc * 30) + (grade * 10) + (hasDefect ? 25 : 0) + 20
      ));
      return {
        equipment_id: eq.id,
        equipment_name: eq.name,
        component_type: eq.specifications?.component_type,
        condition_grade: grade,
        life_consumed: lc,
        cascade_probability: probability,
        rationale: `In same room (${room}). Condition C${grade}, ${Math.round(lc * 100)}% life consumed${hasDefect ? ', already has defect' : ''}.`,
      };
    }).sort((a, b) => b.cascade_probability - a.cascade_probability);

    return Response.json({
      seed: { id: seed.id, name: seed.name, room, component_type: seedType },
      predictions: predictions.slice(0, 10),
      total_in_room: sameRoom.length,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});