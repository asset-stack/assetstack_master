import React, { useMemo } from 'react';
import { deriveCRC, deriveWDV, fmtMoney } from '@/lib/assetMetrics';

export default function ValuationByLocation({ equipment }) {
  const rows = useMemo(() => {
    const map = new Map();
    for (const e of equipment) {
      const facility = e?.specifications?.facility || (e.location?.split('·')?.[0]?.trim() ?? 'Unknown');
      if (!map.has(facility)) map.set(facility, { facility, crc: 0, wdv: 0, count: 0 });
      const r = map.get(facility);
      r.crc += deriveCRC(e);
      r.wdv += deriveWDV(e);
      r.count += 1;
    }
    return Array.from(map.values()).sort((a, b) => b.crc - a.crc);
  }, [equipment]);

  const totalCRC = rows.reduce((s, r) => s + r.crc, 0);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <h3 className="text-sm font-semibold text-slate-900 mb-4">Valuation by Facility</h3>
      <div className="space-y-3">
        {rows.map((r) => {
          const pct = totalCRC > 0 ? (r.crc / totalCRC) * 100 : 0;
          const consumed = r.crc > 0 ? Math.round((1 - r.wdv / r.crc) * 100) : 0;
          return (
            <div key={r.facility} className="border border-slate-100 rounded-lg p-3">
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-sm font-semibold text-slate-900 truncate">{r.facility}</p>
                <p className="text-sm font-bold text-slate-900 tabular-nums">{fmtMoney(r.crc)}</p>
              </div>
              <div className="bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div className="h-full bg-indigo-500" style={{ width: `${pct}%` }} />
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1.5 tabular-nums">
                <span>{r.count} assets</span>
                <span>WDV {fmtMoney(r.wdv)} · {consumed}% consumed</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}