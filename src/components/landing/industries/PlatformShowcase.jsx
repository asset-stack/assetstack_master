import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  MessageSquare, GitBranch, Globe2, Sparkles, Box, ShieldCheck, ArrowRight,
} from 'lucide-react';

/**
 * Platform Showcase — interactive tabbed module that lets visitors
 * preview each major surface of the AssetStack product (AssetMind chat,
 * Asset Tree, Network Globe, Scan Analysis, Digital Twin, Savings Ledger).
 *
 * Every tab links to the live page inside the app — proving the product is real.
 */

const MODULES = [
  {
    id: 'assetmind',
    name: 'AssetMind',
    sub: 'Conversational AI',
    icon: MessageSquare,
    headline: 'Ask anything about your assets.',
    blurb: 'Your fleet, in plain English. AssetMind reads your live data, surfaces risk, and drafts work orders on demand.',
    href: '/AIAssistant',
    cta: 'Open AssetMind',
    accent: 'from-blue-500 to-indigo-600',
  },
  {
    id: 'tree',
    name: 'Asset Tree',
    sub: 'Hierarchy & coverage',
    icon: GitBranch,
    headline: 'Every asset, mapped.',
    blurb: 'Drill from sites to systems to the smallest replaceable part. Click any node — see its full history.',
    href: '/AssetTree',
    cta: 'Browse the tree',
    accent: 'from-emerald-500 to-teal-600',
  },
  {
    id: 'globe',
    name: 'Network Globe',
    sub: 'Geographic intelligence',
    icon: Globe2,
    headline: 'Distributed assets, one view.',
    blurb: 'Rail lines, substations, water mains — every node geo-located, condition-coded, and live.',
    href: '/NetworkGlobe',
    cta: 'Spin the globe',
    accent: 'from-violet-500 to-purple-600',
  },
  {
    id: 'scan',
    name: 'Scan Analysis',
    sub: 'AI condition reports',
    icon: Sparkles,
    headline: 'Photos in. Defects out.',
    blurb: 'Upload an inspection photo or LiDAR scan. AssetStack flags scratches, cracks, corrosion and wear with bounding boxes.',
    href: '/ScanAnalysis',
    cta: 'See it in action',
    accent: 'from-amber-500 to-orange-600',
  },
  {
    id: 'twin',
    name: 'Digital Twin',
    sub: '3D + floor plans',
    icon: Box,
    headline: 'Walk your assets remotely.',
    blurb: 'Geo-referenced 3D scans with hotspots tied to real assets, sensors and findings.',
    href: '/DigitalTwin',
    cta: 'Open the twin',
    accent: 'from-rose-500 to-pink-600',
  },
  {
    id: 'savings',
    name: 'Savings Ledger',
    sub: 'Verified financial proof',
    icon: ShieldCheck,
    headline: 'Prove every avoided breakdown.',
    blurb: 'Each prevented failure is logged, verified, and signed off — auditor-ready, finance-ready.',
    href: '/SavingsLedger',
    cta: 'Inspect the ledger',
    accent: 'from-sky-500 to-cyan-600',
  },
];

// Visual previews — pure CSS/SVG-driven mockups for each module.
function ModulePreview({ id }) {
  if (id === 'assetmind') return <AssetMindPreview />;
  if (id === 'tree') return <AssetTreePreview />;
  if (id === 'globe') return <NetworkGlobePreview />;
  if (id === 'scan') return <ScanPreview />;
  if (id === 'twin') return <TwinPreview />;
  if (id === 'savings') return <SavingsPreview />;
  return null;
}

function AssetMindPreview() {
  return (
    <div className="h-full w-full p-5 md:p-7 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 flex flex-col gap-3 text-white">
      <div className="flex items-center gap-2 pb-2 border-b border-white/10">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center">
          <MessageSquare className="w-3.5 h-3.5" />
        </div>
        <span className="text-[12px] font-semibold">AssetMind</span>
        <span className="ml-auto text-[10px] text-white/40">Live</span>
      </div>
      <div className="flex-1 space-y-3 overflow-hidden">
        <div className="flex justify-end">
          <div className="bg-blue-500 rounded-xl rounded-tr-sm px-3 py-2 max-w-[70%] text-[12px]">
            Which Bunbury assets need attention this week?
          </div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl rounded-tl-sm px-3 py-2.5 text-[12px] text-white/90 leading-relaxed max-w-[85%]">
          <div className="text-[10px] uppercase tracking-wider text-blue-300 font-semibold mb-1.5">3 priority items</div>
          <div className="space-y-1">
            <div>• <span className="text-amber-300">Library HVAC #2</span> — vibration anomaly, schedule inspection</div>
            <div>• <span className="text-amber-300">Town Hall lift</span> — service due in 4 days</div>
            <div>• <span className="text-rose-300">Park irrigation pump</span> — pressure drop, replace seal</div>
          </div>
          <div className="mt-2 pt-2 border-t border-white/10 text-[10px] text-white/60">
            Want me to draft work orders?
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10">
        <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
        <span className="text-[11px] text-white/50">Ask anything…</span>
      </div>
    </div>
  );
}

function AssetTreePreview() {
  const tree = [
    { label: 'Bunbury LGA', count: '156 assets', depth: 0, type: 'site' },
    { label: 'Library Building', count: '24', depth: 1, type: 'building' },
    { label: 'HVAC Systems', count: '8', depth: 2, type: 'system' },
    { label: 'Rooftop Unit #1', count: 'Healthy', depth: 3, type: 'asset', status: 'ok' },
    { label: 'Rooftop Unit #2', count: 'Anomaly', depth: 3, type: 'asset', status: 'warn' },
    { label: 'Town Hall', count: '42', depth: 1, type: 'building' },
  ];
  return (
    <div className="h-full w-full p-5 md:p-7 bg-white flex flex-col gap-1">
      <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
        <GitBranch className="w-4 h-4 text-emerald-600" />
        <span className="text-[12px] font-semibold text-slate-900">Asset Hierarchy</span>
        <span className="ml-auto text-[10px] text-slate-400">156 nodes</span>
      </div>
      <div className="flex-1 space-y-0.5 mt-2">
        {tree.map((n, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`flex items-center gap-2 py-1.5 px-2 rounded-md ${i === 4 ? 'bg-amber-50' : 'hover:bg-slate-50'}`}
            style={{ paddingLeft: `${n.depth * 16 + 8}px` }}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${
              n.status === 'ok' ? 'bg-emerald-500' : n.status === 'warn' ? 'bg-amber-500' : 'bg-slate-300'
            }`} />
            <span className={`text-[12px] ${n.depth === 0 ? 'font-semibold text-slate-900' : 'font-medium text-slate-700'}`}>
              {n.label}
            </span>
            <span className={`ml-auto text-[10px] ${
              n.status === 'warn' ? 'text-amber-700 font-semibold' : 'text-slate-400'
            }`}>
              {n.count}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function NetworkGlobePreview() {
  return (
    <div className="h-full w-full bg-gradient-to-br from-slate-950 via-slate-900 to-violet-950 relative overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center">
        {/* Grid globe */}
        <svg viewBox="0 0 200 200" className="w-[80%] h-[80%] opacity-70">
          <defs>
            <radialGradient id="globe-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#a78bfa" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="100" cy="100" r="80" fill="url(#globe-glow)" />
          <circle cx="100" cy="100" r="80" fill="none" stroke="#a78bfa" strokeWidth="0.5" opacity="0.5" />
          {[20, 40, 60, 80].map((r) => (
            <ellipse key={r} cx="100" cy="100" rx={r} ry="80" fill="none" stroke="#a78bfa" strokeWidth="0.3" opacity="0.4" />
          ))}
          {[20, 40, 60, 80].map((r) => (
            <ellipse key={`h${r}`} cx="100" cy="100" rx="80" ry={r} fill="none" stroke="#a78bfa" strokeWidth="0.3" opacity="0.4" />
          ))}
          {/* Asset nodes */}
          {[
            { x: 70, y: 80, color: '#10b981' },
            { x: 110, y: 70, color: '#10b981' },
            { x: 130, y: 95, color: '#f59e0b' },
            { x: 90, y: 120, color: '#10b981' },
            { x: 60, y: 110, color: '#ef4444' },
            { x: 120, y: 130, color: '#10b981' },
          ].map((p, i) => (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r="4" fill={p.color} opacity="0.3" />
              <circle cx={p.x} cy={p.y} r="2" fill={p.color} />
            </g>
          ))}
        </svg>
      </div>
      <div className="absolute top-5 left-5 right-5 flex items-center gap-2 text-white">
        <Globe2 className="w-4 h-4 text-violet-300" />
        <span className="text-[12px] font-semibold">Western Rail Network</span>
        <span className="ml-auto text-[10px] text-white/50">128 nodes · 6 zones</span>
      </div>
      <div className="absolute bottom-5 left-5 right-5 flex gap-2">
        {[
          { c: 'bg-emerald-500', l: '92 OK' },
          { c: 'bg-amber-500', l: '24 watch' },
          { c: 'bg-rose-500', l: '12 critical' },
        ].map((s) => (
          <div key={s.l} className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/10 backdrop-blur-md border border-white/10 text-[10px] text-white">
            <span className={`w-1.5 h-1.5 rounded-full ${s.c}`} />
            {s.l}
          </div>
        ))}
      </div>
    </div>
  );
}

function ScanPreview() {
  return (
    <div className="h-full w-full bg-slate-100 relative overflow-hidden">
      <img
        src="https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=900&auto=format&fit=crop&q=70"
        alt="scan"
        loading="lazy"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-slate-900/30" />
      {/* Bounding boxes */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="absolute top-[28%] left-[22%] w-[24%] h-[22%] border-2 border-amber-400 rounded-md"
      >
        <div className="absolute -top-6 left-0 px-1.5 py-0.5 bg-amber-400 rounded text-[9px] font-semibold text-slate-900 whitespace-nowrap">
          Corrosion · 87%
        </div>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="absolute top-[55%] left-[58%] w-[18%] h-[15%] border-2 border-rose-400 rounded-md"
      >
        <div className="absolute -top-6 left-0 px-1.5 py-0.5 bg-rose-400 rounded text-[9px] font-semibold text-white whitespace-nowrap">
          Crack · 92%
        </div>
      </motion.div>
      <div className="absolute top-5 left-5 right-5 flex items-center gap-2 text-white">
        <Sparkles className="w-4 h-4 text-amber-300" />
        <span className="text-[12px] font-semibold drop-shadow">AI Condition Report</span>
        <span className="ml-auto text-[10px] bg-white/15 backdrop-blur-md border border-white/20 rounded-full px-2 py-0.5">
          2 findings
        </span>
      </div>
    </div>
  );
}

function TwinPreview() {
  return (
    <div className="h-full w-full bg-gradient-to-br from-slate-50 to-slate-100 relative overflow-hidden p-5">
      <svg viewBox="0 0 300 220" className="absolute inset-0 w-full h-full">
        {/* Floor plan */}
        <rect x="20" y="20" width="260" height="180" fill="white" stroke="#cbd5e1" strokeWidth="2" />
        <line x1="120" y1="20" x2="120" y2="120" stroke="#cbd5e1" strokeWidth="1.5" />
        <line x1="20" y1="120" x2="200" y2="120" stroke="#cbd5e1" strokeWidth="1.5" />
        <line x1="200" y1="80" x2="280" y2="80" stroke="#cbd5e1" strokeWidth="1.5" />
        {/* Hotspots */}
        {[
          { x: 70, y: 70, c: '#10b981' },
          { x: 160, y: 70, c: '#f59e0b' },
          { x: 240, y: 50, c: '#10b981' },
          { x: 100, y: 160, c: '#10b981' },
          { x: 220, y: 160, c: '#ef4444' },
        ].map((h, i) => (
          <g key={i}>
            <circle cx={h.x} cy={h.y} r="10" fill={h.c} opacity="0.2">
              <animate attributeName="r" values="8;14;8" dur="2s" repeatCount="indefinite" />
            </circle>
            <circle cx={h.x} cy={h.y} r="4" fill={h.c} />
          </g>
        ))}
      </svg>
      <div className="absolute top-5 left-5 right-5 flex items-center gap-2">
        <Box className="w-4 h-4 text-rose-500" />
        <span className="text-[12px] font-semibold text-slate-900">Library — Ground Floor</span>
        <span className="ml-auto text-[10px] text-slate-500">5 hotspots</span>
      </div>
      <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between">
        <span className="text-[10px] text-slate-500">Tap any hotspot to inspect</span>
        <div className="flex items-center gap-1.5 text-[10px] text-slate-600 bg-white border border-slate-200 rounded-md px-2 py-1">
          3D · 2D · Plan
        </div>
      </div>
    </div>
  );
}

function SavingsPreview() {
  const rows = [
    { asset: 'Library HVAC #2', cost: '$28,400', status: 'verified' },
    { asset: 'Town Hall lift cable', cost: '$14,200', status: 'verified' },
    { asset: 'Pump station seal', cost: '$8,900', status: 'in_progress' },
  ];
  return (
    <div className="h-full w-full bg-white p-5 md:p-6 flex flex-col">
      <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
        <ShieldCheck className="w-4 h-4 text-sky-600" />
        <span className="text-[12px] font-semibold text-slate-900">Verified Savings Ledger</span>
        <span className="ml-auto text-[10px] font-semibold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full">
          Sample preview
        </span>
      </div>
      <div className="mt-3 mb-4">
        <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Verified this quarter</div>
        <div className="text-3xl font-bold text-slate-900 tabular-nums mt-1">$51,500</div>
        <div className="text-[11px] text-emerald-600 mt-0.5">3 prevented failures · audit-trail signed</div>
      </div>
      <div className="space-y-1.5">
        {rows.map((r, i) => (
          <motion.div
            key={r.asset}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            className="flex items-center justify-between p-2 rounded-md border border-slate-100 hover:border-slate-200 transition-colors"
          >
            <span className="text-[12px] font-medium text-slate-700 truncate">{r.asset}</span>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[12px] font-semibold tabular-nums text-slate-900">{r.cost}</span>
              <span className={`text-[9px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded ${
                r.status === 'verified' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
              }`}>
                {r.status === 'verified' ? '✓ Verified' : 'In progress'}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default function PlatformShowcase() {
  const [active, setActive] = useState(MODULES[0]);
  const ActiveIcon = active.icon;

  return (
    <section className="py-20 md:py-28 bg-gradient-to-b from-white via-slate-50/40 to-white border-y border-slate-100">
      <div className="max-w-[1280px] mx-auto px-5 md:px-8">
        <div className="max-w-2xl mb-10 md:mb-12">
          <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">The Platform</span>
          <h2 className="mt-3 text-4xl md:text-6xl font-semibold tracking-[-0.03em] leading-[1.02] text-slate-900 text-balance">
            Six surfaces.{' '}
            <span className="font-serif italic font-medium text-primary">One unified intelligence layer.</span>
          </h2>
          <p className="mt-4 text-[16px] md:text-[17px] text-slate-600 leading-[1.55] text-pretty">
            Every module below is live in the product right now. Click any tile — open it on your account.
          </p>
        </div>

        <div className="grid lg:grid-cols-[280px_1fr] gap-6">
          {/* Module rail */}
          <div className="space-y-1.5">
            {MODULES.map((m) => {
              const Icon = m.icon;
              const isActive = active.id === m.id;
              return (
                <button
                  key={m.id}
                  onMouseEnter={() => setActive(m)}
                  onFocus={() => setActive(m)}
                  onClick={() => setActive(m)}
                  className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-lg border text-left transition-all ${
                    isActive
                      ? 'bg-white border-primary/25 elevation-1'
                      : 'bg-transparent border-transparent hover:bg-white/60'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                    isActive ? `bg-gradient-to-br ${m.accent} text-white` : 'bg-slate-100 text-slate-500'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`text-[13px] font-semibold ${isActive ? 'text-slate-900' : 'text-slate-700'}`}>
                      {m.name}
                    </div>
                    <div className="text-[10px] text-slate-500 truncate">{m.sub}</div>
                  </div>
                  <ArrowRight className={`w-3.5 h-3.5 transition-all ${isActive ? 'text-primary translate-x-0' : 'text-slate-300 -translate-x-1'}`} />
                </button>
              );
            })}
          </div>

          {/* Showcase canvas */}
          <div className="relative rounded-2xl border border-slate-200 bg-white elevation-2 overflow-hidden min-h-[480px] flex flex-col">
            <AnimatePresence mode="wait">
              <motion.div
                key={active.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="grid md:grid-cols-2 flex-1"
              >
                {/* Live preview */}
                <div className="relative h-72 md:h-full overflow-hidden border-b md:border-b-0 md:border-r border-slate-100">
                  <ModulePreview id={active.id} />
                </div>

                {/* Details */}
                <div className="p-7 md:p-8 flex flex-col">
                  <div className="flex items-center gap-2 mb-4">
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${active.accent} text-white flex items-center justify-center`}>
                      <ActiveIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-[13px] font-semibold text-slate-900">{active.name}</div>
                      <div className="text-[10px] uppercase tracking-[0.12em] text-slate-500">{active.sub}</div>
                    </div>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-semibold tracking-[-0.02em] leading-[1.15] text-slate-900 text-balance">
                    {active.headline}
                  </h3>
                  <p className="mt-3 text-[14px] text-slate-600 leading-[1.6]">{active.blurb}</p>

                  <div className="mt-auto pt-6">
                    <Link
                      to={active.href}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-[13px] font-semibold transition-colors"
                    >
                      {active.cta} <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}