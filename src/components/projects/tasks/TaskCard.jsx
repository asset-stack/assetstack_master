import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckSquare, Clock, AlertTriangle, Lock, CalendarDays } from 'lucide-react';
import { TASK_PRIORITY_META, taskProgress, isBlockedByDeps } from '@/lib/taskUtils';

function initials(name = '') {
  return name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
}

export default function TaskCard({ task, allTasks = [], onClick }) {
  const prio = TASK_PRIORITY_META[task.priority] || TASK_PRIORITY_META.medium;
  const progress = taskProgress(task);
  const blocked = isBlockedByDeps(task, allTasks);
  const overdue =
    task.status !== 'done' && task.due_date && new Date(task.due_date) < new Date();
  const checklist = task.checklist || [];
  const checkDone = checklist.filter((c) => c.done).length;

  return (
    <button
      onClick={() => onClick?.(task)}
      className={`w-full text-left bg-white border border-slate-200 rounded-lg p-3 hover:shadow-md hover:border-indigo-200 transition-all border-l-[3px] ${prio.border}`}
    >
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <p className="text-sm font-semibold text-slate-900 leading-snug">{task.title}</p>
        {blocked && <Lock className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" title="Blocked by dependency" />}
      </div>

      {task.phase_name && (
        <p className="text-[11px] text-slate-400 mb-2 truncate">{task.phase_name}</p>
      )}

      <div className="flex flex-wrap items-center gap-1.5 mb-2">
        <Badge className={`${prio.color} border-0 text-[10px] px-1.5 py-0`}>{prio.label}</Badge>
        {overdue && (
          <Badge className="bg-rose-100 text-rose-700 border-0 text-[10px] px-1.5 py-0 gap-0.5">
            <AlertTriangle className="w-2.5 h-2.5" /> Overdue
          </Badge>
        )}
        {checklist.length > 0 && (
          <span className="inline-flex items-center gap-0.5 text-[10px] text-slate-500">
            <CheckSquare className="w-2.5 h-2.5" /> {checkDone}/{checklist.length}
          </span>
        )}
      </div>

      {progress > 0 && progress < 100 && (
        <div className="h-1 bg-slate-100 rounded-full mb-2 overflow-hidden">
          <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${progress}%` }} />
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex -space-x-1.5">
          {(task.assignee_names || []).slice(0, 3).map((n, i) => (
            <div
              key={i}
              className="w-6 h-6 rounded-full bg-indigo-100 border-2 border-white flex items-center justify-center text-[9px] font-bold text-indigo-700"
              title={n}
            >
              {initials(n)}
            </div>
          ))}
          {(task.assignee_names?.length || 0) > 3 && (
            <div className="w-6 h-6 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[9px] font-bold text-slate-600">
              +{task.assignee_names.length - 3}
            </div>
          )}
          {!task.assignee_names?.length && (
            <span className="text-[10px] text-slate-400 italic">Unassigned</span>
          )}
        </div>
        <div className="flex items-center gap-2 text-[10px] text-slate-500 tabular-nums">
          {task.estimated_hours > 0 && (
            <span className="inline-flex items-center gap-0.5">
              <Clock className="w-2.5 h-2.5" /> {task.logged_hours || 0}/{task.estimated_hours}h
            </span>
          )}
          {task.due_date && (
            <span className="inline-flex items-center gap-0.5">
              <CalendarDays className="w-2.5 h-2.5" />
              {new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}