import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import IndustryDemo from './demos/IndustryDemo';

export default function LiveDemoSection() {
  return (
    <section id="demo" className="py-20 md:py-28 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-white via-indigo-50/30 to-white -z-10" />

      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-indigo-600"><Sparkles className="w-4 h-4" /> Live industry demo</span>
          <h2 className="mt-3 text-4xl md:text-6xl font-black tracking-tight text-slate-900">
            One product. Six industries. Real operational value.
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Switch industries below and watch AssetStack adapt the same AI workflow to construction sites, mines, vehicle fleets, factories, rail networks, and utilities.
          </p>
        </motion.div>

        <IndustryDemo />
      </div>
    </section>
  );
}