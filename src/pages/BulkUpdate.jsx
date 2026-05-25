import React, { useState, useEffect, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { secureEntity } from '@/lib/secureEntities';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Edit3, Search, Download, Upload } from 'lucide-react';
import { toast } from 'sonner';

export default function BulkUpdate() {
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterLocation, setFilterLocation] = useState('');
  const [filterComponent, setFilterComponent] = useState('');
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [newGrade, setNewGrade] = useState('');
  const [newLifeConsumed, setNewLifeConsumed] = useState('');
  const [submitting, setSubmitting] = useState(false);

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

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return equipment.filter((e) => {
      if (filterLocation && e.location !== filterLocation) return false;
      if (filterComponent && e.specifications?.component_type !== filterComponent) return false;
      if (q && !e.name?.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [equipment, search, filterLocation, filterComponent]);

  const toggle = (id) => {
    const s = new Set(selectedIds);
    if (s.has(id)) s.delete(id); else s.add(id);
    setSelectedIds(s);
  };

  const toggleAll = () => {
    if (selectedIds.size === filtered.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(filtered.map((e) => e.id)));
  };

  const apply = async () => {
    if (selectedIds.size === 0) return;
    if (!newGrade && !newLifeConsumed) {
      toast.error('Set a new grade or life consumed');
      return;
    }
    setSubmitting(true);
    try {
      const updates = {};
      if (newGrade) updates.condition_grade = Number(newGrade);
      if (newLifeConsumed) updates.life_consumed = Number(newLifeConsumed) / 100;
      const res = await base44.functions.invoke('bulkUpdateConditions', {
        equipment_ids: Array.from(selectedIds),
        updates,
      });
      toast.success(`Updated ${res.data.updated} of ${res.data.requested}`);
      setSelectedIds(new Set());
      // Re-fetch
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
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const exportCSV = async () => {
    try {
      const res = await fetch('/functions/exportBunburyCSV', { method: 'POST' });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bunbury-register-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      toast.success('CSV downloaded');
    } catch (err) {
      // Fall back to client-side export
      const rows = [['id', 'name', 'location', 'component_type', 'condition_grade', 'life_consumed', 'replacement_value']];
      for (const eq of equipment) {
        rows.push([
          eq.id, eq.name, eq.location,
          eq.specifications?.component_type || '',
          eq.specifications?.condition_grade ?? '',
          eq.specifications?.life_consumed ?? '',
          eq.specifications?.replacement_value ?? '',
        ]);
      }
      const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bunbury-register-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
    }
  };

  const locations = useMemo(() => Array.from(new Set(equipment.map((e) => e.location).filter(Boolean))).sort(), [equipment]);
  const components = useMemo(() => Array.from(new Set(equipment.map((e) => e.specifications?.component_type).filter(Boolean))).sort(), [equipment]);

  if (loading) return <div className="p-6 flex items-center gap-2 text-slate-500"><Loader2 className="w-4 h-4 animate-spin" /> Loading…</div>;

  return (
    <div className="p-4 md:p-6 max-w-[1480px] mx-auto">
      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 flex items-center gap-2">
            <Edit3 className="w-7 h-7 text-indigo-600" /> Bulk Condition Update
          </h1>
          <p className="text-sm text-slate-500 mt-1">Filter, select, and update many assets at once.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportCSV}><Download className="w-4 h-4 mr-2" /> Export CSV</Button>
        </div>
      </div>

      <Card className="p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
          <div>
            <label className="text-xs text-slate-600 uppercase">Search</label>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 w-4 h-4 text-slate-400" />
              <Input className="pl-8" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Name…" />
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-600 uppercase">Location</label>
            <select value={filterLocation} onChange={(e) => setFilterLocation(e.target.value)} className="w-full h-9 border rounded px-2 text-sm">
              <option value="">All locations</option>
              {locations.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-600 uppercase">Component Type</label>
            <select value={filterComponent} onChange={(e) => setFilterComponent(e.target.value)} className="w-full h-9 border rounded px-2 text-sm">
              <option value="">All components</option>
              {components.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
        <div className="text-xs text-slate-500">{filtered.length} matching · {selectedIds.size} selected</div>
      </Card>

      {selectedIds.size > 0 && (
        <Card className="p-4 mb-4 bg-indigo-50 border-indigo-200">
          <div className="flex flex-wrap items-end gap-3">
            <div>
              <label className="text-xs text-slate-700 uppercase font-semibold">New Grade (1–5)</label>
              <Input type="number" min={1} max={5} value={newGrade} onChange={(e) => setNewGrade(e.target.value)} className="w-24" />
            </div>
            <div>
              <label className="text-xs text-slate-700 uppercase font-semibold">Life Consumed %</label>
              <Input type="number" min={0} max={100} value={newLifeConsumed} onChange={(e) => setNewLifeConsumed(e.target.value)} className="w-32" />
            </div>
            <Button onClick={apply} disabled={submitting} className="bg-indigo-600 hover:bg-indigo-700">
              {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Applying…</> :
                <>Apply to {selectedIds.size} assets</>}
            </Button>
          </div>
        </Card>
      )}

      <Card className="p-3">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase text-slate-500 border-b">
                <th className="py-2 px-2 w-8">
                  <Checkbox checked={selectedIds.size === filtered.length && filtered.length > 0} onCheckedChange={toggleAll} />
                </th>
                <th className="py-2 pr-3">Asset</th>
                <th className="py-2 pr-3">Location</th>
                <th className="py-2 pr-3">Component</th>
                <th className="py-2 pr-3">Grade</th>
                <th className="py-2 pr-3">Life %</th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 300).map((eq) => (
                <tr key={eq.id} className={`border-b last:border-0 ${selectedIds.has(eq.id) ? 'bg-indigo-50' : 'hover:bg-slate-50'}`}>
                  <td className="py-2 px-2"><Checkbox checked={selectedIds.has(eq.id)} onCheckedChange={() => toggle(eq.id)} /></td>
                  <td className="py-2 pr-3 font-medium text-slate-900 truncate max-w-[260px]">{eq.name}</td>
                  <td className="py-2 pr-3 text-xs text-slate-600 truncate max-w-[160px]">{eq.location}</td>
                  <td className="py-2 pr-3 text-xs text-slate-600">{eq.specifications?.component_type}</td>
                  <td className="py-2 pr-3 tabular-nums">C{eq.specifications?.condition_grade ?? '?'}</td>
                  <td className="py-2 pr-3 tabular-nums">{Math.round((Number(eq.specifications?.life_consumed) || 0) * 100)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length > 300 && <div className="text-xs text-slate-400 text-center mt-2">Showing 300 of {filtered.length} — narrow filters to see more</div>}
        </div>
      </Card>
    </div>
  );
}