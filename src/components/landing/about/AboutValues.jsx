import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Layers, HeartHandshake, LineChart } from 'lucide-react';

const VALUES = [
  {
    icon: Shield,
    title: 'Defensible by default',
    text: 'Every prediction, condition score and dollar figure traces back to source evidence. No black boxes; audit trails included.',
  },
  {
    icon: Layers,
    title: 'One platform, not ten modules',
    text: 'Asset register, inspections, finance, capital plan and AI live on the same data. No integrations to maintain.',
  },
  {
    icon: HeartHandshake,
    title: 'Built with operators',
    text: 'Every feature ships with a real customer beside us. We measure success in saved hours and avoided failures.',
  },
  {
    icon: LineChart,
    title: 'Outcomes over outputs',
    text: 'We do not sell dashboards. We sell verified savings, fewer surprises, and an honest 10-year picture of your portfolio.',
  },
];

export default function AboutValues() {
  return (
    <section className="py-24 md:py-32 bg-slate-50 border-t border-slate-100">
      <div className="max-w-[1280px] mx-auto px-5 md:px-8">
        <div className="max-w-2xl mb-14">
          <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">What we believe</span>
          <h2 className="mt-3 text-3xl md:text-5xl font-semibold tracking-[-0.03em] leading-[1.05] text-slate-900 text-balance">
            Four principles, <span className="font-serif italic font-medium text-primary">non-negotiable.</span>
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          {VALUES.map((value, i) => {
            const Icon = value.icon;
            return (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: i * 0.06 }}
                className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8 hover-lift elevation-1"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-5">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-[18px] md:text-[20px] font-semibold text-slate-900 tracking-[-0.01em]">
                  {value.title}
                </h3>
                <p className="mt-2 text-[14px] text-slate-600 leading-[1.65]">{value.text}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}