import React from 'react';
import { motion } from 'framer-motion';
import EditorialShell, { ed } from './EditorialShell';

/**
 * Slide 03 · The reality
 * Three short truths every council CEO has felt. Editorial three-column
 * layout, large pull-quote numerals, single-line headlines, supporting
 * editorial body copy. This is the slide where the room goes quiet.
 */
const TRUTHS = [
  {
    n: 'I',
    head: 'The asset register is a fiction.',
    body: 'It exists in spreadsheets that disagree with each other, half-imported into a CMMS no one logs into, and the auditor accepts it because everyone always has.',
  },
  {
    n: 'II',
    head: 'Risk lives in people, not systems.',
    body: 'The depot foreman knows which pump will fail next. When he retires, that knowledge walks out the door. There is no successor model and no institutional memory.',
  },
  {
    n: 'III',
    head: 'Budget season is theatre.',
    body: 'Capital bids are defended on instinct and last year\u2019s allocation, then re-litigated when something breaks. There is no shared model of what would happen if we did less.',
  },
];

export default function Slide03Reality() {
  return (
    <EditorialShell surface="cream" folio="03" section="The Reality">
      <div className="h-full flex flex-col">
        <div className="max-w-3xl mb-12">
          <motion.div {...ed.fadeUp(0.2)} className="text-[11px] tracking-[0.3em] uppercase text-[#0B1020]/55 mb-4">
            Three uncomfortable truths
          </motion.div>
          <motion.h2
            {...ed.fadeUp(0.35)}
            className="font-serif text-5xl leading-[1.05] tracking-tight text-balance"
          >
            What every council, utility, and department <span className="italic">already knows</span>
            <br />
            but cannot say in writing.
          </motion.h2>
        </div>

        <div className="grid grid-cols-3 gap-10 flex-1">
          {TRUTHS.map((t, i) => (
            <motion.div
              key={t.n}
              {...ed.fadeUp(0.6 + i * 0.18)}
              className="flex flex-col border-t border-[#0B1020]/20 pt-6"
            >
              <div className="font-serif italic text-[#3730A3] text-3xl mb-4">{t.n}</div>
              <h3 className="font-serif text-[26px] leading-[1.15] tracking-tight mb-5 text-balance">
                {t.head}
              </h3>
              <p className="text-[14px] leading-[1.65] text-[#0B1020]/70">
                {t.body}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.div
          {...ed.fadeUp(1.3)}
          className="mt-10 font-serif italic text-lg text-[#0B1020]/60 max-w-3xl"
        >
          None of this is a technology problem. It is a{' '}
          <span className="not-italic text-[#0B1020]">decision-making</span> problem,
          which is why software has not solved it yet.
        </motion.div>
      </div>
    </EditorialShell>
  );
}