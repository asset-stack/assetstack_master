import React from 'react';
import { Building2, Star, Clock, DollarSign } from 'lucide-react';

export default function SupplierStats({ suppliers }) {
  const total = suppliers.length;
  const active = suppliers.filter(s => s.status === 'active').length;
  const preferred = suppliers.filter(s => s.preferred).length;
  const avgRating = suppliers.length
    ? (suppliers.reduce((s, x) => s + (x.rating || 0), 0) / suppliers.length).toFixed(1)
    : 0;
  const totalSpend = suppliers.reduce((s, x) => s + (x.total_spend_ytd || 0), 0);

  const stats = [
    { label: 'Active', value: active, sub: `of ${total} total`, icon: Building2, color: 'text-slate-900' },
    { label: 'Preferred', value: preferred, icon: Star, color: 'text-amber-600' },
    { label: 'Avg rating', value: avgRating, sub: 'out of 5', icon: Clock, color: 'text-blue-600' },
    { label: 'YTD spend', value: `$${(totalSpend / 1000).toFixed(0)}k`, icon: DollarSign, color: 'text-emerald-600' },
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
            {s.sub && <div className="text-[10px] text-slate-500 mt-0.5">{s.sub}</div>}
          </div>
        );
      })}
    </div>
  );
}