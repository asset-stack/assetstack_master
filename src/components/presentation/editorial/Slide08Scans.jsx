import React from 'react';
import { motion } from 'framer-motion';
import EditorialShell, { ed } from './EditorialShell';

const STAGES = [
  {
    n: 'I',
    label: 'Scan',
    title: 'A drone, a phone, a LiDAR rig.',
    body: 'Capture the asset as it actually is. No clipboards. Just evidence.',
    metric: '12 min',
    metricLabel: 'Per building',
  },
  {
    n: 'II',
    label: 'Detect',
    title: 'The model finds what humans miss.',
    body: 'Cracks, corrosion, displacement — tagged with confidence and severity.',
    metric: '94%',
    metricLabel: 'Detection accuracy',
  },
  {
    n: 'III',
    label: 'Resolve',
    title: 'Findings become work orders.',
    body: 'Routed to the right crew with the right parts at the right priority.',
    metric: '0',
    metricLabel: 'Manual transcription',
  },
];

export default function Slide08Scans() {
  return (
    <EditorialShell folio="08" section="The Closed Loop">
      <div className="h-full flex flex-col">
        <div className="max-w-4xl mb-12">
          <motion.div {...ed.fadeUp(0.2)} className="text-[11px] tracking-[0.3em] uppercase text-blue-300/70 mb-4">
            Scans → defects → work orders
          </motion.div>
          <motion.h2
            {...ed.fadeUp(0.35)}
            className="font-sans font-semibold text-[3.25rem] leading-[1.0] tracking-[-0.03em] text-balance text-white"
            style={{ fontFamily: "'Inter Tight', Inter, sans-serif" }}
          >
            The inspection becomes{' '}
            <span className="italic font-serif text-white/60">the work order itself.</span>
          </motion.h2>
        </div>

        <div className="grid grid-cols-3 gap-8 flex-1 relative">
          <motion.div
            {...ed.drawLine(1.4)}
            className="absolute left-0 right-0 top-[36px] h-px"
            style={{ background: 'linear-gradient(to right, transparent, rgba(59, 130, 246, 0.4), rgba(99, 102, 241, 0.4), transparent)' }}
          />

          {STAGES.map((s, i) => (
            <motion.div
              key={s.n}
              {...ed.fadeUp(0.5 + i * 0.2)}
              className="flex flex-col relative"
            >
              <div className="flex items-center gap-3 mb-10">
                <div
                  className="w-[20px] h-[20px] rounded-full z-10"
                  style={{
                    background: 'radial-gradient(circle, #3B82F6, #6366F1)',
                    boxShadow: '0 0 20px rgba(59, 130, 246, 0.6)',
                  }}
                />
                <span
                  className="font-sans font-semibold text-2xl"
                  style={{
                    background: 'linear-gradient(135deg, #3B82F6, #6366F1)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  {s.n}
                </span>
                <span className="text-[11px] tracking-[0.3em] uppercase text-white/45">{s.label}</span>
              </div>

              <motion.div
                {...ed.fadeIn(0.7 + i * 0.2)}
                className="aspect-[4/3] rounded-xl relative overflow-hidden mb-6"
                style={{
                  background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08), rgba(59, 130, 246, 0.04))',
                  border: '1px solid rgba(59, 130, 246, 0.2)',
                }}
              >
                {i === 0 && <ScanPlate />}
                {i === 1 && <DetectPlate />}
                {i === 2 && <ResolvePlate />}
              </motion.div>

              <h3
                className="font-sans font-semibold text-[22px] leading-[1.15] tracking-tight mb-3 text-white text-balance"
                style={{ fontFamily: "'Inter Tight', Inter, sans-serif" }}
              >
                {s.title}
              </h3>
              <p className="text-[13px] leading-[1.65] text-white/55 mb-5">{s.body}</p>
              <div className="mt-auto pt-4 border-t border-white/10">
                <div
                  className="font-sans font-semibold text-3xl tabular-nums tracking-tight"
                  style={{
                    fontFamily: "'Inter Tight', Inter, sans-serif",
                    background: 'linear-gradient(135deg, #FFFFFF, #60A5FA)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  {s.metric}
                </div>
                <div className="text-[10px] tracking-[0.25em] uppercase text-white/45 mt-1">{s.metricLabel}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </EditorialShell>
  );
}

function ScanPlate() {
  return (
    <svg viewBox="0 0 200 150" className="w-full h-full">
      {Array.from({ length: 6 }).map((_, i) => (
        <line key={i} x1={20 + i * 30} y1="20" x2={20 + i * 30} y2="130" stroke="#3B82F6" strokeOpacity="0.2" strokeWidth="0.5" />
      ))}
      {Array.from({ length: 4 }).map((_, i) => (
        <line key={i} x1="20" y1={30 + i * 30} x2="180" y2={30 + i * 30} stroke="#3B82F6" strokeOpacity="0.2" strokeWidth="0.5" />
      ))}
      <motion.line
        x1="20" y1="75" x2="180" y2="75"
        stroke="#3B82F6" strokeWidth="1"
        style={{ filter: 'drop-shadow(0 0 4px #3B82F6)' }}
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: [0, 1, 1, 0] }}
        transition={{ duration: 2.5, ease: ed.ease, delay: 1.0, repeat: Infinity, repeatDelay: 1 }}
      />
      <rect x="50" y="40" width="40" height="25" fill="#3B82F6" fillOpacity="0.15" />
      <rect x="110" y="80" width="50" height="30" fill="#6366F1" fillOpacity="0.15" />
    </svg>
  );
}

function DetectPlate() {
  return (
    <svg viewBox="0 0 200 150" className="w-full h-full">
      <rect x="0" y="0" width="200" height="150" fill="#3B82F6" fillOpacity="0.04" />
      <line x1="0" y1="100" x2="200" y2="95" stroke="#fff" strokeOpacity="0.15" strokeWidth="0.8" />
      <motion.rect
        x="40" y="50" width="35" height="28"
        fill="none" stroke="#F87171" strokeWidth="1" strokeDasharray="2 1.5"
        initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: ed.ease, delay: 1.2 }}
      />
      <motion.text
        x="40" y="46" fill="#F87171" fontSize="6" fontFamily="sans-serif"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        transition={{ duration: 0.4, ease: ed.ease, delay: 1.5 }}
      >
        Crack · 92%
      </motion.text>
      <motion.rect
        x="120" y="80" width="30" height="22"
        fill="none" stroke="#FBBF24" strokeWidth="1" strokeDasharray="2 1.5"
        initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: ed.ease, delay: 1.4 }}
      />
      <motion.text
        x="120" y="76" fill="#FBBF24" fontSize="6" fontFamily="sans-serif"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        transition={{ duration: 0.4, ease: ed.ease, delay: 1.7 }}
      >
        Corrosion · 84%
      </motion.text>
    </svg>
  );
}

function ResolvePlate() {
  return (
    <div className="absolute inset-0 p-5 flex flex-col">
      <motion.div {...ed.fadeUp(1.2)} className="text-[8px] tracking-[0.25em] uppercase text-blue-300/80">
        Work Order · WO-2206-018
      </motion.div>
      <motion.div
        {...ed.fadeUp(1.3)}
        className="font-sans font-semibold text-[15px] leading-tight mt-1.5 text-white"
        style={{ fontFamily: "'Inter Tight', Inter, sans-serif" }}
      >
        Repair stress crack
        <br />
        <span className="italic font-serif text-white/55">Pump-House Roof, BTH</span>
      </motion.div>
      <div className="mt-auto space-y-1.5">
        {['Crew · M. Tanaka', 'Parts · 2 reserved', 'Due · 14 days', 'Evidence · 4 photos'].map((line, i) => (
          <motion.div
            key={line}
            {...ed.fadeUp(1.5 + i * 0.1)}
            className="flex items-center gap-2 text-[9px] text-white/65"
          >
            <span className="w-1 h-1 bg-blue-400" />
            <span>{line}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}