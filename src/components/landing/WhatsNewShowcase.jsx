import React from 'react';
import { motion } from 'framer-motion';
import {
  Target, FlaskConical, ClipboardCheck, TrendingUp, Waves,
  Camera, MessageSquare, Edit3, ShieldAlert, Sparkles
} from 'lucide-react';

const features = [
  {
    icon: Target,
    title: 'Funding Optimiser',
    desc: 'Knapsack-style solver picks the renewal mix that maximises risk reduction per dollar — under any budget cap.',
    badge: 'Capital planning',
    accent: 'from-indigo-500 to-blue-500',
  },
  {
    icon: FlaskConical,
    title: 'Scenario Modeller',
    desc: 'What-if sliders for budget, inflation, deferral and climate stress — see backlog projections rebuild live.',
    badge: 'Strategy',
    accent: 'from-violet-500 to-purple-500',
  },
  {
    icon: MessageSquare,
    title: 'AssetMind Aggregation',
    desc: 'Ask portfolio-level questions in plain English. The LLM aggregates across every asset, location and ledger entry.',
    badge: 'AI assistant',
    accent: 'from-fuchsia-500 to-pink-500',
  },
  {
    icon: ClipboardCheck,
    title: 'Inspection Cycles',
    desc: 'Auto-derived inspection cadence per asset class with overdue/at-risk surfacing — never miss a regulatory window.',
    badge: 'Field ops',
    accent: 'from-emerald-500 to-teal-500',
  },
  {
    icon: TrendingUp,
    title: 'Cohort Performance',
    desc: 'Spot systemic reliability issues — actual vs expected wear across like-for-like asset cohorts.',
    badge: 'Intelligence',
    accent: 'from-cyan-500 to-sky-500',
  },
  {
    icon: Waves,
    title: 'Climate Risk Overlay',
    desc: 'Coastal salt-spray and exposure zones recalculate useful-life and replacement value at risk for every asset.',
    badge: 'Climate',
    accent: 'from-blue-500 to-cyan-500',
  },
  {
    icon: Camera,
    title: 'Photo-Diff Inspector',
    desc: 'AI compares before/after photos of heritage and critical assets — flagging drift, damage and degradation.',
    badge: 'Heritage',
    accent: 'from-orange-500 to-amber-500',
  },
  {
    icon: Edit3,
    title: 'Bulk Condition Update',
    desc: 'Field teams update hundreds of conditions in a single sweep — fully audited and offline-friendly.',
    badge: 'Field ops',
    accent: 'from-rose-500 to-red-500',
  },
  {
    icon: ShieldAlert,
    title: 'Data Quality Engine',
    desc: 'Detects duplicates, anomalies and missing fields — keeps the register audit-ready at all times.',
    badge: 'Hygiene',
    accent: 'from-amber-500 to-yellow-500',
  },
];

export default function WhatsNewShowcase() {
  return (
    <section className="relative py-24 px-4 bg-gradient-to-b from-slate-50 via-white to-slate-50 overflow-hidden">
      {/* Decorative background */}
      <div className="absolute inset-0 -z-10 opacity-40">
        <div className="absolute top-20 left-10 w-72 h-72 bg-indigo-200 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-purple-200 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            The decision-grade asset platform
          </div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 mb-4 text-balance">
            From asset register to <span className="text-gradient">decision system</span>
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto text-balance">
            Nine integrated modules covering capital planning, field operations and portfolio intelligence —
            built on a single AI-native asset register.
          </p>
        </motion.div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, idx) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
              >
                <div className="group block h-full rounded-2xl border border-slate-200 bg-white p-6 hover-lift hover:border-slate-300 elevation-1 hover:elevation-2 transition-all">
                  <div className={`inline-flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br ${f.accent} text-white shadow-lg mb-4`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                      {f.badge}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">{f.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{f.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* CTA strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-14 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-900 p-8 md:p-10 text-center"
        >
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-3 text-balance">
            Try the new Funding Optimiser on your own register
          </h3>
          <p className="text-slate-300 max-w-xl mx-auto mb-6">
            Upload your assets, set a budget cap, and watch the optimiser rank renewals by risk-reduction-per-dollar in seconds.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <a
              href="#contact"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white text-slate-900 font-semibold hover:bg-slate-100 transition-colors"
            >
              <Target className="w-4 h-4" />
              Book a demo
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}