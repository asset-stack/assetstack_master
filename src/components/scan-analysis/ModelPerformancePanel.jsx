import React, { useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { TrendingUp, TrendingDown, Sparkles, Target } from 'lucide-react';

// Computes precision (approved / reviewed) per AI model version, using human review as ground truth.
// approved = AI was right.  corrected = AI was partly wrong.  rejected = AI was wrong.
function summarize(reports) {
  const by = {};
  for (const r of reports || []) {
    const v = r.ai_model_version || 'unknown';
    if (!by[v]) by[v] = { version: v, approved: 0, corrected: 0, rejected: 0, total: 0 };
    if (r.review_status === 'approved') by[v].approved += 1;
    else if (r.review_status === 'corrected') by[v].corrected += 1;
    else if (r.review_status === 'rejected') by[v].rejected += 1;
    else continue;
    by[v].total += 1;
  }
  return Object.values(by)
    .filter((row) => row.total >= 3) // ignore noisy buckets with too few samples
    .map((row) => ({
      ...row,
      precision: row.total > 0 ? row.approved / row.total : 0,
    }))
    .sort((a, b) => (a.version < b.version ? 1 : -1));
}

export default function ModelPerformancePanel() {
  const { data: reports = [], isLoading } = useQuery({
    queryKey: ['conditionReportsForModelPerf'],
    queryFn: () => base44.entities.ConditionReport.list('-created_date', 500),
    staleTime: 60_000,
  });

  const rows = useMemo(() => summarize(reports), [reports]);

  if (isLoading) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-4 text-xs text-slate-500">
        Loading model performance…
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-1">
          <Target className="w-4 h-4 text-indigo-600" />
          <h3 className="font-bold text-sm text-slate-900">Model performance</h3>
        </div>
        <p className="text-xs text-slate-500">
          Once human reviewers verify, correct, or reject a few AI findings, precision metrics will show up here per model version.
        </p>
      </div>
    );
  }

  const best = rows.reduce((a, b) => (a.precision > b.precision ? a : b), rows[0]);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-indigo-600" />
          <h3 className="font-bold text-sm text-slate-900">Model performance</h3>
        </div>
        <span className="text-[10px] text-slate-500">precision per version (from human review)</span>
      </div>
      <div className="space-y-2">
        {rows.map((row) => {
          const pct = Math.round(row.precision * 100);
          const isBest = row.version === best.version;
          return (
            <div key={row.version} className="flex items-center gap-3">
              <div className="w-24 text-xs font-mono text-slate-700 truncate flex items-center gap-1">
                {isBest ? <Sparkles className="w-3 h-3 text-emerald-600" /> : null}
                {row.version}
              </div>
              <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full ${isBest ? 'bg-emerald-500' : 'bg-indigo-400'}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <div className="w-32 text-right text-[11px] text-slate-600 tabular-nums">
                <span className={`font-bold ${isBest ? 'text-emerald-700' : 'text-slate-800'}`}>{pct}%</span>
                <span className="text-slate-400"> · {row.total} reviewed</span>
              </div>
            </div>
          );
        })}
      </div>
      <p className="text-[10px] text-slate-500 mt-3">
        Precision = approved / (approved + corrected + rejected). Higher is better.
        Bump <code className="font-mono">ai_model_version</code> in <code className="font-mono">analyzeScanCondition</code> after prompt or model changes to see the impact here.
      </p>
    </div>
  );
}