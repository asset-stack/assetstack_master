import React from 'react';
import { motion } from 'framer-motion';
import { Check, ArrowUpRight } from 'lucide-react';

export default function SolutionsSolutionBlock({
  index,
  title,
  intro,
  capabilities = [],
  benefits = [],
  preview,
  reverse = false,
}) {
  return (
    <section className="py-16 lg:py-24 border-t border-slate-100">
      <div className="max-w-[1280px] mx-auto px-5 md:px-10">
        <div
          className={`grid lg:grid-cols-12 gap-10 lg:gap-16 items-center ${
            reverse ? 'lg:[&>*:first-child]:order-2' : ''
          }`}
        >
          {/* Preview */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-7"
          >
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 shadow-xl shadow-slate-900/5 aspect-[16/10]">
              {preview}
            </div>
          </motion.div>

          {/* Copy */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-5"
          >
            <div className="flex items-center gap-3 mb-5">
              <span className="text-[11px] font-bold tabular-nums text-primary">
                {String(index).padStart(2, '0')}
              </span>
              <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                Solution
              </span>
            </div>

            <h3
              className="font-normal text-slate-900 leading-[1.08] tracking-[-0.01em]"
              style={{
                fontFamily: "Georgia, 'Times New Roman', serif",
                fontSize: 'clamp(1.7rem, 3.2vw, 2.6rem)',
              }}
            >
              {title}
            </h3>

            <p className="mt-5 text-slate-700 text-[15px] leading-relaxed">
              {intro}
            </p>

            <div className="grid sm:grid-cols-2 gap-6 mt-7">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500 mb-3">
                  Capabilities
                </p>
                <ul className="space-y-2">
                  {capabilities.map((c) => (
                    <li key={c} className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-primary mt-1 shrink-0" strokeWidth={2.5} />
                      <span className="text-[13.5px] text-slate-700 leading-snug">{c}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500 mb-3">
                  Benefits
                </p>
                <ul className="space-y-2">
                  {benefits.map((b) => (
                    <li key={b} className="flex items-start gap-2">
                      <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600 mt-1 shrink-0" strokeWidth={2.5} />
                      <span className="text-[13.5px] text-slate-700 leading-snug">{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}