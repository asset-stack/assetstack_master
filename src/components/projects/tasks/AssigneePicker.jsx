import React from 'react';
import { Check, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

function initials(name = '') {
  return name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
}

const AVAIL_DOT = {
  available: 'bg-emerald-500',
  busy: 'bg-amber-500',
  on_leave: 'bg-rose-500',
  unavailable: 'bg-slate-400'
};

// Multi-select people picker with skill-match highlighting and a "lead" star.
export default function AssigneePicker({ technicians = [], selectedIds = [], leadId, requiredSkills = [], onToggle, onSetLead }) {
  const skillSet = requiredSkills.map((s) => s.toLowerCase());

  const matchScore = (tech) => {
    if (!skillSet.length) return 0;
    const techSkills = [...(tech.skills || []), ...(tech.equipment_specializations || [])].map((s) =>
      String(s).toLowerCase()
    );
    return skillSet.filter((s) => techSkills.some((ts) => ts.includes(s) || s.includes(ts))).length;
  };

  const sorted = [...technicians].sort((a, b) => matchScore(b) - matchScore(a));

  return (
    <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
      {sorted.map((tech) => {
        const selected = selectedIds.includes(tech.id);
        const score = matchScore(tech);
        const isLead = leadId === tech.id;
        return (
          <div
            key={tech.id}
            className={`flex items-center gap-2.5 p-2 rounded-lg border cursor-pointer transition-colors ${
              selected ? 'border-indigo-300 bg-indigo-50' : 'border-slate-200 hover:bg-slate-50'
            }`}
            onClick={() => onToggle(tech)}
          >
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[11px] font-bold text-slate-600">
                {initials(tech.name)}
              </div>
              <span
                className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${
                  AVAIL_DOT[tech.availability_status] || AVAIL_DOT.unavailable
                }`}
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-medium text-slate-900 truncate">{tech.name}</span>
                {score > 0 && (
                  <Badge className="bg-emerald-100 text-emerald-700 border-0 text-[9px] px-1 py-0">
                    {score} skill match
                  </Badge>
                )}
              </div>
              <p className="text-[11px] text-slate-500 truncate capitalize">
                {tech.certification_level} · {tech.availability_status?.replace('_', ' ')}
                {tech.hourly_rate ? ` · $${tech.hourly_rate}/h` : ''}
              </p>
            </div>
            {selected && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSetLead(isLead ? null : tech.id);
                }}
                title={isLead ? 'Lead' : 'Set as lead'}
                className={`p-1 rounded ${isLead ? 'text-amber-500' : 'text-slate-300 hover:text-amber-400'}`}
              >
                <Star className="w-4 h-4" fill={isLead ? 'currentColor' : 'none'} />
              </button>
            )}
            {selected && <Check className="w-4 h-4 text-indigo-600 shrink-0" />}
          </div>
        );
      })}
      {!technicians.length && (
        <p className="text-xs text-slate-400 italic py-4 text-center">No team members found.</p>
      )}
    </div>
  );
}