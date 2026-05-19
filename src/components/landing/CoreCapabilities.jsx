import React from 'react';
import { motion } from 'framer-motion';
import { Box, Brain, ClipboardList, Radio, BarChart3, Cpu } from 'lucide-react';

const CAPABILITIES = [
  {
    icon: Box,
    title: 'Digital Twin Infrastructure',
    body: 'Visualise infrastructure networks in 3D using LiDAR and geospatial modelling.',
  },
  {
    icon: Brain,
    title: 'Predictive Maintenance',
    body: 'ML models forecast failures from sensor telemetry, inspection history and operating context.',
  },
  {
    icon: ClipboardList,
    title: 'Inspection Workflows',
    body: 'Mobile-first inspections that capture condition, photos and findings — fully traceable.',
  },
  {
    icon: Radio,
    title: 'IoT Sensor Integration',
    body: 'Stream vibration, temperature, current and 25+ sensor types via API, MQTT or CSV.',
  },
  {
    icon: BarChart3,
    title: 'Operational Analytics',
    body: 'Boardroom-ready dashboards on cost, risk, condition and capital renewal demand.',
  },
  {
    icon: Cpu,
    title: 'AI Decision Engine',
    body: 'Anomaly detection, failure classification and remaining useful life — explainable.',
  },
];

export default function CoreCapabilities() {
  return (
    <section className="bg-slate-950 text-white py-24 lg:py-32 relative overflow-hidden">
      {/* texture */}
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(115deg, rgba(255,255,255,0.5) 0 1px, transparent 1px 18px)',
        }}
      />
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full bg-indigo-600/20 blur-[140px]" />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        <div className="max-w-3xl mb-14">
          <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-indigo-300 mb-3">
            Core Capabilities
          </p>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight leading-tight">
            Built for Complex Assets.
            <br />
            <span className="text-indigo-300">Engineered for Scale.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-white/10 rounded-2xl overflow-hidden border border-white/10">
          {CAPABILITIES.map((cap, i) => {
            const Icon = cap.icon;
            return (
              <motion.div
                key={cap.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.5, delay: (i % 3) * 0.08 }}
                className="bg-slate-950 p-7 lg:p-8 hover:bg-slate-900 transition-colors group"
              >
                <div className="w-11 h-11 rounded-lg bg-indigo-500/15 border border-indigo-400/20 flex items-center justify-center mb-5 group-hover:bg-indigo-500/25 transition-colors">
                  <Icon className="w-5 h-5 text-indigo-300" strokeWidth={2} />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-white">{cap.title}</h3>
                <p className="text-sm text-white/60 leading-relaxed">{cap.body}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}