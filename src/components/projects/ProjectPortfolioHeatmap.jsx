import React, { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { Flame } from 'lucide-react';
import { calculateEVM, indexHealth } from '@/lib/projectAnalytics';

/**
 * Portfolio Heatmap — bird's-eye view of EVERY project's health.
 * Each cell shows SPI on X axis, CPI on Y axis. Color = combined performance.
 * Used by Boards and Sponsors to spot trouble across the whole portfolio.
 */
export default function ProjectPortfolioHeatmap({ projects = [] }) {
  const cells = useMemo(() => {
    return projects
      .filter((p) => p.status !== 'cancelled')
      .map((p) => {
        const evm = calculateEVM(p);
        const combined = (evm.SPI + evm.CPI) / 2;
        return {
          id: p.id,
          name: p.name,
          code: p.code,
          spi: evm.SPI,
          cpi: evm.CPI,
          combined,
          budget: p.budget || 0,
          status: p.status
        };
      });
  }, [projects]);

  if (!cells.length) {
    return null;
  }

  return (
    <Card className="p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
          <Flame className="w-4 h-4 text-orange-600" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900">Portfolio Heatmap</h3>
          <p className="text-[11px] text-slate-500">
            Schedule (SPI) × Cost (CPI) performance — circle size = budget
          </p>
        </div>
      </div>

      <div className="relative bg-gradient-to-br from-emerald-50/40 via-amber-50/40 to-rose-50/40 rounded-xl border border-slate-100 aspect-[2/1] overflow-hidden">
        {/* Grid lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <line x1="50%" y1="0" x2="50%" y2="100%" stroke="#cbd5e1" strokeDasharray="2 4" />
          <line x1="0" y1="50%" x2="100%" y2="50%" stroke="#cbd5e1" strokeDasharray="2 4" />
        </svg>

        {/* Quadrant labels */}
        <span className="absolute top-2 left-2 text-[9px] font-bold text-rose-600 uppercase tracking-widest">
          Behind & Over
        </span>
        <span className="absolute top-2 right-2 text-[9px] font-bold text-amber-600 uppercase tracking-widest">
          Over Budget
        </span>
        <span className="absolute bottom-2 left-2 text-[9px] font-bold text-amber-600 uppercase tracking-widest">
          Behind Schedule
        </span>
        <span className="absolute bottom-2 right-2 text-[9px] font-bold text-emerald-600 uppercase tracking-widest">
          On Track
        </span>

        {/* Project bubbles */}
        {cells.map((c) => {
          const x = Math.min(1.4, Math.max(0.6, c.spi));
          const y = Math.min(1.4, Math.max(0.6, c.cpi));
          // Map 0.6..1.4 → 0..100%
          const left = ((x - 0.6) / 0.8) * 100;
          const top = (1 - (y - 0.6) / 0.8) * 100;
          const health = indexHealth(c.combined);
          const size = Math.min(48, Math.max(16, Math.sqrt(c.budget / 1000)));

          return (
            <Link
              key={c.id}
              to={`/ProjectDetail?id=${c.id}`}
              className="absolute group"
              style={{
                left: `${left}%`,
                top: `${top}%`,
                transform: 'translate(-50%, -50%)'
              }}
            >
              <div
                className={`rounded-full bg-${health.tone}-500/70 border-2 border-${health.tone}-500 hover:scale-110 transition-transform cursor-pointer`}
                style={{ width: size, height: size }}
              />
              <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap z-10 pointer-events-none">
                <div className="font-bold">{c.name}</div>
                <div className="opacity-80 tabular-nums">
                  SPI {c.spi.toFixed(2)} · CPI {c.cpi.toFixed(2)}
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="mt-3 flex items-center justify-between text-[10px] text-slate-500">
        <span>← Behind schedule</span>
        <span className="font-semibold">Schedule Performance (SPI)</span>
        <span>Ahead of schedule →</span>
      </div>
    </Card>
  );
}