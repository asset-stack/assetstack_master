import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';

// Narrow image + headline block: "Everything inspectors notice, nothing more."
export default function InspectorPreviewBlock() {
  return (
    <section className="bg-slate-50 py-20 lg:py-28">
      <div className="max-w-6xl mx-auto px-6 lg:px-8 grid lg:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-900 leading-[1.05] mb-5">
            Everything inspectors notice,
            <br />
            <span className="text-indigo-600">nothing more.</span>
          </h2>
          <p className="text-slate-600 text-base lg:text-lg mb-6 max-w-md">
            Findings calibrated to inspector judgement — no noise, no hallucinated defects, just what matters.
          </p>
          <ul className="space-y-2.5">
            {['Trained on real inspection photos', 'Severity matched to engineering grading', 'Every finding traceable to its photo'].map((c) => (
              <li key={c} className="flex items-center gap-2.5 text-sm text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                {c}
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="relative rounded-2xl overflow-hidden aspect-[5/4] elevation-3 bg-slate-900"
        >
          <img
            src="https://images.unsplash.com/photo-1581094288338-2314dddb7ece?w=900&q=80"
            alt="Inspector field workflow"
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />
        </motion.div>
      </div>
    </section>
  );
}