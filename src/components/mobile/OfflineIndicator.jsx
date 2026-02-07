import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff, Wifi, RefreshCw, CloudOff, Check } from 'lucide-react';
import { offlineStore } from './OfflineSyncManager';

export default function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showReconnected, setShowReconnected] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [syncComplete, setSyncComplete] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowReconnected(true);
      setTimeout(() => setShowReconnected(false), 3000);
    };
    const handleOffline = () => {
      setIsOnline(false);
      setShowReconnected(false);
    };
    const handleSyncStart = () => setIsSyncing(true);
    const handleSyncComplete = (e) => {
      setIsSyncing(false);
      const remaining = e.detail?.remaining || 0;
      if (remaining === 0) {
        setSyncComplete(true);
        setTimeout(() => setSyncComplete(false), 3000);
      }
    };
    const handleQueueChange = () => {
      const q = offlineStore.getQueue();
      const m = offlineStore.getMediaQueue();
      setPendingCount(q.length + m.length);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('offlineSyncStart', handleSyncStart);
    window.addEventListener('offlineSyncComplete', handleSyncComplete);
    window.addEventListener('offlineQueueChange', handleQueueChange);

    // Initial count
    handleQueueChange();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('offlineSyncStart', handleSyncStart);
      window.removeEventListener('offlineSyncComplete', handleSyncComplete);
      window.removeEventListener('offlineQueueChange', handleQueueChange);
    };
  }, []);

  return (
    <AnimatePresence>
      {/* Offline banner */}
      {!isOnline && (
        <motion.div
          initial={{ y: -60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -60, opacity: 0 }}
          className="fixed top-0 left-0 right-0 z-[100] bg-rose-600 text-white px-4 py-2.5 flex items-center justify-center gap-2 text-sm font-medium shadow-lg"
          style={{ paddingTop: 'max(env(safe-area-inset-top, 0px), 8px)' }}
        >
          <WifiOff className="w-4 h-4" />
          <span>You're offline</span>
          {pendingCount > 0 && (
            <span className="bg-white/20 rounded-full px-2 py-0.5 text-xs">
              {pendingCount} pending {pendingCount === 1 ? 'change' : 'changes'}
            </span>
          )}
        </motion.div>
      )}

      {/* Syncing banner */}
      {isSyncing && isOnline && (
        <motion.div
          initial={{ y: -60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -60, opacity: 0 }}
          className="fixed top-0 left-0 right-0 z-[100] bg-indigo-600 text-white px-4 py-2.5 flex items-center justify-center gap-2 text-sm font-medium shadow-lg"
          style={{ paddingTop: 'max(env(safe-area-inset-top, 0px), 8px)' }}
        >
          <RefreshCw className="w-4 h-4 animate-spin" />
          Syncing offline changes...
        </motion.div>
      )}

      {/* Sync complete banner */}
      {syncComplete && isOnline && !isSyncing && (
        <motion.div
          initial={{ y: -60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -60, opacity: 0 }}
          className="fixed top-0 left-0 right-0 z-[100] bg-emerald-600 text-white px-4 py-2.5 flex items-center justify-center gap-2 text-sm font-medium shadow-lg"
          style={{ paddingTop: 'max(env(safe-area-inset-top, 0px), 8px)' }}
        >
          <Check className="w-4 h-4" />
          All changes synced
        </motion.div>
      )}

      {/* Reconnected banner (when no pending) */}
      {showReconnected && isOnline && !isSyncing && !syncComplete && pendingCount === 0 && (
        <motion.div
          initial={{ y: -60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -60, opacity: 0 }}
          className="fixed top-0 left-0 right-0 z-[100] bg-emerald-600 text-white px-4 py-2.5 flex items-center justify-center gap-2 text-sm font-medium shadow-lg"
          style={{ paddingTop: 'max(env(safe-area-inset-top, 0px), 8px)' }}
        >
          <Wifi className="w-4 h-4" />
          Back online
        </motion.div>
      )}
    </AnimatePresence>
  );
}