import React from 'react';
import { ShieldCheck } from 'lucide-react';
import BrochureShell from './BrochureShell';

const ENTRIES = [
  { id: 'SV-218', d: 'Predictive replace · AHU-301', cat: 'Avoided failure', v: '$48,200', s: 'Verified' },
  { id: 'SV-217', d: 'Optimised PM schedule · 14 pumps', cat: 'Labour saved', v: '$22,800', s: 'Verified' },
  { id: 'SV-216', d: 'Spare parts pooling · 3 depots', cat: 'Inventory', v: '$31,400', s: 'Verified' },
  { id: 'SV-215', d: 'Deferred replacement · Lift B (still safe)', cat: 'Capex deferred', v: '$140,000', s: 'Verified' },
  { id: 'SV-214', d: 'Contractor rate consolidation', cat: 'Procurement', v: '$18,600', s: 'Verified' },
  { id: 'SV-213', d: 'Energy tuning · HVAC zones 4-7', cat: 'Operational', v: '$9,400', s: 'Pending' },
];

export default function Spread11Savings() {
  return (
    <BrochureShell pageNumber={11} section="Prove the value" title="A savings ledger that auditors trust.">
      <div className="grid grid-cols-12 gap-8 mb-6">
        <div className="col-span-5">
          <p className="text-[13px] leading-relaxed opacity-75 mb-6">
            Every saving is logged with its source action, evidence, and verification path. CFOs can
            audit any line back to the work order that produced it.
          </p>

          <div className="grid grid-cols-2 gap-3">
            {[
              { k: '$2.31M', l: 'Verified savings YTD' },
              { k: '$487k', l: 'This quarter' },
              { k: '94%', l: 'Verification rate' },
              { k: '12 days', l: 'Avg. time to verify' },
            ].map((s) => (
              <div key={s.l} className="border border-current/15 rounded p-3">
                <div
                  className="text-[22px] font-black tabular-nums text-indigo-600"
                  style={{ fontFamily: '"Fraunces", Georgia, serif' }}
                >
                  {s.k}
                </div>
                <div className="text-[10px] uppercase tracking-wider opacity-70 mt-1">{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="col-span-7">
          <div className="border border-slate-200 rounded-lg bg-white shadow-sm overflow-hidden">
            <div className="px-4 py-2.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <div className="text-[11px] font-bold text-slate-700">Savings Ledger · Q2 2026</div>
              </div>
              <div className="text-[10px] text-slate-500 tabular-nums">6 of 142 entries</div>
            </div>
            <table className="w-full text-[10px]">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-widest text-[9px]">
                <tr>
                  <th className="text-left px-3 py-2 font-bold">ID</th>
                  <th className="text-left px-3 py-2 font-bold">Description</th>
                  <th className="text-left px-3 py-2 font-bold">Category</th>
                  <th className="text-right px-3 py-2 font-bold">Value</th>
                  <th className="text-right px-3 py-2 font-bold">Status</th>
                </tr>
              </thead>
              <tbody>
                {ENTRIES.map((e) => (
                  <tr key={e.id} className="border-t border-slate-100">
                    <td className="px-3 py-2 font-mono text-slate-500">{e.id}</td>
                    <td className="px-3 py-2 text-slate-800">{e.d}</td>
                    <td className="px-3 py-2 text-slate-600">{e.cat}</td>
                    <td className="px-3 py-2 text-right font-bold tabular-nums text-slate-900">{e.v}</td>
                    <td className="px-3 py-2 text-right">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                          e.s === 'Verified'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {e.s}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="p-4 bg-indigo-50 border-l-2 border-indigo-600 rounded-r">
        <div className="text-[10px] uppercase tracking-[0.2em] font-bold text-indigo-700 mb-1.5">
          Why it matters
        </div>
        <div className="text-[13px] leading-snug text-slate-800 max-w-[180mm]">
          When the cost-saving story is line-by-line auditable, funding conversations stop being
          arguments and start being decisions. Finance, audit and operations finally use the same
          numbers.
        </div>
      </div>
    </BrochureShell>
  );
}