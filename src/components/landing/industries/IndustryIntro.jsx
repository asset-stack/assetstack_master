import React from 'react';
import { motion } from 'framer-motion';

export default function IndustryIntro() {
  return (
    <section className="py-16 md:py-24 bg-slate-50/40 border-y border-slate-100">
      <div className="max-w-[900px] mx-auto px-5 md:px-8 text-center">
        <motion.span
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary"
        >
          Infrastructure Intelligence Across Asset Portfolios
        </motion.span>
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="mt-4 text-3xl md:text-5xl font-semibold tracking-[-0.03em] leading-[1.05] text-slate-900 text-balance"
        >
          From local councils to utilities and transport networks — managing thousands of distributed assets, in one place.
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="mt-5 text-[16px] md:text-[17px] text-slate-600 leading-[1.6] text-pretty"
        >
          AssetStack brings these environments together into a single platform — combining inspections, sensor data, digital twins and machine learning to deliver predictive infrastructure intelligence at scale.
        </motion.p>
      </div>
    </section>
  );
}