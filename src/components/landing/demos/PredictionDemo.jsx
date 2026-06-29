import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, ReferenceLine, Area, AreaChart, Tooltip } from 'recharts';
import { TrendingDown, AlertTriangle, Brain } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const ASSETS = [
  {
    id: 'pump-3', name: 'Pump #3', location: 'LGA Council Pump Station', risk: 78, days: 23,
    history: [
      { d: 'Jan', vibration: 4.2 }, { d: 'Feb', vibration: 4.5 }, { d: 'Mar', vibration: 5.1 },
      { d: 'Apr', vibration: 5.9 }, { d: 'May', vibration: 6.8 }, { d: 'Jun', vibration: 7.4 },
      { d: 'Jul', vibration: 8.2, predicted: true }, { d: 'Aug', vibration: 9.1, predicted: true },
    ],
  },
  {
    id: 'hvac-7', name: 'HVAC Unit #7', location: 'South West Library', risk: 42, days: 67,
    history: [
      { d: 'Jan', vibration: 3.1 }, { d: 'Feb', vibration: 3.3 }, { d: 'Mar', vibration: 3.5 },
      { d: 'Apr', vibration: 3.8 }, { d: 'May', vibration: 4.0 }, { d: 'Jun', vibration: 4.2 },
      { d: 'Jul', vibration: 4.5, predicted: true }, { d: 'Aug', vibration: 4.8, predicted: true },
    ],
  },
  {
    id: 'rail-12', name: 'Signal Box 12', location: 'Western Rail Line', risk: 91, days: 8,
    history: [
      { d: 'Jan', vibration: 2.0 }, { d: 'Feb', vibration: 2.5 }, { d: 'Mar', vibration: 3.8 },
      { d: 'Apr', vibration: 5.2 }, { d: 'May', vibration: 7.1 }, { d: 'Jun', vibration: 9.4 },
      { d: 'Jul', vibration: 11.8, predicted: true }, { d: 'Aug', vibration: 14.2, predicted: true },
    ],
  },
];

const riskColor = (r) => r >= 75 ? 'text-red-600 bg-red-50 border-red-200' : r >= 50 ? 'text-amber-600 bg-amber-50 border-amber-200' : 'text-emerald-600 bg-emerald-50 border-emerald-200';

export default function PredictionDemo() {
  const [selected, setSelected] = useState(ASSETS[0]);

  return (
    <div className="grid lg:grid-cols-3 gap-5">
      {/* Asset list */}
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">At-risk assets</p>
        {ASSETS.map((a) => (
          <motion.button
            key={a.id}
            whileHover={{ x: 4 }}
            onClick={() => setSelected(a)}
            className={`w-full text-left p-4 rounded-xl border transition-all ${
              selected.id === a.id
                ? 'bg-white border-indigo-300 shadow-lg shadow-indigo-500/10'
                : 'bg-white/60 border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold text-sm text-slate-900">{a.name}</span>
              <Badge className={`${riskColor(a.risk)} border text-[10px]`}>{a.risk}% risk</Badge>
            </div>
            <div className="text-xs text-slate-500">{a.location}</div>
            <div className="mt-2 flex items-center gap-1.5 text-xs">
              <AlertTriangle className="w-3 h-3 text-amber-500" />
              <span className="font-medium text-slate-700">Failure in ~{a.days} days</span>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Chart */}
      <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5">
        <div className="flex items-start justify-between mb-4 flex-wrap gap-2">
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-lg text-slate-900">{selected.name}</h4>
              <Badge variant="outline" className="text-[10px] font-mono">vibration mm/s</Badge>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{selected.location} · 6mo history + 2mo AI forecast</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100">
            <Brain className="w-3.5 h-3.5 text-indigo-600" />
            <span className="text-xs font-semibold text-indigo-700">AI confidence: 91%</span>
          </div>
        </div>

        <div className="h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={selected.history}>
              <defs>
                <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="d" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={11} />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }}
                formatter={(v) => [`${v} mm/s`, 'Vibration']}
              />
              <ReferenceLine y={10} stroke="#ef4444" strokeDasharray="4 4" label={{ value: 'Failure threshold', position: 'right', fontSize: 10, fill: '#ef4444' }} />
              <Area type="monotone" dataKey="vibration" stroke="#6366f1" strokeWidth={2.5} fill="url(#g1)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-100">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Predicted failure</div>
            <div className="font-bold text-slate-900 mt-0.5">~{selected.days} days</div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Recommended action</div>
            <div className="font-bold text-slate-900 mt-0.5 text-sm">Bearing inspection</div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Est. savings</div>
            <div className="font-bold text-emerald-600 mt-0.5 flex items-center gap-1"><TrendingDown className="w-3.5 h-3.5" /> $24,800</div>
          </div>
        </div>
      </div>
    </div>
  );
}