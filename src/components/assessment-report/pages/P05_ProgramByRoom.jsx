import React, { useMemo } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, LabelList } from 'recharts';
import { yearSeries, PROGRAM_LABELS, PROGRAMS, COLORS, fmtMoney, fmtCompact } from '../lib/reportData';

export default function P05_ProgramByRoom({ engine }) {
  const data = useMemo(() => yearSeries(engine), [engine]);
  const totals = engine?.totals || { balanced: 0, must_do: 0, premium: 0 };

  return (
    <div>
      <div className="text-lg font-semibold text-slate-800 mb-4">Annual Cost by Calendar Year and Program Type</div>

      <div className="grid grid-cols-12 gap-4">
        {/* Totals summary */}
        <div className="col-span-3 space-y-3">
          {PROGRAMS.map(p => (
            <div key={p} className="p-3 border border-slate-200 rounded-md bg-gradient-to-br from-slate-50 to-white">
              <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">{PROGRAM_LABELS[p]}</div>
              <div className="text-xl font-bold text-slate-900 tabular-nums mt-1">{fmtMoney(totals[p])}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Sum of Annual Cost</div>
            </div>
          ))}
        </div>

        {/* Three stacked bar charts */}
        <div className="col-span-9 space-y-3">
          {PROGRAMS.map(p => (
            <div key={p}>
              <div className="text-xs font-semibold text-slate-700 mb-1">{PROGRAM_LABELS[p]}</div>
              <div className="h-[180px] border border-slate-200 rounded-md p-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data} margin={{ top: 18, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid stroke={COLORS.grid} strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="year" tick={{ fontSize: 9, fill: COLORS.muted }} />
                    <YAxis tick={{ fontSize: 9, fill: COLORS.muted }} tickFormatter={fmtCompact} />
                    <Tooltip formatter={(v) => fmtMoney(v)} contentStyle={{ fontSize: 11, borderRadius: 6 }} />
                    <Bar dataKey={p} fill={COLORS.primary} radius={[2, 2, 0, 0]}>
                      <LabelList dataKey={p} position="top" formatter={(v) => v > 100 ? fmtCompact(v) : ''} style={{ fontSize: 8, fill: COLORS.text }} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}