import React, { useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, ShieldCheck, Loader2 } from 'lucide-react';

import SavingsHero from '@/components/savings/SavingsHero';
import SavingsStats from '@/components/savings/SavingsStats';
import SavingsEntryRow from '@/components/savings/SavingsEntryRow';
import AddSavingsEntryDialog from '@/components/savings/AddSavingsEntryDialog';

export default function SavingsLedger() {
  const [filter, setFilter] = useState('all');
  const [addOpen, setAddOpen] = useState(false);
  const qc = useQueryClient();

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ['savingsLedger'],
    queryFn: () => base44.entities.SavingsLedgerEntry.list('-created_date', 200),
  });

  const { data: equipment = [] } = useQuery({
    queryKey: ['equipmentForSavings'],
    queryFn: () => base44.entities.Equipment.list('-created_date', 200),
  });

  const filtered = useMemo(() => {
    if (filter === 'all') return entries;
    if (filter === 'pending') return entries.filter((e) => ['projected', 'in_progress'].includes(e.status));
    return entries.filter((e) => e.status === filter);
  }, [entries, filter]);

  const refresh = () => qc.invalidateQueries({ queryKey: ['savingsLedger'] });

  return (
    <div className="p-4 md:p-6 max-w-[1400px] mx-auto">
      <SavingsHero />

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-5">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            Audited ROI Trail
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Each entry traces predicted cost → intervention → verified outcome.
          </p>
        </div>
        <Button onClick={() => setAddOpen(true)} className="bg-emerald-600 hover:bg-emerald-700">
          <Plus className="w-4 h-4 mr-1.5" /> New Entry
        </Button>
      </div>

      <SavingsStats entries={entries} />

      <Tabs value={filter} onValueChange={setFilter} className="mb-4">
        <TabsList>
          <TabsTrigger value="all">All ({entries.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="verified">Verified</TabsTrigger>
          <TabsTrigger value="disputed">Disputed</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading ? (
        <div className="flex items-center gap-2 text-sm text-slate-500 py-12 justify-center">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading ledger…
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl bg-slate-50 border-2 border-dashed border-slate-200 p-10 text-center">
          <ShieldCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-700 font-medium">No entries here yet</p>
          <p className="text-sm text-slate-500 mb-4">
            Log your first prediction → intervention → savings cycle to start building the ledger.
          </p>
          <Button onClick={() => setAddOpen(true)} className="bg-emerald-600 hover:bg-emerald-700">
            <Plus className="w-4 h-4 mr-1.5" /> Add First Entry
          </Button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((entry) => (
            <SavingsEntryRow key={entry.id} entry={entry} onUpdated={refresh} />
          ))}
        </div>
      )}

      <AddSavingsEntryDialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onCreated={refresh}
        equipment={equipment}
      />
    </div>
  );
}