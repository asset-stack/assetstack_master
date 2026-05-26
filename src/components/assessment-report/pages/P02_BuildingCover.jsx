import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend,
} from 'recharts';
import ProgramToggle from '../ProgramToggle';
import { groupYearSeries, roomTotals, COLORS, CATEGORICAL, fmtMoney } from '../lib/reportData';

const META_FIELDS = [
  { label: 'Address', key: 'building_address' },
  { label: 'Assessor', key: 'assessor_name' },
  { label: 'Building Name', key: 'location_name' },
  { label: 'Building Type', key: 'building_type' },
];

export default function P02_BuildingCover({ assessment, rooms, engine }) {
  const [program, setProgram] = useState('balanced');

  const { data: groupData, groups } = useMemo(() => groupYearSeries(engine, program), [engine, program]);
  const roomRows = useMemo(() => roomTotals(engine, rooms, program), [engine, rooms, program]);
  const grandTotal = roomRows.reduce((a, r) => a + r.total, 0);

  return (
    <div className="grid grid-cols-12 gap-6">
      {/* Meta strip */}
      <div className="col-span-12 grid grid-cols-5 gap-3 pb-3">
        {META_FIELDS.map(f => (
          <div key={f.key} className="border-l-2 border-indigo-500 pl-3">
            <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">{f.label}</div>
            <div className="text-sm font-semibold text-slate-800 truncate">{assessment?.[f.key] || '—'}</div>
          </div>
        ))}
        <div className="border-l-2 border-indigo-500 pl-3">
          <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Internal Area (m²)</div>
          <div className="text-sm font-semibold text-slate-800">
            {assessment?.internal_area_sqm ? assessment.internal_area_sqm.toLocaleString() : '—'}
          </div>
        </div>
      </div>

      {/* Left: program selector + room table */}
      <div className="col-span-5">
        <div className="mb-3">
          <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-1.5">Program Type</div>
          <ProgramToggle value={program} onChange={setProgram} size="sm" />
        </div>
        <div className="border border-slate-200 rounded-md overflow-hidden">
          <table className="w-full text-xs">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left py-1.5 px-2 font-semibold text-slate-600">Room ID</th>
                <th className="text-left py-1.5 px-2 font-semibold text-slate-600">Room / Location</th>
                <th className="text-right py-1.5 px-2 font-semibold text-slate-600">Sum of Annual Cost</th>
              </tr>
            </thead>
            <tbody className="max-h-[400px] overflow-y-auto">
              {roomRows.map(r => (
                <tr key={r.room_id} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="py-1 px-2 text-slate-700">{r.room_code}</td>
                  <td className="py-1 px-2 text-slate-700">{r.label}</td>
                  <td className="py-1 px-2 text-right text-slate-700 tabular-nums">{fmtMoney(r.total, 2)}</td>
                </tr>
              ))}
              <tr className="border-t-2 border-slate-300 bg-slate-50 font-bold">
                <td className="py-1.5 px-2 text-slate-900" colSpan={2}>Total</td>
                <td className="py-1.5 px-2 text-right text-slate-900 tabular-nums">{fmtMoney(grandTotal, 2)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Right: stacked bar by year + group */}
      <div className="col-span-7">
        <div className="text-sm font-semibold text-slate-800 mb-2">Sum of Annual Cost by Calendar Year and Group</div>
        <div className="h-[420px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={groupData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid stroke={COLORS.grid} strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="year" tick={{ fontSize: 10, fill: COLORS.muted }} />
              <YAxis tick={{ fontSize: 10, fill: COLORS.muted }} tickFormatter={(v) => v >= 1e6 ? `${(v / 1e6).toFixed(1)}M` : v >= 1e3 ? `${(v / 1e3).toFixed(0)}K` : v} />
              <Tooltip
                formatter={(v) => fmtMoney(v)}
                contentStyle={{ fontSize: 11, borderRadius: 6, border: '1px solid #e2e8f0' }}
              />
              <Legend wrapperStyle={{ fontSize: 10 }} iconSize={8} />
              {groups.map((g, i) => (
                <Bar key={g} dataKey={g} stackId="a" fill={CATEGORICAL[i % CATEGORICAL.length]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}