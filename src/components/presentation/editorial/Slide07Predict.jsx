import React from 'react';
import { motion } from 'framer-motion';
import EditorialShell, { ed } from './EditorialShell';

export default function Slide07Predict() {
  const points = Array.from({ length: 37 }, (_, i) => {
    const y = 100 - Math.pow(i / 36, 1.7) * 100;
    return { x: i, y };
  });
  const pathD = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${(p.x / 36) * 100} ${100 - p.y}`)
    .join(' ');
  const areaD = pathD + ' L 100 100 L 0 100 Z';

  return (
    <EditorialShell folio="07" section="Predict">
      <div className="h-full grid grid-cols-12 gap-10">
        <div className="col-span-4 flex flex-col justify-between">
          <div>
            <motion.div {...ed.fadeUp(0.2)} className="text-[11px] tracking-[0.3em] uppercase text-violet-300/70 mb-4">
              Failure prediction
            </motion.div>
            <motion.h2
              {...ed.fadeUp(0.35)}
              className="font-sans font-semibold text-[3rem] leading-[1.0] tracking-[-0.03em] text-balance text-white"
              style={{ fontFamily: "'Inter Tight', Inter, sans-serif" }}
            >
              The cheapest hour{' '}
              <span className="italic font-serif text-white/60">is the one before the failure.</span>
            </motion.h2>
          </div>

          <div className="space-y-7">
            <div>
              <motion.div
                {...ed.fadeUp(0.7)}
                className="font-sans font-semibold text-7xl tracking-[-0.04em] tabular-nums"
                style={{
                  fontFamily: "'Inter Tight', Inter, sans-serif",
                  background: 'linear-gradient(135deg, #FFFFFF, #C084FC)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                63<span className="text-white/30">%</span>
              </motion.div>
              <motion.div {...ed.fadeUp(0.8)} className="text-[11px] tracking-[0.2em] uppercase text-white/45 mt-1">
                Reduction in unplanned downtime
              </motion.div>
            </div>
            <div>
              <motion.div
                {...ed.fadeUp(0.85)}
                className="font-sans font-semibold text-7xl tracking-[-0.04em] tabular-nums"
                style={{
                  fontFamily: "'Inter Tight', Inter, sans-serif",
                  background: 'linear-gradient(135deg, #FFFFFF, #818CF8)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                4.2<span className="text-white/30">×</span>
              </motion.div>
              <motion.div {...ed.fadeUp(0.95)} className="text-[11px] tracking-[0.2em] uppercase text-white/45 mt-1">
                Cheaper to repair than replace
              </motion.div>
            </div>
            <motion.div
              {...ed.drawLine(1.0)}
              className="h-px w-16"
              style={{ background: 'linear-gradient(to right, #A855F7, transparent)' }}
            />
            <motion.p {...ed.fadeUp(1.05)} className="italic font-serif text-white/55 text-sm max-w-xs">
              Sensor telemetry, scan condition, and maintenance history feed a single remaining-life model per asset.
            </motion.p>
          </div>
        </div>

        <div className="col-span-8 flex flex-col">
          <motion.div {...ed.fadeUp(0.4)} className="flex items-baseline justify-between mb-6">
            <div className="text-[11px] tracking-[0.2em] uppercase text-white/45">
              Predicted condition curve · single asset
            </div>
            <div className="text-[10px] tracking-[0.3em] uppercase text-white/40">0 — 36 months</div>
          </motion.div>

          <div className="flex-1 relative">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
              <defs>
                <linearGradient id="curveGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#818CF8" />
                  <stop offset="100%" stopColor="#A855F7" />
                </linearGradient>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#A855F7" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#A855F7" stopOpacity="0" />
                </linearGradient>
              </defs>

              {[0, 25, 50, 75, 100].map((y) => (
                <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="#fff" strokeOpacity="0.04" strokeWidth="0.15" />
              ))}

              <motion.line
                x1="0" y1="70" x2="100" y2="70"
                stroke="#EF4444" strokeOpacity="0.45" strokeWidth="0.25" strokeDasharray="1 1.5"
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                transition={{ duration: 0.8, ease: ed.ease, delay: 0.7 }}
              />

              <motion.rect
                x="38" y="0" width="22" height="100"
                fill="url(#areaGrad)"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                transition={{ duration: 0.7, ease: ed.ease, delay: 1.4 }}
              />
              <motion.line
                x1="49" y1="0" x2="49" y2="100"
                stroke="#A855F7" strokeOpacity="0.6" strokeWidth="0.25" strokeDasharray="0.8 1.2"
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                transition={{ duration: 0.8, ease: ed.ease, delay: 1.5 }}
              />

              <motion.path
                d={areaD}
                fill="url(#areaGrad)"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                transition={{ duration: 1.2, ease: ed.ease, delay: 1.0 }}
              />

              <motion.path
                d={pathD}
                fill="none" stroke="url(#curveGrad)" strokeWidth="0.7" strokeLinecap="round"
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                transition={{ duration: 1.8, ease: ed.ease, delay: 0.8 }}
                vectorEffect="non-scaling-stroke"
                style={{ filter: 'drop-shadow(0 0 4px rgba(168, 85, 247, 0.6))' }}
              />
            </svg>

            <div className="absolute left-0 -bottom-7 text-[10px] tracking-[0.2em] uppercase text-white/40">Month 0</div>
            <div className="absolute right-0 -bottom-7 text-[10px] tracking-[0.2em] uppercase text-white/40">Month 36</div>
            <div className="absolute -left-1 top-0 text-[10px] tracking-[0.2em] uppercase text-white/40">Excellent</div>
            <div className="absolute -left-1 bottom-1 text-[10px] tracking-[0.2em] uppercase text-red-400/70">Failure</div>

            <motion.div
              {...ed.fadeUp(1.7)}
              className="absolute"
              style={{ left: '38%', top: '-30px', width: '22%' }}
            >
              <div className="text-center">
                <div className="italic font-serif text-violet-300 text-sm">Intervention window</div>
                <div className="text-[10px] tracking-[0.2em] uppercase text-violet-300/60 mt-0.5">
                  Months 14 — 22
                </div>
              </div>
            </motion.div>
          </div>

          <motion.div {...ed.fadeUp(2.0)} className="mt-12 flex items-center gap-8 text-[11px] text-white/55">
            <div className="flex items-center gap-2">
              <span className="w-3 h-0.5" style={{ background: 'linear-gradient(to right, #818CF8, #A855F7)' }} />
              <span>Predicted condition</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-px bg-red-400/60" />
              <span>Failure threshold</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-violet-500/20 border border-violet-400/40" />
              <span>Optimal action window</span>
            </div>
          </motion.div>
        </div>
      </div>
    </EditorialShell>
  );
}