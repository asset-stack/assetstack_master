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
        return { color: 'bg-emerald-500', text: 'text-emerald-700', bg: 'bg-emerald-50', label: 'Operational' };
      case 'degraded':
        return { color: 'bg-amber-500', text: 'text-amber-700', bg: 'bg-amber-50', label: 'Degraded' };
      case 'critical':
        return { color: 'bg-rose-500', text: 'text-rose-700', bg: 'bg-rose-50', label: 'Critical' };
      case 'maintenance':
        return { color: 'bg-blue-500', text: 'text-blue-700', bg: 'bg-blue-50', label: 'Maintenance' };
      default:
        return { color: 'bg-slate-400', text: 'text-slate-600', bg: 'bg-slate-50', label: 'Offline' };
    }
  };

  const getRiskBadge = (risk) => {
    const configs = {
      low: 'bg-emerald-50/80 text-emerald-700 border-emerald-200/60',
      medium: 'bg-amber-50/80 text-amber-700 border-amber-200/60',
      high: 'bg-orange-50/80 text-orange-700 border-orange-200/60',
      critical: 'bg-rose-50/80 text-rose-700 border-rose-200/60'
    };
    return configs[risk] || configs.low;
  };

  const status = getStatusConfig(equipment.status);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      whileHover={{ y: -4, scale: 1.01 }}
      onClick={onClick}
      className="group bg-white rounded-2xl border border-slate-100 p-5 cursor-pointer hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-100/30 transition-all duration-300"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0 pr-3">
          <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full ${status.bg} mb-2`}>
            <span className={`w-1.5 h-1.5 rounded-full ${status.color}`} />
            <span className={`text-[11px] font-semibold ${status.text}`}>{status.label}</span>
          </div>
          <h3 className="text-[15px] font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
            {equipment.name}
          </h3>
          <p className="text-[13px] text-slate-500 capitalize">{equipment.type?.replace(/_/g, ' ')}</p>
        </div>
        <HealthGauge score={equipment.health_score || 0} size={60} label="" />
      </div>

      <div className="space-y-2.5 mb-4">
        <div className="flex items-center justify-between">
          <span className="text-[13px] text-slate-500 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            RUL
          </span>
          <span className="text-[13px] text-slate-800 font-semibold">
            {equipment.remaining_useful_life_days || 'N/A'} days
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[13px] text-slate-500 flex items-center gap-1.5">
            <TrendingDown className="w-3.5 h-3.5" />
            Failure Risk
          </span>
          <span className="text-[13px] text-slate-800 font-semibold">
            {equipment.failure_probability?.toFixed(1) || 0}%
          </span>
        </div>

        <div className="pt-1">
          <div className="flex justify-between text-[11px] text-slate-500 mb-1.5">
            <span>Operating Hours</span>
            <span className="text-slate-700 font-medium">{equipment.operating_hours?.toLocaleString() || 0}h</span>
          </div>
          <Progress 
            value={Math.min((equipment.operating_hours || 0) / 100, 100)} 
            className="h-1.5 bg-slate-100 rounded-full"
          />
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-slate-100/80">
        <span className="text-[11px] text-slate-400 flex items-center gap-1 truncate max-w-[60%]">
          <MapPin className="w-3 h-3 flex-shrink-0" />
          {equipment.location}
        </span>
        <Badge variant="outline" className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${getRiskBadge(equipment.risk_level)}`}>
          {equipment.risk_level || 'low'} risk
        </Badge>
      </div>
    </motion.div>
  );
}