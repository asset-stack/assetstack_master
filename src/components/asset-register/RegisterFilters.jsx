import React from 'react';
import { X, Filter } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

const STATUS_OPTS = ['operational', 'degraded', 'critical', 'maintenance', 'offline'];
const RISK_OPTS = ['low', 'medium', 'high', 'critical'];
const CRIT_OPTS = ['low', 'medium', 'high', 'mission_critical'];

function FacetPopover({ label, value = [], onChange, options }) {
  const toggle = (opt) => {
    const next = value.includes(opt) ? value.filter((v) => v !== opt) : [...value, opt];
    onChange(next);
  };
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={`h-8 gap-1.5 text-[12px] ${value.length ? 'border-indigo-300 bg-indigo-50 text-indigo-700' : ''}`}
        >
          {label}
          {value.length > 0 && (
            <span className="bg-indigo-600 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5 leading-none">
              {value.length}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-2" align="start">
        <div className="flex items-center justify-between px-1 pb-1.5 mb-1 border-b border-slate-100">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">{label}</span>
          {value.length > 0 && (
            <button onClick={() => onChange([])} className="text-[10px] text-slate-400 hover:text-slate-700">Clear</button>
          )}
        </div>
        <div className="space-y-0.5 max-h-64 overflow-y-auto">
          {options.map((opt) => (
            <label key={opt} className="flex items-center gap-2 px-1.5 py-1.5 rounded hover:bg-slate-50 cursor-pointer">
              <Checkbox checked={value.includes(opt)} onCheckedChange={() => toggle(opt)} />
              <span className="text-[12px] text-slate-700 capitalize">{opt.replace(/_/g, ' ')}</span>
            </label>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default function RegisterFilters({ filters, onChange, locationOptions = [], typeOptions = [] }) {
  const update = (key, val) => onChange({ ...filters, [key]: val });
  const totalActive = Object.values(filters).reduce((s, v) => s + (v?.length || 0), 0);

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <span className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wide pr-1">
        <Filter className="w-3 h-3" /> Filter
      </span>
      <FacetPopover label="Status" value={filters.status} onChange={(v) => update('status', v)} options={STATUS_OPTS} />
      <FacetPopover label="Risk" value={filters.risk} onChange={(v) => update('risk', v)} options={RISK_OPTS} />
      <FacetPopover label="Criticality" value={filters.criticality} onChange={(v) => update('criticality', v)} options={CRIT_OPTS} />
      {locationOptions.length > 0 && (
        <FacetPopover label="Location" value={filters.location} onChange={(v) => update('location', v)} options={locationOptions} />
      )}
      {typeOptions.length > 0 && (
        <FacetPopover label="Type" value={filters.type} onChange={(v) => update('type', v)} options={typeOptions} />
      )}
      {totalActive > 0 && (
        <button
          onClick={() => onChange({ status: [], risk: [], criticality: [], location: [], type: [] })}
          className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-900 ml-1"
        >
          <X className="w-3 h-3" /> Clear all
        </button>
      )}
    </div>
  );
}