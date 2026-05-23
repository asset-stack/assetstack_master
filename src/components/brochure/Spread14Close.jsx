import React from 'react';
import { Mail, Globe, Calendar } from 'lucide-react';
import BrochureShell from './BrochureShell';

export default function Spread14Close() {
  return (
    <BrochureShell pageNumber={14} section="Close" variant="cover">
      <div className="absolute inset-0 flex flex-col justify-between p-[18mm]">
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

        <div className="max-w-[160mm]">
          <div className="text-[11px] font-bold tracking-[0.3em] uppercase text-indigo-300 mb-6">
            The ask
          </div>
          <h1
            className="font-black tracking-[-0.035em] leading-[0.94]"
            style={{ fontFamily: '"Fraunces", Georgia, serif', fontSize: '76px' }}
          >
            Give us one site
            <br />
            and ninety days.
            <br />
            <span className="text-indigo-400">We&apos;ll show you the rest.</span>
          </h1>
          <p className="mt-8 text-[15px] leading-relaxed opacity-80 max-w-[140mm]">
            A pilot on a single facility, fully funded by avoided maintenance in the first quarter.
            No long contracts. No data migration risk. If we don&apos;t prove savings, you walk.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-6 pt-8 border-t border-white/10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-3.5 h-3.5 text-indigo-300" />
              <span className="text-[9px] tracking-[0.24em] uppercase opacity-60 font-bold">
                Book a demo
              </span>
            </div>
            <div className="text-[14px] font-bold">assetstack.ai/demo</div>
            <div className="text-[11px] opacity-60 mt-0.5">30 minutes · live walkthrough</div>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Mail className="w-3.5 h-3.5 text-indigo-300" />
              <span className="text-[9px] tracking-[0.24em] uppercase opacity-60 font-bold">
                Contact
              </span>
            </div>
            <div className="text-[14px] font-bold">hello@assetstackai.com</div>
            <div className="text-[11px] opacity-60 mt-0.5">Response within 24 hours</div>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Globe className="w-3.5 h-3.5 text-indigo-300" />
              <span className="text-[9px] tracking-[0.24em] uppercase opacity-60 font-bold">
                Web
              </span>
            </div>
            <div className="text-[14px] font-bold">assetstack.ai</div>
            <div className="text-[11px] opacity-60 mt-0.5">Case studies · pricing · security</div>
          </div>
        </div>

        <div className="text-[9px] tracking-[0.24em] uppercase opacity-40 font-bold">
          © 2026 AssetStack · Feature Brochure · v1.0
        </div>
      </div>
    </BrochureShell>
  );
}