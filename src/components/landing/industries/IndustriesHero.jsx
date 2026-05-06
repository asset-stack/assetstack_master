import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export default function IndustriesHero() {
  return (
    <section className="relative pt-32 pb-16 md:pt-40 md:pb-20 overflow-hidden bg-white">
      {/* Subtle dotted backdrop */}
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
      <div aria-hidden className="absolute -top-32 left-1/2 -translate-x-1/2 -z-10 w-[1100px] h-[600px] bg-gradient-to-b from-primary/10 via-blue-200/20 to-transparent blur-3xl rounded-full" />

      <div className="max-w-[1280px] mx-auto px-5 md:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-slate-200 bg-white/70 backdrop-blur-sm mb-7"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-subtle" />
          <span className="text-[11px] font-medium text-slate-700">Asset Owners & Infrastructure Operators</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="text-[40px] sm:text-5xl md:text-6xl lg:text-7xl font-semibold tracking-[-0.04em] leading-[1.0] text-slate-900 text-balance max-w-4xl mx-auto"
        >
          Built for Asset Owners &{' '}
          <span className="font-serif italic font-medium text-primary">Infrastructure Operators.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="mt-6 text-[17px] md:text-xl text-slate-600 max-w-2xl mx-auto leading-[1.55] text-pretty"
        >
          AssetStack is designed for organisations managing large portfolios of physical assets across complex infrastructure environments — delivering real-time visibility, predictive intelligence and optimised maintenance.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-9 flex flex-col sm:flex-row gap-2.5 justify-center"
        >
          <Link to="/CommandCenter">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-white elevation-2 h-11 px-6 text-[14px] font-semibold rounded-lg">
              Book a demo <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </Link>
          <Link to="/Landing#tour">
            <Button size="lg" variant="outline" className="h-11 px-6 text-[14px] font-semibold border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 rounded-lg">
              Explore the Platform
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}