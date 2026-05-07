import React from 'react';
import { Package, AlertTriangle, ShoppingCart, DollarSign } from 'lucide-react';

export default function InventoryStats({ parts }) {
  const totalParts = parts.length;
  const lowStock = parts.filter(p => p.quantity_in_stock <= (p.minimum_stock_level || 0)).length;
  const outOfStock = parts.filter(p => p.quantity_in_stock === 0).length;
  const totalValue = parts.reduce((s, p) => s + (p.quantity_in_stock || 0) * (p.unit_cost || 0), 0);

  const stats = [
    { label: 'Active SKUs', value: totalParts, icon: Package, color: 'text-slate-900' },
    { label: 'Low stock', value: lowStock, icon: AlertTriangle, color: 'text-amber-600' },
    { label: 'Out of stock', value: outOfStock, icon: ShoppingCart, color: 'text-rose-600' },
    { label: 'Inventory value', value: `$${(totalValue / 1000).toFixed(1)}k`, icon: DollarSign, color: 'text-emerald-600' },
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