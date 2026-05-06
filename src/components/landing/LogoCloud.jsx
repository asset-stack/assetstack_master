import React from 'react';
import { motion } from 'framer-motion';

const logos = [
  'CITY OF BUNBURY',
  'WESTERN RAIL',
  'PERTH METRO',
  'AURORA POWER',
  'COASTAL WATER',
  'SOUTHERN COUNCIL',
];

export default function LogoCloud() {
  return (
    <section className="py-12 border-y border-slate-100 bg-white/50">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 mb-6">
          Trusted by infrastructure & council teams
        </p>
        <div className="flex flex-wrap justify-center items-center gap-x-10 gap-y-4">
          {logos.map((logo, i) => (
            <motion.div
              key={logo}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="text-sm font-bold text-slate-400 tracking-widest hover:text-slate-700 transition-colors"
            >
              {logo}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}