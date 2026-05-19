import React, { useState, useRef, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';

function CountUp({ value, suffix = '', duration = 1.6 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const start = performance.now();
    const tick = (t) => {
      const p = Math.min(1, (t - start) / (duration * 1000));
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(value * eased));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, value, duration]);

  return <span ref={ref} className="tabular-nums">{n}{suffix}</span>;
}

const STATS = [
  { value: 90, suffix: '%', label: 'Prediction Accuracy' },
  { value: 32, suffix: '%', label: 'Maintenance Cost Reduction' },
  { value: 450, suffix: '+', label: 'Assets Monitored' },
  { value: 0, suffix: '24/7', label: 'Real-Time Monitoring', literal: true },
];

export default function SisterStats() {
  return (
    <section className="bg-white py-20 lg:py-24 border-y border-slate-100">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-6">
          {STATS.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="text-center md:text-left"
            >
              <div className="text-5xl md:text-6xl lg:text-7xl font-bold text-indigo-600 tracking-tight leading-none mb-3">
                {s.literal ? s.suffix : <CountUp value={s.value} suffix={s.suffix} />}
              </div>
              <div className="text-sm md:text-base text-slate-600 font-medium">
                {s.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}