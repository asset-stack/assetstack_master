import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GitBranch, ChevronDown, ChevronRight, MapPin, Building2, Cpu, Wrench,
  Activity, Calendar, AlertTriangle,
} from 'lucide-react';

/**
 * Expanded Asset Tree preview — full collapsible hierarchy with a
 * detail panel showing live sensor data for the selected asset.
 */

const TREE = [
  {
    id: 'bunbury', label: 'Bunbury LGA', icon: MapPin, count: 156, type: 'site',
    children: [
      {
        id: 'lib', label: 'Library Building', icon: Building2, count: 24, type: 'building',
        children: [
          {
            id: 'hvac', label: 'HVAC Systems', icon: Cpu, count: 8, type: 'system',
            children: [
              { id: 'rtu1', label: 'Rooftop Unit #1', icon: Wrench, status: 'ok', meta: 'Healthy', type: 'asset' },
              { id: 'rtu2', label: 'Rooftop Unit #2', icon: Wrench, status: 'warn', meta: 'Anomaly · vibration', type: 'asset' },
              { id: 'rtu3', label: 'Rooftop Unit #3', icon: Wrench, status: 'ok', meta: 'Healthy', type: 'asset' },
            ]
          },
          { id: 'lift', label: 'Lift / Elevator', icon: Cpu, count: 1, type: 'system' },
          { id: 'lighting', label: 'Lighting', icon: Cpu, count: 12, type: 'system' },
        ]
      },
      {
        id: 'town', label: 'Town Hall', icon: Building2, count: 42, type: 'building',
        children: [
          { id: 'th-hvac', label: 'HVAC Systems', icon: Cpu, count: 6, type: 'system' },
          { id: 'th-lift', label: 'Lift Cable', icon: Wrench, status: 'warn', meta: 'Service due 4d', type: 'asset' },
        ]
      },
      {
        id: 'park', label: 'Parks & Reserves', icon: Building2, count: 38, type: 'building',
        children: [
          { id: 'irr', label: 'Irrigation Pump', icon: Wrench, status: 'crit', meta: 'Pressure drop', type: 'asset' },
        ]
      },
    ]
  }
];

const ASSET_DETAILS = {
  rtu2: {
    name: 'Rooftop Unit #2',
    location: 'Library Building · Roof',
    health: 62,
    status: 'Anomaly detected',
    statusColor: 'amber',
    nextService: '5 days',
    sensorLabel: 'Vibration · mm/s',
    sensor: [1.8, 1.9, 2.0, 1.95, 2.1, 2.0, 2.2, 2.5, 2.8, 3.2, 3.6, 4.1, 4.4, 4.8],
    threshold: 3.0,
    findings: 2,
  },
  rtu1: {
    name: 'Rooftop Unit #1',
    location: 'Library Building · Roof',
    health: 94,
    status: 'Healthy',
    statusColor: 'emerald',
    nextService: '42 days',
    sensorLabel: 'Vibration · mm/s',
    sensor: [1.8, 1.7, 1.9, 1.8, 1.85, 1.9, 1.8, 1.75, 1.8, 1.9, 1.85, 1.8, 1.9, 1.85],
    threshold: 3.0,
    findings: 0,
  },
  rtu3: {
    name: 'Rooftop Unit #3',
    location: 'Library Building · Roof',
    health: 88,
    status: 'Healthy',
    statusColor: 'emerald',
    nextService: '28 days',
    sensorLabel: 'Vibration · mm/s',
    sensor: [1.9, 2.0, 1.95, 2.0, 2.1, 2.0, 2.05, 2.0, 1.95, 2.0, 2.05, 2.0, 1.95, 2.0],
    threshold: 3.0,
    findings: 0,
  },
  'th-lift': {
    name: 'Lift Cable',
    location: 'Town Hall · Shaft 1',
    health: 78,
    status: 'Service due in 4 days',
    statusColor: 'amber',
    nextService: '4 days',
    sensorLabel: 'Cycles · per day',
    sensor: [142, 138, 145, 150, 148, 152, 149, 146, 151, 148, 150, 147, 152, 149],
    threshold: 160,
    findings: 1,
  },
  irr: {
    name: 'Irrigation Pump',
    location: 'Bunbury Parks · Reserve A',
    health: 41,
    status: 'Critical · pressure drop',
    statusColor: 'rose',
    nextService: 'Overdue',
    sensorLabel: 'Pressure · kPa',
    sensor: [410, 408, 405, 400, 395, 388, 380, 370, 360, 348, 335, 320, 305, 285],
    threshold: 350,
    findings: 3,
  },
};

export default function AssetTreePreview() {
  const [expanded, setExpanded] = useState({ bunbury: true, lib: true, hvac: true });
  const [selected, setSelected] = useState('rtu2');

  const toggle = (id) => setExpanded((s) => ({ ...s, [id]: !s[id] }));

  const detail = ASSET_DETAILS[selected];

  return (
    <div className="h-full w-full bg-white flex">
      {/* Left rail — tree */}
      <div className="flex-1 min-w-0 flex flex-col border-r border-slate-100">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100">
          <GitBranch className="w-4 h-4 text-emerald-600" />
          <span className="text-[12px] font-semibold text-slate-900">Asset Hierarchy</span>
          <span className="ml-auto text-[10px] text-slate-400 tabular-nums">156 nodes</span>
        </div>
        <div className="flex-1 overflow-y-auto py-2 px-1.5 scrollbar-thin">
          {TREE.map((root) => (
            <TreeNode
              key={root.id}
              node={root}
              depth={0}
              expanded={expanded}
              onToggle={toggle}
              selected={selected}
              onSelect={setSelected}
            />
          ))}
        </div>
        {/* Coverage strip */}
        <div className="px-3 py-2 border-t border-slate-100 bg-slate-50/40">
          <div className="text-[9px] uppercase tracking-wider text-slate-500 font-semibold mb-1">Portfolio coverage</div>
          <div className="flex h-1.5 rounded-full overflow-hidden">
            <div className="bg-emerald-500" style={{ width: '72%' }} />
            <div className="bg-amber-500" style={{ width: '20%' }} />
            <div className="bg-rose-500" style={{ width: '8%' }} />
          </div>
          <div className="flex justify-between mt-1 text-[9px] text-slate-500 tabular-nums">
            <span>112 OK</span><span>32 watch</span><span>12 critical</span>
          </div>
        </div>
      </div>

      {/* Right rail — selected asset detail */}
      <div className="w-[44%] flex flex-col bg-slate-50/40">
        <AnimatePresence mode="wait">
          {detail ? (
            <motion.div
              key={selected}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="flex flex-col h-full"
            >
              <div className="px-4 py-3 border-b border-slate-100">
                <div className="text-[9px] uppercase tracking-wider text-slate-500 font-semibold">Asset detail</div>
                <div className="text-[13px] font-semibold text-slate-900 mt-0.5 truncate">{detail.name}</div>
                <div className="text-[10px] text-slate-500 truncate">{detail.location}</div>
              </div>

              {/* Status pill */}
              <div className="px-4 pt-3">
                <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-semibold ${
                  detail.statusColor === 'emerald' ? 'bg-emerald-50 text-emerald-700' :
                  detail.statusColor === 'amber' ? 'bg-amber-50 text-amber-700' :
                  'bg-rose-50 text-rose-700'
                }`}>
                  {detail.statusColor !== 'emerald' && <AlertTriangle className="w-2.5 h-2.5" />}
                  {detail.status}
                </div>
              </div>

              {/* KPIs */}
              <div className="px-4 mt-3 grid grid-cols-2 gap-2">
                <KPI icon={Activity} label="Health score" value={`${detail.health}%`} accent={detail.statusColor} />
                <KPI icon={Calendar} label="Next service" value={detail.nextService} accent="slate" />
              </div>

              {/* Sensor chart */}
              <div className="px-4 mt-3 flex-1 min-h-0">
                <div className="bg-white rounded-lg border border-slate-200 p-3 h-full flex flex-col">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-semibold text-slate-700">{detail.sensorLabel}</span>
                    <span className="text-[9px] text-slate-400 tabular-nums">14d</span>
                  </div>
                  <div className="flex-1 min-h-[60px]">
                    <SensorChart points={detail.sensor} threshold={detail.threshold} accent={detail.statusColor} />
                  </div>
                </div>
              </div>

              {/* Findings */}
              <div className="px-4 py-3 border-t border-slate-100">
                <div className="flex items-center gap-2 text-[11px]">
                  <span className="text-slate-500">Findings:</span>
                  <span className="font-semibold text-slate-900 tabular-nums">{detail.findings}</span>
                  <span className="ml-auto text-[10px] text-emerald-600 hover:underline cursor-pointer font-medium">
                    Open in Asset Tree →
                  </span>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-[11px] text-slate-400">
              Select an asset
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function TreeNode({ node, depth, expanded, onToggle, selected, onSelect }) {
  const hasChildren = node.children?.length > 0;
  const isExpanded = expanded[node.id];
  const isSelected = selected === node.id;
  const Icon = node.icon;

  const handleClick = () => {
    if (hasChildren) onToggle(node.id);
    if (node.type === 'asset' || ASSET_DETAILS[node.id]) onSelect(node.id);
  };

  return (
    <div>
      <button
        onClick={handleClick}
        className={`w-full flex items-center gap-1.5 py-1.5 pr-2 rounded-md transition-colors text-left ${
          isSelected ? 'bg-emerald-50' : 'hover:bg-slate-50'
        }`}
        style={{ paddingLeft: `${depth * 14 + 8}px` }}
      >
        {hasChildren ? (
          isExpanded ? <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" /> : <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
        ) : (
          <span className="w-3 shrink-0" />
        )}
        {Icon && <Icon className={`w-3 h-3 shrink-0 ${depth === 0 ? 'text-emerald-600' : 'text-slate-400'}`} />}
        {node.status && (
          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
            node.status === 'ok' ? 'bg-emerald-500' :
            node.status === 'warn' ? 'bg-amber-500' :
            'bg-rose-500'
          }`} />
        )}
        <span className={`text-[12px] truncate ${
          isSelected ? 'font-semibold text-slate-900' :
          depth === 0 ? 'font-semibold text-slate-900' : 'font-medium text-slate-700'
        }`}>
          {node.label}
        </span>
        <span className={`ml-auto text-[10px] tabular-nums shrink-0 ${
          node.status === 'warn' ? 'text-amber-600 font-semibold' :
          node.status === 'crit' ? 'text-rose-600 font-semibold' :
          'text-slate-400'
        }`}>
          {node.meta || (node.count != null ? node.count : '')}
        </span>
      </button>
      {hasChildren && isExpanded && (
        <div>
          {node.children.map((c) => (
            <TreeNode
              key={c.id}
              node={c}
              depth={depth + 1}
              expanded={expanded}
              onToggle={onToggle}
              selected={selected}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function KPI({ icon: Icon, label, value, accent }) {
  const accentBg = accent === 'emerald' ? 'bg-emerald-50 text-emerald-700' :
                   accent === 'amber' ? 'bg-amber-50 text-amber-700' :
                   accent === 'rose' ? 'bg-rose-50 text-rose-700' :
                   'bg-slate-100 text-slate-700';
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-2.5">
      <div className="flex items-center gap-1.5">
        <div className={`w-5 h-5 rounded-md ${accentBg} flex items-center justify-center`}>
          <Icon className="w-2.5 h-2.5" />
        </div>
        <span className="text-[9px] uppercase tracking-wider text-slate-500 font-semibold">{label}</span>
      </div>
      <div className="text-[15px] font-semibold text-slate-900 tabular-nums mt-1">{value}</div>
    </div>
  );
}

function SensorChart({ points, threshold, accent }) {
  const max = Math.max(...points, threshold) * 1.1;
  const min = Math.min(...points, 0) * 0.9;
  const range = max - min;
  const w = 240;
  const h = 60;
  const stepX = w / (points.length - 1);
  const lineColor = accent === 'rose' ? '#f43f5e' : accent === 'amber' ? '#f59e0b' : '#10b981';

  const path = points
    .map((v, i) => `${i === 0 ? 'M' : 'L'} ${i * stepX} ${h - ((v - min) / range) * h}`)
    .join(' ');
  const area = `${path} L ${w} ${h} L 0 ${h} Z`;
  const tY = h - ((threshold - min) / range) * h;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id={`tree-grad-${accent}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={lineColor} stopOpacity="0.25" />
          <stop offset="100%" stopColor={lineColor} stopOpacity="0" />
        </linearGradient>
      </defs>
      <line x1="0" y1={tY} x2={w} y2={tY} stroke="#94a3b8" strokeWidth="0.8" strokeDasharray="3 3" opacity="0.6" />
      <path d={area} fill={`url(#tree-grad-${accent})`} />
      <motion.path
        d={path}
        fill="none"
        stroke={lineColor}
        strokeWidth="1.5"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      />
    </svg>
  );
}