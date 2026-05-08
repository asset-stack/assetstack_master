import React from 'react';

export default function HealthBar({ score, showValue = true }) {
  const v = Math.max(0, Math.min(100, Number(score) || 0));
  const color = v >= 70 ? 'bg-emerald-500' : v >= 50 ? 'bg-amber-500' : v >= 30 ? 'bg-orange-500' : 'bg-rose-500';
  const textColor = v >= 70 ? 'text-emerald-700' : v >= 50 ? 'text-amber-700' : v >= 30 ? 'text-orange-700' : 'text-rose-700';

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} rounded-full transition-all`}
          style={{ width: `${v}%` }}
        />
      </div>
      {showValue && (
        <span className={`text-[11px] font-bold tabular-nums w-7 text-right ${textColor}`}>
          {Math.round(v)}
        </span>
      )}
    </div>
  );
}