import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';

const FAQS = [
  { q: 'How fast can we go live?', a: 'Most councils import their existing asset register and run the first AI scans within 5 business days. Full rollout including sensor integrations typically takes 4–6 weeks.' },
  { q: 'Do you support our existing data sources?', a: 'Yes. We import from Excel, CSV, Power BI, BIM models, LiDAR point clouds, and most IoT platforms via API. If you can name it, we can probably ingest it.' },
  { q: 'How does the AI know what counts as a defect?', a: 'Our vision models are trained on millions of infrastructure images and continuously improved by your verified condition reports. Every prediction is logged and human-reviewable.' },
  { q: 'What happens if the AI is wrong?', a: 'Reviewers can correct or reject any finding. Corrections feed back into retraining, so accuracy improves with use. Every retrain is logged in the audit trail.' },
  { q: 'Can we self-host?', a: 'Enterprise plans support on-premises and private-cloud deployment. SaaS is hosted on AU-region infrastructure by default for Australian customers.' },
  { q: 'Is there a free trial?', a: 'Yes — 30 days, no card required, full feature access. We also offer a guided pilot for councils and rail operators.' },
];

export default function FAQ() {
  const [open, setOpen] = useState(0);

  return (
    <section className="py-20 md:py-28">
      <div className="max-w-3xl mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">FAQ</span>
          <h2 className="mt-3 text-4xl md:text-5xl font-black tracking-tight text-slate-900">
            Questions teams ask before signing.
          </h2>
        </motion.div>

        <div className="space-y-2">
          {FAQS.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="bg-white border border-slate-200 rounded-xl overflow-hidden"
            >
              <button
                onClick={() => setOpen(open === i ? -1 : i)}
                className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
              >
                <span className="font-semibold text-slate-900 text-[15px]">{f.q}</span>
                {open === i ? <Minus className="w-4 h-4 text-slate-400 shrink-0" /> : <Plus className="w-4 h-4 text-slate-400 shrink-0" />}
              </button>
              <AnimatePresence>
                {open === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-4 text-slate-600 text-sm leading-relaxed">{f.a}</div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}