import React from 'react';
import { motion } from 'framer-motion';

const COMPANIES = [
  'Western Power', 'Northshore Mining', 'Coastal Rail', 'Apex Logistics',
  'Bunbury Council', 'Riverstone Energy', 'Helix Manufacturing', 'Summit Construction',
];

export default function LogoCloud() {
  return (
    <section className="py-14 md:py-16 border-y border-slate-100 bg-white">
      <div className="max-w-[1280px] mx-auto px-5 md:px-8">
        <p className="text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400 mb-7">
          Trusted by operators across 6 industries
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
          {COMPANIES.map((c, i) => (
            <motion.span
              key={c}
              initial={{ opacity: 0, y: 6 }}
              whileInView={{ opacity: 0.55, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04 }}
              whileHover={{ opacity: 1 }}
              className="text-[14px] md:text-[15px] font-serif italic font-medium text-slate-500 tracking-tight transition-opacity"
            >
              {c}
            </motion.span>
          ))}
        </div>
      </div>
    </section>
  );
}