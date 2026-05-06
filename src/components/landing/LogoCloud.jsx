import React from 'react';
import { motion } from 'framer-motion';

// Real, documented engagements only. Both link to detailed case studies.
const CUSTOMERS = ['Bunbury Council', 'Lycopodium'];

export default function LogoCloud() {
  return (
    <section className="py-14 md:py-16 border-y border-slate-100 bg-white">
      <div className="max-w-[1280px] mx-auto px-5 md:px-8">
        <p className="text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400 mb-7">
          Working with infrastructure operators across Australia
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-4">
          {CUSTOMERS.map((c, i) => (
            <motion.a
              key={c}
              href="/CaseStudies"
              initial={{ opacity: 0, y: 6 }}
              whileInView={{ opacity: 0.7, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              whileHover={{ opacity: 1 }}
              className="text-[16px] md:text-[18px] font-serif italic font-medium text-slate-600 tracking-tight transition-opacity hover:text-primary"
            >
              {c}
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}