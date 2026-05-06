import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BrainCircuit, GitBranch, Radar, ShieldCheck, Sparkles } from 'lucide-react';

const CAPABILITIES = [
  {
    icon: Sparkles,
    title: 'Next Best Action Engine',
    label: 'Decide',
    text: 'Continuously ranks the most valuable maintenance, safety, and inspection action across your whole asset base.',
    bullets: ['ROI-weighted action scoring', 'Urgency and reversibility logic', 'Technician-ready dispatch output'],
    score: 96,
  },
  {
    icon: GitBranch,
    title: 'Physical Asset Digital Twin',
    label: 'Model',
    text: 'Connects condition photos, sensor readings, work history, location, and risk into one living operational graph.',
    bullets: ['Asset hierarchy and network mapping', '3D scan and photo evidence', 'Cross-site benchmarking'],
    score: 91,
  },
  {
    icon: Radar,
    title: 'Weak Signal Amplifier',
    label: 'Detect',
    text: 'Finds subtle degradation patterns before they are obvious to humans or visible in standard dashboards.',
    bullets: ['Anomaly detection', 'Trend acceleration alerts', 'Failure probability windows'],
    score: 88,
  },
  {
    icon: BrainCircuit,
    title: 'AI Operations Copilot',
    label: 'Act',
    text: 'Turns raw risk into checklists, parts, technicians, evidence packs, and work orders without manual triage.',
    bullets: ['Auto work orders', 'Field-ready checklists', 'Manager escalation paths'],
    score: 94,
  },
  {
    icon: ShieldCheck,
    title: 'Accountable AI Ledger',
    label: 'Prove',
    text: 'Every prediction, review, decision, and savings claim is traceable for boards, insurers, auditors, and regulators.',
    bullets: ['Immutable audit trail', 'Verified savings ledger', 'Model accuracy tracking'],
    score: 100,
  },
];

export default function FlagshipCapabilities() {
  const [active, setActive] = useState(CAPABILITIES[0]);
  const Icon = active.icon;

  return (
    <section className="py-20 md:py-28 bg-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,hsl(var(--primary)/0.12),transparent_36%)]" />
      <div className="max-w-7xl mx-auto px-4 md:px-6 relative">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Flagship systems</span>
          <h2 className="mt-3 text-4xl md:text-6xl font-black tracking-tight text-slate-950">
            Not modules. Category-defining systems.
          </h2>
          <p className="mt-4 text-lg text-slate-600">A FYYSE-style strategic product story, rebuilt for real-world assets and operational decisions.</p>
        </motion.div>

        <div className="grid lg:grid-cols-[340px_1fr] gap-6">
          <div className="space-y-2">
            {CAPABILITIES.map((cap) => {
              const TabIcon = cap.icon;
              const selected = cap.title === active.title;
              return (
                <button
                  key={cap.title}
                  onClick={() => setActive(cap)}
                  className={`w-full flex items-center gap-3 rounded-2xl px-4 py-4 text-left transition-all ${selected ? 'bg-primary text-white shadow-xl shadow-primary/25' : 'bg-slate-50 text-slate-700 hover:bg-blue-50'}`}
                >
                  <TabIcon className="w-5 h-5 shrink-0" />
                  <div>
                    <div className="text-xs font-black uppercase tracking-wider opacity-70">{cap.label}</div>
                    <div className="font-bold">{cap.title}</div>
                  </div>
                </button>
              );
            })}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={active.title}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.35 }}
              className="rounded-3xl bg-slate-950 text-white border border-primary/20 shadow-2xl shadow-slate-900/15 overflow-hidden"
            >
              <div className="grid md:grid-cols-[1fr_280px] min-h-[430px]">
                <div className="p-7 md:p-10 relative overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,hsl(var(--primary)/0.32),transparent_34%)]" />
                  <div className="relative">
                    <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30 mb-7">
                      <Icon className="w-7 h-7" />
                    </div>
                    <h3 className="text-3xl md:text-5xl font-black tracking-tight">{active.title}</h3>
                    <p className="mt-5 text-lg text-slate-300 leading-relaxed max-w-2xl">{active.text}</p>
                    <div className="mt-8 grid sm:grid-cols-3 gap-3">
                      {active.bullets.map((bullet) => (
                        <div key={bullet} className="rounded-2xl bg-white/8 border border-white/10 p-4 text-sm font-semibold text-blue-100">
                          {bullet}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="p-7 bg-primary/10 border-l border-white/10 flex flex-col justify-center">
                  <div className="text-sm font-bold text-blue-200">Decision confidence</div>
                  <div className="mt-4 text-7xl font-black text-white">{active.score}</div>
                  <div className="mt-4 h-3 rounded-full bg-white/10 overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${active.score}%` }} className="h-full bg-primary rounded-full" />
                  </div>
                  <p className="mt-5 text-sm text-slate-300">Ranked by risk, ROI, evidence quality, and operational urgency.</p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}