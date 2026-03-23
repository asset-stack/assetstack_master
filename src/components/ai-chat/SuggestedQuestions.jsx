import React from 'react';
import { MessageSquare } from 'lucide-react';

const suggestions = [
  "Which equipment is most at risk of failure?",
  "Show me all overdue maintenance tasks",
  "Who are the top performing technicians?",
  "What spare parts are running low?",
  "Summarize all critical alerts right now",
  "Which assets have the lowest health scores?",
];

export default function SuggestedQuestions({ onSelect }) {
  return (
    <div className="flex flex-col items-center justify-center h-full px-4 pb-8">
      <div className="w-16 h-16 rounded-2xl bg-indigo-100 flex items-center justify-center mb-4">
        <MessageSquare className="w-8 h-8 text-indigo-600" />
      </div>
      <h2 className="text-xl font-semibold text-slate-900 mb-1">AssetMind</h2>
      <p className="text-sm text-slate-500 mb-6 text-center max-w-sm">
        Ask me anything about your equipment, tasks, technicians, sensors, or inventory.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
        {suggestions.map((q) => (
          <button
            key={q}
            onClick={() => onSelect(q)}
            className="text-left px-4 py-3 rounded-xl border border-slate-200 bg-white hover:bg-indigo-50 hover:border-indigo-200 text-sm text-slate-700 transition-colors"
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  );
}