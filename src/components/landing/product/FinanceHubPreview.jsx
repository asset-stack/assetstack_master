import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Banknote, Target, Sliders, TrendingUp, CheckCircle2 } from 'lucide-react';

/**
 * Finance Hub + Funding Optimiser preview — shows the budget breakdown
 * and the optimiser allocating funding across asset classes to maximise
 * risk reduction.
 */

const ALLOCATIONS = [
  { label: 'Buildings',    pct: 38, color: '#6366f1' },
  { label: 'Roads',        pct: 24, color: '#0ea5e9' },
  { label: 'Water assets', pct: 18, color: '#10b981' },
  { label: 'Plant/Fleet',  pct: 12, color: '#f59e0b' },
  { label: 'Other',        pct: 8,  color: '#94a3b8' },
];

const SCENARIOS = [
  { name: 'Current plan',     spend: '$14.2M', risk: 68, roi: '1.0×' },
  { name: 'Optimised plan',   spend: '$14.2M', risk: 32, roi: '2.4×', highlight: true },
  { name: 'Constrained -20%', spend: '$11.4M', risk: 51, roi: '1.6×' },
];

export default function FinanceHubPreview() {
  const [optimised, setOptimised] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setOptimised((v) => !v), 3000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="h-full w-full bg-white flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center">
          <Banknote className="w-3.5 h-3.5" />
        </div>
        <div>
          <div className="text-[12px] font-semibold text-slate-900 leading-none">Finance Hub</div>
          <div className="text-[10px] text-slate-500 mt-0.5">FY26 capital plan · $14.2M</div>
        </div>
        <div className="ml-auto flex items-center gap-1 text-[9px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-semibold">
          <Sliders className="w-2.5 h-2.5" />
          Optimiser {optimised ? 'on' : 'off'}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 p-3 flex-1 min-h-0">
        {/* Left: Allocation stacked bar */}
        <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-3 flex flex-col">
          <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-2">Allocation by class</div>

          {/* Stacked horizontal bar */}
          <div className="flex h-3 rounded-full overflow-hidden bg-slate-100">
            {ALLOCATIONS.map((a) => (
              <motion.div
                key={a.label}
                initial={{ width: 0 }}
                animate={{ width: `${a.pct}%` }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                style={{ background: a.color }}
              />
            ))}
          </div>

          {/* Legend */}
          <div className="space-y-1 mt-3 flex-1">
            {ALLOCATIONS.map((a, i) => (
              <motion.div
                key={a.label}
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                className="flex items-center gap-2 text-[10px]"
              >
                <span className="w-2 h-2 rounded-sm shrink-0" style={{ background: a.color }} />
                <span className="text-slate-700 flex-1 truncate">{a.label}</span>
                <span className="font-semibold text-slate-900 tabular-nums">{a.pct}%</span>
              </motion.div>
            ))}
          </div>

          <div className="mt-2 pt-2 border-t border-slate-200/70 flex items-center justify-between text-[10px]">
            <span className="text-slate-500">Total committed</span>
            <span className="font-bold text-slate-900 tabular-nums">$14.2M</span>
          </div>
        </div>

        {/* Right: Funding optimiser */}
        <div className="rounded-lg border border-slate-200 bg-white p-3 flex flex-col">
          <div className="flex items-center gap-1.5 mb-2">
            <Target className="w-3 h-3 text-indigo-600" />
            <span className="text-[10px] uppercase tracking-wider text-indigo-700 font-semibold">Funding optimiser</span>
          </div>

          <div className="space-y-1.5 flex-1">
            {SCENARIOS.map((s, i) => {
              const isActive = optimised && s.highlight;
              return (
                <motion.div
                  key={s.name}
                  animate={{
                    background: isActive ? '#ecfdf5' : '#f8fafc',
                    borderColor: isActive ? '#6ee7b7' : '#e2e8f0',
                  }}
                  className="rounded-md border p-2"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-[10px] font-semibold ${isActive ? 'text-emerald-800' : 'text-slate-700'}`}>
                      {s.name}
                    </span>
                    <AnimatePresence>
                      {isActive && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          className="text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-600 text-white flex items-center gap-0.5"
                        >
                          <CheckCircle2 className="w-2 h-2" /> Recommended
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    <Metric label="Spend" value={s.spend} />
                    <Metric label="Risk" value={s.risk} suffix=" /100" risk />
                    <Metric label="ROI" value={s.roi} positive />
                  </div>
                </motion.div>
              );
            })}
          </div>

          <AnimatePresence>
            {optimised && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-2 flex items-center gap-1.5 text-[10px] font-semibold text-emerald-700 bg-emerald-50 rounded-md px-2 py-1.5"
              >
                <TrendingUp className="w-3 h-3" />
                36 pts less risk for the same budget
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value, suffix = '', positive, risk }) {
  const color = positive ? 'text-emerald-700' : risk ? 'text-slate-900' : 'text-slate-900';
  return (
    <div>
      <div className="text-[8px] uppercase tracking-wider text-slate-500 font-semibold">{label}</div>
      <div className={`text-[11px] font-bold tabular-nums ${color}`}>
        {value}{suffix}
      </div>
    </div>
  );
}