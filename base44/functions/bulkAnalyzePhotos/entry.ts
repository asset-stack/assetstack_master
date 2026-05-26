import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Process a batch of already-uploaded photos:
// 1. Optionally create a DigitalTwinModel "photo-set scan" to group the photos
// 2. Create AssetPhoto records using bulkCreate (much faster for large batches)
//
// AI condition analysis is invoked from the FRONTEND per photo after this returns
// (using the existing analyzeScanCondition function).
//
// Payload:
//   photos: [{ file_url, equipment_id?, equipment_name?, location_id?, location_name?,
//              captured_date?, notes?, photo_type?, lat?, lng? }]
//   create_scan: bool — if true, group all photos under one new DigitalTwinModel
//   scan_name: string — name for the scan (if create_scan)
//   existing_scan_id: string — if provided, skip scan creation and attach photos to this scan
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { photos = [], create_scan = false, scan_name, location_id, location_name, existing_scan_id } = body;
    if (!Array.isArray(photos) || photos.length === 0) {
      return Response.json({ error: 'photos[] is required' }, { status: 400 });
    }

    let scanId = existing_scan_id || null;
    let scanName = scan_name;

    // 1. Optionally create a parent scan to group photos (only if not resuming an existing one)
    if (create_scan && !existing_scan_id) {
      const scan = await base44.asServiceRole.entities.DigitalTwinModel.create({
        name: scan_name || `Photo set — ${new Date().toISOString().slice(0, 10)}`,
        description: `Bulk photo upload — pending photo records`,
        location_id: location_id || null,
        location_name: location_name || null,
        model_type: 'photogrammetry',
        file_url: photos[0]?.file_url || null,
        preview_image_url: photos[0]?.file_url || null,
        scan_date: new Date().toISOString().slice(0, 10),
        status: 'ready',
      });
      scanId = scan.id;
      scanName = scan.name;
    }

    // 2. Prepare AssetPhoto records — drop any without an equipment_id (those go in errors)
    const photoErrors = [];
    const validRecords = [];
    for (const p of photos) {
      if (!p.equipment_id) {
        photoErrors.push({ file_url: p.file_url, error: 'missing equipment_id' });
        continue;
      }
      validRecords.push({
        equipment_id: p.equipment_id,
        equipment_name: p.equipment_name || '',
        photo_url: p.file_url,
        captured_date: p.captured_date || new Date().toISOString().slice(0, 10),
        captured_by_email: user.email,
        condition_grade_at_capture: p.condition_grade_at_capture || null,
        notes: p.notes || '',
        photo_type: p.photo_type || 'inspection',
        lat: p.lat || null,
        lng: p.lng || null,
      });
    }

    // 3. If grouped under a scan, create scan frames so Scan Analysis can inspect every photo.
    let framesCreated = 0;
    if (scanId) {
      const existingFrames = await base44.asServiceRole.entities.ScanFrame.filter({ digital_twin_model_id: scanId }, 'frame_index', 500);
      const frameOffset = existingFrames?.length || 0;
      const frameRecords = photos
        .filter((p) => p.file_url)
        .map((p, index) => ({
          digital_twin_model_id: scanId,
          digital_twin_model_name: scanName,
          frame_index: frameOffset + index,
          angle_label: p.equipment_name ? `Photo — ${p.equipment_name}` : `Photo ${frameOffset + index + 1}`,
          image_url: p.file_url,
          equipment_id: p.equipment_id || null,
          equipment_name: p.equipment_name || null,
          analysis_status: 'pending',
          findings_count: 0,
        }));
      for (let i = 0; i < frameRecords.length; i += 100) {
        const chunk = frameRecords.slice(i, i + 100);
        const createdFrames = await base44.asServiceRole.entities.ScanFrame.bulkCreate(chunk);
        framesCreated += Array.isArray(createdFrames) ? createdFrames.length : chunk.length;
      }
    }

    // 4. Bulk-create in chunks of 100 (SDK limit-friendly + safer for huge batches)
    let createdCount = 0;
    const CHUNK = 100;
    for (let i = 0; i < validRecords.length; i += CHUNK) {
      const chunk = validRecords.slice(i, i + CHUNK);
      try {
        const created = await base44.asServiceRole.entities.AssetPhoto.bulkCreate(chunk);
        createdCount += Array.isArray(created) ? created.length : chunk.length;
      } catch (e) {
        // Fall back to one-by-one for this chunk so we don't lose the whole batch
        for (const rec of chunk) {
          try {
            await base44.asServiceRole.entities.AssetPhoto.create(rec);
            createdCount++;
          } catch (err) {
            photoErrors.push({ file_url: rec.photo_url, error: err.message });
          }
        }
      }
    }

    return Response.json({
      success: true,
      scan_id: scanId,
      scan_name: scanName,
      photos_created: createdCount,
      frames_created: framesCreated,
      photo_errors: photoErrors,
    });
  } catch (error) {
    console.error('bulkAnalyzePhotos error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});