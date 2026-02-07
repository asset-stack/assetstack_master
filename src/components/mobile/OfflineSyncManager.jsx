/**
 * OfflineSyncManager — localStorage-based offline queue for work orders.
 * 
 * Stores:
 *  - offlineCache:{workOrderId}  → full work order snapshot (for offline reads)
 *  - offlineSyncQueue             → array of pending mutations
 *  - offlineMediaQueue            → array of files waiting to be uploaded
 *
 * Usage:
 *  import { offlineStore } from './OfflineSyncManager';
 *  offlineStore.cacheWorkOrder(workOrder);
 *  offlineStore.enqueue({ type, entityName, id, data });
 */

const QUEUE_KEY = 'offlineSyncQueue';
const MEDIA_KEY = 'offlineMediaQueue';

function cachePrefix(id) { return `offlineCache:${id}`; }

// ─── Work-order cache (read-only offline) ───

function cacheWorkOrder(wo) {
  if (!wo?.id) return;
  try {
    localStorage.setItem(cachePrefix(wo.id), JSON.stringify({ ...wo, _cachedAt: Date.now() }));
  } catch { /* quota exceeded — ignore */ }
}

function getCachedWorkOrder(id) {
  try {
    const raw = localStorage.getItem(cachePrefix(id));
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function cacheMultiple(items) {
  (items || []).forEach(cacheWorkOrder);
}

// ─── Sync queue (offline writes) ───

function getQueue() {
  try {
    return JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
  } catch { return []; }
}

function saveQueue(queue) {
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

function enqueue(op) {
  const queue = getQueue();
  queue.push({ ...op, _queuedAt: Date.now(), _id: crypto.randomUUID() });
  saveQueue(queue);
  window.dispatchEvent(new CustomEvent('offlineQueueChange'));
}

function dequeue(queueId) {
  const queue = getQueue().filter(q => q._id !== queueId);
  saveQueue(queue);
  window.dispatchEvent(new CustomEvent('offlineQueueChange'));
}

function clearQueue() {
  saveQueue([]);
  window.dispatchEvent(new CustomEvent('offlineQueueChange'));
}

// ─── Media queue (files captured offline) ───

function getMediaQueue() {
  try {
    return JSON.parse(localStorage.getItem(MEDIA_KEY) || '[]');
  } catch { return []; }
}

function enqueueMedia(item) {
  const queue = getMediaQueue();
  queue.push({ ...item, _id: crypto.randomUUID(), _queuedAt: Date.now() });
  localStorage.setItem(MEDIA_KEY, JSON.stringify(queue));
  window.dispatchEvent(new CustomEvent('offlineQueueChange'));
}

function dequeueMedia(id) {
  const queue = getMediaQueue().filter(q => q._id !== id);
  localStorage.setItem(MEDIA_KEY, JSON.stringify(queue));
  window.dispatchEvent(new CustomEvent('offlineQueueChange'));
}

function clearMediaQueue() {
  localStorage.setItem(MEDIA_KEY, '[]');
  window.dispatchEvent(new CustomEvent('offlineQueueChange'));
}

// ─── Apply local queue on top of cached data ───

function getWorkOrderWithPending(id) {
  let wo = getCachedWorkOrder(id);
  if (!wo) return null;

  const queue = getQueue().filter(q => q.id === id && q.entityName === 'WorkOrder' && q.type === 'update');
  queue.forEach(op => {
    wo = { ...wo, ...op.data };
  });
  return wo;
}

// ─── Exports ───

export const offlineStore = {
  cacheWorkOrder,
  getCachedWorkOrder,
  cacheMultiple,
  getWorkOrderWithPending,
  enqueue,
  dequeue,
  getQueue,
  clearQueue,
  enqueueMedia,
  dequeueMedia,
  getMediaQueue,
  clearMediaQueue,
};

export default offlineStore;