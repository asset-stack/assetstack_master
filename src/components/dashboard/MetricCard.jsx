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
  const trendColor = trend === 'up' ? 'text-emerald-600' : trend === 'down' ? 'text-rose-600' : 'text-slate-400';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay }}
      className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md hover:border-slate-300 transition-all duration-200"
    >
      <div className="flex items-center gap-3">
        {Icon && (
          <div className={`${config.iconBg} p-2.5 rounded-lg`}>
            <Icon className={`w-4 h-4 ${config.iconColor}`} strokeWidth={2} />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wide truncate">{title}</p>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-bold text-slate-900">{value}</span>
            {unit && <span className="text-xs text-slate-500">{unit}</span>}
          </div>
        </div>
        {trend && trendValue !== undefined && (
          <div className={`flex items-center gap-0.5 ${trendColor} bg-slate-50 px-1.5 py-0.5 rounded-md`}>
            <TrendIcon className="w-3 h-3" />
            <span className="text-[10px] font-semibold">{trendValue}%</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}