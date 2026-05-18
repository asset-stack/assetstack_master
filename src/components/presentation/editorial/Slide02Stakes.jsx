import React from 'react';
import { motion } from 'framer-motion';
import EditorialShell, { ed } from './EditorialShell';

/**
 * Slide 02 · The stakes
 * One headline number. Editorial treatment. Citation underneath like a
 * Bloomberg cover. The number animates in by digit, not as a counter — we
 * want gravitas, not a slot machine.
 */
const HEADLINE = '1.3T';
const UNIT = 'USD';

export default function Slide02Stakes() {
  return (
    <EditorialShell surface="ink" folio="02" section="The Stakes">
      <div className="h-full grid grid-cols-12 gap-10">
        <div className="col-span-5 flex flex-col justify-between">
          <motion.div {...ed.fadeUp(0.2)} className="text-[11px] tracking-[0.3em] uppercase text-[#F5F1E8]/55">
            Global infrastructure deficit
          </motion.div>

          <div>
            <motion.p
              {...ed.fadeUp(0.4)}
              className="font-serif text-2xl leading-snug text-balance text-[#F5F1E8]/90"
            >
              The world is sitting on{' '}
              <span className="italic">trillions of dollars</span> of public
              assets whose condition, risk, and remaining life are{' '}
              <span className="italic">unknown</span> — until they fail.
            </motion.p>

            <motion.div {...ed.drawLine(0.9)} className="h-px bg-[#F5F1E8]/30 w-24 my-8" />

            <motion.div {...ed.fadeUp(1.0)} className="space-y-3 text-[13px] text-[#F5F1E8]/70 leading-relaxed">
              <p>
                <span className="text-[#F5F1E8]">82%</span> of equipment
                failures are not predictable with current tooling.
              </p>
              <p>
                <span className="text-[#F5F1E8]">$260B</span> in annual
                unplanned downtime across regulated infrastructure.
              </p>
              <p>
                <span className="text-[#F5F1E8]">3.5%</span> of OECD GDP lost
                each year to deferred renewal.
              </p>
            </motion.div>
          </div>

          <motion.div
            {...ed.fadeIn(1.5)}
            className="text-[10px] tracking-[0.25em] uppercase text-[#F5F1E8]/45"
          >
            Sources · OECD 2024 · McKinsey Infrastructure Practice · Deloitte
          </motion.div>
        </div>

        <div className="col-span-7 flex flex-col justify-center items-start">
          <motion.div
            {...ed.fadeUp(0.6)}
            className="text-[11px] tracking-[0.3em] uppercase text-[#F5F1E8]/55 mb-4"
          >
            Global asset value at risk
          </motion.div>

          <div className="flex items-baseline gap-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1.0, ease: ed.ease, delay: 0.8 }}
              className="font-serif text-[18rem] leading-[0.85] tracking-[-0.04em] text-[#F5F1E8]"
            >
              {HEADLINE}
            </motion.div>
            <motion.div
              {...ed.fadeUp(1.1)}
              className="font-serif italic text-3xl text-[#F5F1E8]/60 mb-6"
            >
              {UNIT}
            </motion.div>
          </div>

          <motion.div
            {...ed.fadeUp(1.3)}
            className="font-serif italic text-xl text-[#F5F1E8]/70 mt-2 max-w-md"
          >
            in public assets that boards cannot currently report on with
            confidence.
          </motion.div>
        </div>
      </div>
    </EditorialShell>
  );
}