import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { INDUSTRIES } from './industriesData';

/**
 * Sticky left-rail navigation — highlights the in-view industry section
 * using IntersectionObserver. Hidden on mobile.
 */
export default function IndustryScrollSpy() {
  const [activeSlug, setActiveSlug] = useState(INDUSTRIES[0].slug);

  useEffect(() => {
    const sections = INDUSTRIES.map((i) => document.getElementById(i.slug)).filter(Boolean);
    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Pick the entry closest to the top of the viewport that is intersecting
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveSlug(visible[0].target.id);
      },
      {
        // Trigger when section is roughly centered
        rootMargin: '-30% 0px -55% 0px',
        threshold: 0,
      }
    );

    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  const handleClick = (slug) => {
    const el = document.getElementById(slug);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <aside className="hidden xl:block fixed left-6 top-1/2 -translate-y-1/2 z-30">
      <div className="flex flex-col gap-1 p-2 rounded-2xl border border-slate-200/70 bg-white/80 backdrop-blur-xl elevation-2">
        <div className="px-2 py-1.5 text-[9px] font-semibold uppercase tracking-[0.16em] text-slate-400">
          Industries
        </div>
        {INDUSTRIES.map((ind) => {
          const Icon = ind.icon;
          const isActive = activeSlug === ind.slug;
          return (
            <button
              key={ind.slug}
              onClick={() => handleClick(ind.slug)}
              className="group relative flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-slate-50 transition-colors text-left"
            >
              <div className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 transition-colors ${
                isActive ? 'bg-primary text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'
              }`}>
                <Icon className="w-3.5 h-3.5" />
              </div>
              <span className={`text-[12px] font-medium transition-colors w-[110px] truncate ${
                isActive ? 'text-slate-900 font-semibold' : 'text-slate-600'
              }`}>
                {ind.shortLabel}
              </span>
              {isActive && (
                <motion.div
                  layoutId="scrollspy-indicator"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full bg-primary"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
                />
              )}
            </button>
          );
        })}
      </div>
    </aside>
  );
}