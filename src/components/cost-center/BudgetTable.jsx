import React from 'react';
import { Button } from '@/components/ui/button';
import { Edit, Wallet } from 'lucide-react';

export default function BudgetTable({ budgets, onEdit }) {
  if (!budgets.length) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-10 text-center">
        <Wallet className="w-8 h-8 text-slate-300 mx-auto mb-2" />
        <p className="text-sm text-slate-500">No budgets defined yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <table className="w-full">
        <thead className="bg-slate-50 border-b border-slate-100 text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
          <tr>
            <th className="text-left px-4 py-2.5">Budget</th>
            <th className="text-left px-3 py-2.5">Scope</th>
            <th className="text-left px-3 py-2.5">Category</th>
            <th className="text-right px-3 py-2.5">Allocated</th>
            <th className="text-right px-3 py-2.5">Spent</th>
            <th className="text-right px-3 py-2.5">Remaining</th>
            <th className="text-left px-3 py-2.5">Utilisation</th>
            <th className="px-4 py-2.5"></th>
          </tr>
        </thead>
        <tbody>
          {budgets.map(b => {
            const allocated = b.allocated_amount || 0;
            const spent = b.spent_amount || 0;
            const remaining = allocated - spent - (b.committed_amount || 0);
            const pct = allocated > 0 ? Math.round((spent / allocated) * 100) : 0;
            const overBudget = pct > 100;

            return (
              <tr key={b.id} className="border-t border-slate-100 hover:bg-slate-50/60">
                <td className="px-4 py-3">
                  <div className="text-[13px] font-semibold text-slate-900">{b.name}</div>
                  <div className="text-[10px] text-slate-500">{b.fiscal_year}</div>
                </td>
                <td className="px-3 py-3 text-[12px] text-slate-700">
                  <span className="capitalize">{b.scope_type?.replace('_', ' ')}</span>
                  {b.scope_name && <div className="text-[10px] text-slate-500">{b.scope_name}</div>}
                </td>
                <td className="px-3 py-3 text-[12px] text-slate-600 capitalize">{b.category?.replace('_', ' ')}</td>
                <td className="px-3 py-3 text-right text-[12px] tabular-nums font-semibold text-slate-900">
                  ${allocated.toLocaleString()}
                </td>
                <td className="px-3 py-3 text-right text-[12px] tabular-nums text-slate-700">
                  ${spent.toLocaleString()}
                </td>
                <td className={`px-3 py-3 text-right text-[12px] tabular-nums font-semibold ${remaining < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                  ${remaining.toLocaleString()}
                </td>
                <td className="px-3 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${overBudget ? 'bg-rose-500' : pct > 80 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                        style={{ width: `${Math.min(100, pct)}%` }}
                      />
                    </div>
                    <span className={`text-[11px] tabular-nums ${overBudget ? 'text-rose-600 font-semibold' : 'text-slate-600'}`}>
                      {pct}%
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <Button size="icon" variant="ghost" onClick={() => onEdit?.(b)} className="h-7 w-7">
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