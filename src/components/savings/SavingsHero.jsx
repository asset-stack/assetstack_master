import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, DollarSign } from 'lucide-react';

export default function SavingsHero() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 p-6 md:p-8 text-white mb-6"
    >
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="relative">
        <div className="flex items-center gap-2 mb-3">
          <ShieldCheck className="w-5 h-5" />
          <span className="text-xs font-bold uppercase tracking-wider bg-white/20 px-2 py-1 rounded-full">
            Verified Savings Ledger
          </span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold mb-2 flex items-center gap-2">
          <DollarSign className="w-7 h-7" />
          Prove the ROI. Every Time.
        </h1>
        <p className="text-white/90 max-w-2xl text-sm md:text-base">
          Every prediction → every intervention → every dollar saved, audited end-to-end.
          The defensible report enterprise buyers actually pay for.
        </p>
      </div>
    </motion.div>
  );
}