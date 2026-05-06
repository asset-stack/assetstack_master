import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Play } from 'lucide-react';

export default function FinalCTA() {
  return (
    <section className="py-24 md:py-36 bg-white">
      <div className="max-w-[1280px] mx-auto px-5 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative rounded-3xl bg-slate-900 text-white px-8 py-16 md:px-16 md:py-24 overflow-hidden"
        >
          {/* Ambient glow */}
          <div aria-hidden className="absolute inset-0 opacity-50" style={{
            backgroundImage: 'radial-gradient(circle at 20% 20%, hsl(var(--primary) / 0.4), transparent 50%), radial-gradient(circle at 80% 80%, hsl(214 100% 70% / 0.3), transparent 50%)',
          }} />
          <div aria-hidden className="absolute inset-0 opacity-[0.04]" style={{
            backgroundImage: 'linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }} />

          <div className="relative max-w-3xl">
            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-blue-200">Ready when you are</span>
            <h2 className="mt-3 text-4xl md:text-6xl lg:text-7xl font-semibold tracking-[-0.035em] leading-[1.02] text-balance">
              The next breakdown is{' '}
              <span className="font-serif italic font-medium text-blue-200">already on its way.</span>
            </h2>
            <p className="mt-5 text-[17px] text-slate-300 leading-[1.55] max-w-xl text-pretty">
              Find it before it finds you. Connect your assets, run a scan, and watch AssetStack draw the first ledger entry — all in your trial week.
            </p>

            <div className="mt-9 flex flex-col sm:flex-row gap-2.5">
              <Link to="/CommandCenter">
                <Button size="lg" className="bg-white hover:bg-slate-100 text-slate-900 elevation-2 h-12 px-7 text-[14px] font-semibold rounded-lg">
                  Start free 14-day trial <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </Link>
              <a href="#tour">
                <Button size="lg" variant="outline" className="h-12 px-7 text-[14px] font-semibold border-white/20 bg-white/5 text-white hover:bg-white/10 hover:border-white/30 rounded-lg backdrop-blur">
                  <Play className="w-3.5 h-3.5 mr-1.5 fill-white" /> Watch the 60-second tour
                </Button>
              </a>
            </div>

            <div className="mt-7 flex flex-wrap gap-x-5 gap-y-1.5 text-[12px] text-slate-400">
              <span>14-day trial · No credit card</span>
              <span className="opacity-50">·</span>
              <span>Cancel anytime</span>
              <span className="opacity-50">·</span>
              <span>SOC 2 Type II</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}