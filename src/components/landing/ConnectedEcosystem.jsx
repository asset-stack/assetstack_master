import React from 'react';
import { motion } from 'framer-motion';
import { ClipboardCheck, Database, Brain, FileBarChart, Sparkles, ArrowRight } from 'lucide-react';

const STEPS = [
  { icon: ClipboardCheck, label: 'Inspections' },
  { icon: Database, label: 'Data' },
  { icon: Brain, label: 'AI' },
  { icon: FileBarChart, label: 'Reports' },
  { icon: Sparkles, label: 'Outcomes' },
];

export default function ConnectedEcosystem() {
  return (
    <section className="bg-white border-y border-slate-100 py-20 lg:py-28">
      <div className="max-w-6xl mx-auto px-6 lg:px-8 text-center">
        <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-indigo-600 mb-3">
          One Connected Ecosystem
        </p>
        <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-900 mb-14">
          From Field to Boardroom
        </h2>

        <div className="flex flex-wrap items-center justify-center gap-y-6 gap-x-2 md:gap-x-3">
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <React.Fragment key={step.label}>
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-80px' }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  className="flex flex-col items-center gap-3"
                >
                  <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 flex items-center justify-center shadow-sm">
                    <Icon className="w-8 h-8 md:w-9 md:h-9 text-indigo-600" strokeWidth={1.75} />
                  </div>
                  <span className="text-sm md:text-base font-semibold text-slate-700">{step.label}</span>
                </motion.div>
                {i < STEPS.length - 1 && (
                  <ArrowRight className="w-5 h-5 text-slate-300 mx-1 md:mx-2 shrink-0" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </section>
  );
}