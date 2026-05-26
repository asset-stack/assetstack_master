import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend,
  LineChart, Line, LabelList,
} from 'recharts';
import ProgramToggle from '../ProgramToggle';
import { yearSeries, COLORS, CATEGORICAL, fmtMoney, fmtCompact } from '../lib/reportData';

export default function P08_FWPByArea({ engine, rooms }) {
  const [program, setProgram] = useState('balanced');

  // 100% stacked bar by year — series = top rooms by total cost
  const stackData = useMemo(() => {
    if (!engine?.byRoomYear || !engine?.horizon) return { data: [], series: [] };
    const years = engine.horizon.years;
    const roomTotals = rooms.map(r => {
      const yearMap = engine.byRoomYear[r.id] || {};
      const t = Object.values(yearMap).reduce((a, yv) => a + (yv[program] || 0), 0);
      return { r, total: t };
    }).filter(x => x.total > 0).sort((a, b) => b.total - a.total).slice(0, 12);
    const series = roomTotals.map(x => x.r.room_code);
    const data = years.map(y => {
      const row = { year: y };
      const total = roomTotals.reduce((a, x) => a + (engine.byRoomYear[x.r.id]?.[y]?.[program] || 0), 0);
      roomTotals.forEach(x => {
        const v = engine.byRoomYear[x.r.id]?.[y]?.[program] || 0;
        row[x.r.room_code] = total > 0 ? (v / total) * 100 : 0;
      });
      return row;
    });
    return { data, series, roomLabels: Object.fromEntries(roomTotals.map(x => [x.r.room_code, `${x.r.room_code}/${x.r.name}`])) };
  }, [engine, rooms, program]);

  const lineData = useMemo(() => yearSeries(engine), [engine]);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="text-lg font-semibold text-slate-800">Sum of Annual Cost by Calendar Year and Room / Location</div>
        <ProgramToggle value={program} onChange={setProgram} />
      </div>

      <div className="space-y-3">
        {/* 100% stacked */}
        <div className="h-[320px] border border-slate-200 rounded-md p-3">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stackData.data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid stroke={COLORS.grid} strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="year" tick={{ fontSize: 10, fill: COLORS.muted }} />
              <YAxis tick={{ fontSize: 10, fill: COLORS.muted }} tickFormatter={(v) => `${v.toFixed(0)}%`} domain={[0, 100]} />
              <Tooltip formatter={(v, name) => [`${v.toFixed(1)}%`, stackData.roomLabels?.[name] || name]} contentStyle={{ fontSize: 11, borderRadius: 6 }} />
              <Legend wrapperStyle={{ fontSize: 9 }} iconSize={8} />
              {stackData.series.map((s, i) => (
                <Bar key={s} dataKey={s} stackId="a" fill={CATEGORICAL[i % CATEGORICAL.length]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Line: total per year */}
        <div className="h-[280px] border border-slate-200 rounded-md p-3">
          <div className="text-xs font-semibold text-slate-700 mb-1">Sum of Annual Cost by Calendar Year — {program}</div>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={lineData} margin={{ top: 18, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid stroke={COLORS.grid} strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="year" tick={{ fontSize: 10, fill: COLORS.muted }} />
              <YAxis tick={{ fontSize: 10, fill: COLORS.muted }} tickFormatter={fmtCompact} />
              <Tooltip formatter={(v) => fmtMoney(v)} contentStyle={{ fontSize: 11, borderRadius: 6 }} />
              <Line type="monotone" dataKey={program} stroke={COLORS.primary} strokeWidth={2} dot={{ r: 3, fill: COLORS.primary }}>
                <LabelList dataKey={program} position="top" formatter={(v) => v > 1000 ? fmtCompact(v) : ''} style={{ fontSize: 9, fill: COLORS.text }} />
              </Line>
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}