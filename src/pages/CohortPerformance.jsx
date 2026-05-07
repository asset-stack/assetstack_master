import React, { useState, useEffect, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { TrendingUp, Loader2 } from 'lucide-react';
import { ResponsiveContainer, BarChart, XAxis, YAxis, Tooltip, Bar, CartesianGrid, Cell, ReferenceLine } from 'recharts';

export default function CohortPerformance() {
  const [equipment, setEquipment] = useState([]);
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

  const cohorts = useMemo(() => {
    const byType = {};
    for (const eq of equipment) {
      const ct = eq.specifications?.component_type;
      if (!ct) continue;
      const lc = Number(eq.specifications?.life_consumed) || 0;
      const grade = Number(eq.specifications?.condition_grade);
      const baseLife = Number(eq.specifications?.baselife_years);
      if (!byType[ct]) byType[ct] = { type: ct, n: 0, lcSum: 0, gradeSum: 0, gradeN: 0, baseLifeSum: 0, baseLifeN: 0, expectedLcSum: 0, expectedLcN: 0 };
      byType[ct].n++;
      byType[ct].lcSum += lc;
      if (Number.isFinite(grade)) { byType[ct].gradeSum += grade; byType[ct].gradeN++; }
      if (baseLife > 0) {
        byType[ct].baseLifeSum += baseLife;
        byType[ct].baseLifeN++;
        // Expected lc if installed at midpoint of cohort
        const installYears = eq.installation_date ? (Date.now() - new Date(eq.installation_date).getTime()) / (1000 * 60 * 60 * 24 * 365) : null;
        if (installYears != null && installYears > 0) {
          byType[ct].expectedLcSum += Math.min(1, installYears / baseLife);
          byType[ct].expectedLcN++;
        }
      }
    }
    return Object.values(byType)
      .filter((c) => c.n >= 3)
      .map((c) => {
        const avgLc = c.lcSum / c.n;
        const expectedLc = c.expectedLcN > 0 ? c.expectedLcSum / c.expectedLcN : avgLc;
        const variance = avgLc - expectedLc;
        return {
          type: c.type,
          n: c.n,
          avgLifeConsumed: Math.round(avgLc * 100),
          expectedLifeConsumed: Math.round(expectedLc * 100),
          avgGrade: c.gradeN > 0 ? Math.round((c.gradeSum / c.gradeN) * 10) / 10 : null,
          variance: Math.round(variance * 100),
          performance: variance > 0.1 ? 'underperforming' : variance < -0.1 ? 'outperforming' : 'on_track',
        };
      })
      .sort((a, b) => b.variance - a.variance);
  }, [equipment]);

  if (loading) return <div className="p-6 flex items-center gap-2 text-slate-500"><Loader2 className="w-4 h-4 animate-spin" /> Loading…</div>;

  return (
    <div className="p-4 md:p-6 max-w-[1480px] mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 flex items-center gap-2">
          <TrendingUp className="w-7 h-7 text-purple-600" /> Cohort Performance
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Compares actual life consumed vs expected for each component-type cohort. Reveals systemic failures.
        </p>
      </div>

      <Card className="p-5 mb-5">
        <h3 className="font-bold text-slate-900 mb-4">Variance: actual − expected life consumed (%)</h3>
        <div className="h-[400px]">
          <ResponsiveContainer>
            <BarChart data={cohorts.slice(0, 20)} layout="vertical" margin={{ left: 130 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis type="number" tickFormatter={(v) => `${v}%`} />
              <YAxis dataKey="type" type="category" width={130} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => `${v}%`} />
              <ReferenceLine x={0} stroke="#64748b" />
              <Bar dataKey="variance" radius={[0, 4, 4, 0]}>
                {cohorts.slice(0, 20).map((c, i) => (
                  <Cell key={i} fill={c.variance > 10 ? '#ef4444' : c.variance < -10 ? '#10b981' : '#94a3b8'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="p-4">
        <h3 className="font-bold text-slate-900 mb-3">Cohorts</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase text-slate-500 border-b">
                <th className="py-2 pr-3">Component Type</th>
                <th className="py-2 pr-3">Population</th>
                <th className="py-2 pr-3">Avg Life Consumed</th>
                <th className="py-2 pr-3">Expected</th>
                <th className="py-2 pr-3">Variance</th>
                <th className="py-2 pr-3">Avg Grade</th>
                <th className="py-2 pr-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {cohorts.map((c) => (
                <tr key={c.type} className="border-b last:border-0 hover:bg-slate-50">
                  <td className="py-2 pr-3 font-medium text-slate-900">{c.type}</td>
                  <td className="py-2 pr-3 tabular-nums">{c.n}</td>
                  <td className="py-2 pr-3 tabular-nums">{c.avgLifeConsumed}%</td>
                  <td className="py-2 pr-3 tabular-nums text-slate-500">{c.expectedLifeConsumed}%</td>
                  <td className={`py-2 pr-3 tabular-nums font-bold ${c.variance > 10 ? 'text-red-600' : c.variance < -10 ? 'text-emerald-600' : 'text-slate-600'}`}>
                    {c.variance > 0 ? '+' : ''}{c.variance}%
                  </td>
                  <td className="py-2 pr-3 tabular-nums">{c.avgGrade ?? '—'}</td>
                  <td className="py-2 pr-3 text-xs capitalize">{c.performance.replace('_', ' ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}