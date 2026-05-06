import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Play, ShieldCheck } from 'lucide-react';
import HeroProductCanvas from './HeroProductCanvas';

export default function LandingHero() {
  return (
    <section className="relative pt-32 pb-16 md:pt-40 md:pb-24 overflow-hidden bg-white">
      {/* Subtle dotted backdrop */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 opacity-[0.4]"
        style={{
          backgroundImage:
            'radial-gradient(hsl(220 14% 80%) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          maskImage:
            'radial-gradient(ellipse at 50% 30%, black 30%, transparent 70%)',
          WebkitMaskImage:
            'radial-gradient(ellipse at 50% 30%, black 30%, transparent 70%)',
        }}
      />
      {/* Soft blue ambient */}
      <div aria-hidden className="absolute -top-32 left-1/2 -translate-x-1/2 -z-10 w-[1100px] h-[600px] bg-gradient-to-b from-primary/10 via-blue-200/20 to-transparent blur-3xl rounded-full" />

      <div className="max-w-[1280px] mx-auto px-5 md:px-8">
        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex justify-center mb-7"
        >
          <a href="#tour" className="group inline-flex items-center gap-2 px-3 py-1 rounded-full border border-slate-200 bg-white/70 backdrop-blur-sm hover:border-primary/30 hover:bg-primary/[0.03] transition-all">
            <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-primary/10">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-subtle" />
            </span>
            <span className="text-[11px] font-medium text-slate-700">New · Verified Savings Ledger 2.0</span>
            <ArrowRight className="w-3 h-3 text-slate-400 group-hover:translate-x-0.5 group-hover:text-primary transition-all" />
          </a>
        </motion.div>

        {/* Editorial headline */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="text-center text-[44px] sm:text-6xl md:text-7xl lg:text-[88px] font-semibold tracking-[-0.04em] leading-[0.98] text-slate-900 text-balance"
        >
          The AI operating system
          <br className="hidden sm:block" />
          {' '}for{' '}
          <span className="font-serif italic font-medium text-primary">physical assets.</span>
        </motion.h1>

        {/* Subhead */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="mt-7 text-center text-[17px] md:text-xl text-slate-600 max-w-2xl mx-auto leading-[1.5] text-pretty"
        >
          Detect defects from photos. Predict failures from live data. Dispatch the right work — and prove every avoided breakdown with audit-ready evidence.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-9 flex flex-col sm:flex-row gap-2.5 justify-center items-center"
        >
          <Link to="/CommandCenter">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-white elevation-2 h-11 px-6 text-[14px] font-semibold rounded-lg">
              Open the platform <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </Link>
          <a href="#tour">
            <Button size="lg" variant="outline" className="h-11 px-6 text-[14px] font-semibold border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 rounded-lg">
              <Play className="w-3.5 h-3.5 mr-1.5 fill-slate-700" /> Watch 60-second tour
            </Button>
          </a>
        </motion.div>

        {/* Trust strip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-7 flex flex-wrap gap-x-5 gap-y-1.5 justify-center text-[11px] text-slate-500"
        >
          <div className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-primary/70" /> SOC 2 Type II</div>
          <div className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-primary/70" /> Immutable audit trail</div>
          <div className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-primary/70" /> Verified ROI ledger</div>
          <div className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-primary/70" /> 14-day rollout</div>
        </motion.div>

        <HeroProductCanvas />
      </div>
    </section>
  );
}