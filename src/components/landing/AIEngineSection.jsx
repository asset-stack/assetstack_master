import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';

const CAPABILITIES = [
  'Anomaly detection',
  'Failure classification',
  'Reliability modelling',
  'Remaining useful life prediction',
];

export default function AIEngineSection() {
  return (
    <section className="bg-white py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="relative rounded-2xl overflow-hidden aspect-[4/3] lg:aspect-[5/4] elevation-3"
          >
            <img
              src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&q=80"
              alt="AI engine visualisation"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-900/40 via-transparent to-transparent" />
          </motion.div>

          {/* Copy */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-indigo-600 mb-3">
              AI Technology
            </p>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-900 leading-[1.05] mb-5">
              AI Engine for Infrastructure Intelligence
            </h2>
            <p className="text-slate-600 text-base lg:text-lg leading-relaxed mb-8 max-w-xl">
              AssetStack's predictive engine combines machine learning models to analyse inspection data, sensor telemetry and maintenance history.
            </p>

            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {CAPABILITIES.map((c) => (
                <li key={c} className="flex items-center gap-2.5 text-slate-800">
                  <span className="w-7 h-7 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                  </span>
                  <span className="text-sm font-medium">{c}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
}