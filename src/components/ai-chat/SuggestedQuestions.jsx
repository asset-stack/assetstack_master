import React, { useState } from 'react';
import { Zap, TrendingDown, Wrench, Users, Package, AlertOctagon, FileText, Brain, Camera, DollarSign, ShieldCheck, Sparkles } from 'lucide-react';

const categories = [
  {
    id: 'predict',
    label: 'Predict',
    icon: Brain,
    color: 'text-violet-600 bg-violet-50 border-violet-200',
    questions: [
      "Run failure predictions across my entire portfolio",
      "Which 5 assets are most likely to fail in the next 30 days?",
      "Forecast condition decay for our critical equipment",
      "Predict cascade risk if Pump 3 fails",
    ],
  },
  {
    id: 'operate',
    label: 'Operate',
    icon: Wrench,
    color: 'text-indigo-600 bg-indigo-50 border-indigo-200',
    questions: [
      "Show me all overdue maintenance tasks grouped by location",
      "Create a high-priority work order for the lowest-health asset",
      "Auto-generate this week's scheduled maintenance",
      "Which work orders are blocked or on hold right now?",
    ],
  },
  {
    id: 'report',
    label: 'Report',
    icon: FileText,
    color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    questions: [
      "Generate today's operations briefing",
      "Summarise condition trends — are we getting better or worse?",
      "Build me a board-ready summary of this month's incidents",
      "Compare maintenance spend this quarter vs last quarter",
    ],
  },
  {
    id: 'finance',
    label: 'Finance',
    icon: DollarSign,
    color: 'text-amber-600 bg-amber-50 border-amber-200',
    questions: [
      "Where am I over budget this fiscal year?",
      "Show the top 10 capital plan items by risk score",
      "Total verified savings this year and how it was achieved",
      "Which assets are due for replacement in the next 3 years?",
    ],
  },
  {
    id: 'people',
    label: 'People',
    icon: Users,
    color: 'text-rose-600 bg-rose-50 border-rose-200',
    questions: [
      "Who are the top performing technicians this month?",
      "Show technician workload and flag anyone overloaded",
      "Which contractors have pending applications?",
    ],
  },
  {
    id: 'risk',
    label: 'Risk & Compliance',
    icon: ShieldCheck,
    color: 'text-orange-600 bg-orange-50 border-orange-200',
    questions: [
      "What compliance requirements are overdue or due soon?",
      "Summarise all critical and emergency alerts right now",
      "Which spare parts are below minimum stock?",
      "Show climate-risk exposure across my portfolio",
    ],
  },
];

export default function SuggestedQuestions({ onSelect }) {
  const [active, setActive] = useState('predict');
  const current = categories.find(c => c.id === active) || categories[0];

  return (
    <div className="flex flex-col items-center justify-center min-h-full px-4 py-8 max-w-3xl mx-auto">
      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-4 shadow-lg shadow-indigo-500/20">
        <Sparkles className="w-7 h-7 text-white" />
      </div>
      <h2 className="text-2xl font-semibold text-slate-900 mb-1.5 tracking-tight">AssetMind</h2>
      <p className="text-sm text-slate-500 mb-6 text-center max-w-md leading-relaxed">
        Your AI command center. Predict failures, analyse scans, run reports, and control every asset in your portfolio.
      </p>

      {/* Category pills */}
      <div className="flex flex-wrap gap-1.5 justify-center mb-5 w-full">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = cat.id === active;
          return (
            <button
              key={cat.id}
              onClick={() => setActive(cat.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                isActive
                  ? cat.color + ' shadow-sm'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Questions grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full">
        {current.questions.map((q) => (
          <button
            key={q}
            onClick={() => onSelect(q)}
            className="group text-left px-4 py-3 rounded-xl border border-slate-200 bg-white hover:bg-indigo-50/40 hover:border-indigo-200 text-sm text-slate-700 transition-all hover:shadow-sm flex items-start gap-2"
          >
            <Zap className="w-3.5 h-3.5 text-slate-300 group-hover:text-indigo-500 mt-0.5 shrink-0 transition-colors" />
            <span className="leading-snug">{q}</span>
          </button>
        ))}
      </div>

      <p className="text-[11px] text-slate-400 mt-6 text-center">
        Or type your own question — AssetMind can also create, update, and delete records.
      </p>
    </div>
  );
}