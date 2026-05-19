import React, { useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';

const IMG1 = 'https://media.base44.com/images/public/69c1f3c7f9a453fedbd46eba/78b1f1b84_1.png';
const IMG2 = 'https://media.base44.com/images/public/69c1f3c7f9a453fedbd46eba/c85a8fdda_2.png';
const RADIUS = 240;

function HeroBanner({ pos }) {
  const maskStyle = pos
    ? {
        maskImage: `radial-gradient(circle ${RADIUS}px at ${pos.x}px ${pos.y}px, transparent 0%, transparent 45%, black 85%, black 100%)`,
        WebkitMaskImage: `radial-gradient(circle ${RADIUS}px at ${pos.x}px ${pos.y}px, transparent 0%, transparent 45%, black 85%, black 100%)`,
      }
    : {};

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', zIndex: 1 }}>
      <img src={IMG1} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
      <img
        src={IMG2}
        alt=""
        style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
          imageRendering: 'pixelated',
          transition: 'mask-image 0.05s, -webkit-mask-image 0.05s',
          ...maskStyle,
        }}
      />
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,30,0.35)', pointerEvents: 'none' }} />
    </div>
  );
}

export default function SisterHero() {
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
              style={{ fontSize: 'clamp(3.5rem, 10vw, 9rem)', color: '#ffffff', letterSpacing: '-0.02em' }}
            >
              AI Infrastructure<br />Intelligence<br />Platform
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
              AssetStack connects inspections, digital twins, sensor data and machine learning to predict failures and optimise maintenance.
            </p>
            <div className="flex gap-4">
              <a href="#contact">
                <button
                  className="px-8 py-3 text-sm font-bold uppercase tracking-widest border-2 transition-all hover:opacity-80"
                  style={{ background: '#ffffff', color: '#2200FF', borderColor: '#ffffff' }}
                >
                  Book a Demo
                </button>
              </a>
              <a href="#tour">
                <button
                  className="px-8 py-3 text-sm font-bold uppercase tracking-widest border-2 transition-all hover:bg-opacity-10"
                  style={{ background: 'transparent', color: '#ffffff', borderColor: 'rgba(255,255,255,0.5)' }}
                >
                  Platform ↗
                </button>
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}