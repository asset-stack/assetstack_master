import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, Play, ShieldCheck } from 'lucide-react';
import HeroProductCanvas from './HeroProductCanvas';
import HeroLiveAssetMind from './HeroLiveAssetMind';
import HeroBanner from './HeroBanner';

export default function LandingHero() {
  const [bannerPos, setBannerPos] = useState(null);
  const bannerWrapRef = useRef(null);

  const handleMove = (e) => {
    const rect = bannerWrapRef.current?.getBoundingClientRect();
    if (!rect) return;
    setBannerPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <section
      className="relative pt-32 pb-16 md:pt-40 md:pb-24 overflow-hidden"
      onMouseMove={handleMove}
      onMouseLeave={() => setBannerPos(null)}
    >
      {/* Interactive image banner background */}
      <div
        ref={bannerWrapRef}
        className="absolute inset-0 z-0"
      >
        <HeroBanner pos={bannerPos} />
      </div>

      <div className="max-w-[1280px] mx-auto px-5 md:px-8 relative z-10">
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
            <span className="text-[11px] font-medium text-slate-700">New · Verified Savings Ledger</span>
            <ArrowRight className="w-3 h-3 text-slate-400 group-hover:translate-x-0.5 group-hover:text-primary transition-all" />
          </a>
        </motion.div>

        {/* Editorial headline */}
        <motion.h1
          id="hero-heading"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="text-center text-[40px] sm:text-5xl md:text-6xl lg:text-[76px] font-semibold tracking-[-0.04em] leading-[1.02] text-slate-900 text-balance"
        >
          Stop discovering breakdowns
          <br className="hidden sm:block" />
          {' '}<span className="font-serif italic font-medium text-primary">after they cost you $200K.</span>
        </motion.h1>

        {/* Subhead */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="mt-7 text-center text-[17px] md:text-xl text-slate-600 max-w-2xl mx-auto leading-[1.5] text-pretty"
        >
          AssetStack reads your photos, your sensors, and your maintenance history — then tells you which asset is about to fail, who should fix it, and proves the savings in a ledger your CFO can audit. Used by <span className="text-slate-900 font-semibold">Bunbury Council</span> and <span className="text-slate-900 font-semibold">Lycopodium</span> on 100+ assets.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-9 flex flex-col gap-2 justify-center items-center"
        >
          <a href="#contact">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-white elevation-2 h-12 px-7 text-[15px] font-semibold rounded-lg">
              See it on your assets — 30 min <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </a>
          <p className="text-[12px] text-slate-500 mt-1">
            No slides. Bring 5 of your toughest assets — we'll show predictions on them live.
          </p>
          <a href="#tour" className="text-[13px] text-slate-500 hover:text-primary underline underline-offset-4 decoration-slate-300 hover:decoration-primary transition-colors mt-2 inline-flex items-center gap-1.5">
            <Play className="w-3 h-3" /> Or watch the 60-second tour
          </a>
        </motion.div>

        {/* Trust strip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-7 flex flex-wrap gap-x-5 gap-y-1.5 justify-center text-[11px] text-slate-500"
        >
          <div className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-primary/70" /> Detailed audit trail</div>
          <div className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-primary/70" /> Verified Savings Ledger</div>
          <div className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-primary/70" /> Per-tenant data isolation</div>
          <div className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-primary/70" /> Australian-built</div>
        </motion.div>

        {/* Live AssetMind — the "magic trick" — visitors can query real data before signup */}
        <HeroLiveAssetMind />

        <HeroProductCanvas />
      </div>
    </section>
  );
}