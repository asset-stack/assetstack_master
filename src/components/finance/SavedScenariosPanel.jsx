import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Save, Trash2, FlaskConical, Loader2 } from 'lucide-react';

/**
 * Save / load named scenarios for the Scenario Modeller.
 * Backed by the SavedView entity (filters object stores scenario state).
 */
export default function SavedScenariosPanel({ currentState, onLoad }) {
  const [scenarios, setScenarios] = useState([]);
  const [name, setName] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  const load = async () => {
    const all = await base44.entities.SavedView.list('-created_date', 50);
    setScenarios(all.filter((s) => s.filters?.__kind === 'scenario'));
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!name.trim()) return;
    setLoading(true);
    await base44.entities.SavedView.create({
      name: name.trim(),
      description: note.trim(),
      icon: 'FlaskConical',
      filters: { __kind: 'scenario', ...currentState },
    });
    setName('');
    setNote('');
    await load();
    setLoading(false);
  };

  const remove = async (id) => {
    await base44.entities.SavedView.delete(id);
    await load();
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <div className="flex items-center gap-2 mb-3">
        <FlaskConical className="w-4 h-4 text-purple-600" />
        <h3 className="font-semibold text-slate-900 text-sm">Saved Scenarios</h3>
        <span className="text-[10px] text-slate-500 ml-auto">{scenarios.length} saved</span>
      </div>

      <div className="grid sm:grid-cols-[1fr_1fr_auto] gap-2 mb-3">
        <Input
          placeholder="Scenario name (e.g. 'Council 2026 baseline')"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="h-8 text-[12px]"
        />
        <Input
          placeholder="Note (optional)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="h-8 text-[12px]"
        />
        <Button size="sm" onClick={save} disabled={!name.trim() || loading} className="h-8">
          {loading ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Save className="w-3 h-3 mr-1" />}
          Save current
        </Button>
      </div>

      {scenarios.length === 0 ? (
        <div className="text-[12px] text-slate-400 text-center py-3">
          No saved scenarios yet. Adjust the sliders above and click "Save current" to capture this configuration.
        </div>
      ) : (
        <div className="space-y-1.5 max-h-[200px] overflow-y-auto">
          {scenarios.map((s) => (
            <div key={s.id} className="flex items-center gap-2 p-2 rounded-md border border-slate-100 hover:bg-slate-50">
              <div className="flex-1 min-w-0">
                <div className="text-[12px] font-semibold text-slate-900 truncate">{s.name}</div>
                {s.description && (
                  <div className="text-[10px] text-slate-500 truncate">{s.description}</div>
                )}
                <div className="text-[10px] text-slate-400 tabular-nums">
                  ${(s.filters?.annualBudget || 0).toLocaleString()} budget · {s.filters?.inflation}% infl · {s.filters?.deferralRate}% defer
                </div>
              </div>
              <Button size="sm" variant="outline" onClick={() => onLoad(s.filters)} className="h-7 text-[11px]">
                Load
              </Button>
              <Button size="icon" variant="ghost" onClick={() => remove(s.id)} className="h-7 w-7 text-rose-500 hover:text-rose-700">
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}