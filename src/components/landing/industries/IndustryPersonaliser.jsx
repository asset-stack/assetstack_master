import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check, Sparkles } from 'lucide-react';
import { INDUSTRIES, STORAGE_KEY } from './industriesData';

/**
 * "I work in…" dropdown — persists choice in localStorage and scrolls
 * to the matching industry section. Pure UI, no business logic.
 */
export default function IndustryPersonaliser({ onSelect }) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const ref = useRef(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const match = INDUSTRIES.find((i) => i.slug === stored);
        if (match) setSelected(match);
      }
    } catch {
      // localStorage unavailable — silent fallback
    }
  }, []);

  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const handleSelect = (ind) => {
    setSelected(ind);
    setOpen(false);
    try {
      localStorage.setItem(STORAGE_KEY, ind.slug);
    } catch {
      // ignore
    }
    onSelect?.(ind);

    // Scroll to the industry section
    requestAnimationFrame(() => {
      const el = document.getElementById(ind.slug);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  return (
    <div className="relative inline-block" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-slate-200 bg-white hover:border-primary/30 hover:bg-primary/[0.03] transition-all elevation-1"
      >
        <Sparkles className="w-3.5 h-3.5 text-primary" />
        <span className="text-[12px] font-medium text-slate-600">I work in</span>
        <span className="text-[13px] font-semibold text-slate-900">
          {selected ? selected.shortLabel : 'Choose your industry'}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-72 rounded-xl border border-slate-200 bg-white elevation-3 p-1.5 z-50"
          >
            {INDUSTRIES.map((ind) => {
              const Icon = ind.icon;
              const isActive = selected?.slug === ind.slug;
              return (
                <button
                  key={ind.slug}
                  onClick={() => handleSelect(ind)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left transition-colors ${
                    isActive ? 'bg-primary/5' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className={`w-7 h-7 rounded-md flex items-center justify-center ${
                    isActive ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span className={`text-[13px] flex-1 ${isActive ? 'font-semibold text-slate-900' : 'font-medium text-slate-700'}`}>
                    {ind.shortLabel}
                  </span>
                  {isActive && <Check className="w-3.5 h-3.5 text-primary" />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}