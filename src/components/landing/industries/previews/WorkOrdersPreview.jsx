import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Wrench, CheckCircle2, Clock, AlertTriangle, User, Camera, MessageCircle, Package } from 'lucide-react';

/**
 * Work Orders preview — realistic CMMS surface showing a list of WOs
 * plus a detail panel with checklist, labor, parts, and team chat.
 */

const ORDERS = [
  { id: 'WO-2042', title: 'HVAC compressor replacement', asset: 'Library HVAC #2', priority: 'urgent', status: 'in_progress', tech: 'M. Chen', progress: 65 },
  { id: 'WO-2041', title: 'Quarterly lift inspection',   asset: 'Town Hall lift',   priority: 'medium', status: 'open',        tech: 'A. Patel', progress: 0 },
  { id: 'WO-2038', title: 'Pump seal replacement',       asset: 'Park irrigation',  priority: 'high',   status: 'in_progress', tech: 'J. Rivera', progress: 40 },
  { id: 'WO-2036', title: 'Floodlight ballast service',  asset: 'Stadium east',     priority: 'low',    status: 'open',        tech: 'K. Watson', progress: 0 },
];

const CHECKLIST = [
  { q: 'LOTO applied', done: true },
  { q: 'Refrigerant recovered', done: true },
  { q: 'Old compressor removed', done: true },
  { q: 'New compressor installed', done: false },
  { q: 'Vacuum & pressure test', done: false },
  { q: 'Photo of nameplate', done: false, type: 'photo' },
];

export default function WorkOrdersPreview() {
  const [active, setActive] = useState(ORDERS[0]);
  const completed = CHECKLIST.filter(c => c.done).length;

  return (
    <div className="h-full w-full bg-white flex">
      {/* Left: WO list */}
      <div className="w-[42%] border-r border-slate-100 flex flex-col">
        <div className="px-3 py-2.5 border-b border-slate-100 flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-gradient-to-br from-orange-500 to-amber-600 text-white flex items-center justify-center">
            <Wrench className="w-3 h-3" />
          </div>
          <span className="text-[11px] font-semibold text-slate-900">Work Orders</span>
          <span className="ml-auto text-[9px] text-slate-500">24 open</span>
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {ORDERS.map((o, i) => (
            <motion.button
              key={o.id}
              onClick={() => setActive(o)}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`w-full text-left px-3 py-2.5 border-b border-slate-100 transition-colors ${
                active.id === o.id ? 'bg-orange-50/60 border-l-2 border-l-orange-500' : 'hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between mb-0.5">
                <span className="font-mono text-[9px] text-slate-500 tabular-nums">{o.id}</span>
                <PriorityBadge p={o.priority} />
              </div>
              <div className="text-[11px] font-semibold text-slate-900 leading-tight">{o.title}</div>
              <div className="text-[9px] text-slate-500 mt-0.5 truncate">{o.asset}</div>
              <div className="flex items-center gap-1.5 mt-1.5">
                <StatusDot s={o.status} />
                <span className="text-[9px] text-slate-600 capitalize">{o.status.replace('_', ' ')}</span>
                <span className="ml-auto text-[9px] text-slate-500 flex items-center gap-0.5">
                  <User className="w-2.5 h-2.5" /> {o.tech}
                </span>
              </div>
              {o.progress > 0 && (
                <div className="mt-1.5 h-0.5 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-orange-500" style={{ width: `${o.progress}%` }} />
                </div>
              )}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Right: WO detail */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="px-4 py-2.5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[9px] text-slate-500">{active.id}</span>
            <PriorityBadge p={active.priority} />
            <span className="ml-auto text-[9px] text-slate-500">{active.tech}</span>
          </div>
          <div className="text-[12px] font-semibold text-slate-900 mt-0.5 truncate">{active.title}</div>
          <div className="text-[10px] text-slate-500 truncate">{active.asset}</div>
        </div>

        {/* Checklist */}
        <div className="px-4 py-3 border-b border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[9px] uppercase tracking-wider text-slate-500 font-semibold">Checklist</span>
            <span className="text-[9px] tabular-nums text-slate-600">{completed}/{CHECKLIST.length}</span>
          </div>
          <div className="space-y-1">
            {CHECKLIST.map((c, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className="flex items-center gap-1.5 text-[10px]"
              >
                {c.done ? (
                  <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                ) : (
                  <div className="w-3 h-3 rounded-full border-[1.5px] border-slate-300 shrink-0" />
                )}
                <span className={c.done ? 'text-slate-400 line-through' : 'text-slate-700'}>{c.q}</span>
                {c.type === 'photo' && (
                  <Camera className="w-2.5 h-2.5 text-slate-400 ml-auto" />
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Labor + Parts strip */}
        <div className="grid grid-cols-2 gap-2 px-4 py-3 border-b border-slate-100">
          <div className="bg-slate-50/60 rounded-md p-2">
            <div className="flex items-center gap-1 text-[9px] uppercase tracking-wider text-slate-500 font-semibold mb-1">
              <Clock className="w-2.5 h-2.5" /> Labor
            </div>
            <div className="text-[12px] font-semibold text-slate-900 tabular-nums">3.5 hrs</div>
            <div className="text-[9px] text-slate-500">$315</div>
          </div>
          <div className="bg-slate-50/60 rounded-md p-2">
            <div className="flex items-center gap-1 text-[9px] uppercase tracking-wider text-slate-500 font-semibold mb-1">
              <Package className="w-2.5 h-2.5" /> Parts
            </div>
            <div className="text-[12px] font-semibold text-slate-900 tabular-nums">2 items</div>
            <div className="text-[9px] text-slate-500">$1,840</div>
          </div>
        </div>

        {/* Team chat */}
        <div className="px-4 py-2.5 flex-1">
          <div className="flex items-center gap-1 mb-1.5">
            <MessageCircle className="w-2.5 h-2.5 text-slate-400" />
            <span className="text-[9px] uppercase tracking-wider text-slate-500 font-semibold">Team chat</span>
          </div>
          <div className="bg-slate-50/60 rounded-md px-2 py-1.5 text-[10px]">
            <div className="font-semibold text-slate-700">M. Chen</div>
            <div className="text-slate-600">New compressor onsite — starting install now.</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PriorityBadge({ p }) {
  const map = {
    urgent: { c: 'bg-rose-100 text-rose-700', l: 'Urgent' },
    high: { c: 'bg-orange-100 text-orange-700', l: 'High' },
    medium: { c: 'bg-amber-100 text-amber-700', l: 'Medium' },
    low: { c: 'bg-slate-100 text-slate-600', l: 'Low' },
  };
  const x = map[p];
  return <span className={`text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${x.c}`}>{x.l}</span>;
}

function StatusDot({ s }) {
  const c = s === 'in_progress' ? 'bg-orange-500' : s === 'open' ? 'bg-blue-500' : 'bg-emerald-500';
  return <span className={`w-1.5 h-1.5 rounded-full ${c}`} />;
}