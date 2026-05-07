import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Radio, Brain, MessageSquare, ShieldCheck, ArrowRight } from 'lucide-react';

const STEPS = [
  {
    id: 'sense',
    icon: Radio,
    label: 'Sense',
    title: 'Capture condition from every signal',
    detail: 'Sensors, photos, scans and inspection rounds feed AssetStack continuously. Every reading is timestamped, signed and tied to an asset record.',
    sources: ['IoT sensors (24/7 streams)', 'Photo & LiDAR scans', 'Field inspection rounds', 'CSV / Excel imports'],
    component: 'sensorConditionLink + analyzeScanCondition',
  },
  {
    id: 'predict',
    icon: Brain,
    label: 'Predict',
    title: 'Score risk and remaining life',
    detail: 'Ensemble ML models — anomaly detection, RUL regression, failure classification — produce a transparent risk score with confidence bounds for every asset.',
    sources: ['Anomaly detection (Isolation Forest)', 'RUL regression (LSTM autoencoder)', 'Failure classification', 'Climate-adjusted lifespan'],
    component: 'predictAssetFailures + advancedPrediction',
  },
  {
    id: 'decide',
    icon: MessageSquare,
    label: 'Decide',
    title: 'AssetMind recommends the next move',
    detail: 'AssetMind reasons over your full portfolio — funding constraints, climate risk, criticality — and proposes prioritised work orders, capex plans or compliance actions.',
    sources: ['AssetMind portfolio reasoning', 'Funding optimiser', 'Cohort variance flags', 'Defect cascade prediction'],
    component: 'assetMindAggregate + funding optimiser',
  },
  {
    id: 'verify',
    icon: ShieldCheck,
    label: 'Verify',
    title: 'Prove every avoided breakdown',
    detail: 'Once action is taken, the Savings Ledger captures predicted-failure cost, intervention cost and verified savings — with evidence URLs and human sign-off.',
    sources: ['Savings ledger entries', 'Audit log per action', 'Prediction accuracy tracker', 'Evidence pack export'],
    component: 'SavingsLedgerEntry + writeAuditLog',
  },
];

export default function MechanismSection() {
  const [active, setActive] = useState(STEPS[0]);
  const ActiveIcon = active.icon;

  return (
    <section id="mechanism" className="py-20 md:py-28 bg-slate-950 text-white relative overflow-hidden">
      {/* subtle grid */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: 'linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)',
          backgroundSize: '48px 48px',
          maskImage: 'radial-gradient(ellipse at center, black 40%, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, black 40%, transparent 80%)',
        }}
      />

      <div className="relative max-w-[1280px] mx-auto px-5 md:px-8">
        <div className="text-center mb-12">
          <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary/90">The mechanism</span>
          <h2 className="mt-3 text-3xl md:text-5xl font-semibold tracking-[-0.03em] leading-[1.05] text-balance">
            How AssetStack actually <span className="font-serif italic font-medium text-blue-300">works.</span>
          </h2>
          <p className="mt-3 text-[15px] md:text-base text-slate-400 max-w-xl mx-auto">
            No black box. Click each step to see the real components doing the work.
          </p>
        </div>

        {/* Step rail */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 mb-8 md:mb-10">
          {STEPS.map((s, i) => {
            const SIcon = s.icon;
            const selected = active.id === s.id;
            return (
              <button
                key={s.id}
                onClick={() => setActive(s)}
                className={`relative text-left p-4 md:p-5 rounded-xl border transition-all group ${
                  selected
                    ? 'border-primary/60 bg-primary/10 elevation-2'
                    : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between mb-2.5">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                    selected ? 'bg-primary text-white' : 'bg-white/10 text-slate-300'
                  }`}>
                    <SIcon className="w-4 h-4" />
                  </div>
                  <span className={`text-[11px] font-bold tabular-nums ${selected ? 'text-primary' : 'text-slate-500'}`}>0{i + 1}</span>
                </div>
                <div className="text-[14px] font-bold">{s.label}</div>
                <div className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{s.title}</div>
                {i < STEPS.length - 1 && (
                  <ArrowRight className="hidden md:block absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 z-10" />
                )}
              </button>
            );
          })}
        </div>

        {/* Active detail */}
        <AnimatePresence mode="wait">
          <motion.div
            key={active.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35 }}
            className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-sm p-6 md:p-10 grid lg:grid-cols-[1fr_1.2fr] gap-8"
          >
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-blue-400 flex items-center justify-center shadow-lg shadow-primary/30">
                  <ActiveIcon className="w-5 h-5 text-white" />
                </div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">Step · {active.label}</div>
              </div>
              <h3 className="text-2xl md:text-3xl font-semibold tracking-tight leading-tight mb-3 text-balance">
                {active.title}
              </h3>
              <p className="text-[14px] text-slate-300 leading-relaxed">{active.detail}</p>
              <div className="mt-5 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] font-mono text-slate-300">{active.component}</span>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-2">
              {active.sources.map((src, i) => (
                <motion.div
                  key={src}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="rounded-lg border border-white/10 bg-white/[0.03] p-3.5 flex items-start gap-2.5"
                >
                  <div className="w-5 h-5 rounded-md bg-primary/20 text-primary flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                    {i + 1}
                  </div>
                  <span className="text-[13px] text-slate-200 leading-snug font-medium">{src}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}