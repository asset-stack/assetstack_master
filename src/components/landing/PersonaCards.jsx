import React from 'react';
import { motion } from 'framer-motion';
import { HardHat, Briefcase, TrendingUp } from 'lucide-react';

// Persona cards describe what the platform does for each role written
// as platform statements, not attributed testimonials.
const PERSONAS = [
  {
    icon: HardHat,
    role: 'Field Technician',
    statement: 'One app. The next work order, the checklist, the photo upload, the part list all on the device.',
    detail: 'Mobile work orders · Photo inspection · Offline-friendly',
    bg: 'bg-gradient-to-br from-blue-50 to-blue-100/40',
  },
  {
    icon: Briefcase,
    role: 'Maintenance Manager',
    statement: 'See risk before Monday. Auto-generated work orders, schedule optimisation, and a single dashboard for the team.',
    detail: 'Predictive scheduling · Team allocation · Risk dashboard',
    bg: 'bg-gradient-to-br from-slate-50 to-slate-100/40',
  },
  {
    icon: TrendingUp,
    role: 'Asset Owner / CFO',
    statement: 'Every line in the Verified Savings Ledger ties to a prediction, an intervention, and reviewed evidence ready for audit.',
    detail: 'Verified savings · Depreciation · Audit-grade trail',
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
                <p className="mt-3 text-[17px] text-slate-800 leading-snug">{p.statement}</p>
                <div className="mt-5 pt-5 border-t border-slate-200/60">
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