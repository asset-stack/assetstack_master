import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

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
    blue: {
      bg: 'bg-gradient-to-br from-indigo-50 to-indigo-100/50',
      border: 'border-indigo-100/60',
      icon: 'text-indigo-600 bg-indigo-100/80',
      glow: 'shadow-indigo-100/50'
    },
    green: {
      bg: 'bg-gradient-to-br from-emerald-50 to-emerald-100/50',
      border: 'border-emerald-100/60',
      icon: 'text-emerald-600 bg-emerald-100/80',
      glow: 'shadow-emerald-100/50'
    },
    amber: {
      bg: 'bg-gradient-to-br from-amber-50 to-amber-100/50',
      border: 'border-amber-100/60',
      icon: 'text-amber-600 bg-amber-100/80',
      glow: 'shadow-amber-100/50'
    },
    rose: {
      bg: 'bg-gradient-to-br from-rose-50 to-rose-100/50',
      border: 'border-rose-100/60',
      icon: 'text-rose-600 bg-rose-100/80',
      glow: 'shadow-rose-100/50'
    },
    purple: {
      bg: 'bg-gradient-to-br from-violet-50 to-violet-100/50',
      border: 'border-violet-100/60',
      icon: 'text-violet-600 bg-violet-100/80',
      glow: 'shadow-violet-100/50'
    },
  };

  const config = colorConfig[color];
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor = trend === 'up' ? 'text-emerald-600' : trend === 'down' ? 'text-rose-600' : 'text-slate-400';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className={`relative overflow-hidden rounded-2xl ${config.bg} border ${config.border} p-5 shadow-sm ${config.glow}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[13px] font-medium text-slate-500 tracking-wide">{title}</p>
          <div className="flex items-baseline gap-1.5 mt-1.5">
            <motion.span 
              className="text-[28px] font-bold text-slate-900 tracking-tight"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: delay + 0.2 }}
            >
              {value}
            </motion.span>
            {unit && <span className="text-sm text-slate-500 font-medium">{unit}</span>}
          </div>
          {trendValue !== undefined && (
            <div className={`flex items-center gap-1.5 mt-2.5 ${trendColor}`}>
              <TrendIcon className="w-3.5 h-3.5" />
              <span className="text-xs font-semibold">{trendValue}%</span>
              <span className="text-[11px] text-slate-400">vs last month</span>
            </div>
          )}
        </div>
        {Icon && (
          <div className={`p-3 rounded-xl ${config.icon}`}>
            <Icon className="w-5 h-5" strokeWidth={2} />
          </div>
        )}
      </div>
    </motion.div>
  );
}