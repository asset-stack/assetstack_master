import React from 'react';
import { TrendingUp, TrendingDown, Minus, Info } from 'lucide-react';
import { fmtMoney } from '@/lib/assetMetrics';

/**
 * Industry-standard CFO ratios for asset registers (IPWEA / AAS27 / ISO 55000).
 * - Sustainability Ratio: Annual capex spend ÷ Annual depreciation. Healthy ≥ 90%.
 * - Asset Consumption Ratio: WDV ÷ CRC. <40% = ageing portfolio. >70% = healthy.
 * - Backlog Ratio: Defect cost ÷ CRC. <2% healthy, 2–5% caution, >5% critical.
 * - Renewal Gap: Required renewals ÷ Available capital. <100% = funded.
 */
export default function CFORatios({ crc, wdv, depreciation, capexSpend, defectCost, requiredRenewal, availableCapital }) {
  const sustainability = depreciation > 0 ? Math.round((capexSpend / depreciation) * 100) : null;
  const consumption = crc > 0 ? Math.round((wdv / crc) * 100) : null;
  const backlog = crc > 0 ? +((defectCost / crc) * 100).toFixed(2) : null;
  const renewalGap = availableCapital > 0 ? Math.round((requiredRenewal / availableCapital) * 100) : null;

  const ratios = [
    {
      label: 'Sustainability Ratio',
      value: sustainability != null ? `${sustainability}%` : '—',
      sub: `${fmtMoney(capexSpend)} capex / ${fmtMoney(depreciation)} dep'n`,
      status: sustainability == null ? 'neutral' : sustainability >= 90 ? 'good' : sustainability >= 70 ? 'warn' : 'bad',
      tooltip: 'Are you reinvesting fast enough to keep the portfolio whole? IPWEA target ≥ 90%.',
    },
    {
      label: 'Asset Consumption',
      value: consumption != null ? `${consumption}%` : '—',
      sub: `WDV ${fmtMoney(wdv)} of CRC ${fmtMoney(crc)}`,
      status: consumption == null ? 'neutral' : consumption >= 60 ? 'good' : consumption >= 40 ? 'warn' : 'bad',
      tooltip: 'How "used up" is the portfolio. >60% healthy, <40% indicates ageing assets.',
    },
    {
      label: 'Backlog Ratio',
      value: backlog != null ? `${backlog}%` : '—',
      sub: `${fmtMoney(defectCost)} backlog / ${fmtMoney(crc)} CRC`,
      status: backlog == null ? 'neutral' : backlog < 2 ? 'good' : backlog < 5 ? 'warn' : 'bad',
      tooltip: 'Defect cost as % of replacement value. <2% healthy, 2–5% caution, >5% critical.',
    },
    {
      label: 'Renewal Gap Index',
      value: renewalGap != null ? `${renewalGap}%` : '—',
      sub: `${fmtMoney(requiredRenewal)} need / ${fmtMoney(availableCapital)} avail.`,
      status: renewalGap == null ? 'neutral' : renewalGap <= 100 ? 'good' : renewalGap <= 130 ? 'warn' : 'bad',
      tooltip: 'Required renewals vs available capital. ≤100% means fully funded.',
    },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 mb-5">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">CFO Ratios</h3>
          <p className="text-[11px] text-slate-500">Industry-standard asset register health signals (IPWEA / AAS27)</p>
        </div>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {ratios.map((r) => <RatioCard key={r.label} {...r} />)}
      </div>
    </div>
  );
}

function RatioCard({ label, value, sub, status, tooltip }) {
  const tone = {
    good: { bg: 'bg-emerald-50', border: 'border-emerald-100', text: 'text-emerald-700', icon: TrendingUp },
    warn: { bg: 'bg-amber-50', border: 'border-amber-100', text: 'text-amber-700', icon: Minus },
    bad: { bg: 'bg-rose-50', border: 'border-rose-100', text: 'text-rose-700', icon: TrendingDown },
    neutral: { bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-600', icon: Minus },
  }[status];
  const Icon = tone.icon;

  return (
    <div className={`rounded-lg border ${tone.border} ${tone.bg} p-3`} title={tooltip}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">{label}</span>
        <Icon className={`w-3.5 h-3.5 ${tone.text}`} />
      </div>
      <div className={`text-2xl font-bold tabular-nums ${tone.text}`}>{value}</div>
      <div className="text-[10px] text-slate-500 mt-0.5 truncate" title={sub}>{sub}</div>
      <div className="flex items-start gap-1 mt-1.5 pt-1.5 border-t border-white/60">
        <Info className="w-3 h-3 text-slate-400 mt-0.5 shrink-0" />
        <span className="text-[10px] text-slate-500 leading-tight">{tooltip}</span>
      </div>
    </div>
  );
}