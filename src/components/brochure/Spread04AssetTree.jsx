import React from 'react';
import { Building2, MapPin, Cpu, ChevronRight } from 'lucide-react';
import BrochureShell from './BrochureShell';

export default function Spread04AssetTree() {
  return (
    <BrochureShell pageNumber={4} section="Know what you own" title="The asset register, finally usable.">
      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-5">
          <p className="text-[13px] leading-relaxed opacity-75 mb-6">
            A hierarchical register that mirrors how your portfolio actually exists — site → building
            → system → component — with sensors, photos and documents attached to every node.
          </p>

          <div className="space-y-3 text-[12px]">
            {[
              { k: 'Hierarchy', v: 'Up to 6 levels, drag-to-reparent' },
              { k: 'Bulk import', v: 'CSV / Excel with auto column mapping' },
              { k: 'Saved views', v: 'Per-role, per-site, per-criticality' },
              { k: 'Audit trail', v: 'Every edit logged with actor & timestamp' },
            ].map((r) => (
              <div key={r.k} className="flex items-start gap-3 pt-3 border-t border-current/10">
                <span className="text-indigo-600 font-bold tracking-[0.18em] uppercase text-[10px] w-[28mm] shrink-0">
                  {r.k}
                </span>
                <span className="opacity-80">{r.v}</span>
              </div>
            ))}
          </div>

          <div className="mt-8 p-4 bg-indigo-50 border-l-2 border-indigo-600 rounded-r">
            <div className="text-[10px] uppercase tracking-[0.2em] font-bold text-indigo-700 mb-1.5">
              Outcome
            </div>
            <div className="text-[13px] leading-snug text-slate-800">
              Bunbury Council ingested 4,200 assets in 12 minutes — replacing six disconnected
              spreadsheets.
            </div>
          </div>
        </div>

        <div className="col-span-7">
          {/* Mock asset tree */}
          <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
            <div className="px-4 py-2.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="text-[11px] font-bold text-slate-700">Asset Tree · Bunbury Council</div>
              <div className="text-[10px] text-slate-500 tabular-nums">4,247 assets</div>
            </div>
            <div className="p-3 space-y-1 text-[11px] font-mono">
              {[
                { d: 0, i: Building2, n: 'South West Region', m: '4,247' },
                { d: 1, i: MapPin, n: 'Bunbury Town Hall', m: '312' },
                { d: 2, i: Cpu, n: 'HVAC System — Level 3', m: '24', hl: true },
                { d: 3, i: Cpu, n: 'AHU-301 · Carrier 30RB-220', m: 'health 72', warn: true },
                { d: 3, i: Cpu, n: 'AHU-302 · Carrier 30RB-220', m: 'health 91' },
                { d: 3, i: Cpu, n: 'Chilled water pump CWP-3', m: 'health 84' },
                { d: 2, i: Cpu, n: 'Fire suppression', m: '18' },
                { d: 1, i: MapPin, n: 'South West Library', m: '418' },
                { d: 1, i: MapPin, n: 'Hands Oval Depot', m: '286' },
              ].map((row, idx) => {
                const Icon = row.i;
                return (
                  <div
                    key={idx}
                    className={`flex items-center justify-between py-1.5 px-2 rounded ${
                      row.hl ? 'bg-indigo-50' : ''
                    }`}
                    style={{ paddingLeft: `${row.d * 18 + 8}px` }}
                  >
                    <div className="flex items-center gap-2 text-slate-700">
                      <ChevronRight className="w-3 h-3 text-slate-300" />
                      <Icon className="w-3.5 h-3.5 text-indigo-500" />
                      <span className={row.hl ? 'font-bold text-indigo-900' : ''}>{row.n}</span>
                    </div>
                    <span
                      className={`tabular-nums text-[10px] ${
                        row.warn
                          ? 'text-rose-600 font-bold'
                          : 'text-slate-500'
                      }`}
                    >
                      {row.m}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-3">
            {[
              { k: '4,247', l: 'assets tracked' },
              { k: '12 min', l: 'import time' },
              { k: '6→1', l: 'spreadsheets eliminated' },
            ].map((s) => (
              <div key={s.l} className="border border-current/15 rounded p-3">
                <div
                  className="text-[20px] font-black tabular-nums text-indigo-600"
                  style={{ fontFamily: '"Fraunces", Georgia, serif' }}
                >
                  {s.k}
                </div>
                <div className="text-[10px] uppercase tracking-wider opacity-70 mt-1">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </BrochureShell>
  );
}