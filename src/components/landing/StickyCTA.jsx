import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, X } from 'lucide-react';

export default function StickyCTA() {
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const scrolled = window.scrollY;
      const total = document.documentElement.scrollHeight - window.innerHeight;
      const pct = total > 0 ? scrolled / total : 0;
      setShow(pct > 0.35 && pct < 0.92);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (dismissed) return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="fixed bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 z-40 px-4 w-full max-w-md md:max-w-lg pointer-events-none"
        >
          <div className="pointer-events-auto rounded-full bg-slate-900 text-white shadow-2xl shadow-slate-900/30 px-5 py-2.5 flex items-center gap-3 border border-white/10">
            <span className="hidden sm:inline text-[12px] font-medium text-slate-300">See AssetStack on your data</span>
            <span className="sm:hidden text-[12px] font-medium text-slate-300">Talk to us</span>
            <a
              href="#contact"
              className="ml-auto inline-flex items-center gap-1.5 bg-white text-slate-900 px-3.5 py-1.5 rounded-full text-[12px] font-bold hover:bg-slate-100 transition-colors"
            >
              Book demo <ArrowRight className="w-3 h-3" />
            </a>
            <button
              onClick={() => setDismissed(true)}
              aria-label="Dismiss"
              className="text-slate-400 hover:text-white transition-colors p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}