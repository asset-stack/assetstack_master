import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Wrench } from 'lucide-react';
import { formatCurrency } from '@/lib/projectUtils';

const STATUS_COLORS = {
  draft: 'bg-slate-100 text-slate-700',
  open: 'bg-blue-100 text-blue-700',
  assigned: 'bg-indigo-100 text-indigo-700',
  in_progress: 'bg-amber-100 text-amber-700',
  on_hold: 'bg-slate-100 text-slate-700',
  completed: 'bg-emerald-100 text-emerald-700',
  closed: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-rose-100 text-rose-700'
};

export default function ProjectWorkOrders({ equipmentIds = [] }) {
  const [workOrders, setWorkOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!equipmentIds.length) {
      setWorkOrders([]);
      return;
    }
    setLoading(true);
    Promise.all(
      equipmentIds.map((id) =>
        base44.entities.WorkOrder.filter({ equipment_id: id }).catch(() => [])
      )
    )
      .then((all) => {
        const flat = all.flat();
        flat.sort(
          (a, b) =>
            new Date(b.created_date || 0).getTime() - new Date(a.created_date || 0).getTime()
        );
        setWorkOrders(flat);
      })
      .finally(() => setLoading(false));
  }, [equipmentIds.join(',')]);

  if (loading) {
    return <Card className="p-6 text-center text-sm text-slate-500">Loading work orders...</Card>;
  }

  if (!workOrders.length) {
    return (
      <Card className="p-6 text-center text-sm text-slate-500">
        No work orders yet for the assets in this project.
      </Card>
    );
  }

  return (
    <Card className="divide-y divide-slate-100">
      {workOrders.map((wo) => {
        const statusClass = STATUS_COLORS[wo.status] || STATUS_COLORS.draft;
        return (
          <div key={wo.id} className="flex items-center justify-between gap-3 p-3">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                <Wrench className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold text-slate-900 truncate">{wo.title}</div>
                <div className="text-[11px] text-slate-500 truncate">
                  {wo.work_order_number || wo.id?.slice(0, 8)} · {wo.type}
                  {wo.assigned_to && ` · ${wo.assigned_to}`}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <div className="text-right">
                <div className="text-xs font-semibold text-slate-900 tabular-nums">
                  {formatCurrency(wo.actual_total_cost || wo.estimated_cost || 0)}
                </div>
                <div className="text-[10px] text-slate-500">
                  {wo.actual_total_cost ? 'Actual' : 'Estimated'}
                </div>
              </div>
              <Badge className={`${statusClass} border-0 text-[10px] font-semibold`}>
                {(wo.status || 'draft').replace('_', ' ')}
              </Badge>
            </div>
          </div>
        );
      })}
    </Card>
  );
}