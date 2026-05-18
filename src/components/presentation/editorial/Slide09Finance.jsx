import React from 'react';
import { motion } from 'framer-motion';
import EditorialShell, { ed } from './EditorialShell';

const YEARS = ['FY26', 'FY27', 'FY28', 'FY29', 'FY30', 'FY31', 'FY32', 'FY33', 'FY34', 'FY35'];

const BASELINE   = [12, 16, 21, 27, 34, 42, 51, 61, 72, 84];
const STATUS_QUO = [12, 18, 26, 36, 48, 62, 78, 96, 116, 138];
const PROACTIVE  = [12, 13, 13, 12, 11, 9, 8, 7, 6, 5];
const MAX = 140;

const pathFor = (s) =>
  s.map((v, i) => `${i === 0 ? 'M' : 'L'} ${(i / (s.length - 1)) * 100} ${100 - (v / MAX) * 100}`).join(' ');

export default function Slide09Finance() {
  return (
    <EditorialShell folio="09" section="Finance">
      <div className="h-full grid grid-cols-12 gap-10">
        <div className="col-span-4 flex flex-col justify-between">
          <div>
            <motion.div {...ed.fadeUp(0.2)} className="text-[11px] tracking-[0.3em] uppercase text-violet-300/70 mb-4">
              Capital plan · 10-year horizon
            </motion.div>
            <motion.h2
              {...ed.fadeUp(0.35)}
              className="font-sans font-semibold text-[3rem] leading-[1.0] tracking-[-0.03em] text-balance text-white mb-6"
              style={{ fontFamily: "'Inter Tight', Inter, sans-serif" }}
            >
              Three futures,{' '}
              <span className="italic font-serif text-white/60">one budget meeting.</span>
            </motion.h2>
            <motion.p {...ed.fadeUp(0.5)} className="text-white/60 text-[14px] leading-relaxed mb-6 max-w-sm">
              Inflation, climate stress, deferral rate. Adjust the levers, see
              the backlog. Save the scenario. Print the board paper.
            </motion.p>
            <motion.div
              {...ed.drawLine(0.7)}
              className="h-px w-16 mb-6"
              style={{ background: 'linear-gradient(to right, #A855F7, transparent)' }}
            />
            <motion.p {...ed.fadeUp(0.8)} className="italic font-serif text-white/55 text-sm max-w-xs">
              The chart is not the output. The defensible decision is.
            </motion.p>
          </div>

          <div className="space-y-4">
            {[
              { color: '#F87171', name: 'Status quo', sub: 'Defer everything renewable' },
              { color: 'rgba(255,255,255,0.5)', name: 'Baseline', sub: 'Current capital programme' },
              { color: '#A855F7', name: 'Proactive', sub: 'Predict-and-intervene' },
            ].map((s) => (
              <div key={s.name} className="flex items-baseline gap-3">
                <span className="w-3 h-0.5 mt-2" style={{ background: s.color }} />
                <div>
                  <div className="font-sans font-semibold text-base text-white" style={{ fontFamily: "'Inter Tight', Inter, sans-serif" }}>
                    {s.name}
                  </div>
                  <div className="text-[11px] text-white/45">{s.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="col-span-8 flex flex-col">
          <motion.div {...ed.fadeUp(0.4)} className="flex items-baseline justify-between mb-6">
            <div className="text-[11px] tracking-[0.2em] uppercase text-white/45">
              Backlog projection by strategy · $M
            </div>
            <div className="text-[10px] tracking-[0.3em] uppercase text-white/40">FY26 — FY35</div>
          </motion.div>

          <div className="flex-1 relative pr-[130px]">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
              <defs>
                <linearGradient id="proactiveGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#818CF8" />
                  <stop offset="100%" stopColor="#A855F7" />
                </linearGradient>
              </defs>

              {[0, 25, 50, 75, 100].map((y) => (
                <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="#fff" strokeOpacity="0.04" strokeWidth="0.15" />
              ))}

              <motion.path
                d={pathFor(STATUS_QUO)}
                fill="none" stroke="#F87171" strokeWidth="0.6"
                style={{ filter: 'drop-shadow(0 0 3px rgba(248, 113, 113, 0.5))' }}
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                transition={{ duration: 1.6, ease: ed.ease, delay: 0.8 }}
                vectorEffect="non-scaling-stroke"
              />
              <motion.path
                d={pathFor(BASELINE)}
                fill="none" stroke="#fff" strokeOpacity="0.5" strokeWidth="0.5" strokeDasharray="1 1.5"
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                transition={{ duration: 1.6, ease: ed.ease, delay: 1.0 }}
                vectorEffect="non-scaling-stroke"
              />
              <motion.path
                d={pathFor(PROACTIVE)}
                fill="none" stroke="url(#proactiveGrad)" strokeWidth="0.8"
                style={{ filter: 'drop-shadow(0 0 4px rgba(168, 85, 247, 0.7))' }}
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                transition={{ duration: 1.6, ease: ed.ease, delay: 1.2 }}
                vectorEffect="non-scaling-stroke"
              />

              <motion.circle cx="100" cy={100 - (STATUS_QUO[9] / MAX) * 100} r="1" fill="#F87171" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.4 }} />
              <motion.circle cx="100" cy={100 - (PROACTIVE[9] / MAX) * 100} r="1" fill="#A855F7" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.6 }} />
            </svg>

            <div className="absolute left-0 right-[130px] -bottom-7 flex justify-between text-[10px] tabular-nums text-white/40">
              {YEARS.filter((_, i) => i % 2 === 0).map((y) => <span key={y}>{y}</span>)}
            </div>

            <motion.div
              {...ed.fadeUp(2.5)}
              className="absolute"
              style={{ right: '0', top: `${(1 - STATUS_QUO[9] / MAX) * 100}%`, transform: 'translateY(-50%)', width: 120 }}
            >
              <div className="font-sans font-semibold text-red-400 text-xl" style={{ fontFamily: "'Inter Tight', Inter, sans-serif" }}>$138M</div>
              <div className="text-[10px] tracking-[0.2em] uppercase text-red-400/70">Status quo</div>
            </motion.div>
            <motion.div
              {...ed.fadeUp(2.7)}
              className="absolute"
              style={{ right: '0', top: `${(1 - PROACTIVE[9] / MAX) * 100}%`, transform: 'translateY(-50%)', width: 120 }}
            >
              <div className="font-sans font-semibold text-xl" style={{
                fontFamily: "'Inter Tight', Inter, sans-serif",
                background: 'linear-gradient(135deg, #818CF8, #A855F7)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>$5M</div>
              <div className="text-[10px] tracking-[0.2em] uppercase text-violet-300/70">Proactive</div>
            </motion.div>

            <motion.div {...ed.fadeUp(2.9)} className="absolute top-[40%] left-[50%] -translate-x-1/2 text-center">
              <div
                className="font-sans font-semibold text-5xl tabular-nums"
                style={{
                  fontFamily: "'Inter Tight', Inter, sans-serif",
                  background: 'linear-gradient(135deg, #FFFFFF, #C084FC)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                $133M
              </div>
              <div className="text-[10px] tracking-[0.2em] uppercase text-white/55 mt-1">10-year delta</div>
            </motion.div>
          </div>
        </div>
      </div>
    </EditorialShell>
  );
}