import React, { useEffect, useRef, useCallback, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { offlineStore } from './OfflineSyncManager';
import { useQueryClient } from '@tanstack/react-query';

/**
 * OfflineSyncEngine — a headless component that processes the offline queue
 * whenever the browser comes back online.  Mount once in Layout.
 */
export default function OfflineSyncEngine() {
  const queryClient = useQueryClient();
  const [syncing, setSyncing] = useState(false);
  const syncingRef = useRef(false);

  const processQueue = useCallback(async () => {
    if (syncingRef.current) return;
    if (!navigator.onLine) return;

    const queue = offlineStore.getQueue();
    const mediaQueue = offlineStore.getMediaQueue();

    if (queue.length === 0 && mediaQueue.length === 0) return;

    syncingRef.current = true;
    setSyncing(true);
    window.dispatchEvent(new CustomEvent('offlineSyncStart'));

    // 1. Upload queued media first
    for (const media of mediaQueue) {
      try {
        // media.dataUrl is a base64 data URL — convert to blob for upload
        if (media.dataUrl) {
          const resp = await fetch(media.dataUrl);
          const blob = await resp.blob();
          const file = new File([blob], media.fileName || 'offline-capture.jpg', { type: blob.type });
          const { file_url } = await base44.integrations.Core.UploadFile({ file });

          // Create the media entity record
          await base44.entities.WorkOrderMedia.create({
            work_order_id: media.workOrderId,
            file_url,
            file_type: media.fileType || 'image',
            file_name: media.fileName,
            description: media.description || '',
            category: media.category || 'evidence',
            uploaded_by_name: media.uploadedByName || '',
            uploaded_by_email: media.uploadedByEmail || '',
          });
        }
        offlineStore.dequeueMedia(media._id);
      } catch (err) {
        console.warn('[OfflineSync] media upload failed, will retry:', err.message);
      }
    }

    // 2. Process entity mutations
    for (const op of queue) {
      try {
        const entity = base44.entities[op.entityName];
        if (!entity) { offlineStore.dequeue(op._id); continue; }

        switch (op.type) {
          case 'update':
            await entity.update(op.id, op.data);
            break;
          case 'create':
            await entity.create(op.data);
            break;
          case 'delete':
            await entity.delete(op.id);
            break;
          default:
            break;
        }
        offlineStore.dequeue(op._id);
      } catch (err) {
        console.warn('[OfflineSync] operation failed, will retry:', op, err.message);
        // keep in queue for next retry
      }
    }

    // 3. Invalidate relevant queries so UI refreshes with server data
    queryClient.invalidateQueries({ queryKey: ['workOrders'] });
    queryClient.invalidateQueries({ queryKey: ['workOrder'] });
    queryClient.invalidateQueries({ queryKey: ['wo-media'] });
    queryClient.invalidateQueries({ queryKey: ['wo-messages'] });
    queryClient.invalidateQueries({ queryKey: ['tasks'] });

    syncingRef.current = false;
    setSyncing(false);
    window.dispatchEvent(new CustomEvent('offlineSyncComplete', { detail: { remaining: offlineStore.getQueue().length } }));
  }, [queryClient]);

  useEffect(() => {
    // Process on mount (in case we came online while app was closed)
    processQueue();

    // Process when browser comes back online
    const onOnline = () => {
      setTimeout(processQueue, 1000); // small delay to let connection stabilise
    };

    window.addEventListener('online', onOnline);

    // Also retry every 30 seconds while online
    const interval = setInterval(() => {
      if (navigator.onLine) processQueue();
    }, 30000);

    return () => {
      window.removeEventListener('online', onOnline);
      clearInterval(interval);
    };
  }, [processQueue]);

  // This is a headless component — renders nothing
  return null;
}