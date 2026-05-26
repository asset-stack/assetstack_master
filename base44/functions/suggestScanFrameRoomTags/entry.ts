import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

function roomLabel(room) {
  return `${room.room_code || ''} ${room.name || ''}`.trim();
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { digital_twin_model_id, assessment_id, limit = 20 } = body || {};
    if (!digital_twin_model_id || !assessment_id) {
      return Response.json({ error: 'digital_twin_model_id and assessment_id are required' }, { status: 400 });
    }

    const [frames, rooms] = await Promise.all([
      base44.asServiceRole.entities.ScanFrame.filter({ digital_twin_model_id }, 'frame_index', Math.min(Number(limit) || 20, 40)),
      base44.asServiceRole.entities.AssessmentRoom.filter({ assessment_id }, 'display_order', 200),
    ]);

    const candidates = frames.filter((f) => f.image_url && !f.room_code && !f.room_name);
    if (!candidates.length) {
      return Response.json({ success: true, updated_count: 0, suggestions: [], message: 'No untagged frames found.' });
    }
    if (!rooms.length) {
      return Response.json({ error: 'No rooms found for this assessment.' }, { status: 400 });
    }

    const roomList = rooms.map((r, i) => `${i + 1}. ${roomLabel(r)}`).join('\n');
    const suggestions = [];
    let updatedCount = 0;

    for (const frame of candidates) {
      const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: `You are matching a facility scan JPEG to the most likely room from an Excel condition assessment room schedule.\n\nRooms:\n${roomList}\n\nFrame label: ${frame.angle_label || 'Untitled'}\n\nPick the single best matching room from the list. If the image is ambiguous, still choose the closest room but lower confidence. Return the 1-based room_index, confidence 0-100, and a short reason.`,
        file_urls: [frame.image_url],
        response_json_schema: {
          type: 'object',
          properties: {
            room_index: { type: 'number' },
            confidence: { type: 'number' },
            reason: { type: 'string' },
          },
        },
      });

      const idx = Math.max(1, Math.min(rooms.length, Math.round(Number(result?.room_index) || 1))) - 1;
      const room = rooms[idx];
      const confidence = Math.max(0, Math.min(100, Number(result?.confidence) || 0));

      await base44.asServiceRole.entities.ScanFrame.update(frame.id, {
        room_code: room.room_code,
        room_name: room.name,
        spreadsheet_fields: {
          ...(frame.spreadsheet_fields || {}),
          room_tag_confidence: confidence,
          room_tag_reason: result?.reason || '',
          room_tag_source: 'ai_suggested',
        },
      });

      suggestions.push({
        frame_id: frame.id,
        angle_label: frame.angle_label,
        room_code: room.room_code,
        room_name: room.name,
        confidence,
        reason: result?.reason || '',
      });
      updatedCount++;
    }

    return Response.json({ success: true, updated_count: updatedCount, suggestions });
  } catch (error) {
    console.error('suggestScanFrameRoomTags error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});