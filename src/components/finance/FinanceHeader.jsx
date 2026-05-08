import React from 'react';

export default function FinanceHeader({ icon: Icon, title, subtitle, accent = 'indigo', actions }) {
  const tones = {
    indigo: 'bg-indigo-100 text-indigo-700',
    rose: 'bg-rose-100 text-rose-700',
    emerald: 'bg-emerald-100 text-emerald-700',
    purple: 'bg-purple-100 text-purple-700',
    amber: 'bg-amber-100 text-amber-700',
    slate: 'bg-slate-100 text-slate-700',
  };

  return (
    <div className="flex items-start justify-between gap-3 mb-4 flex-wrap">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${tones[accent] || tones.indigo}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-slate-900 leading-tight">{title}</h1>
          {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}