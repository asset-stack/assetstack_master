import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Wallet, Download } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import BudgetStats from '@/components/cost-center/BudgetStats';
import BudgetTable from '@/components/cost-center/BudgetTable';
import CostBreakdownChart from '@/components/cost-center/CostBreakdownChart';
import BudgetFormDialog from '@/components/cost-center/BudgetFormDialog';
import FinanceNav from '@/components/finance/FinanceNav';
import FinanceHeader from '@/components/finance/FinanceHeader';
import { exportFinanceCSV } from '@/components/finance/exportFinanceCSV';

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
      <FinanceHeader
        icon={Wallet}
        title="Cost & Budget Center"
        subtitle="Budget vs actual, P&L roll-ups, and forecasted spend across your portfolio."
        accent="amber"
        actions={
          <>
            <Button
              variant="outline"
              onClick={() => {
                const rows = budgets.map((b) => ({
                  Name: b.name,
                  FiscalYear: b.fiscal_year,
                  Scope: b.scope_type,
                  ScopeName: b.scope_name || '',
                  Category: b.category,
                  Allocated: b.allocated_amount || 0,
                  Spent: b.spent_amount || 0,
                  Committed: b.committed_amount || 0,
                  Remaining: (b.allocated_amount || 0) - (b.spent_amount || 0) - (b.committed_amount || 0),
                  Currency: b.currency || 'USD',
                  Status: b.status,
                }));
                exportFinanceCSV(`budgets-${Date.now()}.csv`, rows);
              }}
            >
              <Download className="w-4 h-4 mr-1" /> Export
            </Button>
            <Button onClick={() => { setEditing(null); setFormOpen(true); }}>
              <Plus className="w-4 h-4 mr-1" /> New budget
            </Button>
          </>
        }
      />

      <FinanceNav />

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