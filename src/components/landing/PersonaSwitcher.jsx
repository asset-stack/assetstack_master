import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, Wallet, HardHat, Building2, ArrowRight, Check } from 'lucide-react';

const PERSONAS = [
{
  id: 'asset_manager',
  icon: Briefcase,
  label: 'Asset Manager',
  headline: 'Your backlog, condition and capital plan — at a glance',
  bullets: ['Live backlog reduction', 'Risk-ranked renewals', 'IIMM-aligned reporting'],
  accent: 'from-indigo-500 to-blue-500'
},
{
  id: 'cfo',
  icon: Wallet,
  label: 'CFO / Finance',
  headline: 'Defensible depreciation and verified ROI in one ledger',
  bullets: ['Audit-grade WDV vs CRC', 'Verified Savings Ledger', 'Multi-year capital scenarios'],
  accent: 'from-emerald-500 to-teal-500'
},
{
  id: 'engineer',
  icon: HardHat,
  label: 'Field Engineer',
  headline: 'Mobile-first inspection cycles, photos and bulk updates',
  bullets: ['Offline-capable surveys', 'AI photo defect detection', 'Bulk condition updates'],
  accent: 'from-amber-500 to-orange-500'
},
{
  id: 'exec',
  icon: Building2,
  label: 'Executive',
  headline: 'Portfolio health, climate risk and savings in one view',
  bullets: ['Command centre dashboard', 'Climate-adjusted lifespans', 'Exec-ready briefings'],
  accent: 'from-rose-500 to-pink-500'
}];


const STORAGE_KEY = 'assetstack:landing-persona';

export default function PersonaSwitcher() {
  const [active, setActive] = useState(PERSONAS[0]);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const found = PERSONAS.find((p) => p.id === saved);
      if (found) setActive(found);
    }
  }, []);

  const select = (p) => {
    setActive(p);
    try {localStorage.setItem(STORAGE_KEY, p.id);} catch {}
  };

  const ActiveIcon = active.icon;

  return (
    <section id="persona" className="py-20 md:py-28 bg-white border-y border-slate-100">
      <div className="max-w-[1280px] mx-auto px-5 md:px-8">
        <div className="text-center mb-10">
          <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">Built for your role</span>
          <h2 className="mt-3 text-3xl md:text-5xl font-semibold tracking-[-0.03em] leading-[1.05] text-slate-900 text-balance">
            One platform. <span className="font-serif italic font-medium text-primary">Every role.</span>
          </h2>
          <p className="mt-3 text-[15px] md:text-base text-slate-600 max-w-xl mx-auto">Pick how you'll use AssetStack. Build outwe'll remember and tailor what you see across the site.

          </p>
        </div>

        {/* Persona pills */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {PERSONAS.map((p) => {
            const PIcon = p.icon;
            const selected = active.id === p.id;
            return (
              <button
                key={p.id}
                onClick={() => select(p)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full border transition-all ${
                selected ?
                'border-slate-900 bg-slate-900 text-white shadow-md' :
                'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'}`
                }>
                
                <PIcon className="w-3.5 h-3.5" />
                <span className="text-[13px] font-semibold">{p.label}</span>
              </button>);

          })}
        </div>

        {/* Active persona panel */}
        <AnimatePresence mode="wait">
          <motion.div
            key={active.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35 }}
            className="max-w-3xl mx-auto rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50/50 p-8 md:p-10 elevation-2">
            
            <div className="flex items-start gap-5">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${active.accent} flex items-center justify-center shadow-md shrink-0`}>
                <ActiveIcon className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl md:text-3xl font-semibold tracking-tight text-slate-900 leading-tight">
                  {active.headline}
                </h3>
                <ul className="mt-5 space-y-2">
                  {active.bullets.map((b) =>
                  <li key={b} className="flex items-center gap-2 text-[14px] text-slate-700">
                      <Check className="w-4 h-4 text-primary shrink-0" />
                      {b}
                    </li>
                  )}
                </ul>
                <a href="#contact" className="mt-6 inline-flex items-center gap-1.5 text-[13px] font-semibold text-primary hover:gap-2.5 transition-all">
                  Book a demo for your team <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>);

}