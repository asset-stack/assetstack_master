// Shared utilities for ProjectTask management

export const TASK_COLUMNS = [
  { key: 'todo', label: 'To Do', color: 'slate' },
  { key: 'in_progress', label: 'In Progress', color: 'indigo' },
  { key: 'blocked', label: 'Blocked', color: 'rose' },
  { key: 'in_review', label: 'In Review', color: 'amber' },
  { key: 'done', label: 'Done', color: 'emerald' }
];

export const TASK_STATUS_META = {
  todo: { label: 'To Do', color: 'bg-slate-100 text-slate-700', dot: 'bg-slate-400' },
  in_progress: { label: 'In Progress', color: 'bg-indigo-100 text-indigo-700', dot: 'bg-indigo-500' },
  blocked: { label: 'Blocked', color: 'bg-rose-100 text-rose-700', dot: 'bg-rose-500' },
  in_review: { label: 'In Review', color: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500' },
  done: { label: 'Done', color: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' }
};

export const TASK_PRIORITY_META = {
  low: { label: 'Low', color: 'bg-slate-100 text-slate-600', border: 'border-l-slate-300' },
  medium: { label: 'Medium', color: 'bg-blue-100 text-blue-700', border: 'border-l-blue-400' },
  high: { label: 'High', color: 'bg-amber-100 text-amber-700', border: 'border-l-amber-400' },
  critical: { label: 'Critical', color: 'bg-rose-100 text-rose-700', border: 'border-l-rose-500' }
};

export function taskProgress(task) {
  if (task.status === 'done') return 100;
  const cl = task.checklist || [];
  if (cl.length) {
    return Math.round((cl.filter((c) => c.done).length / cl.length) * 100);
  }
  return Number(task.progress_percent) || 0;
}

// Detect tasks that are blocked because a dependency isn't done yet
export function isBlockedByDeps(task, allTasks) {
  if (!task.depends_on_ids?.length) return false;
  const byId = Object.fromEntries(allTasks.map((t) => [t.id, t]));
  return task.depends_on_ids.some((id) => byId[id] && byId[id].status !== 'done');
}

export function taskStats(tasks = []) {
  const done = tasks.filter((t) => t.status === 'done').length;
  const blocked = tasks.filter((t) => t.status === 'blocked').length;
  const overdue = tasks.filter(
    (t) => t.status !== 'done' && t.due_date && new Date(t.due_date) < new Date()
  ).length;
  const estHours = tasks.reduce((s, t) => s + (Number(t.estimated_hours) || 0), 0);
  const loggedHours = tasks.reduce((s, t) => s + (Number(t.logged_hours) || 0), 0);
  return {
    total: tasks.length,
    done,
    blocked,
    overdue,
    completionPct: tasks.length ? Math.round((done / tasks.length) * 100) : 0,
    estHours,
    loggedHours
  };
}