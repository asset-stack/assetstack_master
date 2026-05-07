import React from 'react';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Edit, Package } from 'lucide-react';

export default function SparePartRow({ part, onEdit, onReorder }) {
  const stock = part.quantity_in_stock || 0;
  const min = part.minimum_stock_level || 0;
  const isLow = stock <= min;
  const isOut = stock === 0;
  const stockPct = min > 0 ? Math.min(100, (stock / (min * 2)) * 100) : 100;

  const statusColor = isOut ? 'bg-rose-100 text-rose-700'
    : isLow ? 'bg-amber-100 text-amber-700'
    : 'bg-emerald-100 text-emerald-700';
  const statusLabel = isOut ? 'Out of stock' : isLow ? 'Low stock' : 'In stock';

  return (
    <tr className="border-t border-slate-100 hover:bg-slate-50/60">
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-md bg-slate-100 flex items-center justify-center text-slate-500">
            <Package className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <div className="font-mono text-[10px] text-slate-500">{part.part_number}</div>
            <div className="text-[13px] font-semibold text-slate-900 truncate">{part.name}</div>
          </div>
        </div>
      </td>
      <td className="px-3 py-3 text-[12px] text-slate-600 capitalize">{part.category}</td>
      <td className="px-3 py-3">
        <div className="flex items-center gap-2">
          <div className="text-[13px] font-semibold tabular-nums text-slate-900">
            {stock} <span className="text-[10px] text-slate-500">/ min {min}</span>
          </div>
        </div>
        <div className="mt-1 w-24 h-1 rounded-full bg-slate-100 overflow-hidden">
          <div
            className={`h-full rounded-full ${isOut ? 'bg-rose-500' : isLow ? 'bg-amber-500' : 'bg-emerald-500'}`}
            style={{ width: `${stockPct}%` }}
          />
        </div>
      </td>
      <td className="px-3 py-3 text-[12px] tabular-nums text-slate-700">${(part.unit_cost || 0).toFixed(2)}</td>
      <td className="px-3 py-3 text-[12px] tabular-nums font-semibold text-slate-900">
        ${((stock * (part.unit_cost || 0))).toLocaleString()}
      </td>
      <td className="px-3 py-3 text-[12px] text-slate-600">{part.supplier || '—'}</td>
      <td className="px-3 py-3">
        <span className={`text-[9px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded ${statusColor}`}>
          {statusLabel}
        </span>
      </td>
      <td className="px-4 py-3 text-right">
        <div className="flex items-center justify-end gap-1">
          {isLow && (
            <Button size="sm" variant="default" onClick={() => onReorder?.(part)} className="h-7 text-[11px]">
              <ShoppingCart className="w-3 h-3 mr-1" /> Reorder
            </Button>
          )}
          <Button size="icon" variant="ghost" onClick={() => onEdit?.(part)} className="h-7 w-7">
            <Edit className="w-3 h-3" />
          </Button>
        </div>
      </td>
    </tr>
  );
}