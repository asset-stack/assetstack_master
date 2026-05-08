import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Calculator, ArrowRight, TrendingUp } from 'lucide-react';
import { Slider } from '@/components/ui/slider';

const fmtMoney = (n) => {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${Math.round(n / 1_000)}k`;
  return `$${Math.round(n)}`;
};

export default function ROICalculator() {
  const [assetCount, setAssetCount] = useState(1500);
  const [avgValue, setAvgValue] = useState(45000);

  const results = useMemo(() => {
    const portfolioValue = assetCount * avgValue;
    // Conservative AssetStack capability assumptions (illustrative, not guaranteed):
    // - 2.5% of portfolio value typically locked in deferred maintenance backlog
    // - 18% backlog reduction in year 1 via prioritisation
    // - 3% of portfolio value avoided in unplanned failures p.a.
    const backlog = portfolioValue * 0.025;
    const backlogReduction = backlog * 0.18;
    const failureAvoidance = portfolioValue * 0.03;
    const totalImpact = backlogReduction + failureAvoidance;
    return { portfolioValue, backlog, backlogReduction, failureAvoidance, totalImpact };
  }, [assetCount, avgValue]);

  return (
    <section id="roi" className="py-20 md:py-28 bg-gradient-to-br from-slate-50 via-white to-blue-50/30 border-y border-slate-100">
      <div className="max-w-[1100px] mx-auto px-5 md:px-8">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <Calculator className="w-3 h-3 text-primary" />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">Project your impact</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-semibold tracking-[-0.03em] leading-[1.05] text-slate-900 text-balance">
            What's hiding in <span className="font-serif italic font-medium text-primary">your portfolio?</span>
          </h2>
          <p className="mt-3 text-[15px] md:text-base text-slate-600 max-w-xl mx-auto">
            Slide your numbers — we'll show the value AssetStack can unlock in year one.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Inputs */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8 elevation-1">
            <h3 className="text-base font-bold text-slate-900 mb-6">Your portfolio</h3>

            <div className="mb-7">
              <div className="flex items-center justify-between mb-3">
                <label className="text-[13px] font-semibold text-slate-700">Number of assets</label>
                <span className="text-[15px] font-bold text-primary tabular-nums">{assetCount.toLocaleString()}</span>
              </div>
              <Slider value={[assetCount]} onValueChange={(v) => setAssetCount(v[0])} min={100} max={20000} step={100} />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1.5">
                <span>100</span><span>20,000</span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-[13px] font-semibold text-slate-700">Average asset value</label>
                <span className="text-[15px] font-bold text-primary tabular-nums">{fmtMoney(avgValue)}</span>
              </div>
              <Slider value={[avgValue]} onValueChange={(v) => setAvgValue(v[0])} min={5000} max={500000} step={1000} />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1.5">
                <span>$5k</span><span>$500k</span>
              </div>
            </div>

            <div className="mt-7 pt-6 border-t border-slate-100">
              <div className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold mb-1">Total portfolio value</div>
              <div className="text-2xl font-bold text-slate-900 tabular-nums">{fmtMoney(results.portfolioValue)}</div>
            </div>
          </div>

          {/* Results */}
          <motion.div
            key={results.totalImpact}
            initial={{ opacity: 0.7, scale: 0.99 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6 md:p-8 elevation-3"
          >
            <div className="flex items-center gap-2 mb-5">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-300">Projected year-one impact</span>
            </div>

            <div className="text-5xl md:text-6xl font-bold tabular-nums leading-none">
              {fmtMoney(results.totalImpact)}
            </div>
            <div className="text-[12px] text-slate-400 mt-2">unlocked across your portfolio</div>

            <div className="mt-6 space-y-3 pt-5 border-t border-white/10">
              <div className="flex items-center justify-between">
                <span className="text-[13px] text-slate-300">Backlog reduction</span>
                <span className="text-[14px] font-bold tabular-nums">{fmtMoney(results.backlogReduction)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[13px] text-slate-300">Avoided failures</span>
                <span className="text-[14px] font-bold tabular-nums">{fmtMoney(results.failureAvoidance)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[13px] text-slate-300">Tracked backlog exposure</span>
                <span className="text-[14px] font-bold tabular-nums text-amber-300">{fmtMoney(results.backlog)}</span>
              </div>
            </div>

            <a href="#contact" className="mt-7 inline-flex items-center gap-1.5 bg-white text-slate-900 px-5 py-3 rounded-lg text-[13px] font-bold hover:bg-slate-100 transition-colors">
              Book a demo on your data <ArrowRight className="w-4 h-4" />
            </a>

            <p className="mt-4 text-[10px] text-slate-500 leading-relaxed">
              Illustrative model based on industry benchmarks. Real outcomes depend on data quality and operational mix.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}