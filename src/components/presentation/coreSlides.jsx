import React from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles, CheckCircle2, Database, Brain, Wrench,
  Camera, AlertTriangle, ClipboardCheck, ArrowRight, Eye, MessageSquare,
} from 'lucide-react';
import SlideShell from './SlideShell';

/* ============================================================
   COVER — Built around the 4 pillars
   ============================================================ */
export const SlideCoverV2 = () => (
  <div className="w-full h-full bg-slate-950 text-white relative overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-slate-950 to-black" />
    <div
      className="absolute inset-0 opacity-[0.08]"
      style={{
        backgroundImage: 'radial-gradient(circle at 1px 1px, #818cf8 1px, transparent 0)',
        backgroundSize: '32px 32px',
      }}
    />
    <motion.div
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1.8 }}
      className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/3 w-[60vw] h-[60vw] rounded-full bg-indigo-600/20 blur-[120px]"
    />

    <div className="relative h-full flex flex-col px-12 md:px-20 py-12">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm font-bold tracking-[0.2em]">ASSETSTACK</span>
        </div>
        <span className="text-[10px] font-bold tracking-[0.3em] text-slate-500 uppercase">2026 Platform Edition</span>
      </motion.div>

      <div className="flex-1 flex flex-col justify-center max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur w-fit mb-8"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[11px] font-bold tracking-wider text-slate-300">One platform · every asset</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.6 }}
          className="text-[clamp(2.75rem,7.5vw,6.5rem)] font-bold leading-[0.95] tracking-tighter text-balance"
        >
          Every asset.<br />
          Every job.<br />
          <span className="bg-gradient-to-r from-white via-indigo-200 to-indigo-400 bg-clip-text text-transparent">
            One AI command centre.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-lg md:text-xl text-slate-400 max-w-2xl mt-10 leading-relaxed"
        >
          A complete asset register, maintenance task hub, and condition-report engine —
          <span className="text-white"> run by AI you can actually talk to.</span>
        </motion.p>
      </div>

      {/* 4 pillars footer */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="grid grid-cols-4 gap-6 pt-8 border-t border-white/10"
      >
        {[
          [Database, 'Asset register', 'Thousands of assets, instantly'],
          [Wrench, 'Maintenance hub', 'Plan · schedule · close'],
          [Brain, 'AI command centre', 'Plain English, real work'],
          [Camera, 'Condition reports', 'AI vision + human review'],
        ].map(([Icon, t, s], i) => (
          <motion.div
            key={t}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 + i * 0.08 }}
            className="flex items-start gap-3"
          >
            <div className="w-9 h-9 rounded-lg bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center shrink-0">
              <Icon className="w-4 h-4 text-indigo-300" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">{t}</div>
              <div className="text-[11px] text-slate-500 mt-0.5">{s}</div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  </div>
);

/* ============================================================
   THE 4 PILLARS — the deck's central organising slide
   ============================================================ */
export const SlideFourPillars = () => {
  const pillars = [
    {
      n: '01',
      icon: Database,
      title: 'Asset register',
      hook: 'A single source of truth for every asset you own.',
      bullets: ['Hierarchy · location · network globe', 'Sensors, scans, docs, photos per asset', 'Smart filters, saved views, bulk edit'],
      color: 'sky',
    },
    {
      n: '02',
      icon: Wrench,
      title: 'Maintenance task management',
      hook: 'Plan, dispatch, track and close every job.',
      bullets: ['Scheduled · predictive · corrective', 'Auto-assign by skill & workload', 'Mobile-first, offline-capable'],
      color: 'emerald',
    },
    {
      n: '03',
      icon: MessageSquare,
      title: 'AI command centre',
      hook: 'Ask in plain English. AssetMind does the work.',
      bullets: ['Full read/write across the platform', '38 specialised AI pipelines', 'Briefings · reports · automations'],
      color: 'violet',
    },
    {
      n: '04',
      icon: Camera,
      title: 'Condition reports',
      hook: 'AI-powered defect detection from photos & scans.',
      bullets: ['Photo, LiDAR, photogrammetry input', 'Severity-scored anomalies, ranked', 'One-click human verification'],
      color: 'amber',
    },
  ];
  const colors = {
    sky: { bar: 'bg-sky-500', text: 'text-sky-600', tint: 'bg-sky-50' },
    emerald: { bar: 'bg-emerald-500', text: 'text-emerald-600', tint: 'bg-emerald-50' },
    violet: { bar: 'bg-violet-500', text: 'text-violet-600', tint: 'bg-violet-50' },
    amber: { bar: 'bg-amber-500', text: 'text-amber-600', tint: 'bg-amber-50' },
  };
  return (
    <SlideShell
      kicker="· The four pillars"
      title="One platform, built around what your team actually does."
      subtitle="Every other feature — sensors, finance, compliance, planning — plugs into these four."
    >
      <div className="grid grid-cols-2 gap-4">
        {pillars.map((p, i) => {
          const c = colors[p.color];
          const Icon = p.icon;
          return (
            <motion.div
              key={p.n}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="bg-white border border-slate-200 rounded-2xl overflow-hidden flex"
            >
              <div className={`${c.bar} w-1`} />
              <div className="flex-1 p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-9 h-9 rounded-lg ${c.tint} flex items-center justify-center`}>
                    <Icon className={`w-4 h-4 ${c.text}`} />
                  </div>
                  <div className={`text-xs font-bold ${c.text} tabular-nums tracking-widest`}>{p.n}</div>
                </div>
                <div className="text-xl font-bold text-slate-900 mb-1.5 text-balance">{p.title}</div>
                <div className="text-sm text-slate-600 mb-3 leading-snug">{p.hook}</div>
                <div className="space-y-1.5 pt-3 border-t border-slate-100">
                  {p.bullets.map((b) => (
                    <div key={b} className="flex items-start gap-2">
                      <CheckCircle2 className={`w-3.5 h-3.5 ${c.text} mt-0.5 shrink-0`} />
                      <span className="text-xs text-slate-700">{b}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </SlideShell>
  );
};

/* ============================================================
   FAST UPLOAD — the wow moment about onboarding speed
   ============================================================ */
export const SlideFastUpload = () => {
  const steps = [
    { t: '00:00', label: 'Drop spreadsheet', desc: 'CSV, Excel, or paste from any CMMS export', color: 'bg-sky-500' },
    { t: '00:12', label: 'AI parses fields', desc: 'AssetMind auto-maps columns to asset schema', color: 'bg-violet-500' },
    { t: '00:48', label: 'Locations resolved', desc: 'Sites, depots, buildings linked by name & code', color: 'bg-indigo-500' },
    { t: '01:35', label: 'Hierarchy inferred', desc: 'Parent–child links, asset types classified', color: 'bg-fuchsia-500' },
    { t: '02:30', label: 'Health & risk scored', desc: 'Condition baseline computed per asset', color: 'bg-amber-500' },
    { t: '03:15', label: 'Predictions live', desc: 'Failure probability & RUL generated', color: 'bg-emerald-500' },
    { t: '04:47', label: 'Live portfolio', desc: 'Dashboards, alerts, AI ready to use', color: 'bg-emerald-600' },
  ];
  return (
    <SlideShell
      kicker="· Onboarding speed"
      title="From spreadsheet to live portfolio. In under five minutes."
      subtitle="No 6-week kickoff. No consultants. Drop your asset list — AssetMind does the rest."
      variant="light"
    >
      {/* Hero stat */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 mb-6 flex items-center gap-8 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'radial-gradient(circle, #6366f1 1.5px, transparent 1.5px)',
          backgroundSize: '24px 24px',
        }} />
        <div className="relative shrink-0">
          <div className="text-[10px] font-bold tracking-[0.3em] text-indigo-300 uppercase mb-1">Median onboard time</div>
          <div className="text-6xl md:text-7xl font-bold text-white tabular-nums">4:47</div>
          <div className="text-xs text-slate-400 mt-1">1,000-asset portfolio · drag to live</div>
        </div>
        <div className="relative flex-1 grid grid-cols-3 gap-4 pl-8 border-l border-slate-800">
          {[
            ['Any format', 'CSV, XLSX, JSON, CMMS export'],
            ['AI field mapping', 'No column-by-column setup'],
            ['Zero consultants', 'Drop the file and go'],
          ].map(([t, d]) => (
            <div key={t}>
              <div className="text-sm font-bold text-indigo-300">{t}</div>
              <div className="text-xs text-slate-400 mt-0.5">{d}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="text-[11px] font-bold tracking-[0.2em] text-slate-400 uppercase mb-5">What happens, second by second</div>
        <div className="relative">
          <div className="absolute top-2.5 left-2 right-2 h-px bg-slate-200" />
          <div className="relative grid grid-cols-7 gap-1">
            {steps.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="flex flex-col items-center text-center"
              >
                <div className={`w-5 h-5 rounded-full ${s.color} relative z-10 ring-4 ring-white`} />
                <div className="text-[10px] font-bold text-slate-900 tabular-nums mt-2">{s.t}</div>
                <div className="text-[11px] font-bold text-slate-900 mt-1 leading-tight">{s.label}</div>
                <div className="text-[10px] text-slate-500 mt-1 leading-tight">{s.desc}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </SlideShell>
  );
};

/* ============================================================
   CONDITION REPORTS — dedicated AI-vision slide
   ============================================================ */
export const SlideConditionReports = () => {
  const flow = [
    { icon: Camera, t: 'Capture', d: 'Photo, LiDAR scan, drone, or field upload' },
    { icon: Eye, t: 'AI detects', d: 'Cracks, corrosion, wear, spalling, missing parts' },
    { icon: AlertTriangle, t: 'Severity scored', d: 'Minor → Critical with confidence band' },
    { icon: ClipboardCheck, t: 'Human verify', d: 'One-click approve, dispute, or correct' },
    { icon: Wrench, t: 'Auto WO', d: 'Approved defect spawns the work order' },
  ];
  return (
    <SlideShell
      kicker="· Condition reports"
      title="Upload a photo. Get a defect report. Every time."
      subtitle="Whether it's a phone photo or a 3D LiDAR scan, AssetMind extracts the defects, scores them, and queues them for your team to verify."
    >
      {/* Flow */}
      <div className="flex items-stretch gap-2 mb-6">
        {flow.map((s, i) => {
          const Icon = s.icon;
          return (
            <React.Fragment key={s.t}>
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="flex-1 bg-white border border-slate-200 rounded-xl p-4"
              >
                <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center mb-3">
                  <Icon className="w-4 h-4 text-amber-600" />
                </div>
                <div className="text-[10px] font-bold text-amber-600 tracking-widest uppercase mb-1">Step {i + 1}</div>
                <div className="text-sm font-bold text-slate-900 mb-1">{s.t}</div>
                <div className="text-xs text-slate-600 leading-snug">{s.d}</div>
              </motion.div>
              {i < flow.length - 1 && (
                <div className="flex items-center">
                  <ArrowRight className="w-4 h-4 text-slate-300" />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Two-column detail */}
      <div className="grid grid-cols-2 gap-4">
        {/* Defect types */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
          <div className="text-[10px] font-bold tracking-[0.2em] text-slate-400 uppercase mb-3">12 defect types detected</div>
          <div className="flex flex-wrap gap-1.5">
            {['Cracks', 'Corrosion', 'Spalling', 'Stains', 'Graffiti', 'Water damage', 'Missing parts', 'Misalignment', 'Wear', 'Dents', 'Scratches', 'Broken parts'].map((d) => (
              <span key={d} className="px-2.5 py-1 rounded-full bg-white border border-slate-200 text-[11px] font-bold text-slate-700">{d}</span>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-slate-200 grid grid-cols-3 gap-3">
            {[
              ['1–5', 'Condition score'],
              ['4', 'Severity levels'],
              ['0–100%', 'AI confidence'],
            ].map(([v, l]) => (
              <div key={l}>
                <div className="text-lg font-bold text-amber-600 tabular-nums">{v}</div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Feedback loop */}
        <div className="bg-slate-900 text-white rounded-2xl p-5 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: 'radial-gradient(circle, #f59e0b 1.5px, transparent 1.5px)',
            backgroundSize: '20px 20px',
          }} />
          <div className="relative">
            <Brain className="w-5 h-5 text-amber-400 mb-3" />
            <div className="text-[10px] font-bold tracking-[0.2em] text-amber-300 uppercase mb-2">Continuous learning</div>
            <div className="text-xl font-bold mb-3 leading-snug text-balance">
              Every human verification retrains the model.
            </div>
            <div className="text-sm text-slate-400 leading-relaxed mb-4">
              Reviewers approve, correct, or dispute. Each decision becomes training data. Accuracy climbs week-over-week — no ML team required.
            </div>
            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-800">
              <div>
                <div className="text-2xl font-bold text-amber-400 tabular-nums">94%</div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Accuracy after 30 days</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-amber-400 tabular-nums">3.5×</div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Faster than manual review</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SlideShell>
  );
};