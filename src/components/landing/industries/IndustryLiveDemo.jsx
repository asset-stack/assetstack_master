import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend
} from 'recharts';
import {
  AlertTriangle, CheckCircle2, Activity, Sparkles, ArrowRight, TrendingDown, Zap, Wrench, ShieldCheck
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { INDUSTRY_DEMOS } from './demos/industryDemoData';

const fmtMoney = (n) => {
  if (!Number.isFinite(n)) return '$0';
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}k`;
  return `$${Math.round(n)}`;
};

const riskBadge = (r) =>
  r >= 80 ? 'bg-red-100 text-red-700' :
  r >= 60 ? 'bg-amber-100 text-amber-700' :
  r >= 40 ? 'bg-yellow-100 text-yellow-700' :
  'bg-emerald-100 text-emerald-700';

const conditionLabel = (c) =>
  c <= 1 ? 'C1 Excellent' :
  c === 2 ? 'C2 Good' :
  c === 3 ? 'C3 Fair' :
  c === 4 ? 'C4 Poor' : 'C5 Failed';

export default function IndustryLiveDemo({ slug }) {
  const demo = INDUSTRY_DEMOS[slug];
  const [selectedIdx, setSelectedIdx] = useState(0);

  const summary = useMemo(() => {
    if (!demo) return null;
    const totalCRC = demo.assets.reduce((s, a) => s + a.crc, 0);
    const highRisk = demo.assets.filter((a) => a.risk >= 70).length;
    const avgRisk = demo.assets.reduce((s, a) => s + a.risk, 0) / demo.assets.length;
    return { totalCRC, highRisk, avgRisk: Math.round(avgRisk), count: demo.assets.length };
  }, [demo]);

  if (!demo) return null;
  const Icon = demo.icon;
  const selected = demo.assets[selectedIdx];

  return (
    <section className="py-12 bg-gradient-to-b from-slate-50 to-white border-y border-slate-200">
      <div className="max-w-[1280px] mx-auto px-5 md:px-8">
        {/* Demo header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
          className="mb-6 flex items-center justify-between gap-4 flex-wrap"
        >
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${demo.accent} flex items-center justify-center text-white shadow-lg`}>
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">Live demo</div>
              <h4 className="text-xl md:text-2xl font-bold text-slate-900 leading-tight max-w-2xl">
                {demo.headline}
              </h4>
              <div className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                <Activity className="w-3 h-3" /> {demo.sample}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Demo dashboard */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, delay: 0.05 }}
          className="rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-900/5 overflow-hidden"
        >
          {/* KPI strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 border-b border-slate-100">
            <div className="p-4 border-r border-slate-100">
              <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Assets in view</div>
              <div className="text-xl font-bold text-slate-900 tabular-nums mt-1">{summary.count}</div>
            </div>
            <div className="p-4 md:border-r border-slate-100">
              <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Replacement value</div>
              <div className="text-xl font-bold text-slate-900 tabular-nums mt-1">{fmtMoney(summary.totalCRC)}</div>
            </div>
            <div className="p-4 border-r border-slate-100 border-t md:border-t-0">
              <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">High-risk assets</div>
              <div className="text-xl font-bold text-amber-600 tabular-nums mt-1">{summary.highRisk}</div>
            </div>
            <div className={`p-4 border-t md:border-t-0 bg-gradient-to-br ${demo.accent} text-white`}>
              <div className="text-[10px] uppercase tracking-wider text-white/80 font-semibold">{demo.kpi.label}</div>
              <div className="text-xl font-bold tabular-nums mt-1">{demo.kpi.value}</div>
              <div className="text-[10px] text-white/80 mt-0.5">{demo.kpi.sub}</div>
            </div>
          </div>

          {/* Body */}
          <div className="grid lg:grid-cols-[1fr_1.1fr]">
            {/* Asset list */}
            <div className="p-5 border-r border-slate-100">
              <div className="flex items-center justify-between mb-3">
                <h5 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> AI-ranked asset risk
                </h5>
                <Badge variant="outline" className="text-[10px]">Live</Badge>
              </div>
              <div className="space-y-2">
                {demo.assets.map((a, i) => {
                  const active = i === selectedIdx;
                  return (
                    <button
                      key={a.name}
                      onClick={() => setSelectedIdx(i)}
                      className={`w-full text-left p-3 rounded-lg border transition-all ${
                        active ? 'border-slate-900 bg-slate-50 shadow-sm' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${a.risk >= 70 ? 'bg-red-50' : 'bg-emerald-50'}`}>
                          {a.risk >= 70 ? <AlertTriangle className="w-3.5 h-3.5 text-red-600" /> : <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-sm font-semibold text-slate-900 truncate">{a.name}</span>
                            <Badge className={`${riskBadge(a.risk)} border-0 text-[10px] tabular-nums`}>{a.risk}%</Badge>
                          </div>
                          <div className="text-[11px] text-slate-500 truncate mt-0.5">{a.location}</div>
                          <div className="mt-1.5 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <motion.div
                              key={`${a.name}-${active}`}
                              initial={{ width: 0 }}
                              animate={{ width: `${a.risk}%` }}
                              transition={{ duration: 0.6, delay: i * 0.04 }}
                              className={`h-full rounded-full bg-gradient-to-r ${demo.accent}`}
                            />
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right pane: detail + chart + workflow */}
            <div className="p-5 bg-slate-50/40 space-y-4">
              {/* Selected detail */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={selected.name}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                  className="bg-white rounded-xl border border-slate-200 p-4"
                >
                  <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                    <h5 className="text-sm font-bold text-slate-900">{selected.name}</h5>
                    <Badge className={`${riskBadge(selected.risk)} border-0 text-[10px]`}>Risk {selected.risk}%</Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center mb-3">
                    <div className="rounded-lg bg-slate-50 p-2">
                      <div className="text-[9px] uppercase text-slate-500">Condition</div>
                      <div className="text-xs font-bold text-slate-900 mt-0.5">{conditionLabel(selected.condition)}</div>
                    </div>
                    <div className="rounded-lg bg-slate-50 p-2">
                      <div className="text-[9px] uppercase text-slate-500">CRC</div>
                      <div className="text-xs font-bold text-slate-900 mt-0.5 tabular-nums">{fmtMoney(selected.crc)}</div>
                    </div>
                    <div className="rounded-lg bg-slate-50 p-2">
                      <div className="text-[9px] uppercase text-slate-500">Location</div>
                      <div className="text-xs font-bold text-slate-900 mt-0.5 truncate">{selected.location}</div>
                    </div>
                  </div>
                  <div className="rounded-lg bg-slate-900 text-white px-3 py-2.5 flex items-center gap-2">
                    <Wrench className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <div className="text-xs font-semibold flex-1">{selected.action}</div>
                    <ArrowRight className="w-3.5 h-3.5 text-white/60" />
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Backlog / spend chart */}
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <TrendingDown className="w-3.5 h-3.5 text-emerald-600" /> Backlog reduction trajectory
                  </h5>
                </div>
                <div className="h-[160px]">
                  <ResponsiveContainer>
                    <ComposedChart data={demo.chart} margin={{ top: 5, right: 6, bottom: 0, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                      <XAxis dataKey="year" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 11 }} />
                      <Legend wrapperStyle={{ fontSize: 10 }} iconSize={8} />
                      <Bar dataKey="spent" name="Spent" fill="#10b981" radius={[3, 3, 0, 0]} />
                      <Line type="monotone" dataKey="backlog" name="Backlog" stroke="#ef4444" strokeWidth={2} dot={false} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Workflow */}
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <h5 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-indigo-600" /> Outcome workflow
                </h5>
                <div className="space-y-2">
                  {demo.workflow.map((step, i) => {
                    const last = i === demo.workflow.length - 1;
                    return (
                      <div key={step} className="flex items-center gap-2">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                          last ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {last ? <ShieldCheck className="w-3 h-3" /> : i + 1}
                        </div>
                        <span className="text-xs text-slate-700 font-medium">{step}</span>
                      </div>
                    );
                  })}
                </div>
                <Link
                  to={demo.cta.href}
                  className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-700 hover:gap-2.5 transition-all"
                >
                  {demo.cta.label}
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}