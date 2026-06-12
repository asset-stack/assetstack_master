import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { secureEntity } from '@/lib/secureEntities';
import { Card } from '@/components/ui/card';
import { TrendingUp, ArrowRight, Banknote, CalendarDays } from 'lucide-react';
import { formatCurrency } from '@/lib/projectUtils';

export default function ProjectLifecycleImpact({ project }) {
  const planIds = project?.capital_plan_item_ids || [];

  const { data: planItems = [] } = useQuery({
    queryKey: ['project-plan-items', project?.id],
    queryFn: async () => {
      const all = await secureEntity('CapitalPlanItem').list('-updated_date', 500);
      return all.filter((p) => planIds.includes(p.id));
    },
    enabled: planIds.length > 0
  });

  const baseline = project?.baseline_condition_score;
  const post = project?.post_condition_score;
  const conditionDelta = baseline != null && post != null ? post - baseline : null;
  const planValue = planItems.reduce((s, p) => s + (p.replacement_cost || 0), 0);
  const earliestYear = planItems.length
    ? Math.min(...planItems.map((p) => p.replacement_year || 9999))
    : null;

  return (
    <Card className="p-5">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-4 h-4 text-emerald-600" />
        <h3 className="font-semibold text-slate-900 text-sm">Lifecycle Impact &amp; ROI</h3>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Condition uplift */}
        <div className="rounded-lg bg-slate-50 p-3">
          <p className="text-[10px] font-semibold text-slate-500 uppercase mb-1">Condition Uplift</p>
          {baseline != null ? (
            <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-900 tabular-nums">
              {Math.round(baseline)}
              <ArrowRight className="w-3 h-3 text-slate-400" />
              {post != null ? Math.round(post) : '—'}
              {conditionDelta != null && (
                <span className={`text-xs ml-1 ${conditionDelta >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {conditionDelta >= 0 ? '+' : ''}{Math.round(conditionDelta)}
                </span>
              )}
            </div>
          ) : (
            <p className="text-sm text-slate-400">Not captured</p>
          )}
        </div>

        {/* Verified savings */}
        <div className="rounded-lg bg-slate-50 p-3">
          <p className="text-[10px] font-semibold text-slate-500 uppercase mb-1">Verified Savings</p>
          <div className="flex items-center gap-1.5 text-sm font-semibold text-emerald-700 tabular-nums">
            <Banknote className="w-3.5 h-3.5" />
            {project?.verified_savings ? formatCurrency(project.verified_savings, project.currency) : '—'}
          </div>
        </div>

        {/* Capital plan value delivered */}
        <div className="rounded-lg bg-slate-50 p-3">
          <p className="text-[10px] font-semibold text-slate-500 uppercase mb-1">Plan Value Delivered</p>
          <p className="text-sm font-semibold text-slate-900 tabular-nums">
            {planIds.length ? formatCurrency(planValue, project?.currency) : '—'}
          </p>
          {planIds.length > 0 && (
            <p className="text-[11px] text-slate-500">{planIds.length} capital plan item{planIds.length > 1 ? 's' : ''}</p>
          )}
        </div>

        {/* Renewal timing */}
        <div className="rounded-lg bg-slate-50 p-3">
          <p className="text-[10px] font-semibold text-slate-500 uppercase mb-1">Renewal Year Target</p>
          <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-900 tabular-nums">
            <CalendarDays className="w-3.5 h-3.5 text-slate-400" />
            {earliestYear && earliestYear !== 9999 ? `FY${earliestYear}` : '—'}
          </div>
        </div>
      </div>

      {planItems.length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-100 space-y-1.5">
          {planItems.slice(0, 6).map((p) => (
            <div key={p.id} className="flex items-center gap-2 text-xs">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
              <span className="truncate text-slate-700">{p.equipment_name}</span>
              <span className="ml-auto tabular-nums text-slate-500">
                FY{p.replacement_year} · {formatCurrency(p.replacement_cost, project?.currency)}
              </span>
            </div>
          ))}
          {planItems.length > 6 && (
            <p className="text-[11px] text-slate-400">+{planItems.length - 6} more items</p>
          )}
        </div>
      )}
    </Card>
  );
}