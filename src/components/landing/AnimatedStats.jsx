import React, { useEffect, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

function Counter({ value, suffix = '', prefix = '', duration = 2000 }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const startTime = Date.now();
    const tick = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * value));
      if (progress < 1) requestAnimationFrame(tick);
      else setCount(value);
    };
    tick();
  }, [isInView, value, duration]);

  return (
    <span ref={ref}>
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  );
}

const stats = [
  { value: 4800000, prefix: '$', label: 'Preventable exposure surfaced', sub: 'Across industrial and public assets' },
  { value: 94, suffix: '%', label: 'AI detection accuracy', sub: 'On verified condition reports' },
  { value: 68000, suffix: '+', label: 'Assets modelled', sub: 'Vehicles, mines, plants, rail, utilities' },
  { value: 73, suffix: '%', label: 'Reduction in unplanned downtime', sub: 'Average across deployed sites' },
];

export default function AnimatedStats() {
  return (
    <section className="py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <div className="text-4xl md:text-6xl font-black bg-gradient-to-br from-slate-900 to-slate-600 bg-clip-text text-transparent">
                <Counter value={s.value} prefix={s.prefix} suffix={s.suffix} />
              </div>
              <div className="mt-2 text-sm font-bold text-slate-900">{s.label}</div>
              <div className="text-xs text-slate-500 mt-0.5">{s.sub}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}