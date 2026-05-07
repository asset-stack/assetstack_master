import React, { useState, useEffect, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShieldAlert, Loader2, Copy } from 'lucide-react';
import { detectIssues, detectDuplicates, summariseQuality, ISSUE_SEVERITY } from '@/lib/dataQuality';

export default function DataQuality() {
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const summary = useMemo(() => summariseQuality(equipment), [equipment]);
  const duplicates = useMemo(() => detectDuplicates(equipment), [equipment]);

  const issuesByAsset = useMemo(() => {
    return equipment
      .map((eq) => ({ eq, issues: detectIssues(eq) }))
      .filter((row) => row.issues.length > 0)
      .sort((a, b) => {
        const order = { critical: 0, high: 1, medium: 2, low: 3 };
        const aMin = Math.min(...a.issues.map((i) => order[i.severity]));
        const bMin = Math.min(...b.issues.map((i) => order[i.severity]));
        return aMin - bMin;
      });
  }, [equipment]);

  if (loading) return <div className="p-6 flex items-center gap-2 text-slate-500"><Loader2 className="w-4 h-4 animate-spin" /> Loading…</div>;

  return (
    <div className="p-4 md:p-6 max-w-[1480px] mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 flex items-center gap-2">
          <ShieldAlert className="w-7 h-7 text-amber-600" /> Data Quality
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Suspicious, contradictory, or incomplete records — fix the data, fix the predictions.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-5">
        <Card className="p-4">
          <div className="text-xs text-slate-500 uppercase">Healthy</div>
          <div className="text-2xl font-bold text-emerald-600 tabular-nums">{summary.healthy}</div>
          <div className="text-[11px] text-slate-400">{summary.total > 0 ? Math.round((summary.healthy / summary.total) * 100) : 0}% of register</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-slate-500 uppercase">Critical Issues</div>
          <div className="text-2xl font-bold text-red-600 tabular-nums">{summary.counts.critical || 0}</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-slate-500 uppercase">High</div>
          <div className="text-2xl font-bold text-orange-600 tabular-nums">{summary.counts.high || 0}</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-slate-500 uppercase">Medium</div>
          <div className="text-2xl font-bold text-amber-600 tabular-nums">{summary.counts.medium || 0}</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-slate-500 uppercase">Duplicates</div>
          <div className="text-2xl font-bold text-purple-600 tabular-nums">{duplicates.length}</div>
          <div className="text-[11px] text-slate-400">name + location matches</div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card className="p-4">
          <h3 className="font-bold text-slate-900 mb-3">Issues by asset ({issuesByAsset.length})</h3>
          <div className="space-y-2 max-h-[700px] overflow-y-auto pr-2">
            {issuesByAsset.slice(0, 100).map(({ eq, issues }) => (
              <div key={eq.id} className="p-3 bg-slate-50 rounded-lg border">
                <div className="flex items-center justify-between mb-1">
                  <div className="font-semibold text-slate-900 text-sm truncate">{eq.name}</div>
                  <div className="text-xs text-slate-500">{eq.location}</div>
                </div>
                <div className="space-y-1">
                  {issues.map((i, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs">
                      <Badge className={`text-[9px] bg-${ISSUE_SEVERITY[i.severity].color}-100 text-${ISSUE_SEVERITY[i.severity].color}-800`}>
                        {i.severity}
                      </Badge>
                      <span className="text-slate-700">{i.message}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {issuesByAsset.length > 100 && <div className="text-xs text-slate-400 text-center">…{issuesByAsset.length - 100} more</div>}
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
            <Copy className="w-4 h-4" /> Probable duplicates ({duplicates.length})
          </h3>
          <div className="space-y-3 max-h-[700px] overflow-y-auto pr-2">
            {duplicates.length === 0 && <div className="text-sm text-slate-400">No duplicates detected.</div>}
            {duplicates.slice(0, 50).map((group, i) => (
              <div key={i} className="p-3 bg-purple-50 rounded-lg border border-purple-100">
                <div className="text-xs text-purple-700 font-semibold mb-2">Group of {group.length}</div>
                {group.map((eq) => (
                  <div key={eq.id} className="text-xs text-slate-700 py-0.5">
                    <span className="font-medium">{eq.name}</span> · {eq.location}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}