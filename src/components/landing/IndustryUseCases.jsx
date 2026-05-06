import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, Pickaxe, Car, Factory, Train, Zap, ArrowRight } from 'lucide-react';

const INDUSTRIES = [
  {
    id: 'construction', icon: Building2, name: 'Construction',
    img: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=900&auto=format&fit=crop&q=70',
    headline: 'Cranes, hoists, scaffolds. One safety brain.',
    sub: 'AI inspection turns daily site walks into evidence packs. Defects, near-misses, and overdue checks surface before they become incidents.',
    metrics: [
      ['Avoided incidents', '38'], ['Inspection time', '−72%'], ['Insurance saved', '$1.4M']
    ],
  },
  {
    id: 'mining', icon: Pickaxe, name: 'Mining',
    img: 'https://images.unsplash.com/photo-1515630278258-407f66498911?w=900&auto=format&fit=crop&q=70',
    headline: 'Haul trucks, crushers, conveyors. Zero surprises.',
    sub: 'Predict bearing, hydraulic, and gearbox failures across remote fleets. Plan around shutdown windows, not against them.',
    metrics: [
      ['Production preserved', '11k t'], ['Unplanned events', '−81%'], ['MTBF', '+44%']
    ],
  },
  {
    id: 'fleet', icon: Car, name: 'Fleet',
    img: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=900&auto=format&fit=crop&q=70',
    headline: 'EV batteries, brakes, tyres. Vehicles that don\'t break.',
    sub: 'Photo-based wear detection plus telemetry models keep every van, truck, and EV in service when it matters most.',
    metrics: [
      ['Vehicle uptime', '99.2%'], ['Warranty wins', '+62%'], ['Tyre lifecycle', '+18%']
    ],
  },
  {
    id: 'manufacturing', icon: Factory, name: 'Manufacturing',
    img: 'https://images.unsplash.com/photo-1565043666747-69f6646db940?w=900&auto=format&fit=crop&q=70',
    headline: 'Robots, motors, lines. Throughput, protected.',
    sub: 'Anomalous vibration, current draw, and condition photos unify into one risk score per line — with parts pre-staged.',
    metrics: [
      ['Line downtime', '−67%'], ['First-time fix', '94%'], ['OEE', '+9.4 pts']
    ],
  },
  {
    id: 'rail', icon: Train, name: 'Rail & transit',
    img: 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=900&auto=format&fit=crop&q=70',
    headline: 'Tracks, signals, escalators. Passengers always move.',
    sub: 'Network-wide condition monitoring with passenger-impact prioritisation. The right repair, on the right shift.',
    metrics: [
      ['SLA recovery', '99.7%'], ['Track defects caught', '+58%'], ['Signal MTTR', '−41%']
    ],
  },
  {
    id: 'energy', icon: Zap, name: 'Energy & utilities',
    img: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=900&auto=format&fit=crop&q=70',
    headline: 'Transformers, turbines, grids. Outages prevented.',
    sub: 'Thermal anomalies, partial discharge, and wear feed a single grid risk model regulators can audit.',
    metrics: [
      ['Outage minutes', '−73%'], ['Asset life', '+11 yrs'], ['Audit pass rate', '100%']
    ],
  },
];

export default function IndustryUseCases() {
  const [active, setActive] = useState(INDUSTRIES[0]);
  const ActiveIcon = active.icon;

  return (
    <section id="industries" className="py-20 md:py-32 bg-slate-50/40 border-y border-slate-100">
      <div className="max-w-[1280px] mx-auto px-5 md:px-8">
        <div className="max-w-2xl mb-12 md:mb-14">
          <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">Industries</span>
          <h2 className="mt-3 text-4xl md:text-6xl font-semibold tracking-[-0.03em] leading-[1.02] text-slate-900 text-balance">
            One product.{' '}
            <span className="font-serif italic font-medium text-primary">Every asset-heavy industry.</span>
          </h2>
          <p className="mt-4 text-[17px] text-slate-600 leading-[1.55] text-pretty">
            Hover an industry — the dashboard above adapts to it. Same engine. Same workflow. Different concrete, steel, vehicles, plants, and grids.
          </p>
        </div>

        <div className="grid lg:grid-cols-[300px_1fr] gap-6">
          {/* Industry rail */}
          <div className="space-y-1.5">
            {INDUSTRIES.map((ind) => {
              const Icon = ind.icon;
              const isActive = active.id === ind.id;
              return (
                <button
                  key={ind.id}
                  onMouseEnter={() => setActive(ind)}
                  onFocus={() => setActive(ind)}
                  onClick={() => setActive(ind)}
                  className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-lg border text-left transition-all ${
                    isActive
                      ? 'bg-white border-primary/25 elevation-1'
                      : 'bg-transparent border-transparent hover:bg-white/60'
                  }`}
                >
                  <div className={`w-7 h-7 rounded-md flex items-center justify-center transition-colors ${
                    isActive ? 'bg-primary text-white' : 'bg-slate-100 text-slate-500'
                  }`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span className={`text-[14px] font-semibold ${isActive ? 'text-slate-900' : 'text-slate-600'}`}>
                    {ind.name}
                  </span>
                  <ArrowRight className={`w-3.5 h-3.5 ml-auto transition-all ${isActive ? 'text-primary translate-x-0' : 'text-slate-300 -translate-x-1'}`} />
                </button>
              );
            })}
          </div>

          {/* Morphing canvas */}
          <div className="relative rounded-2xl border border-slate-200 bg-white elevation-2 overflow-hidden min-h-[420px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={active.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="grid md:grid-cols-2 h-full"
              >
                {/* Image */}
                <div className="relative h-64 md:h-full overflow-hidden">
                  <motion.img
                    key={active.img}
                    initial={{ scale: 1.05, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.6 }}
                    src={active.img}
                    alt={active.name}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-slate-900/20 to-transparent" />
                  <div className="absolute bottom-5 left-5 right-5 flex items-center gap-2 text-white">
                    <div className="w-8 h-8 rounded-lg bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center">
                      <ActiveIcon className="w-4 h-4" />
                    </div>
                    <span className="text-[13px] font-semibold">{active.name}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 md:p-8 flex flex-col">
                  <h3 className="text-2xl md:text-3xl font-semibold tracking-[-0.02em] leading-[1.15] text-slate-900 text-balance">
                    {active.headline}
                  </h3>
                  <p className="mt-3 text-[14px] text-slate-600 leading-[1.55]">{active.sub}</p>

                  <div className="mt-auto pt-6 grid grid-cols-3 gap-3">
                    {active.metrics.map(([label, value]) => (
                      <div key={label} className="rounded-lg border border-slate-100 p-3 bg-slate-50/40">
                        <div className="text-xl font-semibold tabular-nums text-slate-900 tracking-tight">{value}</div>
                        <div className="text-[10px] uppercase tracking-wider text-slate-500 mt-0.5">{label}</div>
                      </div>
                    ))}
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