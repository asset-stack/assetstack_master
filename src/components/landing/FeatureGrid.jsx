import React from 'react';
import { motion } from 'framer-motion';
import {
  Camera, Brain, ShieldCheck, TrendingUp, Network,
  FileSearch, Bell, Wrench, Database
} from 'lucide-react';

const features = [
  {
    icon: Camera, color: 'from-indigo-500 to-purple-500',
    title: 'AI Condition Scanning',
    desc: 'Upload a photo or 3D scan. Our vision AI flags cracks, corrosion, dents, and water damage with bounding boxes — in seconds.',
  },
  {
    icon: Brain, color: 'from-purple-500 to-pink-500',
    title: 'Failure Prediction',
    desc: 'Combine sensor data, history, and condition reports to predict failures 30–90 days before they happen.',
  },
  {
    icon: ShieldCheck, color: 'from-emerald-500 to-teal-500',
    title: 'Verified Savings Ledger',
    desc: 'Every prediction tied to a dollar outcome. Defensible ROI buyers and regulators can audit.',
  },
  {
    icon: Network, color: 'from-blue-500 to-cyan-500',
    title: 'Network Globe',
    desc: 'Visualise rail lines, power grids, and water networks on a 3D globe with live condition status per node.',
  },
  {
    icon: FileSearch, color: 'from-amber-500 to-orange-500',
    title: 'Immutable Audit Trail',
    desc: 'Every action — every prediction, every retrain, every import — logged with verified actor identity.',
  },
  {
    icon: TrendingUp, color: 'from-rose-500 to-red-500',
    title: 'Asset Depreciation',
    desc: 'Live straight-line and declining-balance schedules. CapEx forecasts straight to your CFO.',
  },
  {
    icon: Bell, color: 'from-cyan-500 to-blue-500',
    title: 'Smart Alerts',
    desc: 'Threshold breaches and anomalies routed to the right technician on the right shift, instantly.',
  },
  {
    icon: Wrench, color: 'from-violet-500 to-indigo-500',
    title: 'Auto Work Orders',
    desc: 'AI-recommended maintenance turns into assigned work orders with checklists and parts lists.',
  },
  {
    icon: Database, color: 'from-slate-500 to-slate-700',
    title: 'One-Click Imports',
    desc: 'Excel, CSV, BIM, point clouds, and IoT feeds — all consolidated in one asset registry.',
  },
];

export default function FeatureGrid() {
  return (
    <section id="features" className="py-20 md:py-28 bg-slate-50/50">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">Capabilities</span>
          <h2 className="mt-3 text-4xl md:text-5xl font-black tracking-tight text-slate-900">
            Features that move from insight
            <br />
            <span className="text-slate-400">to action to proof.</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -4 }}
                className="group relative bg-white rounded-2xl p-6 border border-slate-200/80 hover:border-slate-300 hover:shadow-xl hover:shadow-slate-900/5 transition-all"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="mt-5 text-lg font-bold text-slate-900">{f.title}</h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">{f.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}