import React from 'react';
import BrochureShell from './BrochureShell';

const SCENARIOS = [
  {
    name: 'Do nothing',
    tag: 'Status quo',
    color: 'rose',
    metrics: [
      ['5-yr cost', '$14.2M'],
      ['Risk exposure', '$4.8M'],
      ['Failures expected', '47'],
      ['SLA breaches', '12'],
    ],
    summary: 'Backlog compounds. Risk grows linearly. Eventually a major asset fails publicly.',
  },
  {
    name: 'Reactive +10%',
    tag: 'Current trajectory',
    color: 'amber',
    metrics: [
      ['5-yr cost', '$11.8M'],
      ['Risk exposure', '$2.4M'],
      ['Failures expected', '28'],
      ['SLA breaches', '6'],
    ],
    summary: 'Modest improvement. Spend creeps up but headline failures stay political.',
  },
  {
    name: 'Predictive shift',
    tag: 'Recommended',
    color: 'emerald',
    metrics: [
      ['5-yr cost', '$8.9M'],
      ['Risk exposure', '$0.6M'],
      ['Failures expected', '9'],
      ['SLA breaches', '1'],
    ],
    summary: '$5.3M saved, 80% fewer failures. Asset lifespan extended by an average of 4.2 years.',
  },
];

const COLOR_MAP = {
  rose: { bg: 'bg-rose-50', border: 'border-rose-200', tag: 'text-rose-700', accent: 'bg-rose-500' },
  amber: { bg: 'bg-amber-50', border: 'border-amber-200', tag: 'text-amber-700', accent: 'bg-amber-500' },
  emerald: { bg: 'bg-emerald-50', border: 'border-emerald-300', tag: 'text-emerald-700', accent: 'bg-emerald-500' },
};

export default function Spread09Scenarios() {
  return (
    <BrochureShell pageNumber={9} section="Model scenarios" title="Three futures, side by side.">
      <p className="text-[13px] leading-relaxed opacity-75 max-w-[140mm] mb-8">
        AssetStack runs full portfolio simulations against your real condition data. Boards see the
        cost of inaction in dollars and failures, not abstract risk scores.
      </p>

      <div className="grid grid-cols-3 gap-4">
        {SCENARIOS.map((s) => {
          const c = COLOR_MAP[s.color];
          return (
            <div
              key={s.name}
              className={`${c.bg} ${c.border} border-2 rounded-lg p-5 flex flex-col`}
              style={{ minHeight: '170mm' }}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`text-[9px] font-bold tracking-[0.24em] uppercase ${c.tag}`}>
                  {s.tag}
                </span>
                <div className={`w-2 h-2 rounded-full ${c.accent}`} />
              </div>
              <h3
                className="text-[26px] font-black leading-tight tracking-tight text-slate-900 mb-5"
                style={{ fontFamily: '"Fraunces", Georgia, serif' }}
              >
                {s.name}
              </h3>

              <div className="space-y-3 mb-6 flex-1">
                {s.metrics.map(([k, v]) => (
                  <div key={k} className="flex items-baseline justify-between border-b border-slate-200/60 pb-2">
                    <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">
                      {k}
                    </span>
                    <span
                      className="text-[20px] font-black tabular-nums text-slate-900"
                      style={{ fontFamily: '"Fraunces", Georgia, serif' }}
                    >
                      {v}
                    </span>
                  </div>
                ))}
              </div>

              <p className="text-[11px] leading-relaxed text-slate-700">{s.summary}</p>
            </div>
          );
        })}
      </div>
    </BrochureShell>
  );
}