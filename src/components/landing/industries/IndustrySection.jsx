import React from 'react';
import { motion } from 'framer-motion';
import { Check, Sparkles } from 'lucide-react';

/**
 * Editorial industry section — alternates image left/right.
 * Pure presentation — no data fetching, no business logic.
 */
export default function IndustrySection({
  index,
  eyebrow,
  title,
  description,
  useCases,
  outcomes,
  image,
  icon: Icon,
}) {
  const reverse = index % 2 === 1;

  return (
    <section className="py-16 md:py-24 border-b border-slate-100 bg-white">
      <div className="max-w-[1280px] mx-auto px-5 md:px-8">
        <div className={`grid lg:grid-cols-2 gap-10 lg:gap-16 items-center ${reverse ? 'lg:[&>*:first-child]:order-2' : ''}`}>
          {/* Visual */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6 }}
            className="relative rounded-2xl overflow-hidden border border-slate-200 elevation-2 aspect-[5/4]"
          >
            <img
              src={image}
              alt={title}
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-slate-900/10 to-transparent" />
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

            <div className="mt-7 grid sm:grid-cols-2 gap-5">
              {/* Use Cases */}
              <div>
                <div className="flex items-center gap-1.5 mb-3">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-700">Use cases</span>
                </div>
                <ul className="space-y-2">
                  {useCases.map((u) => (
                    <li key={u} className="flex items-start gap-2 text-[13px] text-slate-700 leading-snug">
                      <span className="mt-1.5 w-1 h-1 rounded-full bg-slate-400 shrink-0" />
                      {u}
                    </li>
                  ))}
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