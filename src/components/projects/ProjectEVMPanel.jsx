import React from 'react';
import { Card } from '@/components/ui/card';
import {
  TrendingUp,
  TrendingDown,
  Gauge,
  Target,
  AlertTriangle,
  Info
} from 'lucide-react';
import { calculateEVM, indexHealth, forecastSlipDays } from '@/lib/projectAnalytics';
import { formatCurrency } from '@/lib/projectUtils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';

function IndexCard({ label, value, formula, tooltip }) {
  const health = indexHealth(value);
  const Icon = value >= 1 ? TrendingUp : TrendingDown;
  return (
    <div className={`rounded-xl border bg-white p-4 border-${health.tone}-200`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            {label}
          </span>
          <TooltipProvider delayDuration={150}>
            <Tooltip>
              <TooltipTrigger>
                <Info className="w-3 h-3 text-slate-300" />
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs">
                <div className="text-[11px] font-semibold mb-0.5">{tooltip.title}</div>
                <div className="text-[10px] opacity-80">{tooltip.body}</div>
                <div className="text-[10px] font-mono mt-1 text-indigo-200">{formula}</div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className={`w-1.5 h-1.5 rounded-full ${health.dot}`} />
      </div>
      <div className="flex items-baseline gap-1.5">
        <span
          className={`text-2xl font-bold tabular-nums text-${health.tone}-700`}
        >
          {value.toFixed(2)}
        </span>
        <Icon className={`w-4 h-4 text-${health.tone}-600`} />
      </div>
      <div className={`text-[11px] font-semibold text-${health.tone}-600 mt-0.5`}>
        {health.label}
      </div>
    </div>
  );
}

function MetricRow({ label, value, currency, positive, tooltip }) {
  const isNegative = value < 0;
  const tone = positive ? (isNegative ? 'rose' : 'emerald') : 'slate';
  return (
    <div className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
      <div className="flex items-center gap-1.5">
        <span className="text-[12px] font-semibold text-slate-700">{label}</span>
        {tooltip && (
          <TooltipProvider delayDuration={150}>
            <Tooltip>
              <TooltipTrigger>
                <Info className="w-3 h-3 text-slate-300" />
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs">
                <div className="text-[10px]">{tooltip}</div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      <span
        className={`text-[13px] font-bold tabular-nums ${
          positive ? `text-${tone}-700` : 'text-slate-900'
        }`}
      >
        {isNegative && positive && '−'}
        {formatCurrency(Math.abs(value), currency)}
      </span>
    </div>
  );
}

export default function ProjectEVMPanel({ project }) {
  const evm = calculateEVM(project);
  const slipDays = forecastSlipDays(project);
  const currency = project?.currency || 'USD';

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
            <Gauge className="w-4 h-4 text-indigo-600" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Earned Value Analysis
            </h3>
            <p className="text-[11px] text-slate-500">
              PMI-standard project performance metrics
            </p>
          </div>
        </div>
        {Math.abs(slipDays) > 0 && (
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold ${
              slipDays > 0
                ? 'bg-rose-50 text-rose-700'
                : 'bg-emerald-50 text-emerald-700'
            }`}
          >
            <AlertTriangle className="w-3 h-3" />
            {slipDays > 0
              ? `${slipDays}d behind schedule`
              : `${Math.abs(slipDays)}d ahead`}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-5">
        <IndexCard
          label="SPI"
          value={evm.SPI}
          formula="SPI = EV / PV"
          tooltip={{
            title: 'Schedule Performance Index',
            body: 'How efficiently the team is delivering planned work. 1.0 = on plan, >1.0 = ahead.'
          }}
        />
        <IndexCard
          label="CPI"
          value={evm.CPI}
          formula="CPI = EV / AC"
          tooltip={{
            title: 'Cost Performance Index',
            body: 'How efficiently money is being spent. 1.0 = on budget, <1.0 = overrunning.'
          }}
        />
        <IndexCard
          label="TCPI"
          value={evm.TCPI}
          formula="TCPI = (BAC−EV) / (BAC−AC)"
          tooltip={{
            title: 'To-Complete Performance Index',
            body: 'Efficiency required from now to hit the original budget. >1.05 = action needed.'
          }}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
        <div>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
            Performance
          </div>
          <MetricRow label="Planned Value (PV)" value={evm.PV} currency={currency} />
          <MetricRow label="Earned Value (EV)" value={evm.EV} currency={currency} />
          <MetricRow label="Actual Cost (AC)" value={evm.AC} currency={currency} />
          <MetricRow
            label="Schedule Variance (SV)"
            value={evm.SV}
            currency={currency}
            positive
            tooltip="SV = EV − PV. Negative means behind schedule in dollar terms."
          />
          <MetricRow
            label="Cost Variance (CV)"
            value={evm.CV}
            currency={currency}
            positive
            tooltip="CV = EV − AC. Negative means over budget for work done."
          />
        </div>
        <div>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
            Forecast
          </div>
          <MetricRow
            label="Budget at Completion (BAC)"
            value={evm.BAC}
            currency={currency}
          />
          <MetricRow
            label="Estimate at Completion (EAC)"
            value={evm.EAC}
            currency={currency}
            tooltip="EAC = BAC / (CPI × SPI). Most realistic forecast considering both cost and schedule slip."
          />
          <MetricRow
            label="Estimate to Complete (ETC)"
            value={evm.ETC}
            currency={currency}
            tooltip="Money still needed to finish: ETC = EAC − AC."
          />
          <MetricRow
            label="Variance at Completion"
            value={evm.VAC}
            currency={currency}
            positive
            tooltip="VAC = BAC − EAC. Final over/under spend at this rate."
          />
        </div>
      </div>

      {/* Progress bars */}
      <div className="mt-5 space-y-3">
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-semibold text-slate-600">
              Planned progress
            </span>
            <span className="text-[11px] tabular-nums text-slate-600">
              {evm.plannedProgress}%
            </span>
          </div>
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-slate-400"
              style={{ width: `${evm.plannedProgress}%` }}
            />
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-semibold text-slate-600">
              Actual progress
            </span>
            <span className="text-[11px] tabular-nums text-slate-600">
              {evm.actualProgress}%
            </span>
          </div>
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full ${
                evm.actualProgress >= evm.plannedProgress
                  ? 'bg-emerald-500'
                  : 'bg-amber-500'
              }`}
              style={{ width: `${evm.actualProgress}%` }}
            />
          </div>
        </div>
      </div>
    </Card>
  );
}