import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';

const FAQS = [
  {
    q: 'How fast can we go live?',
    a: 'A pilot typically runs in two to four weeks: we ingest your asset register, scan a representative sample, and configure roles and workflows alongside your team. We provide hands-on onboarding throughout.',
  },
  {
    q: 'Do we need to install anything on-site?',
    a: 'No. AssetStack runs in the cloud. It ingests your existing inspection data, sensor feeds and asset records via file imports or APIs. A private-cloud or self-hosted option is available on the Enterprise tier.',
  },
  {
    q: 'How does AI condition scanning work?',
    a: 'You upload photos or 3D scans of an asset. Our vision models highlight anomalies — cracks, corrosion, wear, missing parts — with a confidence score and a bounding box. Every detection is reviewable, and reviewer corrections feed back into model training.',
  },
  {
    q: 'How does it fit alongside our existing systems?',
    a: 'AssetStack supports flat-file imports (Excel, CSV) and a REST API for asset records, sensor data and work orders. Integrations to specific CMMS or ERP systems are scoped per engagement on the Business and Enterprise tiers.',
  },
  {
    q: 'What is the Verified Savings Ledger?',
    a: 'A built-in record where each AI-driven intervention is logged with the prediction, the work order, the evidence (photos, sensor traces, inspection notes) and the financial outcome — verified by a human reviewer before the entry is finalised.',
  },
  {
    q: 'What does it cost?',
    a: 'Pricing is shaped to your asset count, deployment and integration needs. Get in touch and we will quote precisely after a short scoping call.',
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