import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Brain, ShieldCheck, Eye } from 'lucide-react';
import ScanDemo from './demos/ScanDemo';
import PredictionDemo from './demos/PredictionDemo';
import SavingsDemo from './demos/SavingsDemo';
import AuditDemo from './demos/AuditDemo';

const TABS = [
  { id: 'scan', label: 'AI Scan', icon: Camera, desc: 'Detect defects from photos with bounding boxes', component: ScanDemo },
  { id: 'predict', label: 'Failure Prediction', icon: Brain, desc: 'Forecast equipment failures weeks in advance', component: PredictionDemo },
  { id: 'savings', label: 'Verified Savings', icon: ShieldCheck, desc: 'Audited ROI ledger your CFO can trust', component: SavingsDemo },
  { id: 'audit', label: 'Audit Trail', icon: Eye, desc: 'Immutable log of every privileged action', component: AuditDemo },
];

export default function LiveDemoSection() {
  const [active, setActive] = useState('scan');
  const ActiveDemo = TABS.find(t => t.id === active).component;
  const activeMeta = TABS.find(t => t.id === active);

  return (
    <section id="demo" className="py-20 md:py-28 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-white via-indigo-50/30 to-white -z-10" />

      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">Live demo</span>
          <h2 className="mt-3 text-4xl md:text-5xl font-black tracking-tight text-slate-900">
            Try it. Right here. Right now.
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Four real workflows running on sample data. No signup, no sales call.
          </p>
        </motion.div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {TABS.map((t) => {
            const Icon = t.icon;
            const isActive = active === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActive(t.id)}
                className={`relative px-4 py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center gap-2 ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20'
                    : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {t.label}
              </button>
            );
          })}
        </div>

        <p className="text-center text-sm text-slate-500 mb-8 -mt-4">{activeMeta.desc}</p>

        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
          >
            <ActiveDemo />
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}