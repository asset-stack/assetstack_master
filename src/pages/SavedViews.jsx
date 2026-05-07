import React, { useState, useEffect, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Filter } from 'lucide-react';
import { SAVED_VIEWS, applyView } from '@/lib/savedViews';
import { fmtMoney, deriveCRC } from '@/lib/assetMetrics';
import { Link } from 'react-router-dom';

export default function SavedViews() {
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState(SAVED_VIEWS[0].id);

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

  const counts = useMemo(() => {
    const m = {};
    for (const v of SAVED_VIEWS) m[v.id] = applyView(equipment, v.id).length;
    return m;
  }, [equipment]);

  const results = useMemo(() => applyView(equipment, activeView), [equipment, activeView]);

  if (loading) return <div className="p-6 flex items-center gap-2 text-slate-500"><Loader2 className="w-4 h-4 animate-spin" /> Loading…</div>;

  return (
    <div className="p-4 md:p-6 max-w-[1480px] mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 flex items-center gap-2">
          <Filter className="w-7 h-7 text-indigo-600" /> Smart Filters
        </h1>
        <p className="text-sm text-slate-500 mt-1">One-click views across the whole register.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        {SAVED_VIEWS.map((v) => (
          <button key={v.id} onClick={() => setActiveView(v.id)}
            className={`text-left p-4 rounded-xl border-2 ${activeView === v.id ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
            <div className="font-semibold text-slate-900 text-sm">{v.label}</div>
            <div className="text-2xl font-bold tabular-nums mt-1">{counts[v.id]}</div>
            <div className="text-[11px] text-slate-500 mt-1 line-clamp-1">{v.description}</div>
          </button>
        ))}
      </div>

      <Card className="p-4">
        <h3 className="font-bold text-slate-900 mb-3">{SAVED_VIEWS.find((v) => v.id === activeView)?.label} ({results.length})</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase text-slate-500 border-b">
                <th className="py-2 pr-3">Asset</th>
                <th className="py-2 pr-3">Location</th>
                <th className="py-2 pr-3">Component</th>
                <th className="py-2 pr-3">Condition</th>
                <th className="py-2 pr-3">CRC</th>
              </tr>
            </thead>
            <tbody>
              {results.slice(0, 200).map((eq) => (
                <tr key={eq.id} className="border-b last:border-0 hover:bg-slate-50">
                  <td className="py-2 pr-3 font-medium text-slate-900 truncate max-w-[280px]">{eq.name}</td>
                  <td className="py-2 pr-3 text-xs text-slate-600 truncate max-w-[200px]">{eq.location}</td>
                  <td className="py-2 pr-3 text-xs text-slate-600">{eq.specifications?.component_type}</td>
                  <td className="py-2 pr-3"><Badge variant="outline">C{eq.specifications?.condition_grade ?? '?'}</Badge></td>
                  <td className="py-2 pr-3 tabular-nums">{fmtMoney(deriveCRC(eq))}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {results.length > 200 && <div className="text-xs text-slate-400 text-center mt-3">Showing 200 of {results.length}</div>}
        </div>
      </Card>
    </div>
  );
}