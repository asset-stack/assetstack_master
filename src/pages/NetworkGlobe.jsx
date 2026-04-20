import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Globe2, Train, Sparkles, Activity, AlertTriangle, CheckCircle2, Radio } from 'lucide-react';
import NetworkGlobe from '@/components/network-globe/NetworkGlobe';
import StationList from '@/components/network-globe/StationList';
import { WESTERN_LINE_STATIONS, NSW_FOCUS } from '@/components/network-globe/westernLineData';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function NetworkGlobePage() {
  const [hovered, setHovered] = useState(null);
  const [showDemo, setShowDemo] = useState(true);

  const markers = useMemo(() => (showDemo ? WESTERN_LINE_STATIONS : []), [showDemo]);

  const stats = useMemo(() => ({
    total: markers.length,
    operational: markers.filter((s) => s.condition === 'operational').length,
    degraded: markers.filter((s) => s.condition === 'degraded').length,
    critical: markers.filter((s) => s.condition === 'critical').length,
  }), [markers]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white">
      {/* Animated grid background */}
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
                  Geospatial asset visualization • WebGL-powered
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
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
              {showDemo ? 'Demo: NSW T1 Western Line' : 'Load NSW Demo'}
            </Button>
          </div>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <StatCard icon={Radio} label="Stations" value={stats.total} color="indigo" />
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
            {/* Corner frame decorations */}
            <FrameCorner pos="top-left" />
            <FrameCorner pos="top-right" />
            <FrameCorner pos="bottom-left" />
            <FrameCorner pos="bottom-right" />

            {/* Scan line */}
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

            {/* Region chip */}
            <div className="absolute top-4 right-4 z-10 bg-black/40 backdrop-blur-sm border border-white/10 rounded-full px-3 py-1.5">
              <span className="text-[10px] font-semibold tracking-wider uppercase text-white/80">
                NSW, Australia • 33°S 150°E
              </span>
            </div>

            {/* Globe canvas */}
            <div className="w-full flex items-center justify-center" style={{ height: 640 }}>
              <NetworkGlobe
                markers={markers}
                focus={NSW_FOCUS}
                onMarkerHover={setHovered}
                theme="dark"
                autoRotate
              />
            </div>

            {/* Hint */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 bg-black/40 backdrop-blur-sm border border-white/10 rounded-full px-4 py-1.5">
              <span className="text-[10px] font-medium text-white/60">
                🖱️ Drag to rotate • Hover stations for details
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
            </div>
            <StationList
              stations={markers}
              hoveredName={hovered?.name}
              onSelect={() => {}}
            />
          </motion.aside>
        </div>

        {/* Footer caption */}
        <p className="text-center text-[11px] text-white/30 mt-4">
          Station coordinates sourced from Transport for NSW open data (GTFS).
          Any geotagged asset can be plotted — rail, power, water, buildings or sensors.
        </p>
      </main>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  const colors = {
    indigo: 'from-indigo-500/20 to-indigo-500/5 border-indigo-400/30 text-indigo-300',
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