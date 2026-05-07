import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Calendar, Download } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import CapitalPlanStats from '@/components/capital-plan/CapitalPlanStats';
import SpendByYearChart from '@/components/capital-plan/SpendByYearChart';
import RiskMatrix from '@/components/capital-plan/RiskMatrix';
import CapitalPlanTable from '@/components/capital-plan/CapitalPlanTable';
import CapitalPlanFormDialog from '@/components/capital-plan/CapitalPlanFormDialog';

export default function CapitalPlanPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [editing, setEditing] = useState(null);
  const [formOpen, setFormOpen] = useState(false);

  const load = async () => {
    setLoading(true);
    const data = await base44.entities.CapitalPlanItem.list('replacement_year', 200);
    setItems(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = items.filter(i => {
    if (filter === 'all') return true;
    if (filter === 'urgent') return i.priority === 'urgent';
    if (filter === 'this_year') return i.replacement_year === new Date().getFullYear();
    if (filter === 'next_5y') return i.replacement_year && i.replacement_year <= new Date().getFullYear() + 5;
    return i.status === filter;
  });

  const filters = [
    { id: 'all', label: 'All' },
    { id: 'urgent', label: 'Urgent' },
    { id: 'this_year', label: 'This FY' },
    { id: 'next_5y', label: 'Next 5y' },
    { id: 'approved', label: 'Approved' },
    { id: 'proposed', label: 'Proposed' },
  ];

  return (
    <div className="p-6 max-w-[1480px] mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 flex items-center gap-2">
            <Calendar className="w-7 h-7 text-slate-700" /> Capital Plan
          </h1>
          <p className="text-sm text-slate-500 mt-1">Forward-looking asset replacement planning, risk-prioritised and FY-budgeted.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-1" /> Export plan
          </Button>
          <Button onClick={() => { setEditing(null); setFormOpen(true); }}>
            <Plus className="w-4 h-4 mr-1" /> Add to plan
          </Button>
        </div>
      </div>

      <CapitalPlanStats items={items} />

      <div className="grid lg:grid-cols-2 gap-3 mb-6">
        <SpendByYearChart items={items} />
        <RiskMatrix items={items} />
      </div>

      <div className="flex items-center gap-1 mb-3 flex-wrap">
        {filters.map(f => (
          <Button
            key={f.id}
            size="sm"
            variant={filter === f.id ? 'default' : 'outline'}
            onClick={() => setFilter(f.id)}
            className="h-8 text-[12px]"
          >
            {f.label}
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="bg-white border border-slate-200 rounded-xl p-10 text-center text-slate-400 text-sm">Loading…</div>
      ) : (
        <CapitalPlanTable
          items={filtered}
          onEdit={(it) => { setEditing(it); setFormOpen(true); }}
        />
      )}

      <CapitalPlanFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        item={editing}
        onSaved={load}
      />
    </div>
  );
}