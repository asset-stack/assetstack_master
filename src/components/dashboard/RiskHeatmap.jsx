import React from 'react';
import { motion } from 'framer-motion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function RiskHeatmap({ equipment }) {
  const getRiskColor = (risk) => {
    switch (risk) {
      case 'critical': return 'bg-rose-500';
      case 'high': return 'bg-amber-500';
      case 'medium': return 'bg-yellow-400';
      default: return 'bg-emerald-500';
    }
  };

  const getRiskGlow = (risk) => {
    switch (risk) {
      case 'critical': return 'shadow-rose-500/50';
      case 'high': return 'shadow-amber-500/50';
      case 'medium': return 'shadow-yellow-400/50';
      default: return 'shadow-emerald-500/50';
    }
  };

  const groupedByLocation = equipment.reduce((acc, eq) => {
    if (!acc[eq.location]) acc[eq.location] = [];
    acc[eq.location].push(eq);
    return acc;
  }, {});

  return (
    <div className="bg-slate-900/50 rounded-2xl border border-slate-700/50 p-6 backdrop-blur-xl">
      <h3 className="text-lg font-semibold text-white mb-4">Risk Heatmap by Location</h3>
      <div className="space-y-4">
        {Object.entries(groupedByLocation).map(([location, items], idx) => (
          <motion.div 
            key={location}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="flex items-center gap-4"
          >
            <span className="text-sm text-slate-400 w-28 truncate">{location}</span>
            <div className="flex gap-1 flex-wrap flex-1">
              <TooltipProvider>
                {items.map((eq, i) => (
                  <Tooltip key={eq.id}>
                    <TooltipTrigger>
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: idx * 0.1 + i * 0.05 }}
                        className={`w-6 h-6 rounded ${getRiskColor(eq.risk_level)} ${getRiskGlow(eq.risk_level)} shadow-lg cursor-pointer hover:scale-110 transition-transform`}
                      />
                    </TooltipTrigger>
                    <TooltipContent className="bg-slate-800 border-slate-700">
                      <div className="text-xs">
                        <p className="font-semibold text-white">{eq.name}</p>
                        <p className="text-slate-400">{eq.type}</p>
                        <p className="text-slate-400">Health: {eq.health_score}%</p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </TooltipProvider>
            </div>
          </motion.div>
        ))}
      </div>
      <div className="flex items-center gap-4 mt-6 pt-4 border-t border-slate-700/50">
        <span className="text-xs text-slate-500">Risk Level:</span>
        <div className="flex items-center gap-3">
          {['low', 'medium', 'high', 'critical'].map(level => (
            <div key={level} className="flex items-center gap-1.5">
              <div className={`w-3 h-3 rounded ${getRiskColor(level)}`} />
              <span className="text-xs text-slate-400 capitalize">{level}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}