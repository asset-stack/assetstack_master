import React from 'react';
import { motion } from 'framer-motion';
import { Brain, TrendingUp } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, ReferenceDot, ReferenceLine, CartesianGrid } from 'recharts';

const data = Array.from({ length: 30 }, (_, i) => ({
  d: i + 1,
  // Health declining
  health: Math.max(20, 95 - i * 2.4 - (i > 18 ? (i - 18) * 4 : 0)),
}));

export default function TourFramePredict() {
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center">
            <Brain className="w-3.5 h-3.5 text-primary" />
          </div>
          <span className="text-[12px] font-semibold text-slate-900">Failure Prediction · Tower crane TC-04</span>
        </div>
        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
          <TrendingUp className="w-3 h-3" /> Risk rising
        </span>
      </div>

      <div className="grid md:grid-cols-[1fr_240px] flex-1">
        <div className="p-5 flex flex-col">
          <div className="grid grid-cols-3 gap-3 mb-4">
            {[
              ['Failure probability', '92%', 'text-rose-600'],
              ['Predicted in', '47 days', 'text-amber-600'],
              ['Confidence', '94%', 'text-primary'],
            ].map(([l, v, c]) => (
              <div key={l} className="rounded-lg border border-slate-100 p-3">
                <div className={`text-xl font-semibold tabular-nums tracking-tight ${c}`}>{v}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">{l}</div>
              </div>
            ))}
          </div>

          <div className="flex-1 rounded-lg border border-slate-100 p-4 bg-slate-50/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-medium text-slate-600">Asset health · 30-day projection</span>
              <span className="text-[10px] font-mono text-slate-400">95% → 22%</span>
            </div>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="healthGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 14% 92%)" vertical={false} />
                  <XAxis dataKey="d" tick={{ fontSize: 10, fill: 'hsl(220 9% 46%)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: 'hsl(220 9% 46%)' }} axisLine={false} tickLine={false} domain={[0, 100]} />
                  <ReferenceLine y={30} stroke="hsl(0 72% 51%)" strokeDasharray="4 4" label={{ value: 'Failure threshold', fontSize: 10, fill: 'hsl(0 72% 51%)', position: 'insideTopRight' }} />
                  <Line type="monotone" dataKey="health" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={false} />
                  <ReferenceDot x={28} y={data[27].health} r={5} fill="hsl(0 72% 51%)" stroke="white" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="border-t md:border-t-0 md:border-l border-slate-100 p-5 space-y-3">
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Drivers</div>
          {[
            ['Vibration ↑ 38%', 78],
            ['Bearing temp ↑ 12°C', 64],
            ['Cycle count > MTBF', 52],
            ['Last service 184d ago', 41],
          ].map(([label, weight], i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
            >
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-slate-700 font-medium">{label}</span>
                <span className="font-mono text-slate-400 tabular-nums">{weight}</span>
              </div>
              <div className="h-1 rounded-full bg-slate-100 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${weight}%` }}
                  transition={{ delay: 0.4 + i * 0.1, duration: 0.6 }}
                  className="h-full bg-primary"
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}