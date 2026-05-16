import React from 'react';
import { motion } from 'framer-motion';
import {
  MessageSquare, Users, Shield, UserCircle, Cpu, GitBranch, Globe2, MapPin,
  Box, Radio, Rocket, Wrench, CalendarClock, Brain, Package, Building2,
  ShieldCheck, TrendingDown, Banknote, AlertOctagon, Target, FlaskConical,
  Wallet, CalendarDays, Smartphone, ClipboardCheck, Edit3, Camera, Filter,
  TrendingUp, Waves, ShieldAlert, BarChart3, FileText, Briefcase, Hammer,
  Sparkles, Zap, CheckCircle2, ArrowRight, Activity, Layers,
} from 'lucide-react';
import SlideShell from './SlideShell';

/* Reusable module slide layout — keeps every module slide visually consistent */
function ModuleSlide({ kicker, title, subtitle, accent, headline, features, stats }) {
  const accentMap = {
    indigo:  { bar: 'border-l-indigo-500',  text: 'text-indigo-600',  tint: 'bg-indigo-50',  ring: 'ring-indigo-500' },
    sky:     { bar: 'border-l-sky-500',     text: 'text-sky-600',     tint: 'bg-sky-50',     ring: 'ring-sky-500' },
    emerald: { bar: 'border-l-emerald-500', text: 'text-emerald-600', tint: 'bg-emerald-50', ring: 'ring-emerald-500' },
    amber:   { bar: 'border-l-amber-500',   text: 'text-amber-600',   tint: 'bg-amber-50',   ring: 'ring-amber-500' },
    violet:  { bar: 'border-l-violet-500',  text: 'text-violet-600',  tint: 'bg-violet-50',  ring: 'ring-violet-500' },
    rose:    { bar: 'border-l-rose-500',    text: 'text-rose-600',    tint: 'bg-rose-50',    ring: 'ring-rose-500' },
    fuchsia: { bar: 'border-l-fuchsia-500', text: 'text-fuchsia-600', tint: 'bg-fuchsia-50', ring: 'ring-fuchsia-500' },
    slate:   { bar: 'border-l-slate-700',   text: 'text-slate-700',   tint: 'bg-slate-50',   ring: 'ring-slate-700' },
  };
  const c = accentMap[accent] || accentMap.indigo;
  return (
    <SlideShell kicker={kicker} title={title} subtitle={subtitle}>
      <div className="grid grid-cols-5 gap-6 h-full">
        {/* Left: headline + stats */}
        <div className="col-span-2 flex flex-col">
          <div className={`${c.tint} border border-slate-200 rounded-2xl p-5 mb-4`}>
            <div className={`text-[10px] font-bold tracking-[0.2em] uppercase ${c.text} mb-2`}>
              What it gives you
            </div>
            <div className="text-xl font-bold text-slate-900 leading-snug">{headline}</div>
          </div>
          {stats && (
            <div className="grid grid-cols-2 gap-2">
              {stats.map(([v, l]) => (
                <div key={l} className="bg-white border border-slate-200 rounded-lg p-3">
                  <div className={`text-2xl font-bold tabular-nums ${c.text}`}>{v}</div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">{l}</div>
                </div>
              ))}
            </div>
          )}
        </div>
        {/* Right: feature grid */}
        <div className="col-span-3 grid grid-cols-2 gap-2.5 content-start">
          {features.map(([t, b, Icon], i) => (
            <motion.div
              key={t}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className={`bg-white border border-slate-200 border-l-2 ${c.bar} rounded-lg p-3`}
            >
              <div className="flex items-center gap-2 mb-1">
                <Icon className={`w-3.5 h-3.5 ${c.text}`} />
                <div className="text-sm font-bold text-slate-900">{t}</div>
              </div>
              <div className="text-xs text-slate-600 leading-snug">{b}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </SlideShell>
  );
}

/* ============================================================
   01 · MODULES OVERVIEW — chapter opener
   ============================================================ */
export const SlideModulesOverview = () => {
  const modules = [
    ['AssetMind',     'AI command centre',       MessageSquare, 'violet'],
    ['People',        'Roles · teams · profiles',Users,         'sky'],
    ['Assets',        'Register · twin · scans', Cpu,           'sky'],
    ['Delivery',      'Projects · EVM · S-curve',Rocket,        'fuchsia'],
    ['Operations',    'WO · parts · compliance', Wrench,        'emerald'],
    ['Finance',       'Capital · cost · savings',Banknote,      'amber'],
    ['Field Ops',     'Mobile · photos · audits',Smartphone,    'indigo'],
    ['Intelligence',  'Forecasts · risk · ML',   Brain,         'rose'],
    ['Contractor Hub','Jobs · portal · sign-off',Briefcase,     'slate'],
  ];
  const tints = {
    violet: 'bg-violet-50 text-violet-700',
    sky: 'bg-sky-50 text-sky-700',
    fuchsia: 'bg-fuchsia-50 text-fuchsia-700',
    emerald: 'bg-emerald-50 text-emerald-700',
    amber: 'bg-amber-50 text-amber-700',
    indigo: 'bg-indigo-50 text-indigo-700',
    rose: 'bg-rose-50 text-rose-700',
    slate: 'bg-slate-100 text-slate-700',
  };
  return (
    <SlideShell
      kicker="· The platform tour"
      title="Nine modules. One shared data model."
      subtitle="Every module reads from — and writes to — the same record. Nothing duplicated. Nothing siloed. You'll see each one in the next nine slides."
    >
      <div className="grid grid-cols-3 gap-4">
        {modules.map(([name, desc, Icon, color], i) => (
          <motion.div
            key={name}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white border border-slate-200 rounded-2xl p-5 flex items-start gap-3"
          >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${tints[color]}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] font-bold tabular-nums text-slate-400 tracking-widest">
                {String(i + 1).padStart(2, '0')}
              </div>
              <div className="text-base font-bold text-slate-900 leading-tight">{name}</div>
              <div className="text-xs text-slate-500 mt-0.5">{desc}</div>
            </div>
          </motion.div>
        ))}
      </div>
      <div className="mt-6 bg-slate-900 text-white rounded-xl p-4 flex items-center justify-between">
        <div className="text-sm font-bold">
          One record. Nine surfaces. Zero reconciliation.
        </div>
        <div className="flex items-center gap-2 text-[11px] text-indigo-300 font-bold tracking-widest uppercase">
          <Sparkles className="w-3.5 h-3.5" />
          Tour starts next
        </div>
      </div>
    </SlideShell>
  );
};

/* ============================================================
   01 · ASSETMIND
   ============================================================ */
export const SlideModuleAssetMind = () => (
  <ModuleSlide
    kicker="· Module 01 · AssetMind"
    title="The AI that runs the platform."
    subtitle="Plain-English chat with read/write access across every record. AssetMind plans, queries, executes and reports — autonomously."
    accent="violet"
    headline="Ask once. AssetMind drafts the WO, books the tech, orders the part, sends the email — and shows the receipt."
    features={[
      ['Plain-English ops',  'Forecast failures, draft WOs, brief the board.',     MessageSquare],
      ['Full read/write',    'Acts across every entity — assets to finance.',      Zap],
      ['38 AI pipelines',    'Vision, prediction, cost, compliance, scheduling.',  Brain],
      ['Morning briefing',   'Auto-generated daily summary for ops & exec.',       Sparkles],
      ['Saved chats',        'Searchable history, share with team, audit trail.',  Activity],
      ['Suggested actions',  'Proactive prompts based on portfolio state.',        CheckCircle2],
    ]}
    stats={[
      ['38', 'AI pipelines'],
      ['<2s', 'Avg response'],
      ['24/7', 'Always on'],
      ['100%', 'Auditable'],
    ]}
  />
);

/* ============================================================
   02 · PEOPLE
   ============================================================ */
export const SlideModulePeople = () => (
  <ModuleSlide
    kicker="· Module 02 · People"
    title="Your team, organised the way the work actually flows."
    subtitle="Profiles, roles, manager view, team directory — wired to every job, every certification, every kudos."
    accent="sky"
    headline="From technician profile to manager view to board-level RACI — one consistent people layer."
    features={[
      ['My Profile',       'Skills, certs, schedule, badges, recent work.',     UserCircle],
      ['Manager view',     'Team workload, performance, alerts at a glance.',   Shield],
      ['Team directory',   'Find the right tech by skill, cert or location.',   Users],
      ['Roles & access',   'Granular per-role permissions, deny-by-default.',   ShieldCheck],
      ['Performance KPIs', 'First-time-fix, on-time, cost-saved per person.',   TrendingUp],
      ['Kudos & badges',   'Peer recognition wired to performance metrics.',    Sparkles],
    ]}
    stats={[
      ['Per-role', 'Permissions'],
      ['5 levels', 'Cert tiers'],
      ['Live', 'Workload'],
      ['Auditable', 'Every change'],
    ]}
  />
);

/* ============================================================
   03 · ASSETS
   ============================================================ */
export const SlideModuleAssets = () => (
  <ModuleSlide
    kicker="· Module 03 · Assets"
    title="Every asset you own — one defensible record."
    subtitle="Register, hierarchy, network globe, digital twin, scans, sensors and locations — connected to every job, photo, doc and dollar."
    accent="sky"
    headline="From the council-level globe down to the bearing inside the pump — two clicks, one source of truth."
    features={[
      ['Equipment register', 'Filter, sort, bulk-edit thousands of assets.',     Cpu],
      ['Asset tree',         'Council → site → system → asset → component.',     GitBranch],
      ['Network globe',      'Geo view of every depot, station, asset.',         Globe2],
      ['Locations',          'Sites, buildings, depots — geo-tagged.',           MapPin],
      ['Digital twin',       'BIM, LiDAR, photogrammetry mapped to assets.',     Box],
      ['Scan analysis',      'AI vision finds defects inside every scan.',       Sparkles],
      ['Sensors',            '27 sensor types streamed via API, MQTT or CSV.',   Radio],
      ['Smart filters',      'Saved views by health, risk, age, type.',          Filter],
    ]}
    stats={[
      ['27', 'Sensor types'],
      ['1,000s', 'Assets / minute'],
      ['Live', 'Health score'],
      ['Geo', 'Mapped'],
    ]}
  />
);

/* ============================================================
   04 · DELIVERY (Projects)
   ============================================================ */
export const SlideModuleDelivery = () => (
  <ModuleSlide
    kicker="· Module 04 · Delivery"
    title="Capital projects, delivered on time and on budget."
    subtitle="EVM-grade project tracking — Schedule (SPI) and Cost (CPI) Performance Indices, S-curves, critical path and portfolio heatmap. Primavera-class, without the licence."
    accent="fuchsia"
    headline="Every renewal, upgrade and grant-funded project — tracked against the asset register and the savings ledger."
    features={[
      ['EVM analysis',       'SPI, CPI, TCPI, EAC, VAC — PMI-standard.',         BarChart3],
      ['S-curve forecast',   'Planned vs Earned vs Actual, with EAC.',           TrendingUp],
      ['Critical path',      'Auto-detected zero-slack phases.',                 GitBranch],
      ['Portfolio heatmap',  'CPI × SPI bubble plot across all projects.',       Activity],
      ['AI scope composer',  'Draft scope, phases, risks from a prompt.',        Sparkles],
      ['Cap-plan → project', 'Promote any capital line item in one click.',      ArrowRight],
      ['Risk register',      'Likelihood × impact with mitigation owners.',      AlertOctagon],
      ['Roll-up costs',      'WO actuals stream into project actuals live.',     Wallet],
    ]}
    stats={[
      ['SPI · CPI', 'EVM live'],
      ['EAC', 'Forecast'],
      ['Auto', 'WO roll-up'],
      ['1-click', 'Cap → project'],
    ]}
  />
);

/* ============================================================
   05 · OPERATIONS
   ============================================================ */
export const SlideModuleOperations = () => (
  <ModuleSlide
    kicker="· Module 05 · Operations"
    title="Plan. Dispatch. Close. Prove."
    subtitle="Maintenance, planning, predictions, parts, suppliers, compliance, depreciation, savings — the entire ops engine, in one workflow."
    accent="emerald"
    headline="Every job — preventive, predictive, corrective, emergency — runs through one auditable pipeline."
    features={[
      ['Maintenance hub',    'Scheduled · predictive · corrective in one board.',Wrench],
      ['AI planner',         'Optimises workload, skills and locations.',        CalendarClock],
      ['Predictions',        'Failure probability + RUL per asset.',             Brain],
      ['Spare parts',        'Auto-reorder, lead time, criticality.',            Package],
      ['Suppliers',          'POs, SLAs, performance scoring.',                  Building2],
      ['Compliance',         'AS, ISO, NFPA — pre-loaded & auto-WO\'d.',        ShieldCheck],
      ['Depreciation',       'Per-asset WDV, schedules, AAS-aligned.',           TrendingDown],
      ['Savings ledger',     'Every prevented failure — dollar-tagged.',         CheckCircle2],
    ]}
    stats={[
      ['3.2×', 'Faster cycle'],
      ['68%', 'Fewer failures'],
      ['Auto', 'Reorder'],
      ['$1.4M', 'YTD saved'],
    ]}
  />
);

/* ============================================================
   06 · FINANCE
   ============================================================ */
export const SlideModuleFinance = () => (
  <ModuleSlide
    kicker="· Module 06 · Finance"
    title="The CFO screen, finally tied to the asset register."
    subtitle="Valuation, capital plan, defect backlog, funding optimiser, scenario modeller, cost center — all driven by live condition data, not age."
    accent="amber"
    headline="Defer a renewal? You see the 10-year cost in 10 seconds — risk-scored, climate-stressed, board-ready."
    features={[
      ['Finance hub',        'CFO ratios, variance alerts, board pack export.',  Banknote],
      ['Valuation',          'GBV, WDV, depreciation per useful-life curve.',    Banknote],
      ['Capital plan',       'Drag-to-defer renewals, risk-scored, by year.',    CalendarDays],
      ['Defect backlog',     'Every defect dollar-tagged & age-bucketed.',       AlertOctagon],
      ['Funding optimiser',  'Allocate $ for maximum risk reduction.',           Target],
      ['Scenario modeller',  '10-yr what-if: budget, inflation, climate.',       FlaskConical],
      ['Cost center',        'Budgets, commitments, actuals, forecast live.',    Wallet],
      ['Variance alerts',    'Auto-flag over/under spend by category.',          Activity],
    ]}
    stats={[
      ['10s', 'Scenario re-run'],
      ['Risk-scored', 'Cap plan'],
      ['Live', 'Variance'],
      ['Board-ready', 'Export'],
    ]}
  />
);

/* ============================================================
   07 · FIELD OPS
   ============================================================ */
export const SlideModuleFieldOps = () => (
  <ModuleSlide
    kicker="· Module 07 · Field Ops"
    title="The phone is the system. Even in the tunnel."
    subtitle="Field survey, inspection cycles, bulk update, photo library, photo diff, smart filters — built for technicians and inspectors who work where signal doesn't."
    accent="indigo"
    headline="Offline-first by design. Snap, sign, sync — every photo tagged, every defect found, every record proven."
    features={[
      ['Field survey',       'Walk a site, log fresh inspections per asset.',    Smartphone],
      ['Inspection cycles',  'Auto-schedules per regulation & condition.',       ClipboardCheck],
      ['Bulk update',        'Reassign, retag, recondition hundreds at once.',   Edit3],
      ['Photo library',      'Searchable archive, tagged, timestamped, geo.',    Camera],
      ['Photo diff',         'Side-by-side change detection between visits.',    Filter],
      ['Smart filters',      'Save views — by health, risk, status, age.',       Filter],
      ['Offline-first',      'Queue & sync, even in tunnels & basements.',       Layers],
      ['Photo defect AI',    'On-device classifier + severity score.',           Camera],
    ]}
    stats={[
      ['Offline', 'Always'],
      ['Geo-tagged', 'Every photo'],
      ['AI', 'On-device'],
      ['1-tap', 'Sign-off'],
    ]}
  />
);

/* ============================================================
   08 · INTELLIGENCE
   ============================================================ */
export const SlideModuleIntelligence = () => (
  <ModuleSlide
    kicker="· Module 08 · Intelligence"
    title="Forecasts, risk, and ML — all in plain sight."
    subtitle="Portfolio insights, cohort performance, defect cascade, climate risk, data quality, analytics, reports, ML models. The decision-grade layer above your data."
    accent="rose"
    headline="See the storm before it hits. Spot the cohort that's failing. Quantify the model drift."
    features={[
      ['Portfolio insights', 'Health, risk, age trends across the fleet.',       Brain],
      ['Cohort performance', 'Compare assets by type, vintage, location.',       TrendingUp],
      ['Defect cascade',     'Predict which assets fail next after a failure.',  GitBranch],
      ['Climate risk',       'Heat, flood, wind, settlement stress modelling.',  Waves],
      ['Data quality',       'Missing fields, stale records, duplicates flagged.',ShieldAlert],
      ['Analytics',          'Custom KPIs, dashboards, drill-downs.',            BarChart3],
      ['Reports',            'Board-ready PDFs, exec briefs, audit packs.',      FileText],
      ['ML models',          'Drift monitor, retraining, accuracy tracking.',    Brain],
    ]}
    stats={[
      ['Live', 'Drift monitor'],
      ['Custom', 'Dashboards'],
      ['Climate', 'Stress test'],
      ['Auto', 'Briefings'],
    ]}
  />
);

/* ============================================================
   09 · CONTRACTOR HUB
   ============================================================ */
export const SlideModuleContractor = () => (
  <ModuleSlide
    kicker="· Module 09 · Contractor Hub"
    title="External crews. Internal accountability."
    subtitle="Job board, contractor portal, sign-off workflow — contractors see only their work, with full audit trail back to the asset register."
    accent="slate"
    headline="Post the job. They bid. You approve. They deliver. The asset record updates itself."
    features={[
      ['Job board',          'Public board of available work, by skill & geo.',  Briefcase],
      ['Contractor portal',  'Each contractor sees only their assigned jobs.',   Hammer],
      ['Sign-off workflow',  'Photos, checklists, signatures — required.',       ClipboardCheck],
      ['Performance scoring','Rate every contractor on every job.',              TrendingUp],
      ['Insurance & certs',  'Track licences, expiry, coverage automatically.',  ShieldCheck],
      ['Auto follow-ups',    'Defects found in the field spawn WOs in seconds.', Zap],
    ]}
    stats={[
      ['Scoped', 'Access'],
      ['Signed', 'Every job'],
      ['Tracked', 'Insurance'],
      ['Audited', 'End-to-end'],
    ]}
  />
);