import React from 'react';
import { Filter, X } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';

const STATUSES = ['operational', 'degraded', 'critical', 'maintenance', 'offline'];
const RISKS = ['low', 'medium', 'high', 'critical'];
const CRITICALITIES = ['low', 'medium', 'high', 'mission_critical'];

export default function RegisterFilters({ filters, onChange, locationOptions = [], typeOptions = [] }) {
  const toggle = (key, value) => {
    const current = filters[key] || [];
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    onChange({ ...filters, [key]: next });
  };

  const clear = () => onChange({ status: [], risk: [], criticality: [], location: [], type: [] });

  const totalActive = Object.values(filters).reduce((s, arr) => s + (arr?.length || 0), 0);

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <FacetButton label="Status" options={STATUSES} selected={filters.status} onToggle={(v) => toggle('status', v)} />
      <FacetButton label="Risk" options={RISKS} selected={filters.risk} onToggle={(v) => toggle('risk', v)} />
      <FacetButton label="Criticality" options={CRITICALITIES} selected={filters.criticality} onToggle={(v) => toggle('criticality', v)} />
      <FacetButton label="Location" options={locationOptions} selected={filters.location} onToggle={(v) => toggle('location', v)} searchable />
      <FacetButton label="Type" options={typeOptions} selected={filters.type} onToggle={(v) => toggle('type', v)} searchable />

      {totalActive > 0 && (
        <button
          onClick={clear}
          className="flex items-center gap-1 px-2 py-1 text-[11px] font-semibold text-slate-500 hover:text-slate-900"
        >
          <X className="w-3 h-3" /> Clear ({totalActive})
        </button>
      )}
    </div>
  );
}

function FacetButton({ label, options, selected = [], onToggle, searchable = false }) {
  const [search, setSearch] = React.useState('');
  const filtered = searchable && search
    ? options.filter((o) => o.toLowerCase().includes(search.toLowerCase()))
    : options;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={`h-8 gap-1.5 text-[12px] ${selected.length > 0 ? 'border-indigo-300 bg-indigo-50 text-indigo-700' : ''}`}
        >
          <Filter className="w-3 h-3" /> {label}
          {selected.length > 0 && (
            <span className="ml-0.5 bg-indigo-600 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
              {selected.length}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-2" align="start">
        {searchable && (
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search ${label.toLowerCase()}…`}
            className="w-full text-xs px-2 py-1.5 border border-slate-200 rounded mb-1.5 outline-none focus:border-indigo-400"
          />
        )}
        <div className="max-h-60 overflow-y-auto">
          {filtered.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-3">No options</p>
          ) : (
            filtered.map((opt) => (
              <label
                key={opt}
                className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-slate-50 cursor-pointer"
              >
                <Checkbox
                  checked={selected.includes(opt)}
                  onCheckedChange={() => onToggle(opt)}
                />
                <span className="text-[12px] text-slate-700 capitalize truncate">{opt.replace(/_/g, ' ')}</span>
              </label>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}