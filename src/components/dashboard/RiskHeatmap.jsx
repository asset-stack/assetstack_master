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

  const sortedLocations = Object.entries(groupedByLocation).sort((a, b) => {
    const riskScore = (items) => items.reduce((s, eq) => s + (eq.risk_level === 'critical' ? 4 : eq.risk_level === 'high' ? 3 : eq.risk_level === 'medium' ? 2 : 1), 0);
    return riskScore(b[1]) - riskScore(a[1]);
  });

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-4 h-full flex flex-col">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="p-2 bg-amber-50 rounded-lg">
          <MapPin className="w-4 h-4 text-amber-600" />
        </div>
        <h3 className="text-sm font-semibold text-slate-900">Risk by Location</h3>
        <span className="text-[11px] text-slate-400 ml-auto">{Object.keys(groupedByLocation).length} locations</span>
      </div>

      <div className="space-y-3 flex-1 overflow-y-auto max-h-[200px] scrollbar-thin">
        {sortedLocations.map(([location, items], idx) => (
          <motion.div 
            key={location}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.04 }}
            className="flex items-center gap-3"
          >
            <span className="text-xs text-slate-600 w-28 truncate font-medium shrink-0">{location}</span>
            <div className="flex gap-1 flex-wrap flex-1">
              <TooltipProvider>
                {items.map((eq, i) => (
                  <Tooltip key={eq.id}>
                    <TooltipTrigger>
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: idx * 0.04 + i * 0.02 }}
                        className={`w-5 h-5 rounded ${getRiskColor(eq.risk_level)} cursor-pointer hover:scale-125 transition-transform`}
                      />
                    </TooltipTrigger>
                    <TooltipContent className="bg-slate-900 border-slate-700">
                      <div className="text-[11px]">
                        <p className="font-semibold text-white">{eq.name}</p>
                        <p className="text-slate-300">Health: {eq.health_score}% · Risk: {eq.risk_level}</p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </TooltipProvider>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-4 pt-3 border-t border-slate-100">
        {['low', 'medium', 'high', 'critical'].map(level => (
          <div key={level} className="flex items-center gap-1.5">
            <div className={`w-3 h-3 rounded ${getRiskColor(level)}`} />
            <span className="text-[11px] text-slate-500 capitalize">{level}</span>
          </div>
        ))}
      </div>
    </div>
  );
}