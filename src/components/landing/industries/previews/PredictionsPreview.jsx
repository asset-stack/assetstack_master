import React from 'react';
import { motion } from 'framer-motion';
import { Brain, AlertTriangle, TrendingDown, Activity, Cpu } from 'lucide-react';

/**
 * Predictions preview — failure probability gauge, RUL curve,
 * and live ML model accuracy strip.
 */

// Health curve over 90 days, descending — projected failure point at day 78.
const HEALTH = [94, 93, 91, 89, 88, 87, 85, 83, 80, 78, 76, 73, 69, 65, 60, 54, 47, 39, 30];

const SIGNALS = [
  { name: 'Vibration', val: '4.2 mm/s', drift: '+18%', state: 'warn' },
  { name: 'Temp delta', val: '+11°C', drift: '+22%', state: 'warn' },
  { name: 'Current draw', val: '21.4 A', drift: '+6%', state: 'ok' },
];

export default function PredictionsPreview() {
  return (
    <div className="h-full w-full bg-white flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-2 px-5 py-3 border-b border-slate-100">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 text-white flex items-center justify-center">
          <Brain className="w-3.5 h-3.5" />
        </div>
        <div className="min-w-0">
          <div className="text-[12px] font-semibold text-slate-900 leading-none truncate">
            Library HVAC #2 — failure forecast
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1">
            <Cpu className="w-2.5 h-2.5" /> ensemble_v2.4 · 91% accuracy
          </div>
        </div>
        <span className="ml-auto text-[9px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded">
          High risk
        </span>
      </div>

      {/* Top KPIs */}
      <div className="grid grid-cols-3 gap-2 px-4 py-3 border-b border-slate-100">
        <RiskGauge />
        <KPI label="RUL" value="42 days" sub="remaining useful life" accent="amber" icon={Activity} />
        <KPI label="Confidence" value="87%" sub="model · last trained 2d ago" accent="indigo" icon={Brain} />
      </div>

      {/* Health curve */}
      <div className="px-4 py-3 border-b border-slate-100">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
            Health trajectory · 90 days
          </span>
          <span className="text-[9px] flex items-center gap-1 text-rose-600 font-semibold">
            <TrendingDown className="w-2.5 h-2.5" /> -64 pts
          </span>
        </div>
        <RULChart points={HEALTH} />
        <div className="flex items-center justify-between text-[9px] text-slate-500 mt-1">
          <span>Today</span>
          <span className="text-rose-600 font-semibold">Failure projected · day 78</span>
        </div>
      </div>

      {/* Signals */}
      <div className="px-4 py-3 flex-1">
        <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
          Top contributing signals
        </span>
        <div className="space-y-1.5 mt-2">
          {SIGNALS.map((s, i) => (
            <motion.div
              key={s.name}
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-slate-50/60 border border-slate-100"
            >
              <span className="text-[10px] font-semibold text-slate-700 flex-1">{s.name}</span>
              <span className="text-[10px] tabular-nums text-slate-900">{s.val}</span>
              <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded tabular-nums ${
                s.state === 'warn' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
              }`}>
                {s.drift}
              </span>
            </motion.div>
          ))}
        </div>

        <div className="mt-3 flex items-center gap-1.5 text-[10px] bg-indigo-50/60 border border-indigo-100 rounded-md px-2.5 py-2">
          <AlertTriangle className="w-3 h-3 text-indigo-600 shrink-0" />
          <span className="text-indigo-900">
            <span className="font-semibold">Recommended:</span> schedule compressor service before day 38 to avoid breakdown.
          </span>
        </div>
      </div>
    </div>
  );
}

function RiskGauge() {
  const value = 78; // failure probability %
  const r = 26;
  const c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c;

  return (
    <div className="bg-rose-50/40 rounded-lg border border-rose-100 px-2.5 py-1.5 flex items-center gap-2">
      <svg width="58" height="58" viewBox="0 0 60 60" className="shrink-0">
        <circle cx="30" cy="30" r={r} fill="none" stroke="#fecdd3" strokeWidth="4" />
        <motion.circle
          cx="30" cy="30" r={r}
          fill="none"
          stroke="#f43f5e"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          transform="rotate(-90 30 30)"
        />
        <text x="30" y="35" textAnchor="middle" fontSize="14" fontWeight="700" fill="#0f172a">
          {value}%
        </text>
      </svg>
      <div className="min-w-0">
        <div className="text-[9px] uppercase tracking-wider text-slate-500 font-semibold">Failure</div>
        <div className="text-[9px] uppercase tracking-wider text-slate-500 font-semibold">probability</div>
        <div className="text-[9px] text-slate-500 mt-0.5">next 60d</div>
      </div>
    </div>
  );
}

function KPI({ label, value, sub, accent, icon: Icon }) {
  const color = accent === 'amber' ? 'text-amber-600' : accent === 'indigo' ? 'text-indigo-600' : 'text-slate-900';
  return (
    <div className="bg-slate-50/60 rounded-lg border border-slate-100 px-2.5 py-1.5">
      <div className="flex items-center gap-1 text-[9px] uppercase tracking-wider text-slate-500 font-semibold">
        <Icon className="w-2.5 h-2.5" /> {label}
      </div>
      <div className={`text-[14px] font-semibold tabular-nums mt-0.5 ${color}`}>{value}</div>
      <div className="text-[9px] text-slate-500 truncate">{sub}</div>
    </div>
  );
}

function RULChart({ points }) {
  const w = 320;
  const h = 60;
  const max = 100;
  const stepX = w / (points.length - 1);
  const path = points.map((v, i) => `${i === 0 ? 'M' : 'L'} ${i * stepX} ${h - (v / max) * h}`).join(' ');
  const area = `${path} L ${w} ${h} L 0 ${h} Z`;

  // Failure threshold line at 30%
  const thresholdY = h - (30 / max) * h;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" preserveAspectRatio="none" style={{ height: 60 }}>
      <defs>
        <linearGradient id="rul-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#a855f7" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Threshold */}
      <line x1="0" y1={thresholdY} x2={w} y2={thresholdY} stroke="#f43f5e" strokeWidth="0.7" strokeDasharray="3 3" opacity="0.6" />
      <text x={w - 4} y={thresholdY - 2} fontSize="7" fill="#f43f5e" textAnchor="end" fontWeight="600">Failure threshold</text>

      <path d={area} fill="url(#rul-grad)" />
      <motion.path
        d={path}
        fill="none"
        stroke="#a855f7"
        strokeWidth="1.5"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
      />
      {/* Endpoint */}
      <circle cx={(points.length - 1) * stepX} cy={h - (points[points.length - 1] / max) * h} r="3" fill="#a855f7" />
    </svg>
  );
}