import React, { useState, useMemo, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Wallet, TrendingDown, Target, Sparkles, Loader2, Download } from 'lucide-react';
import { optimiseRenewals } from '@/lib/optimiser';
import { fmtMoney } from '@/lib/assetMetrics';

export default function FundingOptimiser() {
  const [equipment, setEquipment] = useState([]);
  const [budget, setBudget] = useState(500000);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const all = [];
      let page = 0;
      while (true) {
        const batch = await base44.entities.Equipment.list('-created_date', 200, page * 200);
        all.push(...batch);
        if (batch.length < 200) break;
        page++;
        if (page > 20) break;
      }
      setEquipment(all);
      setLoading(false);
    })();
  }, []);

  const result = useMemo(() => optimiseRenewals(equipment, budget), [equipment, budget]);

  const presetBudgets = [250000, 500000, 1000000, 2500000];

  const exportPlan = () => {
    const rows = [['Asset', 'Location', 'Component', 'CRC', 'Risk', 'Condition', 'Life Consumed']];
    result.selected.forEach((s) => {
      rows.push([
        s.equipment.name,
        s.equipment.location,
        s.equipment.specifications?.component_type || '',
        s.cost,
        s.risk,
        `C${s.conditionGrade}`,
        Math.round(s.lifeConsumed * 100) + '%',
      ]);
    });
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `funding-plan-${budget}.csv`;
    a.click();
  };

  if (loading) return <div className="p-6 flex items-center gap-2 text-slate-500"><Loader2 className="w-4 h-4 animate-spin" /> Loading…</div>;

  return (
    <div className="p-4 md:p-6 max-w-[1480px] mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 flex items-center gap-2">
          <Target className="w-7 h-7 text-indigo-600" /> Funding Optimiser
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Given a budget, the optimiser picks the highest risk-reduction-per-dollar renewals.
        </p>
      </div>

      <Card className="p-5 mb-5">
        <div className="flex flex-col md:flex-row md:items-end gap-4">
          <div className="flex-1">
            <label className="text-xs font-semibold text-slate-600 uppercase">Budget (AUD)</label>
            <Input
              type="number"
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value) || 0)}
              className="text-2xl font-bold h-14 mt-1 tabular-nums"
            />
            <div className="flex gap-2 mt-2">
              {presetBudgets.map((b) => (
                <Button key={b} variant="outline" size="sm" onClick={() => setBudget(b)}>
                  {fmtMoney(b)}
                </Button>
              ))}
            </div>
          </div>
          <Button onClick={exportPlan} disabled={!result.selected.length} className="bg-indigo-600 hover:bg-indigo-700">
            <Download className="w-4 h-4 mr-2" /> Export Plan
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <Card className="p-4">
          <div className="text-xs text-slate-500 uppercase">Selected</div>
          <div className="text-2xl font-bold tabular-nums">{result.selected.length}</div>
          <div className="text-[11px] text-slate-400">of {result.candidateCount} eligible</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-slate-500 uppercase">Spend</div>
          <div className="text-2xl font-bold text-emerald-600 tabular-nums">{fmtMoney(result.spend)}</div>
          <div className="text-[11px] text-slate-400">{result.utilisation.toFixed(1)}% of budget</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-slate-500 uppercase">Risk Reduction</div>
          <div className="text-2xl font-bold text-indigo-600 tabular-nums">{Math.round(result.totalRiskReduction)}</div>
          <div className="text-[11px] text-slate-400">composite points</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-slate-500 uppercase">Deferred</div>
          <div className="text-2xl font-bold text-amber-600 tabular-nums">{result.deferred.length}</div>
          <div className="text-[11px] text-slate-400">over budget</div>
        </Card>
      </div>

      {result.spend > 0 && (
        <Card className="p-4 mb-5 bg-gradient-to-r from-indigo-50 to-emerald-50 border-indigo-100">
          <div className="text-xs uppercase tracking-wider text-indigo-700 font-semibold mb-1">Optimiser efficiency</div>
          <div className="text-sm text-slate-700">
            Each dollar spent buys{' '}
            <span className="font-bold text-indigo-700 tabular-nums">
              {(result.totalRiskReduction / result.spend * 1000).toFixed(2)}
            </span>{' '}
            risk-reduction points per $1k — versus{' '}
            <span className="font-bold text-slate-500 tabular-nums">
              {result.candidateCount > 0
                ? (result.deferred.reduce((s, d) => s + d.riskReduction, 0) /
                    Math.max(1, result.deferred.reduce((s, d) => s + d.cost, 0)) * 1000).toFixed(2)
                : '0'}
            </span>{' '}
            for the deferred pool.
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card className="p-4">
          <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600" /> Recommended Renewals
          </h3>
          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
            {result.selected.slice(0, 50).map((s) => (
              <div key={s.equipment.id} className="flex items-center justify-between p-3 bg-emerald-50/50 rounded-lg border border-emerald-100">
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-slate-900 truncate">{s.equipment.name}</div>
                  <div className="text-xs text-slate-500 truncate">{s.equipment.location} · C{s.conditionGrade} · {Math.round(s.lifeConsumed * 100)}% life</div>
                </div>
                <div className="text-right ml-3">
                  <div className="text-sm font-bold tabular-nums">{fmtMoney(s.cost)}</div>
                  <Badge variant="outline" className="text-[10px]">{s.risk}</Badge>
                </div>
              </div>
            ))}
            {result.selected.length === 0 && <div className="text-center py-8 text-slate-400 text-sm">Increase the budget to see recommendations</div>}
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-amber-600" /> Deferred (over budget)
          </h3>
          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
            {result.deferred.slice(0, 50).map((s) => (
              <div key={s.equipment.id} className="flex items-center justify-between p-3 bg-amber-50/30 rounded-lg border border-amber-100">
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-slate-900 truncate">{s.equipment.name}</div>
                  <div className="text-xs text-slate-500 truncate">{s.equipment.location}</div>
                </div>
                <div className="text-right ml-3">
                  <div className="text-sm font-bold tabular-nums text-amber-700">{fmtMoney(s.cost)}</div>
                  <Badge variant="outline" className="text-[10px]">{s.risk}</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}