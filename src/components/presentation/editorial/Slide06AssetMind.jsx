import React from 'react';
import { motion } from 'framer-motion';
import EditorialShell, { ed } from './EditorialShell';

const LINES = [
  { who: 'CEO',       text: 'How much can I defer renewal next year without breaching risk?' },
  { who: 'AssetMind', text: '$4.2M, capped at 18 months. Backlog rises to $12.1M and three Class-A assets cross the high-risk threshold.' },
  { who: 'CEO',       text: 'Which three?' },
  { who: 'AssetMind', text: 'BTH HVAC-North, BTH Lift-2, SWL Roof-East. Predicted failure inside 24 months at 78–91% confidence.' },
  { who: 'CEO',       text: 'Draft a board paper with three options ranked by total cost of ownership.' },
  { who: 'AssetMind', text: 'Drafted. Three pages, dollar-weighted sensitivity to inflation, one-page chair summary.' },
];

export default function Slide06AssetMind() {
  return (
    <EditorialShell folio="06" section="The Decision Layer">
      <div className="h-full grid grid-cols-12 gap-12">
        <div className="col-span-5 flex flex-col justify-between">
          <div>
            <motion.div {...ed.fadeUp(0.2)} className="text-[11px] tracking-[0.3em] uppercase text-violet-300/70 mb-4">
              AssetMind
            </motion.div>
            <motion.h2
              {...ed.fadeUp(0.35)}
              className="font-sans font-semibold text-[3.5rem] leading-[1.0] tracking-[-0.03em] text-balance text-white"
              style={{ fontFamily: "'Inter Tight', Inter, sans-serif" }}
            >
              A chief of staff{' '}
              <span className="italic font-serif text-white/60">for your portfolio.</span>
            </motion.h2>
          </div>

          <div>
            <motion.div
              {...ed.drawLine(0.8)}
              className="h-px w-24 mb-6"
              style={{ background: 'linear-gradient(to right, #A855F7, transparent)' }}
            />
            <motion.p {...ed.fadeUp(0.9)} className="italic font-serif text-xl text-white/75 leading-relaxed max-w-md">
              &ldquo;The board pack used to take three weeks.
              <br />
              Now it is one prompt.&rdquo;
            </motion.p>
            <motion.p {...ed.fadeUp(1.05)} className="mt-4 text-[11px] tracking-[0.2em] uppercase text-white/45">
              — Asset Director, Tier-1 Australian Council
            </motion.p>
          </div>
        </div>

        <div className="col-span-7 flex items-center">
          <motion.div
            {...ed.scaleIn(0.5)}
            className="w-full rounded-2xl p-10 relative"
            style={{
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08), rgba(168, 85, 247, 0.04))',
              border: '1px solid rgba(168, 85, 247, 0.2)',
              boxShadow: '0 0 60px rgba(168, 85, 247, 0.15)',
            }}
          >
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
              <div className="text-[10px] tracking-[0.3em] uppercase text-white/50">
                Board Briefing · Live Session
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] tracking-[0.2em] uppercase text-white/50">Recording</span>
              </div>
            </div>

            <div className="space-y-5">
              {LINES.map((line, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.55, ease: ed.ease, delay: 0.8 + i * 0.35 }}
                  className="flex gap-4"
                >
                  <div
                    className={`text-[10px] tracking-[0.25em] uppercase pt-1 shrink-0 w-24 font-medium ${
                      line.who === 'AssetMind' ? 'text-violet-300' : 'text-white/45'
                    }`}
                  >
                    {line.who}
                  </div>
                  <div
                    className={`text-[16px] leading-[1.5] ${
                      line.who === 'AssetMind' ? 'text-white' : 'text-white/60 italic'
                    }`}
                  >
                    {line.text}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </EditorialShell>
  );
}