import React from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Activity, Cpu, ShieldCheck, ShieldAlert } from 'lucide-react';

export default function FleetOverview({ equipment = [] }) {
  const statusCounts = equipment.reduce((acc, eq) => {
    const status = eq.status || 'offline';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  const riskCounts = equipment.reduce((acc, eq) => {
    const risk = eq.risk_level || 'low';
    acc[risk] = (acc[risk] || 0) + 1;
    return acc;
  }, {});

  const statusData = [
    { name: 'Operational', value: statusCounts.operational || 0, color: '#10b981' },
    { name: 'Degraded', value: statusCounts.degraded || 0, color: '#f59e0b' },
    { name: 'Critical', value: statusCounts.critical || 0, color: '#ef4444' },
    { name: 'Maintenance', value: statusCounts.maintenance || 0, color: '#3b82f6' },
    { name: 'Offline', value: statusCounts.offline || 0, color: '#94a3b8' },
  ].filter(d => d.value > 0);

  const riskData = [
    { name: 'Low', value: riskCounts.low || 0, color: '#10b981' },
    { name: 'Medium', value: riskCounts.medium || 0, color: '#f59e0b' },
    { name: 'High', value: riskCounts.high || 0, color: '#f97316' },
    { name: 'Critical', value: riskCounts.critical || 0, color: '#ef4444' },
  ].filter(d => d.value > 0);

  const avgHealth = equipment.length > 0 
    ? Math.round(equipment.reduce((sum, eq) => sum + (eq.health_score || 0), 0) / equipment.length)
    : 0;

  const atRisk = (riskCounts.high || 0) + (riskCounts.critical || 0);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 shadow-lg">
          <p className="text-xs font-medium text-slate-900">{payload[0].name}: {payload[0].value}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="bg-white rounded-xl border border-slate-200 p-4 h-full"
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 bg-indigo-50 rounded-lg">
          <Activity className="w-4 h-4 text-indigo-600" />
        </div>
        <h3 className="text-sm font-semibold text-slate-900">Fleet Overview</h3>
      </div>
      
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <p className="text-[10px] text-slate-500 text-center uppercase tracking-wide mb-1">By Status</p>
          <div className="h-[90px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" innerRadius={22} outerRadius={38} paddingAngle={3} dataKey="value">
                  {statusData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} stroke="transparent" />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div>
          <p className="text-[10px] text-slate-500 text-center uppercase tracking-wide mb-1">By Risk</p>
          <div className="h-[90px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={riskData} cx="50%" cy="50%" innerRadius={22} outerRadius={38} paddingAngle={3} dataKey="value">
                  {riskData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} stroke="transparent" />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="bg-slate-50 rounded-lg p-2.5 text-center">
          <Cpu className="w-3.5 h-3.5 text-slate-500 mx-auto mb-0.5" />
          <p className="text-base font-bold text-slate-900">{equipment.length}</p>
          <p className="text-[9px] text-slate-500">Total</p>
        </div>
        <div className="bg-emerald-50 rounded-lg p-2.5 text-center">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 mx-auto mb-0.5" />
          <p className="text-base font-bold text-emerald-700">{avgHealth}%</p>
          <p className="text-[9px] text-slate-500">Health</p>
        </div>
        <div className="bg-rose-50 rounded-lg p-2.5 text-center">
          <ShieldAlert className="w-3.5 h-3.5 text-rose-600 mx-auto mb-0.5" />
          <p className="text-base font-bold text-rose-700">{atRisk}</p>
          <p className="text-[9px] text-slate-500">At Risk</p>
        </div>
      </div>
    </motion.div>
  );
}