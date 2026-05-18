import React from 'react';
import { motion } from 'framer-motion';
import EditorialShell, { ed } from './EditorialShell';

/**
 * Slide 04 · The shift
 * Editorial diptych: REACTIVE | PREDICTIVE.
 * Two columns, equal weight, hairline rule down the middle. Each side has a
 * declarative subhead and a short ordered list. No icons. No badges.
 */
const REACTIVE = [
  'Failure is the trigger.',
  'Knowledge lives in heads.',
  'Budget defends history.',
  'Compliance is a binder.',
  'Reports describe the past.',
];

const PREDICTIVE = [
  'Risk is the trigger.',
  'Knowledge lives in the model.',
  'Budget defends outcomes.',
  'Compliance is continuous.',
  'Reports describe the next year.',
];

export default function Slide04Shift() {
  return (
    <EditorialShell surface="cream" folio="04" section="The Shift">
      <div className="h-full flex flex-col">
        <div className="max-w-4xl mb-14">
          <motion.div {...ed.fadeUp(0.2)} className="text-[11px] tracking-[0.3em] uppercase text-[#0B1020]/55 mb-4">
            From reactive to predictive
          </motion.div>
          <motion.h2
            {...ed.fadeUp(0.35)}
            className="font-serif text-[3.5rem] leading-[1.02] tracking-tight text-balance"
          >
            The same buildings, the same budget,
            <br />
            <span className="italic">a different operating mode.</span>
          </motion.h2>
        </div>

        <div className="grid grid-cols-2 gap-20 flex-1 relative">
          <motion.div
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ duration: 1.0, ease: ed.ease, delay: 0.5 }}
            style={{ transformOrigin: 'top' }}
            className="absolute left-1/2 top-0 bottom-0 w-px bg-[#0B1020]/20"
          />

          <div>
            <motion.div
              {...ed.fadeUp(0.6)}
              className="font-serif italic text-[#0B1020]/50 text-2xl mb-2"
            >
              Today
            </motion.div>
            <motion.div
              {...ed.fadeUp(0.7)}
              className="font-serif text-4xl tracking-tight mb-10"
            >
              Reactive.
            </motion.div>
            <ul className="space-y-5">
              {REACTIVE.map((line, i) => (
                <motion.li
                  key={line}
                  {...ed.fadeUp(0.85 + i * 0.08)}
                  className="flex items-baseline gap-4 text-[#0B1020]/65"
                >
                  <span className="font-serif italic text-[#0B1020]/35 text-sm tabular-nums">
                    0{i + 1}
                  </span>
                  <span className="text-[20px] font-serif leading-snug">{line}</span>
                </motion.li>
              ))}
            </ul>
          </div>

          <div>
            <motion.div
              {...ed.fadeUp(0.7)}
              className="font-serif italic text-[#3730A3]/70 text-2xl mb-2"
            >
              With AssetStack
            </motion.div>
            <motion.div
              {...ed.fadeUp(0.8)}
              className="font-serif text-4xl tracking-tight mb-10 text-[#3730A3]"
            >
              Predictive.
            </motion.div>
            <ul className="space-y-5">
              {PREDICTIVE.map((line, i) => (
                <motion.li
                  key={line}
                  {...ed.fadeUp(1.0 + i * 0.08)}
                  className="flex items-baseline gap-4"
                >
                  <span className="font-serif italic text-[#3730A3]/60 text-sm tabular-nums">
                    0{i + 1}
                  </span>
                  <span className="text-[20px] font-serif leading-snug text-[#0B1020]">{line}</span>
                </motion.li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </EditorialShell>
  );
}