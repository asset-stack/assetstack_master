import React, { useMemo } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from 'recharts';
import { COLORS, fmtNumber } from '../lib/reportData';

const gradeColor = (g) => {
  if (g == null) return '#cbd5e1';
  if (g <= 1.5) return '#10b981';
  if (g <= 2.5) return '#84cc16';
  if (g <= 3.5) return '#f59e0b';
  if (g <= 4.5) return '#f97316';
  return '#ef4444';
};

export default function P10_ConditionSummary({ engine }) {
  const sorted = useMemo(() => {
    return [...(engine?.roomCondition || [])]
      .filter(r => r.average_condition != null)
      .sort((a, b) => b.average_condition - a.average_condition);
  }, [engine]);
  const overall = sorted.length
    ? sorted.reduce((a, r) => a + (r.average_condition || 0), 0) / sorted.length
    : null;

  return (
    <div>
      <div className="text-lg font-semibold text-slate-800 mb-4">
        Average Condition Grade — Overall: <span className="text-indigo-700">{overall ? overall.toFixed(2) : '—'}</span>
      </div>

      <div className="grid grid-cols-12 gap-4">
        {/* Bar chart — rooms ranked */}
        <div className="col-span-7">
          <div className="text-xs font-semibold text-slate-700 mb-1">Rooms by Average Condition</div>
          <div className="h-[600px] border border-slate-200 rounded-md p-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sorted} layout="vertical" margin={{ top: 5, right: 20, left: 5, bottom: 5 }}>
                <CartesianGrid stroke={COLORS.grid} strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10, fill: COLORS.muted }} domain={[0, 5]} ticks={[0, 1, 2, 3, 4, 5]} />
                <YAxis type="category" dataKey="room_code" tick={{ fontSize: 9, fill: COLORS.muted }} width={50} />
                <Tooltip
                  formatter={(v) => v.toFixed(2)}
                  labelFormatter={(label) => {
                    const r = sorted.find(x => x.room_code === label);
                    return r ? `${r.room_code} / ${r.name}` : label;
                  }}
                  contentStyle={{ fontSize: 11, borderRadius: 6 }}
                />
                <Bar dataKey="average_condition" radius={[0, 3, 3, 0]}>
                  {sorted.map((r, i) => <Cell key={i} fill={gradeColor(r.average_condition)} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Table */}
        <div className="col-span-5">
          <div className="text-xs font-semibold text-slate-700 mb-1">Detail</div>
          <div className="border border-slate-200 rounded-md overflow-hidden max-h-[600px] overflow-y-auto">
            <table className="w-full text-xs tabular-nums">
              <thead className="bg-slate-50 sticky top-0">
                <tr>
                  <th className="text-left py-1.5 px-2 font-semibold text-slate-600">Room / Location</th>
                  <th className="text-right py-1.5 px-2 font-semibold text-slate-600">Components</th>
                  <th className="text-right py-1.5 px-2 font-semibold text-slate-600">Avg Condition</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map(r => (
                  <tr key={r.room_id} className="border-t border-slate-100 hover:bg-slate-50">
                    <td className="py-1 px-2 text-slate-700">{r.room_code}/{r.name}</td>
                    <td className="py-1 px-2 text-right text-slate-600">{fmtNumber(r.component_count)}</td>
                    <td className="py-1 px-2 text-right font-semibold" style={{ color: gradeColor(r.average_condition) }}>
                      {r.average_condition != null ? r.average_condition.toFixed(2) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}