import React from 'react';
import { motion } from 'framer-motion';
import EditorialShell, { ed } from './EditorialShell';

const PILLARS = [
  { code: '01', name: 'Register',    sub: 'Every asset, audited.',         x: 0,    y: -200 },
  { code: '02', name: 'Maintenance', sub: 'Every job, accountable.',       x: 290,  y: 0    },
  { code: '03', name: 'Decisions',   sub: 'Every dollar, defensible.',     x: 0,    y: 200  },
  { code: '04', name: 'Field',       sub: 'Every inspection, evidenced.',  x: -290, y: 0    },
];

export default function Slide05Platform() {
  return (
    <EditorialShell folio="05" section="The Platform">
      <div className="h-full grid grid-cols-12 gap-10">
        <div className="col-span-4 flex flex-col justify-center">
          <motion.div {...ed.fadeUp(0.2)} className="text-[11px] tracking-[0.3em] uppercase text-violet-300/70 mb-4">
            One model, four surfaces
          </motion.div>
          <motion.h2
            {...ed.fadeUp(0.35)}
            className="font-sans font-semibold text-[3rem] leading-[1.0] tracking-[-0.03em] text-white text-balance mb-6"
            style={{ fontFamily: "'Inter Tight', Inter, sans-serif" }}
          >
            A single source of truth{' '}
            <span className="italic font-serif text-white/60">about your assets.</span>
          </motion.h2>
          <motion.p {...ed.fadeUp(0.5)} className="text-white/60 text-[15px] leading-relaxed max-w-md mb-6">
            Most CMMS tools digitise paperwork. We chose to model the asset —
            its condition, risk, cost, and remaining life — and let every
            workflow inherit from that.
          </motion.p>
          <motion.div
            {...ed.drawLine(0.7)}
            className="h-px w-20 mb-6"
            style={{ background: 'linear-gradient(to right, #A855F7, transparent)' }}
          />
          <motion.p {...ed.fadeUp(0.8)} className="italic font-serif text-white/70 text-lg">
            The register is not a list.
            <br />
            It is a living balance sheet.
          </motion.p>
        </div>

        <div className="col-span-8 relative flex items-center justify-center">
          {/* Concentric rings */}
          {[600, 420, 280].map((s, i) => (
            <motion.div
              key={s}
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1.2, ease: ed.ease, delay: 0.4 + i * 0.15 }}
              className="absolute rounded-full border"
              style={{
                width: s,
                height: s,
                borderColor: `rgba(168, 85, 247, ${0.06 + i * 0.05})`,
              }}
            />
          ))}

          {/* Center */}
          <motion.div
            {...ed.scaleIn(0.7)}
            className="relative z-10 w-[210px] h-[210px] rounded-full flex flex-col items-center justify-center text-center"
            style={{
              background: 'radial-gradient(circle at 30% 30%, rgba(168, 85, 247, 0.4), rgba(99, 102, 241, 0.6), #1A0B2E)',
              boxShadow: '0 0 80px rgba(168, 85, 247, 0.5), inset 0 0 30px rgba(0,0,0,0.3)',
              border: '1px solid rgba(168, 85, 247, 0.4)',
            }}
          >
            <div className="text-[9px] tracking-[0.3em] uppercase text-white/60 mb-2">Core</div>
            <div
              className="font-sans font-semibold text-3xl leading-tight text-white"
              style={{ fontFamily: "'Inter Tight', Inter, sans-serif" }}
            >
              Asset
              <br />
              <span className="italic font-serif text-white/80">model</span>
            </div>
          </motion.div>

          {/* Pillars */}
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
                <div
                  className="text-sm font-semibold mb-1"
                  style={{
                    background: 'linear-gradient(135deg, #A855F7, #6366F1)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  {p.code}
                </div>
                <div
                  className="font-sans font-semibold text-[26px] tracking-tight leading-tight text-white"
                  style={{ fontFamily: "'Inter Tight', Inter, sans-serif" }}
                >
                  {p.name}
                </div>
                <div className="text-[12px] text-white/50 mt-1.5 leading-snug">{p.sub}</div>
              </div>
            </motion.div>
          ))}

          {/* Connecting lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="-400 -300 800 600">
            {PILLARS.map((p, i) => {
              const len = Math.sqrt(p.x * p.x + p.y * p.y);
              const ux = p.x / len;
              const uy = p.y / len;
              return (
                <motion.line
                  key={p.code}
                  x1={ux * 105}
                  y1={uy * 105}
                  x2={p.x - ux * 90}
                  y2={p.y - uy * 90}
                  stroke="url(#violetLine)"
                  strokeWidth="1"
                  strokeDasharray="3 5"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 0.9, ease: ed.ease, delay: 1.0 + i * 0.1 }}
                />
              );
            })}
            <defs>
              <linearGradient id="violetLine" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#A855F7" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#6366F1" stopOpacity="0.3" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>
    </EditorialShell>
  );
}