import React from 'react';

export default function HealthBar({ score, showValue = true }) {
  const value = Math.max(0, Math.min(100, Number(score) || 0));
  const color =
    value >= 80 ? 'bg-emerald-500' :
    value >= 60 ? 'bg-lime-500' :
    value >= 40 ? 'bg-amber-500' :
    value >= 20 ? 'bg-orange-500' : 'bg-rose-500';

  return (
    <div className="flex items-center gap-2 w-full">
      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${value}%` }} />
      </div>
      {showValue && (
        <span className="text-[11px] font-bold tabular-nums text-slate-700 w-8 text-right">
          {value || '—'}
        </span>
      )}
    </div>
  );
}