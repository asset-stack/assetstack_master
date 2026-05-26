import React, { useState, useMemo } from 'react';
import { firstReplacementRows } from '../lib/reportData';
import { Input } from '@/components/ui/input';

export default function P14_FirstReplacement({ components, rooms, engine }) {
  const [filter, setFilter] = useState('');
  const all = useMemo(() => firstReplacementRows(components, rooms, engine), [components, rooms, engine]);
  const rows = useMemo(() => {
    if (!filter) return all;
    const f = filter.toLowerCase();
    return all.filter(r => (
      r.room_label?.toLowerCase().includes(f) ||
      r.component_type?.toLowerCase().includes(f) ||
      r.subtype?.toLowerCase().includes(f) ||
      r.material?.toLowerCase().includes(f)
    ));
  }, [all, filter]);

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-lg font-semibold text-slate-800">First Instance of Replacement / Repair</div>
          <div className="text-xs text-slate-500 mt-0.5">Each component's next scheduled replacement year, computed from useful life.</div>
        </div>
        <Input
          placeholder="Filter components…"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="w-64 h-8 text-xs"
        />
      </div>

      <div className="border border-slate-200 rounded-md overflow-hidden">
        <div className="overflow-auto max-h-[680px]">
          <table className="w-full text-xs">
            <thead className="bg-slate-50 sticky top-0">
              <tr>
                <th className="text-left py-1.5 px-2 font-semibold text-slate-600 w-[80px]">Room ID</th>
                <th className="text-left py-1.5 px-2 font-semibold text-slate-600 w-[220px]">Room / Location</th>
                <th className="text-left py-1.5 px-2 font-semibold text-slate-600">Component (Subtype, Material, Size)</th>
                <th className="text-right py-1.5 px-2 font-semibold text-slate-600 w-[60px]">Cond</th>
                <th className="text-right py-1.5 px-2 font-semibold text-slate-600 w-[60px]">Crit</th>
                <th className="text-right py-1.5 px-2 font-semibold text-slate-600 w-[100px]">Calendar Year</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.component_id} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="py-1 px-2 text-slate-700 font-mono">{r.room_code}</td>
                  <td className="py-1 px-2 text-slate-700 truncate">{r.room_label}</td>
                  <td className="py-1 px-2 text-slate-700">
                    {r.component_type}
                    {(r.subtype || r.material || r.size) && (
                      <span className="text-slate-400"> ({[r.subtype, r.material, r.size].filter(Boolean).join(', ')})</span>
                    )}
                  </td>
                  <td className="py-1 px-2 text-right text-slate-600">{r.condition ?? '—'}</td>
                  <td className="py-1 px-2 text-right text-slate-600">{r.criticality ?? '—'}</td>
                  <td className="py-1 px-2 text-right font-semibold text-slate-800 tabular-nums">{r.first_year ?? '—'}</td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr><td colSpan={6} className="py-6 text-center text-slate-400 italic">No matching components.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}