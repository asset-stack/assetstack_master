import React from 'react';
import { motion } from 'framer-motion';

/**
 * Standard slide layout shell. Provides consistent kicker, title, and content area.
 */
export default function SlideShell({
  kicker,
  title,
  subtitle,
  children,
  variant = 'light', // 'light' | 'dark' | 'gradient'
  className = '',
}) {
  const bgClass =
    variant === 'dark'
      ? 'bg-slate-950 text-white'
      : variant === 'gradient'
      ? 'bg-gradient-to-br from-indigo-950 via-slate-950 to-slate-950 text-white'
      : 'bg-white text-slate-900';

  return (
    <div className={`w-full h-full flex flex-col ${bgClass} ${className}`}>
      <div className="flex-1 flex flex-col px-8 md:px-16 lg:px-24 py-10 md:py-14 overflow-hidden">
        {kicker && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="flex items-center gap-3 mb-6"
          >
            <div className="h-px w-8 bg-indigo-500" />
            <span className="text-[11px] font-bold tracking-[0.2em] text-indigo-500 uppercase">
              {kicker}
            </span>
          </motion.div>
        )}
        {title && (
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.05] mb-4 text-balance"
          >
            {title}
          </motion.h1>
        )}
        {subtitle && (
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className={`text-base md:text-lg max-w-3xl mb-8 ${
              variant === 'light' ? 'text-slate-600' : 'text-slate-400'
            }`}
          >
            {subtitle}
          </motion.p>
        )}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex-1 min-h-0"
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
}