import React from 'react';
import { motion } from 'framer-motion';
import { Activity, AlertTriangle, Clock, Wrench, TrendingDown } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import HealthGauge from './HealthGauge';

export default function EquipmentCard({ equipment, onClick, delay = 0 }) {
  const getStatusConfig = (status) => {
    switch (status) {
      case 'operational':
        return { color: 'bg-emerald-500', text: 'text-emerald-400', label: 'Operational' };
      case 'degraded':
        return { color: 'bg-amber-500', text: 'text-amber-400', label: 'Degraded' };
      case 'critical':
        return { color: 'bg-rose-500', text: 'text-rose-400', label: 'Critical' };
      case 'maintenance':
        return { color: 'bg-blue-500', text: 'text-blue-400', label: 'Maintenance' };
      default:
        return { color: 'bg-slate-500', text: 'text-slate-400', label: 'Offline' };
    }
  };

  const getRiskBadge = (risk) => {
    const configs = {
      low: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      medium: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      critical: 'bg-rose-500/20 text-rose-400 border-rose-500/30'
    };
    return configs[risk] || configs.low;
  };

  const status = getStatusConfig(equipment.status);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ scale: 1.02, y: -4 }}
      onClick={onClick}
      className="group bg-slate-900/50 rounded-2xl border border-slate-700/50 p-5 backdrop-blur-xl cursor-pointer hover:border-blue-500/30 transition-all duration-300"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={`w-2 h-2 rounded-full ${status.color} animate-pulse`} />
            <span className={`text-xs font-medium ${status.text}`}>{status.label}</span>
          </div>
          <h3 className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors">
            {equipment.name}
          </h3>
          <p className="text-sm text-slate-400">{equipment.type?.replace(/_/g, ' ')}</p>
        </div>
        <HealthGauge score={equipment.health_score || 0} size={70} label="" />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-400 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            RUL
          </span>
          <span className="text-white font-medium">
            {equipment.remaining_useful_life_days || 'N/A'} days
          </span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-400 flex items-center gap-1.5">
            <TrendingDown className="w-3.5 h-3.5" />
            Failure Risk
          </span>
          <span className="text-white font-medium">
            {equipment.failure_probability?.toFixed(1) || 0}%
          </span>
        </div>

        <div>
          <div className="flex justify-between text-xs text-slate-400 mb-1">
            <span>Operating Hours</span>
            <span>{equipment.operating_hours?.toLocaleString() || 0}h</span>
          </div>
          <Progress 
            value={Math.min((equipment.operating_hours || 0) / 100, 100)} 
            className="h-1.5 bg-slate-700"
          />
        </div>
      </div>

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-700/50">
        <span className="text-xs text-slate-500">{equipment.location}</span>
        <Badge variant="outline" className={`text-xs ${getRiskBadge(equipment.risk_level)}`}>
          {equipment.risk_level || 'low'} risk
        </Badge>
      </div>
    </motion.div>
  );
}