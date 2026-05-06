import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, ShieldCheck, Play } from 'lucide-react';
import HeroCommandVisual from './HeroCommandVisual';

export default function LandingHero() {
  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
      {/* Background gradient blobs */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-indigo-400/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute top-40 right-1/4 w-[500px] h-[500px] bg-purple-400/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-0 left-1/3 w-[400px] h-[400px] bg-pink-400/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '4s' }} />
      </div>

      {/* Grid pattern */}
      <div className="absolute inset-0 -z-10 opacity-[0.03]" style={{
        backgroundImage: `linear-gradient(to right, #000 1px, transparent 1px), linear-gradient(to bottom, #000 1px, transparent 1px)`,
        backgroundSize: '48px 48px',
      }} />

      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex justify-center mb-6"
        >
          <a href="#demo" className="group inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all">
            <span className="flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-xs font-semibold text-slate-700">New: construction, mining, fleet, manufacturing, rail & utilities demos</span>
            <ArrowRight className="w-3 h-3 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </a>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-center text-5xl md:text-7xl lg:text-8xl font-black tracking-tight text-slate-900 leading-[1.05]"
        >
          The AI operating system
          <br />
          <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">
            for physical assets.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-7 text-center text-lg md:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed"
        >
          Detect defects from photos, predict failures from live asset data, dispatch the right work, and prove every avoided breakdown with audit-ready evidence — across construction, mining, fleet, manufacturing, rail, utilities, and infrastructure.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-10 flex flex-col sm:flex-row gap-3 justify-center items-center"
        >
          <Link to="/CommandCenter">
            <Button size="lg" className="bg-slate-900 hover:bg-slate-800 text-white shadow-xl shadow-slate-900/20 h-12 px-7 text-base font-semibold">
              <Sparkles className="w-4 h-4 mr-2" /> Open the platform
            </Button>
          </Link>
          <a href="#demo">
            <Button size="lg" variant="outline" className="h-12 px-7 text-base font-semibold border-slate-300 bg-white/60 backdrop-blur">
              <Play className="w-4 h-4 mr-2" /> See the live demo
            </Button>
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="mt-8 flex flex-wrap gap-x-6 gap-y-2 justify-center text-xs text-slate-500"
        >
          <div className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> SOC 2 ready</div>
          <div className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Immutable audit trail</div>
          <div className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Verified ROI ledger</div>
          <div className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> No infrastructure setup</div>
        </motion.div>

        <HeroCommandVisual />
      </div>
    </section>
  );
}