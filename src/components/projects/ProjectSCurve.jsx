import React, { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import {
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ComposedChart,
  CartesianGrid,
  Legend
} from 'recharts';
import { Activity } from 'lucide-react';
import { calculateEVM } from '@/lib/projectAnalytics';

/**
 * S-Curve: industry-standard cumulative cost vs time chart
 * showing PV (planned), EV (earned), AC (actual) and EAC forecast.
 */
export default function ProjectSCurve({ project }) {
  const data = useMemo(() => {
    if (!project?.start_date || !project?.target_end_date || !project?.budget) {
      return [];
    }

    const start = new Date(project.start_date).getTime();
    const end = new Date(project.target_end_date).getTime();
    const now = Date.now();
    const budget = project.budget;
    const actualProgress = (project.progress_percent || 0) / 100;
    const actualCost = project.actual_cost || 0;
    const evm = calculateEVM(project);

    // S-curve shape: cumulative budget follows an S using sigmoid
    const sigmoid = (t) => 1 / (1 + Math.exp(-10 * (t - 0.5)));

    const points = [];
    const steps = 24;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const date = start + (end - start) * t;
      const planned = budget * sigmoid(t);
      const isPast = date <= now;
      const nowFrac = (now - start) / (end - start);

      // Earned and Actual only up to now
      const earned = isPast ? budget * actualProgress * (t / Math.max(nowFrac, 0.01)) : null;
      const actual = isPast ? actualCost * (t / Math.max(nowFrac, 0.01)) : null;

      // EAC forecast curve from "now" forward
      const forecast =
        !isPast && evm.EAC
          ? actualCost + (evm.EAC - actualCost) * ((t - nowFrac) / (1 - nowFrac))
          : null;

      points.push({
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        Planned: Math.round(planned),
        Earned: earned !== null ? Math.round(Math.min(earned, budget * actualProgress)) : null,
        Actual: actual !== null ? Math.round(Math.min(actual, actualCost)) : null,
        Forecast: forecast !== null ? Math.round(forecast) : null
      });
    }
    return points;
  }, [project]);

  if (!data.length) {
    return (
      <Card className="p-5 text-center text-sm text-slate-500">
        Set a budget, start date, and target end date to see the S-curve.
      </Card>
    );
  }

  return (
    <Card className="p-5">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center">
          <Activity className="w-4 h-4 text-violet-600" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900">Cumulative S-Curve</h3>
          <p className="text-[11px] text-slate-500">
            Planned vs Earned vs Actual cost with EAC forecast
          </p>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <ComposedChart data={data} margin={{ top: 5, right: 10, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="plannedGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#94a3b8" stopOpacity={0.25} />
              <stop offset="100%" stopColor="#94a3b8" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="earnedGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="#94a3b8" interval="preserveStartEnd" />
          <YAxis
            tick={{ fontSize: 10 }}
            stroke="#94a3b8"
            tickFormatter={(v) => (v >= 1000 ? `$${(v / 1000).toFixed(0)}k` : `$${v}`)}
          />
          <Tooltip
            contentStyle={{
              fontSize: 11,
              border: '1px solid #e2e8f0',
              borderRadius: 8
            }}
            formatter={(v) => (v ? `$${v.toLocaleString()}` : '—')}
          />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Area
            type="monotone"
            dataKey="Planned"
            stroke="#94a3b8"
            strokeWidth={1.5}
            fill="url(#plannedGrad)"
            strokeDasharray="4 4"
          />
          <Area
            type="monotone"
            dataKey="Earned"
            stroke="#10b981"
            strokeWidth={2}
            fill="url(#earnedGrad)"
          />
          <Line
            type="monotone"
            dataKey="Actual"
            stroke="#ef4444"
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="Forecast"
            stroke="#8b5cf6"
            strokeWidth={2}
            strokeDasharray="6 4"
            dot={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </Card>
  );
}