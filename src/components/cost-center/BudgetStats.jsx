import React from 'react';
import { DollarSign, TrendingUp, AlertCircle, Wallet } from 'lucide-react';

export default function BudgetStats({ budgets, workOrders }) {
  const totalAllocated = budgets.reduce((s, b) => s + (b.allocated_amount || 0), 0);
  const totalSpent = budgets.reduce((s, b) => s + (b.spent_amount || 0), 0);
  const totalCommitted = budgets.reduce((s, b) => s + (b.committed_amount || 0), 0);
  const remaining = totalAllocated - totalSpent - totalCommitted;
  const utilisation = totalAllocated > 0 ? Math.round((totalSpent / totalAllocated) * 100) : 0;
  const overBudget = budgets.filter(b => (b.spent_amount || 0) > (b.allocated_amount || 0)).length;

  const stats = [
    { label: 'Allocated FY', value: `$${(totalAllocated / 1000).toFixed(0)}k`, icon: Wallet, color: 'text-slate-900' },
    { label: 'Spent', value: `$${(totalSpent / 1000).toFixed(0)}k`, sub: `${utilisation}% used`, icon: DollarSign, color: 'text-blue-600' },
    { label: 'Remaining', value: `$${(remaining / 1000).toFixed(0)}k`, icon: TrendingUp, color: remaining >= 0 ? 'text-emerald-600' : 'text-rose-600' },
    { label: 'Over budget', value: overBudget, icon: AlertCircle, color: 'text-rose-600' },
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