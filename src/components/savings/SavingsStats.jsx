import React, { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { DollarSign, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';

const fmt = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n || 0);

export default function SavingsStats({ entries }) {
  const stats = useMemo(() => {
    const verified = entries.filter((e) => e.status === 'verified');
    const projected = entries.filter((e) => e.status === 'projected' || e.status === 'in_progress');
    const disputed = entries.filter((e) => e.status === 'disputed');

    const verifiedTotal = verified.reduce((s, e) => s + (e.verified_savings || 0), 0);
    const projectedTotal = projected.reduce((s, e) => s + ((e.predicted_failure_cost || 0) - (e.intervention_cost || 0)), 0);
    const disputedTotal = disputed.reduce((s, e) => s + ((e.predicted_failure_cost || 0) - (e.intervention_cost || 0)), 0);

    return {
      verifiedTotal,
      verifiedCount: verified.length,
      projectedTotal,
      projectedCount: projected.length,
      disputedCount: disputed.length,
      disputedTotal,
    };
  }, [entries]);

  const cards = [
    {
      label: 'Verified Savings',
      value: fmt(stats.verifiedTotal),
      sub: `${stats.verifiedCount} entries`,
      icon: CheckCircle2,
      bg: 'bg-emerald-50 border-emerald-100',
      text: 'text-emerald-700',
      iconColor: 'text-emerald-600',
    },
    {
      label: 'Projected (in-flight)',
      value: fmt(stats.projectedTotal),
      sub: `${stats.projectedCount} pending`,
      icon: Clock,
      bg: 'bg-amber-50 border-amber-100',
      text: 'text-amber-700',
      iconColor: 'text-amber-600',
    },
    {
      label: 'Disputed',
      value: fmt(stats.disputedTotal),
      sub: `${stats.disputedCount} entries`,
      icon: AlertTriangle,
      bg: 'bg-red-50 border-red-100',
      text: 'text-red-700',
      iconColor: 'text-red-600',
    },
    {
      label: 'Total Tracked',
      value: fmt(stats.verifiedTotal + stats.projectedTotal),
      sub: `${entries.length} total entries`,
      icon: DollarSign,
      bg: 'bg-slate-50 border-slate-200',
      text: 'text-slate-700',
      iconColor: 'text-slate-600',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <Card key={c.label} className={`${c.bg} border`}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Icon className={`w-4 h-4 ${c.iconColor}`} />
                <span className={`text-[11px] font-semibold uppercase tracking-wider ${c.text}`}>{c.label}</span>
              </div>
              <div className={`text-2xl font-bold ${c.text}`}>{c.value}</div>
              <div className="text-xs text-slate-500 mt-1">{c.sub}</div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}