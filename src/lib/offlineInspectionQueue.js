// Offline-first queue for inspection submissions.
// Stores pending inspections in localStorage and syncs when online.

const KEY = 'assetstack_pending_inspections_v1';

export function getQueue() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]');
  } catch {
    return [];
  }
}

export function addToQueue(item) {
  const q = getQueue();
  q.push({ ...item, queued_at: new Date().toISOString(), id: `pending_${Date.now()}_${Math.random().toString(36).slice(2, 8)}` });
  localStorage.setItem(KEY, JSON.stringify(q));
  return q;
}

export function removeFromQueue(id) {
  const q = getQueue().filter((x) => x.id !== id);
  localStorage.setItem(KEY, JSON.stringify(q));
  return q;
}

export function clearQueue() {
  localStorage.removeItem(KEY);
}

export function isOnline() {
  return typeof navigator !== 'undefined' ? navigator.onLine : true;
}