import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export default function CaseStudyHero() {
  return (
    <section className="relative pt-32 pb-12 md:pt-40 md:pb-16 overflow-hidden bg-white">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 opacity-[0.4]"
        style={{
          backgroundImage: 'radial-gradient(hsl(220 14% 80%) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          maskImage: 'radial-gradient(ellipse at 50% 30%, black 30%, transparent 70%)',
          WebkitMaskImage: 'radial-gradient(ellipse at 50% 30%, black 30%, transparent 70%)',
        }}
      />
      <div aria-hidden className="absolute -top-32 left-1/2 -translate-x-1/2 -z-10 w-[1100px] h-[500px] bg-gradient-to-b from-primary/10 via-blue-200/20 to-transparent blur-3xl rounded-full" />

      <div className="max-w-[1080px] mx-auto px-5 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center mb-6"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-slate-200 bg-white/70 backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-subtle" />
            <span className="text-[11px] font-medium text-slate-700">Case studies · Real outcomes</span>
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="text-center text-[40px] sm:text-5xl md:text-6xl lg:text-[72px] font-semibold tracking-[-0.04em] leading-[1.0] text-slate-900 text-balance"
        >
          The teams that maintain
          <br className="hidden sm:block" />
          {' '}Australia's{' '}
          <span className="font-serif italic font-medium text-primary">infrastructure.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="mt-6 text-center text-[16px] md:text-lg text-slate-600 max-w-2xl mx-auto leading-[1.55] text-pretty"
        >
          From regional councils to national rail operators — see how AssetStack moves real teams from reactive inspections to predictive, defensible asset intelligence.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 flex justify-center"
        >
          <a href="#bunbury" className="group inline-flex items-center gap-2 text-[13px] font-semibold text-primary">
            Read the first study <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}