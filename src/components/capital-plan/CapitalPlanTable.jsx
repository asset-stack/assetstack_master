import React from 'react';
import { Button } from '@/components/ui/button';
import { Edit, Calendar } from 'lucide-react';

const PRIORITY_COLOR = {
  urgent: 'bg-rose-100 text-rose-700',
  high: 'bg-orange-100 text-orange-700',
  medium: 'bg-amber-100 text-amber-700',
  low: 'bg-slate-100 text-slate-600',
};

const STATUS_COLOR = {
  proposed: 'bg-slate-100 text-slate-600',
  approved: 'bg-blue-100 text-blue-700',
  deferred: 'bg-amber-100 text-amber-700',
  funded: 'bg-emerald-100 text-emerald-700',
  in_progress: 'bg-indigo-100 text-indigo-700',
  completed: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-rose-100 text-rose-700',
};

// Do-Nothing Cost = replacement_cost × consequence × likelihood multipliers
// Models what failure would actually cost (downtime + collateral + emergency replacement premium).
const CONSEQUENCE_MULT = { minor: 1.2, moderate: 1.6, major: 2.4, catastrophic: 3.5 };
const LIKELIHOOD_MULT = { unlikely: 0.3, possible: 0.6, likely: 1.0, almost_certain: 1.3 };

function doNothingCost(item) {
  const base = item.replacement_cost || 0;
  const c = CONSEQUENCE_MULT[item.consequence_of_failure] ?? 1.6;
  const l = LIKELIHOOD_MULT[item.likelihood_of_failure] ?? 0.6;
  return Math.round(base * c * l);
}

function fmtCompact(n) {
  if (!n) return '$0';
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${Math.round(n / 1_000)}k`;
  return `$${n}`;
}

export default function CapitalPlanTable({ items, onEdit }) {
  if (!items.length) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-10 text-center">
        <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-2" />
        <p className="text-sm text-slate-500">No capital plan items yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <table className="w-full">
        <thead className="bg-slate-50 border-b border-slate-100 text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
          <tr>
            <th className="text-left px-4 py-2.5">Asset</th>
            <th className="text-left px-3 py-2.5">Location</th>
            <th className="text-left px-3 py-2.5">FY</th>
            <th className="text-right px-3 py-2.5">Replacement cost</th>
            <th className="text-right px-3 py-2.5" title="Estimated cost if we don't fund this and it fails — includes downtime, collateral damage, and emergency replacement premium.">Do-nothing cost</th>
            <th className="text-left px-3 py-2.5">Condition</th>
            <th className="text-left px-3 py-2.5">Priority</th>
            <th className="text-left px-3 py-2.5">Status</th>
            <th className="px-4 py-2.5"></th>
          </tr>
        </thead>
        <tbody>
          {items.map(item => {
            const condColor = (item.condition_score || 0) >= 70 ? 'text-emerald-600'
              : (item.condition_score || 0) >= 40 ? 'text-amber-600'
              : 'text-rose-600';
            return (
              <tr key={item.id} className="border-t border-slate-100 hover:bg-slate-50/60">
                <td className="px-4 py-3">
                  <div className="text-[13px] font-semibold text-slate-900 truncate">{item.equipment_name}</div>
                  <div className="text-[10px] text-slate-500 capitalize">{item.asset_type}</div>
                </td>
                <td className="px-3 py-3 text-[12px] text-slate-600 truncate max-w-[150px]">{item.location_name || '—'}</td>
                <td className="px-3 py-3 text-[12px] tabular-nums text-slate-700 font-semibold">FY{item.replacement_year}</td>
                <td className="px-3 py-3 text-right text-[12px] tabular-nums font-semibold text-slate-900">
                  ${(item.replacement_cost || 0).toLocaleString()}
                </td>
                <td className="px-3 py-3 text-right text-[12px] tabular-nums font-bold text-rose-600" title="If we don't fund this">
                  {fmtCompact(doNothingCost(item))}
                </td>
                <td className="px-3 py-3">
                  <span className={`text-[12px] font-semibold tabular-nums ${condColor}`}>
                    {item.condition_score || '—'}{item.condition_score && '%'}
                  </span>
                </td>
                <td className="px-3 py-3">
                  <span className={`text-[9px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded ${PRIORITY_COLOR[item.priority] || PRIORITY_COLOR.medium}`}>
                    {item.priority}
                  </span>
                </td>
                <td className="px-3 py-3">
                  <span className={`text-[9px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded ${STATUS_COLOR[item.status] || STATUS_COLOR.proposed}`}>
                    {item.status?.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <Button size="icon" variant="ghost" onClick={() => onEdit?.(item)} className="h-7 w-7">
                    <Edit className="w-3 h-3" />
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}