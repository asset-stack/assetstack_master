import React, { useMemo } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from 'recharts';
import { COLORS } from '../lib/reportData';

const deltaColor = (d) => {
  if (d == null) return '#cbd5e1';
  if (d <= -0.5) return '#10b981';
  if (d < 0) return '#84cc16';
  if (d === 0) return '#94a3b8';
  if (d < 0.5) return '#f59e0b';
  return '#ef4444';
};

export default function P11_ConditionChange({ engine, components, rooms }) {
  const rows = useMemo(() => {
    return [...(engine?.roomCondition || [])]
      .filter(r => r.baseline_condition != null && r.average_condition != null)
      .sort((a, b) => (b.change ?? 0) - (a.change ?? 0));
  }, [engine]);

  const byGroup = useMemo(() => {
    const map = {};
    components.forEach(c => {
      const g = c.group || 'Other';
      const cur = c.condition_grade_current;
      const base = c.condition_grade_baseline;
      if (cur == null || base == null) return;
      if (!map[g]) map[g] = { sum: 0, count: 0 };
      map[g].sum += cur - base;
      map[g].count += 1;
    });
    return Object.entries(map)
      .map(([g, v]) => ({ group: g, change: v.sum / v.count }))
      .sort((a, b) => b.change - a.change);
  }, [components]);

  const byComponentType = useMemo(() => {
    const map = {};
    components.forEach(c => {
      const t = c.component_type || 'Unknown';
      const cur = c.condition_grade_current;
      const base = c.condition_grade_baseline;
      if (cur == null || base == null) return;
      if (!map[t]) map[t] = { sum: 0, count: 0 };
      map[t].sum += cur - base;
      map[t].count += 1;
    });
    return Object.entries(map)
      .map(([t, v]) => ({ type: t, change: v.sum / v.count }))
      .sort((a, b) => b.change - a.change)
      .slice(0, 20);
  }, [components]);

  return (
    <div>
      <div className="text-lg font-semibold text-slate-800 mb-4">Condition Rating Change (Baseline vs Current)</div>

      <div className="grid grid-cols-12 gap-4">
        {/* Room table */}
        <div className="col-span-5">
          <div className="text-xs font-semibold text-slate-700 mb-1">By Room</div>
          <div className="border border-slate-200 rounded-md overflow-hidden max-h-[600px] overflow-y-auto">
            <table className="w-full text-xs tabular-nums">
              <thead className="bg-slate-50 sticky top-0">
                <tr>
                  <th className="text-left py-1.5 px-2 font-semibold text-slate-600">Room</th>
                  <th className="text-right py-1.5 px-2 font-semibold text-slate-600">Baseline</th>
                  <th className="text-right py-1.5 px-2 font-semibold text-slate-600">Current</th>
                  <th className="text-right py-1.5 px-2 font-semibold text-slate-600">Δ</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(r => (
                  <tr key={r.room_id} className="border-t border-slate-100 hover:bg-slate-50">
                    <td className="py-1 px-2 text-slate-700">{r.room_code}</td>
                    <td className="py-1 px-2 text-right text-slate-600">{r.baseline_condition?.toFixed(2)}</td>
                    <td className="py-1 px-2 text-right text-slate-600">{r.average_condition?.toFixed(2)}</td>
                    <td className="py-1 px-2 text-right font-semibold" style={{ color: deltaColor(r.change) }}>
                      {r.change != null ? (r.change > 0 ? '+' : '') + r.change.toFixed(2) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Charts */}
        <div className="col-span-7 space-y-3">
          <div>
            <div className="text-xs font-semibold text-slate-700 mb-1">Condition Rating Change by Group</div>
            <div className="h-[260px] border border-slate-200 rounded-md p-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={byGroup} margin={{ top: 5, right: 10, left: 0, bottom: 50 }}>
                  <CartesianGrid stroke={COLORS.grid} strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="group" tick={{ fontSize: 9, fill: COLORS.muted }} angle={-35} textAnchor="end" height={50} interval={0} />
                  <YAxis tick={{ fontSize: 10, fill: COLORS.muted }} />
                  <Tooltip formatter={(v) => v.toFixed(2)} contentStyle={{ fontSize: 11, borderRadius: 6 }} />
                  <Bar dataKey="change" radius={[3, 3, 0, 0]}>
                    {byGroup.map((r, i) => <Cell key={i} fill={deltaColor(r.change)} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-700 mb-1">Condition Rating Change by Component Type (Top 20)</div>
            <div className="h-[260px] border border-slate-200 rounded-md p-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={byComponentType} margin={{ top: 5, right: 10, left: 0, bottom: 50 }}>
                  <CartesianGrid stroke={COLORS.grid} strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="type" tick={{ fontSize: 8, fill: COLORS.muted }} angle={-45} textAnchor="end" height={50} interval={0} />
                  <YAxis tick={{ fontSize: 10, fill: COLORS.muted }} />
                  <Tooltip formatter={(v) => v.toFixed(2)} contentStyle={{ fontSize: 11, borderRadius: 6 }} />
                  <Bar dataKey="change" radius={[3, 3, 0, 0]}>
                    {byComponentType.map((r, i) => <Cell key={i} fill={deltaColor(r.change)} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}