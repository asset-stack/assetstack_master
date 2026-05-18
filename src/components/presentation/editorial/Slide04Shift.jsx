import React from 'react';
import { motion } from 'framer-motion';
import EditorialShell, { ed } from './EditorialShell';

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
    <EditorialShell folio="04" section="The Shift">
      <div className="h-full flex flex-col">
        <div className="max-w-4xl mb-12">
          <motion.div {...ed.fadeUp(0.2)} className="text-[11px] tracking-[0.3em] uppercase text-blue-300/70 mb-4">
            From reactive to predictive
          </motion.div>
          <motion.h2
            {...ed.fadeUp(0.35)}
            className="font-sans font-semibold text-[3.5rem] leading-[1.0] tracking-[-0.03em] text-white text-balance"
            style={{ fontFamily: "'Inter Tight', Inter, sans-serif" }}
          >
            Same buildings. Same budget.{' '}
            <span className="italic font-serif text-white/60">A different way of operating.</span>
          </motion.h2>
        </div>

        <div className="grid grid-cols-2 gap-16 flex-1 relative">
          <motion.div
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ duration: 1.0, ease: ed.ease, delay: 0.5 }}
            style={{
              transformOrigin: 'top',
              background: 'linear-gradient(to bottom, transparent, rgba(59, 130, 246, 0.4), transparent)',
            }}
            className="absolute left-1/2 top-0 bottom-0 w-px"
          />

          <div>
            <motion.div {...ed.fadeUp(0.6)} className="text-[11px] tracking-[0.3em] uppercase text-white/40 mb-3">
              Today
            </motion.div>
            <motion.div
              {...ed.fadeUp(0.7)}
              className="font-sans font-semibold text-[3rem] tracking-tight mb-10 text-white/50"
              style={{ fontFamily: "'Inter Tight', Inter, sans-serif" }}
            >
              Reactive.
            </motion.div>
            <ul className="space-y-5">
              {REACTIVE.map((line, i) => (
                <motion.li
                  key={line}
                  {...ed.fadeUp(0.85 + i * 0.08)}
                  className="flex items-baseline gap-4"
                >
                  <span className="font-sans text-xs tabular-nums text-white/30 w-5">0{i + 1}</span>
                  <span className="text-[20px] text-white/55 leading-snug">{line}</span>
                </motion.li>
              ))}
            </ul>
          </div>

          <div>
            <motion.div {...ed.fadeUp(0.7)} className="text-[11px] tracking-[0.3em] uppercase text-blue-300/80 mb-3">
              With AssetStack
            </motion.div>
            <motion.div
              {...ed.fadeUp(0.8)}
              className="font-sans font-semibold text-[3rem] tracking-tight mb-10"
              style={{
                fontFamily: "'Inter Tight', Inter, sans-serif",
                background: 'linear-gradient(135deg, #60A5FA, #3B82F6, #6366F1)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
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
                  <span className="font-sans text-xs tabular-nums text-blue-300/60 w-5">0{i + 1}</span>
                  <span className="text-[20px] text-white leading-snug">{line}</span>
                </motion.li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </EditorialShell>
  );
}