import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Database, Search, Filter, Download, Cpu } from 'lucide-react';

/**
 * Asset Register preview — a realistic equipment register table with
 * filters, status badges, and a totals strip.
 */

const ASSETS = [
  { id: 'AS-0142', name: 'Library HVAC Rooftop #2', type: 'HVAC', location: 'Library · Roof', value: 48200, age: '6.2 yr', health: 62, status: 'warn' },
  { id: 'AS-0098', name: 'Town Hall Lift Cable',     type: 'Lift', location: 'Town Hall · Shaft 1', value: 22500, age: '4.8 yr', health: 78, status: 'warn' },
  { id: 'AS-0276', name: 'Park Irrigation Pump',     type: 'Pump', location: 'Reserve A',         value: 14800, age: '8.1 yr', health: 41, status: 'crit' },
  { id: 'AS-0301', name: 'Library HVAC Rooftop #1',  type: 'HVAC', location: 'Library · Roof',    value: 48200, age: '6.2 yr', health: 94, status: 'ok' },
  { id: 'AS-0188', name: 'Library HVAC Rooftop #3',  type: 'HVAC', location: 'Library · Roof',    value: 48200, age: '6.2 yr', health: 88, status: 'ok' },
  { id: 'AS-0412', name: 'Town Hall Generator',      type: 'Power', location: 'Town Hall · Plant', value: 86400, age: '3.1 yr', health: 91, status: 'ok' },
  { id: 'AS-0533', name: 'Stadium Floodlight Bank',  type: 'Lighting', location: 'Stadium · East', value: 32100, age: '5.4 yr', health: 86, status: 'ok' },
];

const FILTERS = ['All', 'HVAC', 'Lift', 'Pump', 'Power'];

export default function AssetRegisterPreview() {
  const [active, setActive] = useState('All');
  const filtered = active === 'All' ? ASSETS : ASSETS.filter((a) => a.type === active);
  const totalValue = ASSETS.reduce((s, a) => s + a.value, 0);

  return (
    <div className="h-full w-full bg-white flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-2 px-5 py-3 border-b border-slate-100">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500 to-teal-600 text-white flex items-center justify-center">
          <Database className="w-3.5 h-3.5" />
        </div>
        <div>
          <div className="text-[12px] font-semibold text-slate-900 leading-none">Asset Register</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Bunbury LGA · 156 assets</div>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <button className="flex items-center gap-1 px-2 py-1 rounded-md border border-slate-200 hover:bg-slate-50 text-[10px] font-medium text-slate-700">
            <Download className="w-3 h-3" /> Export
          </button>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="px-4 py-2.5 border-b border-slate-100 flex items-center gap-2">
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-md border border-slate-200 bg-slate-50/40 flex-1 max-w-[180px]">
          <Search className="w-3 h-3 text-slate-400" />
          <span className="text-[11px] text-slate-400">Search assets…</span>
        </div>
        <Filter className="w-3 h-3 text-slate-400 ml-1" />
        <div className="flex gap-1 overflow-hidden">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setActive(f)}
              className={`px-2 py-1 rounded-md text-[10px] font-semibold transition-colors ${
                active === f ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        <table className="w-full text-[11px]">
          <thead className="bg-slate-50/60 sticky top-0 z-10">
            <tr className="text-left text-[9px] uppercase tracking-wider text-slate-500 font-semibold">
              <th className="px-4 py-2 font-semibold">ID</th>
              <th className="px-2 py-2 font-semibold">Asset</th>
              <th className="px-2 py-2 font-semibold">Type</th>
              <th className="px-2 py-2 font-semibold text-right">Value</th>
              <th className="px-2 py-2 font-semibold">Health</th>
              <th className="px-4 py-2 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((a, i) => (
              <motion.tr
                key={a.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="border-t border-slate-100 hover:bg-slate-50/60"
              >
                <td className="px-4 py-2 font-mono text-[10px] text-slate-500 tabular-nums">{a.id}</td>
                <td className="px-2 py-2">
                  <div className="flex items-center gap-1.5">
                    <Cpu className="w-3 h-3 text-slate-400 shrink-0" />
                    <div className="min-w-0">
                      <div className="font-semibold text-slate-900 truncate">{a.name}</div>
                      <div className="text-[9px] text-slate-500 truncate">{a.location}</div>
                    </div>
                  </div>
                </td>
                <td className="px-2 py-2 text-slate-600">{a.type}</td>
                <td className="px-2 py-2 text-right font-semibold text-slate-900 tabular-nums">
                  ${a.value.toLocaleString()}
                </td>
                <td className="px-2 py-2">
                  <div className="flex items-center gap-1.5">
                    <div className="w-12 h-1 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          a.health >= 80 ? 'bg-emerald-500' :
                          a.health >= 60 ? 'bg-amber-500' :
                          'bg-rose-500'
                        }`}
                        style={{ width: `${a.health}%` }}
                      />
                    </div>
                    <span className="text-[10px] tabular-nums text-slate-600">{a.health}%</span>
                  </div>
                </td>
                <td className="px-4 py-2">
                  <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-semibold uppercase tracking-wider ${
                    a.status === 'ok' ? 'bg-emerald-50 text-emerald-700' :
                    a.status === 'warn' ? 'bg-amber-50 text-amber-700' :
                    'bg-rose-50 text-rose-700'
                  }`}>
                    <span className={`w-1 h-1 rounded-full ${
                      a.status === 'ok' ? 'bg-emerald-500' :
                      a.status === 'warn' ? 'bg-amber-500' :
                      'bg-rose-500'
                    }`} />
                    {a.status === 'ok' ? 'Healthy' : a.status === 'warn' ? 'Watch' : 'Critical'}
                  </span>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals strip */}
      <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50/40 flex items-center gap-4">
        <Stat label="Total assets" value={ASSETS.length} />
        <Stat label="Replacement value" value={`$${(totalValue / 1000).toFixed(0)}k`} />
        <Stat label="At risk" value="3" accent="amber" />
        <span className="ml-auto text-[10px] text-slate-400">Showing {filtered.length} of {ASSETS.length}</span>
      </div>
    </div>
  );
}

function Stat({ label, value, accent }) {
  const color = accent === 'amber' ? 'text-amber-600' : 'text-slate-900';
  return (
    <div>
      <div className="text-[9px] uppercase tracking-wider text-slate-500 font-semibold">{label}</div>
      <div className={`text-[13px] font-semibold tabular-nums ${color}`}>{value}</div>
    </div>
  );
}