import React from 'react';
import { motion } from 'framer-motion';
import { Radio, Workflow, Database, Brain, BarChart3, Wrench } from 'lucide-react';

const LAYERS = [
  { icon: Radio, title: 'Data Sources', desc: 'IoT sensors, inspections, asset registries, SCADA, GIS.' },
  { icon: Workflow, title: 'Data Ingestion Layer', desc: 'Real-time pipelines, connectors, structured ingestion.' },
  { icon: Database, title: 'Asset Data Platform', desc: 'Single source of truth, normalised, per-tenant isolated.' },
  { icon: Brain, title: 'Machine Learning Engine', desc: 'Anomaly detection, RUL, ensemble predictive models.' },
  { icon: BarChart3, title: 'Analytics & Insights', desc: 'Dashboards, scenario modelling, executive reporting.' },
  { icon: Wrench, title: 'Maintenance Optimisation', desc: 'Risk-prioritised work orders and capital planning.' },
];

export default function ComplianceArchitecture() {
  return (
    <section className="relative py-20 lg:py-28 bg-slate-50 border-y border-slate-100">
      <div className="max-w-[1280px] mx-auto px-5 md:px-10">
        <div className="max-w-3xl mb-14">
          <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-primary mb-4">
            Architecture
          </p>
          <h2
            className="font-normal text-slate-900 leading-[1.05] tracking-[-0.01em]"
            style={{
              fontFamily: "Georgia, 'Times New Roman', serif",
              fontSize: 'clamp(2rem, 4.6vw, 3.4rem)',
            }}
          >
            The technology<br />behind AssetStack.
          </h2>
          <p className="mt-6 text-slate-600 text-[15px] md:text-[17px] leading-relaxed">
            AssetStack is built on a modern data architecture that connects infrastructure systems,
            IoT sensors and operational databases into a unified intelligence platform.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {LAYERS.map((l, i) => {
            const Icon = l.icon;
            return (
              <motion.div
                key={l.title}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ delay: i * 0.05, duration: 0.4 }}
                className="bg-white rounded-2xl border border-slate-200 p-6 hover:border-primary/30 hover:shadow-lg transition-all"
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-[11px] font-bold tabular-nums text-slate-400">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-primary" strokeWidth={1.8} />
                  </div>
                </div>
                <h3 className="text-[16px] font-bold text-slate-900 tracking-tight">{l.title}</h3>
                <p className="mt-1.5 text-[13px] text-slate-600 leading-relaxed">{l.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}