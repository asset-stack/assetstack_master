import React from 'react';
import { motion } from 'framer-motion';
import EditorialShell, { ed } from './EditorialShell';

/**
 * Slide 05 · The platform — one picture
 * A schematic of the four operating systems orbiting a central data model.
 * Editorial-line-art style. No screenshots, no glow. The shape itself is
 * the argument: one truth, four surfaces.
 */
const PILLARS = [
  { code: '01', name: 'Register',   sub: 'Every asset, audited.',     x: 0,   y: -180 },
  { code: '02', name: 'Maintenance', sub: 'Every job, accountable.',  x: 270, y: 0    },
  { code: '03', name: 'Decisions',   sub: 'Every dollar, defensible.', x: 0,   y: 180  },
  { code: '04', name: 'Field',       sub: 'Every inspection, evidenced.', x: -270, y: 0 },
];

export default function Slide05Platform() {
  return (
    <EditorialShell surface="cream" folio="05" section="The Platform">
      <div className="h-full grid grid-cols-12 gap-10">
        <div className="col-span-4 flex flex-col justify-center">
          <motion.div {...ed.fadeUp(0.2)} className="text-[11px] tracking-[0.3em] uppercase text-[#0B1020]/55 mb-4">
            One model, four surfaces
          </motion.div>
          <motion.h2
            {...ed.fadeUp(0.35)}
            className="font-serif text-[3.25rem] leading-[1.02] tracking-tight text-balance mb-6"
          >
            A single source of truth
            <br />
            <span className="italic">about your assets.</span>
          </motion.h2>
          <motion.p
            {...ed.fadeUp(0.5)}
            className="text-[#0B1020]/70 text-[16px] leading-relaxed max-w-md mb-6"
          >
            Most CMMS tools digitise paperwork. We chose to model the asset —
            its condition, risk, cost, and remaining life — and let every
            workflow inherit from that.
          </motion.p>
          <motion.div {...ed.drawLine(0.7)} className="h-px bg-[#0B1020]/30 w-20 mb-6" />
          <motion.p {...ed.fadeUp(0.8)} className="font-serif italic text-[#0B1020]/65 text-lg">
            The register is not a list.
            <br />
            It is a living balance sheet.
          </motion.p>
        </div>

        <div className="col-span-8 relative flex items-center justify-center">
          {/* Concentric editorial rings */}
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.2, ease: ed.ease, delay: 0.4 }}
            className="absolute w-[560px] h-[560px] rounded-full border border-[#0B1020]/10"
          />
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.2, ease: ed.ease, delay: 0.55 }}
            className="absolute w-[380px] h-[380px] rounded-full border border-[#0B1020]/15"
          />

          {/* Center — the data model */}
          <motion.div
            {...ed.fadeUp(0.7)}
            className="relative z-10 w-[200px] h-[200px] rounded-full bg-[#0B1020] text-[#F5F1E8] flex flex-col items-center justify-center text-center"
          >
            <div className="text-[9px] tracking-[0.3em] uppercase text-[#F5F1E8]/55 mb-2">
              Core
            </div>
            <div className="font-serif text-2xl leading-tight">
              Asset
              <br />
              <span className="italic">model</span>
            </div>
          </motion.div>

          {/* Four pillars */}
          {PILLARS.map((p, i) => (
            <motion.div
              key={p.code}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, ease: ed.ease, delay: 0.9 + i * 0.12 }}
              className="absolute"
              style={{ transform: `translate(${p.x}px, ${p.y}px)` }}
            >
              <div className="w-[180px] text-center">
                <div className="font-serif italic text-[#3730A3] text-sm mb-1">{p.code}</div>
                <div className="font-serif text-[26px] tracking-tight leading-tight">{p.name}</div>
                <div className="text-[12px] text-[#0B1020]/55 mt-1.5 leading-snug">{p.sub}</div>
              </div>
            </motion.div>
          ))}

          {/* Hairlines connecting model → pillars */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="-400 -300 800 600">
            {PILLARS.map((p, i) => {
              const len = Math.sqrt(p.x * p.x + p.y * p.y);
              const ux = p.x / len;
              const uy = p.y / len;
              const x1 = ux * 100;
              const y1 = uy * 100;
              const x2 = p.x - ux * 90;
              const y2 = p.y - uy * 90;
              return (
                <motion.line
                  key={p.code}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="#0B1020"
                  strokeOpacity="0.18"
                  strokeWidth="1"
                  strokeDasharray="2 4"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 0.9, ease: ed.ease, delay: 1.0 + i * 0.1 }}
                />
              );
            })}
          </svg>
        </div>
      </div>
    </EditorialShell>
  );
}