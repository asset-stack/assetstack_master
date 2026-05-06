import React from 'react';
import { motion } from 'framer-motion';
import { LayoutDashboard, TrendingUp, TrendingDown, Activity, AlertTriangle, Wrench } from 'lucide-react';

/**
 * Dashboard preview — top-level KPIs, fleet health trend, risk heatmap,
 * and recent alerts. Pure visual demo with sample data.
 */

const HEALTH_TREND = [82, 81, 83, 84, 82, 85, 84, 86, 85, 87, 86, 88, 87, 89];
const HEATMAP = [
  // 7 days x 6 categories — values 0-3 (0 ok, 3 critical)
  [0, 0, 1, 0, 0, 2, 0],
  [0, 1, 0, 0, 0, 0, 0],
  [1, 0, 2, 1, 0, 0, 0],
  [0, 0, 0, 0, 1, 0, 0],
  [0, 0, 0, 3, 1, 0, 0],
  [0, 1, 0, 0, 0, 0, 1],
];
const HEAT_LABELS = ['HVAC', 'Lifts', 'Pumps', 'Lighting', 'Safety', 'Plumbing'];

export default function DashboardPreview() {
  return (
    <div className="h-full w-full bg-slate-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-2 px-5 py-3 border-b border-slate-200 bg-white">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600 text-white flex items-center justify-center">
          <LayoutDashboard className="w-3.5 h-3.5" />
        </div>
        <div>
          <div className="text-[12px] font-semibold text-slate-900 leading-none">Operations Dashboard</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Bunbury LGA · 156 assets</div>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] text-slate-500 font-medium">Live · 14:32</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
        {/* KPI row */}
        <div className="grid grid-cols-4 gap-2">
          <KpiCard label="Fleet health" value="89%" delta="+3%" trend="up" accent="emerald" />
          <KpiCard label="Open WOs" value="24" delta="-12%" trend="down" accent="indigo" />
          <KpiCard label="Critical" value="12" delta="-2" trend="down" accent="rose" />
          <KpiCard label="Saved YTD" value="$184k" delta="+18%" trend="up" accent="sky" />
        </div>

        {/* Trend + Heatmap */}
        <div className="grid grid-cols-5 gap-2">
          <div className="col-span-3 bg-white rounded-lg border border-slate-200 p-3">
            <div className="flex items-center justify-between mb-2">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Fleet health</div>
                <div className="text-[11px] text-slate-400">Last 14 days</div>
              </div>
              <div className="text-right">
                <div className="text-[15px] font-semibold text-slate-900 tabular-nums">89.2%</div>
                <div className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5 justify-end">
                  <TrendingUp className="w-2.5 h-2.5" /> +3.1%
                </div>
              </div>
            </div>
            <div className="h-[64px]">
              <FleetHealthChart points={HEALTH_TREND} />
            </div>
          </div>

          <div className="col-span-2 bg-white rounded-lg border border-slate-200 p-3">
            <div className="flex items-center justify-between mb-2">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Risk heatmap</div>
                <div className="text-[11px] text-slate-400">7 days × asset class</div>
              </div>
            </div>
            <Heatmap data={HEATMAP} labels={HEAT_LABELS} />
          </div>
        </div>

        {/* Alerts */}
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <div className="px-3 py-2 border-b border-slate-100 flex items-center gap-2">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-[11px] font-semibold text-slate-900">Recent alerts</span>
            <span className="ml-auto text-[10px] text-slate-400">3 new</span>
          </div>
          <div className="divide-y divide-slate-100">
            {[
              { asset: 'Library HVAC #2', detail: 'Vibration anomaly · 4σ', sev: 'high', time: '2m ago' },
              { asset: 'Town Hall lift', detail: 'Service due in 4d', sev: 'med', time: '1h ago' },
              { asset: 'Park irrigation pump', detail: 'Pressure drop', sev: 'high', time: '3h ago' },
            ].map((a, i) => (
              <motion.div
                key={a.asset}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.07 }}
                className="flex items-center gap-2 px-3 py-2 hover:bg-slate-50/60"
              >
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                  a.sev === 'high' ? 'bg-rose-500' : 'bg-amber-500'
                }`} />
                <Wrench className="w-3 h-3 text-slate-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] font-semibold text-slate-900 truncate">{a.asset}</div>
                  <div className="text-[10px] text-slate-500 truncate">{a.detail}</div>
                </div>
                <span className="text-[9px] text-slate-400 tabular-nums shrink-0">{a.time}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function KpiCard({ label, value, delta, trend, accent }) {
  const accentDot = {
    emerald: 'bg-emerald-500',
    indigo: 'bg-indigo-500',
    rose: 'bg-rose-500',
    sky: 'bg-sky-500',
  }[accent];
  const TrendIcon = trend === 'up' ? TrendingUp : TrendingDown;
  const trendGood = (trend === 'up' && (accent === 'emerald' || accent === 'sky')) ||
                    (trend === 'down' && (accent === 'rose' || accent === 'indigo'));
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-2.5">
      <div className="flex items-center gap-1.5">
        <span className={`w-1.5 h-1.5 rounded-full ${accentDot}`} />
        <span className="text-[9px] uppercase tracking-wider text-slate-500 font-semibold truncate">{label}</span>
      </div>
      <div className="flex items-end justify-between mt-1">
        <span className="text-[18px] font-semibold text-slate-900 tabular-nums leading-none">{value}</span>
        <span className={`flex items-center gap-0.5 text-[10px] font-semibold ${
          trendGood ? 'text-emerald-600' : 'text-rose-600'
        }`}>
          <TrendIcon className="w-2.5 h-2.5" /> {delta}
        </span>
      </div>
    </div>
  );
}

function FleetHealthChart({ points }) {
  const max = Math.max(...points) + 2;
  const min = Math.min(...points) - 2;
  const range = max - min;
  const w = 320;
  const h = 64;
  const stepX = w / (points.length - 1);
  const path = points.map((v, i) => `${i === 0 ? 'M' : 'L'} ${i * stepX} ${h - ((v - min) / range) * h}`).join(' ');
  const area = `${path} L ${w} ${h} L 0 ${h} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id="dash-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#dash-grad)" />
      <motion.path
        d={path}
        fill="none"
        stroke="#10b981"
        strokeWidth="1.5"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1, ease: 'easeOut' }}
      />
      <circle cx={(points.length - 1) * stepX} cy={h - ((points[points.length - 1] - min) / range) * h} r="2.5" fill="#10b981" />
    </svg>
  );
}

function Heatmap({ data, labels }) {
  const cellColors = ['bg-emerald-100', 'bg-amber-200', 'bg-orange-300', 'bg-rose-500'];
  return (
    <div className="space-y-1">
      {data.map((row, ri) => (
        <div key={ri} className="flex items-center gap-1">
          <span className="text-[9px] text-slate-500 font-medium w-12 truncate">{labels[ri]}</span>
          <div className="flex gap-0.5 flex-1">
            {row.map((v, ci) => (
              <motion.div
                key={ci}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.05 * (ri + ci), duration: 0.3 }}
                className={`flex-1 aspect-square rounded-sm ${cellColors[v]}`}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}