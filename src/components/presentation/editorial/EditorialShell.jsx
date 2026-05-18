import React from 'react';
import { motion } from 'framer-motion';

/**
 * Cinematic dark slide shell — Linear/Vercel keynote aesthetic.
 *
 * Pure black surface, indigo→violet glow accents, oversized Inter Tight
 * headlines, glowing UI fragments. All slides share this chrome.
 */
const EASE = [0.22, 1, 0.36, 1];

export default function EditorialShell({
  folio,
  section,
  children,
  className = '',
  showRule = true,
  showAmbient = true,
  hideFooter = false,
}) {
  return (
    <div className={`w-full h-full flex flex-col bg-[#050505] text-[#FAFAFA] ${className} relative overflow-hidden`}>
      {/* Ambient violet glow — top-left and bottom-right corners */}
      {showAmbient && (
        <>
          <div
            className="absolute pointer-events-none"
            style={{
              top: '-20%',
              left: '-10%',
              width: '60%',
              height: '70%',
              background: 'radial-gradient(circle at center, rgba(99, 102, 241, 0.25) 0%, rgba(168, 85, 247, 0.08) 35%, transparent 65%)',
              filter: 'blur(40px)',
            }}
          />
          <div
            className="absolute pointer-events-none"
            style={{
              bottom: '-30%',
              right: '-10%',
              width: '55%',
              height: '70%',
              background: 'radial-gradient(circle at center, rgba(168, 85, 247, 0.18) 0%, rgba(99, 102, 241, 0.05) 40%, transparent 70%)',
              filter: 'blur(50px)',
            }}
          />
        </>
      )}

      {/* Subtle grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.025]"
        style={{
          backgroundImage:
            'linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)',
          backgroundSize: '64px 64px',
        }}
      />

      {/* Header chrome */}
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE }}
        className="flex items-center justify-between px-16 pt-10 pb-4 relative z-10"
      >
        <div className="flex items-baseline gap-3">
          <span className="font-semibold text-[14px] tracking-tight text-white">AssetStack</span>
          <span className="text-[10px] tracking-[0.3em] uppercase text-white/40">
            Boardroom Edition · 2026
          </span>
        </div>
        <div className="flex items-baseline gap-6">
          {section && (
            <span className="text-[10px] tracking-[0.3em] uppercase text-white/40">
              {section}
            </span>
          )}
          {folio && (
            <span className="text-[14px] tabular-nums text-white/70 font-medium">{folio}</span>
          )}
        </div>
      </motion.div>

      {showRule && (
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.8, ease: EASE, delay: 0.1 }}
          className="h-px mx-16 origin-left relative z-10"
          style={{
            background: 'linear-gradient(to right, rgba(255,255,255,0.2), rgba(168, 85, 247, 0.3), rgba(255,255,255,0.05))',
          }}
        />
      )}

      <div className="flex-1 px-16 pt-10 pb-10 relative z-10 min-h-0">
        {children}
      </div>

      {!hideFooter && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, ease: EASE, delay: 0.4 }}
          className="px-16 pb-6 text-[10px] tracking-[0.3em] uppercase text-white/40 flex items-center justify-between relative z-10"
        >
          <span>An operating system for public assets</span>
          <span>assetstack.io</span>
        </motion.div>
      )}
    </div>
  );
}

export const ed = {
  ease: EASE,
  fadeUp: (delay = 0) => ({
    initial: { opacity: 0, y: 18 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.7, ease: EASE, delay },
  }),
  fadeIn: (delay = 0) => ({
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.8, ease: EASE, delay },
  }),
  drawLine: (delay = 0) => ({
    initial: { scaleX: 0 },
    animate: { scaleX: 1 },
    transition: { duration: 0.8, ease: EASE, delay },
    style: { transformOrigin: 'left center' },
  }),
  scaleIn: (delay = 0) => ({
    initial: { opacity: 0, scale: 0.96 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.9, ease: EASE, delay },
  }),
};

// Shared image URLs
export const ASSETS = {
  cube: 'https://media.base44.com/images/public/6970c68cc08dbe7897c72f22/5c02c2583_generated_image.png',
  dashboard: 'https://media.base44.com/images/public/6970c68cc08dbe7897c72f22/20fdff77a_generated_image.png',
};