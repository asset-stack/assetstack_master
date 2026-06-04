import React from 'react';
import { CheckCircle2, Info, AlertTriangle } from 'lucide-react';

const TONES = {
  success: { Icon: CheckCircle2, bg: 'bg-emerald-50', border: 'border-emerald-200', icon: 'text-emerald-600' },
  info: { Icon: Info, bg: 'bg-blue-50', border: 'border-blue-200', icon: 'text-blue-600' },
  warning: { Icon: AlertTriangle, bg: 'bg-amber-50', border: 'border-amber-200', icon: 'text-amber-600' },
};

export default function DocCallout({ tone = 'info', title, children }) {
  const t = TONES[tone] || TONES.info;
  const Icon = t.Icon;
  return (
    <div className={`not-prose flex gap-3 rounded-xl border ${t.border} ${t.bg} p-4 my-5`}>
      <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${t.icon}`} />
      <div className="text-[14px] text-slate-700 leading-relaxed">
        {title && <p className="font-semibold text-slate-900 mb-1">{title}</p>}
        {children}
      </div>
    </div>
  );
}