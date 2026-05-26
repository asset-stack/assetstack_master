import React, { useState, useMemo } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, LabelList } from 'recharts';
import ProgramToggle from '../ProgramToggle';
import { COLORS, fmtMoney, fmtCompact } from '../lib/reportData';

export default function P03_Defects({ defects, engine }) {
  const [program, setProgram] = useState('balanced');

  const factoredByYear = useMemo(() => {
    const map = {};
    defects.forEach(d => {
      const ty = program === 'balanced' ? d.target_year_balanced
        : program === 'must_do' ? d.target_year_must_do
        : d.target_year_premium;
      if (!ty) return;
      const startYear = engine?.horizon?.startYear || (new Date().getFullYear() + 1);
      const infl = Math.pow(1.03, ty - startYear);
      const cost = (d.rectification_cost || 0) * infl;
      map[ty] = (map[ty] || 0) + cost;
    });
    return Object.entries(map).map(([year, total]) => ({ year: Number(year), total })).sort((a, b) => a.year - b.year);
  }, [defects, program, engine]);

  return (
    <div className="grid grid-cols-12 gap-6">
      {/* Defect table */}
      <div className="col-span-9">
        <div className="text-sm font-semibold text-slate-800 mb-2">Defect Register ({defects.length})</div>
        <div className="border border-slate-200 rounded-md overflow-hidden">
          <div className="max-h-[640px] overflow-y-auto">
            <table className="w-full text-xs">
              <thead className="bg-slate-50 sticky top-0">
                <tr>
                  <th className="text-left py-1.5 px-2 font-semibold text-slate-600 w-[180px]">Room / Location</th>
                  <th className="text-left py-1.5 px-2 font-semibold text-slate-600 w-[90px]">Defect ID</th>
                  <th className="text-left py-1.5 px-2 font-semibold text-slate-600">Description</th>
                  <th className="text-right py-1.5 px-2 font-semibold text-slate-600 w-[100px]">Rect. Cost</th>
                  <th className="text-center py-1.5 px-2 font-semibold text-slate-600 w-[60px]">Target Year</th>
                </tr>
              </thead>
              <tbody>
                {defects.map(d => {
                  const ty = program === 'balanced' ? d.target_year_balanced
                    : program === 'must_do' ? d.target_year_must_do
                    : d.target_year_premium;
                  return (
                    <tr key={d.id} className="border-t border-slate-100 hover:bg-slate-50">
                      <td className="py-1 px-2 text-slate-700 truncate">{d.room_code ? `${d.room_code}/${d.room_name || ''}` : (d.room_name || '—')}</td>
                      <td className="py-1 px-2 text-slate-700 font-mono">{d.defect_id}</td>
                      <td className="py-1 px-2 text-slate-700">{d.description}</td>
                      <td className="py-1 px-2 text-right text-slate-700 tabular-nums">{fmtMoney(d.rectification_cost)}</td>
                      <td className="py-1 px-2 text-center text-slate-700">{ty || '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Right: program toggle + factored cost by year */}
      <div className="col-span-3">
        <div className="mb-3">
          <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-1.5">Program</div>
          <ProgramToggle value={program} onChange={setProgram} size="sm" />
        </div>
        <div className="text-sm font-semibold text-slate-800 mb-2">Sum of Factored Cost</div>
        <div className="h-[460px] border border-slate-200 rounded-md p-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={factoredByYear} margin={{ top: 20, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid stroke={COLORS.grid} strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="year" tick={{ fontSize: 10, fill: COLORS.muted }} />
              <YAxis tick={{ fontSize: 10, fill: COLORS.muted }} tickFormatter={fmtCompact} />
              <Tooltip formatter={(v) => fmtMoney(v)} contentStyle={{ fontSize: 11, borderRadius: 6 }} />
              <Bar dataKey="total" fill={COLORS.defect} radius={[3, 3, 0, 0]}>
                <LabelList dataKey="total" position="top" formatter={fmtCompact} style={{ fontSize: 9, fill: COLORS.text }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}