import React, { useState, useMemo, useEffect } from 'react';
import { secureEntity } from '@/lib/secureEntities';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Loader2, FlaskConical } from 'lucide-react';
import { projectBacklog } from '@/lib/optimiser';
import { fmtMoney } from '@/lib/assetMetrics';
import FinanceNav from '@/components/finance/FinanceNav';
import FinanceHeader from '@/components/finance/FinanceHeader';
import SavedScenariosPanel from '@/components/scenarios/SavedScenariosPanel';
import { ResponsiveContainer, ComposedChart, XAxis, YAxis, Tooltip, Bar, Line, Legend, CartesianGrid } from 'recharts';

export default function ScenarioModeller() {
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [annualBudget, setAnnualBudget] = useState(500000);
  const [inflation, setInflation] = useState(3);
  const [deferralRate, setDeferralRate] = useState(0);
  const [climateStress, setClimateStress] = useState(100);

  useEffect(() => {
    (async () => {
      const all = [];
      let page = 0;
      while (true) {
        const batch = await secureEntity('Equipment').list('-created_date', 200, page * 200);
        all.push(...batch);
        if (batch.length < 200) break;
        page++;
        if (page > 20) break;
      }
      setEquipment(all);
      setLoading(false);
    })();
  }, []);

  const baseline = useMemo(() => projectBacklog({
    equipment, annualBudget: 500000, inflation: 0.03, deferralRate: 0, climateStress: 1.0,
  }), [equipment]);

  const scenario = useMemo(() => projectBacklog({
    equipment,
    annualBudget,
    inflation: inflation / 100,
    deferralRate: deferralRate / 100,
    climateStress: climateStress / 100,
  }), [equipment, annualBudget, inflation, deferralRate, climateStress]);

  const chartData = scenario.map((s, i) => ({
    year: s.year,
    backlog: s.backlog,
    spent: s.spent,
    baseline: baseline[i]?.backlog || 0,
  }));

  const finalBacklog = scenario[scenario.length - 1]?.backlog || 0;
  const baselineFinal = baseline[baseline.length - 1]?.backlog || 0;
  const delta = finalBacklog - baselineFinal;

  if (loading) return <div className="p-6 flex items-center gap-2 text-slate-500"><Loader2 className="w-4 h-4 animate-spin" /> Loading…</div>;

  return (
    <div className="p-4 md:p-6 max-w-[1480px] mx-auto">
      <FinanceHeader
        icon={FlaskConical}
        title="What-If Scenario Modeller"
        subtitle="Adjust budget, inflation, deferrals, and climate stress to see the 10-year backlog curve shift."
        accent="purple"
      />
      <FinanceNav />

      <Card className="p-5 mb-5">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          <div>
            <label className="text-xs font-semibold text-slate-600 uppercase">Annual Budget</label>
            <div className="text-xl font-bold tabular-nums mt-1">{fmtMoney(annualBudget)}</div>
            <Slider value={[annualBudget]} min={100000} max={5000000} step={50000}
              onValueChange={([v]) => setAnnualBudget(v)} className="mt-3" />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 uppercase">Inflation</label>
            <div className="text-xl font-bold tabular-nums mt-1">{inflation}%</div>
            <Slider value={[inflation]} min={0} max={10} step={0.5}
              onValueChange={([v]) => setInflation(v)} className="mt-3" />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 uppercase">Deferral Rate</label>
            <div className="text-xl font-bold tabular-nums mt-1">{deferralRate}%</div>
            <Slider value={[deferralRate]} min={0} max={50} step={5}
              onValueChange={([v]) => setDeferralRate(v)} className="mt-3" />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 uppercase">Climate Stress</label>
            <div className="text-xl font-bold tabular-nums mt-1">{climateStress}%</div>
            <Slider value={[climateStress]} min={80} max={200} step={5}
              onValueChange={([v]) => setClimateStress(v)} className="mt-3" />
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <Card className="p-4">
          <div className="text-xs text-slate-500 uppercase">Final Backlog</div>
          <div className="text-2xl font-bold text-amber-600 tabular-nums">{fmtMoney(finalBacklog)}</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-slate-500 uppercase">vs Baseline</div>
          <div className={`text-2xl font-bold tabular-nums ${delta > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
            {delta > 0 ? '+' : ''}{fmtMoney(delta)}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-slate-500 uppercase">Total 10yr Spend</div>
          <div className="text-2xl font-bold text-indigo-600 tabular-nums">
            {fmtMoney(scenario.reduce((s, p) => s + p.spent, 0))}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-slate-500 uppercase">Renewals Done</div>
          <div className="text-2xl font-bold tabular-nums">
            {scenario.reduce((s, p) => s + p.renewed, 0)}
          </div>
        </Card>
      </div>

      <div className="mb-5">
        <SavedScenariosPanel
          current={{ annualBudget, inflation, deferralRate, climateStress, finalBacklog, delta }}
          onLoad={(s) => {
            setAnnualBudget(s.annual_budget);
            setInflation(s.inflation_pct);
            setDeferralRate(s.deferral_pct);
            setClimateStress(s.climate_stress_pct);
          }}
        />
      </div>

      <Card className="p-5">
        <h3 className="font-bold text-slate-900 mb-4">10-Year Backlog Projection</h3>
        <div className="h-[420px]">
          <ResponsiveContainer>
            <ComposedChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="year" />
              <YAxis tickFormatter={(v) => fmtMoney(v)} />
              <Tooltip formatter={(v) => fmtMoney(v)} />
              <Legend />
              <Bar dataKey="spent" fill="#10b981" name="Spent" />
              <Bar dataKey="backlog" fill="#f59e0b" name="Unfunded backlog" />
              <Line type="monotone" dataKey="baseline" stroke="#64748b" name="Baseline backlog" strokeDasharray="4 4" dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}