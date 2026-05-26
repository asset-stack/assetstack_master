import React, { useMemo } from 'react';
import { componentCountPivot, fmtNumber } from '../lib/reportData';

export default function P12_AssetSummary({ components, rooms }) {
  const { types, rows, colTotals, grand } = useMemo(() => componentCountPivot(components, rooms), [components, rooms]);

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-lg font-semibold text-slate-800">Asset Summary — Components by Room × Type</div>
          <div className="text-xs text-slate-500 mt-0.5">{fmtNumber(grand)} total components across {rooms.length} rooms and {types.length} component types</div>
        </div>
      </div>

      <div className="border border-slate-200 rounded-md overflow-hidden">
        <div className="overflow-auto max-h-[680px]">
          <table className="w-full text-[10px] tabular-nums">
            <thead className="bg-slate-50 sticky top-0 z-10">
              <tr>
                <th className="text-left py-1.5 px-2 font-semibold text-slate-600 sticky left-0 bg-slate-50 z-20 min-w-[60px]">Room</th>
                {types.map(t => (
                  <th key={t} className="text-right py-1.5 px-1.5 font-semibold text-slate-600 min-w-[80px]" style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}>
                    {t}
                  </th>
                ))}
                <th className="text-right py-1.5 px-2 font-semibold text-slate-700 bg-slate-100 min-w-[50px]">Total</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.room_id} className="border-t border-slate-100 hover:bg-indigo-50/30">
                  <td className="py-1 px-2 text-slate-700 sticky left-0 bg-white hover:bg-indigo-50/30 z-10 font-medium">{r.room_code}</td>
                  {types.map(t => (
                    <td key={t} className="py-1 px-1.5 text-right text-slate-600">
                      {r.cells[t] > 0 ? r.cells[t] : ''}
                    </td>
                  ))}
                  <td className="py-1 px-2 text-right font-semibold text-slate-800 bg-slate-50">{r.total}</td>
                </tr>
              ))}
              <tr className="border-t-2 border-slate-300 bg-slate-100 font-bold">
                <td className="py-1.5 px-2 text-slate-900 sticky left-0 bg-slate-100 z-10">Total</td>
                {types.map(t => (
                  <td key={t} className="py-1.5 px-1.5 text-right text-slate-900">{colTotals[t]}</td>
                ))}
                <td className="py-1.5 px-2 text-right text-slate-900 bg-slate-200">{grand}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}