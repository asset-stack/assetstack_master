import React from 'react';
import { motion } from 'framer-motion';
import { Building2, Pickaxe, Car, Factory, Train, Zap, ArrowRight } from 'lucide-react';

const CASES = [
  { icon: Building2, title: 'Construction', text: 'Cranes, hoists, pumps, power boards, scaffolds, safety inspections, and defect evidence packs.', color: 'from-primary to-blue-400' },
  { icon: Pickaxe, title: 'Mining', text: 'Haul trucks, crushers, conveyors, pumps, remote sites, shutdown windows, and production-loss prevention.', color: 'from-primary to-blue-500' },
  { icon: Car, title: 'Fleet of cars', text: 'EV batteries, tyres, brakes, engines, service routing, warranty evidence, and vehicle downtime risk.', color: 'from-primary to-blue-400' },
  { icon: Factory, title: 'Manufacturing', text: 'Robots, motors, compressors, conveyor lines, cooling pumps, spare parts, and line-level downtime risk.', color: 'from-primary to-blue-600' },
  { icon: Train, title: 'Rail & transit', text: 'Signals, switches, tracks, stations, escalators, bridges, and passenger-impact prioritisation.', color: 'from-primary to-blue-500' },
  { icon: Zap, title: 'Energy & utilities', text: 'Transformers, turbines, substations, solar farms, pipelines, valves, and outage-prevention workflows.', color: 'from-indigo-500 to-blue-500' },
];

export default function IndustryUseCases() {
  return (
    <section id="industries" className="py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mb-12"
        >
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">Industries</span>
          <h2 className="mt-3 text-4xl md:text-5xl font-black tracking-tight text-slate-900">
            One intelligence layer for every asset-heavy industry.
          </h2>
          <p className="mt-4 text-lg text-slate-600">The same engine adapts to concrete, steel, vehicles, plants, tracks, grids, pumps, and field teams.</p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {CASES.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.a
                key={item.title}
                href="#demo"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                whileHover={{ y: -6 }}
                className="group rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:shadow-xl hover:shadow-slate-900/6 p-6 transition-all"
              >
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-lg mb-5`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-black text-xl text-slate-900">{item.title}</h3>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">{item.text}</p>
              </motion.a>
            );
          })}
        </div>
      </div>
    </section>
  );
}