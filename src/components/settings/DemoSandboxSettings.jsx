import React from 'react';
import { FlaskConical, Mountain, Building2, ExternalLink, Database, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';

const DEMOS = [
  {
    id: 'bunbury',
    name: 'Bunbury Council',
    tagline: 'Flagship local-government demo',
    description: 'Live in Production. 250+ council assets across town hall, libraries, parks, depots, roads & bridges. Verified savings ledger, climate risk, capital plan, scan analysis with site-plan overlays.',
    env: 'Production',
    envColor: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    icon: Building2,
    iconBg: 'bg-emerald-100 text-emerald-600',
    stats: [
      { label: 'Assets', value: '250+' },
      { label: 'Verified Savings', value: '$2.4M' },
      { label: 'Scans', value: '12' },
    ],
    primaryAction: { label: 'Open Dashboard', to: '/Dashboard' },
    isActive: true,
  },
  {
    id: 'snowy',
    name: 'Snowy Hydro',
    tagline: 'Energy & utilities sandbox',
    description: '32 assets across NSW/VIC/SA — Tumut/Murray hydro complexes, Snowy 2.0 construction, Colongra peakers. AI predictions, LiDAR overbreak detection, EIS compliance (Booroolong Frog, Smoky Mouse), $9.8M savings ledger.',
    env: 'Test',
    envColor: 'bg-amber-100 text-amber-700 border-amber-200',
    icon: Mountain,
    iconBg: 'bg-sky-100 text-sky-600',
    stats: [
      { label: 'Assets', value: '32' },
      { label: 'Verified Savings', value: '$9.8M' },
      { label: 'Locations', value: '14' },
    ],
    primaryAction: { label: 'Open Demo', to: '/Dashboard' },
    note: 'Switch to Test mode (top of builder dashboard) to view this data.',
    isActive: true,
  },
];

export default function DemoSandboxSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-2">
          <FlaskConical className="w-4 h-4 text-indigo-500" />
          Demo Sandboxes
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Pre-loaded industry demonstrations showcasing AssetStack across different verticals
        </p>
      </div>

      {/* Environment explainer */}
      <div className="bg-indigo-50/60 border border-indigo-100 rounded-xl p-4 flex gap-3">
        <Database className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-medium text-slate-900">Two databases, one app</p>
          <p className="text-slate-600 mt-1 text-xs leading-relaxed">
            <span className="font-semibold">Production</span> hosts the Bunbury Council flagship. <span className="font-semibold">Test</span> hosts the Snowy Hydro sandbox. Switch between them using the <span className="font-semibold">Production / Test</span> toggle at the top of your Base44 builder dashboard — the app preview will reload with that database's data.
          </p>
        </div>
      </div>

      {/* Demo cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {DEMOS.map((demo) => {
          const Icon = demo.icon;
          return (
            <div key={demo.id} className="bg-white border border-slate-200 rounded-xl p-5 hover:border-indigo-200 hover:shadow-sm transition-all">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${demo.iconBg}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded-md border ${demo.envColor}`}>
                  {demo.env}
                </span>
              </div>

              <h4 className="font-semibold text-slate-900 text-base">{demo.name}</h4>
              <p className="text-xs text-indigo-600 font-medium mb-2">{demo.tagline}</p>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">{demo.description}</p>

              <div className="grid grid-cols-3 gap-2 mb-4 pb-4 border-b border-slate-100">
                {demo.stats.map((stat) => (
                  <div key={stat.label}>
                    <p className="text-base font-bold text-slate-900 tabular-nums">{stat.value}</p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider">{stat.label}</p>
                  </div>
                ))}
              </div>

              {demo.note && (
                <div className="bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 mb-3 flex gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-amber-800 leading-relaxed">{demo.note}</p>
                </div>
              )}

              <Link to={demo.primaryAction.to}>
                <Button size="sm" className="w-full bg-slate-900 hover:bg-slate-800 text-white">
                  {demo.primaryAction.label}
                  <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </Button>
              </Link>
            </div>
          );
        })}
      </div>

      {/* What's in the Snowy demo */}
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <h4 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
          <Mountain className="w-4 h-4 text-sky-600" />
          What's loaded in the Snowy Hydro sandbox
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-xs text-slate-600">
          <div className="flex items-start gap-2">
            <span className="text-indigo-500 mt-0.5">•</span>
            <span><strong className="text-slate-900">Generation:</strong> Tumut 1/2/3, Murray 1/2, Tumut 3 Pump, Snowy 2.0, Colongra, Valley Power, Laverton North, Lonsdale, Cap Tas Hydro</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-indigo-500 mt-0.5">•</span>
            <span><strong className="text-slate-900">Dams:</strong> Talbingo, Geehi, Eucumbene, Tumut Pond, Tantangara, Tooma, Jindabyne, Guthega, Island Bend</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-indigo-500 mt-0.5">•</span>
            <span><strong className="text-slate-900">AI Scans:</strong> LiDAR overbreak (Snowy 2.0 cavern), spillway spalling (Geehi), GT thermal crack (Colongra)</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-indigo-500 mt-0.5">•</span>
            <span><strong className="text-slate-900">Compliance:</strong> Booroolong Frog habitat, Smoky Mouse buffers, EPA water quality, EIS conditions</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-indigo-500 mt-0.5">•</span>
            <span><strong className="text-slate-900">Sensors & alerts:</strong> Tumut 1 bearing temperature, Talbingo piezometer drift, 4 active high-priority alerts</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-indigo-500 mt-0.5">•</span>
            <span><strong className="text-slate-900">Financials:</strong> 2 funding optimiser scenarios (baseline vs climate-stressed), $9.8M verified savings ledger</span>
          </div>
        </div>
      </div>
    </div>
  );
}