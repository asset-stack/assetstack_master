import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

/**
 * A single feature module: image/preview on one side, copy on the other.
 * Alternates orientation based on `reverse` prop.
 */
export default function ProductModule({
  index,
  badge,
  title,
  intro,
  body,
  capabilities = [],
  outcome,
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
          {/* Preview pane */}
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
                {badge}
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
            {body && (
              <p className="mt-3 text-slate-600 text-[14.5px] leading-relaxed">
                {body}
              </p>
            )}

            {capabilities.length > 0 && (
              <>
                <p className="mt-7 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500 mb-3">
                  Key capabilities
                </p>
                <ul className="space-y-2.5">
                  {capabilities.map((c) => (
                    <li key={c} className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" strokeWidth={2.5} />
                      <span className="text-[14px] text-slate-700 leading-snug">{c}</span>
                    </li>
                  ))}
                </ul>
              </>
            )}

            {outcome && (
              <div className="mt-7 pl-4 border-l-2 border-primary/40">
                <p className="text-[13.5px] text-slate-600 italic leading-relaxed">
                  {outcome}
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}