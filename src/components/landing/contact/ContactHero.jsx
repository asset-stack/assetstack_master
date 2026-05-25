import React from 'react';
import { motion } from 'framer-motion';

export default function ContactHero() {
  return (
    <section
      className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden"
      style={{ backgroundColor: '#0b1442' }}
    >
      {/* Ambient background */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            'radial-gradient(circle at 20% 20%, rgba(99,102,241,0.5) 0%, transparent 50%), radial-gradient(circle at 80% 60%, rgba(56,189,248,0.35) 0%, transparent 55%)',
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0b1442]" />

      <div className="relative max-w-[1100px] mx-auto px-5 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl"
        >
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/60">
            Contact
          </span>
          <h1 className="mt-4 text-4xl md:text-6xl font-semibold tracking-[-0.03em] leading-[1.05] text-white text-balance">
            Talk to the team behind{' '}
            <span className="font-serif italic font-medium text-white/90">AssetStack.</span>
          </h1>
          <p className="mt-5 text-[15px] md:text-lg text-white/70 leading-relaxed max-w-2xl">
            Book a working demo, ask a question, or scope a pilot. We typically reply within one business day.
          </p>
        </motion.div>
      </div>
    </section>
  );
}