import React from 'react';
import { PROGRAMS, PROGRAM_LABELS } from './lib/reportData';

export default function ProgramToggle({ value, onChange, size = 'md' }) {
  const sizeClass = size === 'sm' ? 'text-xs py-1 px-2.5' : 'text-sm py-1.5 px-3';
  return (
    <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-0.5">
      {PROGRAMS.map(p => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className={`${sizeClass} rounded-md font-semibold transition-colors ${
            value === p
              ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          {PROGRAM_LABELS[p]}
        </button>
      ))}
    </div>
  );
}