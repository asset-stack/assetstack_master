import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Brain, Play, Loader2, CheckCircle2, Sparkles, AlertTriangle, Zap } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export default function RunPredictiveAnalysis({ equipment = [], predictions = [], triggers = [], technicians = [], onComplete }) {
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [results, setResults] = useState(null);
  const queryClient = useQueryClient();

  const createSuggestionMutation = useMutation({
    mutationFn: (data) => base44.entities.SuggestedTask.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['suggestedTasks']);
    },
  });

  const runAnalysis = async () => {
    setIsRunning(true);
    setProgress(0);
    setResults(null);

    const activeTriggers = triggers.filter(t => t.is_active);
    const suggestionsCreated = [];
    const highRiskAssets = [];
    const aiPredictions = [];

    // Step 1: Run AI prediction engine on all equipment
    setCurrentStep('Running AI failure prediction engine...');
    setProgress(10);

    try {
      const predictionResponse = await base44.functions.invoke('predictAssetFailures', {});
      if (predictionResponse.data?.success) {
        aiPredictions.push(...(predictionResponse.data.results || []));
        highRiskAssets.push(...(predictionResponse.data.high_risk_assets || []));
      }
    } catch (err) {
      console.log('AI prediction skipped - using rule-based analysis');
    }

    setProgress(30);
    setCurrentStep('Evaluating maintenance triggers...');

    // Step 2: Process each equipment against triggers
    for (let i = 0; i < equipment.length; i++) {
      const eq = equipment[i];
      setProgress(30 + ((i + 1) / equipment.length) * 50);
      setCurrentStep(`Analyzing ${eq.name}...`);

      // Get AI prediction for this equipment if available
      const aiPred = aiPredictions.find(p => p.asset_id === eq.id);
      const eqPrediction = predictions.find(p => p.equipment_id === eq.id);

      for (const trigger of activeTriggers) {
        let shouldTrigger = false;
        let triggerValue = null;
        let triggerReason = '';

        switch (trigger.trigger_type) {
          case 'rul_threshold':
            triggerValue = aiPred?.prediction?.rulDays || eq.remaining_useful_life_days;
            if (triggerValue !== undefined && triggerValue !== null) {
              shouldTrigger = trigger.condition_operator === 'less_than' 
                ? triggerValue < trigger.threshold_value
                : triggerValue > trigger.threshold_value;
              triggerReason = `RUL is ${triggerValue} days (threshold: ${trigger.threshold_value})`;
            }
            break;

          case 'failure_probability':
            triggerValue = aiPred?.prediction?.probability || eq.failure_probability || eqPrediction?.prediction_result?.failure_probability;
            if (triggerValue !== undefined && triggerValue !== null) {
              shouldTrigger = trigger.condition_operator === 'less_than'
                ? triggerValue < trigger.threshold_value
                : triggerValue > trigger.threshold_value;
              triggerReason = `Failure probability is ${triggerValue}% (threshold: ${trigger.threshold_value}%)`;
            }
            break;

          case 'health_score':
            triggerValue = aiPred?.prediction?.healthScore || eq.health_score;
            if (triggerValue !== undefined && triggerValue !== null) {
              shouldTrigger = trigger.condition_operator === 'less_than'
                ? triggerValue < trigger.threshold_value
                : triggerValue > trigger.threshold_value;
              triggerReason = `Health score is ${triggerValue}% (threshold: ${trigger.threshold_value}%)`;
            }
            break;
        }

        if (shouldTrigger) {
          // Find best technician based on equipment type and availability
          const suitableTech = technicians.find(t => 
            t.availability_status === 'available' && 
            t.equipment_specializations?.includes(eq.type)
          ) || technicians.find(t => t.availability_status === 'available');

          // Get AI-generated recommendations if available
          const aiRecommendations = aiPred?.warnings?.recommendations || eqPrediction?.recommendations || [];
          const riskFactors = aiPred?.prediction?.riskFactors || [];

          const suggestion = {
            equipment_id: eq.id,
            equipment_name: eq.name,
            trigger_id: trigger.id,
            trigger_name: trigger.name,
            title: `${trigger.task_template?.title_prefix || 'AI Recommended:'} ${eq.name} - ${trigger.name}`,
            description: `AI-driven suggestion based on ${trigger.trigger_type.replace(/_/g, ' ')}. ${triggerReason}${riskFactors.length > 0 ? `\n\nRisk factors: ${riskFactors.join(', ')}` : ''}`,
            type: trigger.task_template?.type || 'predictive',
            priority: aiPred?.prediction?.riskLevel === 'critical' ? 'urgent' : trigger.task_template?.priority || 'medium',
            estimated_hours: trigger.task_template?.estimated_hours || 4,
            recommended_date: new Date(Date.now() + (aiPred?.prediction?.riskLevel === 'critical' ? 2 : 7) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            trigger_reason: triggerReason,
            trigger_value: triggerValue,
            ai_confidence: aiPred?.prediction?.confidence || eqPrediction?.confidence_score || 75,
            suggested_technician: suitableTech?.name,
            suggested_parts: aiRecommendations.slice(0, 3),
            status: 'pending',
          };

          await createSuggestionMutation.mutateAsync(suggestion);
          suggestionsCreated.push(suggestion);
        }
      }

      // Small delay for visual smoothness
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    setProgress(90);
    setCurrentStep('Finalizing analysis...');

    // Invalidate queries to refresh data
    queryClient.invalidateQueries(['equipment']);
    queryClient.invalidateQueries(['predictions']);

    setProgress(100);
    setResults({
      equipmentAnalyzed: equipment.length,
      triggersEvaluated: activeTriggers.length,
      suggestionsCreated: suggestionsCreated.length,
      highRiskCount: highRiskAssets.length,
      aiPredictionsRun: aiPredictions.length,
    });

    setIsRunning(false);
    setCurrentStep('');
    onComplete?.();
  };

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-200 p-6">
      <div className="flex items-start gap-4">
        <div className="p-3 bg-white rounded-xl shadow-sm">
          <Brain className="w-6 h-6 text-indigo-600" />
        </div>

        <div className="flex-1">
          <h3 className="font-semibold text-slate-900">Predictive Analysis Engine</h3>
          <p className="text-sm text-slate-600 mt-1">
            Analyze equipment data against configured triggers to generate maintenance suggestions
          </p>

          {isRunning ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                <span className="text-sm text-slate-600">{currentStep || 'Initializing AI engine...'}</span>
              </div>
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-slate-500 mt-1">{Math.round(progress)}% complete</p>
            </motion.div>
          ) : results ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-4 bg-white rounded-lg border border-green-200"
            >
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-800">AI Analysis Complete</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-slate-900">{results.equipmentAnalyzed}</p>
                  <p className="text-xs text-slate-500">Assets Analyzed</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{results.aiPredictionsRun || 0}</p>
                  <p className="text-xs text-slate-500">AI Predictions</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-rose-600">{results.highRiskCount || 0}</p>
                  <p className="text-xs text-slate-500">High Risk</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-indigo-600">{results.suggestionsCreated}</p>
                  <p className="text-xs text-slate-500">Tasks Suggested</p>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="mt-4 flex items-center gap-3">
              <Button 
                onClick={runAnalysis}
                className="bg-indigo-600 hover:bg-indigo-700"
                disabled={triggers.filter(t => t.is_active).length === 0}
              >
                <Play className="w-4 h-4 mr-2" />
                Run Analysis
              </Button>
              <span className="text-xs text-slate-500">
                {equipment.length} assets • {triggers.filter(t => t.is_active).length} active triggers
              </span>
            </div>
          )}

          {triggers.filter(t => t.is_active).length === 0 && !isRunning && !results && (
            <div className="mt-3 flex items-center gap-2 text-amber-600 text-sm">
              <AlertTriangle className="w-4 h-4" />
              No active triggers configured
            </div>
          )}
        </div>
      </div>
    </div>
  );
}