import React from 'react';
import { motion } from 'framer-motion';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis } from 'recharts';
import { Activity, AlertTriangle, CheckCircle2, ShieldCheck, Wrench, Zap } from 'lucide-react';

const riskTrend = [
  { d: 'Mon', v: 28 }, { d: 'Tue', v: 35 }, { d: 'Wed', v: 44 },
  { d: 'Thu', v: 59 }, { d: 'Fri', v: 72 }, { d: 'Sat', v: 81 }, { d: 'Sun', v: 76 },
];

const alerts = [
  { asset: 'Tower crane TC-04', site: 'Site A · Construction', risk: 92, eta: '8d' },
  { asset: 'Haul truck HT-19', site: 'Mine B · Mining', risk: 88, eta: '14d' },
  { asset: 'Conveyor C-227', site: 'Plant 3 · Manufacturing', risk: 74, eta: '22d' },
];

export default function HeroProductCanvas() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="mt-16 md:mt-20 relative max-w-[1180px] mx-auto"
    >
      {/* Soft glow */}
      <div className="absolute -inset-x-12 -inset-y-8 -z-10 bg-gradient-to-b from-primary/15 via-blue-200/30 to-transparent blur-3xl rounded-full" />

      {/* Browser chrome */}
      <div className="relative rounded-2xl border border-slate-200/80 bg-white elevation-3 overflow-hidden">
        <div className="h-10 border-b border-slate-100 bg-slate-50/60 flex items-center px-4 gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-300" />
          <span className="w-2.5 h-2.5 rounded-full bg-amber-300" />
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-300" />
          <span className="ml-3 text-[11px] font-mono text-slate-400">assetstack.ai / command-center</span>
          <div className="ml-auto flex items-center gap-1.5 text-[11px] font-medium text-emerald-600">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500 opacity-75 animate-ping" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
            </span>
            Live
          </div>
        </div>

        <div className="grid lg:grid-cols-[1.6fr_1fr]">
          {/* Left — risk command */}
          <div className="p-5 md:p-7 border-b lg:border-b-0 lg:border-r border-slate-100">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">Live risk layer</p>
                <h3 className="mt-1.5 text-xl md:text-2xl font-semibold tracking-tight text-slate-900">Assets needing attention now</h3>
              </div>
              <div className="rounded-lg border border-slate-100 px-3 py-2 text-right bg-slate-50/40">
                <div className="text-xl font-semibold tabular-nums text-slate-900">$4.8M</div>
                <div className="text-[10px] text-slate-500 uppercase tracking-wider">exposure</div>
              </div>
            </div>

            <div className="space-y-2">
              {alerts.map((item, i) => (
                <motion.div
                  key={item.asset}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + i * 0.1 }}
                  className="flex items-center gap-3 rounded-lg border border-slate-100 hover:border-slate-200 hover:bg-slate-50/40 px-3 py-3 transition-colors"
                >
                  <div className="w-8 h-8 rounded-md bg-rose-50 flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-4 h-4 text-rose-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-[13px] text-slate-900 truncate">{item.asset}</div>
                    <div className="text-[11px] text-slate-500 truncate">{item.site}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-[13px] font-semibold tabular-nums text-rose-600">{item.risk}%</div>
                    <div className="text-[10px] text-slate-400 tabular-nums">in {item.eta}</div>
                  </div>
                  <div className="hidden md:block w-20 h-9 shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={riskTrend}>
                        <defs>
                          <linearGradient id={`spark-${i}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.5} />
                            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="d" hide /> <YAxis hide domain={[0, 100]} />
                        <Area type="monotone" dataKey="v" stroke="hsl(var(--primary))" strokeWidth={1.5} fill={`url(#spark-${i})`} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-6 rounded-lg border border-primary/15 bg-primary/[0.04] p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                  <Zap className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">Next best action</div>
                  <p className="mt-1 text-[13px] text-slate-700 leading-relaxed">
                    Dispatch bearing inspection on TC-04 within 48h — predicted savings <span className="font-semibold text-slate-900 tabular-nums">$182,400</span>.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right — KPIs */}
          <div className="p-5 md:p-7 bg-slate-50/40">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-3.5 h-3.5 text-primary" />
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">Operational metrics</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                ['Detection accuracy', '94%', CheckCircle2],
                ['Downtime reduced', '73%', Wrench],
                ['Audit coverage', '100%', ShieldCheck],
                ['ROI payback', '31d', Zap],
              ].map(([label, value, Icon]) => (
                <div key={label} className="rounded-lg border border-slate-100 bg-white p-3">
                  <Icon className="w-3.5 h-3.5 text-primary mb-2" />
                  <div className="text-lg font-semibold tabular-nums text-slate-900 tracking-tight">{value}</div>
                  <div className="text-[11px] text-slate-500">{label}</div>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-lg border border-slate-100 bg-white p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-medium text-slate-600">Fleet risk · 7d</span>
                <span className="text-[11px] font-mono text-slate-400">↗ 2.3%</span>
              </div>
              <div className="h-16">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={riskTrend}>
                    <defs>
                      <linearGradient id="heroFleet" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="d" hide /> <YAxis hide domain={[0, 100]} />
                    <Area type="monotone" dataKey="v" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#heroFleet)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}