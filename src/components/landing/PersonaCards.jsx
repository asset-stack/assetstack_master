import React from 'react';
import { motion } from 'framer-motion';
import { HardHat, Briefcase, TrendingUp } from 'lucide-react';

const PERSONAS = [
  {
    icon: HardHat,
    role: 'Field Technician',
    quote: 'I open one app. My next job, my checklist, the part I need — all there.',
    name: 'Marcus T.',
    detail: 'Senior Mechanical · 12 yrs',
    bg: 'bg-gradient-to-br from-blue-50 to-blue-100/40',
  },
  {
    icon: Briefcase,
    role: 'Maintenance Manager',
    quote: 'I see risk before my Monday meeting. The work routes itself.',
    name: 'Priya S.',
    detail: 'Reliability Engineering · Mining',
    bg: 'bg-gradient-to-br from-slate-50 to-slate-100/40',
  },
  {
    icon: TrendingUp,
    role: 'CFO / Asset Owner',
    quote: 'Every line in the savings ledger ties to evidence. The board reviews it monthly.',
    name: 'David K.',
    detail: 'CFO · Public infrastructure',
    bg: 'bg-gradient-to-br from-primary/[0.06] to-primary/[0.02]',
  },
];

export default function PersonaCards() {
  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="max-w-[1280px] mx-auto px-5 md:px-8">
        <div className="max-w-2xl mb-12">
          <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">Built for everyone who keeps assets running</span>
          <h2 className="mt-3 text-4xl md:text-5xl font-semibold tracking-[-0.03em] leading-[1.02] text-slate-900 text-balance">
            Three roles.{' '}
            <span className="font-serif italic font-medium text-primary">One source of truth.</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {PERSONAS.map((p, i) => {
            const Icon = p.icon;
            return (
              <motion.div
                key={p.role}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className={`rounded-2xl border border-slate-200 ${p.bg} p-7 hover-lift hover:border-primary/25`}
              >
                <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center elevation-1 mb-5">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">{p.role}</div>
                <p className="mt-3 text-[18px] font-serif italic text-slate-800 leading-snug">"{p.quote}"</p>
                <div className="mt-5 pt-5 border-t border-slate-200/60">
                  <div className="text-[13px] font-semibold text-slate-900">{p.name}</div>
                  <div className="text-[12px] text-slate-500">{p.detail}</div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}