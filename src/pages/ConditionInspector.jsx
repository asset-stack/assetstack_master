import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { secureEntity } from '@/lib/secureEntities';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Sparkles, Loader2, ArrowLeft, Route, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { buildInspectionRoute } from '@/lib/inspectorRoute';
import { getQueue, addToQueue, removeFromQueue, isOnline } from '@/lib/offlineInspectionQueue';
import InspectorLocationPicker from '@/components/inspector/InspectorLocationPicker';
import InspectorRoomHeatmap from '@/components/inspector/InspectorRoomHeatmap';
import TinderInspectorCard from '@/components/inspector/TinderInspectorCard';
import InspectorProgressBar from '@/components/inspector/InspectorProgressBar';
import InspectorSummary from '@/components/inspector/InspectorSummary';

export default function ConditionInspector() {
  const [stage, setStage] = useState('pick_location'); // pick_location | inspecting | done
  const [locations, setLocations] = useState([]);
  const [assetCounts, setAssetCounts] = useState({});
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [assetIndex, setAssetIndex] = useState(0);
  const [results, setResults] = useState([]);
  const [inspectedIds, setInspectedIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [sessionStart, setSessionStart] = useState(null);
  const [online, setOnline] = useState(isOnline());
  const [pendingSync, setPendingSync] = useState(getQueue().length);

  // Track online/offline
  useEffect(() => {
    const goOnline = () => { setOnline(true); flushQueue(); };
    const goOffline = () => setOnline(false);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load locations + asset counts
  useEffect(() => {
    (async () => {
      setLoading(true);
      const [locs, allAssets] = await Promise.all([
        secureEntity('Location').list('-created_date', 200),
        fetchAllAssets(),
      ]);
      const counts = {};
      allAssets.forEach((a) => {
        counts[a.location] = (counts[a.location] || 0) + 1;
      });
      // Only show locations that actually have assets
      setLocations(locs.filter((l) => counts[l.name] > 0).sort((a, b) => (counts[b.name] || 0) - (counts[a.name] || 0)));
      setAssetCounts(counts);
      setLoading(false);
    })();
    flushQueue();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchAllAssets = async (locName = null) => {
    const all = [];
    let page = 0;
    while (true) {
      const filter = locName ? { location: locName } : {};
      const batch = await secureEntity('Equipment').filter(filter, '-created_date', 200);
      all.push(...batch);
      if (batch.length < 200) break;
      page++;
      if (page > 30) break;
    }
    return all;
  };

  const flushQueue = useCallback(async () => {
    if (!isOnline()) return;
    const q = getQueue();
    if (q.length === 0) return;
    for (const item of q) {
      try {
        await base44.functions.invoke('bulkUpdateConditions', {
          equipment_ids: [item.equipment_id],
          updates: item.updates,
        });
        if (item.photo) {
          await secureEntity('AssetPhoto').create(item.photo);
        }
        removeFromQueue(item.id);
      } catch (err) {
        console.warn('Sync failed for', item.id, err);
        break;
      }
    }
    setPendingSync(getQueue().length);
  }, []);

  const startInspection = async (location) => {
    setLoading(true);
    setSelectedLocation(location);
    const assets = await fetchAllAssets(location.name);
    const route = buildInspectionRoute(assets);
    setRooms(route);
    setActiveRoom(route[0] || null);
    setAssetIndex(0);
    setResults([]);
    setInspectedIds(new Set());
    setSessionStart(Date.now());
    setStage('inspecting');
    setLoading(false);
  };

  const flatAssetList = useMemo(() => {
    if (!activeRoom) return [];
    return activeRoom.assets;
  }, [activeRoom]);

  const totalAssets = useMemo(() => rooms.reduce((acc, r) => acc + r.assets.length, 0), [rooms]);
  const currentAsset = flatAssetList[assetIndex] || null;

  const handleSubmit = async ({ asset, grade, photoUrl, note, aiSuggestion }) => {
    const result = { asset, grade, photoUrl, note, aiSuggestion, timestamp: new Date().toISOString() };

    const updates = {
      condition_grade: grade,
      condition_description: note || undefined,
      defect_urgency: aiSuggestion?.urgency && aiSuggestion.urgency !== 'none' ? aiSuggestion.urgency : (grade >= 4 ? 'high' : grade === 3 ? 'medium' : undefined),
      defect_cost: aiSuggestion?.estimated_cost_aud || undefined,
      action: aiSuggestion?.recommended_action || undefined,
    };

    const photoRecord = photoUrl ? {
      equipment_id: asset.id,
      equipment_name: asset.name,
      photo_url: photoUrl,
      captured_date: new Date().toISOString().slice(0, 10),
      condition_grade_at_capture: grade,
      notes: note,
      photo_type: 'inspection',
    } : null;

    if (online) {
      try {
        await base44.functions.invoke('bulkUpdateConditions', {
          equipment_ids: [asset.id],
          updates,
        });
        if (photoRecord) await secureEntity('AssetPhoto').create(photoRecord);
        toast.success(`${asset.name} → C${grade}`);
      } catch (err) {
        // Fall back to queue on failure
        addToQueue({ equipment_id: asset.id, updates, photo: photoRecord });
        setPendingSync(getQueue().length);
        toast.warning('Saved offline — will sync when back online');
      }
    } else {
      addToQueue({ equipment_id: asset.id, updates, photo: photoRecord });
      setPendingSync(getQueue().length);
      toast.success(`${asset.name} → C${grade} (queued)`);
    }

    // Update local state — mutate the asset record to reflect new grade for heatmap
    asset._sessionGrade = grade;
    setResults((r) => [...r, result]);
    setInspectedIds((s) => new Set([...s, asset.id]));
    advance();
  };

  const advance = () => {
    if (!activeRoom) return;
    const nextIdx = assetIndex + 1;
    if (nextIdx < activeRoom.assets.length) {
      setAssetIndex(nextIdx);
      return;
    }
    // Room complete — find next room with un-inspected assets
    const currentRoomIdx = rooms.findIndex((r) => r.roomName === activeRoom.roomName);
    for (let i = currentRoomIdx + 1; i < rooms.length; i++) {
      if (rooms[i].assets.some((a) => !inspectedIds.has(a.id))) {
        setActiveRoom(rooms[i]);
        setAssetIndex(0);
        return;
      }
    }
    // All done
    setStage('done');
  };

  const skipAsset = () => advance();

  const switchRoom = (room) => {
    setActiveRoom(room);
    const firstUninspected = room.assets.findIndex((a) => !inspectedIds.has(a.id));
    setAssetIndex(firstUninspected >= 0 ? firstUninspected : 0);
  };

  const sessionDurationMin = sessionStart ? Math.round((Date.now() - sessionStart) / 60000) : 0;

  if (loading) {
    return (
      <div className="p-6 flex items-center gap-2 text-slate-500">
        <Loader2 className="w-4 h-4 animate-spin" /> Loading…
      </div>
    );
  }

  // STAGE 1: Pick location
  if (stage === 'pick_location') {
    return (
      <div className="p-4 md:p-6 max-w-2xl mx-auto">
        <div className="mb-5">
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-indigo-600" /> Condition Inspector
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            AI-assisted walk-through. Snap a photo, AI grades, you confirm. Built for speed.
          </p>
        </div>
        <Card className="p-4 mb-4 bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200">
          <div className="flex items-start gap-3">
            <Zap className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
            <div className="text-sm">
              <div className="font-semibold text-slate-900 mb-1">How it works</div>
              <ol className="text-xs text-slate-700 space-y-1 list-decimal list-inside">
                <li>Pick a location → AI builds optimal walking route</li>
                <li>Walk room-by-room — snap each asset</li>
                <li>AI suggests grade · you confirm → next asset</li>
                <li>Works offline · auto-syncs · auto-generates report</li>
              </ol>
            </div>
          </div>
        </Card>
        <InspectorLocationPicker
          locations={locations}
          assetCountsByLocation={assetCounts}
          onPick={startInspection}
        />
      </div>
    );
  }

  // STAGE 3: Done
  if (stage === 'done') {
    return (
      <div className="p-4 md:p-6 max-w-2xl mx-auto">
        <InspectorSummary
          location={selectedLocation}
          results={results}
          sessionDurationMin={sessionDurationMin}
          onDone={() => {
            setStage('pick_location');
            setSelectedLocation(null);
            setRooms([]);
            setResults([]);
            setInspectedIds(new Set());
          }}
          onContinue={() => setStage('inspecting')}
        />
      </div>
    );
  }

  // STAGE 2: Inspecting
  const roomComplete = activeRoom && activeRoom.assets.every((a) => inspectedIds.has(a.id));

  return (
    <div className="max-w-2xl mx-auto pb-8">
      <InspectorProgressBar
        completed={inspectedIds.size}
        total={totalAssets}
        pendingSync={pendingSync}
        online={online}
        sessionStart={sessionStart}
      />

      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <button onClick={() => setStage('pick_location')} className="text-xs text-slate-500 flex items-center gap-1 hover:text-slate-700">
            <ArrowLeft className="w-3 h-3" /> {selectedLocation?.name}
          </button>
          <Button variant="outline" size="sm" onClick={() => setStage('done')} className="text-xs">
            Finish
          </Button>
        </div>

        <InspectorRoomHeatmap
          rooms={rooms}
          inspectedIds={inspectedIds}
          activeRoom={activeRoom}
          onPickRoom={switchRoom}
        />

        {currentAsset && !roomComplete && (
          <TinderInspectorCard
            asset={currentAsset}
            onSubmit={handleSubmit}
            onSkip={skipAsset}
            position={{ current: assetIndex + 1, total: activeRoom.assets.length }}
          />
        )}

        {roomComplete && activeRoom && (
          <Card className="p-6 text-center bg-emerald-50 border-emerald-200">
            <div className="text-4xl mb-2">✅</div>
            <div className="font-bold text-emerald-900">Room complete</div>
            <div className="text-xs text-emerald-700 mt-1">
              {activeRoom.roomName} — all {activeRoom.assets.length} assets inspected
            </div>
            <Button onClick={advance} className="mt-3 bg-emerald-600 hover:bg-emerald-700">
              <Route className="w-4 h-4 mr-2" /> Next room
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}