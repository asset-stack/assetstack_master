/**
 * OfflineChatManager — localStorage-based offline support for AI chat.
 * 
 * Caches:
 *  - AI context (equipment, docs, etc.) for offline use
 *  - Chat sessions for offline viewing
 *  - Pending messages queued while offline
 */

const CONTEXT_KEY = 'aiChat:context';
const DOCS_KEY = 'aiChat:docs';
const SESSIONS_KEY = 'aiChat:sessions';
const PENDING_KEY = 'aiChat:pendingMessages';
const ACTIVE_SESSION_KEY = 'aiChat:activeSession';

// ─── Context caching ───

function cacheContext(data) {
  try { localStorage.setItem(CONTEXT_KEY, JSON.stringify({ ...data, _cachedAt: Date.now() })); } catch {}
}

function getCachedContext() {
  try { return JSON.parse(localStorage.getItem(CONTEXT_KEY) || 'null'); } catch { return null; }
}

function cacheDocs(docs) {
  try { localStorage.setItem(DOCS_KEY, JSON.stringify(docs)); } catch {}
}

function getCachedDocs() {
  try { return JSON.parse(localStorage.getItem(DOCS_KEY) || '[]'); } catch { return []; }
}

// ─── Session caching ───

function cacheSessions(sessions) {
  try { localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions)); } catch {}
}

function getCachedSessions() {
  try { return JSON.parse(localStorage.getItem(SESSIONS_KEY) || '[]'); } catch { return []; }
}

function cacheActiveSession(session) {
  try { localStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(session)); } catch {}
}

function getCachedActiveSession() {
  try { return JSON.parse(localStorage.getItem(ACTIVE_SESSION_KEY) || 'null'); } catch { return null; }
}

// ─── Pending messages (offline queue) ───

function getPendingMessages() {
  try { return JSON.parse(localStorage.getItem(PENDING_KEY) || '[]'); } catch { return []; }
}

function addPendingMessage(sessionId, message) {
  const pending = getPendingMessages();
  pending.push({ sessionId, message, _id: crypto.randomUUID(), _queuedAt: Date.now() });
  localStorage.setItem(PENDING_KEY, JSON.stringify(pending));
}

function clearPendingMessages() {
  localStorage.setItem(PENDING_KEY, '[]');
}

function removePendingMessage(id) {
  const pending = getPendingMessages().filter(p => p._id !== id);
  localStorage.setItem(PENDING_KEY, JSON.stringify(pending));
}

export const offlineChatStore = {
  cacheContext,
  getCachedContext,
  cacheDocs,
  getCachedDocs,
  cacheSessions,
  getCachedSessions,
  cacheActiveSession,
  getCachedActiveSession,
  getPendingMessages,
  addPendingMessage,
  clearPendingMessages,
  removePendingMessage,
};

export default offlineChatStore;