import React from 'react';
import BrochureShell from './BrochureShell';

export default function Spread02Stakes() {
  return (
    <BrochureShell pageNumber={2} section="The Stakes">
      <div className="grid grid-cols-12 gap-8 h-full">
        <div className="col-span-7">
          <div className="text-[10px] font-bold tracking-[0.3em] uppercase text-indigo-600 mb-3">
            Why this matters
          </div>
          <h1
            className="text-[58px] leading-[0.98] tracking-[-0.035em] font-black mb-8"
            style={{ fontFamily: '"Fraunces", Georgia, serif' }}
          >
            $2.1 billion
            <br />
            in deferred
            <br />
            maintenance.
          </h1>
          <p className="text-[14px] leading-relaxed opacity-75 max-w-[100mm]">
            Across regional councils and infrastructure operators, the backlog grows faster than
            the budget. Spreadsheets can&apos;t triage it. Inspections can&apos;t scale to it. And every
            year of inaction compounds the cost of failure.
          </p>
        </div>

        <div className="col-span-5 flex flex-col justify-between">
          {[
            { k: '82%', l: 'of failures are unpredicted today' },
            { k: '4.3×', l: 'cost of reactive vs. predictive repair' },
            { k: '38%', l: 'of asset records contain stale data' },
          ].map((s) => (
            <div key={s.l} className="border-t border-current/20 pt-4">
              <div
                className="text-[44px] font-black tabular-nums tracking-tight text-indigo-600"
                style={{ fontFamily: '"Fraunces", Georgia, serif' }}
              >
                {s.k}
              </div>
              <div className="text-[12px] opacity-70 mt-1 leading-snug">{s.l}</div>
            </div>
          ))}
        </div>
      </div>
    </BrochureShell>
  );
}