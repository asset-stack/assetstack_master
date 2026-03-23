import React from 'react';
import { motion } from 'framer-motion';

export default function SetupFeatureCard({ feature, index }) {
  const Icon = feature.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow"
    >
      <div className={`w-10 h-10 rounded-lg ${feature.color} flex items-center justify-center mb-3`}>
        <Icon className="w-5 h-5" />
      </div>
      <h3 className="font-semibold text-slate-900 mb-1">{feature.title}</h3>
      <p className="text-sm text-slate-500 leading-relaxed">{feature.desc}</p>
    </motion.div>
  );
}