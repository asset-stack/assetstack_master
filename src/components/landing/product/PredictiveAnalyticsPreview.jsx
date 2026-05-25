import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, AlertTriangle, Wrench, Sparkles, TrendingDown } from 'lucide-react';

/**
 * Predictive Analytics preview — shows the AI analysing equipment health,
 * predicting failure, and generating a work order automatically.
 */

const ASSETS = [
  { name: 'Pump P-204',          health: 38, rul: 12, prob: 78, action: 'Replace seal kit'    },
  { name: 'Motor M-118',         health: 62, rul: 41, prob: 34, action: 'Inspect bearings'    },
  { name: 'HVAC Compressor #2',  health: 22, rul: 5,  prob: 91, action: 'Replace compressor' },
];

export default function PredictiveAnalyticsPreview() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [phase, setPhase] = useState(0); // 0=analysing, 1=predicted, 2=wo_generated

  useEffect(() => {
    const seq = [
      { phase: 0, delay: 0 },
      { phase: 1, delay: 1200 },
      { phase: 2, delay: 2400 },
    ];
    const timers = seq.map(({ phase: p, delay }) =>
      setTimeout(() => setPhase(p), delay)
    );
    const loop = setTimeout(() => {
      setPhase(0);
      setActiveIdx((i) => (i + 1) % ASSETS.length);
    }, 4200);
    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(loop);
    };
  }, [activeIdx]);

  const asset = ASSETS[activeIdx];

  return (
    <div className="h-full w-full bg-white flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center">
          <Brain className="w-3.5 h-3.5" />
        </div>
        <div>
          <div className="text-[12px] font-semibold text-slate-900 leading-none">Predictions engine</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Continuous failure forecasting</div>
        </div>
        <div className="ml-auto flex items-center gap-1 text-[9px] text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded font-mono">
          <Sparkles className="w-2.5 h-2.5" />
          gemini_3_1_pro
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 p-3 flex-1 min-h-0">
        {/* Left: Health trend */}
        <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-3 flex flex-col">
          <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-1.5">Asset health</div>
          <div className="text-[12px] font-semibold text-slate-900 truncate">{asset.name}</div>

          {/* Mini chart */}
          <div className="flex-1 min-h-0 mt-2 relative">
            <svg viewBox="0 0 100 50" className="w-full h-full" preserveAspectRatio="none">
              <defs>
                <linearGradient id="healthGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
                </linearGradient>
              </defs>
              <motion.path
                key={asset.name}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.4, ease: 'easeOut' }}
                d="M 0 8 L 14 12 L 28 16 L 42 22 L 56 28 L 70 34 L 84 40 L 100 44"
                fill="none"
                stroke="#ef4444"
                strokeWidth="1.4"
              />
              <motion.path
                key={asset.name + '-fill'}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.4 }}
                d="M 0 8 L 14 12 L 28 16 L 42 22 L 56 28 L 70 34 L 84 40 L 100 44 L 100 50 L 0 50 Z"
                fill="url(#healthGrad)"
              />
              {/* Forecast region */}
              <motion.rect
                initial={{ opacity: 0 }}
                animate={{ opacity: phase >= 1 ? 1 : 0 }}
                transition={{ duration: 0.4 }}
                x="70" y="0" width="30" height="50" fill="#ef4444" fillOpacity="0.06"
              />
              <motion.text
                initial={{ opacity: 0 }}
                animate={{ opacity: phase >= 1 ? 1 : 0 }}
                x="85" y="6" textAnchor="middle" fontSize="3.5" fill="#ef4444" fontWeight="700"
              >
                Failure
              </motion.text>
            </svg>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-2">
            <div className="bg-white rounded border border-slate-200 p-1.5">
              <div className="text-[8px] text-slate-500 uppercase tracking-wider font-semibold">Health</div>
              <div className="text-[13px] font-bold text-rose-600 tabular-nums">{asset.health}</div>
            </div>
            <div className="bg-white rounded border border-slate-200 p-1.5">
              <div className="text-[8px] text-slate-500 uppercase tracking-wider font-semibold">RUL</div>
              <div className="text-[13px] font-bold text-slate-900 tabular-nums">{asset.rul}d</div>
            </div>
          </div>
        </div>

        {/* Right: AI reasoning + generated WO */}
        <div className="flex flex-col gap-2">
          {/* Phase 0: Analysing */}
          <AnimatePresence mode="wait">
            {phase === 0 && (
              <motion.div
                key="analyse"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="rounded-lg border border-indigo-200 bg-indigo-50/60 p-3 flex-1 flex flex-col justify-center"
              >
                <div className="flex items-center gap-1.5 text-[10px] font-semibold text-indigo-700 mb-2">
                  <Brain className="w-3 h-3 animate-pulse" />
                  Analysing sensor + condition data…
                </div>
                {['Vibration anomaly detected', 'Temperature trending up', 'Cross-checking history'].map((t, i) => (
                  <motion.div
                    key={t}
                    initial={{ opacity: 0, x: -4 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.25 }}
                    className="text-[10px] text-indigo-900/80 flex items-center gap-1.5 mt-1"
                  >
                    <span className="w-1 h-1 rounded-full bg-indigo-500" />
                    {t}
                  </motion.div>
                ))}
              </motion.div>
            )}

            {phase === 1 && (
              <motion.div
                key="predict"
                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="rounded-lg border border-rose-200 bg-rose-50/70 p-3 flex-1"
              >
                <div className="flex items-center gap-1.5 mb-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700">Failure predicted</span>
                </div>
                <div className="text-[11px] text-slate-800 leading-snug">
                  <span className="font-bold tabular-nums">{asset.prob}%</span> probability of failure within{' '}
                  <span className="font-bold tabular-nums">{asset.rul} days</span>.
                </div>
                <div className="mt-2 flex items-center gap-1 text-[9px] text-rose-700">
                  <TrendingDown className="w-2.5 h-2.5" />
                  Health dropped 24 pts in last 30 days
                </div>
              </motion.div>
            )}

            {phase === 2 && (
              <motion.div
                key="wo"
                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="rounded-lg border-2 border-emerald-300 bg-emerald-50/70 p-3 flex-1"
              >
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Wrench className="w-3.5 h-3.5 text-emerald-700" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Work order generated</span>
                </div>
                <div className="bg-white rounded-md border border-emerald-200 p-2">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-[9px] text-slate-500">WO-2043</span>
                    <span className="text-[8px] font-bold uppercase px-1 py-0.5 rounded bg-rose-100 text-rose-700">High</span>
                  </div>
                  <div className="text-[11px] font-semibold text-slate-900 mt-0.5">{asset.action}</div>
                  <div className="text-[9px] text-slate-500 mt-0.5">Auto-scheduled · 3.5h · J. Rivera</div>
                </div>
                <div className="flex items-center gap-1 text-[9px] text-emerald-700 mt-2">
                  <Sparkles className="w-2.5 h-2.5" />
                  AI-recommended · 94% confidence
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}