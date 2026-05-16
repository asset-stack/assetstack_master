import React, { useMemo } from 'react';
import { Card } from '@/components/ui/card';

const STATUS_COLORS = {
  not_started: 'bg-slate-300',
  in_progress: 'bg-indigo-500',
  complete: 'bg-emerald-500',
  blocked: 'bg-rose-500'
};

export default function ProjectGantt({ phases = [], projectStart, projectEnd }) {
  const { startMs, endMs, totalMs, months } = useMemo(() => {
    const allDates = [
      projectStart,
      projectEnd,
      ...phases.flatMap((p) => [p.start_date, p.end_date])
    ]
      .filter(Boolean)
      .map((d) => new Date(d).getTime())
      .filter((t) => !isNaN(t));

    if (allDates.length < 2) {
      const now = Date.now();
      return {
        startMs: now,
        endMs: now + 1000 * 60 * 60 * 24 * 365,
        totalMs: 1000 * 60 * 60 * 24 * 365,
        months: []
      };
    }

    const startMs = Math.min(...allDates);
    const endMs = Math.max(...allDates);
    const totalMs = Math.max(endMs - startMs, 1);

    // Build month markers
    const months = [];
    const cur = new Date(startMs);
    cur.setDate(1);
    while (cur.getTime() <= endMs) {
      months.push(new Date(cur));
      cur.setMonth(cur.getMonth() + 1);
    }

    return { startMs, endMs, totalMs, months };
  }, [phases, projectStart, projectEnd]);

  const todayPct = useMemo(() => {
    const now = Date.now();
    if (now < startMs || now > endMs) return null;
    return ((now - startMs) / totalMs) * 100;
  }, [startMs, endMs, totalMs]);

  if (!phases.length) {
    return (
      <Card className="p-8 text-center text-slate-500 text-sm">
        No phases yet. Add a phase to see the Gantt timeline.
      </Card>
    );
  }

  return (
    <Card className="p-4 overflow-hidden">
      {/* Month header */}
      <div className="relative h-6 mb-2 border-b border-slate-200">
        {months.map((m, i) => {
          const left = ((m.getTime() - startMs) / totalMs) * 100;
          return (
            <div
              key={i}
              className="absolute top-0 text-[10px] font-medium text-slate-500 -translate-x-1/2"
              style={{ left: `${left}%` }}
            >
              {m.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })}
            </div>
          );
        })}
      </div>

      {/* Today line */}
      <div className="relative">
        {todayPct !== null && (
          <div
            className="absolute top-0 bottom-0 w-px bg-indigo-500/60 z-10 pointer-events-none"
            style={{ left: `${todayPct}%` }}
          >
            <div className="absolute -top-1 -translate-x-1/2 w-2 h-2 rounded-full bg-indigo-500" />
          </div>
        )}

        {/* Phase rows */}
        <div className="space-y-2">
          {phases.map((phase) => {
            const ps = phase.start_date ? new Date(phase.start_date).getTime() : startMs;
            const pe = phase.end_date ? new Date(phase.end_date).getTime() : endMs;
            const left = ((ps - startMs) / totalMs) * 100;
            const width = Math.max(((pe - ps) / totalMs) * 100, 2);
            const color = STATUS_COLORS[phase.status] || STATUS_COLORS.not_started;
            const progress = Number(phase.progress_percent) || 0;

            return (
              <div key={phase.id} className="flex items-center gap-3">
                <div className="w-40 shrink-0 min-w-0">
                  <div className="text-xs font-semibold text-slate-900 truncate">{phase.name}</div>
                  {phase.owner && (
                    <div className="text-[10px] text-slate-500 truncate">{phase.owner}</div>
                  )}
                </div>
                <div className="flex-1 relative h-6 bg-slate-50 rounded">
                  <div
                    className={`absolute top-0.5 bottom-0.5 rounded ${color} opacity-30`}
                    style={{ left: `${left}%`, width: `${width}%` }}
                  />
                  <div
                    className={`absolute top-0.5 bottom-0.5 rounded ${color}`}
                    style={{
                      left: `${left}%`,
                      width: `${(width * progress) / 100}%`
                    }}
                  />
                  <div
                    className="absolute top-1/2 -translate-y-1/2 text-[10px] font-semibold text-white drop-shadow"
                    style={{ left: `calc(${left}% + 6px)` }}
                  >
                    {progress > 0 && `${progress}%`}
                  </div>
                </div>
                <div className="w-20 shrink-0 text-[10px] text-slate-500 text-right tabular-nums">
                  {phase.end_date
                    ? new Date(phase.end_date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric'
                      })
                    : '—'}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}