import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, TrendingDown, FileText, Download } from 'lucide-react';

/**
 * Executive Reporting preview — board-level KPI dashboard with portfolio
 * health, capital forecast, and compliance status.
 */

const KPIS = [
  { label: 'Portfolio value',  value: '$1.84B', delta: '+2.4%',  positive: true  },
  { label: 'Avg health index', value: '78',     delta: '+3 pts', positive: true  },
  { label: 'Backlog cost',     value: '$12.4M', delta: '-8.1%',  positive: true  },
  { label: 'Compliance',       value: '96%',    delta: '+1.2%',  positive: true  },
];

const SPEND_BARS = [
  { y: 'FY24', planned: 70, actual: 62 },
  { y: 'FY25', planned: 85, actual: 79 },
  { y: 'FY26', planned: 92, actual: 88 },
  { y: 'FY27', planned: 78, actual: null },
  { y: 'FY28', planned: 65, actual: null },
];

export default function ExecutiveReportingPreview() {
  return (
    <div className="h-full w-full bg-white flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-sky-500 to-cyan-600 text-white flex items-center justify-center">
          <BarChart3 className="w-3.5 h-3.5" />
        </div>
        <div>
          <div className="text-[12px] font-semibold text-slate-900 leading-none">Executive dashboard</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Q2 FY26 · Board pack</div>
        </div>
        <button className="ml-auto flex items-center gap-1 text-[9px] text-slate-600 bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded font-semibold">
          <Download className="w-2.5 h-2.5" /> Export PDF
        </button>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-4 gap-2 p-3">
        {KPIS.map((k, i) => (
          <motion.div
            key={k.label}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="rounded-lg border border-slate-200 bg-slate-50/60 p-2"
          >
            <div className="text-[8px] uppercase tracking-wider text-slate-500 font-semibold truncate">{k.label}</div>
            <div className="text-[13px] font-bold text-slate-900 tabular-nums mt-0.5">{k.value}</div>
            <div className={`text-[9px] font-semibold flex items-center gap-0.5 mt-0.5 ${k.positive ? 'text-emerald-600' : 'text-rose-600'}`}>
              {k.positive ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
              {k.delta}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Capital forecast chart */}
      <div className="px-3 pb-3 flex-1 min-h-0">
        <div className="rounded-lg border border-slate-200 bg-white p-3 h-full flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Capital spend forecast</div>
            <div className="flex items-center gap-2 text-[9px]">
              <span className="flex items-center gap-1 text-slate-600">
                <span className="w-2 h-2 rounded-sm bg-slate-300" /> Planned
              </span>
              <span className="flex items-center gap-1 text-slate-600">
                <span className="w-2 h-2 rounded-sm bg-sky-500" /> Actual
              </span>
            </div>
          </div>

          <div className="flex-1 flex items-end gap-2 min-h-0">
            {SPEND_BARS.map((b, i) => (
              <div key={b.y} className="flex-1 flex flex-col items-center gap-1 h-full">
                <div className="flex-1 w-full flex items-end gap-0.5 min-h-0">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${b.planned}%` }}
                    transition={{ delay: 0.2 + i * 0.08, duration: 0.6, ease: 'easeOut' }}
                    className="flex-1 bg-slate-200 rounded-t"
                  />
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: b.actual ? `${b.actual}%` : '0%' }}
                    transition={{ delay: 0.4 + i * 0.08, duration: 0.6, ease: 'easeOut' }}
                    className="flex-1 bg-sky-500 rounded-t"
                  />
                </div>
                <span className="text-[8px] text-slate-500 font-mono">{b.y}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Report row */}
      <div className="px-3 pb-3">
        <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-2 flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
            <FileText className="w-3 h-3" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[10px] font-semibold text-slate-900 truncate">ISO 55000 Asset Management Report</div>
            <div className="text-[9px] text-slate-500">Generated 2 hrs ago · 47 pages · Audit-ready</div>
          </div>
          <span className="text-[8px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded shrink-0">
            Signed off
          </span>
        </div>
      </div>
    </div>
  );
}