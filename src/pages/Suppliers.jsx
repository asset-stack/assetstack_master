import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Building2, Search } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import SupplierStats from '@/components/suppliers/SupplierStats';
import SupplierCard from '@/components/suppliers/SupplierCard';
import SupplierFormDialog from '@/components/suppliers/SupplierFormDialog';

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [editing, setEditing] = useState(null);
  const [formOpen, setFormOpen] = useState(false);

  const load = async () => {
    setLoading(true);
    const data = await base44.entities.Supplier.list('-rating', 200);
    setSuppliers(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = suppliers.filter(s => {
    if (search && !`${s.name} ${s.contact_name || ''} ${s.contact_email || ''}`.toLowerCase().includes(search.toLowerCase())) return false;
    if (filter === 'preferred') return s.preferred;
    if (filter === 'active') return s.status === 'active';
    if (filter !== 'all') return s.category === filter;
    return true;
  });

  const filters = [
    { id: 'all', label: 'All' },
    { id: 'active', label: 'Active' },
    { id: 'preferred', label: 'Preferred' },
    { id: 'parts', label: 'Parts' },
    { id: 'service', label: 'Service' },
    { id: 'oem', label: 'OEM' },
  ];

  return (
    <div className="p-6 max-w-[1480px] mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 flex items-center gap-2">
            <Building2 className="w-7 h-7 text-slate-700" /> Suppliers & Vendors
          </h1>
          <p className="text-sm text-slate-500 mt-1">Manage parts vendors, OEMs, and service providers with SLAs and performance metrics.</p>
        </div>
        <Button onClick={() => { setEditing(null); setFormOpen(true); }}>
          <Plus className="w-4 h-4 mr-1" /> Add supplier
        </Button>
      </div>

      <SupplierStats suppliers={suppliers} />

      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <Input placeholder="Search suppliers…" value={search} onChange={e => setSearch(e.target.value)} className="pl-8 h-9" />
        </div>
        <div className="flex gap-1 flex-wrap">
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

      {loading ? (
        <div className="bg-white border border-slate-200 rounded-xl p-10 text-center text-slate-400 text-sm">Loading…</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-10 text-center">
          <Building2 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-sm text-slate-500">No suppliers match.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map(s => (
            <SupplierCard
              key={s.id}
              supplier={s}
              onEdit={(sup) => { setEditing(sup); setFormOpen(true); }}
            />
          ))}
        </div>
      )}

      <SupplierFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        supplier={editing}
        onSaved={load}
      />
    </div>
  );
}