import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Layers, EyeOff, Clock } from 'lucide-react';

const PROBLEMS = [
  {
    icon: AlertTriangle,
    title: 'Reactive Maintenance',
    desc: 'Failures are often discovered after they occur, causing downtime and expensive emergency repairs.',
  },
  {
    icon: Layers,
    title: 'Fragmented Systems',
    desc: 'Asset information lives across multiple systems including inspection reports, sensors, spreadsheets and legacy software.',
  },
  {
    icon: EyeOff,
    title: 'Limited Visibility',
    desc: 'Operational teams lack real-time insight into asset health across entire infrastructure networks.',
  },
  {
    icon: Clock,
    title: 'Inefficient Maintenance',
    desc: 'Maintenance resources are deployed based on schedules rather than actual asset risk.',
  },
];

export default function SolutionsProblems() {
  return (
    <section className="relative py-20 lg:py-28 bg-white">
      <div className="max-w-[1280px] mx-auto px-5 md:px-10">
        <div className="max-w-3xl mb-14">
          <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-primary mb-4">
            The Problem
          </p>
          <h2
            className="font-normal text-slate-900 leading-[1.05] tracking-[-0.01em]"
            style={{
              fontFamily: "Georgia, 'Times New Roman', serif",
              fontSize: 'clamp(2rem, 4.6vw, 3.6rem)',
            }}
          >
            The challenges of managing<br />modern infrastructure.
          </h2>
          <p className="mt-6 text-slate-600 text-[15px] md:text-[17px] leading-relaxed">
            Infrastructure operators manage thousands of distributed assets
            across complex environments. Traditional asset management systems
            were not designed for real-time monitoring, predictive maintenance
            or large-scale infrastructure networks.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {PROBLEMS.map((p, i) => {
            const Icon = p.icon;
            return (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="bg-white border border-slate-200/80 rounded-2xl p-6 hover:border-rose-300 hover:shadow-lg transition-all duration-200"
              >
                <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-5">
                  <Icon className="w-5 h-5" strokeWidth={1.8} />
                </div>
                <h3 className="text-[17px] font-bold text-slate-900 tracking-tight mb-2">
                  {p.title}
                </h3>
                <p className="text-[13.5px] text-slate-600 leading-relaxed">
                  {p.desc}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}