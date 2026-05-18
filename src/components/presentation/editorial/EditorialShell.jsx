import React from 'react';
import { motion } from 'framer-motion';

/**
 * Editorial slide shell — McKinsey/Bloomberg aesthetic.
 *
 * Two surfaces:
 *   - "cream" : warm ink-on-paper for stakes, narrative, finance
 *   - "ink"   : deep navy for hero/wow moments
 *
 * Every slide carries the same chrome: a thin rule, a folio number,
 * a kicker, a publication mark. This is what makes it feel like one
 * coherent document instead of a slide salad.
 */
const EASE = [0.22, 1, 0.36, 1];

export default function EditorialShell({
  surface = 'cream', // 'cream' | 'ink'
  folio,             // "01" — slide number
  section,           // "THE STAKES" — section label, top-right
  children,
  className = '',
  showRule = true,
}) {
  const isInk = surface === 'ink';
  const bg = isInk
    ? 'bg-[#0B1020] text-[#F5F1E8]'
    : 'bg-[#F5F1E8] text-[#0B1020]';
  const rule = isInk ? 'bg-[#F5F1E8]/15' : 'bg-[#0B1020]/15';
  const meta = isInk ? 'text-[#F5F1E8]/60' : 'text-[#0B1020]/55';

  return (
    <div className={`w-full h-full flex flex-col ${bg} ${className} relative overflow-hidden`}>
      {/* Paper grain on cream surfaces — barely visible, gives depth */}
      {!isInk && (
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.04] mix-blend-multiply"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence baseFrequency='0.9' numOctaves='2'/></filter><rect width='200' height='200' filter='url(%23n)'/></svg>\")",
          }}
        />
      )}

      {/* Header chrome */}
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE }}
        className="flex items-center justify-between px-16 pt-10 pb-4 relative z-10"
      >
        <div className="flex items-baseline gap-3">
          <span className="font-serif italic text-[15px] tracking-tight">AssetStack</span>
          <span className={`text-[10px] tracking-[0.3em] uppercase ${meta}`}>
            Boardroom Edition · 2026
          </span>
        </div>
        <div className="flex items-baseline gap-6">
          {section && (
            <span className={`text-[10px] tracking-[0.3em] uppercase ${meta}`}>
              {section}
            </span>
          )}
          {folio && (
            <span className="font-serif text-[15px] tabular-nums">{folio}</span>
          )}
        </div>
      </motion.div>

      {showRule && (
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.7, ease: EASE, delay: 0.1 }}
          className={`h-px ${rule} mx-16 origin-left relative z-10`}
        />
      )}

      {/* Content area */}
      <div className="flex-1 px-16 pt-10 pb-12 relative z-10 min-h-0">
        {children}
      </div>

      {/* Footer mark */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, ease: EASE, delay: 0.4 }}
        className={`px-16 pb-6 text-[10px] tracking-[0.3em] uppercase ${meta} flex items-center justify-between relative z-10`}
      >
        <span>An operating system for public assets</span>
        <span>assetstack.io</span>
      </motion.div>
    </div>
  );
}

// Shared motion presets for slide internals — keep rhythm consistent
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
};