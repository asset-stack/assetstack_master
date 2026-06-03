import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ClipboardCheck, Loader2, Search, LayoutList, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import DefectTable from '@/components/defects/DefectTable';
import ConditionRegisterTable from '@/components/defects/ConditionRegisterTable';

export default function ConditionDefects() {
  const [components, setComponents] = useState([]);
  const [defects, setDefects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);

  const [view, setView] = useState('register'); // register | defects
  const [search, setSearch] = useState('');
  const [groupFilter, setGroupFilter] = useState('all');
  const [gradeFilter, setGradeFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sort, setSort] = useState({ field: 'room_code', dir: 'asc' });

  const load = useCallback(async () => {
    setLoading(true);
    const [comps, defs] = await Promise.all([
      base44.entities.AssessmentComponent.list('-created_date', 5000),
      base44.entities.InspectorDefect.list('-created_date', 2000),
    ]);
    setComponents(comps);
    setDefects(defs);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSort = useCallback((field) => {
    setSort((s) => (s.field === field ? { field, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { field, dir: 'asc' }));
  }, []);

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

  const groups = useMemo(() => Array.from(new Set(components.map((c) => c.group).filter(Boolean))).sort(), [components]);

  const filteredComponents = useMemo(() => {
    const q = search.toLowerCase();
    let list = components.filter((c) => {
      if (groupFilter !== 'all' && c.group !== groupFilter) return false;
      if (gradeFilter !== 'all' && Math.round(c.condition_grade_current || 0) !== Number(gradeFilter)) return false;
      if (q) {
        const hay = `${c.room_code} ${c.room_name} ${c.group} ${c.component_type} ${c.subtype} ${c.notes}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
    const { field, dir } = sort;
    list = [...list].sort((a, b) => {
      const av = a[field] ?? '';
      const bv = b[field] ?? '';
      const cmp = typeof av === 'number' && typeof bv === 'number' ? av - bv : String(av).localeCompare(String(bv), undefined, { numeric: true });
      return dir === 'asc' ? cmp : -cmp;
    });
    return list;
  }, [components, groupFilter, gradeFilter, search, sort]);

  const filteredDefects = useMemo(() => {
    const q = search.toLowerCase();
    return defects.filter((d) => {
      if (priorityFilter !== 'all' && (d.priority || '').toLowerCase() !== priorityFilter) return false;
      if (statusFilter !== 'all' && (d.verify_status || 'pending') !== statusFilter) return false;
      if (q) {
        const hay = `${d.defect_id} ${d.room_name} ${d.room_code} ${d.description} ${d.rectification}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [defects, priorityFilter, statusFilter, search]);

  const stats = useMemo(() => {
    const poor = components.filter((c) => Math.round(c.condition_grade_current || 0) >= 4).length;
    const replVal = components.reduce((s, c) => s + (c.base_replacement_cost || 0), 0);
    return { components: components.length, defects: defects.length, poor, replVal };
  }, [components, defects]);

  if (loading) {
    return (
      <div className="p-6 flex items-center gap-2 text-slate-500">
        <Loader2 className="w-4 h-4 animate-spin" /> Loading condition register…
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <ClipboardCheck className="w-6 h-6 text-indigo-600" /> Condition Register
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Full condition assessment register · every component and defect for the assessment
        </p>
      </div>

      {/* Stat strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <Card className="p-3"><div className="text-[11px] uppercase font-semibold text-slate-500">Components</div><div className="text-2xl font-bold text-slate-900">{stats.components}</div></Card>
        <Card className="p-3"><div className="text-[11px] uppercase font-semibold text-slate-500">Defects</div><div className="text-2xl font-bold text-slate-900">{stats.defects}</div></Card>
        <Card className="p-3"><div className="text-[11px] uppercase font-semibold text-slate-500">Poor / Failed (4–5)</div><div className="text-2xl font-bold text-rose-600">{stats.poor}</div></Card>
        <Card className="p-3"><div className="text-[11px] uppercase font-semibold text-slate-500">Replacement Value</div><div className="text-2xl font-bold text-slate-900">${Math.round(stats.replVal).toLocaleString()}</div></Card>
      </div>

      {/* View toggle */}
      <div className="flex items-center gap-1 mb-3 bg-slate-100 p-1 rounded-lg w-fit">
        <button
          onClick={() => setView('register')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${view === 'register' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <LayoutList className="w-3.5 h-3.5" /> Full Register ({components.length})
        </button>
        <button
          onClick={() => setView('defects')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${view === 'defects' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <AlertTriangle className="w-3.5 h-3.5" /> Defects ({defects.length})
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <Input placeholder="Search rooms, components, descriptions…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9" />
        </div>

        {view === 'register' ? (
          <>
            <Select value={groupFilter} onValueChange={setGroupFilter}>
              <SelectTrigger className="h-9 w-40 text-xs"><SelectValue placeholder="Group" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All groups</SelectItem>
                {groups.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={gradeFilter} onValueChange={setGradeFilter}>
              <SelectTrigger className="h-9 w-36 text-xs"><SelectValue placeholder="Grade" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All grades</SelectItem>
                <SelectItem value="1">1 · Excellent</SelectItem>
                <SelectItem value="2">2 · Good</SelectItem>
                <SelectItem value="3">3 · Fair</SelectItem>
                <SelectItem value="4">4 · Poor</SelectItem>
                <SelectItem value="5">5 · Failed</SelectItem>
              </SelectContent>
            </Select>
          </>
        ) : (
          <>
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
          </>
        )}
      </div>

      {view === 'register' ? (
        <>
          <div className="text-xs text-slate-500 mb-2">{filteredComponents.length} of {components.length} components</div>
          <ConditionRegisterTable rows={filteredComponents} sort={sort} onSort={handleSort} />
        </>
      ) : (
        <>
          <div className="text-xs text-slate-500 mb-2">{filteredDefects.length} of {defects.length} defects</div>
          <DefectTable defects={filteredDefects} savingId={savingId} onVerify={handleVerify} />
        </>
      )}
    </div>
  );
}