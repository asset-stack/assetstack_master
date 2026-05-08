import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Banknote, AlertOctagon, Target,
  FlaskConical, Wallet, CalendarDays
} from 'lucide-react';

const NAV = [
  { to: '/Finance', label: 'Overview', icon: LayoutDashboard },
  { to: '/Valuation', label: 'Valuation', icon: Banknote },
  { to: '/DefectBacklog', label: 'Defect Backlog', icon: AlertOctagon },
  { to: '/FundingOptimiser', label: 'Funding Optimiser', icon: Target },
  { to: '/ScenarioModeller', label: 'Scenarios', icon: FlaskConical },
  { to: '/CostCenter', label: 'Cost Center', icon: Wallet },
  { to: '/CapitalPlan', label: 'Capital Plan', icon: CalendarDays },
];

export default function FinanceNav() {
  const { pathname } = useLocation();

  return (
    <div className="bg-white border border-slate-200 rounded-xl mb-4 overflow-x-auto">
      <div className="flex items-center gap-1 p-1.5 min-w-max">
        {NAV.map(({ to, label, icon: Icon }) => {
          const active = pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-[12px] font-semibold transition-colors whitespace-nowrap ${
                active
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}