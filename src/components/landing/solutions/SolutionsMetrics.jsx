import React from 'react';
import { motion } from 'framer-motion';

const METRICS = [
  { value: '90%', label: 'Prediction Accuracy' },
  { value: '32%', label: 'Maintenance Cost Reduction' },
  { value: '450+', label: 'Assets Monitored' },
  { value: '24/7', label: 'Real-Time Monitoring' },
];

export default function SolutionsMetrics() {
  return (
    <section className="relative py-20 lg:py-24 bg-slate-50 border-t border-slate-100">
      <div className="max-w-[1280px] mx-auto px-5 md:px-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10">
          {METRICS.map((m, i) => (
            <motion.div
              key={m.label}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              className="text-center md:text-left"
            >
              <p
                className="font-normal text-primary leading-none tabular-nums"
                style={{
                  fontFamily: "Georgia, 'Times New Roman', serif",
                  fontSize: 'clamp(2.2rem, 5vw, 3.6rem)',
                }}
              >
                {m.value}
              </p>
              <p className="mt-3 text-[12px] font-semibold uppercase tracking-[0.14em] text-slate-600">
                {m.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}