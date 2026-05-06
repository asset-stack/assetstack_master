import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';

const FAQS = [
  {
    q: 'How fast can we go live?',
    a: 'Most teams run their first AI scan in under an hour and have the first verified ledger entry within two weeks. We offer a guided 14-day onboarding for free.',
  },
  {
    q: 'Do we need to install anything on-site?',
    a: 'No. AssetStack runs in the cloud and ingests your existing CMMS, sensor feeds, and inspection photos. An on-prem deployment is available for regulated estates.',
  },
  {
    q: 'How accurate is the AI condition scanning?',
    a: 'Our vision models hit 94% precision on verified condition reports across construction, mining, and utilities. Every prediction is auditable, with confidence scores and bounding boxes.',
  },
  {
    q: 'Will it work with our existing CMMS?',
    a: 'Yes. We integrate with SAP PM, Maximo, Fiix, UpKeep, and any system with a REST API. We also support flat-file imports (Excel, CSV, BIM, point clouds).',
  },
  {
    q: 'How does the Verified Savings Ledger work?',
    a: 'Each prediction is tied to an intervention, an evidence pack (photos, sensor traces, inspection report), and a financial outcome. The ledger row is cryptographically signed for audit.',
  },
  {
    q: 'What does it cost?',
    a: 'Pricing is per asset, per month, starting at $7. Most customers reach ROI within their first ledger entry. See our pricing section above.',
  },
];

export default function FAQ() {
  const [open, setOpen] = useState(0);

  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="max-w-[820px] mx-auto px-5 md:px-8">
        <div className="text-center mb-10">
          <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">FAQ</span>
          <h2 className="mt-3 text-4xl md:text-5xl font-semibold tracking-[-0.03em] leading-[1.05] text-slate-900 text-balance">
            Questions, answered.
          </h2>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden divide-y divide-slate-100">
          {FAQS.map((f, i) => {
            const isOpen = open === i;
            return (
              <div key={f.q}>
                <button
                  onClick={() => setOpen(isOpen ? -1 : i)}
                  className="w-full flex items-center justify-between gap-4 px-5 py-5 text-left hover:bg-slate-50/40 transition-colors"
                >
                  <span className="text-[15px] font-semibold text-slate-900 tracking-tight">{f.q}</span>
                  <Plus className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${isOpen ? 'rotate-45 text-primary' : ''}`} />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="px-5 pb-5 -mt-1 text-[14px] text-slate-600 leading-[1.6]">{f.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}