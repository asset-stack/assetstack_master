import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Lock } from 'lucide-react';

export default function SecurityHero() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 p-6 md:p-8 text-white mb-6"
    >
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
      <div className="relative">
        <div className="flex items-center gap-2 mb-3">
          <Lock className="w-5 h-5" />
          <span className="text-xs font-bold uppercase tracking-wider bg-white/15 px-2 py-1 rounded-full">
            Security Center
          </span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold mb-2 flex items-center gap-2">
          <ShieldCheck className="w-7 h-7" />
          Trust Through Transparency
        </h1>
        <p className="text-white/80 max-w-2xl text-sm md:text-base">
          Every action is logged. Every privilege is gated. Every prediction is auditable.
          This is the security backbone enterprise buyers actually require.
        </p>
      </div>
    </motion.div>
  );
}