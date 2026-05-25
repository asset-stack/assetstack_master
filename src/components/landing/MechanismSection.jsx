import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScanLine, ListTree, Wrench, CalendarClock, Banknote, ArrowRight } from 'lucide-react';
import MechanismBackground from './MechanismBackground';

const STEPS = [
  {
    id: 'scan',
    icon: ScanLine,
    label: 'Scan',
    title: 'Your asset and create its digital twin',
    detail: 'Capture every asset with LiDAR scans, photos and field inspections. AssetStack builds a high-fidelity digital twin tied to a single asset record.',
    sources: ['LiDAR & photogrammetry scans', 'Field inspection rounds', 'Photo & condition capture', 'IoT sensor streams'],
    component: 'analyzeScanCondition + sensorConditionLink',
  },
  {
    id: 'create',
    icon: ListTree,
    label: 'Create',
    title: 'Your asset register',
    detail: 'Every scanned and inspected asset is structured into a clean, hierarchical register — by location, type, criticality — ready for audit and reporting.',
    sources: ['Hierarchical asset tree', 'Location & site mapping', 'Bulk CSV / Excel imports', 'Asset attribute enrichment'],
    component: 'importAssetsToLocation + assetMindAggregate',
  },
  {
    id: 'manage',
    icon: Wrench,
    label: 'Manage',
    title: 'Your maintenance schedule and implementation',
    detail: 'Preventive, predictive and corrective work orders are generated, assigned and tracked through to completion — with evidence captured at every step.',
    sources: ['Auto-generated work orders', 'Preventive maintenance plans', 'Technician assignment & tracking', 'Mobile field execution'],
    component: 'autoGenerateWorkOrder + aiScheduleMaintenance',
  },
  {
    id: 'develop',
    icon: CalendarClock,
    label: 'Develop',
    title: 'Your assets lifecycle works plan',
    detail: 'Score risk, remaining life and renewal year for every asset, then sequence interventions into a multi-year lifecycle works plan.',
    sources: ['RUL & failure prediction', 'Capital renewal forecasting', 'Defect cascade modelling', 'Multi-year works programming'],
    component: 'predictAssetFailures + defectCascadePredict',
  },
  {
    id: 'control',
    icon: Banknote,
    label: 'Control',
    title: 'Your financial position, budget, finance modelling',
    detail: 'Tie every asset to dollars — current valuation, depreciation, budget envelope and funding scenarios — to optimise capital spend with confidence.',
    sources: ['Asset valuation & depreciation', 'Budget vs actuals tracking', 'Funding optimiser scenarios', 'Verified savings ledger'],
    component: 'assetMindAggregate + writeAuditLog',
  },
];

export default function MechanismSection() {
  const [active, setActive] = useState(STEPS[0]);
  const ActiveIcon = active.icon;

  return (
    <section id="mechanism" className="py-20 md:py-28 bg-[#1925aa] text-white relative overflow-hidden">
      <MechanismBackground />

      <div className="relative z-10 max-w-[1280px] mx-auto px-5 md:px-8">
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
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 md:gap-3 mb-8 md:mb-10">
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
                  <span className={`text-[11px] font-bold tabular-nums ${selected ? 'text-primary' : 'text-slate-500'}`}>{String(i + 1).padStart(2, '0')}</span>
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