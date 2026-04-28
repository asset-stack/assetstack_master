import React from 'react';
import { FlaskConical, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function BetaHero() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-6 md:p-8 text-white mb-6"
    >
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="relative">
        <div className="flex items-center gap-2 mb-3">
          <FlaskConical className="w-5 h-5" />
          <span className="text-xs font-bold uppercase tracking-wider bg-white/20 px-2 py-1 rounded-full">
            Beta Features
          </span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold mb-2 flex items-center gap-2">
          <Sparkles className="w-7 h-7" />
          The Accuracy Engine
        </h1>
        <p className="text-white/90 max-w-2xl text-sm md:text-base">
          Foundational tools to make AssetStack the most accurate, verifiable asset platform in the world.
          Every prediction tracked. Every outcome verified. Every model held accountable.
        </p>
      </div>
    </motion.div>
  );
}