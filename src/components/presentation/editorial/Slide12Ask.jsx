import React from 'react';
import { motion } from 'framer-motion';
import EditorialShell, { ed } from './EditorialShell';

export default function Slide12Ask() {
  return (
    <EditorialShell folio="12" section="The Ask">
      <div className="h-full flex flex-col justify-between">
        <motion.div {...ed.fadeUp(0.2)} className="pt-2 text-[11px] tracking-[0.3em] uppercase text-blue-300/70">
          The ask
        </motion.div>

        <div>
          <motion.h1
            {...ed.fadeUp(0.4)}
            className="font-sans font-semibold text-[7rem] leading-[0.92] tracking-[-0.045em] text-balance max-w-5xl text-white"
            style={{ fontFamily: "'Inter Tight', Inter, sans-serif" }}
          >
            Give us{' '}
            <span
              className="italic font-serif"
              style={{
                background: 'linear-gradient(135deg, #60A5FA 0%, #3B82F6 50%, #6366F1 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              ninety days
            </span>
            <br />
            and one site.
          </motion.h1>

          <motion.div
            {...ed.drawLine(0.9)}
            className="h-px w-32 my-10"
            style={{ background: 'linear-gradient(to right, #3B82F6, transparent)' }}
          />

          <motion.p
            {...ed.fadeUp(1.0)}
            className="italic font-serif text-2xl text-white/65 max-w-3xl leading-relaxed"
          >
            We&rsquo;ll return with a fully audited asset register, three
            costed scenarios for next year&rsquo;s capital plan, and the first
            verified entries on your savings ledger. At our cost.
          </motion.p>

          <motion.div
            {...ed.fadeUp(1.3)}
            className="mt-12 grid grid-cols-3 gap-10 max-w-4xl"
          >
            <Block label="Timeline" value="90 days" sub="from kickoff to board paper" />
            <Block label="Scope"    value="One site" sub="or one asset class" />
            <Block label="Cost"     value="Nil"      sub="for the pilot scope" />
          </motion.div>
        </div>

        <motion.div
          {...ed.fadeIn(1.7)}
          className="flex items-end justify-between pt-10 border-t border-white/10"
        >
          <div>
            <div className="text-[10px] tracking-[0.3em] uppercase text-white/45 mb-2">To begin</div>
            <div
              className="font-sans font-semibold text-2xl text-white"
              style={{ fontFamily: "'Inter Tight', Inter, sans-serif" }}
            >
              assetstack.io/boardroom
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] tracking-[0.3em] uppercase text-white/45 mb-2">Edition signed</div>
            <div className="italic font-serif text-white/65">AssetStack · Boardroom Edition · 2026</div>
          </div>
        </motion.div>
      </div>
    </EditorialShell>
  );
}

function Block({ label, value, sub }) {
  return (
    <div className="relative pt-4">
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(to right, rgba(59, 130, 246, 0.5), transparent)' }}
      />
      <div className="text-[10px] tracking-[0.3em] uppercase text-white/45 mb-2">{label}</div>
      <div
        className="font-sans font-semibold text-4xl tracking-[-0.03em] tabular-nums text-white"
        style={{ fontFamily: "'Inter Tight', Inter, sans-serif" }}
      >
        {value}
      </div>
      <div className="italic font-serif text-[13px] text-white/55 mt-2">{sub}</div>
    </div>
  );
}