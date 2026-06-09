import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Entities that are tenant-scoped. Reads/writes are forced to the caller's ClientAccount.
const TENANT_SCOPED = new Set([
  'Equipment',
  'MaintenanceTask',
  'Alert',
  'SensorReading',
  'SensorConfiguration',
  'ConditionReport',
  'AssetPhoto',
  'AssetDocument',
  'AssetDepreciation',
  'SavingsLedgerEntry',
  'Budget',
  'CapitalPlanItem',
  'Location',
  'Project',
  'ProjectTask',
  'TimeEntry',
  'Technician',
  'WorkOrder',
  'WorkOrderMedia',
  'WorkOrderMessage',
  'MaintenancePlan',
  'MaintenanceTemplate',
  'MaintenanceTrigger',
  'SuggestedTask',
  'SparePart',
  'PurchaseOrder',
  'Supplier',
  'DigitalTwinModel',
  'InspectionRound',
  'AssetNetwork',
  'NetworkNode',
  'ComplianceDocument',
  'ComplianceRequirement',
  'PredictionLog',
  'PredictionAccuracy',
  'RootCauseAnalysis',
  'FeatureVector',
  'DataIngestionLog',
  'SavedScenario',
  'SavedView',
  'AssetLibraryItem',
  'LOSMatrixEntry',
  'LifeRemainingEntry',
  'AssessmentComponent',
  'AssessmentRoom',
  'ConditionAssessment',
]);

// Resolve the ClientAccount the caller belongs to.
// Rules:
//   - admin/super_admin users may pass a specific client_account_id (used by the client switcher).
//   - all other users are pinned to ClientAccounts where their email is in allowed_users.
async function resolveTenant(base44, user, requestedClientId) {
  const allClients = await base44.asServiceRole.entities.ClientAccount.list('-created_date', 500);
  // Cross-tenant access is restricted to platform super_admins ONLY.
  // A customer's own 'admin' is pinned to the accounts they are a member of.
  const isPrivileged = user.role === 'super_admin';

  const memberships = allClients.filter(
    (c) => Array.isArray(c.allowed_users) && c.allowed_users.includes(user.email)
  );

  if (isPrivileged) {
    if (requestedClientId) {
      const match = allClients.find((c) => c.id === requestedClientId);
      if (match) return { tenantId: match.id, isPrivileged: true };
    }
    if (memberships.length > 0) return { tenantId: memberships[0].id, isPrivileged: true };
    if (allClients.length > 0) return { tenantId: allClients[0].id, isPrivileged: true };
    return { tenantId: null, isPrivileged: true };
  }

  if (memberships.length === 0) return { tenantId: null, isPrivileged: false };
  if (requestedClientId && memberships.some((c) => c.id === requestedClientId)) {
    return { tenantId: requestedClientId, isPrivileged: false };
  }
  return { tenantId: memberships[0].id, isPrivileged: false };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const {
      operation = 'list',           // list | filter | get | create | update | delete
      entityName,
      filters = {},
      sort = '-created_date',
      limit = 100,
      skip = 0,
      id,
      data,
      requestedClientId,            // optional: privileged users selecting a tenant
    } = body || {};

    if (!entityName || typeof entityName !== 'string') {
      return Response.json({ error: 'entityName required' }, { status: 400 });
    }

    // Non-tenant-scoped entities (User, Role, ClientAccount, AuditLogEntry, etc.) are not routed here.
    if (!TENANT_SCOPED.has(entityName)) {
      return Response.json({ error: `Entity ${entityName} is not tenant-scoped` }, { status: 400 });
    }

    const { tenantId, isPrivileged } = await resolveTenant(base44, user, requestedClientId);
    if (!tenantId) {
      return Response.json({ error: 'No ClientAccount membership' }, { status: 403 });
    }

    const entity = base44.asServiceRole.entities[entityName];
    if (!entity) return Response.json({ error: `Unknown entity ${entityName}` }, { status: 400 });

    // Force tenant filter on every read/write. Caller-provided client_account_id is ignored.
    const scopedFilters = { ...filters, client_account_id: tenantId };

    switch (operation) {
      case 'list':
      case 'filter': {
        const results = await entity.filter(scopedFilters, sort, limit, skip);
        return Response.json({ data: results, tenantId });
      }
      case 'get': {
        if (!id) return Response.json({ error: 'id required' }, { status: 400 });
        const record = await entity.get(id);
        if (!record) return Response.json({ error: 'Not found' }, { status: 404 });
        // Verify tenant ownership before returning.
        if (record.client_account_id && record.client_account_id !== tenantId && !isPrivileged) {
          return Response.json({ error: 'Forbidden' }, { status: 403 });
        }
        return Response.json({ data: record, tenantId });
      }
      case 'create': {
        const payload = { ...(data || {}), client_account_id: tenantId };
        const created = await entity.create(payload);
        return Response.json({ data: created, tenantId });
      }
      case 'update': {
        if (!id) return Response.json({ error: 'id required' }, { status: 400 });
        const existing = await entity.get(id);
        if (!existing) return Response.json({ error: 'Not found' }, { status: 404 });
        if (existing.client_account_id && existing.client_account_id !== tenantId && !isPrivileged) {
          return Response.json({ error: 'Forbidden' }, { status: 403 });
        }
        const payload = { ...(data || {}) };
        // Never let an update mutate client_account_id away from its tenant.
        payload.client_account_id = existing.client_account_id || tenantId;
        const updated = await entity.update(id, payload);
        return Response.json({ data: updated, tenantId });
      }
      case 'delete': {
        if (!id) return Response.json({ error: 'id required' }, { status: 400 });
        const existing = await entity.get(id);
        if (!existing) return Response.json({ error: 'Not found' }, { status: 404 });
        if (existing.client_account_id && existing.client_account_id !== tenantId && !isPrivileged) {
          return Response.json({ error: 'Forbidden' }, { status: 403 });
        }
        await entity.delete(id);
        return Response.json({ data: { id }, tenantId });
      }
      default:
        return Response.json({ error: `Unknown operation ${operation}` }, { status: 400 });
    }
  } catch (err) {
    return Response.json({ error: err.message || String(err) }, { status: 500 });
  }
});