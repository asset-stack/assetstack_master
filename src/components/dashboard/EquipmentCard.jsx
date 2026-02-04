import React from 'react';
import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import HealthGauge from './HealthGauge';

export default function EquipmentCard({ equipment, onClick, delay = 0 }) {
  const getStatusConfig = (status) => {
    switch (status) {
      case 'operational':
        return { color: 'bg-emerald-500', label: 'Operational' };
      case 'degraded':
        return { color: 'bg-amber-500', label: 'Degraded' };
      case 'critical':
        return { color: 'bg-rose-500', label: 'Critical' };
      case 'maintenance':
        return { color: 'bg-blue-500', label: 'Maintenance' };
      default:
        return { color: 'bg-slate-400', label: 'Offline' };
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
      transition={{ duration: 0.2, delay }}
      onClick={onClick}
      className="group bg-white rounded-xl border border-slate-200 p-4 cursor-pointer hover:border-indigo-300 hover:shadow-lg transition-all duration-200"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0 pr-2">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className={`w-1.5 h-1.5 rounded-full ${status.color}`} />
            <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wide">{equipment.type?.replace(/_/g, ' ')}</span>
          </div>
          <h3 className="text-sm font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
            {equipment.name}
          </h3>
        </div>
        <HealthGauge score={equipment.health_score || 0} size={44} label="" />
      </div>

      <div className="space-y-1.5 mb-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-slate-500">RUL</span>
          <span className="text-xs text-slate-800 font-semibold">{equipment.remaining_useful_life_days || '—'} days</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-slate-500">Risk</span>
          <Badge variant="outline" className={`text-[9px] font-semibold px-1.5 py-0 h-4 ${getRiskBadge(equipment.risk_level)}`}>
            {equipment.risk_level || 'low'}
          </Badge>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-slate-500">Hours</span>
          <span className="text-[11px] text-slate-600 font-medium">{equipment.operating_hours?.toLocaleString() || 0}</span>
        </div>
      </div>

      <div className="flex items-center gap-1 pt-2.5 border-t border-slate-100">
        <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
        <span className="text-[10px] text-slate-500 truncate">{equipment.location || 'Unknown'}</span>
      </div>
    </motion.div>
  );
}