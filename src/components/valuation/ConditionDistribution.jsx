import React, { useMemo } from 'react';
import { deriveCondition, deriveCRC, fmtMoney } from '@/lib/assetMetrics';

const GRADE_LABEL = {
  1: { name: 'Very Good', color: 'bg-emerald-500' },
  2: { name: 'Good', color: 'bg-lime-500' },
  3: { name: 'Fair', color: 'bg-amber-500' },
  4: { name: 'Poor', color: 'bg-orange-500' },
  5: { name: 'Very Poor', color: 'bg-rose-500' },
};

export default function ConditionDistribution({ equipment }) {
  const stats = useMemo(() => {
    const out = { 1: { count: 0, crc: 0 }, 2: { count: 0, crc: 0 }, 3: { count: 0, crc: 0 }, 4: { count: 0, crc: 0 }, 5: { count: 0, crc: 0 }, unknown: { count: 0, crc: 0 } };
    for (const e of equipment) {
      const g = deriveCondition(e);
      const crc = deriveCRC(e);
      const k = g ?? 'unknown';
      out[k].count += 1;
      out[k].crc += crc;
    }
    return out;
  }, [equipment]);

  const total = equipment.length || 1;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <h3 className="text-sm font-semibold text-slate-900 mb-4">Condition Distribution</h3>
      <div className="space-y-2.5">
        {[1, 2, 3, 4, 5].map((g) => {
          const row = stats[g];
          const pct = (row.count / total) * 100;
          return (
            <div key={g}>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-700 font-medium">C{g} · {GRADE_LABEL[g].name}</span>
                <span className="text-slate-500 tabular-nums">{row.count} · {fmtMoney(row.crc)}</span>
              </div>
              <div className="bg-slate-100 rounded-full h-2 overflow-hidden">
                <div className={`h-full ${GRADE_LABEL[g].color}`} style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
        {stats.unknown.count > 0 && (
          <div className="pt-2 border-t border-slate-100 text-xs text-slate-500 flex justify-between">
            <span>Ungraded</span>
            <span className="tabular-nums">{stats.unknown.count} assets</span>
          </div>
        )}
      </div>
    </div>
  );
}