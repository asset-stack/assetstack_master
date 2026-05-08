import React from 'react';
import { AlertTriangle, TrendingUp } from 'lucide-react';

// Pure UI — given budgets, surface ones >85% utilised so finance teams act early.
export default function VarianceAlerts({ budgets = [] }) {
  const alerts = budgets
    .filter(b => b.status === 'active')
    .map(b => {
      const allocated = b.allocated_amount || 0;
      const spent = b.spent_amount || 0;
      const pct = allocated > 0 ? (spent / allocated) * 100 : 0;
      return { ...b, pct };
    })
    .filter(b => b.pct >= 85)
    .sort((a, b) => b.pct - a.pct)
    .slice(0, 5);

  if (alerts.length === 0) return null;

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-5">
      <div className="flex items-center gap-2 mb-2">
        <AlertTriangle className="w-4 h-4 text-amber-700" />
        <h3 className="text-[12px] font-bold text-amber-900 uppercase tracking-wider">
          {alerts.length} Budget Variance {alerts.length === 1 ? 'Alert' : 'Alerts'}
        </h3>
      </div>
      <div className="space-y-1.5">
        {alerts.map(b => {
          const over = b.pct > 100;
          return (
            <div key={b.id} className="flex items-center justify-between text-[12px] py-1">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <TrendingUp className={`w-3 h-3 shrink-0 ${over ? 'text-rose-600' : 'text-amber-600'}`} />
                <span className="font-semibold text-slate-800 truncate">{b.name}</span>
                <span className="text-slate-500 text-[11px] hidden sm:inline">{b.fiscal_year}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <div className="w-24 h-1.5 rounded-full bg-white overflow-hidden">
                  <div
                    className={`h-full ${over ? 'bg-rose-500' : 'bg-amber-500'}`}
                    style={{ width: `${Math.min(100, b.pct)}%` }}
                  />
                </div>
                <span className={`tabular-nums font-bold w-12 text-right ${over ? 'text-rose-700' : 'text-amber-700'}`}>
                  {Math.round(b.pct)}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}