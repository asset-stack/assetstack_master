import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, Calendar } from 'lucide-react';

// Sister-site style hero — big bold headline over a deep indigo textured background.
// Uses the current theme's Inter font + indigo/primary palette (NOT the sister's pure blue).
export default function SisterHero() {
  return (
    <section className="relative overflow-hidden bg-slate-950">
      {/* Layered background — textured indigo gradient */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950" />
        {/* Diagonal grid texture */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              'repeating-linear-gradient(115deg, rgba(255,255,255,0.06) 0 1px, transparent 1px 14px), repeating-linear-gradient(25deg, rgba(255,255,255,0.04) 0 1px, transparent 1px 14px)',
          }}
        />
        {/* Soft glow */}
        <div className="absolute -top-32 -left-32 w-[680px] h-[680px] rounded-full bg-indigo-500/20 blur-[140px]" />
        <div className="absolute bottom-0 right-0 w-[520px] h-[520px] rounded-full bg-purple-500/15 blur-[160px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8 pt-28 pb-24 lg:pt-36 lg:pb-32">
        <div className="grid lg:grid-cols-12 gap-8 items-end">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-9"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur border border-white/15 text-white/80 text-[11px] font-medium tracking-wide uppercase mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              The AI operating system for physical assets
            </div>

            <h1 className="text-white font-bold tracking-tight leading-[0.95] text-[44px] sm:text-[64px] lg:text-[96px] xl:text-[112px]">
              AI Infrastructure
              <br />
              <span className="text-gradient bg-gradient-to-r from-indigo-200 via-white to-purple-200 bg-clip-text text-transparent">
                Intelligence
              </span>
              <br />
              Platform
            </h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-3 flex flex-col gap-5"
          >
            <p className="text-white/70 text-sm leading-relaxed max-w-xs">
              AssetStack connects inspections, digital twins, sensor data and machine learning to predict failures and optimise maintenance.
            </p>
            <div className="flex flex-col sm:flex-row lg:flex-col gap-3">
              <a
                href="#contact"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-md bg-white text-slate-900 font-semibold text-sm hover:bg-slate-100 transition-colors"
              >
                <Calendar className="w-4 h-4" /> Book a Demo
              </a>
              <a
                href="/CommandCenter"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-md border border-white/30 text-white font-semibold text-sm hover:bg-white/10 transition-colors"
              >
                Platform <ArrowUpRight className="w-4 h-4" />
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}