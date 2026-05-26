import React, { useState, useMemo } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import ProgramToggle from '../ProgramToggle';
import { defectsVsPlannedSeries, COLORS, fmtMoney, fmtCompact } from '../lib/reportData';

export default function P04_TotalCosts({ engine }) {
  const [program, setProgram] = useState('balanced');
  const data = useMemo(() => defectsVsPlannedSeries(engine, program), [engine, program]);
  const total = data.reduce((a, d) => a + d.total, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-lg font-semibold text-slate-800">Sum of Cost by Calendar Year and Expenditure Type</div>
          <div className="text-xs text-slate-500 mt-0.5">Total over horizon: <span className="font-bold text-slate-900">{fmtMoney(total)}</span></div>
        </div>
        <ProgramToggle value={program} onChange={setProgram} />
      </div>

      <div className="h-[640px] border border-slate-200 rounded-md p-3">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
            <CartesianGrid stroke={COLORS.grid} strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="year" tick={{ fontSize: 11, fill: COLORS.muted }} />
            <YAxis tick={{ fontSize: 11, fill: COLORS.muted }} tickFormatter={fmtCompact} />
            <Tooltip formatter={(v) => fmtMoney(v)} contentStyle={{ fontSize: 11, borderRadius: 6 }} />
            <Legend wrapperStyle={{ fontSize: 11 }} iconSize={10} />
            <Bar dataKey="defects" stackId="a" name="Defect Rectification" fill={COLORS.defect} />
            <Bar dataKey="planned" stackId="a" name="Planned Maintenance" fill={COLORS.planned} radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}