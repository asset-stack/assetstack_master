import React from 'react';
import { Package, ChevronRight } from 'lucide-react';

const STATUS_COLOR = {
  draft: 'bg-slate-100 text-slate-700',
  pending_approval: 'bg-amber-100 text-amber-700',
  approved: 'bg-blue-100 text-blue-700',
  ordered: 'bg-indigo-100 text-indigo-700',
  shipped: 'bg-purple-100 text-purple-700',
  received: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-rose-100 text-rose-700',
};

export default function PurchaseOrdersList({ orders }) {
  if (!orders.length) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-10 text-center">
        <Package className="w-8 h-8 text-slate-300 mx-auto mb-2" />
        <p className="text-sm text-slate-500">No purchase orders yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-900">Purchase orders</h3>
        <span className="text-[11px] text-slate-500">{orders.length} active</span>
      </div>
      <div className="divide-y divide-slate-100">
        {orders.map(po => (
          <div key={po.id} className="px-4 py-3 flex items-center hover:bg-slate-50/60">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="font-mono text-[10px] text-slate-500">{po.po_number || `PO-${po.id?.slice(-6)}`}</span>
                <span className={`text-[9px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded ${STATUS_COLOR[po.status] || STATUS_COLOR.draft}`}>
                  {po.status?.replace('_', ' ')}
                </span>
              </div>
              <div className="text-[13px] font-semibold text-slate-900 truncate">{po.supplier_name}</div>
              <div className="text-[10px] text-slate-500">
                {po.line_items?.length || 0} items · {po.expected_delivery_date ? `due ${po.expected_delivery_date}` : 'no ETA'}
              </div>
            </div>
            <div className="text-right shrink-0 ml-3">
              <div className="text-[14px] font-semibold tabular-nums text-slate-900">
                ${(po.total || 0).toLocaleString()}
              </div>
              <div className="text-[10px] text-slate-500">{po.currency || 'USD'}</div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300 ml-2" />
          </div>
        ))}
      </div>
    </div>
  );
}