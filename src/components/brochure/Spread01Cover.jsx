import React from 'react';
import BrochureShell from './BrochureShell';

export default function Spread01Cover() {
  return (
    <BrochureShell pageNumber={1} section="Cover" variant="cover">
      <div className="absolute inset-0 flex flex-col justify-between p-[18mm]">
        {/* Top: brand */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-md bg-indigo-500 grid place-items-center">
              <span className="text-white font-black text-sm">A</span>
            </div>
            <div>
              <div className="text-[14px] font-bold tracking-tight">AssetStack</div>
              <div className="text-[9px] tracking-[0.28em] uppercase opacity-60">
                The Asset Operating System
              </div>
            </div>
          </div>
          <div className="text-[9px] tracking-[0.28em] uppercase opacity-60">
            Feature Brochure · 2026
          </div>
        </div>

        {/* Title block */}
        <div className="max-w-[150mm]">
          <div className="text-[11px] font-bold tracking-[0.3em] uppercase text-indigo-300 mb-6">
            {'For boards, councils & infrastructure committees'}
          </div>
          <h1
            className="font-black tracking-[-0.035em] leading-[0.92]"
            style={{
              fontFamily: '"Fraunces", Georgia, serif',
              fontSize: '92px',
            }}
          >
            One model
            <br />
            for every asset
            <br />
            <span className="text-indigo-400">that can&apos;t fail.</span>
          </h1>
          <p className="mt-8 text-[15px] leading-relaxed opacity-80 max-w-[140mm]">
            AssetStack unifies registers, predictions, capital plans and field execution into a
            single decision layer. This brochure walks you through what the platform actually does
            — screen by screen, feature by feature.
          </p>
        </div>

        {/* Bottom: meta */}
        <div className="grid grid-cols-4 gap-6 pt-8 border-t border-white/10">
          {[
            { k: '47', l: 'modules' },
            { k: '6', l: 'asset surfaces' },
            { k: '12 min', l: 'time to first insight' },
            { k: '90 days', l: 'to verified savings' },
          ].map((s) => (
            <div key={s.l}>
              <div
                className="text-[28px] font-black tabular-nums tracking-tight text-indigo-300"
                style={{ fontFamily: '"Fraunces", Georgia, serif' }}
              >
                {s.k}
              </div>
              <div className="text-[10px] tracking-[0.24em] uppercase opacity-60 mt-1">{s.l}</div>
            </div>
          ))}
        </div>
      </div>
    </BrochureShell>
  );
}