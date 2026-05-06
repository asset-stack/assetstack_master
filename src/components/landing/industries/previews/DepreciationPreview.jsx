import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingDown, Calculator, Calendar } from 'lucide-react';

/**
 * Depreciation preview — book value schedule, method toggle,
 * and a per-asset list with replacement reserve indicators.
 */

const METHODS = ['Straight-line', 'Declining', 'Units of use'];

// 10-year depreciation schedule for a sample HVAC asset.
const BOOK_VALUE = [48200, 43380, 38560, 33740, 28920, 24100, 19280, 14460, 9640, 4820, 0];

const ASSETS = [
  { name: 'Library HVAC #2', acquired: '2020', cost: 48200, current: 24100, depleted: 50, life: '10 yr', reserve: 'on-track' },
  { name: 'Town Hall Generator', acquired: '2023', cost: 86400, current: 74304, depleted: 14, life: '15 yr', reserve: 'on-track' },
  { name: 'Stadium Floodlights', acquired: '2021', cost: 32100, current: 19260, depleted: 40, life: '8 yr', reserve: 'behind' },
  { name: 'Park Irrigation Pump', acquired: '2018', cost: 14800, current: 2960, depleted: 80, life: '10 yr', reserve: 'urgent' },
];

export default function DepreciationPreview() {
  const [method, setMethod] = useState('Straight-line');
  const totalCost = ASSETS.reduce((s, a) => s + a.cost, 0);
  const totalCurrent = ASSETS.reduce((s, a) => s + a.current, 0);
  const totalDepreciated = totalCost - totalCurrent;

  return (
    <div className="h-full w-full bg-white flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-2 px-5 py-3 border-b border-slate-100">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-fuchsia-500 to-rose-600 text-white flex items-center justify-center">
          <TrendingDown className="w-3.5 h-3.5" />
        </div>
        <div>
          <div className="text-[12px] font-semibold text-slate-900 leading-none">Depreciation Schedule</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Bunbury LGA · FY 2026</div>
        </div>
        <div className="ml-auto flex items-center gap-1">
          <Calculator className="w-3 h-3 text-slate-400" />
          {METHODS.map((m) => (
            <button
              key={m}
              onClick={() => setMethod(m)}
              className={`px-2 py-1 rounded-md text-[10px] font-semibold transition-colors ${
                method === m ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Top KPI strip */}
      <div className="grid grid-cols-3 gap-2 px-4 py-3 border-b border-slate-100">
        <KPI label="Acquisition cost" value={`$${(totalCost / 1000).toFixed(0)}k`} />
        <KPI label="Current book value" value={`$${(totalCurrent / 1000).toFixed(0)}k`} accent="emerald" />
        <KPI label="Depreciated to date" value={`$${(totalDepreciated / 1000).toFixed(0)}k`} accent="rose" />
      </div>

      {/* Chart */}
      <div className="px-4 py-3 border-b border-slate-100">
        <div className="flex items-center justify-between mb-2">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
              Library HVAC #2 · book value
            </div>
            <div className="text-[10px] text-slate-400 flex items-center gap-1">
              <Calendar className="w-2.5 h-2.5" /> 10-year schedule
            </div>
          </div>
          <span className="text-[10px] font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
            -$4.8k / yr
          </span>
        </div>
        <DepreciationChart points={BOOK_VALUE} />
      </div>

      {/* Asset list */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="px-4 py-2 border-b border-slate-100 flex items-center text-[9px] uppercase tracking-wider text-slate-500 font-semibold">
          <span className="flex-1">Asset</span>
          <span className="w-16 text-right">Cost</span>
          <span className="w-16 text-right">Current</span>
          <span className="w-24 text-right">Lifecycle</span>
        </div>
        {ASSETS.map((a, i) => (
          <motion.div
            key={a.name}
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06 }}
            className="px-4 py-2.5 border-b border-slate-100 flex items-center hover:bg-slate-50/60"
          >
            <div className="flex-1 min-w-0">
              <div className="text-[11px] font-semibold text-slate-900 truncate">{a.name}</div>
              <div className="text-[9px] text-slate-500">Acquired {a.acquired} · {a.life} life</div>
            </div>
            <div className="w-16 text-right text-[11px] tabular-nums text-slate-600">
              ${(a.cost / 1000).toFixed(1)}k
            </div>
            <div className="w-16 text-right text-[11px] tabular-nums font-semibold text-slate-900">
              ${(a.current / 1000).toFixed(1)}k
            </div>
            <div className="w-24 pl-2">
              <div className="flex items-center gap-1.5">
                <div className="flex-1 h-1 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      a.reserve === 'on-track' ? 'bg-emerald-500' :
                      a.reserve === 'behind' ? 'bg-amber-500' :
                      'bg-rose-500'
                    }`}
                    style={{ width: `${a.depleted}%` }}
                  />
                </div>
                <span className="text-[9px] tabular-nums text-slate-500 w-7 text-right">{a.depleted}%</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Footer reserve badge */}
      <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50/40 flex items-center gap-2">
        <span className="text-[10px] text-slate-500">Replacement reserve:</span>
        <span className="text-[10px] font-semibold bg-amber-50 text-amber-700 px-2 py-0.5 rounded">
          1 urgent · 1 behind
        </span>
        <span className="ml-auto text-[10px] text-slate-400">Method: {method}</span>
      </div>
    </div>
  );
}

function KPI({ label, value, accent }) {
  const color = accent === 'emerald' ? 'text-emerald-600' :
                accent === 'rose' ? 'text-rose-600' :
                'text-slate-900';
  return (
    <div className="bg-slate-50/60 rounded-lg border border-slate-100 px-2.5 py-1.5">
      <div className="text-[9px] uppercase tracking-wider text-slate-500 font-semibold">{label}</div>
      <div className={`text-[14px] font-semibold tabular-nums mt-0.5 ${color}`}>{value}</div>
    </div>
  );
}

function DepreciationChart({ points }) {
  const max = points[0];
  const w = 320;
  const h = 70;
  const stepX = w / (points.length - 1);
  const path = points
    .map((v, i) => `${i === 0 ? 'M' : 'L'} ${i * stepX} ${h - (v / max) * h}`)
    .join(' ');
  const area = `${path} L ${w} ${h} L 0 ${h} Z`;

  // Mark the "today" point at index 5 (year 5 of 10).
  const todayX = 5 * stepX;
  const todayY = h - (points[5] / max) * h;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" preserveAspectRatio="none" style={{ height: 70 }}>
      <defs>
        <linearGradient id="depr-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#f43f5e" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Today indicator */}
      <line x1={todayX} y1="0" x2={todayX} y2={h} stroke="#94a3b8" strokeWidth="0.8" strokeDasharray="2 2" opacity="0.6" />
      <text x={todayX + 3} y="9" fontSize="8" fill="#64748b" fontWeight="600">Today</text>

      <path d={area} fill="url(#depr-grad)" />
      <motion.path
        d={path}
        fill="none"
        stroke="#f43f5e"
        strokeWidth="1.5"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1, ease: 'easeOut' }}
      />
      <circle cx={todayX} cy={todayY} r="3" fill="#f43f5e" />
      <circle cx={todayX} cy={todayY} r="6" fill="#f43f5e" opacity="0.2" />
    </svg>
  );
}