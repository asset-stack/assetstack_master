import React from 'react';
import { Sparkles, MessageSquare } from 'lucide-react';
import BrochureShell from './BrochureShell';

export default function Spread07AssetMind() {
  return (
    <BrochureShell pageNumber={7} section="Decide what to do" title="AssetMind — your portfolio analyst, on tap.">
      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-5">
          <p className="text-[13px] leading-relaxed opacity-75 mb-6">
            Ask any question in plain English. AssetMind has full read access to every asset,
            sensor, work order, and budget line — and grounds every answer in your actual data,
            with sources you can click into.
          </p>

          <div className="space-y-4">
            {[
              { k: 'What if I defer $400k?', v: 'Returns risk exposure, affected assets, SLA impact' },
              { k: 'Which assets are at risk this quarter?', v: 'Ranked list, with reasoning per asset' },
              { k: 'Draft a board paper on backlog', v: 'One-click, board-ready output' },
              { k: 'Compare this year vs. last', v: 'Auto-generated, cited, exportable' },
            ].map((r) => (
              <div key={r.k} className="flex items-start gap-2.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600 mt-0.5 shrink-0" />
                <div>
                  <div className="text-[12px] font-bold italic">&ldquo;{r.k}&rdquo;</div>
                  <div className="text-[11px] opacity-70 leading-snug mt-0.5">{r.v}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 p-4 bg-indigo-50 border-l-2 border-indigo-600 rounded-r">
            <div className="text-[10px] uppercase tracking-[0.2em] font-bold text-indigo-700 mb-1.5">
              Why this matters
            </div>
            <div className="text-[13px] leading-snug text-slate-800">
              A manager who used to spend two days building a board update now spends ten minutes.
              The other one day, seven hours, fifty minutes goes back to actual work.
            </div>
          </div>
        </div>

        <div className="col-span-7">
          {/* Mock chat */}
          <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
            <div className="px-4 py-2.5 border-b border-slate-200 bg-slate-50 flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-indigo-600 grid place-items-center">
                <MessageSquare className="w-3 h-3 text-white" />
              </div>
              <div className="text-[11px] font-bold text-slate-700">AssetMind</div>
              <span className="ml-auto text-[9px] text-slate-400">Powered by your portfolio data</span>
            </div>
            <div className="p-4 space-y-3 text-[11px]">
              {/* User msg */}
              <div className="flex justify-end">
                <div className="bg-slate-100 rounded-lg rounded-tr-sm px-3 py-2 max-w-[80%]">
                  Which assets should I prioritise replacing this fiscal year if my capex budget is $1.2M?
                </div>
              </div>
              {/* AI msg */}
              <div className="flex">
                <div className="bg-indigo-50 border border-indigo-100 rounded-lg rounded-tl-sm px-3 py-2.5 max-w-[88%] space-y-2">
                  <p className="text-slate-800 leading-relaxed">
                    Based on your current condition data and risk scores, I&apos;d recommend these
                    seven assets — they account for <strong>78% of your portfolio risk exposure</strong> and
                    fit your $1.2M ceiling at $1.18M total:
                  </p>
                  <div className="bg-white rounded border border-indigo-100 divide-y divide-slate-100 text-[10px]">
                    {[
                      ['AHU-301 · Bunbury Hall', '$340k', '94'],
                      ['Pump CWP-3 · Hall West', '$180k', '88'],
                      ['Transformer T-04 · Depot', '$220k', '82'],
                      ['Bridge bearings · Wellington', '$160k', '79'],
                      ['Lift A · Library', '$140k', '74'],
                      ['Switchgear SG-2', '$95k', '71'],
                      ['Boiler · Town Hall', '$45k', '68'],
                    ].map(([n, c, r]) => (
                      <div key={n} className="flex items-center justify-between px-2.5 py-1.5">
                        <span className="text-slate-700">{n}</span>
                        <div className="flex items-center gap-3 tabular-nums">
                          <span className="text-slate-500">{c}</span>
                          <span className="px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 font-bold">
                            {r}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] text-slate-500 italic">
                    Sources: 4 condition reports · 12 RUL forecasts · capital plan v3 · climate risk overlay
                  </p>
                  <div className="flex gap-1.5 pt-1">
                    <button className="text-[10px] px-2 py-1 rounded border border-indigo-200 text-indigo-700 font-bold">
                      Add to capital plan
                    </button>
                    <button className="text-[10px] px-2 py-1 rounded border border-slate-200 text-slate-700 font-bold">
                      Draft board memo
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </BrochureShell>
  );
}