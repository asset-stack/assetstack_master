import React, { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Search, Command, Layers, Download, ChevronDown, ChevronRight,
  Rows, Rows3, AlignJustify, MapPin, DoorOpen
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import RegisterFilters from './RegisterFilters';
import RegisterStats from './RegisterStats';
import AssetRow from './AssetRow';
import RegisterDetailsPanel from './RegisterDetailsPanel';
import CommandPalette from './CommandPalette';
import BulkActionBar from './BulkActionBar';
import { applyFilters, groupAssets, exportToCSV } from './registerUtils';

const DEFAULT_FILTERS = { status: [], risk: [], criticality: [], location: [], room: [], type: [] };

export default function AssetRegister() {
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [groupBy, setGroupBy] = useState('location');
  const [density, setDensity] = useState('comfortable');
  const [selected, setSelected] = useState(new Set());
  const [activeAsset, setActiveAsset] = useState(null);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState(new Set());

  const { data: equipment = [], isLoading } = useQuery({
    queryKey: ['equipment-register'],
    queryFn: () => base44.entities.Equipment.list('-updated_date', 1000),
  });

  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setPaletteOpen(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const filtered = useMemo(() => applyFilters(equipment, filters, search), [equipment, filters, search]);
  const groups = useMemo(() => groupAssets(filtered, groupBy), [filtered, groupBy]);

  const locationOptions = useMemo(
    () => Array.from(new Set(equipment.map((e) => e.location).filter(Boolean))).sort(),
    [equipment]
  );
  const roomOptions = useMemo(
    () => Array.from(new Set(equipment.map((e) => e.room?.trim()).filter(Boolean))).sort(),
    [equipment]
  );
  const typeOptions = useMemo(
    () => Array.from(new Set(equipment.map((e) => e.type).filter(Boolean))).sort(),
    [equipment]
  );

  const toggleSelect = (id) => {
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleGroup = (key) => {
    setCollapsedGroups((s) => {
      const next = new Set(s);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const selectAllVisible = () => {
    const allIds = filtered.map((a) => a.id);
    if (selected.size === allIds.length) setSelected(new Set());
    else setSelected(new Set(allIds));
  };

  const handleExport = () => {
    const items = selected.size > 0
      ? equipment.filter((a) => selected.has(a.id))
      : filtered;
    exportToCSV(items);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-3 border-b border-slate-100 space-y-3">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[220px] max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              placeholder="Search assets, locations, manufacturers…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
          <Button variant="outline" size="sm" onClick={() => setPaletteOpen(true)} className="h-9 gap-1.5 text-[12px]">
            <Command className="w-3.5 h-3.5" /> Jump to <kbd className="ml-1 font-mono text-[10px] bg-slate-100 px-1 rounded">⌘K</kbd>
          </Button>
          <div className="flex-1" />
          <Select value={groupBy} onValueChange={setGroupBy}>
            <SelectTrigger className="w-36 h-9 text-[12px]">
              <Layers className="w-3.5 h-3.5 mr-1.5 opacity-60" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="location">By Location → Room</SelectItem>
              <SelectItem value="room">By Room</SelectItem>
              <SelectItem value="type">By Type</SelectItem>
              <SelectItem value="status">By Status</SelectItem>
              <SelectItem value="criticality">By Criticality</SelectItem>
              <SelectItem value="manufacturer">By Manufacturer</SelectItem>
              <SelectItem value="none">Flat list</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center bg-slate-100 rounded-lg p-0.5">
            {[
              { v: 'compact', icon: Rows },
              { v: 'comfortable', icon: AlignJustify },
              { v: 'detailed', icon: Rows3 },
            ].map((d) => (
              <button
                key={d.v}
                onClick={() => setDensity(d.v)}
                className={`p-1.5 rounded-md transition-colors ${
                  density === d.v ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
                title={d.v}
              >
                <d.icon className="w-3.5 h-3.5" />
              </button>
            ))}
          </div>
          <Button variant="outline" size="sm" onClick={handleExport} className="h-9 gap-1.5 text-[12px]">
            <Download className="w-3.5 h-3.5" /> Export
          </Button>
        </div>

        <RegisterFilters
          filters={filters}
          onChange={setFilters}
          locationOptions={locationOptions}
          roomOptions={roomOptions}
          typeOptions={typeOptions}
        />
      </div>

      <div className="p-3 bg-slate-50/50 border-b border-slate-100">
        <RegisterStats assets={equipment} filteredCount={filtered.length} />
      </div>

      <div className="grid grid-cols-[28px_1.6fr_1fr_140px_100px_80px_70px_44px] items-center gap-3 px-3 py-2 bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
        <Checkbox
          checked={filtered.length > 0 && selected.size === filtered.length}
          onCheckedChange={selectAllVisible}
        />
        <span>Asset</span>
        <span>Location · Room</span>
        <span>Health</span>
        <span>Risk</span>
        <span className="text-right">Fail %</span>
        <span className="text-center">Trend</span>
        <span className="text-center" title="Data quality">DQ</span>
      </div>

      <div className="max-h-[calc(100vh-380px)] min-h-[400px] overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-7 h-7 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState />
        ) : (
          groups.map((group) => {
            const isCollapsed = collapsedGroups.has(group.key);
            const hasRoomSubGroups = group.subGroups && group.subGroups.length > 0;
            return (
              <div key={group.key}>
                {groupBy !== 'none' && (
                  <button
                    onClick={() => toggleGroup(group.key)}
                    className="w-full flex items-center gap-2 px-3 py-1.5 bg-indigo-50/40 border-b border-slate-100 hover:bg-indigo-50 transition-colors text-left sticky top-0 z-10"
                  >
                    {isCollapsed ? <ChevronRight className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
                    <MapPin className="w-3 h-3 text-indigo-500" />
                    <span className="text-[12px] font-bold text-slate-800 capitalize">{group.key.replace(/_/g, ' ')}</span>
                    <span className="text-[11px] text-slate-500">· {group.count}</span>
                    {group.critical > 0 && (
                      <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">
                        {group.critical} critical
                      </span>
                    )}
                    {group.avgHealth != null && (
                      <span className="ml-auto text-[10px] text-slate-500">
                        avg health <span className="font-bold text-slate-700">{group.avgHealth}</span>
                      </span>
                    )}
                  </button>
                )}
                {!isCollapsed && hasRoomSubGroups && (
                  group.subGroups.map((room) => (
                    <div key={`${group.key}::${room.key}`}>
                      <div className="flex items-center gap-2 px-3 py-1 pl-9 bg-teal-50/40 border-b border-slate-100">
                        <DoorOpen className="w-3 h-3 text-teal-600" />
                        <span className="text-[11px] font-semibold text-slate-700">{room.key}</span>
                        <span className="text-[10px] text-slate-500">· {room.count}</span>
                        {room.critical > 0 && (
                          <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">
                            {room.critical} critical
                          </span>
                        )}
                      </div>
                      {room.items.map((asset) => (
                        <AssetRow
                          key={asset.id}
                          asset={asset}
                          selected={selected.has(asset.id)}
                          onSelect={() => toggleSelect(asset.id)}
                          onClick={() => setActiveAsset(asset)}
                          density={density}
                        />
                      ))}
                    </div>
                  ))
                )}
                {!isCollapsed && !hasRoomSubGroups && group.items.map((asset) => (
                  <AssetRow
                    key={asset.id}
                    asset={asset}
                    selected={selected.has(asset.id)}
                    onSelect={() => toggleSelect(asset.id)}
                    onClick={() => setActiveAsset(asset)}
                    density={density}
                  />
                ))}
              </div>
            );
          })
        )}
      </div>

      <CommandPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        assets={equipment}
        onSelect={setActiveAsset}
      />

      {activeAsset && (
        <RegisterDetailsPanel asset={activeAsset} onClose={() => setActiveAsset(null)} />
      )}

      <BulkActionBar
        count={selected.size}
        onClear={() => setSelected(new Set())}
        onBulkEdit={() => window.location.href = '/BulkUpdate'}
        onExport={handleExport}
      />
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
        <Search className="w-6 h-6 text-slate-400" />
      </div>
      <h3 className="font-bold text-slate-900 text-base mb-1">No matching assets</h3>
      <p className="text-sm text-slate-500 max-w-sm">Try clearing some filters or adjusting your search.</p>
    </div>
  );
}