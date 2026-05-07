import React, { useMemo } from 'react';
import { deriveRULDays, deriveCRC, fmtMoney } from '@/lib/assetMetrics';

// 10-year renewal pipeline based on RUL.
export default function RenewalForecastChart({ equipment }) {
  const buckets = useMemo(() => {
    const now = new Date();
    const horizon = 10;
    const arr = Array.from({ length: horizon }, (_, i) => ({
      year: now.getFullYear() + i,
      cost: 0,
      count: 0,
    }));
    for (const e of equipment) {
      const rul = deriveRULDays(e);
      const crc = deriveCRC(e);
      if (rul == null || crc <= 0) continue;
      const yearsAway = Math.max(0, Math.floor(rul / 365));
      const idx = Math.min(yearsAway, horizon - 1);
      arr[idx].cost += crc;
      arr[idx].count += 1;
    }
    return arr;
  }, [equipment]);

  const max = Math.max(1, ...buckets.map((b) => b.cost));
  const total = buckets.reduce((s, b) => s + b.cost, 0);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">10-Year Renewal Pipeline</h3>
          <p className="text-xs text-slate-500 mt-0.5">Forecast based on RUL × Replacement Cost</p>
        </div>
        <div className="text-right">
          <p className="text-xl font-bold text-slate-900 tabular-nums">{fmtMoney(total)}</p>
          <p className="text-xs text-slate-500">Total 10-yr</p>
        </div>
      </div>
      <div className="space-y-2">
        {buckets.map((b) => (
          <div key={b.year} className="flex items-center gap-3">
            <span className="text-xs text-slate-500 w-12 tabular-nums">{b.year}</span>
            <div className="flex-1 bg-slate-100 rounded-md h-6 overflow-hidden relative">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all"
                style={{ width: `${Math.max(2, (b.cost / max) * 100)}%` }}
              />
              <span className="absolute inset-0 flex items-center px-2 text-[11px] font-semibold text-white mix-blend-difference">
                {fmtMoney(b.cost)} · {b.count} assets
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}