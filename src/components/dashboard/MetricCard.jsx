import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function MetricCard({ 
  title, 
  value, 
  unit, 
  trend, 
  trendValue, 
  icon: Icon, 
  color = 'blue',
  delay = 0 
}) {
  const colorConfig = {
    blue: { iconBg: 'bg-indigo-50', iconColor: 'text-indigo-600' },
    green: { iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600' },
    amber: { iconBg: 'bg-amber-50', iconColor: 'text-amber-600' },
    rose: { iconBg: 'bg-rose-50', iconColor: 'text-rose-600' },
    purple: { iconBg: 'bg-violet-50', iconColor: 'text-violet-600' },
  };

  const config = colorConfig[color] || colorConfig.blue;
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : null;
  const trendColor = trend === 'up' ? 'text-emerald-600 bg-emerald-50' : trend === 'down' ? 'text-rose-600 bg-rose-50' : '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className="bg-white rounded-xl border border-slate-200/80 p-3.5 sm:p-4 hover:shadow-md hover:border-slate-300/80 transition-all duration-200"
    >
      <div className="flex items-start gap-3">
        {Icon && (
          <div className={`${config.iconBg} p-2 sm:p-2.5 rounded-lg shrink-0`}>
            <Icon className={`w-4 h-4 ${config.iconColor}`} strokeWidth={2} />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wide truncate mb-0.5">{title}</p>
          <div className="flex items-baseline gap-1.5">
            <span className="text-lg sm:text-xl font-bold text-slate-900 tabular-nums">{value}</span>
            {unit && <span className="text-xs text-slate-400">{unit}</span>}
            {trend && trendValue !== undefined && (
              <span className={`inline-flex items-center gap-0.5 ${trendColor} px-1.5 py-0.5 rounded text-[10px] font-semibold ml-auto`}>
                <TrendIcon className="w-3 h-3" />
                {trendValue}%
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}