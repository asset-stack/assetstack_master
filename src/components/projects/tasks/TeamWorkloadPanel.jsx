import React, { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Users } from 'lucide-react';

function initials(name = '') {
  return name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
}

const AVAIL = {
  available: { label: 'Available', dot: 'bg-emerald-500' },
  busy: { label: 'Busy', dot: 'bg-amber-500' },
  on_leave: { label: 'On Leave', dot: 'bg-rose-500' },
  unavailable: { label: 'Unavailable', dot: 'bg-slate-400' }
};

// Shows each assigned person's open task count and committed hours on THIS project.
export default function TeamWorkloadPanel({ tasks = [], technicians = [] }) {
  const rows = useMemo(() => {
    const map = {};
    tasks.forEach((t) => {
      (t.assignee_ids || []).forEach((id) => {
        if (!map[id]) map[id] = { openTasks: 0, hours: 0, done: 0 };
        if (t.status === 'done') map[id].done += 1;
        else map[id].openTasks += 1;
        map[id].hours += Number(t.estimated_hours) || 0;
      });
    });
    return Object.entries(map)
      .map(([id, v]) => ({ tech: technicians.find((t) => t.id === id), ...v }))
      .filter((r) => r.tech)
      .sort((a, b) => b.openTasks - a.openTasks);
  }, [tasks, technicians]);

  if (!rows.length) {
    return (
      <Card className="p-6 text-center text-sm text-slate-500">
        No team members assigned to tasks yet.
      </Card>
    );
  }

  const maxHours = Math.max(...rows.map((r) => r.hours), 1);

  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-3">
        <Users className="w-4 h-4 text-indigo-600" />
        <h3 className="text-sm font-bold text-slate-900">Team Workload</h3>
      </div>
      <div className="space-y-3">
        {rows.map((r) => {
          const avail = AVAIL[r.tech.availability_status] || AVAIL.unavailable;
          const cap = Number(r.tech.max_weekly_hours) || 40;
          const overloaded = r.hours > cap;
          return (
            <div key={r.tech.id} className="flex items-center gap-3">
              <div className="relative shrink-0">
                <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">
                  {initials(r.tech.name)}
                </div>
                <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${avail.dot}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium text-slate-900 truncate">{r.tech.name}</span>
                  <span className={`text-[11px] tabular-nums ${overloaded ? 'text-rose-600 font-semibold' : 'text-slate-500'}`}>
                    {r.openTasks} open · {r.hours}h
                  </span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full mt-1 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${overloaded ? 'bg-rose-500' : 'bg-indigo-500'}`}
                    style={{ width: `${Math.min((r.hours / maxHours) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}