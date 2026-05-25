import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ClipboardCheck, Camera, ShieldCheck, CalendarClock, UserCheck, ArrowRight, CheckCircle2,
} from 'lucide-react';

/**
 * Inspection workflow preview — animates an inspection finding moving through:
 * Created → Approved → Scheduled → Assigned. Loops continuously.
 */

const STAGES = [
  {
    id: 'created',
    label: 'Created',
    icon: Camera,
    accent: '#0ea5e9',
    title: 'Inspection finding captured',
    detail: 'Crack · 18mm · East wall · Library Building',
    by: 'M. Chen · Field tech',
    meta: 'Photo + GPS + AI severity',
  },
  {
    id: 'approved',
    label: 'Approved',
    icon: ShieldCheck,
    accent: '#10b981',
    title: 'Reviewed and approved',
    detail: 'Severity confirmed: Major · Confidence 92%',
    by: 'A. Patel · Supervisor',
    meta: 'AI-assisted triage',
  },
  {
    id: 'scheduled',
    label: 'Scheduled',
    icon: CalendarClock,
    accent: '#6366f1',
    title: 'Added to maintenance plan',
    detail: 'WO-2042 · Concrete repair · 3.5 hrs',
    by: 'AI Scheduler',
    meta: 'Within SLA · 5 days',
  },
  {
    id: 'assigned',
    label: 'Assigned',
    icon: UserCheck,
    accent: '#a16207',
    title: 'Dispatched to technician',
    detail: 'J. Rivera · Concrete crew · Tue 9:00am',
    by: 'Auto-assignment',
    meta: 'Notified via mobile',
  },
];

export default function InspectionWorkflowPreview() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setStep((s) => (s + 1) % STAGES.length);
    }, 2200);
    return () => clearInterval(id);
  }, []);

  const active = STAGES[step];
  const ActiveIcon = active.icon;

  return (
    <div className="h-full w-full bg-white flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center">
          <ClipboardCheck className="w-3.5 h-3.5" />
        </div>
        <div>
          <div className="text-[12px] font-semibold text-slate-900 leading-none">Inspection workflow</div>
          <div className="text-[10px] text-slate-500 mt-0.5">From field finding to scheduled work</div>
        </div>
        <div className="ml-auto flex items-center gap-1 text-[9px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Live
        </div>
      </div>

      {/* Stepper rail */}
      <div className="grid grid-cols-4 gap-1.5 px-4 pt-4">
        {STAGES.map((s, i) => {
          const SIcon = s.icon;
          const isActive = i === step;
          const isDone = i < step;
          return (
            <div key={s.id} className="relative">
              <div
                className={`flex flex-col items-center gap-1.5 transition-all ${
                  isActive ? 'opacity-100' : isDone ? 'opacity-80' : 'opacity-40'
                }`}
              >
                <motion.div
                  animate={{ scale: isActive ? 1.08 : 1 }}
                  transition={{ duration: 0.3 }}
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{
                    background: isActive ? s.accent : isDone ? `${s.accent}22` : '#f1f5f9',
                    color: isActive ? '#fff' : isDone ? s.accent : '#94a3b8',
                  }}
                >
                  {isDone ? (
                    <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={2.5} />
                  ) : (
                    <SIcon className="w-3.5 h-3.5" strokeWidth={2.2} />
                  )}
                </motion.div>
                <span
                  className={`text-[9px] font-semibold uppercase tracking-wider ${
                    isActive ? 'text-slate-900' : 'text-slate-500'
                  }`}
                >
                  {s.label}
                </span>
              </div>
              {i < STAGES.length - 1 && (
                <ArrowRight className="absolute top-2 -right-1.5 w-3 h-3 text-slate-300" />
              )}
            </div>
          );
        })}
      </div>

      {/* Progress bar */}
      <div className="px-4 mt-3">
        <div className="h-1 rounded-full bg-slate-100 overflow-hidden">
          <motion.div
            className="h-full"
            style={{ background: active.accent }}
            animate={{ width: `${((step + 1) / STAGES.length) * 100}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Active card */}
      <div className="flex-1 px-4 py-4 min-h-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={active.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="rounded-lg border border-slate-200 bg-slate-50/60 p-3.5 h-full flex flex-col"
          >
            <div className="flex items-start gap-2.5">
              <div
                className="w-9 h-9 rounded-md flex items-center justify-center shrink-0"
                style={{ background: `${active.accent}1a`, color: active.accent }}
              >
                <ActiveIcon className="w-4 h-4" strokeWidth={2.2} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[9px] uppercase tracking-wider font-semibold" style={{ color: active.accent }}>
                  {active.label}
                </div>
                <div className="text-[12px] font-semibold text-slate-900 leading-tight mt-0.5">
                  {active.title}
                </div>
                <div className="text-[11px] text-slate-600 mt-1 leading-snug">
                  {active.detail}
                </div>
              </div>
            </div>

            <div className="mt-auto pt-3 flex items-center justify-between text-[10px] border-t border-slate-200/70 mt-3">
              <span className="text-slate-500">{active.by}</span>
              <span
                className="px-1.5 py-0.5 rounded font-semibold"
                style={{ background: `${active.accent}15`, color: active.accent }}
              >
                {active.meta}
              </span>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}