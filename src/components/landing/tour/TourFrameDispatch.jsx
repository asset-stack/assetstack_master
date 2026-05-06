import React from 'react';
import { motion } from 'framer-motion';
import { Wrench, Smartphone, CheckCircle2, MapPin } from 'lucide-react';

export default function TourFrameDispatch() {
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center">
            <Wrench className="w-3.5 h-3.5 text-primary" />
          </div>
          <span className="text-[12px] font-semibold text-slate-900">Auto-Dispatch · WO-2841</span>
        </div>
        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
          <CheckCircle2 className="w-3 h-3" /> Accepted in 18s
        </span>
      </div>

      <div className="flex-1 grid md:grid-cols-[1fr_280px] p-5 gap-5">
        {/* Left — work order draft */}
        <div className="rounded-lg border border-slate-100 bg-slate-50/30 p-4 space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Work order · Auto-generated</div>
              <div className="mt-1 text-[15px] font-semibold text-slate-900 tracking-tight">Bearing inspection — TC-04</div>
            </div>
            <span className="text-[10px] font-mono text-slate-400">WO-2841</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[12px]">
            {[
              ['Priority', 'High', 'text-rose-600'],
              ['Window', 'Tue 06:00–10:00', 'text-slate-900'],
              ['Estimated', '3.5 hours', 'text-slate-900'],
              ['Site', 'Site A · Bay 4', 'text-slate-900'],
            ].map(([k, v, c]) => (
              <div key={k} className="rounded-md border border-slate-100 bg-white p-2">
                <div className="text-[10px] text-slate-400 uppercase tracking-wider">{k}</div>
                <div className={`font-semibold ${c}`}>{v}</div>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-100">
            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400 mb-1.5">Parts staged</div>
            <div className="flex flex-wrap gap-1.5">
              {['SKF-6209', 'Lubricant ISO-VG-46', 'Torque seal', 'Bolt M16×60'].map((p, i) => (
                <motion.span
                  key={p}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.08 }}
                  className="text-[11px] font-mono text-slate-700 bg-white border border-slate-100 px-2 py-0.5 rounded"
                >
                  {p}
                </motion.span>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400 mb-1.5">Best-fit technician</div>
            <div className="flex items-center gap-2.5">
              <img src="https://i.pravatar.cc/64?img=12" alt="" className="w-9 h-9 rounded-full" />
              <div>
                <div className="text-[13px] font-semibold text-slate-900">Marcus T.</div>
                <div className="text-[11px] text-slate-500 flex items-center gap-1"><MapPin className="w-3 h-3" /> 1.4 km · Senior · Bearings</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right — phone mock */}
        <div className="flex items-center justify-center">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="relative w-[200px] h-[400px] rounded-[36px] bg-slate-900 p-2 elevation-3"
          >
            <div className="w-full h-full rounded-[28px] bg-white overflow-hidden flex flex-col">
              <div className="h-6 bg-slate-50 flex items-center justify-center">
                <div className="w-12 h-1 rounded-full bg-slate-300" />
              </div>
              <div className="px-3 py-3 border-b border-slate-100">
                <div className="flex items-center gap-1.5">
                  <Smartphone className="w-3 h-3 text-primary" />
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">New work order</span>
                </div>
                <div className="mt-1 text-[12px] font-semibold text-slate-900">Bearing inspection</div>
                <div className="text-[10px] text-slate-500">TC-04 · Site A · 06:00</div>
              </div>
              <div className="flex-1 p-3 space-y-2">
                {['Inspect bearing assembly', 'Check vibration sig.', 'Replace SKF-6209', 'Capture photo evidence'].map((t, i) => (
                  <motion.div
                    key={t}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 + i * 0.1 }}
                    className="flex items-center gap-2 text-[10px]"
                  >
                    <div className="w-3 h-3 rounded-full border border-slate-300" />
                    <span className="text-slate-700">{t}</span>
                  </motion.div>
                ))}
              </div>
              <motion.div
                initial={{ y: 60, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1.4, duration: 0.4 }}
                className="m-3 h-9 rounded-lg bg-primary text-white text-[11px] font-semibold flex items-center justify-center gap-1"
              >
                <CheckCircle2 className="w-3 h-3" /> Accept work order
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}