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
      condition_grade: null,
      rectification: d.rectification || '',
      notes: d.description || '',
    }));

    const scopedRows = rows;

    // Load existing AI findings for this scan
    const reports = await base44.asServiceRole.entities.ConditionReport.filter({
      digital_twin_model_id,
    }, '-created_date', 500);

    // ---- DETERMINISTIC MATCHING --------------------------------------------
    // Index-based LLM matching is unreliable at this scale (100s of findings).
    // Instead match in code: a defect row matches a finding when their room
    // codes agree AND their text shares meaningful keywords.
    const STOP = new Set(['the','and','for','with','that','this','are','was','have','has','from','near','area','damage','damaged','tile','tiles','wall','floor','ceiling','door','room','section','investigate','replace','repair','rectify','cause','requires','require','new','old']);
    const roomCodeOf = (s) => {
      const m = (s || '').toUpperCase().match(/\bR\d{1,3}\b/);
      return m ? m[0] : '';
    };
    const keywords = (s) => new Set(
      (s || '')
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter((w) => w.length > 3 && !STOP.has(w))
    );
    const overlap = (a, b) => {
      let n = 0;
      for (const w of a) if (b.has(w)) n++;
      return n;
    };

    const usedReports = new Set();
    const matchedRowIdx = new Set();
    const confirmed = [];

    scopedRows.forEach((row, idx) => {
      const rcode = roomCodeOf(row.room_code) || roomCodeOf(row.room_name);
      const rkw = keywords(`${row.notes} ${row.rectification}`);
      let best = null;
      let bestScore = 0;
      for (const rep of reports) {
        if (usedReports.has(rep.id)) continue;
        const repRoom = roomCodeOf(rep.room_name) || roomCodeOf(rep.equipment_name);
        // Require room agreement when both sides expose a room code.
        if (rcode && repRoom && rcode !== repRoom) continue;
        const score = overlap(rkw, keywords(rep.ai_description));
        // Need at least 2 shared keywords for a content match.
        if (score >= 2 && score > bestScore) {
          best = rep;
          bestScore = score;
        }
      }
      if (best) {
        usedReports.add(best.id);
        matchedRowIdx.add(idx);
        confirmed.push({
          report_id: best.id,
          image_url: best.image_url || null,
          anomaly_type: best.anomaly_type || row.anomaly_type,
          ai_severity: best.severity,
          ai_description: best.ai_description,
          sheet_grade: row.condition_grade ?? null,
          room_code: row.room_code || '',
          room_name: row.room_name || '',
          component_type: row.component_type || '',
          sheet_row: row,
        });
      }
    });

    const sheetOnly = scopedRows
      .filter((_, i) => !matchedRowIdx.has(i))
      .map((row) => ({
        room_code: row.room_code || '',
        room_name: row.room_name || '',
        component_type: row.component_type || '',
        severity: ['minor', 'moderate', 'major', 'critical'].includes(row.severity) ? row.severity : 'minor',
        sheet_grade: row.condition_grade ?? null,
        defect_id: row.defect_id || '',
        notes: row.notes || '',
      }));

    const aiOnly = reports
      .filter((rep) => !usedReports.has(rep.id))
      .map((rep) => ({
        report_id: rep.id,
        image_url: rep.image_url,
        anomaly_type: rep.anomaly_type,
        severity: rep.severity,
        ai_description: rep.ai_description,
      }));

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