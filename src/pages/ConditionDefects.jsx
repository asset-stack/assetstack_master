import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ClipboardCheck, Loader2, Search } from 'lucide-react';
import { toast } from 'sonner';
import DefectTable from '@/components/defects/DefectTable';

export default function ConditionDefects() {
  const [defects, setDefects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const load = useCallback(async () => {
    setLoading(true);
    const rows = await base44.entities.InspectorDefect.list('-created_date', 1000);
    // De-duplicate: each defect repeats across program years — keep one per defect_id.
    const byId = new Map();
    for (const r of rows) {
      const key = r.defect_id || r.id;
      if (!byId.has(key)) byId.set(key, r);
    }
    setDefects(Array.from(byId.values()));
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleVerify = async (defect, status) => {
    setSavingId(defect.id);
    try {
      await base44.entities.InspectorDefect.update(defect.id, { verify_status: status });
      setDefects((ds) => ds.map((d) => (d.id === defect.id ? { ...d, verify_status: status } : d)));
      toast.success(status === 'verified' ? '✓ Verified' : status === 'rejected' ? 'Marked as rejected' : 'Reset to pending');
    } catch (err) {
      toast.error('Could not save: ' + err.message);
    } finally {
      setSavingId(null);
    }
  };

  const filtered = useMemo(() => {
    return defects.filter((d) => {
      if (priorityFilter !== 'all' && (d.priority || '').toLowerCase() !== priorityFilter) return false;
      if (statusFilter !== 'all' && (d.verify_status || 'pending') !== statusFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        const hay = `${d.defect_id} ${d.room_name} ${d.room_code} ${d.description} ${d.rectification}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [defects, priorityFilter, statusFilter, search]);

  const stats = useMemo(() => {
    const verified = defects.filter((d) => d.verify_status === 'verified').length;
    const rejected = defects.filter((d) => d.verify_status === 'rejected').length;
    const pending = defects.length - verified - rejected;
    return { total: defects.length, verified, rejected, pending };
  }, [defects]);

  if (loading) {
    return (
      <div className="p-6 flex items-center gap-2 text-slate-500">
        <Loader2 className="w-4 h-4 animate-spin" /> Loading condition defects…
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <ClipboardCheck className="w-6 h-6 text-indigo-600" /> Condition Defects
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Full inspector condition register · verify each defect against the report
        </p>
      </div>

      {/* Stat strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <Card className="p-3"><div className="text-[11px] uppercase font-semibold text-slate-500">Total</div><div className="text-2xl font-bold text-slate-900">{stats.total}</div></Card>
        <Card className="p-3"><div className="text-[11px] uppercase font-semibold text-slate-500">Verified</div><div className="text-2xl font-bold text-emerald-600">{stats.verified}</div></Card>
        <Card className="p-3"><div className="text-[11px] uppercase font-semibold text-slate-500">Rejected</div><div className="text-2xl font-bold text-rose-600">{stats.rejected}</div></Card>
        <Card className="p-3"><div className="text-[11px] uppercase font-semibold text-slate-500">Pending</div><div className="text-2xl font-bold text-slate-700">{stats.pending}</div></Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <Input placeholder="Search defects, rooms, descriptions…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9" />
        </div>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="h-9 w-36 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All priorities</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-9 w-36 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="verified">Verified</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="text-xs text-slate-500 mb-2">{filtered.length} of {defects.length} defects</div>

      <DefectTable defects={filtered} savingId={savingId} onVerify={handleVerify} />
    </div>
  );
}