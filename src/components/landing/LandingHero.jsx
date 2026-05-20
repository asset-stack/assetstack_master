import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, Play } from 'lucide-react';
import HeroLiveAssetMind from './HeroLiveAssetMind';
import HeroProductCanvas from './HeroProductCanvas';

const HERO_IMG = "https://media.base44.com/images/public/6a0a6a5d4d043b0e41a16d90/b37f3860d_architectural-elegance-of-the-sails-at-the-sydney-2026-01-09-11-39-37-utc.jpg";

export default function LandingHero() {
  return (
    <>
      {/* Editorial full-bleed hero */}
      <section
        className="relative w-full overflow-hidden"
        style={{ background: '#1925aa', height: '100vh', minHeight: 640 }}
        aria-labelledby="hero-heading"
      >
        {/* Background image */}
        <div
          aria-hidden
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url('${HERO_IMG}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />

        {/* Gradient overlay for legibility */}
        <div
          aria-hidden
          className="absolute inset-0 z-10"
          style={{
            background:
              'linear-gradient(180deg, rgba(10,15,100,0.35) 0%, rgba(10,15,100,0.25) 45%, rgba(10,15,100,0.75) 100%)',
          }}
        />

        {/* 12-col vertical guides (desktop) */}
        <div className="hero-lines absolute inset-0 z-20 hidden lg:grid grid-cols-12 gap-x-4 px-4 pointer-events-none">
          {Array.from({ length: 12 }).map((_, i) => (
            <motion.i
              key={i}
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ duration: 1.2, delay: 0.4 + i * 0.04, ease: [0.22, 1, 0.36, 1] }}
              className="block h-full border-l"
              style={{ borderColor: 'rgba(255,255,255,0.18)', transformOrigin: 'top' }}
            />
          ))}
        </div>

        {/* Hero content — bottom-aligned editorial layout */}
        <div className="relative z-30 h-full flex flex-col justify-end px-5 pb-12 md:px-10 md:pb-20 max-w-[1480px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 lg:gap-x-4">
            {/* Title */}
            <div className="lg:col-span-9 overflow-hidden">
              <motion.h1
                id="hero-heading"
                initial={{ y: '110%' }}
                animate={{ y: '0%' }}
                transition={{ duration: 1.1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="text-white font-serif font-normal leading-[0.92] tracking-[-0.01em]"
                style={{
                  fontFamily: "Georgia, 'Times New Roman', serif",
                  fontSize: 'clamp(3rem, 13vw, 10rem)',
                }}
              >
                Built to last.<br />Managed to perform.
              </motion.h1>
            </div>

            {/* Tagline */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 1.2 }}
              className="lg:col-span-4 lg:col-start-9 lg:self-end mt-6 lg:mt-0 lg:pb-2"
            >
              <p
                className="text-white/85"
                style={{
                  fontFamily: "'Courier New', monospace",
                  fontSize: 'clamp(0.75rem, 1.2vw, 1rem)',
                  lineHeight: 1.5,
                }}
              >
                AssetStack reads your photos, sensors and<br />
                history — predicts failures before they cost<br />
                $200K, and proves every saving in a ledger<br />
                your CFO can audit.
              </p>

              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.5 }}
                className="mt-6 flex flex-wrap gap-3"
              >
                <a href="#contact">
                  <Button
                    size="lg"
                    className="bg-white hover:bg-white/90 text-[#1925aa] h-11 px-6 text-[14px] font-semibold rounded-md"
                  >
                    See it on your assets <ArrowRight className="w-4 h-4 ml-1.5" />
                  </Button>
                </a>
                <a
                  href="#tour"
                  className="inline-flex items-center gap-1.5 text-white/85 hover:text-white text-[13px] font-medium px-3 h-11 border border-white/40 hover:border-white/80 rounded-md transition-colors"
                >
                  <Play className="w-3.5 h-3.5" /> 60-sec tour
                </a>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Keep the live AssetMind + product canvas below the editorial hero */}
      <section className="bg-white pt-16 md:pt-24 pb-12">
        <div className="max-w-[1280px] mx-auto px-5 md:px-8">
          <HeroLiveAssetMind />
          <HeroProductCanvas />
        </div>
      </section>
    </>
  );
}