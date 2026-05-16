import React, { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { GitBranch, Zap } from 'lucide-react';
import { computeCriticalPath } from '@/lib/projectAnalytics';

/**
 * Critical Path Visualization — highlights phases with zero slack,
 * showing which tasks MUST stay on schedule to avoid slipping the project.
 */
export default function ProjectCriticalPath({ phases = [] }) {
  const analyzed = useMemo(() => computeCriticalPath(phases), [phases]);
  const criticalCount = analyzed.filter((p) => p.isCritical).length;

  if (!phases.length) {
    return (
      <Card className="p-8 text-center">
        <GitBranch className="w-8 h-8 text-slate-300 mx-auto mb-2" />
        <p className="text-sm text-slate-500">
          Add phases with dependencies to see the critical path.
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center">
            <Zap className="w-4 h-4 text-rose-600" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Critical Path</h3>
            <p className="text-[11px] text-slate-500">
              Phases with zero slack — any delay slips the entire project
            </p>
          </div>
        </div>
        <div className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 text-[11px] font-bold tabular-nums">
          {criticalCount} critical / {analyzed.length}
        </div>
      </div>

      <div className="space-y-2">
        {analyzed.map((phase, idx) => (
          <div
            key={phase.id || idx}
            className={`relative rounded-lg border p-3 transition-all ${
              phase.isCritical
                ? 'border-rose-300 bg-rose-50/60 shadow-sm'
                : 'border-slate-200 bg-white'
            }`}
          >
            {phase.isCritical && (
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-rose-500 rounded-l-lg" />
            )}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                {phase.isCritical && (
                  <Zap className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                )}
                <span
                  className={`text-[13px] font-semibold truncate ${
                    phase.isCritical ? 'text-rose-900' : 'text-slate-700'
                  }`}
                >
                  {phase.name}
                </span>
                {phase.dependencies?.length > 0 && (
                  <span className="text-[10px] text-slate-400">
                    ← {phase.dependencies.length} dep
                    {phase.dependencies.length > 1 ? 's' : ''}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right">
                  <div className="text-[9px] text-slate-400 uppercase tracking-wider">
                    Slack
                  </div>
                  <div
                    className={`text-[12px] font-bold tabular-nums ${
                      phase.isCritical ? 'text-rose-600' : 'text-slate-600'
                    }`}
                  >
                    {phase.slack ?? 0}d
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[9px] text-slate-400 uppercase tracking-wider">
                    Progress
                  </div>
                  <div className="text-[12px] font-bold tabular-nums text-slate-700">
                    {phase.progress_percent || 0}%
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-4 text-[10px] text-slate-500">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-rose-500" />
          On critical path
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-slate-300" />
          Has slack (flexible)
        </div>
      </div>
    </Card>
  );
}