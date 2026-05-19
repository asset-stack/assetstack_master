import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import Tree from 'react-d3-tree';
import { motion } from 'framer-motion';
import {
  Search, Layers, MapPin, Cpu, AlertTriangle, DoorOpen,
  Maximize2, GitBranch, Network
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AssetTreeNode from '@/components/asset-tree/AssetTreeNode';
import AssetDetailsPanel from '@/components/asset-tree/AssetDetailsPanel';
import { buildAssetTree, filterTree } from '@/components/asset-tree/buildAssetTree';

export default function AssetTreeVisual() {
  const containerRef = useRef(null);
  const [translate, setTranslate] = useState({ x: 300, y: 300 });
  const [groupBy, setGroupBy] = useState('location');
  const [orientation, setOrientation] = useState('horizontal');
  const [pathFunc, setPathFunc] = useState('diagonal');
  const [search, setSearch] = useState('');
  const [selectedAsset, setSelectedAsset] = useState(null);

  const { data: equipment = [], isLoading } = useQuery({
    queryKey: ['equipment'],
    queryFn: () => base44.entities.Equipment.list('-updated_date', 500),
  });

  useEffect(() => {
    if (!containerRef.current) return;
    const update = () => {
      const rect = containerRef.current.getBoundingClientRect();
      setTranslate({
        x: orientation === 'horizontal' ? 140 : rect.width / 2,
        y: orientation === 'horizontal' ? rect.height / 2 : 100,
      });
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [orientation]);

  const treeData = useMemo(() => {
    const full = buildAssetTree(equipment, groupBy);
    return filterTree(full, search);
  }, [equipment, groupBy, search]);

  const stats = useMemo(() => ({
    total: equipment.length,
    critical: equipment.filter(e => e.risk_level === 'critical' || e.status === 'critical').length,
    locations: new Set(equipment.map(e => e.location || 'Unassigned')).size,
    rooms: new Set(equipment.map(e => `${e.location || ''}::${e.room?.trim() || 'Unassigned room'}`)).size,
  }), [equipment]);

  const handleNodeClick = (nodeDatum) => {
    if (nodeDatum.attributes?.kind === 'asset') {
      const asset = equipment.find(e => e.id === nodeDatum.attributes.id);
      setSelectedAsset(asset || nodeDatum.attributes);
    }
  };

  const recenter = () => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setTranslate({
      x: orientation === 'horizontal' ? 140 : rect.width / 2,
      y: orientation === 'horizontal' ? rect.height / 2 : 100,
    });
  };

  return (
    <div>
      <div className="flex items-center gap-2 flex-wrap mb-4">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            placeholder="Search assets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 w-56 h-9 bg-white"
          />
        </div>
        <Select value={groupBy} onValueChange={setGroupBy}>
          <SelectTrigger className="w-40 h-9 bg-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="location">Location → Room → Asset</SelectItem>
            <SelectItem value="type">By Type</SelectItem>
            <SelectItem value="status">By Status</SelectItem>
            <SelectItem value="criticality">By Criticality</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setOrientation(o => o === 'horizontal' ? 'vertical' : 'horizontal')}
          className="gap-1.5 h-9"
        >
          {orientation === 'horizontal' ? <GitBranch className="w-4 h-4" /> : <Network className="w-4 h-4" />}
          {orientation === 'horizontal' ? 'Horizontal' : 'Vertical'}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPathFunc(p => p === 'diagonal' ? 'step' : p === 'step' ? 'straight' : 'diagonal')}
          className="gap-1.5 h-9 capitalize"
        >
          {pathFunc} links
        </Button>
        <Button variant="outline" size="sm" onClick={recenter} className="gap-1.5 h-9">
          <Maximize2 className="w-4 h-4" /> Recenter
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <StatCard icon={Cpu} label="Total Assets" value={stats.total} color="indigo" />
        <StatCard icon={MapPin} label="Locations" value={stats.locations} color="sky" />
        <StatCard icon={DoorOpen} label="Rooms" value={stats.rooms} color="teal" />
        <StatCard icon={AlertTriangle} label="Critical" value={stats.critical} color="rose" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
        style={{ height: 'calc(100vh - 360px)', minHeight: 540 }}
      >
        <div
          className="absolute inset-0 opacity-40 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, #cbd5e1 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />

        <div ref={containerRef} className="relative w-full h-full">
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin" />
            </div>
          ) : equipment.length === 0 ? (
            <EmptyState />
          ) : (
            <Tree
              data={treeData}
              orientation={orientation}
              pathFunc={pathFunc}
              translate={translate}
              zoom={0.8}
              scaleExtent={{ min: 0.2, max: 2 }}
              separation={{ siblings: 1.2, nonSiblings: 1.6 }}
              nodeSize={orientation === 'horizontal' ? { x: 260, y: 110 } : { x: 220, y: 160 }}
              renderCustomNodeElement={(rd3tProps) => (
                <AssetTreeNode {...rd3tProps} onNodeClick={handleNodeClick} />
              )}
              pathClassFunc={() => 'asset-tree-link'}
              enableLegacyTransitions
              transitionDuration={300}
              collapsible
              initialDepth={orientation === 'horizontal' ? 2 : 1}
            />
          )}
        </div>

        <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-xl border border-slate-200 shadow-sm p-3">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Legend</p>
          <div className="space-y-1.5">
            <LegendItem color="#10b981" label="Operational" />
            <LegendItem color="#f59e0b" label="Degraded" />
            <LegendItem color="#ef4444" label="Critical" pulse />
            <LegendItem color="#3b82f6" label="Maintenance" />
          </div>
        </div>
      </motion.div>

      <p className="text-xs text-slate-400 mt-3 text-center">
        💡 Click + / − on group nodes to collapse · Click cards for details · Drag to pan · Scroll to zoom
      </p>

      <AssetDetailsPanel asset={selectedAsset} onClose={() => setSelectedAsset(null)} />

      <style>{`
        .asset-tree-link {
          fill: none;
          stroke: #cbd5e1;
          stroke-width: 1.5;
          stroke-linecap: round;
          transition: stroke 0.2s;
        }
        .asset-tree-link:hover {
          stroke: #6366f1;
          stroke-width: 2;
        }
        .rd3t-tree-container { width: 100%; height: 100%; }
      `}</style>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  const colors = {
    indigo: 'bg-indigo-50 text-indigo-600',
    sky: 'bg-sky-50 text-sky-600',
    violet: 'bg-violet-50 text-violet-600',
    teal: 'bg-teal-50 text-teal-600',
    rose: 'bg-rose-50 text-rose-600',
  };
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3">
      <div className={`w-10 h-10 rounded-lg ${colors[color]} flex items-center justify-center`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-900 leading-none">{value}</p>
        <p className="text-xs text-slate-500 mt-1">{label}</p>
      </div>
    </div>
  );
}

function LegendItem({ color, label, pulse }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={`w-2.5 h-2.5 rounded-full ${pulse ? 'animate-pulse' : ''}`}
        style={{ backgroundColor: color }}
      />
      <span className="text-xs text-slate-600">{label}</span>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center mb-4">
        <GitBranch className="w-8 h-8 text-white" />
      </div>
      <h3 className="font-bold text-slate-900 text-lg mb-1">No assets yet</h3>
      <p className="text-sm text-slate-500 max-w-sm">Add equipment to see your asset hierarchy come to life in an interactive tree visualization.</p>
    </div>
  );
}