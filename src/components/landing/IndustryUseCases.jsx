import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, Pickaxe, Heart, Factory, Train, Zap, ArrowRight, GraduationCap } from 'lucide-react';

// Each industry shows what the platform actually does for that use case —
// not fabricated outcome metrics. Capabilities below all map to features
// shipped in the app (Equipment, Scan Analysis, Predictions, WorkOrders, etc.).
const INDUSTRIES = [
  {
    id: 'councils', icon: Building2, name: 'Government & Local Councils',
    img: 'https://media.base44.com/images/public/6a0a6a5d4d043b0e41a16d90/266a1b2ec_empty-gymnasium-with-courts-2026-03-18-05-24-20-utc.jpg',
    headline: 'Civic infrastructure, on one map.',
    sub: 'Local governments manage extensive portfolios of public infrastructure including buildings, parks, roads and community facilities. AssetStack provides a centralised platform to monitor asset condition, plan maintenance and improve long-term infrastructure management.',
    capabilities: ['Asset register', 'Condition scans', 'Maintenance planning'],
  },
  {
    id: 'healthcare', icon: Heart, name: 'Healthcare & Aged Care',
    img: 'https://media.base44.com/images/public/6a0a6a5d4d043b0e41a16d90/3675cd51d_Hospital.jpg',
    headline: 'Multi-site facility management.',
    sub: 'Healthcare and aged care providers operate multiple facilities with complex infrastructure requirements. AssetStack enables organisations to monitor building systems, maintain compliance and optimise maintenance across facility networks.',
    capabilities: ['Multi-site', 'Compliance', 'Building systems'],
  },
  {
    id: 'rail', icon: Train, name: 'Transport & Infrastructure',
    img: 'https://media.base44.com/images/public/6a0a6a5d4d043b0e41a16d90/26a4a5ec7_Trasnsport.jpg',
    headline: 'Networks, intersections, signals.',
    sub: 'Transport operators manage critical infrastructure such as rail networks, road systems and intersections where failure can have significant operational impact. AssetStack provides real-time monitoring and predictive maintenance across transport infrastructure.',
    capabilities: ['Network globe', 'Digital twin', 'Remote inspection'],
  },
  {
    id: 'utilities', icon: Zap, name: 'Utilities, Energy & Resources',
    img: 'https://media.base44.com/images/public/6a0a6a5d4d043b0e41a16d90/fb57216d8_Utilities.jpg',
    headline: 'Distributed assets, real-time visibility.',
    sub: 'Utilities, energy providers and resource operators manage distributed infrastructure across large geographic areas. AssetStack provides real-time monitoring and predictive insights across critical infrastructure systems.',
    capabilities: ['Sensor integration', 'Predictive analytics', 'Alerts'],
  },
  {
    id: 'property', icon: Factory, name: 'Property & Asset Portfolio Managers',
    img: 'https://media.base44.com/images/public/6a0a6a5d4d043b0e41a16d90/73a24b69e_Property.jpg',
    headline: 'Portfolio-wide visibility.',
    sub: 'Property groups and asset managers oversee large portfolios of buildings and infrastructure assets. AssetStack provides visibility across entire portfolios, enabling proactive maintenance and long-term asset planning.',
    capabilities: ['Multi-site', 'Depreciation', 'Lifecycle tracking'],
  },
  {
    id: 'education', icon: GraduationCap, name: 'Education & Campus Infrastructure',
    img: 'https://media.base44.com/images/public/6a0a6a5d4d043b0e41a16d90/1bda50aa6_Education.jpg',
    headline: 'Extensive campus environments.',
    sub: 'Educational institutions manage extensive campus environments with diverse infrastructure assets. AssetStack enables institutions to monitor facilities, maintain infrastructure and optimise maintenance operations across campuses.',
    capabilities: ['Facility monitoring', 'Maintenance operations', 'Asset tracking'],
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

                  <div className="mt-auto pt-6">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500 mb-2.5">Platform capabilities</div>
                    <div className="flex flex-wrap gap-2">
                      {active.capabilities.map((c) => (
                        <span key={c} className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-slate-200 bg-slate-50/40 text-[12px] font-medium text-slate-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                          {c}
                        </span>
                      ))}
                    </div>
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