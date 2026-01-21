import React from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

export default function PredictionChart({ data, title, dataKey = "value", predictedKey = "predicted", threshold }) {
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800/95 backdrop-blur-xl border border-slate-700 rounded-lg p-3 shadow-xl">
          <p className="text-slate-400 text-xs mb-1">{label}</p>
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
      className="bg-slate-900/50 rounded-2xl border border-slate-700/50 p-6 backdrop-blur-xl"
    >
      <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
      <div className="h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis 
              dataKey="name" 
              stroke="#64748b" 
              tick={{ fill: '#64748b', fontSize: 11 }}
              axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
            />
            <YAxis 
              stroke="#64748b" 
              tick={{ fill: '#64748b', fontSize: 11 }}
              axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
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
              stroke="#3b82f6"
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
          <div className="w-3 h-0.5 bg-blue-500 rounded" />
          <span className="text-xs text-slate-400">Actual</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-0.5 bg-purple-500 rounded border-dashed" style={{borderStyle: 'dashed'}} />
          <span className="text-xs text-slate-400">Predicted</span>
        </div>
        {threshold && (
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-rose-500 rounded" />
            <span className="text-xs text-slate-400">Threshold</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}