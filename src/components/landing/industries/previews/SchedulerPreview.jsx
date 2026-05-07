import React from 'react';
import { motion } from 'framer-motion';
import { CalendarClock, Sparkles } from 'lucide-react';

/**
 * Scheduler preview — week-view calendar with tech swimlanes,
 * AI-suggested optimisation, and load balance bars.
 */

const TECHS = [
  { name: 'M. Chen', initial: 'MC', color: 'bg-blue-500', load: 78 },
  { name: 'A. Patel', initial: 'AP', color: 'bg-emerald-500', load: 62 },
  { name: 'J. Rivera', initial: 'JR', color: 'bg-amber-500', load: 91 },
  { name: 'K. Watson', initial: 'KW', color: 'bg-violet-500', load: 35 },
];

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

// Each cell: tech index → array of { day, span, label, type }
const JOBS = [
  { row: 0, day: 0, span: 1, label: 'HVAC #2', type: 'preventive' },
  { row: 0, day: 2, span: 2, label: 'Compressor swap', type: 'urgent' },
  { row: 1, day: 1, span: 1, label: 'Lift inspect', type: 'inspection' },
  { row: 1, day: 3, span: 1, label: 'Floor 3 audit', type: 'inspection' },
  { row: 2, day: 0, span: 2, label: 'Pump rebuild', type: 'corrective' },
  { row: 2, day: 3, span: 2, label: 'Cooling tower', type: 'preventive' },
  { row: 3, day: 4, span: 1, label: 'Floodlight', type: 'corrective' },
];

const TYPE_COLOR = {
  urgent: 'bg-rose-500/90 text-white',
  corrective: 'bg-orange-500/90 text-white',
  preventive: 'bg-blue-500/90 text-white',
  inspection: 'bg-emerald-500/90 text-white',
};

export default function SchedulerPreview() {
  return (
    <div className="h-full w-full bg-white flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-2 px-5 py-3 border-b border-slate-100">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 text-white flex items-center justify-center">
          <CalendarClock className="w-3.5 h-3.5" />
        </div>
        <div>
          <div className="text-[12px] font-semibold text-slate-900 leading-none">Maintenance Scheduler</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Week of May 11 · 7 jobs</div>
        </div>
        <span className="ml-auto inline-flex items-center gap-1 text-[9px] font-semibold text-violet-700 bg-violet-50 px-2 py-0.5 rounded">
          <Sparkles className="w-2.5 h-2.5" /> AI optimised
        </span>
      </div>

      {/* Calendar grid */}
      <div className="px-3 py-2.5 border-b border-slate-100">
        {/* Day headers */}
        <div className="grid grid-cols-[80px_repeat(5,1fr)] gap-1 mb-1.5">
          <div />
          {DAYS.map((d, i) => (
            <div key={d} className={`text-[9px] font-semibold uppercase tracking-wider text-center ${
              i === 1 ? 'text-violet-600' : 'text-slate-500'
            }`}>
              {d}
              {i === 1 && <span className="ml-0.5">●</span>}
            </div>
          ))}
        </div>

        {/* Tech rows */}
        {TECHS.map((t, rowIdx) => (
          <div key={t.name} className="grid grid-cols-[80px_repeat(5,1fr)] gap-1 mb-1">
            {/* Tech avatar */}
            <div className="flex items-center gap-1.5">
              <div className={`w-5 h-5 rounded-full ${t.color} text-white flex items-center justify-center text-[8px] font-bold`}>
                {t.initial}
              </div>
              <span className="text-[9px] font-semibold text-slate-700 truncate">{t.name}</span>
            </div>
            {/* Day cells */}
            {DAYS.map((_, dayIdx) => {
              const job = JOBS.find(j => j.row === rowIdx && j.day === dayIdx);
              if (!job) {
                return <div key={dayIdx} className="h-7 rounded bg-slate-50/40 border border-dashed border-slate-100" />;
              }
              return (
                <motion.div
                  key={dayIdx}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: (rowIdx * 5 + dayIdx) * 0.04 }}
                  className={`h-7 rounded px-1.5 flex items-center text-[9px] font-semibold truncate ${TYPE_COLOR[job.type]}`}
                  style={{ gridColumn: `span ${job.span}` }}
                >
                  {job.label}
                </motion.div>
              );
            }).filter((_, idx) => {
              // Skip rendering cells that are covered by previous spans
              const prevJob = JOBS.find(j => j.row === rowIdx && j.day < idx && j.day + j.span > idx);
              return !prevJob;
            })}
          </div>
        ))}
      </div>

      {/* Load balancing */}
      <div className="px-4 py-2.5 border-b border-slate-100">
        <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Technician load · this week</span>
        <div className="space-y-1.5 mt-2">
          {TECHS.map((t) => (
            <div key={t.name} className="flex items-center gap-2 text-[10px]">
              <span className="w-16 text-slate-700 font-semibold truncate">{t.name}</span>
              <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${t.load}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className={`h-full rounded-full ${
                    t.load > 85 ? 'bg-rose-500' :
                    t.load > 70 ? 'bg-amber-500' :
                    'bg-emerald-500'
                  }`}
                />
              </div>
              <span className="w-8 text-right tabular-nums text-slate-600">{t.load}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* AI suggestion */}
      <div className="px-4 py-2.5 flex-1">
        <div className="flex items-start gap-2 bg-violet-50/60 border border-violet-100 rounded-md px-2.5 py-2">
          <Sparkles className="w-3 h-3 text-violet-600 shrink-0 mt-0.5" />
          <div className="text-[10px] text-violet-900 leading-relaxed">
            <span className="font-semibold">Suggested:</span> shift <span className="font-semibold">Cooling tower</span> from J. Rivera (91%) to K. Watson (35%) — saves 6 hrs overtime.
          </div>
        </div>
      </div>
    </div>
  );
}