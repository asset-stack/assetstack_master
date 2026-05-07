import React from 'react';
import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import HealthGauge from './HealthGauge';
import AssetMetricsBadges from '@/components/equipment/AssetMetricsBadges';
import { deriveHealthScore, deriveRULDays, deriveRiskLevel, deriveStatus, deriveCRC, fmtMoney } from '@/lib/assetMetrics';

export default function EquipmentCard({ equipment, onClick, delay = 0 }) {
  const getStatusConfig = (status) => {
    switch (status) {
      case 'operational': return { color: 'bg-emerald-500', label: 'Operational' };
      case 'degraded': return { color: 'bg-amber-500', label: 'Degraded' };
      case 'critical': return { color: 'bg-rose-500', label: 'Critical' };
      case 'maintenance': return { color: 'bg-blue-500', label: 'Maintenance' };
      default: return { color: 'bg-slate-400', label: 'Offline' };
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

  const derivedHealth = deriveHealthScore(equipment);
  const derivedRUL = deriveRULDays(equipment);
  const derivedRisk = deriveRiskLevel(equipment);
  const derivedStatus = deriveStatus(equipment);
  const crc = deriveCRC(equipment);
  const status = getStatusConfig(derivedStatus);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay }}
      onClick={onClick}
      className="group bg-white rounded-xl border border-slate-200/80 p-4 cursor-pointer hover:border-indigo-300 hover:shadow-lg active:scale-[0.98] transition-all duration-200"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0 pr-3">
          <div className="flex items-center gap-1.5 mb-1">
            <span className={`w-2 h-2 rounded-full ${status.color} shrink-0`} />
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wide truncate">{equipment.type?.replace(/_/g, ' ')}</span>
          </div>
          <h3 className="text-sm font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors leading-snug line-clamp-2">
            {equipment.name}
          </h3>
        </div>
        <HealthGauge score={derivedHealth ?? 0} size={44} label="" />
      </div>

      {/* Register-grade badges */}
      <div className="mb-2">
        <AssetMetricsBadges equipment={equipment} compact />
      </div>

      {/* Stats */}
      <div className="space-y-2 mb-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-500">RUL</span>
          <span className="text-xs text-slate-800 font-semibold tabular-nums">
            {derivedRUL != null ? (derivedRUL > 730 ? `${Math.round(derivedRUL / 365)} yrs` : `${derivedRUL} days`) : '—'}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-500">Risk</span>
          <Badge variant="outline" className={`text-[10px] font-semibold px-1.5 py-0 h-[18px] ${getRiskBadge(derivedRisk)}`}>
            {derivedRisk}
          </Badge>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-500">Value</span>
          <span className="text-xs text-slate-600 font-medium tabular-nums">{crc > 0 ? fmtMoney(crc) : '—'}</span>
        </div>
      </div>

      {/* Location */}
      <div className="flex items-center gap-1.5 pt-2.5 border-t border-slate-100">
        <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
        <span className="text-[11px] text-slate-500 truncate">{equipment.location || 'Unknown'}</span>
      </div>
    </motion.div>
  );
}