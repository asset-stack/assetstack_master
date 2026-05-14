import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Audit + (optionally) fix Bunbury Council locations.
//
// Audit mode (default): scans all Equipment and groups by specifications.facility,
// reports which facilities have matching Location entries, which are missing,
// and which Locations are duplicated.
//
// Fix mode (action: "fix"):
//   1. Creates a Location for every facility that doesn't have one (location_type: "building").
//   2. Merges duplicate Locations: keeps the "primary" (no -1933/-1941 suffix), repoints any
//      references via location_id, then deletes the duplicate.
//
// Production-safe: requires admin auth. Operates on whichever DB the caller targets.

const SLUG = (s) => (s || '').toString().trim();

// Known facility -> preferred Location code mapping (from existing data + Bunbury LGA conventions)
const FACILITY_HINTS = {
  'Museum, Paisley Centre': { code: 'MUS', location_type: 'building' },
  'Southwest Sports Centre': { code: 'SWSC', location_type: 'facility' },
  'South West Sports Centre': { code: 'SWSC', location_type: 'facility' },
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Admin required' }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    const action = body.action || 'audit'; // "audit" | "fix"
    const maxUpdates = Math.max(1, Math.min(parseInt(body.max_updates) || 300, 1000));
    const delayMs = Math.max(0, parseInt(body.delay_ms) || 80);
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

    // 1. Load all Bunbury Locations
    const allLocations = await base44.asServiceRole.entities.Location.list(null, 1000);
    const bunburyLocations = allLocations.filter(
      (l) => SLUG(l.client_name).toLowerCase() === 'city of bunbury'
    );

    // 2. Load all Equipment and extract distinct facilities
    const allEquipment = await base44.asServiceRole.entities.Equipment.list(null, 5000);
    const facilityCounts = {};
    for (const eq of allEquipment) {
      const fac = SLUG(eq.specifications?.facility);
      if (!fac) continue;
      facilityCounts[fac] = (facilityCounts[fac] || 0) + 1;
    }

    // 3. Build a lookup of locations by name (case-insensitive)
    const locationByName = {};
    for (const loc of bunburyLocations) {
      const key = SLUG(loc.name).toLowerCase();
      if (!locationByName[key]) locationByName[key] = [];
      locationByName[key].push(loc);
    }

    // 4. Find duplicates within Bunbury locations (same name OR same SWSC/Museum facility)
    const duplicates = [];
    const seen = {};
    for (const loc of bunburyLocations) {
      // normalize: treat "Southwest Sports Centre" == "South West Sports Centre"
      const norm = SLUG(loc.name).toLowerCase().replace(/\s+/g, '').replace(/[,.\-]/g, '');
      if (!seen[norm]) seen[norm] = [];
      seen[norm].push(loc);
    }
    for (const [norm, locs] of Object.entries(seen)) {
      if (locs.length > 1) {
        // prefer the one with the cleanest code (no -NNNN suffix) and address present
        const primary = locs.find((l) => !/-\d{3,4}$/.test(l.code || '') && l.address) ||
                        locs.find((l) => !/-\d{3,4}$/.test(l.code || '')) ||
                        locs[0];
        const dupes = locs.filter((l) => l.id !== primary.id);
        duplicates.push({ norm, primary, duplicates: dupes });
      }
    }

    // 5. Find facilities (from Equipment) that don't have a matching Location
    const missingFacilities = [];
    for (const [facility, count] of Object.entries(facilityCounts)) {
      const lookupKey = SLUG(facility).toLowerCase();
      const exact = locationByName[lookupKey];
      // Also try fuzzy match — strip punctuation/spaces
      const facNorm = lookupKey.replace(/\s+/g, '').replace(/[,.\-]/g, '');
      const fuzzy = bunburyLocations.find((l) =>
        SLUG(l.name).toLowerCase().replace(/\s+/g, '').replace(/[,.\-]/g, '') === facNorm
      );
      if (!exact && !fuzzy) {
        missingFacilities.push({ facility, equipment_count: count });
      }
    }

    const auditReport = {
      total_bunbury_locations: bunburyLocations.length,
      total_facilities_in_equipment: Object.keys(facilityCounts).length,
      facility_equipment_counts: facilityCounts,
      duplicates: duplicates.map((d) => ({
        normalized_name: d.norm,
        primary: { id: d.primary.id, name: d.primary.name, code: d.primary.code },
        duplicates: d.duplicates.map((x) => ({ id: x.id, name: x.name, code: x.code })),
      })),
      missing_facility_locations: missingFacilities,
    };

    if (action !== 'fix') {
      return Response.json({ mode: 'audit', report: auditReport });
    }

    // ============ FIX MODE ============
    const fixActions = { created: [], merged: [], repointed: 0, cleaned_facility_tags: 0, hit_limit: false };
    let updatesUsed = 0;
    const canUpdate = () => updatesUsed < maxUpdates;
    const trackUpdate = async (fn) => {
      if (!canUpdate()) { fixActions.hit_limit = true; return false; }
      try { await fn(); updatesUsed++; if (delayMs) await sleep(delayMs); return true; }
      catch (_) { return false; }
    };

    // 5a. Clean malformed facility tags on Equipment (strip leading "NNNN - " prefix)
    //     and ONLY create a new Location for facilities that don't normalize to an existing one.
    const MALFORMED_PREFIX = /^\d{3,5}\s*-\s*/;
    for (const m of missingFacilities) {
      const cleanedName = m.facility.replace(MALFORMED_PREFIX, '').trim();
      const cleanedKey = cleanedName.toLowerCase().replace(/\s+/g, '').replace(/[,.\-]/g, '');
      const existing = bunburyLocations.find((l) =>
        SLUG(l.name).toLowerCase().replace(/\s+/g, '').replace(/[,.\-]/g, '') === cleanedKey
      );

      if (existing) {
        // Fix the Equipment records — rewrite specifications.facility to the canonical name
        const stale = allEquipment.filter(
          (eq) => SLUG(eq.specifications?.facility) === m.facility
        );
        for (const eq of stale) {
          if (!canUpdate()) { fixActions.hit_limit = true; break; }
          const ok = await trackUpdate(async () => {
            const newSpecs = { ...(eq.specifications || {}), facility: existing.name };
            await base44.asServiceRole.entities.Equipment.update(eq.id, {
              specifications: newSpecs,
              location_id: existing.id,
            });
          });
          if (ok) fixActions.cleaned_facility_tags++;
        }
        continue;
      }

      // Truly new facility — create a Location
      const hint = FACILITY_HINTS[cleanedName] || {};
      const newLoc = await base44.asServiceRole.entities.Location.create({
        name: cleanedName,
        code: hint.code || cleanedName.split(/[\s,]+/).map((w) => w[0]).join('').toUpperCase().slice(0, 6),
        client_name: 'City of Bunbury',
        city: 'Bunbury',
        region: 'Western Australia',
        location_type: hint.location_type || 'building',
        status: 'active',
        notes: `Auto-created from Equipment facility reference (${m.equipment_count} assets).`,
      });
      fixActions.created.push({ id: newLoc.id, name: newLoc.name, code: newLoc.code });
    }

    // 5b. Merge duplicates — repoint equipment.location_id AND rewrite specifications.facility
    for (const dup of duplicates) {
      const primaryId = dup.primary.id;
      const primaryName = dup.primary.name;
      for (const d of dup.duplicates) {
        // Combined set: any Equipment that references the duplicate (by id OR by name)
        const targets = allEquipment.filter((eq) =>
          eq.location_id === d.id || SLUG(eq.specifications?.facility) === d.name
        );
        let allDoneForThisDupe = true;
        for (const eq of targets) {
          if (!canUpdate()) { fixActions.hit_limit = true; allDoneForThisDupe = false; break; }
          const ok = await trackUpdate(async () => {
            const newSpecs = { ...(eq.specifications || {}), facility: primaryName };
            await base44.asServiceRole.entities.Equipment.update(eq.id, {
              specifications: newSpecs,
              location_id: primaryId,
            });
          });
          if (ok) fixActions.repointed++;
        }
        // Only delete the duplicate Location once ALL referencing equipment has been repointed
        if (allDoneForThisDupe) {
          try {
            await base44.asServiceRole.entities.Location.delete(d.id);
            fixActions.merged.push({ removed_id: d.id, removed_name: d.name, merged_into: primaryName });
          } catch (e) {
            fixActions.merged.push({ removed_id: d.id, error: e.message });
          }
        } else {
          fixActions.merged.push({ pending_removal: d.id, name: d.name, reason: 'hit max_updates, re-run to finish' });
        }
      }
    }

    return Response.json({ mode: 'fix', report: auditReport, actions: fixActions });
  } catch (error) {
    return Response.json({ error: error.message, stack: error.stack }, { status: 500 });
  }
});