import React from 'react';

const LIKELIHOOD = ['unlikely', 'possible', 'likely', 'almost_certain'];
const CONSEQUENCE = ['minor', 'moderate', 'major', 'catastrophic'];

const COLOR = (l, c) => {
  const score = (l + 1) * (c + 1);
  if (score >= 12) return 'bg-rose-500/90 text-white';
  if (score >= 8) return 'bg-amber-500/90 text-white';
  if (score >= 4) return 'bg-yellow-300 text-slate-900';
  return 'bg-emerald-200 text-emerald-900';
};

export default function RiskMatrix({ items }) {
  // Build a 4x4 grid: rows = likelihood (top→bottom: high→low), cols = consequence
  const grid = LIKELIHOOD.map(() => CONSEQUENCE.map(() => 0));
  items.forEach(it => {
    const li = LIKELIHOOD.indexOf(it.likelihood_of_failure);
    const ci = CONSEQUENCE.indexOf(it.consequence_of_failure);
    if (li >= 0 && ci >= 0) grid[li][ci] += 1;
  });

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5">
      <h3 className="text-sm font-semibold text-slate-900 mb-1">Risk matrix</h3>
      <p className="text-[11px] text-slate-500 mb-4">Likelihood × consequence of failure</p>

      <div className="flex">
        {/* Y-axis label */}
        <div className="flex flex-col justify-around pr-2 text-[9px] uppercase tracking-wider text-slate-500 font-semibold writing-mode-vertical" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
          Likelihood →
        </div>

        <div className="flex-1">
          {/* The grid: top row = almost_certain, bottom = unlikely */}
          <div className="space-y-1">
            {[...LIKELIHOOD].reverse().map((l, rowIdx) => {
              const li = LIKELIHOOD.length - 1 - rowIdx;
              return (
                <div key={l} className="flex gap-1 items-center">
                  <span className="text-[9px] text-slate-500 w-20 capitalize text-right pr-1">{l.replace('_', ' ')}</span>
                  {CONSEQUENCE.map((c, ci) => {
                    const count = grid[li][ci];
                    return (
                      <div
                        key={c}
                        className={`flex-1 aspect-square rounded flex items-center justify-center text-[14px] font-bold ${COLOR(li, ci)}`}
                      >
                        {count > 0 ? count : ''}
                      </div>
                    );
                  })}
                </div>
              );
            })}
            {/* X-axis labels */}
            <div className="flex gap-1 items-center pt-1">
              <span className="w-20" />
              {CONSEQUENCE.map(c => (
                <div key={c} className="flex-1 text-[9px] text-slate-500 text-center capitalize">{c}</div>
              ))}
            </div>
            <div className="text-[9px] uppercase tracking-wider text-slate-500 font-semibold text-center pt-1">
              Consequence →
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}