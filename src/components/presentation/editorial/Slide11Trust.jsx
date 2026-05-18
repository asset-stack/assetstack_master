import React from 'react';
import { motion } from 'framer-motion';
import EditorialShell, { ed } from './EditorialShell';

const COLUMNS = [
  {
    label: 'Compliance',
    head: 'Audit-ready by default.',
    body: 'Every condition rating, work order, and dollar spent is timestamped, signed, and retrievable in seven seconds.',
  },
  {
    label: 'Security',
    head: 'Built like a bank.',
    body: 'SOC 2 Type II, ISO 27001 in flight, AES-256 at rest, TLS 1.3 in transit, role-based access tested every quarter.',
  },
  {
    label: 'Sovereignty',
    head: 'Your data, your borders.',
    body: 'Hosted in your region. Exportable on demand. We never train on your data — and we sign that promise in the contract.',
  },
  {
    label: 'Continuity',
    head: 'If we vanish, you continue.',
    body: 'Open-format export of the full register, plan, and ledger at any moment. No lock-in. No proprietary file formats.',
  },
];

const CERTS = ['SOC 2 Type II', 'ISO 27001', 'GDPR', 'CCPA', 'WCAG 2.1 AA', 'AS 55000'];

export default function Slide11Trust() {
  return (
    <EditorialShell folio="11" section="Trust">
      <div className="h-full flex flex-col">
        <div className="max-w-4xl mb-12">
          <motion.div {...ed.fadeUp(0.2)} className="text-[11px] tracking-[0.3em] uppercase text-blue-300/70 mb-4">
            Compliance, security, sovereignty, continuity
          </motion.div>
          <motion.h2
            {...ed.fadeUp(0.35)}
            className="font-sans font-semibold text-[3.25rem] leading-[1.0] tracking-[-0.03em] text-balance text-white"
            style={{ fontFamily: "'Inter Tight', Inter, sans-serif" }}
          >
            Boards don&rsquo;t buy software.{' '}
            <span className="italic font-serif text-white/60">They buy trust.</span>
          </motion.h2>
        </div>

        <div className="grid grid-cols-4 gap-8 flex-1">
          {COLUMNS.map((c, i) => (
            <motion.div
              key={c.label}
              {...ed.fadeUp(0.55 + i * 0.12)}
              className="flex flex-col relative pt-5"
            >
              <div
                className="absolute top-0 left-0 right-0 h-px"
                style={{ background: 'linear-gradient(to right, rgba(59, 130, 246, 0.5), rgba(99, 102, 241, 0.1))' }}
              />
              <div className="text-[10px] tracking-[0.3em] uppercase text-blue-300 mb-4">{c.label}</div>
              <h3
                className="font-sans font-semibold text-[22px] leading-[1.2] tracking-tight mb-4 text-white text-balance"
                style={{ fontFamily: "'Inter Tight', Inter, sans-serif" }}
              >
                {c.head}
              </h3>
              <p className="text-[13px] leading-[1.65] text-white/55">{c.body}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          {...ed.drawLine(1.2)}
          className="h-px mt-10 mb-5"
          style={{ background: 'linear-gradient(to right, rgba(59, 130, 246, 0.4), rgba(99, 102, 241, 0.2), transparent)' }}
        />

        <motion.div {...ed.fadeUp(1.3)} className="flex items-center justify-between flex-wrap gap-6">
          <div className="text-[10px] tracking-[0.3em] uppercase text-white/45">
            Certifications & frameworks
          </div>
          <div className="flex items-baseline gap-7 flex-wrap">
            {CERTS.map((cert, i) => (
              <motion.span
                key={cert}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, ease: ed.ease, delay: 1.4 + i * 0.07 }}
                className="font-sans font-medium text-white/85 text-sm"
                style={{ fontFamily: "'Inter Tight', Inter, sans-serif" }}
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