import React from 'react';
import { motion } from 'framer-motion';
import EditorialShell, { ed } from './EditorialShell';

/**
 * Slide 07 · Predict
 * Editorial chart: condition curve over time with an "intervention window"
 * shaded. Looks like an FT data graphic, not a SaaS dashboard.
 */
export default function Slide07Predict() {
  // Curve points (condition 100 → 0 over 36 months)
  const points = Array.from({ length: 37 }, (_, i) => {
    const t = i;
    // smooth degradation with an accelerating tail
    const y = 100 - Math.pow(t / 36, 1.7) * 100;
    return { x: t, y };
  });
  const pathD = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${(p.x / 36) * 100} ${100 - p.y}`)
    .join(' ');

  return (
    <EditorialShell surface="cream" folio="07" section="Predict">
      <div className="h-full grid grid-cols-12 gap-10">
        <div className="col-span-4 flex flex-col justify-between">
          <div>
            <motion.div {...ed.fadeUp(0.2)} className="text-[11px] tracking-[0.3em] uppercase text-[#0B1020]/55 mb-4">
              Failure prediction
            </motion.div>
            <motion.h2
              {...ed.fadeUp(0.35)}
              className="font-serif text-[3rem] leading-[1.05] tracking-tight text-balance"
            >
              The cheapest hour
              <br />
              is the one <span className="italic">before</span>
              <br />
              the failure.
            </motion.h2>
          </div>

          <div className="space-y-6">
            <div>
              <motion.div {...ed.fadeUp(0.7)} className="font-serif text-6xl tracking-tight tabular-nums">
                63<span className="text-[#0B1020]/40">%</span>
              </motion.div>
              <motion.div {...ed.fadeUp(0.8)} className="text-[12px] tracking-[0.2em] uppercase text-[#0B1020]/55 mt-1">
                Reduction in unplanned downtime
              </motion.div>
            </div>
            <div>
              <motion.div {...ed.fadeUp(0.85)} className="font-serif text-6xl tracking-tight tabular-nums">
                4.2<span className="text-[#0B1020]/40">×</span>
              </motion.div>
              <motion.div {...ed.fadeUp(0.95)} className="text-[12px] tracking-[0.2em] uppercase text-[#0B1020]/55 mt-1">
                Cheaper to repair than replace
              </motion.div>
            </div>
            <motion.div {...ed.drawLine(1.0)} className="h-px bg-[#0B1020]/30 w-16" />
            <motion.p {...ed.fadeUp(1.05)} className="font-serif italic text-[#0B1020]/65 text-sm max-w-xs">
              Sensor telemetry, scan condition, and maintenance history feed a
              single remaining-life model per asset.
            </motion.p>
          </div>
        </div>

        <div className="col-span-8 flex flex-col">
          <motion.div {...ed.fadeUp(0.4)} className="flex items-baseline justify-between mb-6">
            <div className="font-serif italic text-[#0B1020]/55 text-sm">
              Figure 1 · Predicted condition curve, single asset
            </div>
            <div className="text-[10px] tracking-[0.3em] uppercase text-[#0B1020]/55">
              0 — 36 months
            </div>
          </motion.div>

          <div className="flex-1 relative">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
              {/* Y axis gridlines */}
              {[0, 25, 50, 75, 100].map((y) => (
                <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="#0B1020" strokeOpacity="0.08" strokeWidth="0.15" />
              ))}

              {/* Risk thresholds */}
              <motion.line
                x1="0" y1="40" x2="100" y2="40"
                stroke="#0B1020" strokeOpacity="0.25" strokeWidth="0.2" strokeDasharray="1 1.5"
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                transition={{ duration: 0.8, ease: ed.ease, delay: 0.6 }}
              />
              <motion.line
                x1="0" y1="70" x2="100" y2="70"
                stroke="#B91C1C" strokeOpacity="0.45" strokeWidth="0.25" strokeDasharray="1 1.5"
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                transition={{ duration: 0.8, ease: ed.ease, delay: 0.7 }}
              />

              {/* Intervention window — shaded band */}
              <motion.rect
                x="38" y="0" width="22" height="100"
                fill="#3730A3" fillOpacity="0.07"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                transition={{ duration: 0.7, ease: ed.ease, delay: 1.4 }}
              />
              <motion.line
                x1="49" y1="0" x2="49" y2="100"
                stroke="#3730A3" strokeOpacity="0.4" strokeWidth="0.25" strokeDasharray="0.8 1.2"
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                transition={{ duration: 0.8, ease: ed.ease, delay: 1.5 }}
              />

              {/* The curve */}
              <motion.path
                d={pathD}
                fill="none" stroke="#0B1020" strokeWidth="0.5" strokeLinecap="round"
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                transition={{ duration: 1.8, ease: ed.ease, delay: 0.8 }}
                vectorEffect="non-scaling-stroke"
              />
            </svg>

            {/* Axis labels */}
            <div className="absolute left-0 -bottom-7 text-[10px] tracking-[0.2em] uppercase text-[#0B1020]/55">Month 0</div>
            <div className="absolute right-0 -bottom-7 text-[10px] tracking-[0.2em] uppercase text-[#0B1020]/55">Month 36</div>
            <div className="absolute -left-1 top-0 text-[10px] tracking-[0.2em] uppercase text-[#0B1020]/55">Excellent</div>
            <div className="absolute -left-1 bottom-1 text-[10px] tracking-[0.2em] uppercase text-[#B91C1C]/70">Failure</div>

            {/* Intervention window label */}
            <motion.div
              {...ed.fadeUp(1.7)}
              className="absolute"
              style={{ left: '38%', top: '-30px', width: '22%' }}
            >
              <div className="text-center">
                <div className="font-serif italic text-[#3730A3] text-sm">Intervention window</div>
                <div className="text-[10px] tracking-[0.2em] uppercase text-[#3730A3]/70 mt-0.5">
                  Months 14 — 22
                </div>
              </div>
            </motion.div>
          </div>

          <motion.div {...ed.fadeUp(2.0)} className="mt-12 flex items-center gap-8 text-[11px] text-[#0B1020]/65">
            <div className="flex items-center gap-2">
              <span className="w-3 h-px bg-[#0B1020]" />
              <span>Predicted condition</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-px bg-[#B91C1C]/60 border-dashed" />
              <span>Failure threshold</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-[#3730A3]/15" />
              <span>Optimal action window</span>
            </div>
          </motion.div>
        </div>
      </div>
    </EditorialShell>
  );
}