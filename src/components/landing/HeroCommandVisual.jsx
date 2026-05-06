import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle2, Gauge, MapPin, ShieldCheck, Wrench, Zap } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis } from 'recharts';

const riskData = [
  { d: 'Mon', v: 28 }, { d: 'Tue', v: 35 }, { d: 'Wed', v: 44 },
  { d: 'Thu', v: 59 }, { d: 'Fri', v: 72 }, { d: 'Sat', v: 81 }, { d: 'Sun', v: 76 },
];

const alerts = [
  { asset: 'Haul truck HT-19', industry: 'Mining', risk: '92%', color: 'text-red-600 bg-red-50' },
  { asset: 'Tower crane TC-04', industry: 'Construction', risk: '88%', color: 'text-red-600 bg-red-50' },
  { asset: 'EV Van #284', industry: 'Fleet', risk: '81%', color: 'text-amber-600 bg-amber-50' },
];

export default function HeroCommandVisual() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 36, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.9, delay: 0.8 }}
      className="mt-14 relative max-w-6xl mx-auto"
    >
      <div className="absolute -inset-6 bg-primary/30 blur-3xl rounded-full" />
      <div className="relative rounded-[2rem] border border-white/60 bg-white/80 backdrop-blur-2xl shadow-2xl shadow-slate-900/15 overflow-hidden">
        <div className="h-11 border-b border-slate-200/70 bg-slate-50/80 flex items-center px-5 gap-2">
          <span className="w-3 h-3 rounded-full bg-red-400" />
          <span className="w-3 h-3 rounded-full bg-amber-400" />
          <span className="w-3 h-3 rounded-full bg-emerald-400" />
          <span className="ml-3 text-xs font-mono text-slate-500">assetstack.ai / global-command</span>
        </div>

        <div className="grid lg:grid-cols-[1fr_340px] gap-0">
          <div className="p-5 md:p-7 bg-gradient-to-br from-primary via-blue-800 to-slate-950 text-white min-h-[390px] relative overflow-hidden">
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)', backgroundSize: '42px 42px' }} />
            <div className="relative flex items-start justify-between gap-4 mb-7">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-100">Live risk layer</p>
                <h3 className="mt-2 text-2xl md:text-3xl font-black">Assets that need attention now</h3>
              </div>
              <div className="rounded-2xl bg-white/10 border border-white/15 px-4 py-3 text-right">
                <div className="text-2xl font-black text-blue-100">$4.8M</div>
                <div className="text-[10px] text-emerald-100/80 uppercase tracking-wider">preventable exposure</div>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-3 relative">
              {alerts.map((item, i) => (
                <motion.div
                  key={item.asset}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 + i * 0.12 }}
                  className="rounded-2xl bg-white/10 border border-white/10 backdrop-blur p-4"
                >
                  <div className="flex items-center justify-between mb-4">
                    <AlertTriangle className="w-5 h-5 text-amber-300" />
                    <span className={`px-2 py-1 rounded-full text-xs font-black ${item.color}`}>{item.risk}</span>
                  </div>
                  <div className="font-bold text-white text-sm">{item.asset}</div>
                  <div className="text-xs text-white/55 mt-1 flex items-center gap-1"><MapPin className="w-3 h-3" /> {item.industry}</div>
                </motion.div>
              ))}
            </div>

            <div className="relative mt-5 grid md:grid-cols-[1.2fr_0.8fr] gap-3">
              <div className="rounded-2xl bg-white/10 border border-white/10 backdrop-blur p-4 h-[160px]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold">Fleet-wide risk trend</span>
                  <Gauge className="w-4 h-4 text-indigo-300" />
                </div>
                <ResponsiveContainer width="100%" height={110}>
                  <AreaChart data={riskData}>
                    <defs>
                      <linearGradient id="heroRisk" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.7} />
                        <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="d" hide />
                    <YAxis hide domain={[0, 100]} />
                    <Area type="monotone" dataKey="v" stroke="#bfdbfe" strokeWidth={3} fill="url(#heroRisk)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="rounded-2xl bg-white/10 border border-white/10 backdrop-blur p-4">
                {[
                  ['AI scan completed', CheckCircle2],
                  ['Work order drafted', Wrench],
                  ['Savings evidence ready', ShieldCheck],
                ].map(([label, Icon], i) => (
                  <div key={label} className="flex items-center gap-2 py-2 text-sm text-white/90">
                    <Icon className="w-4 h-4 text-blue-100" /> {label}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="p-5 md:p-7 bg-white space-y-4">
            <div className="rounded-2xl border border-slate-200 p-4">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900"><Zap className="w-4 h-4 text-indigo-600" /> Next best action</div>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">Dispatch bearing inspection to the nearest qualified technician before predicted shutdown window.</p>
            </div>
            {[
              ['Detection accuracy', '94%'],
              ['Downtime reduction', '73%'],
              ['Audit coverage', '100%'],
              ['Average ROI payback', '31 days'],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
                <span className="text-sm text-slate-500">{label}</span>
                <span className="font-black text-slate-900">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}