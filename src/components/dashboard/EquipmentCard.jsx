import React from 'react';
import { motion } from 'framer-motion';
import { Clock, TrendingDown, MapPin } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import HealthGauge from './HealthGauge';

export default function EquipmentCard({ equipment, onClick, delay = 0 }) {
  const getStatusConfig = (status) => {
    switch (status) {
      case 'operational':
        return { color: 'bg-emerald-500', text: 'text-emerald-600', label: 'Operational' };
      case 'degraded':
        return { color: 'bg-amber-500', text: 'text-amber-600', label: 'Degraded' };
      case 'critical':
        return { color: 'bg-rose-500', text: 'text-rose-600', label: 'Critical' };
      case 'maintenance':
        return { color: 'bg-blue-500', text: 'text-blue-600', label: 'Maintenance' };
      default:
        return { color: 'bg-slate-400', text: 'text-slate-500', label: 'Offline' };
    }
  };

  const getRiskBadge = (risk) => {
    const configs = {
      low: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      medium: 'bg-amber-50 text-amber-700 border-amber-200',
      high: 'bg-orange-50 text-orange-700 border-orange-200',
      critical: 'bg-rose-50 text-rose-700 border-rose-200'
    };
    return configs[risk] || configs.low;
  };

  const status = getStatusConfig(equipment.status);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      whileHover={{ y: -2 }}
      onClick={onClick}
      className="group bg-white rounded-xl border border-slate-200 p-5 cursor-pointer hover:border-indigo-300 hover:shadow-md transition-all duration-200"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={`w-2 h-2 rounded-full ${status.color}`} />
            <span className={`text-xs font-medium ${status.text}`}>{status.label}</span>
          </div>
          <h3 className="text-base font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
            {equipment.name}
          </h3>
          <p className="text-sm text-slate-500 capitalize">{equipment.type?.replace(/_/g, ' ')}</p>
        </div>
        <HealthGauge score={equipment.health_score || 0} size={64} label="" />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            RUL
          </span>
          <span className="text-slate-900 font-medium">
            {equipment.remaining_useful_life_days || 'N/A'} days
          </span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500 flex items-center gap-1.5">
            <TrendingDown className="w-3.5 h-3.5" />
            Failure Risk
          </span>
          <span className="text-slate-900 font-medium">
            {equipment.failure_probability?.toFixed(1) || 0}%
          </span>
        </div>

        <div>
          <div className="flex justify-between text-xs text-slate-500 mb-1.5">
            <span>Operating Hours</span>
            <span className="text-slate-700">{equipment.operating_hours?.toLocaleString() || 0}h</span>
          </div>
          <Progress 
            value={Math.min((equipment.operating_hours || 0) / 100, 100)} 
            className="h-1.5 bg-slate-100"
          />
        </div>
      </div>

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
        <span className="text-xs text-slate-400 flex items-center gap-1">
          <MapPin className="w-3 h-3" />
          {equipment.location}
        </span>
        <Badge variant="outline" className={`text-xs font-medium ${getRiskBadge(equipment.risk_level)}`}>
          {equipment.risk_level || 'low'} risk
        </Badge>
      </div>
    </motion.div>
  );
}