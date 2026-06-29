import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, Building2, Train, Factory, Mountain } from 'lucide-react';

const CUSTOMERS = [
  {
    icon: Building2,
    sector: 'Local government',
    name: 'LGA Council',
    blurb:
      'Migrated 12,000+ assets across 84 facilities into a single defensible register — replacing four legacy systems.',
    metric: 'AUD 8.4M',
    metricLabel: 'condition-verified value',
  },
  {
    icon: Train,
    sector: 'Rail & transit',
    name: 'Regional rail operator',
    blurb:
      'Predictive maintenance on rolling stock and track infrastructure. Trip-causing failures down 38% in 12 months.',
    metric: '38%',
    metricLabel: 'reduction in failure events',
  },
  {
    icon: Factory,
    sector: 'Heavy industry',
    name: 'Manufacturing precinct',
    blurb:
      'AssetMind on 1,200 production assets. CAPEX deferrals reviewed and prioritised by risk-adjusted ROI.',
    metric: '$2.1M',
    metricLabel: 'verified savings in Year 1',
  },
  {
    icon: Mountain,
    sector: 'Mining & resources',
    name: 'WA mining services group',
    blurb:
      'Field-survey workflow on remote sites with offline sync. Inspection cycle compressed from 12 weeks to 3.',
    metric: '4×',
    metricLabel: 'faster inspection cycle',
  },
];

export default function CustomersList() {
  return (
    <section className="py-24 md:py-32 bg-white border-t border-slate-100">
      <div className="max-w-[1280px] mx-auto px-5 md:px-8">
        <div className="max-w-2xl mb-14">
          <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">Selected customers</span>
          <h2 className="mt-3 text-3xl md:text-5xl font-semibold tracking-[-0.03em] leading-[1.05] text-slate-900 text-balance">
            Operators who trust their data to <span className="font-serif italic font-medium text-primary">AssetStack.</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          {CUSTOMERS.map((c, i) => {
            const Icon = c.icon;
            return (
              <motion.a
                key={c.name}
                href="/Contact"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: i * 0.06 }}
                className="group block rounded-2xl border border-slate-200 bg-white p-7 md:p-9 hover-lift elevation-1 hover:border-primary/30 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-primary group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all" />
                </div>
                <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                  {c.sector}
                </p>
                <h3 className="mt-1.5 text-[20px] md:text-[22px] font-semibold text-slate-900 tracking-[-0.01em]">
                  {c.name}
                </h3>
                <p className="mt-3 text-[14px] text-slate-600 leading-[1.65]">{c.blurb}</p>
                <div className="mt-6 pt-5 border-t border-slate-100 flex items-baseline gap-2">
                  <span className="text-2xl md:text-3xl font-semibold tracking-[-0.02em] text-slate-900 tabular-nums">
                    {c.metric}
                  </span>
                  <span className="text-[12px] text-slate-500">{c.metricLabel}</span>
                </div>
              </motion.a>
            );
          })}
        </div>
      </div>
    </section>
  );
}