import React from 'react';
import { motion } from 'framer-motion';

const STATS = [
  { value: '$2.4B+', label: 'Asset value under management' },
  { value: '180k+', label: 'Assets tracked across customers' },
  { value: '12', label: 'Sectors served — councils to rail' },
  { value: '99.95%', label: 'Platform uptime, last 12 months' },
];

export default function AboutStats() {
  return (
    <section className="py-20 md:py-28 bg-white border-t border-slate-100">
      <div className="max-w-[1280px] mx-auto px-5 md:px-8">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-slate-200 rounded-2xl overflow-hidden border border-slate-200">
          {STATS.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="bg-white p-8 md:p-10"
            >
              <div className="text-3xl md:text-5xl font-semibold tracking-[-0.03em] text-slate-900 tabular-nums">
                {s.value}
              </div>
              <p className="mt-2 text-[13px] text-slate-500 leading-snug">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}