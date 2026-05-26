import React, { useState, useMemo } from 'react';
import ProgramToggle from '../ProgramToggle';
import { roomYearPivot, fmtNumber } from '../lib/reportData';

export default function P07_TwentyYearFWP({ engine, rooms }) {
  const [program, setProgram] = useState('balanced');
  const { years, rows, colTotals } = useMemo(() => roomYearPivot(engine, rooms, program), [engine, rooms, program]);
  const grand = rows.reduce((a, r) => a + r.rowTotal, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="text-lg font-semibold text-slate-800">20 Year Forward Works Plan</div>
        <ProgramToggle value={program} onChange={setProgram} />
      </div>

      <div className="border border-slate-200 rounded-md overflow-hidden">
        <div className="overflow-auto max-h-[660px]">
          <table className="w-full text-[10px] tabular-nums">
            <thead className="bg-slate-50 sticky top-0 z-10">
              <tr>
                <th className="text-left py-1.5 px-2 font-semibold text-slate-600 sticky left-0 bg-slate-50 z-20 min-w-[200px]">Room / Location</th>
                {years.map(y => (
                  <th key={y} className="text-right py-1.5 px-1.5 font-semibold text-slate-600 min-w-[60px]">{y}</th>
                ))}
                <th className="text-right py-1.5 px-2 font-semibold text-slate-700 bg-slate-100 min-w-[80px]">Total</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.room_id} className="border-t border-slate-100 hover:bg-indigo-50/30">
                  <td className="py-1 px-2 text-slate-700 sticky left-0 bg-white hover:bg-indigo-50/30 z-10 truncate">{r.label}</td>
                  {years.map(y => (
                    <td key={y} className="py-1 px-1.5 text-right text-slate-600">
                      {r.cells[y] > 0 ? fmtNumber(r.cells[y], 0) : ''}
                    </td>
                  ))}
                  <td className="py-1 px-2 text-right font-semibold text-slate-800 bg-slate-50">{fmtNumber(r.rowTotal, 0)}</td>
                </tr>
              ))}
              <tr className="border-t-2 border-slate-300 bg-slate-100 font-bold">
                <td className="py-1.5 px-2 text-slate-900 sticky left-0 bg-slate-100 z-10">Total</td>
                {years.map(y => (
                  <td key={y} className="py-1.5 px-1.5 text-right text-slate-900">{fmtNumber(colTotals[y], 0)}</td>
                ))}
                <td className="py-1.5 px-2 text-right text-slate-900 bg-slate-200">{fmtNumber(grand, 0)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}