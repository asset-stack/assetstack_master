import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Wrench } from 'lucide-react';

const statusStyle = {
  draft: 'bg-slate-100 text-slate-600',
  open: 'bg-blue-100 text-blue-700',
  assigned: 'bg-indigo-100 text-indigo-700',
  in_progress: 'bg-amber-100 text-amber-700',
  on_hold: 'bg-slate-100 text-slate-600',
  completed: 'bg-emerald-100 text-emerald-700',
  closed: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-rose-100 text-rose-600',
};

const priorityStyle = {
  low: 'bg-slate-100 text-slate-600',
  medium: 'bg-blue-100 text-blue-700',
  high: 'bg-orange-100 text-orange-700',
  urgent: 'bg-rose-100 text-rose-700',
};

const fmt = (n) => new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD', maximumFractionDigits: 0 }).format(n || 0);

export default function LocationWorkOrdersTab({ workOrders, equipmentById }) {
  if (workOrders.length === 0) {
    return <p className="text-sm text-slate-500 p-8 text-center bg-white rounded-xl border border-slate-200">No work orders for this location.</p>;
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
          <tr>
            <th className="text-left px-4 py-2.5 font-semibold">WO #</th>
            <th className="text-left px-4 py-2.5 font-semibold">Title / Asset</th>
            <th className="text-left px-4 py-2.5 font-semibold">Type</th>
            <th className="text-left px-4 py-2.5 font-semibold">Priority</th>
            <th className="text-left px-4 py-2.5 font-semibold">Status</th>
            <th className="text-right px-4 py-2.5 font-semibold">Est. Cost</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {workOrders.map(wo => (
            <tr key={wo.id} className="hover:bg-slate-50">
              <td className="px-4 py-2.5 font-mono text-xs text-slate-600">{wo.work_order_number}</td>
              <td className="px-4 py-2.5">
                <div className="font-medium text-slate-900 flex items-center gap-1.5">
                  <Wrench className="w-3.5 h-3.5 text-slate-400" />
                  {wo.title}
                </div>
                {equipmentById[wo.equipment_id] && (
                  <div className="text-xs text-slate-500 mt-0.5 ml-5">{equipmentById[wo.equipment_id].name}</div>
                )}
              </td>
              <td className="px-4 py-2.5 text-slate-600 capitalize">{wo.type}</td>
              <td className="px-4 py-2.5">
                <Badge className={`text-xs ${priorityStyle[wo.priority] || priorityStyle.medium}`}>{wo.priority}</Badge>
              </td>
              <td className="px-4 py-2.5">
                <Badge className={`text-xs ${statusStyle[wo.status] || statusStyle.draft}`}>{wo.status.replace('_', ' ')}</Badge>
              </td>
              <td className="px-4 py-2.5 text-right tabular-nums font-semibold text-slate-700">
                {fmt(wo.actual_total_cost || wo.estimated_cost)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}