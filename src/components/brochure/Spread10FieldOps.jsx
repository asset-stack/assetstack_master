import React from 'react';
import { Smartphone, Camera, CheckCircle2, MapPin } from 'lucide-react';
import BrochureShell from './BrochureShell';

export default function Spread10FieldOps() {
  return (
    <BrochureShell pageNumber={10} section="Get it done" title="Built for the field, not the desk.">
      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-5">
          <p className="text-[13px] leading-relaxed opacity-75 mb-6">
            Field crews use AssetStack offline. Inspections, photos, condition grades, and work
            order updates sync the moment they have signal — no paperwork, no double entry.
          </p>

          <div className="space-y-4 mb-6">
            {[
              { i: Smartphone, k: 'Offline-first', v: 'Full read/write without connectivity' },
              { i: Camera, k: 'AI photo grading', v: 'Snap a photo, get a condition score' },
              { i: CheckCircle2, k: 'Tinder inspector', v: 'Swipe through assets, grade in seconds' },
              { i: MapPin, k: 'GPS-anchored', v: 'Every action geo-stamped & audited' },
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
              Inspection throughput up 4×. Data quality up 6×. Crews stop fighting the system and
              start using it.
            </div>
          </div>
        </div>

        <div className="col-span-7 flex items-center justify-center">
          {/* Mock phone */}
          <div
            className="relative bg-slate-900 rounded-[36px] p-2 shadow-2xl"
            style={{ width: '70mm', aspectRatio: '9/19' }}
          >
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-4 bg-black rounded-b-2xl z-10" />
            <div className="bg-white rounded-[28px] h-full overflow-hidden flex flex-col">
              {/* Status bar */}
              <div className="h-7 bg-white flex items-center justify-between px-5 pt-1 text-[8px] font-bold text-slate-700">
                <span>9:41</span>
                <span>●●●●</span>
              </div>
              {/* Header */}
              <div className="px-4 py-3 bg-indigo-600 text-white">
                <div className="text-[9px] opacity-70 tracking-widest uppercase">Inspect</div>
                <div className="text-[14px] font-bold">Pump CWP-3</div>
                <div className="text-[10px] opacity-80">Bunbury Hall · Level B</div>
              </div>
              {/* Photo */}
              <div
                className="bg-slate-300 m-3 rounded-lg flex-1 relative overflow-hidden"
                style={{
                  backgroundImage:
                    'linear-gradient(135deg, #475569 0%, #334155 50%, #1e293b 100%)',
                }}
              >
                <div
                  className="absolute border-2 border-rose-400 rounded animate-pulse"
                  style={{ width: '40%', height: '30%', top: '30%', left: '25%' }}
                />
                <div className="absolute bottom-2 left-2 right-2 bg-black/60 backdrop-blur rounded px-2 py-1.5 text-white text-[9px]">
                  <div className="font-bold">{'⚠ Corrosion detected'}</div>
                  <div className="opacity-80">Confidence 87%</div>
                </div>
              </div>
              {/* Grade */}
              <div className="px-3 pb-4">
                <div className="text-[9px] uppercase tracking-widest text-slate-500 font-bold mb-1.5">
                  Condition grade
                </div>
                <div className="flex gap-1.5 mb-3">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <div
                      key={n}
                      className={`flex-1 h-8 rounded grid place-items-center text-[12px] font-black ${
                        n === 4 ? 'bg-rose-500 text-white' : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {n}
                    </div>
                  ))}
                </div>
                <button className="w-full bg-indigo-600 text-white text-[11px] font-bold py-2.5 rounded">
                  {'Save & next →'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </BrochureShell>
  );
}