import React from 'react';
import { Card } from '@/components/ui/card';
import { ListChecks, CheckCircle2, Lock, AlertTriangle, Clock } from 'lucide-react';
import { taskStats } from '@/lib/taskUtils';

const TONE = {
  slate: 'bg-slate-100 text-slate-600',
  indigo: 'bg-indigo-100 text-indigo-600',
  emerald: 'bg-emerald-100 text-emerald-600',
  rose: 'bg-rose-100 text-rose-600',
  amber: 'bg-amber-100 text-amber-600',
  blue: 'bg-blue-100 text-blue-600'
};

function Stat({ icon: Icon, label, value, tone = 'slate' }) {
  const [bg, text] = (TONE[tone] || TONE.slate).split(' ');
  return (
    <Card className="p-3">
      <div className="flex items-center gap-2.5">
        <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center shrink-0`}>
          <Icon className={`w-4 h-4 ${text}`} />
        </div>
        <div className="min-w-0">
          <p className="text-lg font-bold text-slate-900 tabular-nums leading-none">{value}</p>
          <p className="text-[11px] text-slate-500 truncate">{label}</p>
        </div>
      </div>
    </Card>
  );
}

export default function TaskStatsBar({ tasks = [] }) {
  const s = taskStats(tasks);
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
      <Stat icon={ListChecks} label="Total Tasks" value={s.total} tone="indigo" />
      <Stat icon={CheckCircle2} label={`${s.completionPct}% Complete`} value={s.done} tone="emerald" />
      <Stat icon={Lock} label="Blocked" value={s.blocked} tone="rose" />
      <Stat icon={AlertTriangle} label="Overdue" value={s.overdue} tone="amber" />
      <Stat icon={Clock} label={`Logged / ${s.estHours}h est.`} value={`${s.loggedHours}h`} tone="blue" />
    </div>
  );
}