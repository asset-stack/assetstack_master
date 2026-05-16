import React from 'react';
import { motion } from 'framer-motion';
import {
  Activity, AlertTriangle, CheckCircle2, ChevronRight, Cpu, MapPin, Sparkles, TrendingUp, Wrench,
} from 'lucide-react';

// AssetMind chat panel (dark)
export function AssetMindChat() {
  return (
    <div className="w-full h-full rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden flex flex-col shadow-2xl">
      <div className="h-9 bg-slate-800/80 border-b border-slate-800 flex items-center px-3 gap-1.5">
        <div className="w-2.5 h-2.5 rounded-full bg-rose-400" />
        <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
        <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
        <div className="flex-1 text-center text-[10px] font-semibold text-slate-400">
          AssetMind · Live conversation
        </div>
      </div>
      <div className="flex-1 p-4 space-y-3 overflow-y-auto">
        <div className="flex justify-end">
          <div className="bg-indigo-600 text-white text-xs rounded-2xl rounded-tr-sm px-3 py-2 max-w-[85%]">
            Find every pump with health &lt;60, schedule urgent inspections next week, and assign to senior techs.
          </div>
        </div>
        <div className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider">▸ Planning…</div>
        {[
          ['Equipment.filter', '{type:"pump", health<60}', '✓ 7'],
          ['Technician.filter', '{cert:"senior", available}', '✓ 3'],
          ['WorkOrder.create', '×7 records', '✓ 7'],
          ['sendNotificationEmail', '→ assigned techs', '✓ 7'],
        ].map(([fn, args, n], i) => (
          <motion.div
            key={fn}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 + i * 0.15 }}
            className="bg-slate-800/60 border border-slate-800 rounded-lg p-2.5 flex items-center gap-2.5"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <div className="flex-1 min-w-0">
              <div className="text-[11px] font-bold text-white truncate">{fn}</div>
              <div className="text-[9px] text-slate-400 font-mono truncate">{args}</div>
            </div>
            <div className="text-[10px] font-bold text-emerald-400">{n}</div>
          </motion.div>
        ))}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="bg-slate-800/40 border border-slate-700 rounded-2xl rounded-tl-sm p-3"
        >
          <div className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider mb-1">AssetMind</div>
          <div className="text-xs text-slate-200 leading-relaxed">
            Done. 7 work orders created, assigned to 3 senior techs (Mia, Jordan, Sam), scheduled May 20–22.
            Notifications sent. Want me to draft the toolbox talk and pre-order bearings?
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// Dashboard mockup (light)
export function DashboardMock() {
  const heights = [25, 30, 40, 35, 50, 45, 55, 60, 65, 60, 75, 80, 70, 85, 90, 95];
  return (
    <div className="w-full h-full rounded-2xl bg-white border border-slate-200 overflow-hidden flex shadow-xl">
      <div className="w-12 bg-slate-900 flex flex-col items-center py-4 gap-4">
        <div className="w-2 h-2 rounded-full bg-indigo-400" />
        {[...Array(5)].map((_, i) => (
          <div key={i} className="w-2 h-2 rounded-full bg-slate-700" />
        ))}
      </div>
      <div className="flex-1 flex flex-col">
        <div className="h-10 bg-slate-50 border-b border-slate-100 flex items-center px-4">
          <span className="text-xs font-bold text-slate-900">Command Center</span>
        </div>
        <div className="grid grid-cols-4 gap-2 p-3">
          {[
            ['Assets', '1,247', 'text-indigo-600'],
            ['At risk', '38', 'text-rose-600'],
            ['Open WOs', '142', 'text-amber-600'],
            ['Health', '87%', 'text-emerald-600'],
          ].map(([l, v, c]) => (
            <div key={l} className="border border-slate-200 rounded-lg p-2">
              <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wide">{l}</div>
              <div className={`text-lg font-bold ${c}`}>{v}</div>
            </div>
          ))}
        </div>
        <div className="flex-1 mx-3 mb-3 border border-slate-200 rounded-lg p-3 flex flex-col">
          <div className="text-[10px] font-bold text-slate-900 mb-3">Portfolio health · last 30 days</div>
          <div className="flex-1 flex items-end gap-1">
            {heights.map((h, i) => (
              <motion.div
                key={i}
                initial={{ height: 0 }}
                animate={{ height: `${h}%` }}
                transition={{ delay: i * 0.03, duration: 0.5 }}
                className={`flex-1 rounded-t ${i > 12 ? 'bg-indigo-500' : 'bg-indigo-200'}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Risk list
export function RiskList() {
  const rows = [
    ['Pump-03 · Lift Station 4', 92, 'bg-rose-500', 'text-rose-600', '3d'],
    ['HVAC-12 · Town Hall L2', 81, 'bg-rose-500', 'text-rose-600', '6d'],
    ['Generator-A · Depot', 67, 'bg-amber-500', 'text-amber-600', '14d'],
    ['Lift-07 · Library', 54, 'bg-amber-500', 'text-amber-600', '21d'],
    ['Motor-21 · Treatment', 38, 'bg-emerald-500', 'text-emerald-600', '45d'],
  ];
  return (
    <div className="w-full h-full bg-slate-50 border border-slate-200 rounded-2xl p-5 shadow-sm">
      <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-4">
        Top risk · next 30 days
      </div>
      <div className="space-y-4">
        {rows.map(([n, p, bar, txt, eta], i) => (
          <motion.div
            key={n}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="text-sm font-bold text-slate-900">{n}</div>
              <div className={`text-sm font-bold ${txt}`}>{p}%</div>
            </div>
            <div className="text-[10px] text-slate-500 mb-1.5">ETA {eta}</div>
            <div className="h-1.5 rounded-full bg-slate-200 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${p}%` }}
                transition={{ delay: i * 0.08 + 0.2, duration: 0.6 }}
                className={`h-full ${bar}`}
              />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// Mobile WO
export function MobileWO() {
  const cks = [
    ['Isolate power', true],
    ['Inspect bearings', true],
    ['Photograph (4)', true],
    ['Vibration reading', false],
    ['Sign off', false],
  ];
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-[240px] bg-slate-900 rounded-[28px] p-2 shadow-2xl">
        <div className="bg-white rounded-[20px] overflow-hidden">
          <div className="h-6 bg-slate-900 flex items-center justify-center">
            <div className="w-14 h-3 bg-slate-900 rounded-full" />
          </div>
          <div className="p-4">
            <div className="text-xs font-bold text-slate-900">WO-20260516-1247</div>
            <div className="text-[10px] text-slate-500 mb-2">Pump-03 · Lift Station 4</div>
            <div className="flex gap-1 mb-3">
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-500 text-white">URGENT</span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-indigo-500 text-white">PRED-AI</span>
            </div>
            <div className="space-y-2 mb-3">
              {cks.map(([t, done], i) => (
                <div key={t} className="flex items-center gap-2">
                  {done ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <div className="w-3.5 h-3.5 rounded-full border border-slate-300" />
                  )}
                  <span className={`text-[11px] ${done ? 'text-slate-400 line-through' : 'font-bold text-slate-900'}`}>
                    {t}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex gap-1 mb-3">
              {['bg-slate-300', 'bg-slate-400', 'bg-slate-500'].map((c, i) => (
                <div key={i} className={`w-8 h-8 rounded ${c}`} />
              ))}
            </div>
            <button className="w-full bg-indigo-600 text-white text-[11px] font-bold py-2 rounded-lg">
              Complete &amp; sync
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Globe
export function GlobeMock() {
  return (
    <div className="w-full h-full rounded-2xl bg-slate-950 relative overflow-hidden shadow-xl">
      <div className="absolute top-4 left-4 z-10">
        <div className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider">Live portfolio map</div>
        <div className="text-[10px] text-slate-400">38 sites · 1,247 assets</div>
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
          className="w-[70%] aspect-square rounded-full border border-indigo-700/50 relative"
        >
          <div className="absolute inset-[15%] rounded-full border border-indigo-800/40" />
          <div className="absolute inset-[30%] rounded-full border border-indigo-800/30" />
          <div className="absolute inset-0 rounded-full border border-indigo-800/40" style={{ transform: 'rotateX(70deg)' }} />
          <div className="absolute inset-0 rounded-full border border-indigo-800/40" style={{ transform: 'rotateX(35deg)' }} />
          {[
            ['top-[20%] left-[30%]', 'bg-emerald-400'],
            ['top-[30%] right-[25%]', 'bg-amber-400'],
            ['top-[55%] right-[20%]', 'bg-indigo-400'],
            ['top-[65%] left-[20%]', 'bg-rose-400'],
            ['top-[45%] left-[45%]', 'bg-indigo-400'],
          ].map(([pos, color], i) => (
            <motion.div
              key={i}
              className={`absolute ${pos} w-2 h-2 rounded-full ${color}`}
              animate={{ scale: [1, 1.5, 1], opacity: [1, 0.6, 1] }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
            >
              <div className={`absolute inset-0 rounded-full ${color} animate-ping opacity-50`} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

// Asset tree
export function AssetTree() {
  const nodes = [
    [0, 'Bunbury Council', '1,247', 'bg-emerald-500'],
    [1, 'Town Hall', '184', 'bg-emerald-500'],
    [2, 'HVAC Floor 2', '12', 'bg-amber-500'],
    [2, 'Lifts (3)', '3', 'bg-emerald-500'],
    [1, 'Water Treatment', '412', 'bg-rose-500'],
    [2, 'Pump Station 4', '38', 'bg-rose-500'],
    [2, 'Filter Bank A', '24', 'bg-emerald-500'],
    [1, 'Depot', '89', 'bg-emerald-500'],
  ];
  return (
    <div className="w-full h-full bg-white border border-slate-200 rounded-2xl p-5 shadow-sm overflow-hidden">
      <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-4">
        Asset hierarchy
      </div>
      <div className="space-y-2.5">
        {nodes.map(([lvl, name, count, dot], i) => (
          <motion.div
            key={name}
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center gap-2"
            style={{ paddingLeft: `${lvl * 16}px` }}
          >
            <div className={`w-1.5 h-1.5 rounded-full ${dot}`} />
            <span className={`text-xs ${lvl === 0 ? 'font-bold text-slate-900' : 'text-slate-700'}`}>
              {name}
            </span>
            <span className="ml-auto text-[10px] font-bold text-slate-400 tabular-nums">{count}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// Scenario sliders
export function ScenarioMock() {
  const sliders = [
    ['Annual budget', '$3.2M', 70, 'bg-indigo-500'],
    ['Inflation', '4.5%', 45, 'bg-amber-500'],
    ['Deferral rate', '12%', 25, 'bg-emerald-500'],
    ['Climate stress', '125%', 60, 'bg-rose-500'],
  ];
  return (
    <div className="w-full h-full bg-slate-50 border border-slate-200 rounded-2xl p-5 shadow-sm">
      <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Scenario modeller</div>
      <div className="text-base font-bold text-slate-900 mb-4">A 10-year future in 10 seconds</div>
      <div className="space-y-4 mb-4">
        {sliders.map(([lbl, val, pct, col], i) => (
          <div key={lbl}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-slate-600">{lbl}</span>
              <span className="text-xs font-bold text-slate-900">{val}</span>
            </div>
            <div className="relative h-1.5 bg-slate-200 rounded-full">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ delay: i * 0.1 + 0.2, duration: 0.6 }}
                className={`absolute inset-y-0 left-0 rounded-full ${col}`}
              />
              <motion.div
                initial={{ left: 0 }}
                animate={{ left: `${pct}%` }}
                transition={{ delay: i * 0.1 + 0.2, duration: 0.6 }}
                className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-white border-2 ${col.replace(
                  'bg-',
                  'border-'
                )} shadow`}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="bg-slate-900 rounded-lg p-3 flex items-center justify-between">
        <div>
          <div className="text-[9px] font-bold text-indigo-300 uppercase tracking-wider">Projected Y10 backlog</div>
          <div className="text-2xl font-bold text-emerald-400">$12.4M</div>
        </div>
        <div className="text-[10px] text-slate-400">vs $48M do-nothing</div>
      </div>
    </div>
  );
}

// Savings ledger
export function SavingsLedger() {
  const entries = [
    ['Bearing replacement · Pump-03', '$48,200', true],
    ['Deferred renewal · HVAC-12', '$112,000', true],
    ['Cascade prevented · Filter Bank A', '$67,500', true],
    ['Predictive WO · Lift-07', '$24,800', false],
    ['Sensor anomaly · Motor-21', '$18,400', true],
  ];
  return (
    <div className="w-full h-full bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col">
      <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-3">
        Verified savings ledger
      </div>
      <div className="flex-1 space-y-3">
        {entries.map(([n, amt, ver], i) => (
          <motion.div
            key={n}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="border-b border-slate-100 pb-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900">{n}</span>
              <span className={`text-sm font-bold ${ver ? 'text-emerald-600' : 'text-amber-600'}`}>{amt}</span>
            </div>
            <div className={`text-[10px] font-bold ${ver ? 'text-emerald-600' : 'text-amber-600'}`}>
              {ver ? '✓ verified' : '⏱ in review'}
            </div>
          </motion.div>
        ))}
      </div>
      <div className="bg-slate-900 rounded-lg p-3 flex items-center justify-between mt-3">
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">YTD verified</div>
        <div className="text-xl font-bold text-emerald-400">$1.42M</div>
      </div>
    </div>
  );
}

// Backlog chart
export function BacklogChart() {
  const lines = [
    { color: '#f43f5e', p: [8, 12, 18, 26, 36, 47, 60, 76], label: 'Do nothing' },
    { color: '#f59e0b', p: [8, 11, 15, 20, 25, 30, 34, 38], label: 'Status quo' },
    { color: '#10b981', p: [8, 9, 10, 11, 12, 11, 10, 8], label: 'With AssetStack' },
  ];
  const maxP = 80;
  const w = 100, h = 60;
  return (
    <div className="w-full h-full bg-slate-50 border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col">
      <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-3">
        Projected renewal backlog ($M)
      </div>
      <div className="flex-1 relative">
        <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="w-full h-full">
          {lines.map((ln) => {
            const stepX = w / (ln.p.length - 1);
            const points = ln.p.map((v, i) => `${i * stepX},${h - (v / maxP) * h}`).join(' ');
            return (
              <motion.polyline
                key={ln.label}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.2 }}
                points={points}
                fill="none"
                stroke={ln.color}
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            );
          })}
        </svg>
      </div>
      <div className="flex items-center gap-4 mt-3">
        {lines.map((ln) => (
          <div key={ln.label} className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ background: ln.color }} />
            <span className="text-[10px] font-bold text-slate-700">{ln.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}