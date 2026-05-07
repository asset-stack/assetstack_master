import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Wallet, Download } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import BudgetStats from '@/components/cost-center/BudgetStats';
import BudgetTable from '@/components/cost-center/BudgetTable';
import CostBreakdownChart from '@/components/cost-center/CostBreakdownChart';
import BudgetFormDialog from '@/components/cost-center/BudgetFormDialog';

export default function CostCenterPage() {
  const [budgets, setBudgets] = useState([]);
  const [workOrders, setWorkOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [formOpen, setFormOpen] = useState(false);

  const load = async () => {
    setLoading(true);
    const [b, w] = await Promise.all([
      base44.entities.Budget.list('-created_date', 100),
      base44.entities.WorkOrder.list('-actual_end', 200),
    ]);
    setBudgets(b);
    setWorkOrders(w);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="p-6 max-w-[1480px] mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 flex items-center gap-2">
            <Wallet className="w-7 h-7 text-slate-700" /> Cost & Budget Center
          </h1>
          <p className="text-sm text-slate-500 mt-1">Budget vs actual, P&L roll-ups, and forecasted spend across your portfolio.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-1" /> Export
          </Button>
          <Button onClick={() => { setEditing(null); setFormOpen(true); }}>
            <Plus className="w-4 h-4 mr-1" /> New budget
          </Button>
        </div>
      </div>

      <BudgetStats budgets={budgets} workOrders={workOrders} />

      <div className="grid lg:grid-cols-[1fr_360px] gap-6">
        {loading ? (
          <div className="bg-white border border-slate-200 rounded-xl p-10 text-center text-slate-400 text-sm">Loading…</div>
        ) : (
          <BudgetTable
            budgets={budgets}
            onEdit={(b) => { setEditing(b); setFormOpen(true); }}
          />
        )}
        <CostBreakdownChart budgets={budgets} />
      </div>

      <BudgetFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        budget={editing}
        onSaved={load}
      />
    </div>
  );
}