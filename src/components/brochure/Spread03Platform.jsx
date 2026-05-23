import React from 'react';
import { Layers, Brain, Cpu, Wrench, BarChart3, Banknote } from 'lucide-react';
import BrochureShell from './BrochureShell';

const SURFACES = [
  { icon: Cpu, name: 'Asset register', desc: 'Every asset, every component, every relationship.' },
  { icon: Brain, name: 'AssetMind', desc: 'AI decision layer over the whole portfolio.' },
  { icon: BarChart3, name: 'Predictions', desc: 'Failure forecasts, RUL & defect cascades.' },
  { icon: Wrench, name: 'Maintenance', desc: 'Plans, work orders, contractors, field ops.' },
  { icon: Banknote, name: 'Finance', desc: 'Capital plans, valuation, savings ledger.' },
  { icon: Layers, name: 'Digital twin', desc: 'LiDAR scans, anomalies, 3D context.' },
];

export default function Spread03Platform() {
  return (
    <BrochureShell pageNumber={3} section="Platform" title="One model. Six surfaces.">
      <p className="text-[14px] leading-relaxed opacity-70 max-w-[140mm] mb-10">
        Every feature in AssetStack reads from and writes to the same canonical model. A condition
        finding in the field becomes a work order, a budget impact, a savings entry, and a board
        slide — without copy-paste.
      </p>

      <div className="grid grid-cols-3 gap-5">
        {SURFACES.map((s, i) => {
          const Icon = s.icon;
          return (
            <div
              key={s.name}
              className="border border-current/15 rounded-lg p-5 flex flex-col gap-3 min-h-[60mm]"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-md bg-indigo-50 grid place-items-center">
                  <Icon className="w-5 h-5 text-indigo-600" strokeWidth={2} />
                </div>
                <span className="text-[10px] font-bold tracking-widest text-indigo-600 tabular-nums">
                  0{i + 1}
                </span>
              </div>
              <div>
                <div
                  className="text-[20px] font-black leading-tight tracking-tight"
                  style={{ fontFamily: '"Fraunces", Georgia, serif' }}
                >
                  {s.name}
                </div>
                <div className="text-[12px] opacity-70 leading-snug mt-1.5">{s.desc}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-10 pt-6 border-t border-current/15 grid grid-cols-3 gap-6 text-[11px] opacity-70">
        <div>
          <div className="font-bold text-indigo-600 uppercase tracking-[0.2em] text-[9px] mb-1">
            One database
          </div>
          47 entities, fully relational. No silos.
        </div>
        <div>
          <div className="font-bold text-indigo-600 uppercase tracking-[0.2em] text-[9px] mb-1">
            One identity model
          </div>
          Multi-tenant, role-aware, audit-logged end-to-end.
        </div>
        <div>
          <div className="font-bold text-indigo-600 uppercase tracking-[0.2em] text-[9px] mb-1">
            One AI layer
          </div>
          AssetMind has full read access to every surface.
        </div>
      </div>
    </BrochureShell>
  );
}