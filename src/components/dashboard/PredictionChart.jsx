import React from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

export default function PredictionChart({ data, title, dataKey = "value", predictedKey = "predicted", threshold }) {
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-lg">
          <p className="text-slate-500 text-xs mb-1">{label}</p>
          {payload.map((entry, idx) => (
            <p key={idx} className="text-sm font-medium" style={{ color: entry.color }}>
              {entry.name}: {entry.value?.toFixed(2)}
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
      className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm"
    >
      <h3 className="text-base font-semibold text-slate-900 mb-4">{title}</h3>
      <div className="h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis 
              dataKey="name" 
              stroke="#94a3b8" 
              tick={{ fill: '#64748b', fontSize: 11 }}
              axisLine={{ stroke: '#e2e8f0' }}
            />
            <YAxis 
              stroke="#94a3b8" 
              tick={{ fill: '#64748b', fontSize: 11 }}
              axisLine={{ stroke: '#e2e8f0' }}
            />
            <Tooltip content={<CustomTooltip />} />
            {threshold && (
              <ReferenceLine 
                y={threshold} 
                stroke="#ef4444" 
                strokeDasharray="5 5" 
                label={{ value: 'Threshold', fill: '#ef4444', fontSize: 10 }}
              />
            )}
            <Area
              type="monotone"
              dataKey={dataKey}
              stroke="#6366f1"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorValue)"
              name="Actual"
            />
            {predictedKey && (
              <Area
                type="monotone"
                dataKey={predictedKey}
                stroke="#8b5cf6"
                strokeWidth={2}
                strokeDasharray="5 5"
                fillOpacity={1}
                fill="url(#colorPredicted)"
                name="Predicted"
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="flex items-center justify-center gap-6 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-0.5 bg-indigo-500 rounded" />
          <span className="text-xs text-slate-500">Actual</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-0.5 bg-violet-500 rounded border-dashed" style={{borderStyle: 'dashed'}} />
          <span className="text-xs text-slate-500">Predicted</span>
        </div>
        {threshold && (
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-rose-500 rounded" />
            <span className="text-xs text-slate-500">Threshold</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}