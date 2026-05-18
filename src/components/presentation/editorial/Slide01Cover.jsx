import React from 'react';
import { motion } from 'framer-motion';
import EditorialShell, { ed } from './EditorialShell';
import DashboardMock from './DashboardMock';

export default function Slide01Cover() {
  return (
    <EditorialShell folio="01" section="Cover" hideFooter>
      <div className="h-full flex flex-col">
        {/* Top: type block */}
        <div className="grid grid-cols-12 gap-8">
          {/* Decorative glowing cube — pure CSS, no image dependency */}
          <motion.div
            {...ed.scaleIn(0.3)}
            className="col-span-3 relative flex items-center justify-center"
          >
            <CrystalCube />
          </motion.div>

          <div className="col-span-9 pt-2">
            <motion.h1
              {...ed.fadeUp(0.4)}
              className="font-sans font-semibold text-[5.5rem] leading-[0.92] tracking-[-0.04em] text-white text-balance"
              style={{ fontFamily: "'Inter Tight', Inter, sans-serif" }}
            >
              The case for a{' '}
              <span
                className="italic font-serif"
                style={{
                  background: 'linear-gradient(135deg, #818CF8 0%, #A855F7 50%, #C084FC 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                national
              </span>
              <br />
              asset operating system.
            </motion.h1>

            <motion.p
              {...ed.fadeUp(0.65)}
              className="mt-7 text-[18px] text-white/70 max-w-2xl leading-relaxed"
            >
              A position paper, prepared for boards, councils,<br />
              and government infrastructure committees.
            </motion.p>

            <motion.p
              {...ed.fadeUp(0.8)}
              className="mt-5 text-[15px] text-white/45 max-w-2xl leading-relaxed"
            >
              Every council, every department, every public agency runs on
              assets it cannot see, cannot predict, and cannot defend at budget
              time. This is what we built to fix that.
            </motion.p>
          </div>
        </div>

        {/* Dashboard hero */}
        <motion.div
          {...ed.scaleIn(1.0)}
          className="relative mt-8 rounded-2xl overflow-hidden flex-1 min-h-0"
          style={{
            boxShadow: '0 0 100px rgba(168, 85, 247, 0.35), 0 0 0 1px rgba(168, 85, 247, 0.25)',
            background: 'linear-gradient(135deg, rgba(99,102,241,0.12), rgba(168,85,247,0.08))',
            padding: '2px',
          }}
        >
          <div className="rounded-[14px] overflow-hidden h-full">
            <DashboardMock />
          </div>
        </motion.div>
      </div>

      {/* Footer overrides — replaces default chrome line */}
      <div className="absolute bottom-6 left-16 right-16 flex items-center justify-between text-[10px] tracking-[0.3em] uppercase text-white/45 z-20 pointer-events-none">
        <span>Volume I · The Boardroom Cut · An operating system for public assets</span>
        <span>Twelve minutes · Twelve slides · assetstack.io</span>
      </div>
    </EditorialShell>
  );
}

function CrystalCube() {
  return (
    <div className="relative w-[240px] h-[240px]" style={{ perspective: 800 }}>
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(circle at center, rgba(168, 85, 247, 0.4), rgba(99, 102, 241, 0.15) 50%, transparent 75%)',
          filter: 'blur(30px)',
        }}
      />
      <motion.div
        animate={{ rotateY: [0, 360] }}
        transition={{ duration: 24, repeat: Infinity, ease: 'linear' }}
        className="relative w-full h-full"
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* 6 faces */}
        {[
          { t: 'rotateY(0deg) translateZ(80px)' },
          { t: 'rotateY(180deg) translateZ(80px)' },
          { t: 'rotateY(90deg) translateZ(80px)' },
          { t: 'rotateY(-90deg) translateZ(80px)' },
          { t: 'rotateX(90deg) translateZ(80px)' },
          { t: 'rotateX(-90deg) translateZ(80px)' },
        ].map((f, i) => (
          <div
            key={i}
            className="absolute"
            style={{
              width: 160,
              height: 160,
              left: 40,
              top: 40,
              transform: f.t,
              background: 'linear-gradient(135deg, rgba(168,85,247,0.25), rgba(99,102,241,0.15))',
              border: '1px solid rgba(192, 132, 252, 0.5)',
              boxShadow: 'inset 0 0 30px rgba(168, 85, 247, 0.3)',
            }}
          />
        ))}
      </motion.div>
    </div>
  );
}