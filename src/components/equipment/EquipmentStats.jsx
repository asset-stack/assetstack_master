import React from 'react';
import { motion } from 'framer-motion';
import { Cpu, Activity, AlertTriangle, Clock, Wrench, TrendingUp } from 'lucide-react';
import { deriveHealthScore, deriveRULDays, deriveRiskLevel, deriveStatus } from '@/lib/assetMetrics';

export default function EquipmentStats({ equipment }) {
  const totalEquipment = equipment.length;
  const computed = equipment.map((e) => ({
    health: deriveHealthScore(e),
    rul: deriveRULDays(e),
    risk: deriveRiskLevel(e),
    status: deriveStatus(e),
  }));
  const operational = computed.filter((c) => c.status === 'operational').length;
  const degraded = computed.filter((c) => c.status === 'degraded').length;
  const critical = computed.filter((c) => c.risk === 'critical' || c.status === 'critical').length;
  const healthValues = computed.map((c) => c.health).filter((h) => h != null);
  const avgHealth = healthValues.length > 0
    ? Math.round(healthValues.reduce((s, h) => s + h, 0) / healthValues.length)
    : 0;
  const lowRUL = computed.filter((c) => c.rul != null && c.rul < 365).length;

  const stats = [
    { 
      label: 'Total Assets', 
      value: totalEquipment, 
      icon: Cpu, 
      color: 'bg-indigo-100 text-indigo-600',
      bgColor: 'bg-indigo-50'
    },
    { 
      label: 'Operational', 
      value: operational, 
      icon: Activity, 
      color: 'bg-emerald-100 text-emerald-600',
      bgColor: 'bg-emerald-50',
      suffix: `${totalEquipment > 0 ? Math.round((operational/totalEquipment)*100) : 0}%`
    },
    { 
      label: 'Degraded', 
      value: degraded, 
      icon: Wrench, 
      color: 'bg-amber-100 text-amber-600',
      bgColor: 'bg-amber-50'
    },
    { 
      label: 'Critical', 
      value: critical, 
      icon: AlertTriangle, 
      color: 'bg-rose-100 text-rose-600',
      bgColor: 'bg-rose-50'
    },
    { 
      label: 'Avg Health', 
      value: `${avgHealth}%`, 
      icon: TrendingUp, 
      color: avgHealth >= 70 ? 'bg-emerald-100 text-emerald-600' : avgHealth >= 50 ? 'bg-amber-100 text-amber-600' : 'bg-rose-100 text-rose-600',
      bgColor: avgHealth >= 70 ? 'bg-emerald-50' : avgHealth >= 50 ? 'bg-amber-50' : 'bg-rose-50'
    },
    { 
      label: 'Low RUL (<1yr)', 
      value: lowRUL, 
      icon: Clock, 
      color: 'bg-purple-100 text-purple-600',
      bgColor: 'bg-purple-50'
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {stats.map((stat, idx) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.05 }}
          className={`${stat.bgColor} rounded-xl p-4 border border-slate-200/50`}
        >
          <div className="flex items-center gap-2 mb-2">
            <div className={`p-1.5 rounded-lg ${stat.color}`}>
              <stat.icon className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-600">{stat.label}</p>
            {stat.suffix && <span className="text-xs text-slate-500">{stat.suffix}</span>}
          </div>
        </motion.div>
      ))}
    </div>
  );
}