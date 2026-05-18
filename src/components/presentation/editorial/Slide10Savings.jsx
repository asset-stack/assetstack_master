import React from 'react';
import { motion } from 'framer-motion';
import EditorialShell, { ed } from './EditorialShell';

const ENTRIES = [
  { id: 'SAV-0181', asset: 'BTH HVAC-North',  trigger: 'AI prediction',  predicted: 142000, actual: 18400, saved: 123600, verified: 'Sensor' },
  { id: 'SAV-0179', asset: 'SWL Lift-2',      trigger: 'Scan anomaly',   predicted: 96000,  actual: 12200, saved: 83800,  verified: 'Inspection' },
  { id: 'SAV-0174', asset: 'Pump-House 4',    trigger: 'Sensor alert',   predicted: 88000,  actual: 9700,  saved: 78300,  verified: 'Sensor' },
  { id: 'SAV-0168', asset: 'Roof-East, SWL',  trigger: 'AI prediction',  predicted: 64000,  actual: 14100, saved: 49900,  verified: 'Inspection' },
  { id: 'SAV-0162', asset: 'Switchgear B-2',  trigger: 'AI prediction',  predicted: 210000, actual: 23800, saved: 186200, verified: 'Sensor' },
];

const fmt = (n) => '$' + (n / 1000).toFixed(0) + 'k';

export default function Slide10Savings() {
  const totalSaved = ENTRIES.reduce((s, e) => s + e.saved, 0);

  return (
    <EditorialShell folio="10" section="Verified Savings">
      <div className="h-full flex flex-col">
        <div className="grid grid-cols-12 gap-10 mb-10">
          <div className="col-span-7">
            <motion.div {...ed.fadeUp(0.2)} className="text-[11px] tracking-[0.3em] uppercase text-violet-300/70 mb-4">
              The savings ledger
            </motion.div>
            <motion.h2
              {...ed.fadeUp(0.35)}
              className="font-sans font-semibold text-[3.25rem] leading-[1.0] tracking-[-0.03em] text-balance text-white"
              style={{ fontFamily: "'Inter Tight', Inter, sans-serif" }}
            >
              Every dollar saved,{' '}
              <span className="italic font-serif text-white/60">on the public record.</span>
            </motion.h2>
            <motion.p {...ed.fadeUp(0.5)} className="mt-5 text-white/60 text-[15px] leading-relaxed max-w-xl">
              An immutable ledger of every prevented failure: what we predicted,
              what we spent, what we saved, and how each entry was verified.
              Auditors love this. Boards love it more.
            </motion.p>
          </div>
          <div className="col-span-5 flex flex-col items-end justify-end">
            <motion.div {...ed.fadeUp(0.6)} className="text-[11px] tracking-[0.3em] uppercase text-white/45 mb-2">
              Total verified savings, YTD
            </motion.div>
            <motion.div
              {...ed.fadeUp(0.75)}
              className="font-sans font-semibold text-[6rem] leading-none tabular-nums tracking-[-0.04em]"
              style={{
                fontFamily: "'Inter Tight', Inter, sans-serif",
                background: 'linear-gradient(135deg, #FFFFFF 0%, #C084FC 60%, #6366F1 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {fmt(totalSaved)}
            </motion.div>
            <motion.div {...ed.fadeUp(0.9)} className="italic font-serif text-white/45 text-sm mt-2">
              across {ENTRIES.length} interventions, signed off by 3 verifiers
            </motion.div>
          </div>
        </div>

        <motion.div
          {...ed.drawLine(0.9)}
          className="h-px mb-3"
          style={{ background: 'linear-gradient(to right, rgba(168, 85, 247, 0.5), rgba(99, 102, 241, 0.2), transparent)' }}
        />

        <div className="flex-1 flex flex-col">
          <div className="grid grid-cols-12 gap-4 text-[10px] tracking-[0.25em] uppercase text-white/45 pb-3 border-b border-white/10">
            <div className="col-span-2">Entry</div>
            <div className="col-span-3">Asset</div>
            <div className="col-span-2">Trigger</div>
            <div className="col-span-2 text-right">Predicted cost</div>
            <div className="col-span-1 text-right">Actual</div>
            <div className="col-span-1 text-right">Saved</div>
            <div className="col-span-1 text-right">Method</div>
          </div>

          {ENTRIES.map((e, i) => (
            <motion.div
              key={e.id}
              {...ed.fadeUp(1.0 + i * 0.08)}
              className="grid grid-cols-12 gap-4 py-4 border-b border-white/5 items-baseline"
            >
              <div className="col-span-2 italic font-serif text-white/55 text-sm tabular-nums">{e.id}</div>
              <div className="col-span-3 font-sans font-medium text-base text-white" style={{ fontFamily: "'Inter Tight', Inter, sans-serif" }}>{e.asset}</div>
              <div className="col-span-2 text-[13px] text-white/60">{e.trigger}</div>
              <div className="col-span-2 text-right tabular-nums text-[13px] text-white/55">{fmt(e.predicted)}</div>
              <div className="col-span-1 text-right tabular-nums text-[13px] text-white/55">{fmt(e.actual)}</div>
              <div
                className="col-span-1 text-right tabular-nums font-sans font-semibold text-base"
                style={{
                  fontFamily: "'Inter Tight', Inter, sans-serif",
                  background: 'linear-gradient(135deg, #C084FC, #818CF8)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {fmt(e.saved)}
              </div>
              <div className="col-span-1 text-right text-[11px] tracking-[0.15em] uppercase text-white/45">{e.verified}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </EditorialShell>
  );
}