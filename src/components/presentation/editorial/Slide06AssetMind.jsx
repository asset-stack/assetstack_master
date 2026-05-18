import React from 'react';
import { motion } from 'framer-motion';
import EditorialShell, { ed } from './EditorialShell';

/**
 * Slide 06 · AssetMind — the decision layer
 * Editorial layout: pull-quote left, annotated "transcript" right.
 * The transcript types in line by line — feels like watching a CEO get an
 * answer in real time.
 */
const LINES = [
  { who: 'CEO',       text: 'How much can I defer renewal next year without breaching risk?' },
  { who: 'AssetMind', text: '$4.2M, capped at 18 months. Backlog rises to $12.1M and three Class-A assets cross the high-risk threshold.' },
  { who: 'CEO',       text: 'Which three?' },
  { who: 'AssetMind', text: 'BTH HVAC-North, BTH Lift-2, SWL Roof-East. All have predicted failure inside 24 months at 78–91% confidence.' },
  { who: 'CEO',       text: 'Draft a board paper with the three options ranked by total cost of ownership.' },
  { who: 'AssetMind', text: 'Drafted. Three pages, including the dollar-weighted sensitivity to inflation and a one-page summary for the chair.' },
];

export default function Slide06AssetMind() {
  return (
    <EditorialShell surface="ink" folio="06" section="The Decision Layer">
      <div className="h-full grid grid-cols-12 gap-12">
        <div className="col-span-5 flex flex-col justify-between">
          <div>
            <motion.div {...ed.fadeUp(0.2)} className="text-[11px] tracking-[0.3em] uppercase text-[#F5F1E8]/55 mb-4">
              AssetMind
            </motion.div>
            <motion.h2
              {...ed.fadeUp(0.35)}
              className="font-serif text-[3.5rem] leading-[1.02] tracking-tight text-balance text-[#F5F1E8]"
            >
              A chief of staff
              <br />
              <span className="italic text-[#F5F1E8]/75">for your portfolio.</span>
            </motion.h2>
          </div>

          <div>
            <motion.div {...ed.drawLine(0.8)} className="h-px bg-[#F5F1E8]/30 w-24 mb-6" />
            <motion.p {...ed.fadeUp(0.9)} className="font-serif italic text-xl text-[#F5F1E8]/80 leading-relaxed max-w-md">
              &ldquo;The agenda used to be three weeks of preparation.
              <br />Now it is one prompt.&rdquo;
            </motion.p>
            <motion.p {...ed.fadeUp(1.05)} className="mt-4 text-[12px] tracking-[0.2em] uppercase text-[#F5F1E8]/55">
              — Asset Director, Tier-1 Australian Council
            </motion.p>
          </div>
        </div>

        <div className="col-span-7 flex items-center">
          <div className="w-full bg-[#F5F1E8]/[0.04] border border-[#F5F1E8]/15 rounded-sm p-10">
            <motion.div {...ed.fadeUp(0.5)} className="flex items-center justify-between mb-6 pb-4 border-b border-[#F5F1E8]/15">
              <div className="text-[10px] tracking-[0.3em] uppercase text-[#F5F1E8]/55">
                Board Briefing · Live Session
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] tracking-[0.2em] uppercase text-[#F5F1E8]/55">Recording</span>
              </div>
            </motion.div>

            <div className="space-y-5">
              {LINES.map((line, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.55, ease: ed.ease, delay: 0.8 + i * 0.4 }}
                  className="flex gap-4"
                >
                  <div className={`text-[10px] tracking-[0.25em] uppercase pt-1 shrink-0 w-24 ${
                    line.who === 'AssetMind' ? 'text-[#A5B4FC]' : 'text-[#F5F1E8]/55'
                  }`}>
                    {line.who}
                  </div>
                  <div className={`font-serif text-[17px] leading-[1.45] ${
                    line.who === 'AssetMind' ? 'text-[#F5F1E8]' : 'text-[#F5F1E8]/75 italic'
                  }`}>
                    {line.text}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </EditorialShell>
  );
}