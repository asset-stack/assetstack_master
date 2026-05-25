import { base44 } from '@/api/base44Client';

// Thin frontend helper that routes tenant-scoped entity calls through the
// secureEntityQuery backend gateway. The gateway enforces client_account_id
// server-side, so callers cannot read or write across tenants.
//
// Usage:
//   import { secureEntity } from '@/lib/secureEntities';
//   const tasks = await secureEntity('MaintenanceTask').filter({ status: 'scheduled' });
//   const created = await secureEntity('SavingsLedgerEntry').create({ amount: 1200 });

async function invoke(payload) {
  const res = await base44.functions.invoke('secureEntityQuery', payload);
  const body = res?.data ?? res;
  if (body?.error) throw new Error(body.error);
  return body?.data;
}

function getActiveClientId() {
  try {
    return localStorage.getItem('assetstack_client_id') || undefined;
  } catch {
    return undefined;
  }
}

export function secureEntity(entityName) {
  const requestedClientId = getActiveClientId();
  return {
    list: (sort = '-created_date', limit = 100) =>
      invoke({ entityName, operation: 'list', filters: {}, sort, limit, requestedClientId }),
    filter: (filters = {}, sort = '-created_date', limit = 100) =>
      invoke({ entityName, operation: 'filter', filters, sort, limit, requestedClientId }),
    get: (id) => invoke({ entityName, operation: 'get', id, requestedClientId }),
    create: (data) => invoke({ entityName, operation: 'create', data, requestedClientId }),
    update: (id, data) => invoke({ entityName, operation: 'update', id, data, requestedClientId }),
    delete: (id) => invoke({ entityName, operation: 'delete', id, requestedClientId }),
  };
}