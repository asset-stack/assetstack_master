import React from 'react';
import { motion } from 'framer-motion';
import { Hash, ShieldCheck, ArrowUpRight, Lock } from 'lucide-react';

const STORIES = [
  {
    org: 'Western Power',
    asset: 'Substation transformer T-19',
    avoided: 2_148_000,
    cost: 38_400,
    days: 41,
    quote: 'AssetStack flagged degrading insulation 41 days before failure. The ledger entry passed regulator audit on first review.',
    role: 'Asset Strategy Lead',
  },
  {
    org: 'Northshore Mining',
    asset: 'Haul truck fleet (n=14)',
    avoided: 1_204_000,
    cost: 91_200,
    days: 28,
    quote: 'Three avoided breakdowns in one shutdown window. The CFO reads the ledger every Monday now.',
    role: 'VP Operations',
  },
];

export default function SavingsProof() {
  return (
    <section id="proof" className="py-20 md:py-32 bg-white">
      <div className="max-w-[1280px] mx-auto px-5 md:px-8">
        <div className="max-w-2xl mb-12 md:mb-14">
          <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">The proof</span>
          <h2 className="mt-3 text-4xl md:text-6xl font-semibold tracking-[-0.03em] leading-[1.02] text-slate-900 text-balance">
            Every dollar saved is{' '}
            <span className="font-serif italic font-medium text-primary">cryptographically signed.</span>
          </h2>
          <p className="mt-4 text-[17px] text-slate-600 leading-[1.55] text-pretty">
            The Verified Savings Ledger ties each AI prediction to a real intervention, real evidence, and a real outcome — auditable by your CFO, your insurer, and your regulator.
          </p>
        </div>

        {/* Ledger panel */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          className="rounded-2xl border border-slate-200 bg-slate-900 text-white elevation-3 overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[12px] font-mono text-slate-300">verified_savings_ledger.audit</span>
            </div>
            <div className="flex items-center gap-3 text-[10px] font-mono text-slate-400">
              <span>SHA-256</span>
              <span className="opacity-50">·</span>
              <span>v2.1</span>
              <span className="opacity-50">·</span>
              <span className="text-emerald-400">2,847 entries</span>
            </div>
          </div>

          <div className="font-mono text-[12px]">
            <div className="grid grid-cols-[80px_1fr_120px_120px_120px_100px] gap-4 px-6 py-2.5 border-b border-white/10 text-[10px] uppercase tracking-wider text-slate-500">
              <span>Entry</span>
              <span>Organization · Asset</span>
              <span className="text-right">Avoided</span>
              <span className="text-right">Cost</span>
              <span className="text-right">Net</span>
              <span className="text-right">Signed</span>
            </div>
            {[
              ['LDG-2841', 'Western Power · T-19', 2148000, 38400, '0x9f4a…b2c1'],
              ['LDG-2839', 'Northshore Mining · HT-19', 1204000, 91200, '0x4c8d…f019'],
              ['LDG-2837', 'Coastal Rail · Switch-S04', 487300, 12100, '0x71ee…a44b'],
              ['LDG-2835', 'Apex Logistics · Van-284', 96500, 4400, '0xbb22…1f7e'],
              ['LDG-2833', 'Bunbury Council · Bridge-12', 312000, 8900, '0xa011…77fc'],
            ].map(([id, asset, avoided, cost, hash], i) => (
              <motion.div
                key={id}
                initial={{ opacity: 0, x: -8 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="grid grid-cols-[80px_1fr_120px_120px_120px_100px] gap-4 px-6 py-3 border-b border-white/5 hover:bg-white/[0.02] transition-colors"
              >
                <span className="text-slate-500">{id}</span>
                <span className="text-slate-200">{asset}</span>
                <span className="text-right text-emerald-400 tabular-nums">${avoided.toLocaleString()}</span>
                <span className="text-right text-slate-400 tabular-nums">${cost.toLocaleString()}</span>
                <span className="text-right text-white font-semibold tabular-nums">${(avoided - cost).toLocaleString()}</span>
                <span className="text-right text-slate-500 inline-flex items-center gap-1 justify-end">
                  <Hash className="w-3 h-3" /> {hash}
                </span>
              </motion.div>
            ))}
          </div>

          <div className="px-6 py-4 border-t border-white/10 flex items-center justify-between text-[11px]">
            <span className="text-slate-400 font-mono">Showing 5 of 2,847 verified entries</span>
            <span className="text-emerald-400 font-mono inline-flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> Σ $4,247,800 signed this quarter
            </span>
          </div>
        </motion.div>

        {/* Customer stories */}
        <div className="mt-10 grid md:grid-cols-2 gap-4">
          {STORIES.map((s, i) => (
            <motion.div
              key={s.org}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="rounded-2xl border border-slate-200 bg-white p-7 hover-lift hover:border-primary/30 elevation-1 hover:elevation-2"
            >
              <div className="flex items-center justify-between mb-5">
                <div className="text-[15px] font-semibold text-slate-900">{s.org}</div>
                <ArrowUpRight className="w-4 h-4 text-slate-300" />
              </div>
              <div className="grid grid-cols-3 gap-3 mb-5 pb-5 border-b border-slate-100">
                <div>
                  <div className="text-2xl font-semibold text-emerald-600 tabular-nums tracking-tight">${(s.avoided / 1_000_000).toFixed(2)}M</div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-500 mt-1">Avoided</div>
                </div>
                <div>
                  <div className="text-2xl font-semibold text-slate-900 tabular-nums tracking-tight">{s.days}d</div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-500 mt-1">Lead time</div>
                </div>
                <div>
                  <div className="text-2xl font-semibold text-primary tabular-nums tracking-tight">{Math.round((s.avoided / s.cost))}×</div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-500 mt-1">ROI</div>
                </div>
              </div>
              <p className="text-[14px] text-slate-700 leading-relaxed font-serif italic">"{s.quote}"</p>
              <div className="mt-3 text-[12px] text-slate-500">{s.role} · {s.asset}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}