import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, ArrowRight } from 'lucide-react';

export default function SWSCMismatchList({ items = [] }) {
  const [search, setSearch] = useState('');
  const filtered = items.filter((i) =>
    !search ||
    i.equipment_name?.toLowerCase().includes(search.toLowerCase()) ||
    i.room?.toLowerCase().includes(search.toLowerCase())
  );

  if (items.length === 0) {
    return <Card className="p-8 text-center text-slate-500 text-sm">No field mismatches — DB matches the spreadsheet.</Card>;
  }

  return (
    <>
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          placeholder="Search by asset name or room…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 max-w-md"
        />
      </div>
      <div className="space-y-2 max-h-[700px] overflow-y-auto pr-1">
        {filtered.slice(0, 200).map((item) => (
          <Card key={item.equipment_id} className="p-3">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="min-w-0">
                <p className="font-semibold text-sm text-slate-900 truncate">{item.equipment_name}</p>
                <p className="text-xs text-slate-500">{item.room}</p>
              </div>
              <Badge variant="outline" className="text-[10px] shrink-0">{item.diffs.length} diff(s)</Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
              {item.diffs.map((d, i) => (
                <div key={i} className="flex items-center gap-2 bg-amber-50 border border-amber-100 rounded px-2 py-1 text-[11px]">
                  <span className="font-semibold text-slate-700 capitalize w-32 shrink-0">{d.field.replace(/_/g, ' ')}</span>
                  <span className="text-rose-600 line-through tabular-nums">{d.current ?? '—'}</span>
                  <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
                  <span className="text-emerald-700 font-bold tabular-nums">{d.expected}</span>
                </div>
              ))}
            </div>
          </Card>
        ))}
        {filtered.length > 200 && (
          <p className="text-center text-xs text-slate-400 py-2">Showing first 200 of {filtered.length} matches</p>
        )}
      </div>
    </>
  );
}