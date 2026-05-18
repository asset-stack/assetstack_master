import React from 'react';
import { motion } from 'framer-motion';
import EditorialShell, { ed } from './EditorialShell';

export default function Slide02Stakes() {
  return (
    <EditorialShell folio="02" section="The Stakes">
      <div className="h-full grid grid-cols-12 gap-10">
        <div className="col-span-5 flex flex-col justify-center">
          <motion.div {...ed.fadeUp(0.2)} className="text-[11px] tracking-[0.3em] uppercase text-violet-300/70 mb-5">
            The stakes
          </motion.div>
          <motion.h2
            {...ed.fadeUp(0.35)}
            className="font-sans font-semibold text-[3.5rem] leading-[1.0] tracking-[-0.03em] text-white text-balance"
            style={{ fontFamily: "'Inter Tight', Inter, sans-serif" }}
          >
            Boards cannot defend{' '}
            <span className="italic font-serif text-white/60">what they cannot see.</span>
          </motion.h2>
          <motion.p {...ed.fadeUp(0.55)} className="mt-7 text-[16px] text-white/60 leading-relaxed max-w-md">
            Public-asset registers are stale on the day they are signed off.
            Renewal plans are guesses. Compliance is a binder in a basement.
            Every year, the gap between the books and the buildings grows wider.
          </motion.p>
        </div>

        <div className="col-span-7 flex flex-col justify-center items-end">
          <motion.div {...ed.fadeUp(0.5)} className="text-[10px] tracking-[0.35em] uppercase text-white/40 mb-4 self-end">
            Public assets at risk · global
          </motion.div>
          <motion.div
            {...ed.scaleIn(0.65)}
            className="font-sans font-semibold text-[16rem] leading-[0.85] tracking-[-0.06em] self-end"
            style={{
              fontFamily: "'Inter Tight', Inter, sans-serif",
              background: 'linear-gradient(135deg, #FFFFFF 0%, #C084FC 60%, #6366F1 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            $1.3T
          </motion.div>
          <motion.p {...ed.fadeUp(1.0)} className="text-[16px] text-white/70 max-w-md text-right mt-4 leading-relaxed">
            in public assets that boards cannot currently report on with confidence.
          </motion.p>

          <motion.div {...ed.fadeUp(1.2)} className="mt-10 grid grid-cols-3 gap-8 w-full">
            {[
              { v: '74%', l: 'Of registers untouched in 12+ months' },
              { v: '$3.40', l: 'Reactive cost per $1 of prevention' },
              { v: '11 yrs', l: 'Average asset data half-life' },
            ].map((s) => (
              <div key={s.v} className="border-t border-white/15 pt-3">
                <div className="font-sans font-semibold text-2xl tabular-nums text-white">{s.v}</div>
                <div className="text-[11px] tracking-[0.15em] uppercase text-white/45 mt-1.5 leading-tight">{s.l}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </EditorialShell>
  );
}