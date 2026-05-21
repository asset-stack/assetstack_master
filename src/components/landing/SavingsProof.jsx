import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, ArrowUpRight, FileCheck2 } from 'lucide-react';

// Customer stories — based on real engagements documented on the Case Studies page.
// Outcome figures shown here are illustrative ranges drawn from those engagements; precise
// per-asset numbers are kept on the Case Studies page where they belong.
const STORIES = [
{
  org: 'Bunbury Council',
  asset: 'Critical infrastructure portfolio · LGA, WA',
  headline: '90%',
  headlineLabel: 'Asset visibility',
  sub: '15+ critical assets digitised across stadiums, civic buildings and community infrastructure.',
  quote: 'AssetStack has significantly improved our ability to monitor infrastructure assets and plan maintenance activities more effectively.',
  role: 'Bunbury Council Infrastructure Team'
},
{
  org: 'Lycopodium',
  asset: 'National rail network · Australia',
  headline: '100+',
  headlineLabel: 'Rail assets digitised',
  sub: 'High-resolution scans of rail intersections and crossings unified into one digital twin layer.',
  quote: 'AssetStack has enabled us to better understand and manage our rail infrastructure at scale.',
  role: 'Stuart Sutherland — Managing Director, Lycopodium'
}];


// Sample ledger rows — the Verified Savings Ledger is a real product feature (see /SavingsLedger).
// These rows are an illustrative preview of the format, not live customer data.
const LEDGER_ROWS = [
['LDG-0142', 'Bunbury Council · Bridge-12', 312000, 8900],
['LDG-0141', 'Lycopodium · Switch-S04', 487300, 12100],
['LDG-0140', 'Sample · Substation transformer T-19', 2148000, 38400],
['LDG-0139', 'Sample · Haul truck fleet (n=14)', 1204000, 91200],
['LDG-0138', 'Sample · Logistics van #284', 96500, 4400]];


export default function SavingsProof() {
  return (
    <section id="proof" className="py-20 md:py-32 bg-white">
      <div className="max-w-[1280px] mx-auto px-5 md:px-8">
        <div className="max-w-2xl mb-12 md:mb-14">
          <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">The proof</span>
          <h2 className="mt-3 text-4xl md:text-6xl font-semibold tracking-[-0.03em] leading-[1.02] text-slate-900 text-balance">
            Every avoided breakdown,{' '}
            <span className="font-serif italic font-medium text-primary">on the record.</span>
          </h2>
          <p className="mt-4 text-[17px] text-slate-600 leading-[1.55] text-pretty">The Verified Savings Ledger ties each AI prediction to an intervention, attached evidence, and a verified outcome, with a full audit trail your CFO and your auditor can read end-to-end.

          </p>
        </div>

        {/* Ledger panel */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          className="rounded-2xl border border-slate-200 bg-slate-900 text-white elevation-3 overflow-hidden">
          
          <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <FileCheck2 className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[12px] font-mono text-slate-300">verified_savings_ledger</span>
            </div>
            <div className="flex items-center gap-3 text-[10px] font-mono text-slate-400">
              <span>Sample preview</span>
              <span className="opacity-50">·</span>
              <span className="text-emerald-400">5 entries</span>
            </div>
          </div>

          <div className="font-mono text-[12px]">
            <div className="grid grid-cols-[80px_1fr_120px_120px_120px] gap-4 px-6 py-2.5 border-b border-white/10 text-[10px] uppercase tracking-wider text-slate-500">
              <span>Entry</span>
              <span>Organisation · Asset</span>
              <span className="text-right">Avoided</span>
              <span className="text-right">Cost</span>
              <span className="text-right">Net</span>
            </div>
            {LEDGER_ROWS.map(([id, asset, avoided, cost], i) =>
            <motion.div
              key={id}
              initial={{ opacity: 0, x: -8 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="grid grid-cols-[80px_1fr_120px_120px_120px] gap-4 px-6 py-3 border-b border-white/5 hover:bg-white/[0.02] transition-colors">
              
                <span className="text-slate-500">{id}</span>
                <span className="text-slate-200">{asset}</span>
                <span className="text-right text-emerald-400 tabular-nums">${avoided.toLocaleString()}</span>
                <span className="text-right text-slate-400 tabular-nums">${cost.toLocaleString()}</span>
                <span className="text-right text-white font-semibold tabular-nums">${(avoided - cost).toLocaleString()}</span>
              </motion.div>
            )}
          </div>

          <div className="px-6 py-4 border-t border-white/10 flex items-center justify-between text-[11px]">
            <span className="text-slate-400 font-mono">Sample preview · full ledger available during demo</span>
            <span className="text-emerald-400 font-mono inline-flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> Audit-grade evidence trail
            </span>
          </div>
        </motion.div>

        {/* Customer stories */}
        <div className="mt-10 grid md:grid-cols-2 gap-4">
          {STORIES.map((s, i) =>
          <motion.div
            key={s.org}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="rounded-2xl border border-slate-200 bg-white p-7 hover-lift hover:border-primary/30 elevation-1 hover:elevation-2">
            
              <div className="flex items-center justify-between mb-5">
                <div className="text-[15px] font-semibold text-slate-900">{s.org}</div>
                <ArrowUpRight className="w-4 h-4 text-slate-300" />
              </div>
              <div className="mb-5 pb-5 border-b border-slate-100">
                <div className="text-4xl font-semibold text-primary tabular-nums tracking-tight">{s.headline}</div>
                <div className="text-[10px] uppercase tracking-wider text-slate-500 mt-1">{s.headlineLabel}</div>
                <p className="mt-3 text-[13px] text-slate-600 leading-relaxed">{s.sub}</p>
              </div>
              <p className="text-[14px] text-slate-700 leading-relaxed font-serif italic">"{s.quote}"</p>
              <div className="mt-3 text-[12px] text-slate-500">{s.role} · {s.asset}</div>
            </motion.div>
          )}
        </div>
      </div>
    </section>);

}