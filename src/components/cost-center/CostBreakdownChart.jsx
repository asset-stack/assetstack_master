import React from 'react';
import { motion } from 'framer-motion';

const CATEGORY_COLORS = {
  preventive_maintenance: '#10b981',
  corrective_maintenance: '#f59e0b',
  capital_replacement: '#a855f7',
  labor: '#3b82f6',
  parts: '#06b6d4',
  contractors: '#f43f5e',
  energy: '#eab308',
  operational: '#64748b',
  other: '#94a3b8',
};

export default function CostBreakdownChart({ budgets }) {
  const byCategory = budgets.reduce((acc, b) => {
    const cat = b.category || 'other';
    acc[cat] = (acc[cat] || 0) + (b.spent_amount || 0);
    return acc;
  }, {});

  const total = Object.values(byCategory).reduce((s, v) => s + v, 0);
  const entries = Object.entries(byCategory).sort((a, b) => b[1] - a[1]).filter(([, v]) => v > 0);

  if (!entries.length) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <h3 className="text-sm font-semibold text-slate-900 mb-2">Spend by category</h3>
        <p className="text-sm text-slate-400">No spend data yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5">
      <h3 className="text-sm font-semibold text-slate-900 mb-1">Spend by category</h3>
      <p className="text-[11px] text-slate-500 mb-4">Total: ${total.toLocaleString()}</p>

      {/* Horizontal stacked bar */}
      <div className="flex h-3 rounded-full overflow-hidden mb-4 bg-slate-100">
        {entries.map(([cat, val], i) => (
          <motion.div
            key={cat}
            initial={{ width: 0 }}
            animate={{ width: `${(val / total) * 100}%` }}
            transition={{ delay: i * 0.05, duration: 0.5 }}
            style={{ background: CATEGORY_COLORS[cat] || '#94a3b8' }}
            title={`${cat}: $${val.toLocaleString()}`}
          />
        ))}
      </div>

      <div className="space-y-1.5">
        {entries.map(([cat, val]) => {
          const pct = ((val / total) * 100).toFixed(1);
          return (
            <div key={cat} className="flex items-center gap-2 text-[11px]">
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ background: CATEGORY_COLORS[cat] || '#94a3b8' }}
              />
              <span className="capitalize text-slate-700 flex-1">{cat.replace('_', ' ')}</span>
              <span className="tabular-nums font-semibold text-slate-900">${val.toLocaleString()}</span>
              <span className="tabular-nums text-slate-500 w-12 text-right">{pct}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}