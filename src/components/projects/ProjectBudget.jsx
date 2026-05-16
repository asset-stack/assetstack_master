import React from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, AlertTriangle } from 'lucide-react';
import { formatCurrency, budgetVariancePct, HEALTH_META } from '@/lib/projectUtils';

export default function ProjectBudget({ project }) {
  const budget = Number(project.budget) || 0;
  const actual = Number(project.actual_cost) || 0;
  const committed = Number(project.committed_cost) || 0;
  const forecast = Number(project.forecast_cost) || actual + committed;
  const remaining = Math.max(budget - actual - committed, 0);

  const actualPct = budget ? (actual / budget) * 100 : 0;
  const committedPct = budget ? (committed / budget) * 100 : 0;
  const variance = budgetVariancePct(project);
  const variancePositive = variance > 0;

  const health = HEALTH_META[project.health] || HEALTH_META.on_track;

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Budget Performance</h3>
          <p className="text-xs text-slate-500">Live roll-up from linked work orders</p>
        </div>
        <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md ${health.text} bg-opacity-10`}>
          <div className={`w-1.5 h-1.5 rounded-full ${health.color}`} />
          <span className="text-[11px] font-semibold">{health.label}</span>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3 mb-5">
        <div>
          <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-1">
            Budget
          </div>
          <div className="text-lg font-bold text-slate-900 tabular-nums">
            {formatCurrency(budget, project.currency)}
          </div>
        </div>
        <div>
          <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-1">
            Actual
          </div>
          <div className="text-lg font-bold text-indigo-600 tabular-nums">
            {formatCurrency(actual, project.currency)}
          </div>
        </div>
        <div>
          <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-1">
            Committed
          </div>
          <div className="text-lg font-bold text-amber-600 tabular-nums">
            {formatCurrency(committed, project.currency)}
          </div>
        </div>
        <div>
          <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-1">
            Remaining
          </div>
          <div className="text-lg font-bold text-emerald-600 tabular-nums">
            {formatCurrency(remaining, project.currency)}
          </div>
        </div>
      </div>

      {/* Stacked bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1.5">
          <span>Spend vs Budget</span>
          <span className="tabular-nums font-semibold">
            {Math.round(actualPct + committedPct)}% utilised
          </span>
        </div>
        <div className="relative h-2.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="absolute top-0 bottom-0 left-0 bg-indigo-500"
            style={{ width: `${Math.min(actualPct, 100)}%` }}
          />
          <div
            className="absolute top-0 bottom-0 bg-amber-400"
            style={{
              left: `${Math.min(actualPct, 100)}%`,
              width: `${Math.min(committedPct, 100 - actualPct)}%`
            }}
          />
        </div>
      </div>

      {/* Forecast vs budget */}
      <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
        <div className="flex items-center gap-2">
          {variancePositive ? (
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          ) : (
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          )}
          <div>
            <div className="text-xs font-semibold text-slate-900">
              Forecast at completion: {formatCurrency(forecast, project.currency)}
            </div>
            <div className="text-[11px] text-slate-500">
              {variancePositive
                ? `${variance.toFixed(1)}% over budget`
                : `${Math.abs(variance).toFixed(1)}% under budget`}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}