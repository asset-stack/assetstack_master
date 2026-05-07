import React from 'react';
import { Calendar, TrendingUp, AlertOctagon, CircleDollarSign } from 'lucide-react';

export default function CapitalPlanStats({ items }) {
  const total = items.length;
  const totalSpend = items.reduce((s, i) => s + (i.replacement_cost || 0), 0);
  const urgent = items.filter(i => i.priority === 'urgent').length;
  const currentYear = new Date().getFullYear();
  const thisYearSpend = items
    .filter(i => i.replacement_year === currentYear)
    .reduce((s, i) => s + (i.replacement_cost || 0), 0);

  const stats = [
    { label: 'Items in plan', value: total, icon: Calendar, color: 'text-slate-900' },
    { label: 'Total commitment', value: `$${(totalSpend / 1000000).toFixed(2)}M`, icon: CircleDollarSign, color: 'text-blue-600' },
    { label: `FY${currentYear}`, value: `$${(thisYearSpend / 1000).toFixed(0)}k`, icon: TrendingUp, color: 'text-emerald-600' },
    { label: 'Urgent', value: urgent, icon: AlertOctagon, color: 'text-rose-600' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
      {stats.map(s => {
        const Icon = s.icon;
        return (
          <div key={s.label} className="bg-white border border-slate-200 rounded-xl p-4">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-2">
              <Icon className="w-3 h-3" /> {s.label}
            </div>
            <div className={`text-2xl font-semibold tabular-nums ${s.color}`}>{s.value}</div>
          </div>
        );
      })}
    </div>
  );
}