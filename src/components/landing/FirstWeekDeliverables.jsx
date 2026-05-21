import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, ArrowRight, Check } from 'lucide-react';

const DAYS = [
{ day: 'Day 1', title: 'Asset register imported', detail: 'CSV/Excel upload mapped to AssetStack schema, locations geocoded.' },
{ day: 'Day 2', title: 'AI condition baseline', detail: 'Photos and existing data graded — every asset has C1–C5 condition + RUL.' },
{ day: 'Day 3', title: 'Predictions running', detail: 'Risk scores, failure probability and cohort variance computed.' },
{ day: 'Day 4', title: 'Funding plan optimised', detail: 'Capital plan generated against your budget with risk-reduction-per-dollar.' },
{ day: 'Day 5', title: 'Compliance live', detail: 'Inspection cycles scheduled, audit trail enabled, evidence packs auto-generated.' },
{ day: 'Day 7', title: 'First savings logged', detail: 'Verified Savings Ledger entry created — your ROI starts compounding.' }];


export default function FirstWeekDeliverables() {
  return (
    <section className="py-20 md:py-28 bg-white border-t border-slate-100">
      <div className="max-w-[1280px] mx-auto px-5 md:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 mb-4">
            <Calendar className="w-3 h-3 text-emerald-700" />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700">Concrete deliverables</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-semibold tracking-[-0.03em] leading-[1.05] text-slate-900 text-balance">
            Your first <span className="font-serif italic font-medium text-primary">7 days.</span>
          </h2>
          <p className="mt-3 text-[15px] md:text-base text-slate-600 max-w-xl mx-auto">No vague onboarding, these are the artefacts you'll have in hand by end of week one.

          </p>
        </div>

        <div className="max-w-2xl mx-auto relative">
          <div className="absolute left-[27px] top-2 bottom-2 w-px bg-gradient-to-b from-primary/40 via-slate-200 to-emerald-300" />
          {DAYS.map((d, i) =>
          <motion.div
            key={d.day}
            initial={{ opacity: 0, x: -12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.45, delay: i * 0.07 }}
            className="relative flex items-start gap-4 mb-5 last:mb-0">
            
              <div className={`relative z-10 w-14 h-14 rounded-full flex items-center justify-center font-bold text-[11px] shrink-0 border-2 ${
            i === DAYS.length - 1 ?
            'bg-emerald-500 text-white border-emerald-200 shadow-lg shadow-emerald-500/30' :
            'bg-white text-primary border-primary/30 shadow-md'}`
            }>
                {i === DAYS.length - 1 ? <Check className="w-5 h-5" /> : d.day.replace('Day ', 'D')}
              </div>
              <div className="flex-1 pt-1">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-0.5">{d.day}</div>
                <div className="text-[15px] font-bold text-slate-900 mb-1">{d.title}</div>
                <div className="text-[13px] text-slate-600 leading-relaxed">{d.detail}</div>
              </div>
            </motion.div>
          )}
        </div>

        <div className="mt-12 flex flex-col sm:flex-row gap-3 justify-center items-center">
          <a href="#contact" className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-lg text-[13px] font-bold elevation-2 transition-colors">
            Book a demo <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>);

}