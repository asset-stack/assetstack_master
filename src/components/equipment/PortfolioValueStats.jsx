import React from 'react';
import { Wallet, Banknote, TrendingDown, AlertOctagon } from 'lucide-react';
import { deriveCRC, deriveWDV, deriveAnnualDepreciation, deriveDefectUrgency, fmtMoney } from '@/lib/assetMetrics';

// Portfolio-level valuation tiles — board-ready CRC / WDV / depreciation / defect backlog.
export default function PortfolioValueStats({ equipment }) {
  const totals = equipment.reduce(
    (acc, e) => {
      acc.crc += deriveCRC(e);
      acc.wdv += deriveWDV(e);
      acc.depreciation += deriveAnnualDepreciation(e);
      const u = deriveDefectUrgency(e);
      if (u === 'High') acc.highDefects += 1;
      if (u === 'Medium') acc.medDefects += 1;
      return acc;
    },
    { crc: 0, wdv: 0, depreciation: 0, highDefects: 0, medDefects: 0 }
  );

  const consumedPct = totals.crc > 0 ? Math.round((1 - totals.wdv / totals.crc) * 100) : 0;

  const tiles = [
    {
      label: 'Replacement Cost',
      value: fmtMoney(totals.crc),
      sub: 'Total CRC',
      icon: Wallet,
      color: 'bg-indigo-100 text-indigo-700',
      bg: 'bg-indigo-50',
    },
    {
      label: 'Written-Down Value',
      value: fmtMoney(totals.wdv),
      sub: `${consumedPct}% consumed`,
      icon: Banknote,
      color: 'bg-emerald-100 text-emerald-700',
      bg: 'bg-emerald-50',
    },
    {
      label: 'Annual Depreciation',
      value: fmtMoney(totals.depreciation),
      sub: 'Straight line',
      icon: TrendingDown,
      color: 'bg-amber-100 text-amber-700',
      bg: 'bg-amber-50',
    },
    {
      label: 'Defect Backlog',
      value: `${totals.highDefects + totals.medDefects}`,
      sub: `${totals.highDefects} high · ${totals.medDefects} med`,
      icon: AlertOctagon,
      color: 'bg-rose-100 text-rose-700',
      bg: 'bg-rose-50',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
      {tiles.map((t) => (
        <div key={t.label} className={`${t.bg} rounded-xl p-4 border border-slate-200/50`}>
          <div className="flex items-center gap-2 mb-2">
            <div className={`p-1.5 rounded-lg ${t.color}`}>
              <t.icon className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 tabular-nums">{t.value}</p>
          <p className="text-xs text-slate-600">{t.label}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">{t.sub}</p>
        </div>
      ))}
    </div>
  );
}