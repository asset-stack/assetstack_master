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
  const colorClasses = {
    blue: 'from-blue-500/20 to-blue-600/5 border-blue-500/30',
    green: 'from-emerald-500/20 to-emerald-600/5 border-emerald-500/30',
    amber: 'from-amber-500/20 to-amber-600/5 border-amber-500/30',
    rose: 'from-rose-500/20 to-rose-600/5 border-rose-500/30',
    purple: 'from-purple-500/20 to-purple-600/5 border-purple-500/30',
  };

  const iconColors = {
    blue: 'text-blue-400',
    green: 'text-emerald-400',
    amber: 'text-amber-400',
    rose: 'text-rose-400',
    purple: 'text-purple-400',
  };

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor = trend === 'up' ? 'text-emerald-400' : trend === 'down' ? 'text-rose-400' : 'text-slate-400';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${colorClasses[color]} border backdrop-blur-xl p-5`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{title}</p>
          <div className="flex items-baseline gap-1 mt-2">
            <motion.span 
              className="text-3xl font-bold text-white"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: delay + 0.2 }}
            >
              {value}
            </motion.span>
            {unit && <span className="text-sm text-slate-400">{unit}</span>}
          </div>
          {trendValue !== undefined && (
            <div className={`flex items-center gap-1 mt-2 ${trendColor}`}>
              <TrendIcon className="w-3 h-3" />
              <span className="text-xs font-medium">{trendValue}%</span>
              <span className="text-xs text-slate-500">vs last month</span>
            </div>
          )}
        </div>
        {Icon && (
          <div className={`p-3 rounded-xl bg-white/5 ${iconColors[color]}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
      <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/5 rounded-full blur-2xl" />
    </motion.div>
  );
}