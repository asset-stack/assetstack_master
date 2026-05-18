import React from 'react';
import { motion } from 'framer-motion';
import EditorialShell, { ed } from './EditorialShell';

/**
 * Slide 11 · Compliance & trust
 * Four pillars of trust: Compliance, Security, Sovereignty, Continuity.
 * Each gets a column with a serif headline and an editorial body line.
 * Below them: a row of certification marks (text-only, no logos).
 */
const COLUMNS = [
  {
    label: 'Compliance',
    head: 'Audit-ready by default.',
    body: 'Every condition rating, every work order, every dollar spent is timestamped, signed, and retrievable in seven seconds.',
  },
  {
    label: 'Security',
    head: 'Built like a bank.',
    body: 'SOC 2 Type II, ISO 27001 in flight, AES-256 at rest, TLS 1.3 in transit, with role-based access tested every quarter.',
  },
  {
    label: 'Sovereignty',
    head: 'Your data, your borders.',
    body: 'Hosted in your region. Exportable on demand. We never train on your data — and we sign that promise in the contract.',
  },
  {
    label: 'Continuity',
    head: 'If we vanish, you continue.',
    body: 'Open-format export of the full register, plan, and ledger at any moment. No lock-in clauses. No proprietary file formats.',
  },
];

const CERTS = ['SOC 2 Type II', 'ISO 27001', 'GDPR', 'CCPA', 'WCAG 2.1 AA', 'AS 55000'];

export default function Slide11Trust() {
  return (
    <EditorialShell surface="ink" folio="11" section="Trust">
      <div className="h-full flex flex-col">
        <div className="max-w-4xl mb-12">
          <motion.div {...ed.fadeUp(0.2)} className="text-[11px] tracking-[0.3em] uppercase text-[#F5F1E8]/55 mb-4">
            Compliance, security, sovereignty, continuity
          </motion.div>
          <motion.h2 {...ed.fadeUp(0.35)} className="font-serif text-[3.25rem] leading-[1.02] tracking-tight text-balance text-[#F5F1E8]">
            Boards do not buy software.
            <br />
            <span className="italic text-[#F5F1E8]/70">They buy trust.</span>
          </motion.h2>
        </div>

        <div className="grid grid-cols-4 gap-10 flex-1">
          {COLUMNS.map((c, i) => (
            <motion.div
              key={c.label}
              {...ed.fadeUp(0.55 + i * 0.12)}
              className="flex flex-col border-t border-[#F5F1E8]/20 pt-5"
            >
              <div className="text-[10px] tracking-[0.3em] uppercase text-[#A5B4FC] mb-4">
                {c.label}
              </div>
              <h3 className="font-serif text-[24px] leading-[1.15] tracking-tight mb-4 text-[#F5F1E8] text-balance">
                {c.head}
              </h3>
              <p className="text-[13px] leading-[1.65] text-[#F5F1E8]/70">
                {c.body}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.div {...ed.drawLine(1.2)} className="h-px bg-[#F5F1E8]/25 mt-12 mb-5" />

        <motion.div {...ed.fadeUp(1.3)} className="flex items-center justify-between flex-wrap gap-6">
          <div className="text-[10px] tracking-[0.3em] uppercase text-[#F5F1E8]/55">
            Certifications & frameworks
          </div>
          <div className="flex items-baseline gap-7 flex-wrap">
            {CERTS.map((cert, i) => (
              <motion.span
                key={cert}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, ease: ed.ease, delay: 1.4 + i * 0.07 }}
                className="font-serif italic text-[#F5F1E8]/85 text-sm"
              >
                {cert}
              </motion.span>
            ))}
          </div>
        </motion.div>
      </div>
    </EditorialShell>
  );
}