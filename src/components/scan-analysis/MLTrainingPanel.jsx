import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Brain, Sparkles, TrendingUp, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function MLTrainingPanel() {
  const [training, setTraining] = useState(false);
  const [result, setResult] = useState(null);
  const qc = useQueryClient();

  const { data: activeModel } = useQuery({
    queryKey: ['activeConditionModel'],
    queryFn: async () => {
      const m = await base44.entities.MLModel.filter(
        { model_type: 'failure_classification', status: 'active' },
        '-training_date',
        1
      );
      return m?.[0] || null;
    },
  });

  const { data: pendingSamples = 0 } = useQuery({
    queryKey: ['pendingTrainingSamples'],
    queryFn: async () => {
      const all = await base44.entities.ConditionReport.filter({ used_for_training: false });
      return all.filter((r) => r.review_status === 'approved' || r.review_status === 'corrected' || r.review_status === 'rejected').length;
    },
  });

  const runTraining = async () => {
    setTraining(true);
    setResult(null);
    const res = await base44.functions.invoke('retrainConditionModel', {});
    setResult(res.data);
    setTraining(false);
    qc.invalidateQueries({ queryKey: ['activeConditionModel'] });
    qc.invalidateQueries({ queryKey: ['pendingTrainingSamples'] });
  };

  const accuracy = activeModel?.accuracy_score || 70;

  return (
    <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-fuchsia-600 rounded-2xl p-5 text-white shadow-xl">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
          <Brain className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-bold text-lg">Condition AI Model</h3>
          <p className="text-xs text-white/70">Continuously learning from your feedback</p>
        </div>
      </div>

      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-white/80 font-medium">Model Version</span>
          <span className="text-sm font-bold">{activeModel?.version || 'v1.0 (baseline)'}</span>
        </div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-white/80 font-medium">Accuracy</span>
          <span className="text-sm font-bold">{accuracy.toFixed(1)}%</span>
        </div>
        <Progress value={accuracy} className="h-2 bg-white/20" />
        <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-white/20">
          <div>
            <div className="text-[10px] text-white/60 uppercase">Trained on</div>
            <div className="text-sm font-semibold">{activeModel?.training_data_size || 0} samples</div>
          </div>
          <div>
            <div className="text-[10px] text-white/60 uppercase">FP rate</div>
            <div className="text-sm font-semibold">{(activeModel?.false_positive_rate || 0).toFixed(1)}%</div>
          </div>
        </div>
      </div>

      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 mb-3 flex items-center justify-between">
        <div>
          <div className="text-xs text-white/80">Pending training samples</div>
          <div className="text-lg font-bold">{pendingSamples}</div>
        </div>
        <Sparkles className="w-6 h-6 text-white/60" />
      </div>

      <Button
        onClick={runTraining}
        disabled={training || pendingSamples === 0}
        className="w-full bg-white text-indigo-700 hover:bg-white/90 font-semibold"
      >
        {training ? (
          <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Retraining model…</>
        ) : (
          <><TrendingUp className="w-4 h-4 mr-2" /> Retrain with {pendingSamples} new sample{pendingSamples !== 1 ? 's' : ''}</>
        )}
      </Button>

      {result && result.success && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-3 bg-green-500/20 backdrop-blur-sm border border-green-400/30 rounded-xl p-3 text-sm"
        >
          <div className="flex items-center gap-2 font-semibold mb-1">
            <CheckCircle2 className="w-4 h-4" />
            Model upgraded!
          </div>
          <p className="text-xs text-white/90">
            {result.previous_version} → {result.new_version} • accuracy {result.previous_accuracy.toFixed(1)}% → {result.new_accuracy.toFixed(1)}% (+{result.improvement.toFixed(1)}%)
          </p>
        </motion.div>
      )}
      {result && !result.success && (
        <div className="mt-3 bg-amber-500/20 border border-amber-400/30 rounded-xl p-3 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4" /> {result.message}
        </div>
      )}
    </div>
  );
}