import React from 'react';
import BrochureShell from './BrochureShell';

export default function Spread08CapitalPlan() {
  const matrix = [
    [0, 0, 0, 0, 0],
    [0, 0, 1, 2, 1],
    [0, 1, 3, 5, 3],
    [0, 2, 5, 8, 6],
    [0, 1, 3, 6, 9],
  ];
  const colorFor = (c) =>
    c === 0 ? '#f8fafc' :
    c <= 2 ? '#dcfce7' :
    c <= 4 ? '#fef3c7' :
    c <= 6 ? '#fed7aa' : '#fecaca';

  return (
    <BrochureShell pageNumber={8} section="Plan capital" title="Where the money should go, by year.">
      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-7">
          {/* Risk matrix */}
          <div className="border border-slate-200 rounded-lg p-5 bg-white shadow-sm">
            <div className="text-[11px] font-bold text-slate-900 mb-1">
              Risk matrix · 84 capital items
            </div>
            <div className="text-[10px] text-slate-500 mb-4">
              Likelihood × consequence — bubbles sized by replacement cost
            </div>

            <div className="flex">
              {/* Y axis label */}
              <div className="flex flex-col justify-center mr-3">
                <div
                  className="text-[9px] font-bold tracking-widest uppercase text-slate-500 -rotate-90 whitespace-nowrap"
                  style={{ transformOrigin: 'center' }}
                >
                  Likelihood →
                </div>
              </div>

              <div className="flex-1">
                <div className="grid grid-cols-5 gap-1 mb-1">
                  {matrix
                    .slice()
                    .reverse()
                    .map((row, ri) =>
                      row.map((c, ci) => (
                        <div
                          key={`${ri}-${ci}`}
                          className="aspect-square rounded grid place-items-center text-[10px] font-bold tabular-nums"
                          style={{ background: colorFor(c), color: c > 4 ? '#7f1d1d' : '#475569' }}
                        >
                          {c || ''}
                        </div>
                      ))
                    )}
                </div>
                <div className="flex justify-between text-[9px] text-slate-500 px-1 mt-2 font-bold tracking-widest uppercase">
                  <span>Minor</span>
                  <span>Consequence →</span>
                  <span>Catastrophic</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mt-5 pt-5 border-t border-slate-100">
              {[
                { k: '$8.4M', l: '5-year plan' },
                { k: '23', l: 'urgent items' },
                { k: '$2.1M', l: 'avoidable risk' },
              ].map((s) => (
                <div key={s.l}>
                  <div className="text-[20px] font-black tabular-nums text-slate-900">{s.k}</div>
                  <div className="text-[9px] uppercase tracking-wider text-slate-500 mt-0.5">{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="col-span-5">
          <p className="text-[13px] leading-relaxed opacity-75 mb-6">
            Move from a static spreadsheet to a living capital plan. Every item is linked to a real
            asset, a real condition score, and a real replacement cost — and reflows automatically
            as evidence changes.
          </p>

          <div className="space-y-3 text-[12px]">
            {[
              { k: 'Funding optimiser', v: 'Maximise risk reduction per dollar' },
              { k: 'Scenario modeller', v: 'Compare three futures side-by-side' },
              { k: 'Auto-prioritisation', v: 'By risk × consequence × likelihood' },
              { k: 'Board export', v: 'Capital plan as PDF, ready to present' },
            ].map((r) => (
              <div key={r.k} className="pt-3 border-t border-current/10">
                <div className="text-indigo-600 font-bold tracking-[0.18em] uppercase text-[10px] mb-1">
                  {r.k}
                </div>
                <div className="opacity-80">{r.v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </BrochureShell>
  );
}