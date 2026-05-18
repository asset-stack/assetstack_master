import React from 'react';
import { motion } from 'framer-motion';
import EditorialShell, { ed } from './EditorialShell';

const TRUTHS = [
  {
    n: '01',
    head: 'The register is fiction.',
    body: 'Most records describe what was specified — not what exists today. Conditions drift, assets disappear, and the books never catch up.',
  },
  {
    n: '02',
    head: 'The plan defends history.',
    body: 'Capital plans rebuild last year plus inflation. They&rsquo;re written from memory of past politics — not visibility into future risk.',
  },
  {
    n: '03',
    head: 'The audit comes too late.',
    body: 'By the time the auditor asks for evidence, the failure has happened, the budget has overrun, and the story is already in the press.',
  },
];

export default function Slide03Reality() {
  return (
    <EditorialShell folio="03" section="Reality">
      <div className="h-full flex flex-col">
        <div className="max-w-4xl mb-14">
          <motion.div {...ed.fadeUp(0.2)} className="text-[11px] tracking-[0.3em] uppercase text-blue-300/70 mb-4">
            Three uncomfortable truths
          </motion.div>
          <motion.h2
            {...ed.fadeUp(0.35)}
            className="font-sans font-semibold text-[3.5rem] leading-[1.0] tracking-[-0.03em] text-white text-balance"
            style={{ fontFamily: "'Inter Tight', Inter, sans-serif" }}
          >
            Three reasons the books{' '}
            <span className="italic font-serif text-white/60">no longer match the buildings.</span>
          </motion.h2>
        </div>

        <div className="grid grid-cols-3 gap-10 flex-1">
          {TRUTHS.map((t, i) => (
            <motion.div
              key={t.n}
              {...ed.fadeUp(0.55 + i * 0.15)}
              className="flex flex-col relative pt-6"
            >
              <div
                className="absolute top-0 left-0 right-0 h-px"
                style={{
                  background: 'linear-gradient(to right, rgba(59, 130, 246, 0.5), rgba(99, 102, 241, 0.2), transparent)',
                }}
              />
              <div
                className="font-sans font-semibold text-7xl tabular-nums mb-5"
                style={{
                  fontFamily: "'Inter Tight', Inter, sans-serif",
                  background: 'linear-gradient(135deg, #3B82F6, #6366F1)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                {t.n}
              </div>
              <h3
                className="font-sans font-semibold text-[28px] leading-[1.1] tracking-tight mb-4 text-white text-balance"
                style={{ fontFamily: "'Inter Tight', Inter, sans-serif" }}
              >
                {t.head}
              </h3>
              <p className="text-[14px] leading-[1.65] text-white/60">{t.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </EditorialShell>
  );
}