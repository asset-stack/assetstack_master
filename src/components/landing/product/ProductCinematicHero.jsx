import React, { useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';

const IMG = 'https://media.base44.com/images/public/6a0a6a5d4d043b0e41a16d90/7155f054d_australia-melbourne-seafarers-bridge-2026-03-26-11-27-12-utc.jpg';
const RADIUS = 240;

function HeroBanner({ pos }) {
  // Outside the lens: full-colour building.
  // Inside the lens: blueprint-style tinted reveal — same effect language as the sister hero
  // but using a single image (no second asset). This keeps the "interactive filter"
  // feel without needing a second processed render of the photo.
  const maskStyle = pos
    ? {
        maskImage: `radial-gradient(circle ${RADIUS}px at ${pos.x}px ${pos.y}px, black 0%, black 45%, transparent 85%, transparent 100%)`,
        WebkitMaskImage: `radial-gradient(circle ${RADIUS}px at ${pos.x}px ${pos.y}px, black 0%, black 45%, transparent 85%, transparent 100%)`,
      }
    : { opacity: 0 };

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', zIndex: 1 }}>
      {/* Base image */}
      <img
        src={IMG}
        alt=""
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
      />
      {/* Lens overlay — tinted blueprint variant of the same image */}
      <img
        src={IMG}
        alt=""
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          filter: 'grayscale(1) contrast(1.15) brightness(0.85) sepia(0.6) hue-rotate(190deg) saturate(3)',
          transition: 'mask-image 0.05s, -webkit-mask-image 0.05s, opacity 0.2s',
          ...maskStyle,
        }}
      />
      {/* Darkening wash for legibility */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(to bottom, rgba(5,5,26,0.55) 0%, rgba(5,5,26,0.35) 40%, rgba(5,5,26,0.75) 100%)',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
}

export default function ProductCinematicHero() {
  const sectionRef = useRef(null);
  const [pos, setPos] = useState(null);

  const onMouseMove = useCallback((e) => {
    const rect = sectionRef.current?.getBoundingClientRect();
    if (!rect) return;
    setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }, []);

  const onMouseLeave = useCallback(() => setPos(null), []);

  return (
    <section
      ref={sectionRef}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      className="relative min-h-screen overflow-hidden flex flex-col"
      style={{ background: '#05051a' }}
    >
      <div className="absolute inset-0 z-0">
        <HeroBanner pos={pos} />
      </div>

      <div
        className="relative z-10 flex-1 flex flex-col justify-end max-w-[1400px] mx-auto w-full px-6 lg:px-12 pb-16 pt-40"
        style={{ pointerEvents: 'none' }}
      >
        <div style={{ pointerEvents: 'auto' }}>
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          >
            <h1
              className="font-black leading-none tracking-tight"
              style={{
                fontSize: 'clamp(3.5rem, 10vw, 9rem)',
                color: '#ffffff',
                letterSpacing: '-0.02em',
              }}
            >
              The AssetStack<br />Platform.
            </h1>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="mt-12 flex flex-col sm:flex-row gap-6 items-start justify-between"
          >
            <p
              className="text-sm uppercase tracking-widest font-medium max-w-xs leading-relaxed"
              style={{ color: 'rgba(255,255,255,0.75)' }}
            >
              Inspections, digital twins, IoT data and machine learning — unified into one intelligence platform for critical infrastructure.
            </p>
            <div className="flex gap-4">
              <a href="#modules">
                <button
                  className="px-8 py-3 text-sm font-bold uppercase tracking-widest border-2 transition-all hover:opacity-80"
                  style={{ background: '#ffffff', color: '#2200FF', borderColor: '#ffffff' }}
                >
                  Explore Modules
                </button>
              </a>
              <a href="/Contact">
                <button
                  className="px-8 py-3 text-sm font-bold uppercase tracking-widest border-2 transition-all hover:bg-white/10"
                  style={{ background: 'transparent', color: '#ffffff', borderColor: 'rgba(255,255,255,0.5)' }}
                >
                  Book a Demo ↗
                </button>
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}