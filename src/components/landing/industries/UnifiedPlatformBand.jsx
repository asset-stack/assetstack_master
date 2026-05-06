import React from 'react';
import { motion } from 'framer-motion';
import { ClipboardCheck, Box, Radio, Brain, BarChart3 } from 'lucide-react';

const PILLARS = [
  { icon: ClipboardCheck, label: 'Asset inspections' },
  { icon: Box, label: 'Digital twin infrastructure' },
  { icon: Radio, label: 'IoT sensor integration' },
  { icon: Brain, label: 'AI predictive analytics' },
  { icon: BarChart3, label: 'Operational dashboards' },
];

export default function UnifiedPlatformBand() {
  return (
    <section className="py-20 md:py-28 bg-slate-50/40 border-y border-slate-100">
      <div className="max-w-[1100px] mx-auto px-5 md:px-8 text-center">
        <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">One Platform</span>
        <h2 className="mt-3 text-3xl md:text-5xl font-semibold tracking-[-0.03em] leading-[1.05] text-slate-900 text-balance">
          One platform for{' '}
          <span className="font-serif italic font-medium text-primary">complex asset environments.</span>
        </h2>
        <p className="mt-4 text-[16px] md:text-[17px] text-slate-600 leading-[1.6] max-w-2xl mx-auto text-pretty">
          While each sector operates differently, they share a common challenge — managing large, distributed asset portfolios across complex environments. AssetStack unifies asset data, inspections, sensor telemetry and predictive analytics into actionable intelligence.
        </p>

        <div className="mt-10 grid grid-cols-2 md:grid-cols-5 gap-3">
          {PILLARS.map((p, i) => {
            const Icon = p.icon;
            return (
              <motion.div
                key={p.label}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="rounded-xl border border-slate-200 bg-white p-4 hover:border-primary/30 hover:elevation-1 transition-all"
              >
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <div className="text-[12px] font-semibold text-slate-800 leading-tight">{p.label}</div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}