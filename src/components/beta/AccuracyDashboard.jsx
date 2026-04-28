import React, { useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Target, CheckCircle2, XCircle, Clock, TrendingUp } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export default function AccuracyDashboard() {
  const { data: predictions = [], isLoading } = useQuery({
    queryKey: ['predictionAccuracy'],
    queryFn: () => base44.entities.PredictionAccuracy.list('-created_date', 500),
  });

  const stats = useMemo(() => {
    const total = predictions.length;
    const verified = predictions.filter((p) => p.outcome_status && p.outcome_status !== 'pending');
    const correct = predictions.filter((p) => p.outcome_status === 'correct').length;
    const incorrect = predictions.filter((p) => p.outcome_status === 'incorrect').length;
    const pending = predictions.filter((p) => !p.outcome_status || p.outcome_status === 'pending').length;
    const accuracy = verified.length > 0 ? (correct / verified.length) * 100 : 0;

    // Per model version breakdown
    const byVersion = {};
    for (const p of predictions) {
      const v = p.model_version || 'unknown';
      if (!byVersion[v]) byVersion[v] = { total: 0, correct: 0, verified: 0 };
      byVersion[v].total++;
      if (p.outcome_status === 'correct') byVersion[v].correct++;
      if (p.outcome_status && p.outcome_status !== 'pending') byVersion[v].verified++;
    }

    return { total, correct, incorrect, pending, accuracy, byVersion };
  }, [predictions]);

  return (
    <Card className="border-slate-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Target className="w-5 h-5 text-indigo-600" />
            Live Model Accuracy
          </CardTitle>
          <Badge variant="outline" className="text-[10px]">FOUNDATION</Badge>
        </div>
        <p className="text-xs text-slate-500">
          Every AI prediction is logged and reconciled against verified human review. This is your ground truth.
        </p>
      </CardHeader>
      <CardContent className="space-y-5">
        {isLoading ? (
          <div className="text-sm text-slate-400">Loading…</div>
        ) : stats.total === 0 ? (
          <div className="rounded-lg bg-slate-50 border border-dashed border-slate-300 p-6 text-center">
            <Target className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-700">No predictions logged yet</p>
            <p className="text-xs text-slate-500 mt-1">
              Run an AI scan analysis — predictions will start appearing here automatically.
            </p>
          </div>
        ) : (
          <>
            {/* Headline accuracy */}
            <div className="rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 p-5">
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-4xl font-bold text-indigo-700">{stats.accuracy.toFixed(1)}%</span>
                <span className="text-sm text-indigo-600 font-medium">verified accuracy</span>
              </div>
              <Progress value={stats.accuracy} className="h-2" />
              <p className="text-xs text-slate-600 mt-2">
                Based on {stats.correct + stats.incorrect} verified outcomes out of {stats.total} total predictions.
              </p>
            </div>

            {/* Counts */}
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-lg bg-green-50 border border-green-100 p-3">
                <div className="flex items-center gap-1.5 text-green-700 mb-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-[10px] font-semibold uppercase">Correct</span>
                </div>
                <div className="text-2xl font-bold text-green-800">{stats.correct}</div>
              </div>
              <div className="rounded-lg bg-red-50 border border-red-100 p-3">
                <div className="flex items-center gap-1.5 text-red-700 mb-1">
                  <XCircle className="w-4 h-4" />
                  <span className="text-[10px] font-semibold uppercase">Incorrect</span>
                </div>
                <div className="text-2xl font-bold text-red-800">{stats.incorrect}</div>
              </div>
              <div className="rounded-lg bg-amber-50 border border-amber-100 p-3">
                <div className="flex items-center gap-1.5 text-amber-700 mb-1">
                  <Clock className="w-4 h-4" />
                  <span className="text-[10px] font-semibold uppercase">Pending</span>
                </div>
                <div className="text-2xl font-bold text-amber-800">{stats.pending}</div>
              </div>
            </div>

            {/* Per-version breakdown */}
            {Object.keys(stats.byVersion).length > 0 && (
              <div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-2">
                  <TrendingUp className="w-3.5 h-3.5" />
                  Accuracy by Model Version
                </div>
                <div className="space-y-2">
                  {Object.entries(stats.byVersion)
                    .sort(([a], [b]) => b.localeCompare(a))
                    .map(([version, v]) => {
                      const acc = v.verified > 0 ? (v.correct / v.verified) * 100 : 0;
                      return (
                        <div key={version} className="flex items-center gap-3">
                          <Badge variant="outline" className="font-mono text-[10px] shrink-0">{version}</Badge>
                          <Progress value={acc} className="h-1.5 flex-1" />
                          <span className="text-xs font-semibold text-slate-700 tabular-nums w-20 text-right">
                            {acc.toFixed(1)}% ({v.verified}/{v.total})
                          </span>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}