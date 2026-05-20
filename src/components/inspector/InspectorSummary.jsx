import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, AlertTriangle, FileText, Home, TrendingUp } from 'lucide-react';

export default function InspectorSummary({ location, results, sessionDurationMin, onDone, onContinue }) {
  const total = results.length;
  const byGrade = [1, 2, 3, 4, 5].map((g) => ({
    g,
    count: results.filter((r) => r.grade === g).length,
  }));
  const defects = results.filter((r) => r.grade >= 4).length;
  const totalCost = results.reduce((acc, r) => acc + (r.aiSuggestion?.estimated_cost_aud || 0), 0);

  const colors = {
    1: 'bg-emerald-500',
    2: 'bg-green-500',
    3: 'bg-amber-500',
    4: 'bg-orange-500',
    5: 'bg-red-600',
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <Card className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center">
            <CheckCircle2 className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-slate-900 text-xl">Inspection complete</h2>
            <div className="text-sm text-slate-600">{location?.name} · {sessionDurationMin}m</div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="bg-white rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-slate-900">{total}</div>
            <div className="text-[10px] text-slate-500 uppercase font-semibold tracking-wider">Assets</div>
          </div>
          <div className="bg-white rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-red-600">{defects}</div>
            <div className="text-[10px] text-slate-500 uppercase font-semibold tracking-wider">Defects</div>
          </div>
          <div className="bg-white rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-amber-600">${(totalCost / 1000).toFixed(0)}k</div>
            <div className="text-[10px] text-slate-500 uppercase font-semibold tracking-wider">Est. cost</div>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-3">Grade distribution</div>
        <div className="space-y-2">
          {byGrade.map(({ g, count }) => {
            const pct = total ? (count / total) * 100 : 0;
            return (
              <div key={g} className="flex items-center gap-2 text-xs">
                <div className="w-8 font-bold text-slate-700">C{g}</div>
                <div className="flex-1 h-6 bg-slate-100 rounded overflow-hidden">
                  <div className={`h-full ${colors[g]} flex items-center px-2 text-white text-[10px] font-bold`} style={{ width: `${Math.max(pct, count > 0 ? 8 : 0)}%` }}>
                    {count > 0 && count}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {defects > 0 && (
        <Card className="p-4 border-red-200 bg-red-50">
          <div className="flex items-center gap-2 text-sm font-semibold text-red-800 mb-1">
            <AlertTriangle className="w-4 h-4" /> {defects} asset{defects > 1 ? 's' : ''} flagged for action
          </div>
          <div className="text-xs text-red-700">
            These have been added to the defect backlog and capital plan automatically.
          </div>
        </Card>
      )}

      <div className="grid grid-cols-2 gap-2">
        <Button variant="outline" onClick={onContinue} className="h-12">
          <TrendingUp className="w-4 h-4 mr-2" /> Continue
        </Button>
        <Button onClick={onDone} className="h-12 bg-indigo-600 hover:bg-indigo-700">
          <Home className="w-4 h-4 mr-2" /> Finish
        </Button>
      </div>
    </motion.div>
  );
}