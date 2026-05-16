import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle } from 'lucide-react';

const SCORE = {
  unlikely: 1,
  possible: 2,
  likely: 3,
  almost_certain: 4,
  minor: 1,
  moderate: 2,
  major: 3,
  severe: 4
};

function riskColor(score) {
  if (score >= 12) return 'bg-rose-100 text-rose-700 border-rose-200';
  if (score >= 6) return 'bg-amber-100 text-amber-700 border-amber-200';
  return 'bg-emerald-100 text-emerald-700 border-emerald-200';
}

export default function ProjectRisks({ risks = [] }) {
  if (!risks.length) {
    return (
      <Card className="p-6 text-center text-sm text-slate-500">
        No risks logged. Add risks to track and mitigate them.
      </Card>
    );
  }

  return (
    <Card className="divide-y divide-slate-100">
      {risks.map((r) => {
        const score = (SCORE[r.likelihood] || 1) * (SCORE[r.impact] || 1);
        return (
          <div key={r.id} className="p-4">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex items-start gap-2 min-w-0 flex-1">
                <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-slate-900">{r.title}</div>
                  {r.owner && (
                    <div className="text-[11px] text-slate-500">Owner · {r.owner}</div>
                  )}
                </div>
              </div>
              <Badge className={`border ${riskColor(score)} text-[10px] font-bold shrink-0`}>
                Risk {score}
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-500 mb-2">
              <span className="capitalize">L: {r.likelihood?.replace('_', ' ')}</span>
              <span>·</span>
              <span className="capitalize">I: {r.impact}</span>
              <span>·</span>
              <span className="capitalize">{r.status}</span>
            </div>
            {r.mitigation && (
              <div className="text-xs text-slate-600 bg-slate-50 rounded-md p-2">
                <span className="font-semibold text-slate-700">Mitigation: </span>
                {r.mitigation}
              </div>
            )}
          </div>
        );
      })}
    </Card>
  );
}