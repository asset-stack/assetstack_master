import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Fullscreen overlay shown while a deck is being exported. Sits on top of
 * the live viewer so the user doesn't try to navigate while frames are
 * being captured.
 */
export default function ExportProgressOverlay({ label, current, total }) {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0;
  return (
    <div className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-sm flex items-center justify-center">
      <div className="text-center max-w-md px-8">
        <Loader2 className="w-10 h-10 text-indigo-400 animate-spin mx-auto mb-6" />
        <div className="text-[11px] font-bold tracking-[0.3em] text-indigo-300 uppercase mb-2">
          {label}
        </div>
        <div className="text-3xl font-bold text-white tabular-nums mb-4">
          {current} / {total}
        </div>
        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mb-3">
          <div
            className="h-full bg-indigo-500 transition-all duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="text-xs text-slate-400">
          Capturing slides at 1920×1080. Please don't switch tabs.
        </div>
      </div>
    </div>
  );
}