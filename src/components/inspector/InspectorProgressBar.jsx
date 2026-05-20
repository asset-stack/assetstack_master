import React from 'react';
import { CheckCircle2, Wifi, WifiOff, CloudOff } from 'lucide-react';

export default function InspectorProgressBar({ completed, total, pendingSync, online, sessionStart }) {
  const pct = total ? Math.round((completed / total) * 100) : 0;
  const elapsedMin = sessionStart ? Math.round((Date.now() - sessionStart) / 60000) : 0;
  const rate = elapsedMin > 0 ? Math.round((completed / elapsedMin) * 60) : 0;

  return (
    <div className="bg-white border-b border-slate-200 px-4 py-2.5 sticky top-0 z-30">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-semibold text-slate-700">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            {completed}/{total}
          </div>
          {elapsedMin > 0 && (
            <div className="text-slate-500">
              {elapsedMin}m · <strong className="text-slate-700">{rate}/hr</strong>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {pendingSync > 0 && (
            <div className="flex items-center gap-1 text-amber-600 font-medium">
              <CloudOff className="w-3 h-3" /> {pendingSync} queued
            </div>
          )}
          {online ? (
            <Wifi className="w-3.5 h-3.5 text-emerald-500" />
          ) : (
            <WifiOff className="w-3.5 h-3.5 text-slate-400" />
          )}
        </div>
      </div>
      <div className="h-1.5 mt-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}