import React from 'react';
import { motion } from 'framer-motion';
import EditorialShell, { ed } from './EditorialShell';

/**
 * Slide 12 · The ask
 * Stripped-back closing page. One sentence. One date. One name. One action.
 * No bullet lists. No "thank you." Just gravity.
 */
export default function Slide12Ask() {
  return (
    <EditorialShell surface="cream" folio="12" section="The Ask">
      <div className="h-full flex flex-col justify-between">
        <div className="pt-8">
          <motion.div
            {...ed.fadeUp(0.2)}
            className="text-[11px] tracking-[0.3em] uppercase text-[#0B1020]/55"
          >
            The ask
          </motion.div>
        </div>

        <div>
          <motion.h1
            {...ed.fadeUp(0.4)}
            className="font-serif text-[6.5rem] leading-[0.95] tracking-[-0.02em] text-balance max-w-5xl"
          >
            Give us <span className="italic text-[#3730A3]">ninety days</span>
            <br />
            and one council ward.
          </motion.h1>

          <motion.div {...ed.drawLine(0.9)} className="h-px bg-[#0B1020]/30 w-32 my-10" />

          <motion.p
            {...ed.fadeUp(1.0)}
            className="font-serif italic text-2xl text-[#0B1020]/70 max-w-3xl leading-relaxed"
          >
            We will return with a complete, audited asset register, three
            scenarios for next year&rsquo;s capital plan, and the first verified
            entries on your savings ledger — at our cost.
          </motion.p>

          <motion.div
            {...ed.fadeUp(1.3)}
            className="mt-12 grid grid-cols-3 gap-10 max-w-4xl"
          >
            <Block label="Timeline" value="90 days" sub="from kickoff to board paper" />
            <Block label="Scope"    value="One ward" sub="or one facility category" />
            <Block label="Cost"     value="Nil"      sub="for the pilot scope" />
          </motion.div>
        </div>

        <motion.div
          {...ed.fadeIn(1.7)}
          className="flex items-end justify-between pt-12 border-t border-[#0B1020]/20"
        >
          <div>
            <div className="text-[10px] tracking-[0.3em] uppercase text-[#0B1020]/55 mb-2">
              To begin
            </div>
            <div className="font-serif text-2xl">assetstack.io/boardroom</div>
          </div>
          <div className="text-right">
            <div className="text-[10px] tracking-[0.3em] uppercase text-[#0B1020]/55 mb-2">
              Edition signed
            </div>
            <div className="font-serif italic text-[#0B1020]/70">
              AssetStack · Boardroom Edition · 2026
            </div>
          </div>
        </motion.div>
      </div>
    </EditorialShell>
  );
}

function Block({ label, value, sub }) {
  return (
    <div className="border-t border-[#0B1020]/20 pt-4">
      <div className="text-[10px] tracking-[0.3em] uppercase text-[#0B1020]/55 mb-2">
        {label}
      </div>
      <div className="font-serif text-4xl tracking-tight tabular-nums">{value}</div>
      <div className="font-serif italic text-[13px] text-[#0B1020]/60 mt-2">{sub}</div>
    </div>
  );
}