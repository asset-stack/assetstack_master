import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { ChevronRight, Clock } from 'lucide-react';
import { Button } from "@/components/ui/button";

export default function SetupStepCard({ step, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.08 }}
      className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-5 hover:shadow-md transition-shadow"
    >
      <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-lg flex-shrink-0">
        {step.number}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-slate-900">{step.title}</h3>
        <p className="text-sm text-slate-500 mt-0.5">{step.desc}</p>
      </div>
      <div className="flex items-center gap-3 flex-shrink-0">
        <span className="hidden sm:flex items-center gap-1 text-xs text-slate-400">
          <Clock className="w-3.5 h-3.5" /> ~{step.time}
        </span>
        <Link to={createPageUrl(step.link)}>
          <Button variant="outline" size="sm" className="gap-1">
            Go <ChevronRight className="w-3.5 h-3.5" />
          </Button>
        </Link>
      </div>
    </motion.div>
  );
}