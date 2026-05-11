import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Eye } from 'lucide-react';

const findings = [
  { id: 'corrosion', label: 'Corrosion', conf: 96, x: '18%', y: '32%', w: '22%', h: '18%' },
  { id: 'crack', label: 'Crack · 14mm', conf: 91, x: '54%', y: '48%', w: '18%', h: '12%' },
  { id: 'wear', label: 'Surface wear', conf: 84, x: '32%', y: '68%', w: '26%', h: '14%' },
];

export default function TourFrameScan() {
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center">
            <Eye className="w-3.5 h-3.5 text-primary" />
          </div>
          <span className="text-[12px] font-semibold text-slate-900">Condition Scan · IMG_2841.jpg</span>
        </div>
        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
          <Sparkles className="w-3 h-3" /> Analyzed in 1.4s
        </span>
      </div>

      <div className="flex-1 grid md:grid-cols-[1fr_280px]">
        {/* Image with bboxes */}
        <div className="relative bg-slate-100 overflow-hidden min-h-[300px]">
          <img
            src="https://media.base44.com/images/public/6970c68cc08dbe7897c72f22/05fadbcb2_generated_image.png"
            alt="Corroded industrial water pump under AI inspection"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-slate-900/10" />

          {/* Scan line */}
          <motion.div
            initial={{ y: '-10%' }}
            animate={{ y: '110%' }}
            transition={{ duration: 1.6, delay: 0.2, ease: 'easeInOut' }}
            className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent shadow-[0_0_24px_4px_hsl(var(--primary)/0.6)]"
          />

          {findings.map((f, i) => (
            <motion.div
              key={f.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.7 + i * 0.2, duration: 0.4 }}
              className="absolute border-2 border-primary rounded-md"
              style={{ left: f.x, top: f.y, width: f.w, height: f.h }}
            >
              <span className="absolute -top-6 left-0 inline-flex items-center gap-1 text-[10px] font-semibold text-white bg-primary px-1.5 py-0.5 rounded whitespace-nowrap">
                {f.label} · {f.conf}%
              </span>
            </motion.div>
          ))}
        </div>

        {/* Findings list */}
        <div className="border-t md:border-t-0 md:border-l border-slate-100 p-4 space-y-2.5">
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Findings (3)</div>
          {findings.map((f, i) => (
            <motion.div
              key={f.id}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.9 + i * 0.2 }}
              className="rounded-lg border border-slate-100 p-3 bg-white"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[12px] font-semibold text-slate-900">{f.label}</span>
                <span className="text-[10px] tabular-nums font-mono text-primary bg-primary/5 px-1.5 py-0.5 rounded">{f.conf}%</span>
              </div>
              <div className="h-1 rounded-full bg-slate-100 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${f.conf}%` }}
                  transition={{ delay: 2.1 + i * 0.2, duration: 0.6 }}
                  className="h-full bg-primary"
                />
              </div>
            </motion.div>
          ))}
          <div className="pt-2 mt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-500">Severity</span>
            <span className="font-semibold text-rose-600">Major · Action required</span>
          </div>
        </div>
      </div>
    </div>
  );
}