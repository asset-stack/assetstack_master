import React from 'react';
import { motion } from 'framer-motion';
import { Badge } from "@/components/ui/badge";

export default function SetupIntegrationCard({ integration, index }) {
  const Icon = integration.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
          <Icon className="w-5 h-5 text-slate-600" />
        </div>
        <Badge variant="secondary" className="text-[10px]">{integration.category}</Badge>
      </div>
      <h3 className="font-semibold text-slate-900 mb-1">{integration.title}</h3>
      <p className="text-sm text-slate-500 leading-relaxed">{integration.desc}</p>
    </motion.div>
  );
}