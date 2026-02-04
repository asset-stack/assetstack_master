import React from 'react';
import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function RiskHeatmap({ equipment = [] }) {
  const getRiskColor = (risk) => {
    switch (risk) {
      case 'critical': return 'bg-rose-500';
      case 'high': return 'bg-amber-500';
      case 'medium': return 'bg-yellow-400';
      default: return 'bg-emerald-500';
    }
  };

  const groupedByLocation = equipment.reduce((acc, eq) => {
    const loc = eq.location || 'Unknown';
    if (!acc[loc]) acc[loc] = [];
    acc[loc].push(eq);
    return acc;
  }, {});

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 h-full">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 bg-amber-50 rounded-lg">
          <MapPin className="w-4 h-4 text-amber-600" />
        </div>
        <h3 className="text-sm font-semibold text-slate-900">Risk by Location</h3>
      </div>
      <div className="space-y-3 max-h-[180px] overflow-y-auto">
        {Object.entries(groupedByLocation).map(([location, items], idx) => (
          <motion.div 
            key={location}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="flex items-center gap-3"
          >
            <span className="text-[11px] text-slate-600 w-24 truncate font-medium">{location}</span>
            <div className="flex gap-1 flex-wrap flex-1">
              <TooltipProvider>
                {items.map((eq, i) => (
                  <Tooltip key={eq.id}>
                    <TooltipTrigger>
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: idx * 0.05 + i * 0.02 }}
                        className={`w-5 h-5 rounded ${getRiskColor(eq.risk_level)} cursor-pointer hover:scale-110 transition-transform`}
                      />
                    </TooltipTrigger>
                    <TooltipContent className="bg-slate-900 border-slate-700">
                      <div className="text-[10px]">
                        <p className="font-semibold text-white">{eq.name}</p>
                        <p className="text-slate-300">Health: {eq.health_score}%</p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </TooltipProvider>
            </div>
          </motion.div>
        ))}
      </div>
      <div className="flex items-center gap-3 mt-4 pt-3 border-t border-slate-100">
        {['low', 'medium', 'high', 'critical'].map(level => (
          <div key={level} className="flex items-center gap-1">
            <div className={`w-2.5 h-2.5 rounded ${getRiskColor(level)}`} />
            <span className="text-[9px] text-slate-500 capitalize">{level}</span>
          </div>
        ))}
      </div>
    </div>
  );
}