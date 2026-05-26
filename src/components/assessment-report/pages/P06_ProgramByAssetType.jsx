import React, { useState, useMemo } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import ProgramToggle from '../ProgramToggle';
import { topComponentTypes, criticalitySeries, roomTotals, COLORS, fmtMoney, fmtCompact } from '../lib/reportData';

export default function P06_ProgramByAssetType({ engine, rooms }) {
  const [program, setProgram] = useState('balanced');
  const topTypes = useMemo(() => topComponentTypes(engine, program, 4), [engine, program]);
  const critSeries = useMemo(() => criticalitySeries(engine, program), [engine, program]);
  const roomRanking = useMemo(() => roomTotals(engine, rooms, program).slice(0, 15), [engine, rooms, program]);
  const years = engine?.horizon?.years || [];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="text-lg font-semibold text-slate-800">Annual Cost by Year, LoS and Component Type</div>
        <ProgramToggle value={program} onChange={setProgram} />
      </div>

      <div className="grid grid-cols-12 gap-4">
        {/* Left column: room ranking + criticality */}
        <div className="col-span-4 space-y-4">
          <div>
            <div className="text-xs font-semibold text-slate-700 mb-1">Cost by Room / Location</div>
            <div className="h-[260px] border border-slate-200 rounded-md p-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={roomRanking} layout="vertical" margin={{ top: 5, right: 10, left: 5, bottom: 5 }}>
                  <CartesianGrid stroke={COLORS.grid} strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 9, fill: COLORS.muted }} tickFormatter={fmtCompact} />
                  <YAxis type="category" dataKey="room_code" tick={{ fontSize: 9, fill: COLORS.muted }} width={40} />
                  <Tooltip formatter={(v) => fmtMoney(v)} contentStyle={{ fontSize: 11, borderRadius: 6 }} />
                  <Bar dataKey="total" fill={COLORS.primary} radius={[0, 3, 3, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-700 mb-1">Annual Cost by Component Criticality</div>
            <div className="h-[260px] border border-slate-200 rounded-md p-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={critSeries} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid stroke={COLORS.grid} strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="criticality" tick={{ fontSize: 10, fill: COLORS.muted }} />
                  <YAxis tick={{ fontSize: 9, fill: COLORS.muted }} tickFormatter={fmtCompact} />
                  <Tooltip formatter={(v) => fmtMoney(v)} contentStyle={{ fontSize: 11, borderRadius: 6 }} />
                  <Bar dataKey="total" fill={COLORS.primary} radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right column: small multiples of top component types */}
        <div className="col-span-8 space-y-2">
          {topTypes.length === 0 && (
            <div className="text-xs text-slate-400 italic">No component cost data for this program.</div>
          )}
          {topTypes.map(t => {
            const series = years.map(y => ({ year: y, value: t.yearMap[y]?.[program] || 0 }));
            return (
              <div key={t.type}>
                <div className="text-xs font-semibold text-slate-700 mb-0.5 flex items-center justify-between">
                  <span>{t.type}</span>
                  <span className="text-slate-400 tabular-nums">{fmtMoney(t.total)}</span>
                </div>
                <div className="h-[120px] border border-slate-200 rounded-md p-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={series} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                      <CartesianGrid stroke={COLORS.grid} strokeDasharray="2 2" vertical={false} />
                      <XAxis dataKey="year" tick={{ fontSize: 8, fill: COLORS.muted }} />
                      <YAxis tick={{ fontSize: 8, fill: COLORS.muted }} tickFormatter={fmtCompact} width={40} />
                      <Tooltip formatter={(v) => fmtMoney(v)} contentStyle={{ fontSize: 11, borderRadius: 6 }} />
                      <Bar dataKey="value" fill={COLORS.primaryLight} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}