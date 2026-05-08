import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  Banknote, AlertOctagon, Target, FlaskConical, Wallet, CalendarDays,
  TrendingUp, ArrowRight, Loader2, Sparkles
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import FinanceNav from '@/components/finance/FinanceNav';
import FinanceHeader from '@/components/finance/FinanceHeader';
import { deriveCRC, deriveWDV, deriveDefectUrgency, fmtMoney } from '@/lib/assetMetrics';

export default function Finance() {
  const { data: equipment = [], isLoading: loadingEq } = useQuery({
    queryKey: ['equipment-finance-summary'],
    queryFn: async () => {
      const all = [];
      for (let p = 0; p < 20; p++) {
        const batch = await base44.entities.Equipment.list('-created_date', 500, p * 500);
        if (!batch?.length) break;
        all.push(...batch);
        if (batch.length < 500) break;
      }
      return all;
    },
  });

  const { data: budgets = [] } = useQuery({
    queryKey: ['budgets-finance-summary'],
    queryFn: () => base44.entities.Budget.list('-created_date', 100),
  });

  const { data: capitalItems = [] } = useQuery({
    queryKey: ['capital-finance-summary'],
    queryFn: () => base44.entities.CapitalPlanItem.list('replacement_year', 200),
  });

  const totals = useMemo(() => {
    let crc = 0, wdv = 0, defects = 0, defectCost = 0, urgentDefects = 0;
    for (const e of equipment) {
      const c = deriveCRC(e);
      crc += c;
      wdv += deriveWDV(e);
      const u = deriveDefectUrgency(e);
      if (u) {
        defects++;
        defectCost += Number(e?.specifications?.defect_cost) || c * 0.2;
        if (u === 'High') urgentDefects++;
      }
    }
    const allocated = budgets.reduce((s, b) => s + (b.allocated_amount || 0), 0);
    const spent = budgets.reduce((s, b) => s + (b.spent_amount || 0), 0);
    const capitalSpend = capitalItems.reduce((s, i) => s + (i.replacement_cost || 0), 0);
    return { crc, wdv, defects, defectCost, urgentDefects, allocated, spent, capitalSpend };
  }, [equipment, budgets, capitalItems]);

  const cards = [
    {
      to: '/Valuation',
      icon: Banknote,
      accent: 'indigo',
      title: 'Asset Valuation',
      desc: 'Replacement cost, written-down value, 10-year renewal forecast.',
      stat: fmtMoney(totals.crc),
      statLabel: 'Total replacement cost',
      sub: `WDV ${fmtMoney(totals.wdv)}`,
    },
    {
      to: '/DefectBacklog',
      icon: AlertOctagon,
      accent: 'rose',
      title: 'Defect Backlog',
      desc: 'Outstanding defects ranked by urgency, with estimated remediation cost.',
      stat: totals.defects.toLocaleString(),
      statLabel: 'Defects logged',
      sub: `${totals.urgentDefects} high · ${fmtMoney(totals.defectCost)}`,
    },
    {
      to: '/FundingOptimiser',
      icon: Target,
      accent: 'emerald',
      title: 'Funding Optimiser',
      desc: 'Pick the highest risk-reduction-per-dollar renewals for any budget.',
      stat: fmtMoney(500000),
      statLabel: 'Default budget',
      sub: 'AI-prioritised',
    },
    {
      to: '/ScenarioModeller',
      icon: FlaskConical,
      accent: 'purple',
      title: 'Scenario Modeller',
      desc: 'Stress-test 10 years of budget, inflation, deferral and climate impact.',
      stat: '10y',
      statLabel: 'Projection horizon',
      sub: 'What-if analysis',
    },
    {
      to: '/CostCenter',
      icon: Wallet,
      accent: 'amber',
      title: 'Cost & Budget Center',
      desc: 'Budget vs actual, P&L roll-ups and forecasted spend.',
      stat: fmtMoney(totals.allocated),
      statLabel: 'Allocated',
      sub: `Spent ${fmtMoney(totals.spent)}`,
    },
    {
      to: '/CapitalPlan',
      icon: CalendarDays,
      accent: 'slate',
      title: 'Capital Plan',
      desc: 'Forward-looking replacement plan, risk-prioritised and FY-budgeted.',
      stat: capitalItems.length.toString(),
      statLabel: 'Plan items',
      sub: fmtMoney(totals.capitalSpend),
    },
  ];

  const tones = {
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-100',
    rose: 'bg-rose-50 text-rose-700 border-rose-100',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    purple: 'bg-purple-50 text-purple-700 border-purple-100',
    amber: 'bg-amber-50 text-amber-700 border-amber-100',
    slate: 'bg-slate-50 text-slate-700 border-slate-100',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1480px] mx-auto px-4 sm:px-6 py-6">
        <FinanceHeader
          icon={TrendingUp}
          title="Finance"
          subtitle="Asset valuation, backlog, capital planning and budgets — all in one place."
          accent="indigo"
        />

        <FinanceNav />

        {loadingEq ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
            Aggregating portfolio finances…
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
              <KpiCard label="Replacement value" value={fmtMoney(totals.crc)} sub="Total CRC" tone="indigo" />
              <KpiCard label="Written-down value" value={fmtMoney(totals.wdv)} sub={`${totals.crc > 0 ? Math.round((totals.wdv / totals.crc) * 100) : 0}% of CRC`} tone="emerald" />
              <KpiCard label="Defect exposure" value={fmtMoney(totals.defectCost)} sub={`${totals.defects} defects`} tone="rose" />
              <KpiCard label="Budget allocated" value={fmtMoney(totals.allocated)} sub={`Spent ${fmtMoney(totals.spent)}`} tone="amber" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {cards.map((c) => (
                <Link
                  key={c.to}
                  to={c.to}
                  className="group bg-white rounded-xl border border-slate-200 p-5 hover:shadow-lg hover:border-indigo-200 transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-10 h-10 rounded-lg border flex items-center justify-center ${tones[c.accent]}`}>
                      <c.icon className="w-5 h-5" />
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <h3 className="font-semibold text-slate-900 text-base">{c.title}</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{c.desc}</p>
                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">{c.statLabel}</div>
                    <div className="flex items-baseline gap-2 mt-0.5">
                      <span className="text-xl font-bold text-slate-900 tabular-nums">{c.stat}</span>
                      <span className="text-[11px] text-slate-400">{c.sub}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <div className="mt-5 bg-gradient-to-br from-indigo-50 via-white to-violet-50 border border-indigo-100 rounded-xl p-5 flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-white border border-indigo-100 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5 text-indigo-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-slate-900 text-sm">Need a recommendation?</h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  Run the Funding Optimiser with your annual budget — it picks the highest risk-reduction-per-dollar renewals automatically.
                </p>
              </div>
              <Link
                to="/FundingOptimiser"
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-[12px] font-semibold px-3 py-2 rounded-lg whitespace-nowrap transition-colors"
              >
                Open Optimiser →
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function KpiCard({ label, value, sub, tone = 'slate' }) {
  const tones = {
    indigo: 'border-indigo-100',
    emerald: 'border-emerald-100',
    rose: 'border-rose-100',
    amber: 'border-amber-100',
    slate: 'border-slate-200',
  };
  return (
    <div className={`bg-white rounded-xl border p-4 ${tones[tone] || tones.slate}`}>
      <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">{label}</div>
      <div className="text-2xl font-bold text-slate-900 tabular-nums mt-1">{value}</div>
      <div className="text-[11px] text-slate-400 mt-0.5">{sub}</div>
    </div>
  );
}