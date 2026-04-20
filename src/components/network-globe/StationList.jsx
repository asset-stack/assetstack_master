import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin, AlertTriangle, CheckCircle2, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';

const iconByCondition = {
  operational: { Icon: CheckCircle2, color: 'text-emerald-400' },
  degraded: { Icon: AlertCircle, color: 'text-amber-400' },
  critical: { Icon: AlertTriangle, color: 'text-rose-400' },
};

export default function StationList({ stations, hoveredName, onSelect }) {
  const [search, setSearch] = useState('');
  const filtered = useMemo(
    () => stations.filter((s) => s.name.toLowerCase().includes(search.toLowerCase())),
    [stations, search]
  );

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[11px] font-semibold text-white/60 uppercase tracking-wider">
            Live Network • {stations.length} stations
          </span>
        </div>
        <div className="relative">
          <Search className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search stations..."
            className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-white/40 focus-visible:ring-indigo-500"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin p-2">
        {filtered.map((s, i) => {
          const meta = iconByCondition[s.condition] || iconByCondition.operational;
          const Icon = meta.Icon;
          const isHovered = hoveredName === s.name;
          return (
            <motion.button
              key={s.name}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: Math.min(i * 0.015, 0.4) }}
              onClick={() => onSelect && onSelect(s)}
              className={`w-full text-left px-3 py-2 rounded-lg flex items-start gap-3 transition-all ${
                isHovered
                  ? 'bg-indigo-500/20 border border-indigo-400/40'
                  : 'hover:bg-white/5 border border-transparent'
              }`}
            >
              <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${meta.color}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{s.name}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3 text-white/30" />
                  <span className="text-[10px] text-white/40 truncate">{s.zone}</span>
                </div>
              </div>
              <span className="text-[9px] font-mono text-white/30 shrink-0 mt-1">
                {s.lat.toFixed(2)}°
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}