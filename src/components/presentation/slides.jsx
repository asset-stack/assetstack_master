import React from 'react';
import { motion } from 'framer-motion';
import {
  Activity, AlertTriangle, Brain, Calendar, CheckCircle2, ChevronRight, ClipboardCheck,
  Cpu, Eye, FileText, GitBranch, Globe2, Layers, Lock, MessageSquare, Quote, Shield,
  ShieldCheck, Smartphone, Sparkles, Star, Target, TrendingUp, Wallet, Wrench, XCircle, Zap,
} from 'lucide-react';
import SlideShell from './SlideShell';
import {
  AssetMindChat, DashboardMock, RiskList, MobileWO, GlobeMock, AssetTree,
  ScenarioMock, SavingsLedger, BacklogChart,
} from './mockups/MiniMockups';

const dot = (cls) => <div className={`w-2 h-2 rounded-full ${cls}`} />;

// 01 — Cover
export const SlideCover = () => (
  <div className="w-full h-full bg-slate-950 text-white relative overflow-hidden">
    {/* Layered atmospheric backgrounds */}
    <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-slate-950 to-black" />
    <div
      className="absolute inset-0 opacity-[0.08]"
      style={{
        backgroundImage: 'radial-gradient(circle at 1px 1px, #818cf8 1px, transparent 0)',
        backgroundSize: '32px 32px',
      }}
    />
    {/* Glow */}
    <motion.div
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1.8 }}
      className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/3 w-[60vw] h-[60vw] rounded-full bg-indigo-600/20 blur-[120px]"
    />

    <div className="relative h-full flex flex-col px-12 md:px-20 py-12">
      {/* Top bar */}
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
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-bold tracking-[0.3em] text-slate-500 uppercase">2026 · Vol 03</span>
        </div>
      </motion.div>

      {/* Centerpiece */}
      <div className="flex-1 flex flex-col justify-center max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur w-fit mb-8"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[11px] font-bold tracking-wider text-slate-300">The 2026 platform edition</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.6 }}
          className="text-[clamp(3rem,8.5vw,7.5rem)] font-bold leading-[0.95] tracking-tighter text-balance"
        >
          The AI that<br />
          <span className="bg-gradient-to-r from-white via-indigo-200 to-indigo-400 bg-clip-text text-transparent">
            actually runs
          </span><br />
          your assets.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-lg md:text-xl text-slate-400 max-w-2xl mt-10 leading-relaxed"
        >
          Predict failures. Draft the work order. Schedule the tech. Order the part. Prove the savings.
          <span className="text-white"> One platform, every asset.</span>
        </motion.p>
      </div>

      {/* Footer KPIs */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="grid grid-cols-4 gap-8 pt-8 border-t border-white/10"
      >
        {[
          ['$1.4M', 'Verified savings · yr'],
          ['68%', 'Fewer surprise failures'],
          ['3.2×', 'Faster WO cycle'],
          ['< 5 min', 'Onboard 1,000 assets'],
        ].map(([v, l], i) => (
          <motion.div
            key={l}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 + i * 0.08 }}
          >
            <div className="text-3xl md:text-4xl font-bold text-white tabular-nums">{v}</div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mt-2">{l}</div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  </div>
);

// 02 — TOC
export const SlideTOC = ({ chapters, onJump }) => (
  <div className="w-full h-full bg-white flex">
    <div className="w-2/5 bg-slate-900 text-white p-12 md:p-16 flex flex-col justify-between relative overflow-hidden">
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: 'radial-gradient(circle, #6366f1 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      }} />
      <div className="relative">
        <div className="text-[11px] font-bold tracking-[0.3em] text-indigo-300 uppercase mb-6">
          Inside this edition
        </div>
        <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
          The four pillars<br />of AssetStack.
        </h1>
        <p className="text-slate-400 max-w-sm">
          The four pillars — asset register, maintenance, AI command centre, condition reports — plus everything they plug into: sensors, finance, scans, savings, compliance, security.
        </p>
      </div>
      <div className="relative">
        <div className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest">Read time · 12 min</div>
        <div className="text-xs text-slate-500 mt-1">Issue 03 · 2026 Platform Edition</div>
      </div>
    </div>
    <div className="flex-1 p-12 md:p-16 overflow-y-auto">
      <div className="text-[11px] font-bold tracking-[0.3em] text-indigo-500 uppercase mb-6">Chapters</div>
      <div className="border-t border-slate-200 mb-6" />
      <div className="grid grid-cols-2 gap-x-10 gap-y-3">
        {chapters.map((c, i) => (
          <button
            key={i}
            onClick={() => onJump?.(i)}
            className="flex items-center gap-4 py-2 border-b border-slate-100 text-left hover:bg-slate-50 transition-colors px-2 -mx-2 rounded group"
          >
            <span className="text-2xl font-bold text-indigo-200 tabular-nums w-8 group-hover:text-indigo-500 transition-colors">
              {String(i + 1).padStart(2, '0')}
            </span>
            <span className="text-sm font-bold text-slate-900">{c}</span>
            <ChevronRight className="w-4 h-4 text-slate-300 ml-auto group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all" />
          </button>
        ))}
      </div>
    </div>
  </div>
);

// 03 — Problem
export const SlideProblem = () => (
  <SlideShell
    kicker="· The reality today"
    title="$3M / yr is spent finding out what's already broken."
    subtitle="Most asset organisations still run on spreadsheets, paper inspections and reactive callouts. The cost compounds every budget cycle."
  >
    <div className="bg-slate-50 border-l-4 border-indigo-500 rounded-r-xl p-6 md:p-8 mb-8">
      <Quote className="w-6 h-6 text-indigo-300 mb-2" />
      <p className="text-xl md:text-2xl text-slate-800 leading-snug text-balance">
        "We had eight systems, four spreadsheets and a clipboard. We were paying $3M a year just to find out what was broken."
      </p>
      <p className="text-xs text-slate-500 mt-3">— Asset Director, regional council (pre-AssetStack)</p>
    </div>
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
      {[
        ['Reactive, not predictive', 'Emergency repairs cost 3–5× planned. Failures happen before anyone sees them coming.'],
        ['Silos everywhere', 'CMMS, finance, scans, sensors and field notes never talk to each other.'],
        ['Inspections lost in PDFs', 'Thousands of clipboard findings nobody can search or trend.'],
        ['Budget guesswork', 'Capital plans built on age, not condition. Renewals deferred until something breaks.'],
        ['Compliance scramble', 'Certifications tracked in someone\'s inbox. Audit week = panic week.'],
        ['No single truth', 'Every meeting starts with reconciling numbers from four systems.'],
      ].map(([t, b]) => (
        <div key={t} className="bg-white border border-slate-200 border-l-2 border-l-rose-500 rounded-lg p-4">
          <div className="text-sm font-bold text-slate-900 mb-1">{t}</div>
          <div className="text-xs text-slate-600 leading-relaxed">{b}</div>
        </div>
      ))}
    </div>
  </SlideShell>
);

// 04 — Solution
export const SlideSolution = () => {
  const pillars = [
    ['SEE', 'Live portfolio view', 'Every asset, location, scan and sensor reading in one place. Drill from globe → site → asset in two clicks.', Eye, 'sky'],
    ['PREDICT', 'AI forecasts', 'Failure probability, remaining useful life, condition trends — per asset, updated continuously.', Brain, 'violet'],
    ['ACT', 'AssetMind operates', 'Creates work orders, schedules teams, orders parts, sends notifications — all from plain English.', Zap, 'emerald'],
    ['PROVE', 'Auditable proof', 'Verified savings ledger, compliance trail, and board-ready reports generated on demand.', ShieldCheck, 'amber'],
  ];
  const colorMap = {
    sky: 'bg-sky-500',
    violet: 'bg-violet-500',
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-500',
  };
  return (
    <SlideShell
      kicker="· The AssetStack way"
      title="See it. Predict it. Act on it. Prove it."
      subtitle="Every asset, every sensor, every scan, every dollar — unified. AssetMind sits on top and acts on your behalf."
    >
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {pillars.map(([tag, title, body, Icon, color]) => (
          <motion.div
            key={tag}
            whileHover={{ y: -2 }}
            className="bg-slate-50 border border-slate-200 rounded-2xl p-5"
          >
            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md ${colorMap[color]} text-white text-[10px] font-bold tracking-wider mb-4`}>
              <Icon className="w-3 h-3" />
              {tag}
            </div>
            <div className="text-xl font-bold text-slate-900 mb-2">{title}</div>
            <div className="text-sm text-slate-600 leading-relaxed">{body}</div>
          </motion.div>
        ))}
      </div>
      <div className="mt-8 bg-slate-900 text-white rounded-xl p-5 border-l-4 border-indigo-500">
        <div className="text-base md:text-lg font-bold text-center">
          From silos and spreadsheets to a single AI-powered operating layer.
        </div>
      </div>
    </SlideShell>
  );
};

// 05 — AssetMind
export const SlideAssetMind = () => (
  <SlideShell
    kicker="· Pillar 03 · AI command centre"
    title={<>Plain English in. <span className="text-indigo-400">Real work out.</span></>}
    subtitle="Not a chatbot. AssetMind has full read/write access to every record across all four pillars, plus 38 specialised AI pipelines. It plans, queries, executes and reports back — autonomously."
    variant="gradient"
  >
    <div className="grid grid-cols-2 gap-10 h-full">
      <div className="flex flex-col justify-center space-y-3">
        {[
          'Predict failures across the entire portfolio',
          'Auto-create work orders and assign technicians',
          'Run AI vision on scans and triage defects',
          'Generate morning briefings and board reports',
          'Forecast budgets and model renewal scenarios',
          'Send notifications, update compliance records',
        ].map((c) => (
          <div key={c} className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-indigo-400" />
            <span className="text-base text-white">{c}</span>
          </div>
        ))}
        <div className="mt-6 pt-6 border-t border-slate-800">
          <div className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest">
            Speak plain english · get real work done
          </div>
        </div>
      </div>
      <div className="h-[480px]">
        <AssetMindChat />
      </div>
    </div>
  </SlideShell>
);

// 06 — Onboarding speed
export const SlideSpeed = () => {
  const steps = [
    ['00:00', 'Drop CSV', 'bg-sky-500'],
    ['00:08', 'AI parsing', 'bg-violet-500'],
    ['00:42', 'Locations linked', 'bg-indigo-500'],
    ['01:30', 'Health scored', 'bg-amber-500'],
    ['02:15', 'Predictions live', 'bg-emerald-500'],
    ['< 5:00', 'Live portfolio', 'bg-emerald-500'],
  ];
  return (
    <SlideShell
      kicker="· Onboarding"
      title="From CSV to live predictions in 4 minutes 47 seconds."
      subtitle="Drop your register. AssetMind parses it, infers types, links locations, scores health, computes risk and generates the first predictions — automatically."
    >
      <div className="bg-slate-50 rounded-2xl border border-slate-200 p-8 mb-6">
        <div className="relative">
          <div className="absolute top-1/2 left-4 right-4 h-px bg-slate-200" />
          <div className="relative flex justify-between">
            {steps.map(([t, l, c], i) => (
              <motion.div
                key={l}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex flex-col items-center"
              >
                <div className="text-xs font-bold text-slate-900 mb-2 tabular-nums">{t}</div>
                <div className={`w-4 h-4 rounded-full bg-white border-2 ${c.replace('bg-', 'border-')} relative z-10`}>
                  <div className={`absolute inset-1 rounded-full ${c}`} />
                </div>
                <div className={`text-xs font-bold mt-2 ${c.replace('bg-', 'text-')}`}>{l}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-slate-50 rounded-xl p-5">
          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500 text-white mb-3">BEFORE</span>
          <div className="text-lg font-bold text-slate-900 mb-1">Weeks of consultants</div>
          <div className="text-sm text-slate-600">Manual data cleaning, custom imports, bespoke field mapping, and a 6-week kickoff before anyone sees a dashboard.</div>
        </div>
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5">
          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500 text-white mb-3">WITH ASSETSTACK</span>
          <div className="text-lg font-bold text-slate-900 mb-1">Minutes, not weeks</div>
          <div className="text-sm text-slate-600">Drag, drop, done. AssetMind parses your file, validates rows, and lights up dashboards before your coffee is cold.</div>
        </div>
      </div>
      <div className="bg-slate-900 text-white rounded-xl p-5 flex items-center gap-6">
        <div className="text-4xl md:text-5xl font-bold text-indigo-300 tabular-nums">4:47</div>
        <div>
          <div className="font-bold text-base">Median time to live portfolio · 1,000 assets</div>
          <div className="text-sm text-slate-400">Includes parsing, validation, location resolution, health scoring &amp; first predictions.</div>
        </div>
      </div>
    </SlideShell>
  );
};

// 07 — Predict
export const SlidePredict = () => (
  <SlideShell
    kicker="· Predictive maintenance"
    title="Catch the failure 30 days before it shuts you down."
    subtitle="Sensor data + condition reports + age + duty cycle → per-asset failure probability and Remaining Useful Life. Updated continuously, ranked by risk."
  >
    <div className="grid grid-cols-2 gap-8 h-full">
      <div>
        <div className="text-base font-bold text-slate-900 mb-4">What you get</div>
        <div className="space-y-3">
          {[
            'Failure probability over next 30 / 90 / 365 days',
            'Remaining useful life (days) per asset',
            'Top failure modes ranked by likelihood',
            'Confidence band on every prediction',
            'Anomaly detection on live sensor streams',
            'Defect-cascade modelling to related assets',
            'Auto work orders on threshold breach',
          ].map((f) => (
            <div key={f} className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0" />
              <span className="text-sm text-slate-700">{f}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="h-full max-h-[480px]">
        <RiskList />
      </div>
    </div>
  </SlideShell>
);

// 08 — Scans
export const SlideScans = () => {
  const flow = [
    ['1. Upload', '.obj / .glb / mesh', 'bg-sky-500'],
    ['2. Frame extract', 'AI picks key views', 'bg-violet-500'],
    ['3. AI vision', 'Defects detected', 'bg-indigo-500'],
    ['4. Human verify', 'One-click approve', 'bg-amber-500'],
    ['5. Auto WO', 'Work order made', 'bg-emerald-500'],
  ];
  return (
    <SlideShell
      kicker="· Digital twin & scans"
      title="Upload the scan. The defects find themselves."
      subtitle="LiDAR or photogrammetry in. AssetMind extracts frames, runs vision AI, locates anomalies in 3D and queues them for one-click human verification."
    >
      <div className="flex items-center gap-3 mb-8 overflow-x-auto">
        {flow.map(([t, s, c], i) => (
          <React.Fragment key={t}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className={`${c} text-white rounded-xl px-5 py-4 flex-1 min-w-[140px]`}
            >
              <div className="text-sm font-bold">{t}</div>
              <div className="text-xs opacity-80 mt-0.5">{s}</div>
            </motion.div>
            {i < flow.length - 1 && <ChevronRight className="w-6 h-6 text-slate-300 shrink-0" />}
          </React.Fragment>
        ))}
      </div>
      <div className="mb-8">
        <div className="text-sm font-bold text-slate-900 mb-3">Anomaly types detected</div>
        <div className="flex flex-wrap gap-2">
          {['Cracks', 'Corrosion', 'Spalling', 'Water damage', 'Graffiti', 'Missing parts', 'Misalignment', 'Wear', 'Stains', 'Dents'].map((a) => (
            <span key={a} className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold">
              {a}
            </span>
          ))}
        </div>
      </div>
      <div className="bg-slate-900 text-white rounded-2xl p-6 border-l-4 border-indigo-500">
        <div className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest mb-2">Feedback loop</div>
        <div className="text-xl md:text-2xl font-bold mb-2">Every human correction retrains the model.</div>
        <div className="text-sm text-slate-400 max-w-3xl">
          AssetMind learns from your reviewers. Accuracy climbs week over week — without changing how your team works.
        </div>
      </div>
    </SlideShell>
  );
};

// 09 — Work orders
export const SlideWorkOrders = () => (
  <SlideShell
    kicker="· Work orders in action"
    title="Condition report → drafted → assigned → done. No one typing."
    subtitle="An AI defect, a sensor spike or a predicted failure becomes a work order automatically — assigned to the right tech, on the right day, with the right checklist."
  >
    <div className="grid grid-cols-3 gap-8 h-full">
      <div className="h-full max-h-[480px]">
        <MobileWO />
      </div>
      <div className="col-span-2 grid grid-cols-2 gap-3">
        {[
          ['Auto-generated', 'Triggered by predictions, sensor anomalies, or inspection findings — no human typing.'],
          ['Smart assignment', 'Matches job to technician by skill, certification, location and current workload.'],
          ['Mobile-first', 'Offline-capable. Capture photos, sign-offs and readings even with no signal.'],
          ['Dynamic checklists', 'Type-specific checklists with photo-required steps and conditional logic.'],
          ['Live chat per WO', 'Threaded conversation between dispatcher, technician and supervisor.'],
          ['Auto follow-ups', 'Findings during the job spawn follow-up WOs automatically.'],
        ].map(([t, b]) => (
          <div key={t} className="bg-white border border-slate-200 border-l-2 border-l-emerald-500 rounded-lg p-4">
            <div className="text-sm font-bold text-slate-900 mb-1">{t}</div>
            <div className="text-xs text-slate-600 leading-relaxed">{b}</div>
          </div>
        ))}
      </div>
    </div>
  </SlideShell>
);

// 10 — Live portfolio
export const SlideLivePortfolio = () => (
  <SlideShell
    kicker="· Live portfolio"
    title="Globe to asset in two clicks. One truth for everyone."
    subtitle="Ops, finance, and the board look at the same record — always. No reconciliation, no version conflicts, no exports."
  >
    <div className="grid grid-cols-3 gap-4 h-full">
      <div className="col-span-2 h-full max-h-[480px]">
        <DashboardMock />
      </div>
      <div className="grid grid-rows-2 gap-4 h-full max-h-[480px]">
        <GlobeMock />
        <AssetTree />
      </div>
    </div>
  </SlideShell>
);

// 11 — Finance
export const SlideFinance = () => (
  <SlideShell
    kicker="· Finance & capital plan"
    title="Defer a renewal? You'll see the 10-year cost in 10 seconds."
    subtitle="Risk-scored forecasts, drag-to-defer planning, scenario modelling, variance alerts and a verified savings ledger — built for CFOs and auditors."
  >
    <div className="grid grid-cols-2 gap-6 mb-6 h-[400px]">
      <BacklogChart />
      <ScenarioMock />
    </div>
    <div className="grid grid-cols-4 gap-3">
      {[
        ['Capital Plan', 'Risk-scored, year-by-year, drag-to-defer.'],
        ['Scenario Modeller', 'Budget, inflation, climate stress in 10s.'],
        ['Funding Optimiser', 'Allocate $ for max risk reduction.'],
        ['Savings Ledger', 'Every prevented failure, dollar-quantified.'],
      ].map(([t, b]) => (
        <div key={t} className="bg-white border border-slate-200 border-l-2 border-l-amber-500 rounded-lg p-4">
          <div className="text-sm font-bold text-slate-900 mb-1">{t}</div>
          <div className="text-xs text-slate-600">{b}</div>
        </div>
      ))}
    </div>
  </SlideShell>
);

// 12 — Savings
export const SlideSavings = () => (
  <SlideShell
    kicker="· Proof of value"
    title="The only platform that proves its own ROI — line by line."
    subtitle="Predicted failure cost. Intervention cost. Verified delta. Every saving claim audited and disputable. No more 'trust us.'"
  >
    <div className="grid grid-cols-2 gap-8 h-full">
      <div className="h-full max-h-[500px]">
        <SavingsLedger />
      </div>
      <div>
        <div className="text-lg font-bold text-slate-900 mb-6">How each entry is verified</div>
        <div className="space-y-4">
          {[
            ['1', 'AI predicts failure', 'Confidence ≥ 80%, root-cause logged.'],
            ['2', 'Intervention taken', 'Predictive WO completed before failure.'],
            ['3', 'Outcome verified', 'Inspection or sensor confirms.'],
            ['4', 'Delta recorded', 'Predicted cost − actual cost = savings.'],
            ['5', 'Disputed?', 'Reviewer can dispute or accept.'],
          ].map(([n, t, s]) => (
            <div key={n} className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm font-bold shrink-0">
                {n}
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900">{t}</div>
                <div className="text-xs text-slate-500">{s}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 bg-emerald-500 text-white rounded-xl p-5 flex items-center justify-between">
          <div className="text-3xl font-bold tabular-nums">$1.42M</div>
          <div className="text-xs font-bold opacity-90 text-right">
            YTD verified<br />
            <span className="opacity-75">Auditable trail per entry</span>
          </div>
        </div>
      </div>
    </div>
  </SlideShell>
);

// 13 — Compliance
export const SlideCompliance = () => (
  <SlideShell
    kicker="· Compliance & audit"
    title="Audit week becomes audit hour."
    subtitle="Every requirement, every certificate, every due date — pre-loaded, reminded, auto-WO'd. Pre-loaded with AS 1735, ISO 55000, NFPA 25 and friends."
  >
    <div className="grid grid-cols-4 gap-3 mb-6">
      {[
        ['142', 'Compliant', 'text-emerald-400'],
        ['18', 'Due soon', 'text-amber-400'],
        ['3', 'Overdue', 'text-rose-400'],
        ['97%', 'On-time rate', 'text-indigo-400'],
      ].map(([v, l, c]) => (
        <div key={l} className="bg-slate-900 rounded-2xl p-6 text-center">
          <div className={`text-4xl md:text-5xl font-bold ${c} tabular-nums mb-2`}>{v}</div>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{l}</div>
        </div>
      ))}
    </div>
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
      {[
        ['Regulation library', 'AS 1735, ISO 55000, NFPA 25 and friends — pre-loaded.'],
        ['Auto reminders', 'Lead-time alerts before any due date.'],
        ['Auto work orders', 'Compliance tasks become WOs automatically.'],
        ['Evidence vault', 'Certificates, reports, insurance — versioned & signed.'],
        ['Auditor mode', 'Read-only export for external reviewers.'],
        ['Chain-of-custody', 'Every change logged with who, when, why.'],
      ].map(([t, b]) => (
        <div key={t} className="bg-white border border-slate-200 border-l-2 border-l-indigo-500 rounded-lg p-4">
          <div className="text-sm font-bold text-slate-900 mb-1">{t}</div>
          <div className="text-xs text-slate-600">{b}</div>
        </div>
      ))}
    </div>
  </SlideShell>
);

// 14 — Security
export const SlideSecurity = () => (
  <SlideShell
    kicker="· Security & trust"
    title="Your data. Your region. Your audit trail."
    subtitle="Enterprise-grade controls, transparently surfaced. Every sensitive action recorded. Every change reversible."
  >
    <div className="grid grid-cols-3 gap-3">
      {[
        ['Role-based access', 'Granular per-role permissions with deny-by-default.', Lock],
        ['Audit logs', 'Every sensitive action recorded, exportable, immutable.', FileText],
        ['Encryption', 'TLS in transit, AES-256 at rest.', Shield],
        ['SSO & MFA', 'SAML, OAuth, hardware keys supported.', Lock],
        ['Data residency', 'Choose your region. Stay there.', Globe2],
        ['Backups', 'Continuous, point-in-time restore.', Layers],
        ['Verified savings', 'Every claim evidenced and disputable.', CheckCircle2],
        ['Tenant isolation', 'Per-tenant data isolation guaranteed.', Shield],
        ['Privacy by design', 'Minimal data collection, GDPR aligned.', ShieldCheck],
      ].map(([t, b, Icon]) => (
        <div key={t} className="bg-white border border-slate-200 border-l-2 border-l-indigo-500 rounded-lg p-4">
          <Icon className="w-4 h-4 text-indigo-500 mb-2" />
          <div className="text-sm font-bold text-slate-900 mb-1">{t}</div>
          <div className="text-xs text-slate-600">{b}</div>
        </div>
      ))}
    </div>
  </SlideShell>
);

// 15 — Comparison
export const SlideComparison = () => {
  const rows = [
    ['AI failure prediction', 'no', 'partial', 'yes'],
    ['Plain-English AI operator', 'no', 'no', 'yes'],
    ['LiDAR / scan defect AI', 'no', 'no', 'yes'],
    ['Auto WO from sensor anomaly', 'no', 'partial', 'yes'],
    ['Scenario modelling for finance', 'no', 'no', 'yes'],
    ['Verified savings ledger', 'no', 'no', 'yes'],
    ['Mobile offline-first', 'partial', 'yes', 'yes'],
    ['<5 min onboarding', 'no', 'no', 'yes'],
  ];
  const Cell = ({ v }) => {
    if (v === 'yes') return <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto" />;
    if (v === 'partial')
      return (
        <div className="w-5 h-5 rounded-full border-2 border-amber-500 mx-auto flex items-center justify-center">
          <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
        </div>
      );
    return <div className="w-5 h-5 rounded-full border-2 border-slate-300 mx-auto" />;
  };
  return (
    <SlideShell
      kicker="· Why teams choose us"
      title="The features that don't exist anywhere else."
      subtitle="Compared against legacy CMMS suites and modern point tools."
    >
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="grid grid-cols-[2fr_1fr_1fr_1fr] bg-slate-900 text-white">
          <div className="px-5 py-3 text-[11px] font-bold tracking-widest uppercase text-slate-400">Capability</div>
          <div className="px-5 py-3 text-sm font-bold text-center">Legacy CMMS</div>
          <div className="px-5 py-3 text-sm font-bold text-center">Modern CMMS</div>
          <div className="px-5 py-3 text-sm font-bold text-center text-indigo-300">AssetStack</div>
        </div>
        {rows.map((row, i) => (
          <div
            key={row[0]}
            className={`grid grid-cols-[2fr_1fr_1fr_1fr] items-center ${i % 2 === 0 ? 'bg-slate-50' : 'bg-white'}`}
          >
            <div className="px-5 py-3 text-sm font-bold text-slate-800">{row[0]}</div>
            <div className="px-5 py-3"><Cell v={row[1]} /></div>
            <div className="px-5 py-3"><Cell v={row[2]} /></div>
            <div className="px-5 py-3 bg-indigo-50/50"><Cell v={row[3]} /></div>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-6 mt-6">
        <span className="text-[10px] font-bold text-slate-500 tracking-widest uppercase">Legend</span>
        <div className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-500" /><span className="text-xs text-slate-700">Yes</span></div>
        <div className="flex items-center gap-1.5"><div className="w-4 h-4 rounded-full border-2 border-amber-500 flex items-center justify-center"><div className="w-1 h-1 rounded-full bg-amber-500" /></div><span className="text-xs text-slate-700">Partial</span></div>
        <div className="flex items-center gap-1.5"><div className="w-4 h-4 rounded-full border-2 border-slate-300" /><span className="text-xs text-slate-700">No</span></div>
      </div>
    </SlideShell>
  );
};

// 16 — Voices
export const SlideVoices = () => {
  const quotes = [
    {
      q: 'We replaced four systems and a year of spreadsheet wrangling. Our first prediction caught a transformer failure two weeks out.',
      who: 'Director of Engineering',
      org: 'Regional water authority',
      stat: '$640k saved · year 1',
    },
    {
      q: 'AssetMind drafted our entire monthly board pack. Numbers tied out perfectly. My CFO asked who built it.',
      who: 'Asset Manager',
      org: 'Council, 1,200+ assets',
      stat: '12 hrs / month back',
    },
    {
      q: 'I ran a 10-year scenario in front of councillors live. Three sliders. They funded the program in the next meeting.',
      who: 'Chief Operating Officer',
      org: 'Transport infrastructure',
      stat: '+$3.2M funded',
    },
    {
      q: 'My team finally trusts the data. The mobile app works in tunnels. Auto follow-up WOs are a game changer.',
      who: 'Field Operations Lead',
      org: 'Utilities · 6 depots',
      stat: '3.2× faster cycle',
    },
  ];
  return (
    <SlideShell kicker="· Customer voices" title="What they tell their boards." className="bg-slate-50">
      <div className="grid grid-cols-2 gap-5">
        {quotes.map((qd) => (
          <motion.div
            key={qd.who}
            whileHover={{ y: -2 }}
            className="bg-white rounded-2xl border border-slate-200 border-l-4 border-l-indigo-500 p-6 relative"
          >
            <Quote className="absolute top-4 right-4 w-8 h-8 text-indigo-100" />
            <p className="text-base text-slate-800 leading-snug mb-4 pr-8">"{qd.q}"</p>
            <div className="flex items-end justify-between">
              <div>
                <div className="text-sm font-bold text-slate-900">{qd.who}</div>
                <div className="text-xs text-slate-500">{qd.org}</div>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[11px] font-bold">
                {qd.stat}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </SlideShell>
  );
};

// 17 — Impact
export const SlideImpact = () => (
  <SlideShell
    kicker="· Outcomes & ROI"
    title="Payback in under 4 months. Typical."
    subtitle="The numbers customers actually report — within 90 days of go-live."
  >
    <div className="grid grid-cols-4 gap-3 mb-6">
      {[
        ['68%', 'Fewer surprise failures', 'text-emerald-400'],
        ['3.2×', 'Faster WO cycle', 'text-sky-400'],
        ['$1.4M', 'Verified savings / yr', 'text-amber-400'],
        ['94%', 'Compliance on-time', 'text-violet-400'],
      ].map(([v, l, c]) => (
        <div key={l} className="bg-slate-900 rounded-2xl p-6 text-center">
          <div className={`text-4xl md:text-5xl font-bold ${c} tabular-nums mb-2`}>{v}</div>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{l}</div>
        </div>
      ))}
    </div>
    <div className="bg-slate-900 text-white rounded-2xl p-6 border-l-4 border-indigo-500">
      <div className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest mb-1">
        ROI Math · 1,000-asset portfolio
      </div>
      <div className="text-xl md:text-2xl font-bold mb-5">Payback in under 4 months — typical.</div>
      <div className="space-y-2">
        {[
          ['Reactive callouts prevented', '120 / yr', '$640k', false],
          ['Planned maintenance optimised', '20% labour cut', '$310k', false],
          ['Capital deferrals (condition-based)', '15 assets', '$450k', false],
          ['Total annual benefit', '', '$1.40M', true],
        ].map(([a, b, c, total]) => (
          <div
            key={a}
            className={`grid grid-cols-[2fr_1fr_1fr] items-center py-2 ${total ? 'border-t border-slate-700 mt-2 pt-3' : ''}`}
          >
            <div className={`text-sm ${total ? 'font-bold text-white' : 'text-slate-300'}`}>{a}</div>
            <div className="text-sm text-slate-400">{b}</div>
            <div className={`text-sm font-bold text-right ${total ? 'text-emerald-400 text-lg' : 'text-indigo-300'}`}>{c}</div>
          </div>
        ))}
      </div>
    </div>
  </SlideShell>
);

// 18 — Roadmap
export const SlideRoadmap = () => {
  const phases = [
    ['WEEK 1', 'Onboard & import', 'Connect data sources, import asset register, configure roles and locations.', 'bg-sky-500'],
    ['WEEK 2', 'Inspect & scan', 'Run first LiDAR/photogrammetry scans. AI defect detection live.', 'bg-violet-500'],
    ['WEEK 3', 'Predict & schedule', 'Failure forecasts go live. Predictive WOs auto-generating.', 'bg-indigo-500'],
    ['WEEK 4', 'Report & prove', 'First board-ready briefing. Savings ledger tracking outcomes.', 'bg-emerald-500'],
  ];
  return (
    <SlideShell
      kicker="· Get started"
      title="Day 1 to first savings — in four moves."
      subtitle="A predictable, low-risk path from kickoff to verified ROI."
    >
      <div className="grid grid-cols-4 gap-4 mb-6">
        {phases.map(([w, t, b, c]) => (
          <div key={w} className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
            <span className={`inline-block px-2.5 py-1 rounded-md ${c} text-white text-[10px] font-bold tracking-wider mb-4`}>
              {w}
            </span>
            <div className="text-lg font-bold text-slate-900 mb-2">{t}</div>
            <div className="text-sm text-slate-600 leading-relaxed">{b}</div>
          </div>
        ))}
      </div>
      <div className="bg-slate-900 text-white rounded-xl p-5 border-l-4 border-emerald-500 text-center">
        <div className="text-base md:text-lg font-bold">
          Day 30 · Live portfolio · predictions running · WOs auto-generating · savings tracking.
        </div>
      </div>
    </SlideShell>
  );
};

// 19 — CTA
export const SlideCTA = () => (
  <div className="w-full h-full bg-slate-950 text-white relative overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-slate-950 to-slate-950" />
    <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500" />
    <div className="absolute right-0 top-0 w-1/2 h-full opacity-20" style={{
      backgroundImage: 'radial-gradient(circle, #6366f1 1px, transparent 1px)',
      backgroundSize: '20px 20px',
    }} />
    <div className="relative h-full flex flex-col justify-center px-12 md:px-24 py-16 max-w-5xl">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 mb-8"
      >
        <span className="text-[11px] font-bold tracking-[0.3em] text-indigo-300 uppercase">
          Let's talk
        </span>
        <div className="h-px w-12 bg-indigo-500" />
      </motion.div>
      <motion.h1
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-5xl md:text-7xl lg:text-8xl font-bold leading-[0.95] tracking-tight mb-8 text-balance"
      >
        See AssetStack<br />
        <span className="text-indigo-300">on your data.</span>
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-lg md:text-xl text-slate-400 max-w-2xl mb-10"
      >
        Book a 30-minute walkthrough. We'll import a sample of your assets and show you the first set of AI predictions live, on screen, in the call.
      </motion.p>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex flex-wrap gap-2 mb-10"
      >
        {['Live import demo', 'AI predictions', 'WO automation', 'Q&A with engineering'].map((p) => (
          <span key={p} className="px-4 py-2 rounded-full bg-indigo-950 text-indigo-200 text-sm font-bold border border-indigo-900">
            {p}
          </span>
        ))}
      </motion.div>
      <motion.button
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        onClick={() => {
          const el = document.getElementById('contact');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
          else window.location.href = '/Landing#contact';
        }}
        className="self-start bg-indigo-500 hover:bg-indigo-400 transition-colors text-white text-lg font-bold rounded-xl px-8 py-4 flex items-center gap-2"
      >
        Book a demo
        <ChevronRight className="w-5 h-5" />
      </motion.button>
      <div className="absolute bottom-12 left-12 md:left-24 right-12 md:right-24 pt-6 border-t border-slate-800 flex items-end justify-between">
        <div>
          <div className="text-sm font-bold tracking-widest">ASSETSTACK</div>
          <div className="text-xs text-slate-400 mt-1">AI Asset Intelligence Platform · assetstack.ai</div>
        </div>
        <div className="text-xs text-slate-500">© 2026 AssetStack. All rights reserved.</div>
      </div>
    </div>
  </div>
);