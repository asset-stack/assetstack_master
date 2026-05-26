import React, { useMemo } from 'react';
import { losSummary } from '../lib/reportData';

const losColor = (los) => {
  if (los >= 4) return 'bg-rose-100 text-rose-700 border-rose-200';
  if (los === 3) return 'bg-amber-100 text-amber-700 border-amber-200';
  if (los === 2) return 'bg-sky-100 text-sky-700 border-sky-200';
  if (los === 1) return 'bg-emerald-100 text-emerald-700 border-emerald-200';
  return 'bg-slate-100 text-slate-600 border-slate-200';
};

const losLabel = (los) => {
  if (los === 4) return 'Mission Critical';
  if (los === 3) return 'High';
  if (los === 2) return 'Standard';
  if (los === 1) return 'Low';
  return 'Unrated';
};

export default function P13_LOSSummary({ rooms }) {
  const grouped = useMemo(() => losSummary(rooms), [rooms]);

  return (
    <div>
      <div className="text-lg font-semibold text-slate-800 mb-1">Level of Service Summary</div>
      <div className="text-xs text-slate-500 mb-4">
        Rooms grouped by operational criticality. LoS 4 = mission-critical, LoS 1 = low-priority.
      </div>

      <div className="space-y-4">
        {grouped.map(({ los, rooms: rs }) => (
          <div key={los} className={`border rounded-md p-3 ${losColor(los)}`}>
            <div className="flex items-center justify-between mb-2">
              <div className="font-bold text-sm">
                LoS {los || '—'} · {losLabel(los)}
              </div>
              <div className="text-xs font-semibold">{rs.length} rooms</div>
            </div>
            <div className="grid grid-cols-3 gap-x-4 gap-y-1 text-xs">
              {rs.map(r => (
                <div key={r.id} className="flex items-center gap-2 bg-white/60 rounded px-2 py-1 border border-white">
                  <span className="font-mono font-semibold text-slate-700 text-[10px]">{r.room_code}</span>
                  <span className="text-slate-700 truncate">{r.name}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
        {grouped.length === 0 && (
          <div className="text-sm text-slate-400 italic p-4 border border-slate-200 rounded-md">
            No level-of-service ratings assigned yet.
          </div>
        )}
      </div>
    </div>
  );
}