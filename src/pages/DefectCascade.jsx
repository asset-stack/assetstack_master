import React, { useState, useEffect, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { GitBranch, Search, Loader2, AlertTriangle } from 'lucide-react';

export default function DefectCascade() {
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [predictions, setPredictions] = useState(null);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    (async () => {
      const all = [];
      let page = 0;
      while (true) {
        const batch = await base44.entities.Equipment.list('-created_date', 200, page * 200);
        all.push(...batch);
        if (batch.length < 200) break;
        page++;
        if (page > 20) break;
      }
      setEquipment(all);
      setLoading(false);
    })();
  }, []);

  const withDefects = useMemo(() => {
    return equipment.filter((e) => e.specifications?.defect_description || e.specifications?.defect_urgency);
  }, [equipment]);

  const filtered = useMemo(() => {
    if (!search) return withDefects.slice(0, 30);
    const q = search.toLowerCase();
    return withDefects.filter((e) => e.name?.toLowerCase().includes(q) || e.location?.toLowerCase().includes(q)).slice(0, 30);
  }, [withDefects, search]);

  const run = async (eq) => {
    setSelected(eq);
    setRunning(true);
    setPredictions(null);
    try {
      const res = await base44.functions.invoke('defectCascadePredict', { equipment_id: eq.id });
      setPredictions(res.data);
    } finally {
      setRunning(false);
    }
  };

  if (loading) return <div className="p-6 flex items-center gap-2 text-slate-500"><Loader2 className="w-4 h-4 animate-spin" /> Loading…</div>;

  return (
    <div className="p-4 md:p-6 max-w-[1480px] mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 flex items-center gap-2">
          <GitBranch className="w-7 h-7 text-rose-600" /> Defect Cascade Predictor
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Pick a defective asset — see which adjacent assets are likely to fail next.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Search className="w-4 h-4 text-slate-400" />
            <Input placeholder="Search defective assets…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
            {filtered.map((eq) => (
              <button key={eq.id} onClick={() => run(eq)}
                className={`w-full text-left p-3 rounded-lg border hover:bg-rose-50 hover:border-rose-300 ${selected?.id === eq.id ? 'bg-rose-50 border-rose-300' : ''}`}>
                <div className="font-semibold text-slate-900 text-sm truncate">{eq.name}</div>
                <div className="text-xs text-slate-500 truncate">{eq.specifications?.room_location} · {eq.specifications?.defect_urgency || ''}</div>
              </button>
            ))}
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" /> Cascade predictions
          </h3>
          {!selected && <div className="text-sm text-slate-400 text-center py-12">Select a defective asset on the left</div>}
          {running && <div className="flex items-center gap-2 text-slate-500 text-sm py-8 justify-center"><Loader2 className="w-4 h-4 animate-spin" /> Computing…</div>}
          {predictions && (
            <div>
              <div className="bg-rose-50 border border-rose-200 rounded-lg p-3 mb-3 text-sm">
                <div className="font-bold text-slate-900">{predictions.seed.name}</div>
                <div className="text-xs text-slate-600">Room: {predictions.seed.room} · {predictions.total_in_room} adjacent assets</div>
              </div>
              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
                {predictions.predictions.map((p) => (
                  <div key={p.equipment_id} className="p-3 bg-white border rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <div className="font-semibold text-slate-900 text-sm truncate">{p.equipment_name}</div>
                      <Badge className={p.cascade_probability >= 70 ? 'bg-red-100 text-red-700' : p.cascade_probability >= 50 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'}>
                        {p.cascade_probability}%
                      </Badge>
                    </div>
                    <div className="text-xs text-slate-500">{p.rationale}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}