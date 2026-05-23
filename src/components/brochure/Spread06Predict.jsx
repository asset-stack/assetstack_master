import React from 'react';
import BrochureShell from './BrochureShell';

export default function Spread06Predict() {
  // Mock RUL chart
  const points = [
    [0, 96], [10, 94], [20, 91], [30, 88], [40, 85], [50, 80],
    [60, 73], [70, 64], [80, 52], [90, 38], [100, 22],
  ];
  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0] * 4} ${100 - p[1]}`).join(' ');

  return (
    <BrochureShell pageNumber={6} section="See what's failing" title="Predict failures, weeks early.">
      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-7">
          <div className="border border-slate-200 rounded-lg p-5 bg-white shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-[11px] font-bold text-slate-900">Pump CWP-3 · Bunbury Hall</div>
                <div className="text-[10px] text-slate-500">Remaining useful life forecast</div>
              </div>
              <div className="text-right">
                <div className="text-[10px] uppercase tracking-widest text-rose-600 font-bold">
                  Predicted failure
                </div>
                <div className="text-[14px] font-black tabular-nums">42 days</div>
              </div>
            </div>

            {/* Chart */}
            <div className="relative" style={{ height: '160px' }}>
              <svg viewBox="0 0 400 100" className="w-full h-full" preserveAspectRatio="none">
                {/* Threshold line */}
                <line x1="0" y1="60" x2="400" y2="60" stroke="#ef4444" strokeDasharray="4 4" strokeWidth="0.8" />
                {/* Confidence band */}
                <path
                  d={`${path} L 400 100 L 0 100 Z`}
                  fill="url(#grad)"
                  opacity="0.18"
                />
                <defs>
                  <linearGradient id="grad" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0" stopColor="#6366f1" />
                    <stop offset="1" stopColor="#6366f1" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {/* Actual line */}
                <path d={path} fill="none" stroke="#4f46e5" strokeWidth="1.8" />
                {/* Current point */}
                <circle cx="240" cy="36" r="3" fill="#4f46e5" />
                <line x1="240" y1="0" x2="240" y2="100" stroke="#4f46e5" strokeDasharray="2 3" strokeWidth="0.5" opacity="0.6" />
              </svg>
              <div className="absolute right-0 top-1 text-[9px] text-rose-600 font-bold tracking-wider">
                FAILURE THRESHOLD
              </div>
            </div>

            <div className="grid grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-100">
              {[
                { k: '64', l: 'Current health' },
                { k: '42d', l: 'Time to failure' },
                { k: '93%', l: 'Confidence' },
                { k: '$48k', l: 'Avoided cost' },
              ].map((s) => (
                <div key={s.l}>
                  <div className="text-[18px] font-black tabular-nums text-slate-900">{s.k}</div>
                  <div className="text-[9px] uppercase tracking-wider text-slate-500 mt-0.5">{s.l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Defect cascade */}
          <div className="border border-slate-200 rounded-lg p-4 bg-white shadow-sm mt-4">
            <div className="text-[11px] font-bold text-slate-900 mb-3">Defect cascade · downstream impact</div>
            <div className="flex items-center gap-2 text-[10px]">
              <span className="px-2.5 py-1.5 bg-rose-100 text-rose-700 rounded font-bold">CWP-3 fails</span>
              <span className="text-slate-400">→</span>
              <span className="px-2.5 py-1.5 bg-amber-100 text-amber-700 rounded font-bold">AHU-301 overheat</span>
              <span className="text-slate-400">→</span>
              <span className="px-2.5 py-1.5 bg-amber-100 text-amber-700 rounded font-bold">Server room {'>'} 26°C</span>
              <span className="text-slate-400">→</span>
              <span className="px-2.5 py-1.5 bg-rose-100 text-rose-700 rounded font-bold">SLA breach</span>
            </div>
          </div>
        </div>

        <div className="col-span-5">
          <p className="text-[13px] leading-relaxed opacity-75 mb-6">
            Per-asset RUL forecasts trained on your sensor data, condition reports, and
            manufacturer baselines. Defect cascade maps tell you what fails next — and what it costs
            if you wait.
          </p>

          <div className="space-y-3 text-[12px]">
            {[
              { k: 'RUL models', v: 'Weibull, LSTM, gradient boost — ensemble' },
              { k: 'Sensor fusion', v: 'Vibration, temperature, current, oil quality' },
              { k: 'Confidence scoring', v: 'Every prediction is explainable & verifiable' },
              { k: 'Cascade analysis', v: 'Map second-order effects of any failure' },
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