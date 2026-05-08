import React from 'react';
import { Info } from 'lucide-react';
import { fmtRatio, fmtPct, toneFor } from '@/lib/cfoRatios';

const TONE_CLASSES = {
  emerald: 'bg-emerald-50 border-emerald-200 text-emerald-700',
  amber: 'bg-amber-50 border-amber-200 text-amber-700',
  rose: 'bg-rose-50 border-rose-200 text-rose-700',
  slate: 'bg-slate-50 border-slate-200 text-slate-600',
};

const DOT = {
  emerald: 'bg-emerald-500',
  amber: 'bg-amber-500',
  rose: 'bg-rose-500',
  slate: 'bg-slate-300',
};

function Pill({ label, value, tone, hint, healthyRange }) {
  return (
    <div className={`relative rounded-xl border p-3 ${TONE_CLASSES[tone]}`}>
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">{label}</span>
        <span className={`w-1.5 h-1.5 rounded-full ${DOT[tone]}`} />
      </div>
      <div className="mt-1 flex items-baseline gap-2">
        <span className="text-2xl font-bold tabular-nums">{value}</span>
      </div>
      <div className="text-[10px] opacity-75 mt-1 leading-snug flex items-start gap-1">
        <Info className="w-2.5 h-2.5 mt-0.5 shrink-0" />
        <span>{hint} <span className="font-semibold">Healthy: {healthyRange}</span></span>
      </div>
    </div>
  );
}

export default function CFORatiosBar({ ratios }) {
  if (!ratios) return null;

  const cards = [
    {
      label: 'Sustainability Ratio',
      value: fmtRatio(ratios.sustainability),
      tone: toneFor('sustainability', ratios.sustainability),
      hint: 'Capex spend ÷ depreciation.',
      healthyRange: '≥ 0.95',
    },
    {
      label: 'Asset Consumption',
      value: fmtPct(ratios.consumption),
      tone: toneFor('consumption', ratios.consumption),
      hint: 'WDV ÷ CRC. Lower = older portfolio.',
      healthyRange: '60–75%',
    },
    {
      label: 'Backlog Ratio',
      value: fmtPct(ratios.backlog),
      tone: toneFor('backlog', ratios.backlog),
      hint: 'Defect cost ÷ CRC.',
      healthyRange: '< 2%',
    },
    {
      label: 'Renewal Gap Index',
      value: fmtRatio(ratios.renewalGap),
      tone: toneFor('renewalGap', ratios.renewalGap),
      hint: 'Required renewal ÷ available capital.',
      healthyRange: '≤ 1.0',
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-700">CFO Health Ratios</h3>
        <span className="text-[10px] text-slate-400">IPWEA / AAS27 standard</span>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {cards.map((c) => <Pill key={c.label} {...c} />)}
      </div>
    </div>
  );
}