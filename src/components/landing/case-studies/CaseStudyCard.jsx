import React from 'react';
import { motion } from 'framer-motion';
import { Quote, MapPin, ArrowRight, CheckCircle2 } from 'lucide-react';

/**
 * A long-form, editorial case-study block.
 *
 * Props (all required unless noted):
 *  - id: anchor id
 *  - eyebrow: { tag, location } e.g. { tag: 'Local Government', location: 'Western Australia' }
 *  - org: organisation display name
 *  - title: editorial headline (string, allows <em>...</em> for italics)
 *  - heroImage: image url
 *  - badges: string[] (3 short outcome badges shown under the title)
 *  - overview: long paragraph(s) — string
 *  - challenges: string[] (bullet list)
 *  - solution: { intro, capabilities[] }
 *  - implementation: string[] (numbered list)
 *  - outcomes: string[] (bullet list)
 *  - metrics: { value, label }[]
 *  - quote: { text, attribution }
 *  - reverse?: boolean — flip layout
 */
export default function CaseStudyCard({
  id, eyebrow, org, title, heroImage, badges, overview, challenges,
  solution, implementation, outcomes, metrics, quote, reverse = false,
}) {
  return (
    <section id={id} className="py-20 md:py-28 border-t border-slate-100">
      <div className="max-w-[1280px] mx-auto px-5 md:px-8">
        {/* Header row — image + intro */}
        <div className={`grid lg:grid-cols-2 gap-10 lg:gap-14 items-center ${reverse ? 'lg:[&>*:first-child]:order-2' : ''}`}>
          {/* Image card */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            className="relative"
          >
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-slate-200 elevation-2 bg-slate-100">
              <img src={heroImage} alt={org} className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent" />
              <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">
                Case study
              </div>
            </div>
          </motion.div>

          {/* Intro */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
          >
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
              <span>{eyebrow.tag}</span>
              <span className="text-slate-300">·</span>
              <span className="inline-flex items-center gap-1 text-slate-500"><MapPin className="w-3 h-3" /> {eyebrow.location}</span>
            </div>
            <h2
              className="mt-3 text-3xl md:text-5xl font-semibold tracking-[-0.03em] leading-[1.05] text-slate-900 text-balance"
              dangerouslySetInnerHTML={{ __html: title }}
            />
            <div className="mt-5 text-[13px] font-semibold text-slate-700">{org}</div>
            <div className="mt-3 flex flex-wrap gap-2">
              {badges.map((b) => (
                <span key={b} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/[0.06] border border-primary/15 text-[11px] font-semibold text-primary">
                  <CheckCircle2 className="w-3 h-3" /> {b}
                </span>
              ))}
            </div>
            <p className="mt-6 text-[15px] text-slate-600 leading-[1.65]">{overview}</p>
          </motion.div>
        </div>

        {/* Metrics strip */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 md:mt-16 grid grid-cols-2 md:grid-cols-4 gap-3"
        >
          {metrics.map((m, i) => (
            <div key={m.label} className="rounded-2xl border border-slate-200 bg-white p-5 hover-lift hover:border-primary/25 elevation-1">
              <div className="text-3xl md:text-4xl font-semibold tabular-nums text-slate-900 tracking-[-0.02em]">{m.value}</div>
              <div className="mt-1.5 text-[11px] uppercase tracking-[0.14em] text-slate-500">{m.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Challenge + Solution + Implementation grid */}
        <div className="mt-14 grid lg:grid-cols-3 gap-6">
          {/* Challenge */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl border border-slate-200 p-7 bg-white"
          >
            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">The challenge</div>
            <h3 className="mt-2 text-xl font-semibold text-slate-900 tracking-tight">Fragmented, reactive, hard to defend.</h3>
            <ul className="mt-5 space-y-2.5">
              {challenges.map((c) => (
                <li key={c} className="flex items-start gap-2 text-[13px] text-slate-600 leading-relaxed">
                  <span className="mt-2 w-1 h-1 rounded-full bg-slate-400 shrink-0" />
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Solution */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.05 }}
            className="rounded-2xl border border-primary/20 p-7 bg-primary/[0.03]"
          >
            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">The solution</div>
            <h3 className="mt-2 text-xl font-semibold text-slate-900 tracking-tight">One platform. Every asset.</h3>
            <p className="mt-3 text-[13px] text-slate-600 leading-relaxed">{solution.intro}</p>
            <ul className="mt-5 space-y-2.5">
              {solution.capabilities.map((c) => (
                <li key={c} className="flex items-start gap-2 text-[13px] text-slate-700 leading-relaxed">
                  <CheckCircle2 className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Implementation */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl border border-slate-200 p-7 bg-white"
          >
            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">Implementation</div>
            <h3 className="mt-2 text-xl font-semibold text-slate-900 tracking-tight">Phased. Low-disruption.</h3>
            <ol className="mt-5 space-y-3">
              {implementation.map((step, i) => (
                <li key={step} className="flex items-start gap-3 text-[13px] text-slate-700 leading-relaxed">
                  <span className="w-5 h-5 rounded-md bg-slate-900 text-white text-[10px] font-semibold inline-flex items-center justify-center shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </motion.div>
        </div>

        {/* Outcomes + Quote */}
        <div className="mt-10 grid lg:grid-cols-[1.2fr_1fr] gap-6">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl border border-slate-200 bg-white p-7"
          >
            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-600">Outcomes</div>
            <h3 className="mt-2 text-xl font-semibold text-slate-900 tracking-tight">What changed, in their words.</h3>
            <ul className="mt-5 grid sm:grid-cols-2 gap-x-6 gap-y-2.5">
              {outcomes.map((o) => (
                <li key={o} className="flex items-start gap-2 text-[13px] text-slate-700 leading-relaxed">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                  <span>{o}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative rounded-2xl bg-slate-900 text-white p-7 overflow-hidden"
          >
            <div aria-hidden className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-primary/30 blur-3xl" />
            <Quote className="w-5 h-5 text-primary/80 mb-4" />
            <p className="text-[16px] font-serif italic leading-snug text-slate-100 relative">
              "{quote.text}"
            </p>
            <div className="mt-5 pt-5 border-t border-white/10 text-[12px] text-slate-400">
              {quote.attribution}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}