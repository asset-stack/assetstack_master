import React from 'react';
import { motion } from 'framer-motion';
import EditorialShell, { ed } from './EditorialShell';

/**
 * Slide 08 · Scans → defects → work orders
 * The closed loop, shown as three plates of a process. Editorial caption
 * underneath each plate, like a documentary photo essay. Animated reveal
 * left-to-right, with a thin connecting rule.
 */
const STAGES = [
  {
    n: 'I',
    label: 'Scan',
    title: 'A drone, a phone, a LiDAR rig.',
    body: 'Capture the asset as it actually is. No clipboards. No interpretation. Just evidence.',
    metric: '12 min',
    metricLabel: 'Per building',
  },
  {
    n: 'II',
    label: 'Detect',
    title: 'The model finds what humans miss.',
    body: 'Cracks, corrosion, displacement, water damage — each tagged with confidence and severity, every finding reviewable.',
    metric: '94%',
    metricLabel: 'Detection accuracy',
  },
  {
    n: 'III',
    label: 'Resolve',
    title: 'Findings become work orders.',
    body: 'Routed to the right crew with the right parts at the right priority. The evidence is attached.',
    metric: '0',
    metricLabel: 'Manual transcription',
  },
];

export default function Slide08Scans() {
  return (
    <EditorialShell surface="cream" folio="08" section="The Closed Loop">
      <div className="h-full flex flex-col">
        <div className="max-w-4xl mb-12">
          <motion.div {...ed.fadeUp(0.2)} className="text-[11px] tracking-[0.3em] uppercase text-[#0B1020]/55 mb-4">
            Scans → defects → work orders
          </motion.div>
          <motion.h2 {...ed.fadeUp(0.35)} className="font-serif text-[3.25rem] leading-[1.02] tracking-tight text-balance">
            The inspection becomes
            <br />
            <span className="italic">the work order.</span>
          </motion.h2>
        </div>

        <div className="grid grid-cols-3 gap-12 flex-1 relative">
          {/* Connecting rule across all three */}
          <motion.div
            {...ed.drawLine(1.4)}
            className="absolute left-0 right-0 top-[36px] h-px bg-[#0B1020]/20"
          />

          {STAGES.map((s, i) => (
            <motion.div
              key={s.n}
              {...ed.fadeUp(0.5 + i * 0.2)}
              className="flex flex-col relative"
            >
              {/* Stage marker */}
              <div className="flex items-center gap-3 mb-12">
                <div className="w-[18px] h-[18px] rounded-full bg-[#3730A3] z-10" />
                <span className="font-serif italic text-[#3730A3] text-2xl">{s.n}</span>
                <span className="text-[11px] tracking-[0.3em] uppercase text-[#0B1020]/55">
                  {s.label}
                </span>
              </div>

              {/* Plate — visual representation */}
              <motion.div
                {...ed.fadeIn(0.7 + i * 0.2)}
                className="aspect-[4/3] bg-[#0B1020]/[0.03] border border-[#0B1020]/15 rounded-sm relative overflow-hidden mb-6"
              >
                {i === 0 && <ScanPlate />}
                {i === 1 && <DetectPlate />}
                {i === 2 && <ResolvePlate />}
              </motion.div>

              <h3 className="font-serif text-[24px] leading-[1.15] tracking-tight mb-3 text-balance">
                {s.title}
              </h3>
              <p className="text-[13px] leading-[1.65] text-[#0B1020]/70 mb-5">
                {s.body}
              </p>
              <div className="mt-auto pt-4 border-t border-[#0B1020]/15">
                <div className="font-serif text-3xl tabular-nums tracking-tight">{s.metric}</div>
                <div className="text-[10px] tracking-[0.25em] uppercase text-[#0B1020]/55 mt-1">
                  {s.metricLabel}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </EditorialShell>
  );
}

function ScanPlate() {
  // Stylised top-down floor scan with sweep line
  return (
    <svg viewBox="0 0 200 150" className="w-full h-full">
      {Array.from({ length: 6 }).map((_, i) => (
        <line key={i} x1={20 + i * 30} y1="20" x2={20 + i * 30} y2="130" stroke="#0B1020" strokeOpacity="0.15" strokeWidth="0.5" />
      ))}
      {Array.from({ length: 4 }).map((_, i) => (
        <line key={i} x1="20" y1={30 + i * 30} x2="180" y2={30 + i * 30} stroke="#0B1020" strokeOpacity="0.15" strokeWidth="0.5" />
      ))}
      <motion.line
        x1="20" y1="75" x2="180" y2="75"
        stroke="#3730A3" strokeWidth="1"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: [0, 1, 1, 0] }}
        transition={{ duration: 2.5, ease: ed.ease, delay: 1.0, repeat: Infinity, repeatDelay: 1 }}
      />
      <rect x="50" y="40" width="40" height="25" fill="#0B1020" fillOpacity="0.08" />
      <rect x="110" y="80" width="50" height="30" fill="#0B1020" fillOpacity="0.08" />
    </svg>
  );
}

function DetectPlate() {
  // Image with bounding boxes
  return (
    <svg viewBox="0 0 200 150" className="w-full h-full">
      <rect x="0" y="0" width="200" height="150" fill="#0B1020" fillOpacity="0.06" />
      <line x1="0" y1="100" x2="200" y2="95" stroke="#0B1020" strokeOpacity="0.2" strokeWidth="0.8" />
      <motion.rect
        x="40" y="50" width="35" height="28"
        fill="none" stroke="#B91C1C" strokeWidth="1" strokeDasharray="2 1.5"
        initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: ed.ease, delay: 1.2 }}
      />
      <motion.text
        x="40" y="46" fill="#B91C1C" fontSize="6" fontFamily="serif" fontStyle="italic"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        transition={{ duration: 0.4, ease: ed.ease, delay: 1.5 }}
      >
        Crack · 92%
      </motion.text>
      <motion.rect
        x="120" y="80" width="30" height="22"
        fill="none" stroke="#B45309" strokeWidth="1" strokeDasharray="2 1.5"
        initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: ed.ease, delay: 1.4 }}
      />
      <motion.text
        x="120" y="76" fill="#B45309" fontSize="6" fontFamily="serif" fontStyle="italic"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        transition={{ duration: 0.4, ease: ed.ease, delay: 1.7 }}
      >
        Corrosion · 84%
      </motion.text>
    </svg>
  );
}

function ResolvePlate() {
  // Stylised work order document
  return (
    <div className="absolute inset-0 p-5 flex flex-col">
      <motion.div {...ed.fadeUp(1.2)} className="text-[8px] tracking-[0.25em] uppercase text-[#0B1020]/55">
        Work Order · WO-2206-018
      </motion.div>
      <motion.div {...ed.fadeUp(1.3)} className="font-serif text-[15px] leading-tight mt-1.5">
        Repair stress crack
        <br />
        <span className="italic text-[#0B1020]/60">Pump-House Roof, BTH</span>
      </motion.div>
      <div className="mt-auto space-y-1.5">
        {['Crew · M. Tanaka', 'Parts · 2 reserved', 'Due · 14 days', 'Evidence · 4 photos'].map((line, i) => (
          <motion.div
            key={line}
            {...ed.fadeUp(1.5 + i * 0.1)}
            className="flex items-center gap-2 text-[9px] text-[#0B1020]/70"
          >
            <span className="w-1 h-1 bg-[#3730A3]" />
            <span>{line}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}