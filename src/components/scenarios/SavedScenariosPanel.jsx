import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Bookmark, Trash2, Pin, Save, Loader2 } from 'lucide-react';
import { fmtMoney } from '@/lib/assetMetrics';

export default function SavedScenariosPanel({ current, onLoad }) {
  const [scenarios, setScenarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');
  const [note, setNote] = useState('');

  const load = async () => {
    setLoading(true);
    const data = await base44.entities.SavedScenario.list('-is_pinned,-created_date', 50);
    setScenarios(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!name.trim() || !current) return;
    setSaving(true);
    await base44.entities.SavedScenario.create({
      name: name.trim(),
      description: note.trim() || undefined,
      annual_budget: current.annualBudget,
      inflation_pct: current.inflation,
      deferral_pct: current.deferralRate,
      climate_stress_pct: current.climateStress,
      final_backlog: current.finalBacklog,
      delta_vs_baseline: current.delta,
    });
    setName(''); setNote('');
    setSaving(false);
    load();
  };

  const remove = async (id) => {
    await base44.entities.SavedScenario.delete(id);
    load();
  };

  const togglePin = async (s) => {
    await base44.entities.SavedScenario.update(s.id, { is_pinned: !s.is_pinned });
    load();
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <Bookmark className="w-4 h-4 text-indigo-600" />
        <h3 className="font-semibold text-slate-900 text-sm">Saved Scenarios</h3>
        <span className="text-[10px] text-slate-400 ml-auto">{scenarios.length}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-3 pb-3 border-b border-slate-100">
        <Input
          placeholder="Scenario name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="h-8 text-[12px]"
        />
        <Input
          placeholder="Stakeholder note (optional)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="h-8 text-[12px] md:col-span-1"
        />
        <Button size="sm" onClick={save} disabled={!name.trim() || saving} className="h-8">
          {saving ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Save className="w-3 h-3 mr-1" />}
          Save current
        </Button>
      </div>

      {loading ? (
        <div className="text-[12px] text-slate-400 py-4 text-center">Loading…</div>
      ) : scenarios.length === 0 ? (
        <div className="text-[12px] text-slate-400 py-4 text-center">
          No saved scenarios yet. Save one to compare and share with stakeholders.
        </div>
      ) : (
        <div className="space-y-1.5">
          {scenarios.map((s) => (
            <div key={s.id} className="flex items-center gap-2 py-2 px-2 rounded-lg hover:bg-slate-50 group">
              <button onClick={() => togglePin(s)} className="shrink-0">
                <Pin className={`w-3.5 h-3.5 ${s.is_pinned ? 'text-indigo-600 fill-indigo-600' : 'text-slate-300'}`} />
              </button>
              <div className="flex-1 min-w-0">
                <div className="text-[12px] font-semibold text-slate-900 truncate">{s.name}</div>
                <div className="text-[10px] text-slate-500 truncate">
                  {fmtMoney(s.annual_budget)}/yr · {s.inflation_pct}% inflation · {s.deferral_pct}% deferred · climate {s.climate_stress_pct}%
                  {s.description && ` · ${s.description}`}
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-[10px] uppercase text-slate-400 font-semibold">Final backlog</div>
                <div className="text-[12px] font-bold tabular-nums text-amber-600">{fmtMoney(s.final_backlog)}</div>
              </div>
              <Button size="sm" variant="outline" onClick={() => onLoad?.(s)} className="h-7 text-[11px]">
                Load
              </Button>
              <Button size="icon" variant="ghost" onClick={() => remove(s.id)} className="h-7 w-7 opacity-0 group-hover:opacity-100">
                <Trash2 className="w-3 h-3 text-rose-500" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}