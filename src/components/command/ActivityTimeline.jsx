import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Activity, AlertTriangle, Wrench, CheckCircle2, Cpu, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const EVENT_TYPES = {
  alert: { icon: AlertTriangle, color: 'text-rose-600', bg: 'bg-rose-100', ring: 'ring-rose-100' },
  task_created: { icon: Wrench, color: 'text-blue-600', bg: 'bg-blue-100', ring: 'ring-blue-100' },
  task_completed: { icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-100', ring: 'ring-emerald-100' },
  work_order: { icon: Wrench, color: 'text-indigo-600', bg: 'bg-indigo-100', ring: 'ring-indigo-100' },
  equipment_added: { icon: Cpu, color: 'text-violet-600', bg: 'bg-violet-100', ring: 'ring-violet-100' },
  equipment_changed: { icon: Activity, color: 'text-amber-600', bg: 'bg-amber-100', ring: 'ring-amber-100' },
};

export default function ActivityTimeline({ equipment = [], tasks = [], workOrders = [], alerts = [] }) {
  const events = useMemo(() => {
    const all = [];

    alerts.slice(0, 20).forEach(a => {
      all.push({
        type: 'alert',
        timestamp: a.created_date,
        title: a.title,
        subtitle: a.severity ? `${a.severity} alert` : 'Alert triggered',
        meta: a.status,
      });
    });

    tasks.slice(0, 20).forEach(t => {
      const isCompleted = t.status === 'completed';
      all.push({
        type: isCompleted ? 'task_completed' : 'task_created',
        timestamp: isCompleted && t.completed_date ? t.completed_date : t.created_date,
        title: t.title,
        subtitle: isCompleted ? 'Task completed' : `${t.type} task ${t.status}`,
        meta: t.assigned_to,
      });
    });

    workOrders.slice(0, 20).forEach(w => {
      all.push({
        type: 'work_order',
        timestamp: w.updated_date || w.created_date,
        title: w.title,
        subtitle: `WO ${w.work_order_number || '#'} — ${w.status}`,
        meta: w.assigned_to,
      });
    });

    equipment.slice(0, 15).forEach(e => {
      const isNew = e.created_date === e.updated_date;
      all.push({
        type: isNew ? 'equipment_added' : 'equipment_changed',
        timestamp: e.updated_date || e.created_date,
        title: e.name,
        subtitle: isNew ? 'Asset added' : `Status: ${e.status}`,
        meta: e.location,
      });
    });

    return all
      .filter(e => e.timestamp)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 25);
  }, [equipment, tasks, workOrders, alerts]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm">
      <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center">
            <Activity className="w-4 h-4 text-slate-700" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 text-[15px]">Live Activity</h3>
            <p className="text-[11px] text-slate-500">Everything happening across your fleet</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-50">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-semibold text-emerald-700">LIVE</span>
        </div>
      </div>

      <div className="p-3 sm:p-4 max-h-[500px] overflow-y-auto scrollbar-thin">
        {events.length === 0 ? (
          <div className="p-8 text-center">
            <Clock className="w-8 h-8 mx-auto text-slate-300 mb-2" />
            <p className="text-sm text-slate-500">No recent activity</p>
          </div>
        ) : (
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-[19px] top-2 bottom-2 w-px bg-slate-100" />
            <div className="space-y-3">
              {events.map((event, idx) => {
                const style = EVENT_TYPES[event.type] || EVENT_TYPES.equipment_changed;
                const Icon = style.icon;
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: Math.min(idx * 0.03, 0.3) }}
                    className="relative flex items-start gap-3"
                  >
                    <div className={`relative z-10 w-10 h-10 rounded-xl ${style.bg} ring-4 ring-white flex items-center justify-center shrink-0`}>
                      <Icon className={`w-4 h-4 ${style.color}`} />
                    </div>
                    <div className="flex-1 min-w-0 pt-0.5">
                      <p className="text-sm font-medium text-slate-900 truncate">{event.title}</p>
                      <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                        <span className="text-[11px] text-slate-500">{event.subtitle}</span>
                        {event.meta && (
                          <>
                            <span className="text-slate-300 text-[10px]">•</span>
                            <span className="text-[11px] text-slate-500 truncate">{event.meta}</span>
                          </>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {formatDistanceToNow(new Date(event.timestamp), { addSuffix: true })}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}