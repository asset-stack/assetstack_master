import React from 'react';
import { motion } from 'framer-motion';
import EditorialShell, { ed } from './EditorialShell';

/**
 * Slide 01 · Cover
 * Editorial title page. One declarative line, one supporting line, one date.
 * No logo soup, no gradients, no "AI-powered" buzzwords.
 */
export default function Slide01Cover() {
  return (
    <EditorialShell surface="cream" folio="01" section="Cover">
      <div className="h-full flex flex-col justify-between">
        <div className="pt-8">
          <motion.div {...ed.fadeUp(0.2)} className="font-serif italic text-[#0B1020]/60 text-lg mb-4">
            A position paper, prepared for boards, councils,
            <br />and government infrastructure committees.
          </motion.div>
        </div>

        <div>
          <motion.h1
            {...ed.fadeUp(0.4)}
            className="font-serif text-[7.5rem] leading-[0.92] tracking-[-0.02em] text-balance"
          >
            The case for a
            <br />
            <span className="italic text-[#3730A3]">national asset</span>
            <br />
            operating system.
          </motion.h1>

          <motion.div
            {...ed.drawLine(0.9)}
            className="h-px bg-[#0B1020]/30 w-32 my-10"
          />

          <motion.p
            {...ed.fadeUp(1.0)}
            className="text-[#0B1020]/70 max-w-2xl text-lg leading-relaxed"
          >
            Every council, every department, every public agency runs on assets
            it cannot see, cannot predict, and cannot defend at budget time.
            This is what we built to fix that.
          </motion.p>
        </div>

        <motion.div
          {...ed.fadeIn(1.3)}
          className="flex items-baseline justify-between pt-8 text-[11px] tracking-[0.25em] uppercase text-[#0B1020]/55"
        >
          <span>Volume I · The Boardroom Cut</span>
          <span>Twelve minutes · Twelve slides</span>
        </motion.div>
      </div>
    </EditorialShell>
  );
}