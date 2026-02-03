import React from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export default function FleetOverview({ equipment }) {
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

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-slate-200 rounded-lg p-2.5 shadow-lg">
          <p className="text-sm font-medium text-slate-900">{payload[0].name}</p>
          <p className="text-xs text-slate-500">{payload[0].value} equipment</p>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-slate-100 p-6"
    >
      <h3 className="text-[15px] font-bold text-slate-900 mb-6">Fleet Overview</h3>
      
      <div className="grid grid-cols-2 gap-6">
        <div>
          <p className="text-xs font-medium text-slate-500 text-center mb-2">By Status</p>
          <div className="h-[140px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={35}
                  outerRadius={55}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} stroke="transparent" />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-2 mt-2">
            {statusData.map((item, idx) => (
              <div key={idx} className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-xs text-slate-500">{item.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-medium text-slate-500 text-center mb-2">By Risk Level</p>
          <div className="h-[140px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={riskData}
                  cx="50%"
                  cy="50%"
                  innerRadius={35}
                  outerRadius={55}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {riskData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} stroke="transparent" />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-2 mt-2">
            {riskData.map((item, idx) => (
              <div key={idx} className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-xs text-slate-500">{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mt-6 pt-6 border-t border-slate-100/80">
        <div className="text-center p-3 bg-slate-50/50 rounded-xl">
          <p className="text-2xl font-bold text-slate-900">{equipment.length}</p>
          <p className="text-[11px] text-slate-500 font-medium">Total Assets</p>
        </div>
        <div className="text-center p-3 bg-emerald-50/50 rounded-xl">
          <p className="text-2xl font-bold text-emerald-600">{avgHealth}%</p>
          <p className="text-[11px] text-slate-500 font-medium">Avg Health</p>
        </div>
        <div className="text-center p-3 bg-amber-50/50 rounded-xl">
          <p className="text-2xl font-bold text-amber-600">{(riskCounts.high || 0) + (riskCounts.critical || 0)}</p>
          <p className="text-[11px] text-slate-500 font-medium">At Risk</p>
        </div>
      </div>
    </motion.div>
  );
}