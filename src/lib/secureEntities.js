import { base44 } from '@/api/base44Client';
import { isDemoSession } from '@/lib/demoMode';

// Demo sessions are strictly read-only — block every mutating call so a
// prospect exploring a /demo/<slug> link can never pollute real data.
function assertWritable() {
  if (isDemoSession()) {
    throw new Error('This is a read-only demo environment. Changes are disabled.');
  }
}

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
    list: (sort = '-created_date', limit = 100, skip = 0) =>
      invoke({ entityName, operation: 'list', filters: {}, sort, limit, skip, requestedClientId }),
    filter: (filters = {}, sort = '-created_date', limit = 100, skip = 0) =>
      invoke({ entityName, operation: 'filter', filters, sort, limit, skip, requestedClientId }),
    get: (id) => invoke({ entityName, operation: 'get', id, requestedClientId }),
    create: (data) => { assertWritable(); return invoke({ entityName, operation: 'create', data, requestedClientId }); },
    update: (id, data) => { assertWritable(); return invoke({ entityName, operation: 'update', id, data, requestedClientId }); },
    delete: (id) => { assertWritable(); return invoke({ entityName, operation: 'delete', id, requestedClientId }); },
  };
}