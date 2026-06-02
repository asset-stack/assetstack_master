import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// One-off admin maintenance: re-tag the ENTIRE database to the Bunbury Council
// client account so every record belongs to Bunbury and Bunbury only.
// Pass { dry_run: true } to preview counts without writing.
const BUNBURY_ACCOUNT_ID = '6a0fb3de1b2d3b266ab40d62';
const BUNBURY_NAME = 'Bunbury Council';

// All tenant-scoped entities that carry a client_account_id.
const TENANT_ENTITIES = [
  'Location',
  'Equipment',
  'DigitalTwinModel',
  'ConditionReport',
  'Alert',
  'AssetDepreciation',
  'AssetDocument',
  'AssetNetwork',
  'AssetPhoto',
  'Budget',
  'CapitalPlanItem',
  'ComplianceDocument',
  'ComplianceRequirement',
  'InspectionRound',
  'Job',
  'MaintenancePlan',
  'MaintenanceTask',
  'WorkOrder',
  'SparePart',
  'Supplier',
  'PurchaseOrder',
  'SensorConfiguration',
  'Technician',
  'Project',
  'ScanFrame',
  'LiDARScan',
  'SavingsLedgerEntry',
  'ConditionAssessment',
  'AssessmentRoom',
  'AssessmentComponent',
  'AssessmentDefect',
];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: admin only' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const dryRun = body.dry_run === true;

    const summary = {};

    for (const entityName of TENANT_ENTITIES) {
      const accessor = base44.asServiceRole.entities[entityName];
      if (!accessor) {
        summary[entityName] = { skipped: 'not found' };
        continue;
      }

      // Pull all records for this entity in pages.
      let all = [];
      let skip = 0;
      const pageSize = 200;
      while (true) {
        const page = await accessor.list('-created_date', pageSize, skip);
        if (!page || page.length === 0) break;
        all = all.concat(page);
        if (page.length < pageSize) break;
        skip += pageSize;
      }

      // Records that aren't already on Bunbury.
      const toFix = all.filter((r) => r.client_account_id !== BUNBURY_ACCOUNT_ID);
      summary[entityName] = { total: all.length, retagged: toFix.length };

      if (!dryRun) {
        for (const r of toFix) {
          const patch = { client_account_id: BUNBURY_ACCOUNT_ID };
          // Locations also carry a client_name label.
          if (entityName === 'Location') patch.client_name = BUNBURY_NAME;
          await accessor.update(r.id, patch);
        }
      }
    }

    return Response.json({
      success: true,
      dry_run: dryRun,
      bunbury_account_id: BUNBURY_ACCOUNT_ID,
      summary,
    });
  } catch (error) {
    console.error('retagAllToBunbury error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});