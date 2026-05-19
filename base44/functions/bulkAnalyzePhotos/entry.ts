import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Process a batch of already-uploaded photos:
// 1. Optionally create a DigitalTwinModel "photo-set scan" to group the photos
// 2. Create AssetPhoto records (so they appear in the Photo Library)
//
// AI condition analysis is invoked from the FRONTEND per photo after this returns
// (using the existing analyzeScanCondition function) — same pattern as ScanAnalysis re-run.
//
// Payload:
//   photos: [{ file_url, equipment_id?, equipment_name?, location_id?, location_name?,
//              captured_date?, notes?, photo_type?, lat?, lng? }]
//   create_scan: bool — if true, group all photos under one new DigitalTwinModel
//   scan_name: string — name for the scan (if create_scan)
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { photos = [], create_scan = false, scan_name, location_id, location_name } = body;
    if (!Array.isArray(photos) || photos.length === 0) {
      return Response.json({ error: 'photos[] is required' }, { status: 400 });
    }

    let scanId = null;
    let scanName = scan_name;

    // 1. Optionally create a parent scan to group photos
    if (create_scan) {
      const scan = await base44.asServiceRole.entities.DigitalTwinModel.create({
        name: scan_name || `Photo set — ${new Date().toISOString().slice(0, 10)}`,
        description: `Bulk photo upload of ${photos.length} image(s)`,
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

    const createdPhotos = [];
    const photoErrors = [];

    // 2. Create AssetPhoto records
    for (const p of photos) {
      try {
        if (!p.equipment_id) {
          photoErrors.push({ file_url: p.file_url, error: 'missing equipment_id' });
          continue;
        }
        const created = await base44.asServiceRole.entities.AssetPhoto.create({
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
        createdPhotos.push(created);
      } catch (e) {
        photoErrors.push({ file_url: p.file_url, error: e.message });
      }
    }

    return Response.json({
      success: true,
      scan_id: scanId,
      scan_name: scanName,
      photos_created: createdPhotos.length,
      photo_errors: photoErrors,
    });
  } catch (error) {
    console.error('bulkAnalyzePhotos error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});