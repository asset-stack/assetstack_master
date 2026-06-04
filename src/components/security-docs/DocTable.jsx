import React from 'react';

export default function DocTable({ headers, rows }) {
  return (
    <div className="not-prose my-5 overflow-x-auto rounded-xl border border-slate-200">
      <table className="w-full text-[13px] border-collapse">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200">
            {headers.map((h, i) => (
              <th key={i} className="text-left font-semibold text-slate-700 px-4 py-2.5 whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60">
              {row.map((cell, ci) => (
                <td key={ci} className={`px-4 py-2.5 align-top ${ci === 0 ? 'font-medium text-slate-900' : 'text-slate-600'}`}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}