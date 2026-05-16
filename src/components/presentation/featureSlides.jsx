import React from 'react';
import { motion } from 'framer-motion';
import {
  Database, Wrench, Banknote, Radio, Smartphone, GitBranch, MapPin, FileText,
  ClipboardCheck, Calendar, Users, Package, AlertCircle, TrendingUp, Filter,
  CheckCircle2, Camera, WifiOff, Brain, ShieldCheck, Activity, Search, Edit3,
} from 'lucide-react';
import SlideShell from './SlideShell';
import {
  AssetRegisterMock,
  MaintenanceBoardMock,
  FinanceHubMock,
  SensorStreamMock,
  FieldOpsMock,
} from './mockups/FeatureMockups';

/* ============================================================
   ASSET REGISTER & HIERARCHY
   ============================================================ */
export const SlideAssetRegister = () => (
  <SlideShell
    kicker="· Pillar 01 · Asset register"
    title="Every asset you own. One defensible record."
    subtitle="Register · hierarchy · network globe · locations. Every asset linked to its sensors, scans, work orders, photos, docs and budget line. Filter, sort, bulk-edit thousands in one screen."
  >
    <div className="grid grid-cols-5 gap-6 h-full">
      <div className="col-span-3 h-full max-h-[460px]">
        <AssetRegisterMock />
      </div>
      <div className="col-span-2 grid grid-cols-1 gap-2.5 content-start">
        {[
          ['Register table', 'Filter, sort, bulk-edit thousands of assets at once.', Database],
          ['Hierarchy tree', 'Council → site → system → asset → component.', GitBranch],
          ['Network globe', 'Geo view of every depot, station, building, asset.', MapPin],
          ['Smart filters', 'Save views by health, risk, age, type, location.', Filter],
          ['Asset detail', 'Sensors, scans, WO history, photos, depreciation, docs.', FileText],
          ['Bulk update', 'Reassign, retag, recondition hundreds in one action.', Edit3],
        ].map(([t, b, Icon]) => (
          <div key={t} className="bg-white border border-slate-200 border-l-2 border-l-sky-500 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Icon className="w-3.5 h-3.5 text-sky-500" />
              <div className="text-sm font-bold text-slate-900">{t}</div>
            </div>
            <div className="text-xs text-slate-600 leading-snug">{b}</div>
          </div>
        ))}
      </div>
    </div>
  </SlideShell>
);

/* ============================================================
   MAINTENANCE HUB
   ============================================================ */
export const SlideMaintenance = () => (
  <SlideShell
    kicker="· Pillar 02 · Maintenance task management"
    title="Plan it. Dispatch it. Close it. Prove it."
    subtitle="Scheduled, predictive and corrective — one workflow. Templates for recurring work, AI for predictive scheduling, skill-based assignment, dynamic checklists, live chat per job, full audit trail."
  >
    <div className="grid grid-cols-5 gap-6 h-full">
      <div className="col-span-3 h-full max-h-[440px]">
        <MaintenanceBoardMock />
      </div>
      <div className="col-span-2 space-y-2.5">
        {[
          ['Maintenance planner', 'Calendar + AI optimiser balances workload across teams.', Calendar],
          ['Templates library', 'Per asset-type playbooks with checklists & parts list.', ClipboardCheck],
          ['Predictive scheduler', 'Sensor & condition triggers spawn WOs automatically.', Brain],
          ['Technician matching', 'Skill, cert, location & current load — auto-assigned.', Users],
          ['Parts & inventory', 'Auto-reorder when stock dips. Linked to suppliers.', Package],
          ['Audit trail', 'Every status, comment, photo, sign-off — timestamped.', ShieldCheck],
        ].map(([t, b, Icon]) => (
          <div key={t} className="bg-white border border-slate-200 border-l-2 border-l-emerald-500 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Icon className="w-3.5 h-3.5 text-emerald-500" />
              <div className="text-sm font-bold text-slate-900">{t}</div>
            </div>
            <div className="text-xs text-slate-600 leading-snug">{b}</div>
          </div>
        ))}
      </div>
    </div>
  </SlideShell>
);

/* ============================================================
   FINANCE HUB
   ============================================================ */
export const SlideFinanceHub = () => (
  <SlideShell
    kicker="· Finance hub"
    title="The CFO's screen, finally tied to the asset register."
    subtitle="Valuation, depreciation, capital plan, defect backlog, cost variance, funding optimisation — all driven by live condition data, not age."
  >
    <div className="grid grid-cols-5 gap-6 h-full">
      <div className="col-span-2 h-full max-h-[460px]">
        <FinanceHubMock />
      </div>
      <div className="col-span-3 grid grid-cols-2 gap-2.5 content-start">
        {[
          ['Valuation engine', 'GBV, WDV, depreciation by useful-life curve, per-asset.', Banknote],
          ['Capital plan', 'Drag-to-defer renewal timeline, risk-scored.', Calendar],
          ['Defect backlog', 'Every defect dollar-tagged & age-bucketed.', AlertCircle],
          ['Cost center', 'Budgets, commitments, actuals, forecast — live.', Activity],
          ['Funding optimiser', 'Allocate $ for maximum risk reduction.', TrendingUp],
          ['Scenario modeller', '10-yr what-if: budget, inflation, climate stress.', Brain],
          ['Variance alerts', 'Auto-flag over/under spend by category.', AlertCircle],
          ['Board-pack export', 'CFO-ready PDF on demand, ratios included.', FileText],
        ].map(([t, b, Icon]) => (
          <div key={t} className="bg-white border border-slate-200 border-l-2 border-l-amber-500 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Icon className="w-3.5 h-3.5 text-amber-500" />
              <div className="text-sm font-bold text-slate-900">{t}</div>
            </div>
            <div className="text-xs text-slate-600 leading-snug">{b}</div>
          </div>
        ))}
      </div>
    </div>
  </SlideShell>
);

/* ============================================================
   SENSORS & IOT
   ============================================================ */
export const SlideSensors = () => (
  <SlideShell
    kicker="· Sensors & IoT"
    title="Plug in any signal. The anomaly finds you."
    subtitle="Vibration, temperature, current, flow, pressure, strain, settlement, chloride — push via API or MQTT, upload CSV, or stream MQTT. AssetMind learns the baseline and alerts on deviation."
  >
    <div className="grid grid-cols-2 gap-8 h-full">
      <div className="h-full max-h-[460px]">
        <SensorStreamMock />
      </div>
      <div className="flex flex-col justify-center">
        <div className="text-sm font-bold text-slate-900 mb-3">27 sensor types supported</div>
        <div className="flex flex-wrap gap-1.5 mb-6">
          {['Vibration', 'Temperature', 'Pressure', 'Current', 'Voltage', 'Flow', 'RPM', 'Humidity', 'Noise', 'Oil quality', 'Strain', 'Crack width', 'Tilt', 'Settlement', 'Chloride', 'Seismic', 'Wind speed', 'Rail profile'].map((s) => (
            <span key={s} className="px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 text-[11px] font-bold">{s}</span>
          ))}
        </div>
        <div className="space-y-2.5">
          {[
            ['API & MQTT ingestion', 'REST endpoint or broker — your choice.'],
            ['CSV bulk upload', 'Drop historic logs, AssetMind backfills.'],
            ['Real-time anomaly detection', 'Per-sensor thresholds + ML baselines.'],
            ['Auto link to condition', 'Sensor spikes feed into health scores.'],
            ['Sensor-to-WO automation', 'Threshold breach → drafted work order.'],
          ].map(([t, b]) => (
            <div key={t} className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
              <div>
                <span className="text-sm font-bold text-slate-900">{t}</span>
                <span className="text-sm text-slate-600"> · {b}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </SlideShell>
);

/* ============================================================
   FIELD OPS — MOBILE
   ============================================================ */
export const SlideFieldOps = () => (
  <SlideShell
    kicker="· Field ops"
    title="The phone is the system. Even in the tunnel."
    subtitle="Inspectors, technicians, contractors work from their device — fully offline-first. Photo defects with on-device AI, dynamic checklists, sign-offs, instant sync."
  >
    <div className="grid grid-cols-2 gap-6 h-full">
      <div className="h-full max-h-[460px]">
        <FieldOpsMock />
      </div>
      <div className="grid grid-cols-1 gap-2.5 content-center">
        {[
          ['Offline-first', 'Tunnels, basements, remote sites — queue & sync later.', WifiOff],
          ['Photo defect AI', 'Snap a photo · AssetMind classifies & severity-scores.', Camera],
          ['Dynamic checklists', 'Per asset-type, with required photos and signatures.', ClipboardCheck],
          ['Field survey mode', 'Walk a site → fresh inspections logged per asset.', MapPin],
          ['Photo diff', 'Side-by-side change detection between visits.', Search],
          ['Inspection cycles', 'Auto schedules per regulation & condition.', Calendar],
          ['Contractor portal', 'External crews see only their jobs, with sign-off.', Users],
          ['Photo library', 'Searchable archive per asset, tagged & timestamped.', Camera],
        ].map(([t, b, Icon]) => (
          <div key={t} className="bg-white border border-slate-200 border-l-2 border-l-indigo-500 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Icon className="w-3.5 h-3.5 text-indigo-500" />
              <div className="text-sm font-bold text-slate-900">{t}</div>
            </div>
            <div className="text-xs text-slate-600 leading-snug">{b}</div>
          </div>
        ))}
      </div>
    </div>
  </SlideShell>
);