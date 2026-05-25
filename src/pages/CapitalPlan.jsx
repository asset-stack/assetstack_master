import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Calendar, Download } from 'lucide-react';
import { secureEntity } from '@/lib/secureEntities';
import CapitalPlanStats from '@/components/capital-plan/CapitalPlanStats';
import SpendByYearChart from '@/components/capital-plan/SpendByYearChart';
import RiskMatrix from '@/components/capital-plan/RiskMatrix';
import CapitalPlanTable from '@/components/capital-plan/CapitalPlanTable';
import CapitalPlanFormDialog from '@/components/capital-plan/CapitalPlanFormDialog';
import FinanceNav from '@/components/finance/FinanceNav';
import FinanceHeader from '@/components/finance/FinanceHeader';
import { exportFinanceCSV } from '@/components/finance/exportFinanceCSV';

export default function CapitalPlanPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [editing, setEditing] = useState(null);
  const [formOpen, setFormOpen] = useState(false);

  const load = async () => {
    setLoading(true);
    const data = await secureEntity('CapitalPlanItem').list('replacement_year', 200);
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
      <FinanceHeader
        icon={Calendar}
        title="Capital Plan"
        subtitle="Forward-looking asset replacement planning, risk-prioritised and FY-budgeted."
        accent="slate"
        actions={
          <>
            <Button
              variant="outline"
              onClick={() => {
                const consMult = { minor: 1.2, moderate: 1.6, major: 2.4, catastrophic: 3.5 };
                const likeMult = { unlikely: 0.3, possible: 0.6, likely: 1.0, almost_certain: 1.3 };
                const rows = filtered.map((i) => ({
                  Asset: i.equipment_name,
                  Type: i.asset_type,
                  Location: i.location_name,
                  ReplacementYear: i.replacement_year,
                  ReplacementCost: i.replacement_cost,
                  DoNothingCost: Math.round(
                    (i.replacement_cost || 0)
                    * (consMult[i.consequence_of_failure] ?? 1.6)
                    * (likeMult[i.likelihood_of_failure] ?? 0.6)
                  ),
                  CurrentBookValue: i.current_book_value,
                  ConditionScore: i.condition_score,
                  RiskScore: i.risk_score,
                  Priority: i.priority,
                  Status: i.status,
                  FundingSource: i.funding_source,
                }));
                exportFinanceCSV(`capital-plan-${Date.now()}.csv`, rows);
              }}
            >
              <Download className="w-4 h-4 mr-1" /> Export plan
            </Button>
            <Button onClick={() => { setEditing(null); setFormOpen(true); }}>
              <Plus className="w-4 h-4 mr-1" /> Add to plan
            </Button>
          </>
        }
      />

      <FinanceNav />

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