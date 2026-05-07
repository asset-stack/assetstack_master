import React from 'react';
import { motion } from 'framer-motion';

export default function SpendByYearChart({ items }) {
  const byYear = items.reduce((acc, i) => {
    const y = i.replacement_year;
    if (!y) return acc;
    acc[y] = (acc[y] || 0) + (i.replacement_cost || 0);
    return acc;
  }, {});

  const years = Object.keys(byYear).map(Number).sort((a, b) => a - b);
  if (!years.length) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <h3 className="text-sm font-semibold text-slate-900 mb-2">Spend by fiscal year</h3>
        <p className="text-sm text-slate-400">No items in plan yet.</p>
      </div>
    );
  }

  const max = Math.max(...years.map(y => byYear[y]));

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5">
      <h3 className="text-sm font-semibold text-slate-900 mb-4">Spend by fiscal year</h3>
      <div className="space-y-2.5">
        {years.map(y => {
          const val = byYear[y];
          const pct = (val / max) * 100;
          return (
            <div key={y} className="flex items-center gap-3">
              <span className="text-[11px] font-mono text-slate-500 w-10 tabular-nums">FY{y}</span>
              <div className="flex-1 h-6 bg-slate-50 rounded relative overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.7, ease: 'easeOut' }}
                  className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded"
                />
                <span className="absolute inset-0 flex items-center px-2 text-[11px] font-semibold tabular-nums text-slate-900">
                  ${(val / 1000).toFixed(0)}k
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}