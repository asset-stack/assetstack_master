import React from 'react';
import { Card } from '@/components/ui/card';
import { Briefcase, TrendingUp, AlertTriangle, Wallet, CheckCircle2 } from 'lucide-react';
import { formatCurrency, projectStats } from '@/lib/projectUtils';

export default function ProjectStats({ projects = [] }) {
  const stats = projectStats(projects);
  const tiles = [
    {
      label: 'Active Projects',
      value: stats.total,
      icon: Briefcase,
      color: 'bg-indigo-50 text-indigo-600'
    },
    {
      label: 'In Delivery',
      value: stats.inDelivery,
      icon: TrendingUp,
      color: 'bg-blue-50 text-blue-600'
    },
    {
      label: 'At Risk',
      value: stats.atRisk,
      icon: AlertTriangle,
      color: 'bg-amber-50 text-amber-600'
    },
    {
      label: 'Total Budget',
      value: formatCurrency(stats.totalBudget),
      icon: Wallet,
      color: 'bg-emerald-50 text-emerald-600'
    },
    {
      label: 'Spend to Date',
      value: formatCurrency(stats.totalActual),
      icon: CheckCircle2,
      color: 'bg-slate-100 text-slate-700'
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
      {tiles.map((t) => {
        const Icon = t.icon;
        return (
          <Card key={t.label} className="p-4 border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                {t.label}
              </span>
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${t.color}`}>
                <Icon className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-xl font-bold text-slate-900 tabular-nums">{t.value}</div>
          </Card>
        );
      })}
    </div>
  );
}