import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { secureEntity } from '@/lib/secureEntities';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, AlertTriangle, ShieldCheck, Clock } from 'lucide-react';

const STATUS_TONE = {
  critical: 'bg-rose-100 text-rose-700',
  degraded: 'bg-amber-100 text-amber-700',
  maintenance: 'bg-blue-100 text-blue-700',
  offline: 'bg-slate-200 text-slate-700',
  operational: 'bg-emerald-100 text-emerald-700'
};

export default function ProjectAssetIntelligence({ project }) {
  const ids = project?.equipment_ids || [];

  const { data: equipment = [], isLoading } = useQuery({
    queryKey: ['project-asset-intel', project?.id],
    queryFn: async () => {
      const all = await secureEntity('Equipment').list('-updated_date', 500);
      return all.filter((e) => ids.includes(e.id));
    },
    enabled: ids.length > 0
  });

  const targetEnd = project?.target_end_date ? new Date(project.target_end_date) : null;

  const analysis = useMemo(() => {
    const risks = [];
    equipment.forEach((e) => {
      if (e.status === 'critical' || e.risk_level === 'critical') {
        risks.push({
          asset: e,
          level: 'critical',
          reason: 'Asset is in critical condition — schedule dependency at risk.'
        });
      } else if (
        targetEnd &&
        e.predicted_failure_date &&
        new Date(e.predicted_failure_date) < targetEnd
      ) {
        risks.push({
          asset: e,
          level: 'warning',
          reason: `Predicted failure (${new Date(e.predicted_failure_date).toLocaleDateString()}) lands before project completion — consider re-sequencing.`
        });
      } else if (e.status === 'degraded' || (e.health_score != null && e.health_score < 50)) {
        risks.push({
          asset: e,
          level: 'warning',
          reason: `Health score ${Math.round(e.health_score ?? 0)} — degrading faster than plan assumes.`
        });
      }
    });
    const avgHealth = equipment.length
      ? Math.round(equipment.reduce((s, e) => s + (e.health_score || 0), 0) / equipment.length)
      : null;
    return { risks, avgHealth };
  }, [equipment, targetEnd]);

  if (!ids.length) {
    return (
      <Card className="p-6 text-center text-sm text-slate-500">
        No assets linked to this project. Link assets to unlock live schedule-risk intelligence.
      </Card>
    );
  }

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-indigo-600" />
          <h3 className="font-semibold text-slate-900 text-sm">Live Asset Risk Intelligence</h3>
        </div>
        {analysis.avgHealth != null && (
          <Badge variant="outline" className="tabular-nums">
            Avg health {analysis.avgHealth}
          </Badge>
        )}
      </div>

      {isLoading ? (
        <div className="text-sm text-slate-500 py-6 text-center">Scanning linked assets…</div>
      ) : analysis.risks.length === 0 ? (
        <div className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 rounded-lg p-3">
          <ShieldCheck className="w-4 h-4" />
          All {equipment.length} linked assets are healthy — no schedule dependency risks detected.
        </div>
      ) : (
        <div className="space-y-2">
          {analysis.risks.map((r, i) => (
            <div
              key={i}
              className={`flex items-start gap-3 rounded-lg p-3 border ${
                r.level === 'critical'
                  ? 'bg-rose-50 border-rose-200'
                  : 'bg-amber-50 border-amber-200'
              }`}
            >
              <AlertTriangle
                className={`w-4 h-4 mt-0.5 shrink-0 ${
                  r.level === 'critical' ? 'text-rose-600' : 'text-amber-600'
                }`}
              />
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-0.5">
                  <span className="text-sm font-semibold text-slate-900">{r.asset.name}</span>
                  <Badge className={`${STATUS_TONE[r.asset.status] || STATUS_TONE.operational} border-0 text-[10px]`}>
                    {r.asset.status}
                  </Badge>
                </div>
                <p className="text-xs text-slate-600">{r.reason}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Asset health strip */}
      {equipment.length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-2">
          {equipment.map((e) => (
            <div key={e.id} className="flex items-center gap-2 text-xs">
              <div
                className={`w-2 h-2 rounded-full shrink-0 ${
                  (e.health_score ?? 100) >= 70
                    ? 'bg-emerald-500'
                    : (e.health_score ?? 100) >= 40
                    ? 'bg-amber-500'
                    : 'bg-rose-500'
                }`}
              />
              <span className="truncate text-slate-700">{e.name}</span>
              <span className="ml-auto tabular-nums text-slate-500">
                {e.health_score != null ? Math.round(e.health_score) : '—'}
              </span>
              {e.predicted_failure_date && (
                <span className="flex items-center gap-1 text-slate-400">
                  <Clock className="w-3 h-3" />
                  {new Date(e.predicted_failure_date).toLocaleDateString('en-US', {
                    month: 'short',
                    year: '2-digit'
                  })}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}