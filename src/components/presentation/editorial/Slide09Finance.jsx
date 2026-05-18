import React from 'react';
import { motion } from 'framer-motion';
import EditorialShell, { ed } from './EditorialShell';

/**
 * Slide 09 · Finance — capital plan & scenarios
 * The board-grade chart. Three scenarios drawn as separate paths on a
 * single axis, with explicit annotations. This is the slide that wins the
 * room of CFOs.
 */
const YEARS = ['FY26', 'FY27', 'FY28', 'FY29', 'FY30', 'FY31', 'FY32', 'FY33', 'FY34', 'FY35'];

// Backlog $M projections per scenario
const BASELINE = [12, 16, 21, 27, 34, 42, 51, 61, 72, 84];
const STATUS_QUO = [12, 18, 26, 36, 48, 62, 78, 96, 116, 138];
const PROACTIVE = [12, 13, 13, 12, 11, 9, 8, 7, 6, 5];

const MAX = 140;

function pathFor(series) {
  return series
    .map((v, i) => `${i === 0 ? 'M' : 'L'} ${(i / (series.length - 1)) * 100} ${100 - (v / MAX) * 100}`)
    .join(' ');
}

export default function Slide09Finance() {
  return (
    <EditorialShell surface="cream" folio="09" section="Finance">
      <div className="h-full grid grid-cols-12 gap-10">
        <div className="col-span-4 flex flex-col justify-between">
          <div>
            <motion.div {...ed.fadeUp(0.2)} className="text-[11px] tracking-[0.3em] uppercase text-[#0B1020]/55 mb-4">
              Capital plan · 10-year horizon
            </motion.div>
            <motion.h2
              {...ed.fadeUp(0.35)}
              className="font-serif text-[3rem] leading-[1.02] tracking-tight text-balance mb-6"
            >
              Three futures,
              <br />
              <span className="italic">one budget meeting.</span>
            </motion.h2>
            <motion.p {...ed.fadeUp(0.5)} className="text-[#0B1020]/70 text-[15px] leading-relaxed mb-6 max-w-sm">
              Inflation, climate stress, deferral rate. Adjust the levers, see
              the backlog. Save the scenario. Print the board paper.
            </motion.p>
            <motion.div {...ed.drawLine(0.7)} className="h-px bg-[#0B1020]/30 w-16 mb-6" />
            <motion.p {...ed.fadeUp(0.8)} className="font-serif italic text-[#0B1020]/65 text-sm max-w-xs">
              The chart is not the output. The defensible decision is.
            </motion.p>
          </div>

          <div className="space-y-4">
            <div className="flex items-baseline gap-3">
              <span className="w-3 h-px bg-[#B91C1C]" />
              <div>
                <div className="font-serif text-base">Status quo</div>
                <div className="text-[11px] text-[#0B1020]/55">Defer everything renewable</div>
              </div>
            </div>
            <div className="flex items-baseline gap-3">
              <span className="w-3 h-px bg-[#0B1020]/50" />
              <div>
                <div className="font-serif text-base">Baseline</div>
                <div className="text-[11px] text-[#0B1020]/55">Current capital programme</div>
              </div>
            </div>
            <div className="flex items-baseline gap-3">
              <span className="w-3 h-px bg-[#3730A3]" />
              <div>
                <div className="font-serif text-base">Proactive</div>
                <div className="text-[11px] text-[#0B1020]/55">Predict-and-intervene</div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-8 flex flex-col">
          <motion.div {...ed.fadeUp(0.4)} className="flex items-baseline justify-between mb-6">
            <div className="font-serif italic text-[#0B1020]/55 text-sm">
              Figure 2 · Backlog projection by strategy, $M
            </div>
            <div className="text-[10px] tracking-[0.3em] uppercase text-[#0B1020]/55">
              FY26 — FY35
            </div>
          </motion.div>

          <div className="flex-1 relative">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
              {/* Gridlines */}
              {[0, 25, 50, 75, 100].map((y) => (
                <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="#0B1020" strokeOpacity="0.07" strokeWidth="0.15" />
              ))}

              {/* Series */}
              <motion.path
                d={pathFor(STATUS_QUO)}
                fill="none" stroke="#B91C1C" strokeWidth="0.6"
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                transition={{ duration: 1.6, ease: ed.ease, delay: 0.8 }}
                vectorEffect="non-scaling-stroke"
              />
              <motion.path
                d={pathFor(BASELINE)}
                fill="none" stroke="#0B1020" strokeOpacity="0.5" strokeWidth="0.5" strokeDasharray="1 1.5"
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                transition={{ duration: 1.6, ease: ed.ease, delay: 1.0 }}
                vectorEffect="non-scaling-stroke"
              />
              <motion.path
                d={pathFor(PROACTIVE)}
                fill="none" stroke="#3730A3" strokeWidth="0.8"
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                transition={{ duration: 1.6, ease: ed.ease, delay: 1.2 }}
                vectorEffect="non-scaling-stroke"
              />

              {/* End-point dots */}
              <motion.circle cx="100" cy={100 - (STATUS_QUO[9] / MAX) * 100} r="0.8" fill="#B91C1C" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.4 }} />
              <motion.circle cx="100" cy={100 - (PROACTIVE[9] / MAX) * 100} r="0.8" fill="#3730A3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.6 }} />
            </svg>

            {/* X axis */}
            <div className="absolute left-0 right-0 -bottom-7 flex justify-between text-[10px] tabular-nums text-[#0B1020]/55">
              {YEARS.filter((_, i) => i % 2 === 0).map((y) => <span key={y}>{y}</span>)}
            </div>

            {/* End-point labels */}
            <motion.div
              {...ed.fadeUp(2.5)}
              className="absolute"
              style={{ right: '-110px', top: `${(1 - STATUS_QUO[9] / MAX) * 100}%`, transform: 'translateY(-50%)' }}
            >
              <div className="font-serif italic text-[#B91C1C] text-sm">$138M</div>
              <div className="text-[10px] tracking-[0.2em] uppercase text-[#B91C1C]/70">Status quo</div>
            </motion.div>
            <motion.div
              {...ed.fadeUp(2.7)}
              className="absolute"
              style={{ right: '-110px', top: `${(1 - PROACTIVE[9] / MAX) * 100}%`, transform: 'translateY(-50%)' }}
            >
              <div className="font-serif italic text-[#3730A3] text-sm">$5M</div>
              <div className="text-[10px] tracking-[0.2em] uppercase text-[#3730A3]/70">Proactive</div>
            </motion.div>

            {/* Delta callout */}
            <motion.div
              {...ed.fadeUp(2.9)}
              className="absolute right-[120px] top-[42%] text-right"
            >
              <div className="font-serif text-3xl tabular-nums">$133M</div>
              <div className="text-[10px] tracking-[0.2em] uppercase text-[#0B1020]/55">10-year delta</div>
            </motion.div>
          </div>
        </div>
      </div>
    </EditorialShell>
  );
}