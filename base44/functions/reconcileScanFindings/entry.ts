import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Reconcile an uploaded condition workbook against AI scan findings for a scan.
// mode 'preview': extract DEFECT rows from a chosen sheet, match to ConditionReports,
//   return 3-way diff (confirmed / ai_only / sheet_only). Register rows are pulled for context only.
// mode 'apply': persist reconciliation status + sheet grade/room/component onto the matched reports.
//
// The Bunbury workbook has 34 sheets. We default to the "Defects (2)" sheet (real inspector
// defects) for matching, and optionally read a register sheet ("Bunbury-Condition") for context.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const {
      mode = 'preview',
      digital_twin_model_id,
      file_url,
      sheet_name = 'Defects (2)',
      confirmations,
      sheet_only_rows,
      ai_only,
    } = body;

    if (!digital_twin_model_id) {
      return Response.json({ error: 'digital_twin_model_id is required' }, { status: 400 });
    }

    // ---- APPLY MODE ---------------------------------------------------------
    if (mode === 'apply') {
      let updated = 0;
      const now = new Date().toISOString();

      for (const c of (confirmations || [])) {
        if (!c.report_id) continue;
        await base44.asServiceRole.entities.ConditionReport.update(c.report_id, {
          reconciliation_status: 'confirmed',
          sheet_grade: c.sheet_grade ?? null,
          room_code: c.room_code || undefined,
          room_name: c.room_name || undefined,
          component_type: c.component_type || undefined,
          sheet_row: c.sheet_row || null,
          reconciled_at: now,
        });
        updated++;
      }

      // Create placeholder reports for sheet rows that had no AI match (sheet_only)
      let created = 0;
      for (const r of (sheet_only_rows || [])) {
        await base44.asServiceRole.entities.ConditionReport.create({
          digital_twin_model_id,
          digital_twin_model_name: body.digital_twin_model_name || '',
          room_code: r.room_code || null,
          room_name: r.room_name || null,
          component_type: r.component_type || null,
          anomaly_type: 'other',
          severity: r.severity || 'minor',
          condition_score: r.sheet_grade || 1,
          ai_description: r.notes || 'Recorded in inspector spreadsheet — no scan photo matched.',
          ai_model_version: 'spreadsheet',
          review_status: 'pending',
          reconciliation_status: 'sheet_only',
          sheet_grade: r.sheet_grade ?? null,
          sheet_row: r,
          reconciled_at: now,
        });
        created++;
      }

      // Mark AI findings that no spreadsheet row matched as 'ai_only'
      let aiOnlyMarked = 0;
      for (const a of (ai_only || [])) {
        if (!a.report_id) continue;
        await base44.asServiceRole.entities.ConditionReport.update(a.report_id, {
          reconciliation_status: 'ai_only',
          reconciled_at: now,
        });
        aiOnlyMarked++;
      }

      return Response.json({ success: true, updated, created, ai_only_marked: aiOnlyMarked });
    }

    // ---- PREVIEW MODE -------------------------------------------------------
    // Defect rows are imported into the InspectorDefect entity (via the import_data
    // tool, which reliably parses the chosen Excel sheet). We read them here instead
    // of live-extracting from the multi-sheet workbook (which is unreliable).
    const priorityToSeverity = (p) => {
      const v = (p || '').toLowerCase();
      if (v.includes('high') || v.includes('urgent')) return 'major';
      if (v.includes('med')) return 'moderate';
      return 'minor';
    };

    const defects = await base44.asServiceRole.entities.InspectorDefect.list('-created_date', 1000);

    // De-duplicate defect rows (the Defects sheet repeats each defect across program years).
    const seen = new Set();
    let rows = defects.filter((d) => {
      const key = `${d.defect_id || ''}|${d.room_code || ''}|${(d.description || '').slice(0, 40)}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }).map((d) => ({
      room_code: d.room_code || '',
      room_name: d.room_name || '',
      component_type: '',
      defect_id: d.defect_id || '',
      anomaly_type: 'other',
      severity: priorityToSeverity(d.priority),
      condition_grade: d.criticality_index ?? null,
      notes: d.description || '',
    }));

    // Scope: cap defect rows fed to the LLM so we never blow the context window.
    const MAX_ROWS = 150;
    const scopedRows = rows.slice(0, MAX_ROWS);

    // Load existing AI findings for this scan
    const reports = await base44.asServiceRole.entities.ConditionReport.filter({
      digital_twin_model_id,
    }, '-created_date', 300);

    const slim = reports.map((r) => ({
      id: r.id,
      anomaly_type: r.anomaly_type,
      severity: r.severity,
      room_name: r.room_name || '',
      component_type: r.component_type || '',
      equipment_name: r.equipment_name || '',
      ai_description: (r.ai_description || '').slice(0, 160),
    }));

    // Use the LLM to align spreadsheet defect rows to AI findings.
    const alignment = await base44.integrations.Core.InvokeLLM({
      prompt: `You are reconciling a building condition inspection's DEFECT list against AI-detected scan findings.

Inspector defect rows (ground truth) from sheet "${sheet_name}":
${JSON.stringify(scopedRows)}

AI findings detected from the scan:
${JSON.stringify(slim)}

Match each defect row to at most one AI finding when they clearly refer to the same defect (same room and a compatible defect type/description).

CRITICAL: "report_id" MUST be an "id" value taken verbatim from the AI findings list above. NEVER use a defect_id (e.g. COB-xxxx) or any value from the inspector rows as report_id. "row_index" is the 0-based index into the inspector defect rows array.

Return:
- confirmed: pairs where a defect row matches an AI finding -> { report_id, row_index, sheet_grade, room_code, room_name, component_type }
- sheet_only: defect row_index values that had NO matching AI finding
- ai_only: AI finding "id" values that no defect row matched

Be conservative: only confirm clear matches.`,
      response_json_schema: {
        type: 'object',
        properties: {
          confirmed: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                report_id: { type: 'string' },
                row_index: { type: 'number' },
                sheet_grade: { type: 'number' },
                room_code: { type: 'string' },
                room_name: { type: 'string' },
                component_type: { type: 'string' },
              },
            },
          },
          sheet_only: { type: 'array', items: { type: 'number' } },
          ai_only: { type: 'array', items: { type: 'string' } },
        },
      },
    });

    const confirmed = (alignment?.confirmed || []).map((m) => {
      const rep = reports.find((r) => r.id === m.report_id);
      const row = scopedRows[m.row_index] || {};
      return {
        report_id: m.report_id,
        image_url: rep?.image_url || null,
        anomaly_type: rep?.anomaly_type || row.anomaly_type,
        ai_severity: rep?.severity,
        ai_description: rep?.ai_description,
        sheet_grade: m.sheet_grade ?? row.condition_grade ?? null,
        room_code: m.room_code || row.room_code || '',
        room_name: m.room_name || row.room_name || '',
        component_type: m.component_type || row.component_type || '',
        sheet_row: row,
      };
    });

    const sheetOnly = (alignment?.sheet_only || []).map((i) => scopedRows[i]).filter(Boolean).map((row) => ({
      room_code: row.room_code || '',
      room_name: row.room_name || '',
      component_type: row.component_type || '',
      severity: ['minor', 'moderate', 'major', 'critical'].includes(row.severity) ? row.severity : 'minor',
      sheet_grade: row.condition_grade ?? null,
      notes: row.notes || '',
    }));

    const aiOnly = (alignment?.ai_only || []).map((id) => {
      const rep = reports.find((r) => r.id === id);
      if (!rep) return null;
      return {
        report_id: rep.id,
        image_url: rep.image_url,
        anomaly_type: rep.anomaly_type,
        severity: rep.severity,
        ai_description: rep.ai_description,
      };
    }).filter(Boolean);

    return Response.json({
      success: true,
      sheet_name,
      total_rows: rows.length,
      scoped_rows: scopedRows.length,
      total_findings: reports.length,
      confirmed,
      sheet_only: sheetOnly,
      ai_only: aiOnly,
    });
  } catch (error) {
    console.error('reconcileScanFindings error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});