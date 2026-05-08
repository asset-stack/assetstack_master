import React from 'react';
import { Cpu, AlertTriangle, Activity, ShieldCheck } from 'lucide-react';

export default function RegisterStats({ assets = [], filteredCount = 0 }) {
  const total = assets.length;
  const critical = assets.filter((a) => a.risk_level === 'critical' || a.status === 'critical').length;
  const avgHealth = total ? Math.round(assets.reduce((s, a) => s + (Number(a.health_score) || 0), 0) / total) : 0;
  const dqLow = assets.filter((a) => {
    const fields = ['manufacturer', 'model', 'serial_number', 'installation_date', 'last_maintenance_date'];
    return fields.filter((f) => !!a[f]).length < 3;
  }).length;

  const cards = [
    { icon: Cpu, label: 'Showing', value: filteredCount, sub: `of ${total}`, color: 'indigo' },
    { icon: AlertTriangle, label: 'Critical risk', value: critical, sub: `${total ? Math.round((critical / total) * 100) : 0}%`, color: 'rose' },
    { icon: Activity, label: 'Avg health', value: avgHealth, sub: '/ 100', color: 'emerald' },
    { icon: ShieldCheck, label: 'Low data quality', value: dqLow, sub: 'need review', color: 'amber' },
  ];

  const palette = {
    indigo: 'bg-indigo-50 text-indigo-600',
    rose: 'bg-rose-50 text-rose-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
      {cards.map((c) => (
        <div key={c.label} className="bg-white rounded-xl border border-slate-200 p-3 flex items-center gap-3">
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${palette[c.color]}`}>
            <c.icon className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] text-slate-500 uppercase tracking-wide font-semibold">{c.label}</p>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold text-slate-900 tabular-nums">{c.value}</span>
              <span className="text-[11px] text-slate-400">{c.sub}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}