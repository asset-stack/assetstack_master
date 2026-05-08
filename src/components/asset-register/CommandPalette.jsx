import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Search, MapPin, Cpu } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';

export default function CommandPalette({ open, onClose, assets = [], onSelect }) {
  const [query, setQuery] = useState('');
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      setQuery('');
      setActiveIdx(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const results = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return assets.slice(0, 8);
    return assets
      .filter((a) =>
        `${a.name} ${a.location || ''} ${a.type || ''} ${a.manufacturer || ''} ${a.model || ''}`
          .toLowerCase()
          .includes(q)
      )
      .slice(0, 12);
  }, [query, assets]);

  const handleKey = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && results[activeIdx]) {
      e.preventDefault();
      onSelect(results[activeIdx]);
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="p-0 max-w-xl gap-0 overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => { setQuery(e.target.value); setActiveIdx(0); }}
            onKeyDown={handleKey}
            placeholder="Jump to asset, location or manufacturer…"
            className="flex-1 outline-none text-sm bg-transparent placeholder:text-slate-400"
          />
          <kbd className="text-[10px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">ESC</kbd>
        </div>
        <div className="max-h-80 overflow-y-auto p-1.5">
          {results.length === 0 && (
            <p className="text-sm text-slate-400 text-center py-6">No matches</p>
          )}
          {results.map((a, i) => (
            <button
              key={a.id}
              onClick={() => { onSelect(a); onClose(); }}
              onMouseEnter={() => setActiveIdx(i)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                i === activeIdx ? 'bg-indigo-50' : 'hover:bg-slate-50'
              }`}
            >
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                <Cpu className="w-4 h-4 text-slate-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-slate-900 truncate">{a.name}</p>
                <p className="text-[11px] text-slate-500 flex items-center gap-1 truncate">
                  <MapPin className="w-3 h-3" /> {a.location || 'Unassigned'} · {a.type?.replace(/_/g, ' ')}
                </p>
              </div>
              <span className="text-[11px] font-bold tabular-nums text-slate-600">
                {a.health_score ?? '—'}
              </span>
            </button>
          ))}
        </div>
        <div className="px-4 py-2 border-t border-slate-100 bg-slate-50 flex items-center gap-3 text-[10px] text-slate-500">
          <span><kbd className="font-mono bg-white border border-slate-200 px-1 rounded">↑↓</kbd> navigate</span>
          <span><kbd className="font-mono bg-white border border-slate-200 px-1 rounded">↵</kbd> open</span>
          <span className="ml-auto">{results.length} results</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}