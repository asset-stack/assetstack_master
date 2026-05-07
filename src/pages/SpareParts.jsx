import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Package, ShoppingCart } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import InventoryStats from '@/components/inventory/InventoryStats';
import SparePartRow from '@/components/inventory/SparePartRow';
import SparePartFormDialog from '@/components/inventory/SparePartFormDialog';
import PurchaseOrdersList from '@/components/inventory/PurchaseOrdersList';

export default function SparePartsPage() {
  const [parts, setParts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [editing, setEditing] = useState(null);
  const [formOpen, setFormOpen] = useState(false);

  const load = async () => {
    setLoading(true);
    const [p, o] = await Promise.all([
      base44.entities.SparePart.list('-updated_date', 200),
      base44.entities.PurchaseOrder.list('-created_date', 20),
    ]);
    setParts(p);
    setOrders(o);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = parts.filter(p => {
    if (search && !`${p.name} ${p.part_number} ${p.supplier || ''}`.toLowerCase().includes(search.toLowerCase())) return false;
    if (filter === 'low') return (p.quantity_in_stock || 0) <= (p.minimum_stock_level || 0);
    if (filter === 'out') return (p.quantity_in_stock || 0) === 0;
    if (filter === 'critical') return p.criticality === 'critical' || p.criticality === 'high';
    return true;
  });

  const reorder = async (part) => {
    const qty = part.reorder_quantity || (part.minimum_stock_level || 1) * 2;
    const total = qty * (part.unit_cost || 0);
    await base44.entities.PurchaseOrder.create({
      po_number: `PO-${Date.now().toString().slice(-6)}`,
      supplier_name: part.supplier || 'Unspecified supplier',
      trigger_source: 'auto_reorder',
      line_items: [{
        spare_part_id: part.id,
        part_number: part.part_number,
        name: part.name,
        quantity: qty,
        unit_cost: part.unit_cost || 0,
        line_total: total,
      }],
      subtotal: total,
      total,
      status: 'pending_approval',
      currency: 'USD',
    });
    load();
  };

  const filters = [
    { id: 'all', label: 'All' },
    { id: 'low', label: 'Low stock' },
    { id: 'out', label: 'Out of stock' },
    { id: 'critical', label: 'Critical' },
  ];

  return (
    <div className="p-6 max-w-[1480px] mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 flex items-center gap-2">
            <Package className="w-7 h-7 text-slate-700" /> Spare Parts Inventory
          </h1>
          <p className="text-sm text-slate-500 mt-1">Stock levels, reorder points, suppliers, and purchase orders.</p>
        </div>
        <Button onClick={() => { setEditing(null); setFormOpen(true); }}>
          <Plus className="w-4 h-4 mr-1" /> Add part
        </Button>
      </div>

      <InventoryStats parts={parts} />

      <div className="grid lg:grid-cols-[1fr_360px] gap-6">
        <div>
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <Input placeholder="Search parts…" value={search} onChange={e => setSearch(e.target.value)} className="pl-8 h-9" />
            </div>
            <div className="flex gap-1">
              {filters.map(f => (
                <Button
                  key={f.id}
                  size="sm"
                  variant={filter === f.id ? 'default' : 'outline'}
                  onClick={() => setFilter(f.id)}
                  className="h-9 text-[12px]"
                >
                  {f.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-100 text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
                <tr>
                  <th className="text-left px-4 py-2.5">Part</th>
                  <th className="text-left px-3 py-2.5">Category</th>
                  <th className="text-left px-3 py-2.5">Stock</th>
                  <th className="text-left px-3 py-2.5">Unit cost</th>
                  <th className="text-left px-3 py-2.5">Value</th>
                  <th className="text-left px-3 py-2.5">Supplier</th>
                  <th className="text-left px-3 py-2.5">Status</th>
                  <th className="px-4 py-2.5"></th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={8} className="text-center py-10 text-slate-400 text-sm">Loading…</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={8} className="text-center py-10 text-slate-400 text-sm">No parts match.</td></tr>
                ) : filtered.map(p => (
                  <SparePartRow
                    key={p.id}
                    part={p}
                    onEdit={(part) => { setEditing(part); setFormOpen(true); }}
                    onReorder={reorder}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <PurchaseOrdersList orders={orders} />
      </div>

      <SparePartFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        part={editing}
        onSaved={load}
      />
    </div>
  );
}