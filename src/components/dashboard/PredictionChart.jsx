import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

export default function PredictionChart({ data, title, dataKey = "value", predictedKey = "predicted", threshold }) {
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-slate-200 rounded-lg px-2.5 py-2 shadow-lg">
          <p className="text-slate-500 text-[10px] mb-1">{label}</p>
          {payload.map((entry, idx) => (
            <p key={idx} className="text-xs font-medium" style={{ color: entry.color }}>
              {entry.name}: {entry.value?.toFixed(1)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="bg-white rounded-xl border border-slate-200 p-4"
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 bg-violet-50 rounded-lg">
          <TrendingUp className="w-4 h-4 text-violet-600" />
        </div>
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      </div>
      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="name" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            {threshold && (
              <ReferenceLine y={threshold} stroke="#ef4444" strokeDasharray="4 4" />
            )}
            <Area type="monotone" dataKey={dataKey} stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorValue)" name="Actual" />
            {predictedKey && (
              <Area type="monotone" dataKey={predictedKey} stroke="#8b5cf6" strokeWidth={2} strokeDasharray="4 4" fillOpacity={1} fill="url(#colorPredicted)" name="Predicted" />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="flex items-center justify-center gap-4 mt-3">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-0.5 bg-indigo-500 rounded" />
          <span className="text-[10px] text-slate-500">Actual</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-0.5 bg-violet-500 rounded" style={{background: 'repeating-linear-gradient(90deg, #8b5cf6 0, #8b5cf6 2px, transparent 2px, transparent 4px)'}} />
          <span className="text-[10px] text-slate-500">Predicted</span>
        </div>
        {threshold && (
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-0.5 bg-rose-500 rounded" />
            <span className="text-[10px] text-slate-500">Threshold</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}