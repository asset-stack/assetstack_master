import React, { useState, useMemo, useRef, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Globe2, Sparkles, Activity, AlertTriangle, CheckCircle2, Radio,
  ZoomIn, ZoomOut, Play, Pause, Locate, RotateCcw, Crosshair, Maximize,
  Network, Upload, FolderOpen, MapPin, Database
} from 'lucide-react';
import NetworkGlobe from '@/components/network-globe/NetworkGlobe';
import NetworkLineOverlay from '@/components/network-globe/NetworkLineOverlay';
import NetworkDrilldownMap from '@/components/network-globe/NetworkDrilldownMap';
import StationList from '@/components/network-globe/StationList';
import NetworkManager from '@/components/network-globe/NetworkManager';
import NodeImportDialog from '@/components/network-globe/NodeImportDialog';
import NodeActionDialog from '@/components/network-globe/NodeActionDialog';
import { TRAIN_LINES, ALL_STATIONS, MAINTENANCE_CHECKPOINTS, NSW_FOCUS } from '@/components/network-globe/westernLineData';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function NetworkGlobePage() {
  const globeRef = useRef(null);
  const [hovered, setHovered] = useState(null);
  const [selected, setSelected] = useState(null);
  const [mode, setMode] = useState('demo'); // 'demo' | 'user'
  const [activeNetwork, setActiveNetwork] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [autoRotate, setAutoRotate] = useState(true);
  const [view, setView] = useState({ phi: 0, theta: 0, size: 640 });
  const [drilldownOpen, setDrilldownOpen] = useState(false);
  const [drilldownStation, setDrilldownStation] = useState(null);

  // Dialog state
  const [managerOpen, setManagerOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [importTarget, setImportTarget] = useState(null);
  const [actionNode, setActionNode] = useState(null);

  // Load user's networks
  const { data: userNetworks = [] } = useQuery({
    queryKey: ['asset-networks'],
    queryFn: () => base44.entities.AssetNetwork.filter({ status: 'active' }, '-created_date'),
  });

  // Load nodes for the active user network
  const { data: activeNodes = [] } = useQuery({
    queryKey: ['network-nodes', activeNetwork?.id],
    queryFn: () => base44.entities.NetworkNode.filter({ network_id: activeNetwork.id }, 'order_index'),
    enabled: !!activeNetwork && mode === 'user',
  });

  // ------- Resolve what to show -------
  const isUserMode = mode === 'user' && activeNetwork;

  const { markers, focus, lines, checkpoints, title, subtitle } = useMemo(() => {
    if (isUserMode) {
      return {
        markers: activeNodes,
        focus: activeNodes.length
          ? { lat: activeNodes[0].lat, lng: activeNodes[0].lng }
          : { lat: activeNetwork.focus_lat || 0, lng: activeNetwork.focus_lng || 0 },
        lines: [{
          id: activeNetwork.id,
          name: activeNetwork.name,
          color: activeNetwork.color || '#6366f1',
          stations: activeNodes,
        }],
        checkpoints: activeNodes.filter((n) => n.node_type === 'sensor' || n.node_type === 'checkpoint').map((n) => ({
          ...n,
          id: n.id,
          line: activeNetwork.id,
          lineColor: activeNetwork.color,
          label: n.node_type,
          between: n.zone || '',
          sensors: n.sensors || [],
        })),
        title: activeNetwork.name,
        subtitle: activeNetwork.description || `${activeNodes.length} nodes`,
      };
    }
    // Demo fallback
    return {
      markers: ALL_STATIONS,
      focus: NSW_FOCUS,
      lines: TRAIN_LINES,
      checkpoints: MAINTENANCE_CHECKPOINTS,
      title: 'Sydney Trains Network (Demo)',
      subtitle: `${TRAIN_LINES.length} lines • ${ALL_STATIONS.length} stations • ${MAINTENANCE_CHECKPOINTS.length} sensor checkpoints`,
    };
  }, [isUserMode, activeNetwork, activeNodes]);

  const stats = useMemo(() => ({
    total: markers.length,
    operational: markers.filter((s) => s.condition === 'operational').length,
    degraded: markers.filter((s) => s.condition === 'degraded').length,
    critical: markers.filter((s) => s.condition === 'critical').length,
    checkpoints: checkpoints.length,
  }), [markers, checkpoints]);

  const handleViewChange = useCallback((v) => setView(v), []);

  const flyToStation = useCallback((station) => {
    setSelected(station);
    setDrilldownStation(station);
    setDrilldownOpen(true);
  }, []);

  const resetView = useCallback(() => {
    setZoom(1);
    setAutoRotate(true);
    setSelected(null);
    globeRef.current?.flyTo(focus.lat, focus.lng);
  }, [focus]);

  const focusOnNetwork = useCallback(() => {
    setAutoRotate(false);
    setZoom(2.4);
    globeRef.current?.flyTo(focus.lat, focus.lng);
  }, [focus]);

  const switchToUserNetwork = (network) => {
    setMode('user');
    setActiveNetwork(network);
    setSelected(null);
    setTimeout(() => globeRef.current?.flyTo(network.focus_lat || 0, network.focus_lng || 0), 100);
  };

  const switchToDemo = () => {
    setMode('demo');
    setActiveNetwork(null);
    setSelected(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white">
      <div
        className="fixed inset-0 pointer-events-none opacity-30"
        style={{
          backgroundImage:
            'linear-gradient(rgba(99,102,241,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.08) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      <main className="relative px-4 sm:px-6 lg:px-8 py-6 max-w-[1480px] mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3 mb-1.5">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-indigo-500/50">
                  <Globe2 className="w-5 h-5 text-white" />
                </div>
                <div className="absolute -inset-1 bg-gradient-to-br from-indigo-500 to-fuchsia-500 rounded-xl blur-lg opacity-40 -z-10" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
                  <Badge className={`border-0 gap-1 ${isUserMode ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-gradient-to-r from-indigo-500 to-fuchsia-500'} text-white`}>
                    {isUserMode ? <Database className="w-3 h-3" /> : <Sparkles className="w-3 h-3" />}
                    {isUserMode ? 'My Data' : 'Demo'}
                  </Badge>
                </div>
                <p className="text-sm text-white/50 mt-0.5">{subtitle}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button
              size="sm"
              onClick={() => { setDrilldownStation(null); setDrilldownOpen(true); }}
              className="bg-gradient-to-r from-fuchsia-500 to-indigo-500 border-0 hover:opacity-90 gap-2 shadow-lg shadow-fuchsia-500/30"
            >
              <Maximize className="w-4 h-4" />
              Inspect Network
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setManagerOpen(true)}
              className="bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border-emerald-400/40 text-white hover:bg-emerald-500/30 gap-2"
            >
              <FolderOpen className="w-4 h-4" />
              My Networks ({userNetworks.length})
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={focusOnNetwork}
              className="bg-gradient-to-r from-indigo-500/20 to-violet-500/20 border-indigo-400/40 text-white hover:bg-indigo-500/30 gap-2"
            >
              <Crosshair className="w-4 h-4" />
              Focus
            </Button>
          </div>
        </div>

        {/* Network switcher chips */}
        {(userNetworks.length > 0 || mode === 'user') && (
          <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1">
            <button
              onClick={switchToDemo}
              className={`flex-shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all ${
                mode === 'demo'
                  ? 'bg-indigo-500 border-indigo-400 text-white shadow-lg shadow-indigo-500/40'
                  : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
              }`}
            >
              <Sparkles className="w-3 h-3" />
              Demo (Sydney Trains)
            </button>
            {userNetworks.map((n) => (
              <button
                key={n.id}
                onClick={() => switchToUserNetwork(n)}
                className={`flex-shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all ${
                  activeNetwork?.id === n.id
                    ? 'bg-white/15 border-white/30 text-white shadow-lg'
                    : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                }`}
              >
                <span className="w-2 h-2 rounded-full" style={{ background: n.color || '#6366f1' }} />
                {n.name}
                <span className="text-white/40">• {n.node_count || 0}</span>
              </button>
            ))}
            <button
              onClick={() => setManagerOpen(true)}
              className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-dashed border-white/20 text-xs font-semibold text-white/60 hover:bg-white/5 hover:border-white/40 transition-all"
            >
              <Network className="w-3 h-3" />
              + New Network
            </button>
          </div>
        )}

        {/* Empty-state banner when user network has no nodes */}
        {isUserMode && markers.length === 0 && (
          <div className="mb-4 rounded-2xl border border-dashed border-indigo-400/30 bg-indigo-500/5 p-6 text-center">
            <MapPin className="w-8 h-8 text-indigo-300 mx-auto mb-2" />
            <h3 className="text-lg font-semibold text-white">This network has no nodes yet</h3>
            <p className="text-sm text-white/60 mt-1 mb-4">
              Upload a CSV or GeoJSON file to populate <strong>{activeNetwork.name}</strong> with assets.
            </p>
            <Button
              onClick={() => { setImportTarget(activeNetwork); setImportOpen(true); }}
              className="bg-indigo-500 hover:bg-indigo-600 gap-2"
            >
              <Upload className="w-4 h-4" /> Upload Nodes
            </Button>
          </div>
        )}

        {/* Stats strip */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
          <StatCard icon={MapPin} label="Nodes" value={stats.total} color="indigo" />
          <StatCard icon={Radio} label="Sensor Points" value={stats.checkpoints} color="violet" />
          <StatCard icon={CheckCircle2} label="Operational" value={stats.operational} color="emerald" />
          <StatCard icon={Activity} label="Degraded" value={stats.degraded} color="amber" />
          <StatCard icon={AlertTriangle} label="Critical" value={stats.critical} color="rose" />
        </div>

        {/* Main canvas + sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr,340px] gap-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="relative rounded-3xl overflow-hidden border border-white/10 bg-gradient-to-br from-slate-900/80 via-slate-900/50 to-indigo-950/60 backdrop-blur-xl"
            style={{ minHeight: 640 }}
          >
            <FrameCorner pos="top-left" />
            <FrameCorner pos="top-right" />
            <FrameCorner pos="bottom-left" />
            <FrameCorner pos="bottom-right" />

            <motion.div
              className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-400/70 to-transparent pointer-events-none z-10"
              animate={{ top: ['0%', '100%', '0%'] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
            />

            <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-black/40 backdrop-blur-sm border border-white/10 rounded-full px-3 py-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-[10px] font-semibold tracking-wider uppercase text-white/80">
                Realtime
              </span>
            </div>

            <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
              <div className="bg-black/40 backdrop-blur-sm border border-white/10 rounded-full px-3 py-1.5">
                <span className="text-[10px] font-semibold tracking-wider uppercase text-white/80 font-mono">
                  {zoom.toFixed(1)}×
                </span>
              </div>
            </div>

            <div className="relative w-full flex items-center justify-center" style={{ height: 640 }}>
              <NetworkGlobe
                ref={globeRef}
                markers={markers}
                focus={focus}
                onMarkerHover={setHovered}
                theme="dark"
                autoRotate={autoRotate}
                zoom={zoom}
                onViewChange={handleViewChange}
              />

              {markers.length > 0 && zoom >= 1.6 && (
                <div
                  className="absolute pointer-events-none"
                  style={{
                    width: view.size, height: view.size,
                    opacity: Math.min(1, (zoom - 1.4) / 0.8),
                    transition: 'opacity 0.3s ease',
                  }}
                >
                  <NetworkLineOverlay
                    stations={markers}
                    phi={view.phi}
                    theta={view.theta}
                    size={view.size}
                    label={activeNetwork?.name || 'Network'}
                  />
                </div>
              )}
            </div>

            <div className="absolute bottom-4 right-4 z-20 flex flex-col gap-1.5 bg-black/50 backdrop-blur-md border border-white/10 rounded-xl p-1.5 shadow-2xl">
              <ControlBtn onClick={() => setZoom((z) => Math.min(4, +(z + 0.4).toFixed(2)))} title="Zoom in"><ZoomIn className="w-4 h-4" /></ControlBtn>
              <div className="text-[9px] text-white/50 text-center font-mono py-0.5">{zoom.toFixed(1)}×</div>
              <ControlBtn onClick={() => setZoom((z) => Math.max(1, +(z - 0.4).toFixed(2)))} title="Zoom out"><ZoomOut className="w-4 h-4" /></ControlBtn>
              <div className="h-px bg-white/10 my-1" />
              <ControlBtn onClick={() => setAutoRotate((r) => !r)} title={autoRotate ? 'Pause' : 'Play'} active={!autoRotate}>
                {autoRotate ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </ControlBtn>
              <ControlBtn onClick={resetView} title="Reset"><RotateCcw className="w-4 h-4" /></ControlBtn>
            </div>

            {selected && (
              <motion.div
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                className="absolute bottom-4 left-4 z-10 bg-black/60 backdrop-blur-md border border-indigo-400/40 rounded-xl px-4 py-2.5 shadow-2xl"
              >
                <div className="flex items-center gap-2">
                  <Locate className="w-3.5 h-3.5 text-indigo-300" />
                  <span className="text-[10px] font-semibold tracking-wider uppercase text-indigo-200">Focused</span>
                </div>
                <p className="text-sm font-bold text-white mt-0.5">{selected.name}</p>
                <p className="text-[10px] text-white/50 font-mono mt-0.5">
                  {Number(selected.lat).toFixed(5)}°, {Number(selected.lng).toFixed(5)}°
                </p>
              </motion.div>
            )}
          </motion.div>

          <motion.aside
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="rounded-3xl border border-white/10 bg-slate-900/60 backdrop-blur-xl overflow-hidden flex flex-col"
            style={{ minHeight: 640 }}
          >
            <div className="p-4 border-b border-white/10 bg-gradient-to-br from-indigo-500/20 to-fuchsia-500/10">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="font-semibold text-white truncate">{title}</h3>
                  <p className="text-xs text-white/50 mt-0.5 truncate">{subtitle}</p>
                </div>
                {isUserMode && (
                  <Button size="sm" variant="ghost" onClick={() => { setImportTarget(activeNetwork); setImportOpen(true); }} className="text-white/70 hover:bg-white/10" title="Import more nodes">
                    <Upload className="w-4 h-4" />
                  </Button>
                )}
              </div>
              <p className="text-[10px] text-white/40 mt-2">
                👆 Click any node to fly in, inspect & create tasks
              </p>
            </div>
            <StationList
              stations={markers}
              hoveredName={hovered?.name || selected?.name}
              onSelect={flyToStation}
            />
          </motion.aside>
        </div>

        <p className="text-center text-[11px] text-white/30 mt-4">
          {isUserMode
            ? 'Click any node on the map to create tasks, work orders, or link equipment records.'
            : 'Demo data — switch to "My Networks" to upload your own assets (rail, power, water, any geotagged infrastructure).'}
        </p>
      </main>

      {/* Drill-down */}
      <AnimatePresence>
        {drilldownOpen && (
          <NetworkDrilldownMap
            title={title}
            lines={lines}
            stations={markers}
            checkpoints={checkpoints}
            focusStation={drilldownStation}
            onClose={() => setDrilldownOpen(false)}
            onSelectStation={(s) => { setSelected(s); setDrilldownStation(s); }}
            onNodeAction={(n) => { setDrilldownOpen(false); setActionNode(n); }}
          />
        )}
      </AnimatePresence>

      {/* Network manager */}
      <NetworkManager
        open={managerOpen}
        onClose={() => setManagerOpen(false)}
        onSelectNetwork={switchToUserNetwork}
        onImportRequest={(n) => { setImportTarget(n); setImportOpen(true); setManagerOpen(false); }}
      />

      {/* Node import */}
      <NodeImportDialog
        open={importOpen}
        network={importTarget}
        onClose={() => { setImportOpen(false); setImportTarget(null); }}
      />

      {/* Node action (create task / WO / link equipment) */}
      <NodeActionDialog
        open={!!actionNode}
        node={actionNode}
        networkName={title}
        onClose={() => setActionNode(null)}
      />
    </div>
  );
}

function ControlBtn({ children, onClick, title, active }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
        active ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/40' : 'text-white/70 hover:bg-white/10 hover:text-white'
      }`}
    >
      {children}
    </button>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  const colors = {
    indigo: 'from-indigo-500/20 to-indigo-500/5 border-indigo-400/30 text-indigo-300',
    violet: 'from-violet-500/20 to-violet-500/5 border-violet-400/30 text-violet-300',
    emerald: 'from-emerald-500/20 to-emerald-500/5 border-emerald-400/30 text-emerald-300',
    amber: 'from-amber-500/20 to-amber-500/5 border-amber-400/30 text-amber-300',
    rose: 'from-rose-500/20 to-rose-500/5 border-rose-400/30 text-rose-300',
  };
  return (
    <div className={`relative rounded-xl bg-gradient-to-br ${colors[color]} border backdrop-blur-sm p-3.5 overflow-hidden`}>
      <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider opacity-80 mb-1.5">
        <Icon className="w-3.5 h-3.5" />
        {label}
      </div>
      <div className="text-2xl font-bold text-white">{value}</div>
    </div>
  );
}

function FrameCorner({ pos }) {
  const cls = {
    'top-left': 'top-3 left-3 border-t-2 border-l-2',
    'top-right': 'top-3 right-3 border-t-2 border-r-2',
    'bottom-left': 'bottom-3 left-3 border-b-2 border-l-2',
    'bottom-right': 'bottom-3 right-3 border-b-2 border-r-2',
  }[pos];
  return <div className={`absolute w-6 h-6 border-indigo-400/40 pointer-events-none ${cls}`} />;
}