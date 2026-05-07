import React, { useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { useRef, useEffect } from 'react';
import { Activity, ShieldCheck, Brain, TrendingDown } from 'lucide-react';

function CountUp({ value, prefix = '', suffix = '', duration = 1.6 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const start = performance.now();
    const startVal = 0;
    const tick = (t) => {
      const p = Math.min(1, (t - start) / (duration * 1000));
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(startVal + (value - startVal) * eased));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, value, duration]);

  return (
    <span ref={ref} className="tabular-nums">
      {prefix}{n.toLocaleString()}{suffix}
    </span>
  );
}

export default function LiveCounters() {
  // Demo numbers — illustrative capability stats, not from live data
  const items = [
    { icon: Activity, label: 'Demo assets monitored', value: 1432, suffix: '+' },
    { icon: Brain, label: 'AI predictions run', value: 2840, suffix: '+' },
    { icon: ShieldCheck, label: 'Verified savings (k)', value: 184, prefix: '$', suffix: 'k' },
    { icon: TrendingDown, label: 'Backlog tracked (k)', value: 421, prefix: '$', suffix: 'k' },
  ];

  return (
    <section className="py-12 bg-gradient-to-b from-white to-slate-50 border-y border-slate-100">
      <div className="max-w-[1280px] mx-auto px-5 md:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {items.map((it, i) => {
            const Icon = it.icon;
            return (
              <motion.div
                key={it.label}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, delay: i * 0.06 }}
                className="rounded-xl border border-slate-200 bg-white/70 backdrop-blur p-4 md:p-5 elevation-1"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                    <span className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold">Demo</span>
                  </div>
                </div>
                <div className="text-2xl md:text-3xl font-bold text-slate-900 leading-none">
                  <CountUp value={it.value} prefix={it.prefix || ''} suffix={it.suffix || ''} />
                </div>
                <div className="text-[11px] text-slate-500 font-medium mt-1.5">{it.label}</div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}