import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Hash, FileText } from 'lucide-react';

const ledger = [
  { id: 'LDG-2841', asset: 'TC-04', avoided: 182400, cost: 4200, hash: '0x9f4a…b2c1' },
  { id: 'LDG-2839', asset: 'HT-19', avoided: 96800, cost: 7100, hash: '0x4c8d…f019' },
  { id: 'LDG-2837', asset: 'C-227', avoided: 41250, cost: 2800, hash: '0x71ee…a44b' },
];

function Counter({ to, duration = 1500, prefix = '' }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    const start = performance.now();
    let raf;
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.floor(eased * to));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to, duration]);
  return <span className="tabular-nums">{prefix}{n.toLocaleString()}</span>;
}

export default function TourFrameSavings() {
  const total = ledger.reduce((s, r) => s + (r.avoided - r.cost), 0);
  return (
    <div className="h-full flex flex-col font-mono">
      <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center">
            <ShieldCheck className="w-3.5 h-3.5 text-primary" />
          </div>
          <span className="text-[12px] font-semibold text-slate-900 font-sans">Verified Savings Ledger</span>
        </div>
        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-sans">
          <ShieldCheck className="w-3 h-3" /> Audit-signed
        </span>
      </div>

      <div className="flex-1 p-5 space-y-4">
        {/* Big number */}
        <div className="rounded-lg border border-primary/15 bg-gradient-to-br from-primary/[0.04] to-transparent p-5">
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary font-sans">Net savings · Q2 2026</div>
          <div className="mt-2 text-4xl md:text-5xl font-semibold text-slate-900 tracking-tight">
            $<Counter to={total} />
          </div>
          <div className="mt-1 text-[12px] text-slate-500 font-sans">
            From 3 verified preventions · signed by 2 reviewers
          </div>
        </div>

        {/* Ledger rows */}
        <div className="rounded-lg border border-slate-100 overflow-hidden">
          <div className="grid grid-cols-[100px_60px_1fr_1fr_auto] gap-3 px-3 py-2 bg-slate-50/60 border-b border-slate-100 text-[10px] font-semibold uppercase tracking-wider text-slate-500 font-sans">
            <span>Entry</span>
            <span>Asset</span>
            <span className="text-right">Avoided</span>
            <span className="text-right">Cost</span>
            <span className="text-right pr-1">Hash</span>
          </div>
          {ledger.map((row, i) => (
            <motion.div
              key={row.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.12 }}
              className="grid grid-cols-[100px_60px_1fr_1fr_auto] gap-3 px-3 py-2.5 text-[12px] border-b border-slate-100 last:border-b-0 hover:bg-slate-50/40 transition-colors items-center"
            >
              <span className="text-slate-500">{row.id}</span>
              <span className="font-semibold text-slate-900">{row.asset}</span>
              <span className="text-right text-emerald-600 font-semibold tabular-nums">${row.avoided.toLocaleString()}</span>
              <span className="text-right text-slate-500 tabular-nums">${row.cost.toLocaleString()}</span>
              <span className="text-right text-slate-400 inline-flex items-center gap-1 justify-end">
                <Hash className="w-3 h-3" /> {row.hash}
              </span>
            </motion.div>
          ))}
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-400 font-sans">
          <div className="flex items-center gap-1.5">
            <FileText className="w-3 h-3" />
            Every row links to source evidence (photo, sensor trace, inspection report).
          </div>
          <span className="font-mono">SHA-256 · v2.1</span>
        </div>
      </div>
    </div>
  );
}