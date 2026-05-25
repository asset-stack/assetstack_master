import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wrench, Smartphone, CheckCircle2, GitBranch, Camera, Clock } from 'lucide-react';

/**
 * Maintenance workflow preview — animates a worker receiving a work order,
 * logging completion data, and the asset tree updating with the new condition.
 */

const STEPS = [
  { id: 'received', label: 'Received',  color: '#f59e0b' },
  { id: 'logging',  label: 'Logging',   color: '#6366f1' },
  { id: 'synced',   label: 'Synced',    color: '#10b981' },
];

export default function MaintenanceWorkflowPreview() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setStep((s) => (s + 1) % STEPS.length), 2400);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="h-full w-full bg-white flex">
      {/* Left: Worker phone view */}
      <div className="w-[44%] border-r border-slate-100 flex flex-col bg-gradient-to-b from-slate-50 to-white">
        <div className="px-3 py-2.5 border-b border-slate-100 flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center">
            <Smartphone className="w-3 h-3" />
          </div>
          <span className="text-[11px] font-semibold text-slate-900">Technician · J. Rivera</span>
          <span className="ml-auto text-[9px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Online
          </span>
        </div>

        <div className="p-3 flex-1">
          <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono text-[9px] text-slate-500">WO-2042</span>
              <span className="text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-rose-100 text-rose-700">Urgent</span>
            </div>
            <div className="text-[12px] font-semibold text-slate-900 leading-tight">
              HVAC compressor replacement
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Library Building · Roof Plant Room</div>

            {/* Form fields animate as worker logs data */}
            <div className="mt-3 space-y-1.5">
              <LogField label="Hours" value="3.5 hrs" icon={Clock} delay={0.1} active={step >= 1} />
              <LogField label="Parts" value="Compressor · Seal kit" icon={Wrench} delay={0.35} active={step >= 1} />
              <LogField label="Photo" value="nameplate.jpg" icon={Camera} delay={0.6} active={step >= 1} />
            </div>

            <AnimatePresence>
              {step >= 2 && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-3 flex items-center gap-1.5 text-[10px] font-semibold text-emerald-700 bg-emerald-50 rounded-md px-2 py-1.5"
                >
                  <CheckCircle2 className="w-3 h-3" />
                  Completed · synced to asset
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Right: Asset tree updating */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="px-3 py-2.5 border-b border-slate-100 flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center">
            <GitBranch className="w-3 h-3" />
          </div>
          <span className="text-[11px] font-semibold text-slate-900">Asset tree</span>
          <span className="ml-auto text-[9px] text-slate-500">Live</span>
        </div>

        <div className="p-3 flex-1 text-[10px] font-mono">
          <TreeRow indent={0} label="Library Building" status="ok" />
          <TreeRow indent={1} label="Roof Plant Room" status="ok" />
          <TreeRow
            indent={2}
            label="HVAC Compressor #2"
            status={step >= 2 ? 'updated' : step >= 1 ? 'syncing' : 'fault'}
            highlight
          />
          <TreeRow indent={2} label="HVAC Compressor #1" status="ok" />
          <TreeRow indent={1} label="Mechanical Room" status="ok" />

          <div className="mt-3 pt-2.5 border-t border-slate-100">
            <div className="text-[9px] uppercase tracking-wider text-slate-500 font-semibold mb-1.5">
              HVAC Compressor #2 · history
            </div>
            <AnimatePresence>
              {step >= 2 && (
                <motion.div
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-start gap-2 bg-emerald-50/60 border border-emerald-200 rounded-md p-2"
                >
                  <CheckCircle2 className="w-3 h-3 text-emerald-600 mt-0.5 shrink-0" />
                  <div className="font-sans">
                    <div className="text-[10px] font-semibold text-slate-900">Compressor replaced</div>
                    <div className="text-[9px] text-slate-600">Health 38 → 96 · WO-2042 · 3.5h · $2,155</div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Step indicator */}
          <div className="mt-3 flex items-center gap-1.5">
            {STEPS.map((s, i) => (
              <div key={s.id} className="flex items-center gap-1">
                <div
                  className="w-1.5 h-1.5 rounded-full transition-all"
                  style={{ background: i <= step ? s.color : '#e2e8f0' }}
                />
                <span className="text-[9px] font-sans font-semibold" style={{ color: i === step ? s.color : '#94a3b8' }}>
                  {s.label}
                </span>
                {i < STEPS.length - 1 && <span className="text-slate-300">›</span>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function LogField({ label, value, icon: Icon, delay, active }) {
  return (
    <motion.div
      animate={{ opacity: active ? 1 : 0.35 }}
      transition={{ delay: active ? delay : 0, duration: 0.4 }}
      className="flex items-center gap-2 text-[10px] bg-slate-50 rounded-md px-2 py-1.5 border border-slate-100"
    >
      <Icon className="w-3 h-3 text-slate-400 shrink-0" />
      <span className="text-slate-500 w-10 shrink-0">{label}</span>
      <span className="font-semibold text-slate-800 truncate">{value}</span>
      {active && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: delay + 0.2 }}
          className="ml-auto w-3 h-3 rounded-full bg-emerald-500 flex items-center justify-center"
        >
          <CheckCircle2 className="w-2 h-2 text-white" />
        </motion.span>
      )}
    </motion.div>
  );
}

function TreeRow({ indent, label, status, highlight }) {
  const statusMap = {
    ok:      { dot: '#10b981', text: 'text-slate-700' },
    fault:   { dot: '#ef4444', text: 'text-rose-700' },
    syncing: { dot: '#6366f1', text: 'text-indigo-700' },
    updated: { dot: '#10b981', text: 'text-emerald-700' },
  };
  const s = statusMap[status];
  return (
    <motion.div
      animate={{
        background: highlight ? (status === 'syncing' ? '#eef2ff' : status === 'updated' ? '#ecfdf5' : '#fef2f2') : 'transparent',
      }}
      className={`flex items-center gap-2 py-1 px-1.5 rounded ${s.text}`}
      style={{ paddingLeft: `${indent * 14 + 6}px` }}
    >
      <motion.span
        animate={{ scale: status === 'syncing' ? [1, 1.4, 1] : 1 }}
        transition={{ duration: 0.8, repeat: status === 'syncing' ? Infinity : 0 }}
        className="w-1.5 h-1.5 rounded-full shrink-0"
        style={{ background: s.dot }}
      />
      <span className="truncate font-sans">{label}</span>
      {status === 'syncing' && <span className="ml-auto text-[9px] font-sans text-indigo-600">syncing…</span>}
      {status === 'updated' && <span className="ml-auto text-[9px] font-sans text-emerald-600">updated</span>}
      {status === 'fault'   && <span className="ml-auto text-[9px] font-sans text-rose-600">fault</span>}
    </motion.div>
  );
}