import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Clock, DollarSign, ShieldCheck, Users } from 'lucide-react';

const BENEFITS = [
  {
    icon: Clock,
    metric: '90 days',
    title: 'See failures before they become emergencies',
    text: 'Turn photos, sensor readings, inspections, and maintenance history into early warnings your team can act on.'
  },
  {
    icon: DollarSign,
    metric: '$2.4M+',
    title: 'Convert maintenance into proven savings',
    text: 'Every intervention can be tied to avoided downtime, reduced repair cost, and evidence your finance team can verify.'
  },
  {
    icon: ShieldCheck,
    metric: '100%',
    title: 'Defensible decisions for boards and regulators',
    text: 'Every AI action, human review, import, and savings claim is captured in an audit-ready activity trail.'
  },
  {
    icon: Users,
    metric: '1 team',
    title: 'Unify field crews, managers, and executives',
    text: 'Technicians get tasks. Managers get risk. Executives get ROI. Everyone works from the same operational truth.'
  },
];

export default function BenefitsSection() {
  return (
    <section id="benefits" className="py-20 md:py-28 bg-primary text-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-40" style={{
        backgroundImage: 'radial-gradient(circle at 15% 20%, rgba(255,255,255,0.26), transparent 35%), radial-gradient(circle at 85% 70%, rgba(147,197,253,0.28), transparent 35%)'
      }} />
      <div className="max-w-7xl mx-auto px-4 md:px-6 relative">
        <div className="grid lg:grid-cols-[0.85fr_1.15fr] gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-xs font-bold uppercase tracking-[0.24em] text-blue-100">Why teams switch</span>
            <h2 className="mt-4 text-4xl md:text-6xl font-black tracking-tight leading-[1.03]">
              The benefits are operational,
              <span className="block text-blue-100">financial, and defensible.</span>
            </h2>
            <p className="mt-6 text-lg text-slate-300 leading-relaxed">
              AssetStack is not another dashboard. It is a decision engine that turns condition data into the next best action, then proves the outcome.
            </p>
            <a href="#demo" className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-white group">
              Explore the industry demos <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </motion.div>

          <div className="grid sm:grid-cols-2 gap-4">
            {BENEFITS.map((benefit, i) => {
              const Icon = benefit.icon;
              return (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  whileHover={{ y: -6 }}
                  className="group rounded-2xl border border-white/10 bg-white/[0.06] backdrop-blur p-6 hover:bg-white/[0.09] transition-all"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-11 h-11 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-blue-100" />
                    </div>
                    <span className="text-2xl font-black text-white">{benefit.metric}</span>
                  </div>
                  <h3 className="font-bold text-lg leading-tight">{benefit.title}</h3>
                  <p className="mt-3 text-sm text-slate-300 leading-relaxed">{benefit.text}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}