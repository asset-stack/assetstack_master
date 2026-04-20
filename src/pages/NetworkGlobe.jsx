import React, { useState, useMemo, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Globe2, Train, Sparkles, Activity, AlertTriangle, CheckCircle2, Radio,
  ZoomIn, ZoomOut, Play, Pause, Locate, RotateCcw, Crosshair, Maximize
} from 'lucide-react';
import NetworkGlobe from '@/components/network-globe/NetworkGlobe';
import NetworkLineOverlay from '@/components/network-globe/NetworkLineOverlay';
import NetworkDrilldownMap from '@/components/network-globe/NetworkDrilldownMap';
import StationList from '@/components/network-globe/StationList';
import { TRAIN_LINES, ALL_STATIONS, MAINTENANCE_CHECKPOINTS, NSW_FOCUS } from '@/components/network-globe/westernLineData';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function NetworkGlobePage() {
  const globeRef = useRef(null);
  const [hovered, setHovered] = useState(null);
  const [selected, setSelected] = useState(null);
  const [showDemo, setShowDemo] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [autoRotate, setAutoRotate] = useState(true);
  const [view, setView] = useState({ phi: 0, theta: 0, size: 640 });
  const [drilldownOpen, setDrilldownOpen] = useState(false);
  const [drilldownStation, setDrilldownStation] = useState(null);

  const markers = useMemo(() => (showDemo ? ALL_STATIONS : []), [showDemo]);

  const stats = useMemo(() => ({
    total: markers.length,
    operational: markers.filter((s) => s.condition === 'operational').length,
    degraded: markers.filter((s) => s.condition === 'degraded').length,
    critical: markers.filter((s) => s.condition === 'critical').length,
    checkpoints: MAINTENANCE_CHECKPOINTS.length,
  }), [markers]);

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
    globeRef.current?.flyTo(NSW_FOCUS.lat, NSW_FOCUS.lng);
  }, []);

  const focusOnNetwork = useCallback(() => {
    setAutoRotate(false);
    setZoom(2.4);
    globeRef.current?.flyTo(NSW_FOCUS.lat, NSW_FOCUS.lng);
  }, []);

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
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold tracking-tight">Asset Network Globe</h1>
                  <Badge className="bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white border-0 gap-1">
                    <Sparkles className="w-3 h-3" /> Live
                  </Badge>
                </div>
                <p className="text-sm text-white/50 mt-0.5">
                  {TRAIN_LINES.length} Sydney Trains lines • {ALL_STATIONS.length} stations • {MAINTENANCE_CHECKPOINTS.length} sensor checkpoints
                </p>
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
              onClick={focusOnNetwork}
              className="bg-gradient-to-r from-indigo-500/20 to-violet-500/20 border-indigo-400/40 text-white hover:bg-indigo-500/30 gap-2"
            >
              <Crosshair className="w-4 h-4" />
              Focus Globe
            </Button>
            <Button
              variant={showDemo ? 'default' : 'outline'}
              size="sm"
              onClick={() => setShowDemo(!showDemo)}
              className={showDemo
                ? 'bg-gradient-to-r from-indigo-500 to-violet-600 border-0 gap-2 hover:opacity-90'
                : 'bg-white/5 border-white/10 text-white hover:bg-white/10 gap-2'
              }
            >
              <Train className="w-4 h-4" />
              {showDemo ? 'Sydney Trains Network' : 'Load Demo'}
            </Button>
          </div>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
          <StatCard icon={Train} label="Stations" value={stats.total} color="indigo" />
          <StatCard icon={Radio} label="Sensor Points" value={stats.checkpoints} color="violet" />
          <StatCard icon={CheckCircle2} label="Operational" value={stats.operational} color="emerald" />
          <StatCard icon={Activity} label="Degraded" value={stats.degraded} color="amber" />
          <StatCard icon={AlertTriangle} label="Critical" value={stats.critical} color="rose" />
        </div>

        {/* Main canvas + sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr,340px] gap-4">
          {/* Globe panel */}
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

            {/* Live badge */}
            <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-black/40 backdrop-blur-sm border border-white/10 rounded-full px-3 py-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-[10px] font-semibold tracking-wider uppercase text-white/80">
                Realtime Telemetry
              </span>
            </div>

            {/* Region + zoom chip */}
            <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
              <div className="bg-black/40 backdrop-blur-sm border border-white/10 rounded-full px-3 py-1.5">
                <span className="text-[10px] font-semibold tracking-wider uppercase text-white/80 font-mono">
                  {zoom.toFixed(1)}× • NSW, AU
                </span>
              </div>
            </div>

            {/* Globe canvas + line overlay */}
            <div className="relative w-full flex items-center justify-center" style={{ height: 640 }}>
              <NetworkGlobe
                ref={globeRef}
                markers={markers}
                focus={NSW_FOCUS}
                onMarkerHover={setHovered}
                theme="dark"
                autoRotate={autoRotate}
                zoom={zoom}
                onViewChange={handleViewChange}
              />

              {/* Network line overlay — only visible when zoomed in */}
              {showDemo && zoom >= 1.6 && (
                <div
                  className="absolute pointer-events-none"
                  style={{
                    width: view.size,
                    height: view.size,
                    opacity: Math.min(1, (zoom - 1.4) / 0.8),
                    transition: 'opacity 0.3s ease',
                  }}
                >
                  <NetworkLineOverlay
                    stations={markers}
                    phi={view.phi}
                    theta={view.theta}
                    size={view.size}
                    label="T1 Western Line"
                  />
                </div>
              )}
            </div>

            {/* Zoom / playback control cluster */}
            <div className="absolute bottom-4 right-4 z-20 flex flex-col gap-1.5 bg-black/50 backdrop-blur-md border border-white/10 rounded-xl p-1.5 shadow-2xl">
              <ControlBtn
                onClick={() => setZoom((z) => Math.min(4, +(z + 0.4).toFixed(2)))}
                title="Zoom in"
              >
                <ZoomIn className="w-4 h-4" />
              </ControlBtn>
              <div className="text-[9px] text-white/50 text-center font-mono py-0.5">
                {zoom.toFixed(1)}×
              </div>
              <ControlBtn
                onClick={() => setZoom((z) => Math.max(1, +(z - 0.4).toFixed(2)))}
                title="Zoom out"
              >
                <ZoomOut className="w-4 h-4" />
              </ControlBtn>
              <div className="h-px bg-white/10 my-1" />
              <ControlBtn
                onClick={() => setAutoRotate((r) => !r)}
                title={autoRotate ? 'Pause rotation' : 'Resume rotation'}
                active={!autoRotate}
              >
                {autoRotate ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </ControlBtn>
              <ControlBtn onClick={resetView} title="Reset view">
                <RotateCcw className="w-4 h-4" />
              </ControlBtn>
            </div>

            {/* Selected station coordinate readout */}
            {selected && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute bottom-4 left-4 z-10 bg-black/60 backdrop-blur-md border border-indigo-400/40 rounded-xl px-4 py-2.5 shadow-2xl"
              >
                <div className="flex items-center gap-2">
                  <Locate className="w-3.5 h-3.5 text-indigo-300" />
                  <span className="text-[10px] font-semibold tracking-wider uppercase text-indigo-200">
                    Focused Station
                  </span>
                </div>
                <p className="text-sm font-bold text-white mt-0.5">{selected.name}</p>
                <p className="text-[10px] text-white/50 font-mono mt-0.5">
                  {selected.lat.toFixed(5)}° S, {selected.lng.toFixed(5)}° E
                </p>
                <p className="text-[10px] text-white/40 mt-0.5">{selected.zone}</p>
              </motion.div>
            )}

            {/* Hint bar */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 bg-black/40 backdrop-blur-sm border border-white/10 rounded-full px-4 py-1.5 hidden md:block">
              <span className="text-[10px] font-medium text-white/60">
                🖱️ Drag to rotate • Scroll wheel or buttons to zoom • Click a station to drill down
              </span>
            </div>
          </motion.div>

          {/* Sidebar */}
          <motion.aside
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="rounded-3xl border border-white/10 bg-slate-900/60 backdrop-blur-xl overflow-hidden flex flex-col"
            style={{ minHeight: 640 }}
          >
            <div className="p-4 border-b border-white/10 bg-gradient-to-br from-indigo-500/20 to-fuchsia-500/10">
              <div className="flex items-center gap-2">
                <Train className="w-4 h-4 text-indigo-300" />
                <h3 className="font-semibold text-white">T1 Western Line</h3>
              </div>
              <p className="text-xs text-white/50 mt-1">
                Sydney Central → Lithgow • NSW Trains
              </p>
              <p className="text-[10px] text-white/40 mt-2">
                👆 Click any station to fly in & inspect
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
          Station coordinates from Transport for NSW open data (GTFS) •
          Click "Inspect Network" or any station to drill down to street-level detail.
        </p>
      </main>

      {/* Street-level drill-down */}
      <AnimatePresence>
        {drilldownOpen && (
          <NetworkDrilldownMap
            lines={TRAIN_LINES}
            stations={ALL_STATIONS}
            checkpoints={MAINTENANCE_CHECKPOINTS}
            focusStation={drilldownStation}
            onClose={() => setDrilldownOpen(false)}
            onSelectStation={(s) => { setSelected(s); setDrilldownStation(s); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function ControlBtn({ children, onClick, title, active }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
        active
          ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/40'
          : 'text-white/70 hover:bg-white/10 hover:text-white'
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