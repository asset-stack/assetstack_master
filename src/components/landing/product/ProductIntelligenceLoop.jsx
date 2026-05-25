import React from 'react';
import { motion } from 'framer-motion';
import {
  Database, Layers, Brain, LineChart, Wrench, FileBarChart, ArrowRight,
} from 'lucide-react';

const STAGES = [
  {
    icon: Database,
    title: 'Data Collection',
    desc: 'AssetStack collects data from inspections, IoT sensors, GIS systems and operational databases.',
    items: ['Field inspections', 'Sensor telemetry', 'Maintenance logs', 'Asset registries', 'Digital twin models'],
  },
  {
    icon: Layers,
    title: 'Data Unification',
    desc: 'The platform integrates multiple systems into a single operational data layer.',
    items: ['Single source of truth for infrastructure assets'],
  },
  {
    icon: Brain,
    title: 'AI Analysis',
    desc: 'Machine learning models analyse patterns across asset behaviour.',
    items: ['Anomalies', 'Degradation trends', 'Early failure indicators'],
  },
  {
    icon: LineChart,
    title: 'Predictive Insights',
    desc: 'AssetStack forecasts asset health and reliability.',
    items: ['Failure probability', 'Remaining useful life (RUL)', 'Asset health scores'],
  },
  {
    icon: Wrench,
    title: 'Maintenance Optimisation',
    desc: 'The platform automatically generates maintenance recommendations and prioritises tasks.',
    items: [],
  },
  {
    icon: FileBarChart,
    title: 'Executive Insights',
    desc: 'Automated reports provide operational and strategic intelligence for asset managers and leadership teams.',
    items: [],
  },
];

export default function ProductIntelligenceLoop() {
  return (
    <section className="relative py-20 lg:py-28 bg-white">
      <div className="max-w-[1280px] mx-auto px-5 md:px-10">
        <div className="max-w-3xl mb-14">
          <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-primary mb-4">
            How it works
          </p>
          <h2
            className="font-normal text-slate-900 leading-[1.05] tracking-[-0.01em]"
            style={{
              fontFamily: "Georgia, 'Times New Roman', serif",
              fontSize: 'clamp(2rem, 4.6vw, 3.6rem)',
            }}
          >
            One Connected<br />Intelligence System.
          </h2>
          <p className="mt-6 text-slate-600 text-[15px] md:text-[17px] leading-relaxed">
            AssetStack connects field inspections, sensor networks, asset
            registries and AI analytics into a continuous intelligence loop —
            transforming raw operational data into actionable insights.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {STAGES.map((stage, i) => {
            const Icon = stage.icon;
            return (
              <motion.div
                key={stage.title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.4, delay: i * 0.04 }}
                className="relative bg-white border border-slate-200/80 rounded-2xl p-6 hover:border-primary/40 hover:shadow-lg transition-all duration-200 group"
              >
                <div className="flex items-center justify-between mb-5">
                  <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                    <Icon className="w-5 h-5" strokeWidth={1.8} />
                  </div>
                  <span className="text-[11px] font-semibold text-slate-400 tabular-nums">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                </div>
                <h3 className="text-[18px] font-bold text-slate-900 tracking-tight mb-2">
                  {stage.title}
                </h3>
                <p className="text-[13.5px] text-slate-600 leading-relaxed mb-3">
                  {stage.desc}
                </p>
                {stage.items.length > 0 && (
                  <ul className="space-y-1.5 mt-3">
                    {stage.items.map((it) => (
                      <li
                        key={it}
                        className="flex items-start gap-2 text-[13px] text-slate-700"
                      >
                        <ArrowRight className="w-3 h-3 text-primary mt-1 shrink-0" />
                        <span>{it}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}