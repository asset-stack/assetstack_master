import React from 'react';
import { Keyboard } from 'lucide-react';

const KEYS = [
  { key: 'A', label: 'Approve', color: 'bg-emerald-500' },
  { key: 'F', label: 'Fix', color: 'bg-amber-500' },
  { key: 'R', label: 'Reject', color: 'bg-red-500' },
  { key: '→', label: 'Skip', color: 'bg-slate-400' },
  { key: '←', label: 'Back', color: 'bg-slate-400' },
];

export default function VerifyKeyboardHints() {
  return (
    <div className="hidden md:flex items-center gap-3 text-[10px] text-slate-500">
      <Keyboard className="w-3 h-3" />
      {KEYS.map((k) => (
        <div key={k.key} className="flex items-center gap-1">
          <kbd className={`${k.color} text-white font-bold rounded px-1.5 py-0.5 text-[10px] min-w-[18px] text-center`}>
            {k.key}
          </kbd>
          <span>{k.label}</span>
        </div>
      ))}
    </div>
  );
}