import React from 'react';
import { Box, Sparkles, Camera } from 'lucide-react';
import BrochureShell from './BrochureShell';

export default function Spread05DigitalTwin() {
  return (
    <BrochureShell
      pageNumber={5}
      section="See it in 3D"
      title="Digital twin & scan analysis."
    >
      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-7">
          {/* Mock 3D scan with anomalies tagged */}
          <div
            className="relative rounded-lg overflow-hidden border border-slate-200 shadow-sm"
            style={{
              background:
                'linear-gradient(135deg, #1e293b 0%, #0f172a 60%, #020617 100%)',
              aspectRatio: '4/3',
            }}
          >
            {/* Grid overlay */}
            <svg className="absolute inset-0 w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#6366f1" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>

            {/* Mock building wireframe */}
            <svg viewBox="0 0 400 300" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid meet">
              <g stroke="#a5b4fc" strokeWidth="1" fill="none" opacity="0.7">
                <path d="M80 220 L200 160 L320 220 L320 100 L200 40 L80 100 Z" />
                <path d="M80 220 L80 100" />
                <path d="M320 220 L320 100" />
                <path d="M200 160 L200 40" />
                <path d="M120 200 L120 120 L180 90 L180 170 Z" />
                <path d="M220 170 L220 90 L280 120 L280 200 Z" />
              </g>
              {/* Anomaly markers */}
              <g>
                <circle cx="145" cy="155" r="10" fill="#ef4444" fillOpacity="0.3" />
                <circle cx="145" cy="155" r="4" fill="#ef4444" />
                <circle cx="255" cy="135" r="10" fill="#f59e0b" fillOpacity="0.3" />
                <circle cx="255" cy="135" r="4" fill="#f59e0b" />
                <circle cx="240" cy="180" r="10" fill="#ef4444" fillOpacity="0.3" />
                <circle cx="240" cy="180" r="4" fill="#ef4444" />
              </g>
            </svg>

            <div className="absolute top-3 left-3 flex items-center gap-2">
              <span className="px-2 py-1 rounded-md bg-black/40 backdrop-blur text-white text-[9px] font-bold uppercase tracking-widest">
                Live scan · 4.2M pts
              </span>
            </div>
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[10px] text-white/80">
              <span className="font-mono">Bunbury Town Hall · West Wing</span>
              <span className="font-mono tabular-nums">3 anomalies detected</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-3">
            {[
              { c: 'bg-rose-500', t: 'Crack', loc: 'Beam 14-B', sev: 'Critical' },
              { c: 'bg-amber-500', t: 'Corrosion', loc: 'Mount 22', sev: 'Moderate' },
              { c: 'bg-rose-500', t: 'Deflection', loc: 'Truss 9', sev: 'Critical' },
            ].map((a) => (
              <div key={a.loc} className="border border-current/15 rounded px-2.5 py-2">
                <div className="flex items-center gap-1.5">
                  <div className={`w-1.5 h-1.5 rounded-full ${a.c}`} />
                  <span className="text-[10px] font-bold">{a.t}</span>
                </div>
                <div className="text-[9px] opacity-60 mt-0.5">{a.loc}</div>
                <div className="text-[9px] opacity-60">{a.sev}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="col-span-5">
          <p className="text-[13px] leading-relaxed opacity-75 mb-6">
            Upload LiDAR scans or drone photogrammetry. AssetMind detects cracks, corrosion,
            deflection and missing parts — then anchors each finding to a real asset in your
            register.
          </p>

          <div className="space-y-4 mb-6">
            {[
              { i: Box, k: 'Native 3D viewer', v: 'OBJ, GLTF, point cloud, BIM' },
              { i: Sparkles, k: 'AI anomaly detection', v: 'Confidence-scored, reviewable' },
              { i: Camera, k: 'Photo & scan diff', v: 'Track degradation over time' },
            ].map((r) => {
              const Icon = r.i;
              return (
                <div key={r.k} className="flex gap-3">
                  <div className="w-8 h-8 shrink-0 rounded-md bg-indigo-50 grid place-items-center">
                    <Icon className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div>
                    <div className="text-[12px] font-bold">{r.k}</div>
                    <div className="text-[11px] opacity-70 leading-snug">{r.v}</div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-4 bg-indigo-50 border-l-2 border-indigo-600 rounded-r">
            <div className="text-[10px] uppercase tracking-[0.2em] font-bold text-indigo-700 mb-1.5">
              Outcome
            </div>
            <div className="text-[13px] leading-snug text-slate-800">
              An inspection round that took six weeks now happens in an afternoon — and produces a
              dataset that compounds with every scan.
            </div>
          </div>
        </div>
      </div>
    </BrochureShell>
  );
}