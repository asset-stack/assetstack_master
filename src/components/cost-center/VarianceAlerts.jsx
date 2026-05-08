import React, { useMemo } from 'react';
import { AlertTriangle, AlertCircle, TrendingUp } from 'lucide-react';
import { fmtMoney } from '@/lib/assetMetrics';

/**
 * Surface budget lines that need CFO attention.
 * Three tiers: over-spent (>100%), critical burn (>85%), forecast risk (committed > remaining).
 */
export default function VarianceAlerts({ budgets }) {
  const alerts = useMemo(() => {
    const out = [];
    for (const b of budgets) {
      const alloc = b.allocated_amount || 0;
      if (alloc <= 0) continue;
      const spent = b.spent_amount || 0;
      const committed = b.committed_amount || 0;
      const util = (spent / alloc) * 100;
      const remaining = alloc - spent;
      if (util > 100) {
        out.push({
          severity: 'critical',
          budget: b,
          message: `Over-spent by ${fmtMoney(spent - alloc)} (${Math.round(util)}%)`,
        });
      } else if (util > 85) {
        out.push({
          severity: 'warn',
          budget: b,
          message: `${Math.round(util)}% utilised — ${fmtMoney(remaining)} remaining`,
        });
      } else if (committed > remaining && committed > 0) {
        out.push({
          severity: 'forecast',
          budget: b,
          message: `Committed ${fmtMoney(committed)} exceeds remaining ${fmtMoney(remaining)}`,
        });
      }
    }
    return out.sort((a, b) => {
      const order = { critical: 0, warn: 1, forecast: 2 };
      return order[a.severity] - order[b.severity];
    });
  }, [budgets]);

  if (alerts.length === 0) {
    return (
      <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 mb-4 flex items-center gap-2">
        <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center">
          <TrendingUp className="w-3.5 h-3.5 text-emerald-700" />
        </div>
        <div className="text-[12px] text-emerald-800">
          <span className="font-semibold">All budgets healthy.</span> No lines over 85% utilisation.
        </div>
      </div>
    );
  }

  const tones = {
    critical: { bg: 'bg-rose-50', border: 'border-rose-200', icon: 'text-rose-600', label: 'OVER BUDGET' },
    warn: { bg: 'bg-amber-50', border: 'border-amber-200', icon: 'text-amber-600', label: 'BURN ALERT' },
    forecast: { bg: 'bg-indigo-50', border: 'border-indigo-200', icon: 'text-indigo-600', label: 'FORECAST RISK' },
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-3 mb-4">
      <div className="flex items-center gap-2 mb-2">
        <AlertTriangle className="w-4 h-4 text-amber-600" />
        <h3 className="text-sm font-semibold text-slate-900">Variance Alerts</h3>
        <span className="text-[10px] text-slate-500 ml-auto">{alerts.length} flagged</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
        {alerts.slice(0, 9).map((a, i) => {
          const t = tones[a.severity];
          return (
            <div key={i} className={`flex items-start gap-2 p-2 rounded-lg border ${t.bg} ${t.border}`}>
              <AlertCircle className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${t.icon}`} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className={`text-[9px] font-bold uppercase tracking-wider ${t.icon}`}>{t.label}</span>
                </div>
                <div className="text-[12px] font-semibold text-slate-900 truncate">{a.budget.name}</div>
                <div className="text-[11px] text-slate-600 mt-0.5">{a.message}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}