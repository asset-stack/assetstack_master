import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, TrendingDown, TrendingUp, Sparkles, Zap } from 'lucide-react';
import SlideShell from './SlideShell';

/* ============================================================
   BIG NUMBER · Reynolds-style single-stat reveal
   The "wow moment" slide pattern used by Steve Jobs & TED talks
   ============================================================ */
export const SlideBigStat = () => (
  <div className="w-full h-full bg-slate-950 text-white flex flex-col items-center justify-center px-12 relative overflow-hidden">
    <div className="absolute inset-0 bg-gradient-radial from-indigo-950/40 via-slate-950 to-slate-950" />
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative text-center"
    >
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-[11px] font-bold tracking-[0.4em] text-indigo-300 uppercase mb-10"
      >
        Industry reality · 2026
      </motion.div>
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="text-[clamp(7rem,18vw,16rem)] font-bold leading-none tracking-tighter tabular-nums text-balance"
      >
        <span className="bg-gradient-to-br from-white via-indigo-200 to-indigo-400 bg-clip-text text-transparent">
          82<span className="text-indigo-400">%</span>
        </span>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="text-2xl md:text-3xl text-slate-300 max-w-3xl mx-auto mt-8 leading-tight text-balance"
      >
        of asset failures could have been predicted
        <span className="text-white"> — and weren't.</span>
      </motion.div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.3 }}
        className="text-xs text-slate-500 mt-10"
      >
        ARC Advisory Group · 2025 Predictive Maintenance Survey
      </motion.div>
    </motion.div>
  </div>
);

/* ============================================================
   BEFORE / AFTER · Duarte's signature "what is / what could be"
   contrast pattern. The whole presentation hinges on this slide.
   ============================================================ */
export const SlideBeforeAfter = () => {
  const rows = [
    ['Asset register', 'Spreadsheet, 6 versions', 'Single live record · 1,247 assets'],
    ['Failure visibility', 'After it breaks', '30–90 days ahead, ranked'],
    ['Work orders', 'Typed by dispatcher', 'Auto-drafted by AssetMind'],
    ['Inspections', 'PDFs in someone\'s inbox', 'Photo-tagged, searchable, live'],
    ['Capital plan', 'Annual offsite, age-based', 'Continuous, condition-based'],
    ['Compliance', 'Audit-week scramble', 'Always-on evidence trail'],
    ['Savings claim', '"Trust us"', 'Verified, line-by-line'],
    ['Onboarding', '6 weeks, consultants', '< 5 minutes, drag &amp; drop'],
  ];
  return (
    <div className="w-full h-full bg-white flex flex-col">
      <div className="px-12 md:px-20 pt-12 pb-6">
        <div className="text-[11px] font-bold tracking-[0.3em] text-indigo-500 uppercase mb-3">
          · The shift
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 max-w-4xl text-balance">
          Eight things change on Monday morning.
        </h1>
      </div>
      <div className="flex-1 grid grid-cols-2 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-full w-px bg-slate-200" />
        <div className="px-12 md:px-20 py-2 bg-rose-50/30">
          <div className="text-[10px] font-bold tracking-[0.3em] text-rose-500 uppercase mb-4">Before</div>
        </div>
        <div className="px-12 md:px-20 py-2 bg-emerald-50/30">
          <div className="text-[10px] font-bold tracking-[0.3em] text-emerald-600 uppercase mb-4">With AssetStack</div>
        </div>
        {rows.map(([label, before, after], i) => (
          <React.Fragment key={label}>
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="px-12 md:px-20 py-2.5 flex items-center gap-4 border-t border-slate-100"
            >
              <div className="w-1 h-6 bg-rose-300 rounded-full shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</div>
                <div className="text-sm text-slate-600 line-through decoration-rose-300/60" dangerouslySetInnerHTML={{ __html: before }} />
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 + 0.1 }}
              className="px-12 md:px-20 py-2.5 flex items-center gap-4 border-t border-slate-100"
            >
              <div className="w-1 h-6 bg-emerald-500 rounded-full shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Now</div>
                <div className="text-sm font-bold text-slate-900" dangerouslySetInnerHTML={{ __html: after }} />
              </div>
            </motion.div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

/* ============================================================
   ONE-LINE STATEMENT SLIDE · Jobs/Apple keynote pattern
   ============================================================ */
export const SlideManifesto = () => (
  <div className="w-full h-full bg-white flex items-center justify-center px-12 md:px-24 relative">
    <div className="absolute top-12 left-12 md:left-24 text-[11px] font-bold tracking-[0.3em] text-indigo-500 uppercase">
      · The promise
    </div>
    <motion.h1
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="text-5xl md:text-7xl lg:text-8xl font-bold leading-[1.05] tracking-tight text-slate-900 max-w-6xl text-balance"
    >
      You will know about<br />
      <span className="text-slate-300">every failure</span><br />
      <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
        before it happens.
      </span>
    </motion.h1>
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
      className="absolute bottom-12 left-12 md:left-24 right-12 md:right-24 flex items-end justify-between"
    >
      <div className="text-sm text-slate-500 max-w-lg">
        Every pump, valve, lift, bridge, transformer and turbine in your portfolio — continuously scored, ranked and forecasted.
      </div>
      <div className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">AssetStack · 2026</div>
    </motion.div>
  </div>
);

/* ============================================================
   PRODUCT MAP · all features at a glance, like a system diagram
   Replaces several text-heavy "what we do" slides
   ============================================================ */
export const SlideProductMap = () => {
  const groups = [
    {
      label: 'INTELLIGENCE LAYER',
      color: 'bg-indigo-600',
      items: ['AssetMind chat', 'Failure prediction', 'Scan vision AI', 'Defect cascade', 'Climate risk', 'Anomaly detection'],
    },
    {
      label: 'OPERATIONS',
      color: 'bg-emerald-600',
      items: ['Work orders', 'Maintenance planner', 'AI scheduler', 'Templates', 'Spare parts', 'Suppliers', 'Inspections', 'Photo diff'],
    },
    {
      label: 'FINANCE',
      color: 'bg-amber-600',
      items: ['Capital plan', 'Valuation', 'Cost center', 'Funding optimiser', 'Scenario modeller', 'Savings ledger', 'Defect backlog', 'Board pack'],
    },
    {
      label: 'DATA & ASSETS',
      color: 'bg-sky-600',
      items: ['Asset register', 'Hierarchy tree', 'Network globe', 'Locations', 'Digital twin', 'LiDAR scans', 'Sensor streams', 'Photo library'],
    },
    {
      label: 'PEOPLE',
      color: 'bg-violet-600',
      items: ['Roles & permissions', 'Technicians', 'Manager view', 'Job board', 'Contractor portal', 'Kudos & badges'],
    },
    {
      label: 'GOVERNANCE',
      color: 'bg-rose-600',
      items: ['Compliance library', 'Evidence vault', 'Audit log', 'Security center', 'Data quality', 'Auditor mode'],
    },
  ];
  return (
    <SlideShell
      kicker="· The whole product"
      title="One platform. Six surfaces. Every feature."
      subtitle="Forty-plus dedicated workspaces, one shared model. Nothing duplicated, nothing missing."
    >
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {groups.map((g, gi) => (
          <motion.div
            key={g.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: gi * 0.05 }}
            className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden"
          >
            <div className={`${g.color} text-white px-3 py-1.5 text-[10px] font-bold tracking-[0.15em] uppercase`}>
              {g.label}
            </div>
            <div className="p-3 flex flex-wrap gap-1">
              {g.items.map((it) => (
                <span key={it} className="px-2 py-0.5 rounded bg-white border border-slate-200 text-[10px] font-bold text-slate-700">
                  {it}
                </span>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
      <div className="mt-6 grid grid-cols-4 gap-3">
        {[
          ['44+', 'Workspaces'],
          ['27', 'Sensor types'],
          ['38', 'Backend AI functions'],
          ['1', 'Shared data model'],
        ].map(([v, l]) => (
          <div key={l} className="bg-slate-900 text-white rounded-xl px-4 py-3 flex items-baseline justify-between">
            <div className="text-2xl md:text-3xl font-bold tabular-nums text-indigo-300">{v}</div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{l}</div>
          </div>
        ))}
      </div>
    </SlideShell>
  );
};

/* ============================================================
   THANK YOU · clean closer with single proposition
   ============================================================ */
export const SlideThankYou = () => (
  <div className="w-full h-full bg-white flex flex-col items-center justify-center text-center px-12 relative">
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.7 }}
    >
      <div className="text-[11px] font-bold tracking-[0.4em] text-indigo-500 uppercase mb-8">
        Thank you
      </div>
      <h1 className="text-6xl md:text-8xl font-bold tracking-tight text-slate-900 leading-none mb-8 text-balance">
        Let's run<br />
        <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
          your portfolio
        </span><br />
        together.
      </h1>
      <div className="flex items-center justify-center gap-3 text-sm text-slate-500">
        <span>hello@assetstack.ai</span>
        <span className="w-1 h-1 rounded-full bg-slate-300" />
        <span>assetstack.ai</span>
      </div>
    </motion.div>
  </div>
);