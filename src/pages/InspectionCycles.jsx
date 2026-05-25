import React, { useState, useEffect, useMemo } from 'react';
import { secureEntity } from '@/lib/secureEntities';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ClipboardCheck, AlertTriangle, Clock, Loader2, Search } from 'lucide-react';
import { inspectionStatus, recommendedFrequencyMonths } from '@/lib/inspectionCycles';
import { format } from 'date-fns';

export default function InspectionCycles() {
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('overdue');

  useEffect(() => {
    (async () => {
      const all = [];
      let page = 0;
      while (true) {
        const batch = await secureEntity('Equipment').list('-created_date', 200, page * 200);
        all.push(...batch);
        if (batch.length < 200) break;
        page++;
        if (page > 20) break;
      }
      setEquipment(all);
      setLoading(false);
    })();
  }, []);

  const enriched = useMemo(() => equipment.map((eq) => ({
    eq,
    inspection: inspectionStatus(eq),
    freqMonths: recommendedFrequencyMonths(eq),
  })), [equipment]);

  const filtered = useMemo(() => enriched.filter((row) => {
    if (filter !== 'all' && row.inspection.status !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      return row.eq.name?.toLowerCase().includes(q) || row.eq.location?.toLowerCase().includes(q);
    }
    return true;
  }), [enriched, search, filter]);

  const counts = useMemo(() => ({
    overdue: enriched.filter((r) => r.inspection.status === 'overdue').length,
    due_soon: enriched.filter((r) => r.inspection.status === 'due_soon').length,
    ok: enriched.filter((r) => r.inspection.status === 'ok').length,
    unknown: enriched.filter((r) => r.inspection.status === 'unknown').length,
  }), [enriched]);

  if (loading) return <div className="p-6 flex items-center gap-2 text-slate-500"><Loader2 className="w-4 h-4 animate-spin" /> Loading…</div>;

  return (
    <div className="p-4 md:p-6 max-w-[1480px] mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 flex items-center gap-2">
          <ClipboardCheck className="w-7 h-7 text-indigo-600" /> Inspection Cycles
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Re-inspection frequencies derived from component type and criticality. Drives field rounds.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <Card className={`p-4 cursor-pointer ${filter === 'overdue' ? 'ring-2 ring-red-500' : ''}`} onClick={() => setFilter('overdue')}>
          <div className="text-xs text-slate-500 uppercase">Overdue</div>
          <div className="text-2xl font-bold text-red-600 tabular-nums">{counts.overdue}</div>
        </Card>
        <Card className={`p-4 cursor-pointer ${filter === 'due_soon' ? 'ring-2 ring-amber-500' : ''}`} onClick={() => setFilter('due_soon')}>
          <div className="text-xs text-slate-500 uppercase">Due Soon (30d)</div>
          <div className="text-2xl font-bold text-amber-600 tabular-nums">{counts.due_soon}</div>
        </Card>
        <Card className={`p-4 cursor-pointer ${filter === 'ok' ? 'ring-2 ring-emerald-500' : ''}`} onClick={() => setFilter('ok')}>
          <div className="text-xs text-slate-500 uppercase">In Cycle</div>
          <div className="text-2xl font-bold text-emerald-600 tabular-nums">{counts.ok}</div>
        </Card>
        <Card className={`p-4 cursor-pointer ${filter === 'unknown' ? 'ring-2 ring-slate-500' : ''}`} onClick={() => setFilter('unknown')}>
          <div className="text-xs text-slate-500 uppercase">No History</div>
          <div className="text-2xl font-bold text-slate-600 tabular-nums">{counts.unknown}</div>
        </Card>
      </div>

      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Search className="w-4 h-4 text-slate-400" />
          <Input placeholder="Search asset or location" value={search} onChange={(e) => setSearch(e.target.value)} />
          <Button variant={filter === 'all' ? 'default' : 'outline'} onClick={() => setFilter('all')}>All</Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase text-slate-500 border-b">
                <th className="py-2 pr-3">Asset</th>
                <th className="py-2 pr-3">Location</th>
                <th className="py-2 pr-3">Frequency</th>
                <th className="py-2 pr-3">Next Due</th>
                <th className="py-2 pr-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 200).map(({ eq, inspection, freqMonths }) => (
                <tr key={eq.id} className="border-b last:border-0 hover:bg-slate-50">
                  <td className="py-2 pr-3 font-medium text-slate-900 truncate max-w-[280px]">{eq.name}</td>
                  <td className="py-2 pr-3 text-slate-600 text-xs truncate max-w-[200px]">{eq.location}</td>
                  <td className="py-2 pr-3 text-slate-600 tabular-nums">{freqMonths} mo</td>
                  <td className="py-2 pr-3 text-slate-600 tabular-nums text-xs">
                    {inspection.nextDate ? format(inspection.nextDate, 'd MMM yyyy') : '—'}
                  </td>
                  <td className="py-2 pr-3">
                    {inspection.status === 'overdue' && <Badge variant="destructive" className="text-[10px]"><AlertTriangle className="w-3 h-3 mr-1" />Overdue {Math.abs(inspection.daysUntilDue)}d</Badge>}
                    {inspection.status === 'due_soon' && <Badge className="bg-amber-100 text-amber-700 text-[10px]"><Clock className="w-3 h-3 mr-1" />{inspection.daysUntilDue}d</Badge>}
                    {inspection.status === 'ok' && <Badge className="bg-emerald-100 text-emerald-700 text-[10px]">OK</Badge>}
                    {inspection.status === 'unknown' && <Badge variant="outline" className="text-[10px]">No data</Badge>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length > 200 && <div className="text-xs text-slate-400 mt-3 text-center">Showing first 200 of {filtered.length}</div>}
        </div>
      </Card>
    </div>
  );
}