import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Sparkles } from 'lucide-react';

/**
 * Editorial industry section — alternates image left/right.
 * Adds: anchor ID for scroll-spy, stats strip, hover-revealed capability imagery.
 */
export default function IndustrySection({
  index,
  slug,
  eyebrow,
  title,
  description,
  useCases,
  outcomes,
  stats,
  image,
  icon: Icon,
}) {
  const reverse = index % 2 === 1;
  const [hoveredImg, setHoveredImg] = useState(null);

  return (
    <section
      id={slug}
      className="py-16 md:py-24 border-b border-slate-100 bg-white scroll-mt-24"
    >
      <div className="max-w-[1280px] mx-auto px-5 md:px-8">
        <div className={`grid lg:grid-cols-2 gap-10 lg:gap-16 items-center ${reverse ? 'lg:[&>*:first-child]:order-2' : ''}`}>
          {/* Visual — supports image swap on use case hover */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6 }}
            className="relative rounded-2xl overflow-hidden border border-slate-200 elevation-2 aspect-[5/4] bg-slate-100"
          >
            <AnimatePresence mode="wait">
              <motion.img
                key={hoveredImg || image}
                initial={{ opacity: 0, scale: 1.04 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                src={hoveredImg || image}
                alt={title}
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover"
              />
            </AnimatePresence>
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/65 via-slate-900/10 to-transparent" />
            <div className="absolute bottom-5 left-5 right-5 flex items-center gap-2.5 text-white">
              <div className="w-9 h-9 rounded-lg bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center">
                <Icon className="w-4 h-4" />
              </div>
              <span className="text-[13px] font-semibold tracking-tight">{title}</span>
            </div>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">{eyebrow}</span>
            <h3 className="mt-3 text-3xl md:text-4xl lg:text-5xl font-semibold tracking-[-0.03em] leading-[1.05] text-slate-900 text-balance">
              {title}
            </h3>
            <p className="mt-4 text-[15px] md:text-[16px] text-slate-600 leading-[1.6] text-pretty">
              {description}
            </p>

            {/* Stats strip */}
            {stats?.length > 0 && (
              <div className="mt-6 grid grid-cols-3 gap-2 p-3 rounded-xl border border-slate-200 bg-slate-50/60">
                {stats.map((s) => (
                  <div key={s.label} className="text-center">
                    <div className="text-[15px] md:text-[17px] font-semibold text-slate-900 tabular-nums leading-tight">
                      {s.value}
                    </div>
                    <div className="text-[10px] uppercase tracking-[0.1em] text-slate-500 font-medium mt-0.5">
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-7 grid sm:grid-cols-2 gap-5">
              {/* Use Cases — hover swaps the image above */}
              <div>
                <div className="flex items-center gap-1.5 mb-3">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-700">Use cases</span>
                </div>
                <ul className="space-y-1">
                  {useCases.map((u) => {
                    const label = typeof u === 'string' ? u : u.label;
                    const img = typeof u === 'string' ? null : u.img;
                    return (
                      <li
                        key={label}
                        onMouseEnter={() => img && setHoveredImg(img)}
                        onMouseLeave={() => setHoveredImg(null)}
                        className="flex items-start gap-2 text-[13px] text-slate-700 leading-snug px-2 py-1.5 -mx-2 rounded-md hover:bg-primary/5 hover:text-slate-900 transition-colors cursor-default"
                      >
                        <span className="mt-1.5 w-1 h-1 rounded-full bg-slate-400 shrink-0" />
                        {label}
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* Outcomes */}
              <div>
                <div className="flex items-center gap-1.5 mb-3">
                  <Check className="w-3.5 h-3.5 text-primary" />
                  <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-700">Outcomes</span>
                </div>
                <ul className="space-y-2">
                  {outcomes.map((o) => (
                    <li key={o} className="flex items-start gap-2 text-[13px] text-slate-700 leading-snug">
                      <Check className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                      {o}
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