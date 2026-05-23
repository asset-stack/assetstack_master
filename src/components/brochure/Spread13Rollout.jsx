import React from 'react';
import BrochureShell from './BrochureShell';

const PHASES = [
  {
    days: 'Week 1',
    title: 'Land',
    points: [
      'Workspace provisioned, SSO connected',
      'Asset register imported from your spreadsheets',
      'First 3 sites live in the platform',
    ],
  },
  {
    days: 'Week 2-4',
    title: 'See',
    points: [
      'Sensor feeds & SCADA integrations connected',
      'First scan uploaded · anomalies tagged',
      'AssetMind trained on your portfolio',
    ],
  },
  {
    days: 'Week 5-8',
    title: 'Predict',
    points: [
      'RUL models calibrated to your equipment',
      'Capital plan rebuilt with risk-weighted priorities',
      'First scenario modelled for board pack',
    ],
  },
  {
    days: 'Week 9-12',
    title: 'Save',
    points: [
      'Verified savings ledger active',
      'Field crews fully transitioned off paper',
      'First quarterly board report exported',
    ],
  },
];

export default function Spread13Rollout() {
  return (
    <BrochureShell pageNumber={13} section="First 90 days" title="Land. See. Predict. Save.">
      <p className="text-[13px] leading-relaxed opacity-75 max-w-[150mm] mb-10">
        A typical AssetStack rollout takes ninety days from kick-off to verified savings — without
        ripping out your existing systems.
      </p>

      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-0 right-0 top-[22px] h-px bg-current/20" />

        <div className="grid grid-cols-4 gap-6 relative">
          {PHASES.map((p, i) => (
            <div key={p.days} className="relative">
              <div className="flex items-center mb-5">
                <div
                  className="w-11 h-11 rounded-full bg-indigo-600 text-white grid place-items-center text-[14px] font-black border-4 border-[#F8F5EE] relative z-10"
                  style={{ fontFamily: '"Fraunces", Georgia, serif' }}
                >
                  {i + 1}
                </div>
              </div>
              <div className="text-[9px] uppercase tracking-[0.24em] font-bold text-indigo-600 mb-1">
                {p.days}
              </div>
              <h3
                className="text-[26px] font-black leading-tight tracking-tight mb-4"
                style={{ fontFamily: '"Fraunces", Georgia, serif' }}
              >
                {p.title}
              </h3>
              <ul className="space-y-2 text-[11px] leading-relaxed opacity-80">
                {p.points.map((pt) => (
                  <li key={pt} className="flex gap-1.5">
                    <span className="text-indigo-600 shrink-0">·</span>
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-12 pt-6 border-t border-current/15 grid grid-cols-3 gap-6">
        {[
          { k: '12 min', l: 'Time to first imported asset' },
          { k: '7 days', l: 'Average to first verified prediction' },
          { k: '90 days', l: 'To verified savings in your ledger' },
        ].map((s) => (
          <div key={s.l}>
            <div
              className="text-[32px] font-black tabular-nums text-indigo-600"
              style={{ fontFamily: '"Fraunces", Georgia, serif' }}
            >
              {s.k}
            </div>
            <div className="text-[10px] uppercase tracking-wider opacity-70 mt-1">{s.l}</div>
          </div>
        ))}
      </div>
    </BrochureShell>
  );
}