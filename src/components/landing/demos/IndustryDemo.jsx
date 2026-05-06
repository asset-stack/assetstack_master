import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar } from 'recharts';
import { Building2, Pickaxe, Car, Factory, Train, Zap, AlertTriangle, CheckCircle2, Wrench, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const INDUSTRIES = [
  {
    id: 'construction',
    label: 'Construction',
    icon: Building2,
    color: 'from-primary to-blue-400',
    image: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=1200&q=80',
    headline: 'Prevent crane, concrete, scaffold, and site-equipment failures before they stop the job.',
    assets: ['Tower crane TC-04', 'Concrete pump CP-12', 'Temporary power board', 'Hoist elevator H-2'],
    risks: [88, 64, 41, 72],
    value: '$312k',
    action: 'Auto-generate safety inspection + parts checklist',
    chart: [{ m: 'Mon', r: 34 }, { m: 'Tue', r: 41 }, { m: 'Wed', r: 55 }, { m: 'Thu', r: 71 }, { m: 'Fri', r: 88 }],
  },
  {
    id: 'mining',
    label: 'Mining',
    icon: Pickaxe,
    color: 'from-primary to-blue-500',
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&q=80',
    headline: 'Keep haul trucks, conveyors, crushers, pumps, and remote assets moving in harsh conditions.',
    assets: ['Haul truck HT-19', 'Crusher jaw CJ-2', 'Conveyor belt CV-7', 'Dewatering pump DP-4'],
    risks: [92, 77, 69, 53],
    value: '$1.18M',
    action: 'Schedule shutdown-window maintenance before ore throughput drops',
    chart: [{ m: 'Pit A', r: 92 }, { m: 'Pit B', r: 77 }, { m: 'Plant', r: 69 }, { m: 'Water', r: 53 }],
  },
  {
    id: 'fleet',
    label: 'Fleet of cars',
    icon: Car,
    color: 'from-primary to-blue-400',
    image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200&q=80',
    headline: 'Predict battery, tyre, brake, engine, and downtime risks across thousands of vehicles.',
    assets: ['EV Van #284', 'Utility #102', 'Pool car #41', 'Roadside truck #8'],
    risks: [81, 58, 33, 74],
    value: '$428k',
    action: 'Route vehicles to maintenance before service disruption',
    chart: [{ m: 'Battery', r: 81 }, { m: 'Tyres', r: 58 }, { m: 'Brakes', r: 33 }, { m: 'Engine', r: 74 }],
  },
  {
    id: 'manufacturing',
    label: 'Manufacturing',
    icon: Factory,
    color: 'from-primary to-blue-600',
    image: 'https://images.unsplash.com/photo-1565043589221-1a6fd9ae45c7?w=1200&q=80',
    headline: 'Stop line downtime by predicting motor, pump, compressor, robot, and conveyor failures.',
    assets: ['Line 3 robot arm', 'Air compressor AC-2', 'Packaging motor M-8', 'Cooling pump P-6'],
    risks: [76, 87, 45, 62],
    value: '$684k',
    action: 'Create work order before production-line failure',
    chart: [{ m: 'L1', r: 42 }, { m: 'L2', r: 54 }, { m: 'L3', r: 87 }, { m: 'L4', r: 62 }],
  },
  {
    id: 'rail',
    label: 'Rail & transit',
    icon: Train,
    color: 'from-primary to-blue-500',
    image: 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=1200&q=80',
    headline: 'Monitor switches, signals, track geometry, bridges, rolling stock, and stations in one network view.',
    assets: ['Signal Box 12', 'Switch SW-31', 'Track segment W-8', 'Station escalator E-4'],
    risks: [91, 68, 57, 46],
    value: '$970k',
    action: 'Prioritise network-critical work by passenger-impact risk',
    chart: [{ m: 'Signals', r: 91 }, { m: 'Switches', r: 68 }, { m: 'Track', r: 57 }, { m: 'Station', r: 46 }],
  },
  {
    id: 'energy',
    label: 'Energy & utilities',
    icon: Zap,
    color: 'from-indigo-500 to-blue-500',
    image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=1200&q=80',
    headline: 'Protect substations, turbines, solar farms, transformers, pipelines, and water networks.',
    assets: ['Transformer TX-6', 'Wind turbine WT-22', 'Solar inverter SI-9', 'Water valve WV-4'],
    risks: [84, 71, 39, 66],
    value: '$1.42M',
    action: 'Trigger outage-prevention workflow with evidence pack',
    chart: [{ m: 'Grid', r: 84 }, { m: 'Wind', r: 71 }, { m: 'Solar', r: 39 }, { m: 'Water', r: 66 }],
  },
];

const riskClass = (risk) => risk >= 80 ? 'bg-red-100 text-red-700' : risk >= 60 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700';

export default function IndustryDemo() {
  const [active, setActive] = useState(INDUSTRIES[0]);
  const Icon = active.icon;

  return (
    <div className="rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/10 overflow-hidden">
      <div className="grid lg:grid-cols-[290px_1fr] min-h-[620px]">
        <div className="bg-primary p-4 md:p-5 space-y-2">
          <div className="px-2 pb-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">Industry command switcher</p>
          </div>
          {INDUSTRIES.map((industry) => {
            const TabIcon = industry.icon;
            const selected = active.id === industry.id;
            return (
              <button
                key={industry.id}
                onClick={() => setActive(industry)}
                className={`w-full flex items-center gap-3 rounded-xl px-3 py-3 text-left transition-all ${selected ? 'bg-white text-primary shadow-lg' : 'text-blue-100 hover:bg-white/10 hover:text-white'}`}
              >
                <span className={`w-10 h-10 rounded-xl bg-gradient-to-br ${industry.color} flex items-center justify-center shrink-0`}>
                  <TabIcon className="w-5 h-5 text-white" />
                </span>
                <span className="font-bold text-sm">{industry.label}</span>
              </button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={active.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.35 }}
            className="grid xl:grid-cols-[1.05fr_0.95fr]"
          >
            <div className="relative min-h-[420px] p-6 md:p-8 flex flex-col justify-between overflow-hidden">
              <img src={active.image} alt={active.label} className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-br from-slate-950/90 via-slate-950/55 to-transparent" />
              <div className="relative">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/15 backdrop-blur px-3 py-1.5 text-xs font-semibold text-white">
                  <Icon className="w-3.5 h-3.5" /> {active.label} demo
                </div>
                <h3 className="mt-5 text-3xl md:text-5xl font-black tracking-tight text-white leading-[1.03] max-w-xl">
                  {active.headline}
                </h3>
              </div>
              <div className="relative grid grid-cols-2 gap-3 max-w-md">
                <div className="rounded-2xl bg-white/12 border border-white/15 backdrop-blur p-4">
                  <div className="text-xs text-white/65">Verified annual value</div>
                  <div className="text-3xl font-black text-white mt-1">{active.value}</div>
                </div>
                <div className="rounded-2xl bg-white/12 border border-white/15 backdrop-blur p-4">
                  <div className="text-xs text-white/65">Recommended next step</div>
                  <div className="text-sm font-bold text-white mt-1 leading-snug">{active.action}</div>
                </div>
              </div>
            </div>

            <div className="p-6 md:p-8 bg-slate-50 flex flex-col gap-5">
              <div className="bg-white rounded-2xl border border-slate-200 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-bold text-slate-900">Live asset risk</h4>
                  <Badge className="bg-primary/10 text-primary border-0">AI ranked</Badge>
                </div>
                <div className="space-y-3">
                  {active.assets.map((asset, i) => (
                    <motion.div
                      key={asset}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.06 }}
                      className="flex items-center gap-3"
                    >
                      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                        {active.risks[i] >= 75 ? <AlertTriangle className="w-4 h-4 text-red-500" /> : <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-semibold text-slate-900 truncate">{asset}</span>
                          <Badge className={`${riskClass(active.risks[i])} border-0 text-[10px]`}>{active.risks[i]}%</Badge>
                        </div>
                        <div className="mt-2 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${active.risks[i]}%` }}
                            transition={{ duration: 0.7, delay: i * 0.08 }}
                            className={`h-full rounded-full bg-gradient-to-r ${active.color}`}
                          />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 flex-1">
                <div className="bg-white rounded-2xl border border-slate-200 p-5 min-h-[210px]">
                  <h4 className="font-bold text-slate-900 mb-3">Risk trajectory</h4>
                  <ResponsiveContainer width="100%" height={150}>
                    <AreaChart data={active.chart}>
                      <defs>
                        <linearGradient id={`risk-${active.id}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.45} />
                          <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="m" hide />
                      <YAxis hide domain={[0, 100]} />
                      <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }} />
                      <Area type="monotone" dataKey="r" stroke="hsl(var(--primary))" strokeWidth={3} fill={`url(#risk-${active.id})`} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="bg-white rounded-2xl border border-slate-200 p-5 min-h-[210px]">
                  <h4 className="font-bold text-slate-900 mb-3">Outcome engine</h4>
                  <div className="space-y-3 text-sm">
                    {['Detect condition change', 'Predict operational impact', 'Create work order', 'Verify savings'].map((step, i) => (
                      <div key={step} className="flex items-center gap-2 text-slate-700">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${i === 3 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{i + 1}</span>
                        <span className="font-medium">{step}</span>
                        {i < 3 && <ArrowRight className="w-3 h-3 text-slate-300 ml-auto" />}
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 rounded-xl bg-slate-950 text-white p-3 flex items-center gap-2 text-xs font-semibold">
                    <Wrench className="w-4 h-4 text-emerald-400" /> Workflow ready to dispatch
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}