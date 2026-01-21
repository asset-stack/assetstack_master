import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, Loader2, AlertTriangle, CheckCircle2, TrendingDown, Clock, Sparkles } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { base44 } from '@/api/base44Client';

export default function PredictionPanel({ equipment, sensorReadings, onPredictionComplete }) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [prediction, setPrediction] = useState(null);

  const runPrediction = async () => {
    setIsAnalyzing(true);
    setPrediction(null);

    try {
      // Use the advanced ML-based prediction engine
      const response = await base44.functions.invoke('advancedPrediction', {
        equipment_id: equipment.id,
        analysis_type: 'full'
      });

      const result = response.data;

      if (!result.success) {
        throw new Error(result.error || 'Prediction failed');
      }

      // Format the ensemble prediction for display
      const formattedPrediction = {
        failure_probability: result.predictions.ensemble_prediction.failure_probability,
        remaining_useful_life_days: result.predictions.ensemble_prediction.rul_days,
        confidence_score: result.predictions.ensemble_prediction.confidence,
        risk_level: result.predictions.ensemble_prediction.risk_level,
        primary_failure_mode: Object.entries(result.predictions.failure_probability.failure_modes || {})
          .sort((a, b) => b[1] - a[1])[0]?.[0] || 'general_wear',
        risk_factors: result.insights.risk_factors,
        recommended_actions: result.insights.recommendations,
        degradation_indicators: Object.entries(result.predictions.degradation_analysis.degradation_indicators)
          .filter(([_, data]) => data.severity !== 'low')
          .map(([sensor, data]) => `${sensor}: ${data.trend_direction} (${data.severity} severity)`),
        analysis_summary: `Advanced ML analysis using ${result.predictions.ensemble_prediction.model_agreement} model agreement. Health index: ${result.predictions.ensemble_prediction.health_index}%`,
        
        // Additional advanced metrics
        anomaly_score: result.predictions.anomaly_detection.overall_anomaly_score,
        anomaly_assessment: result.predictions.anomaly_detection.assessment,
        rul_confidence_interval: result.predictions.rul_prediction.confidence_interval,
        failure_modes: result.predictions.failure_probability.failure_modes,
        model_performance: result.model_performance,
        feature_quality: result.feature_quality,
        estimated_cost_of_failure: result.insights.estimated_cost_of_failure,
        optimal_maintenance_window: result.insights.optimal_maintenance_window
      };

      setPrediction(formattedPrediction);
      
      // Update equipment with new predictions
      if (onPredictionComplete) {
        onPredictionComplete(formattedPrediction);
      }

    } catch (error) {
      console.error('Advanced prediction failed:', error);
      alert('Prediction analysis failed. Please ensure sufficient sensor data is available.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getRiskColor = (level) => {
    const colors = {
      low: 'text-emerald-400',
      medium: 'text-amber-400',
      high: 'text-orange-400',
      critical: 'text-rose-400'
    };
    return colors[level] || colors.medium;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 rounded-2xl border border-purple-500/20 p-6 backdrop-blur-xl"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-500/20 rounded-xl">
            <Brain className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">AI Prediction Engine</h3>
            <p className="text-sm text-slate-400">Advanced failure prediction analysis</p>
          </div>
        </div>
        <Button
          onClick={runPrediction}
          disabled={isAnalyzing}
          className="bg-purple-600 hover:bg-purple-700"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Run Analysis
            </>
          )}
        </Button>
      </div>

      {isAnalyzing && (
        <div className="py-8">
          <div className="flex flex-col items-center justify-center">
            <div className="relative">
              <div className="w-20 h-20 rounded-full border-4 border-purple-500/30 animate-pulse" />
              <Brain className="w-10 h-10 text-purple-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
            </div>
            <p className="text-slate-400 mt-4">Analyzing sensor patterns...</p>
            <p className="text-xs text-slate-500">Running predictive models</p>
          </div>
        </div>
      )}

      {prediction && !isAnalyzing && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-slate-800/50 rounded-xl p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <AlertTriangle className={`w-5 h-5 ${getRiskColor(prediction.risk_level)}`} />
              </div>
              <p className="text-2xl font-bold text-white">{prediction.failure_probability}%</p>
              <p className="text-xs text-slate-400">Failure Probability</p>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-blue-400" />
              </div>
              <p className="text-2xl font-bold text-white">{prediction.remaining_useful_life_days}</p>
              <p className="text-xs text-slate-400">Days RUL</p>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              </div>
              <p className="text-2xl font-bold text-white">{prediction.confidence_score}%</p>
              <p className="text-xs text-slate-400">Confidence</p>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-slate-400 mb-2">Risk Level</p>
            <Badge className={`${getRiskColor(prediction.risk_level)} bg-slate-800/50 capitalize text-sm px-3 py-1`}>
              {prediction.risk_level} Risk
            </Badge>
          </div>

          {prediction.primary_failure_mode && (
            <div>
              <p className="text-sm font-medium text-slate-400 mb-2">Primary Failure Mode</p>
              <p className="text-white bg-slate-800/50 rounded-lg p-3 text-sm">{prediction.primary_failure_mode}</p>
            </div>
          )}

          {prediction.analysis_summary && (
            <div>
              <p className="text-sm font-medium text-slate-400 mb-2">Analysis Summary</p>
              <p className="text-slate-300 bg-slate-800/50 rounded-lg p-3 text-sm">{prediction.analysis_summary}</p>
            </div>
          )}

          {/* Advanced Metrics */}
          {prediction.anomaly_score !== undefined && (
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-800/50 rounded-lg p-3">
                <p className="text-xs text-slate-400 mb-1">Anomaly Score</p>
                <p className="text-xl font-bold text-white">{prediction.anomaly_score.toFixed(1)}/100</p>
                <p className="text-xs text-amber-400 capitalize mt-1">{prediction.anomaly_assessment}</p>
              </div>
              {prediction.estimated_cost_of_failure && (
                <div className="bg-slate-800/50 rounded-lg p-3">
                  <p className="text-xs text-slate-400 mb-1">Estimated Failure Cost</p>
                  <p className="text-xl font-bold text-rose-400">${(prediction.estimated_cost_of_failure / 1000).toFixed(0)}K</p>
                  <p className="text-xs text-slate-500 mt-1">If unaddressed</p>
                </div>
              )}
            </div>
          )}

          {prediction.rul_confidence_interval && (
            <div>
              <p className="text-sm font-medium text-slate-400 mb-2">RUL Confidence Interval ({(prediction.rul_confidence_interval.confidence_level * 100)}%)</p>
              <div className="bg-slate-800/50 rounded-lg p-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Lower Bound:</span>
                  <span className="text-white font-medium">{prediction.rul_confidence_interval.lower} days</span>
                </div>
                <div className="flex justify-between text-sm mt-2">
                  <span className="text-slate-400">Upper Bound:</span>
                  <span className="text-white font-medium">{prediction.rul_confidence_interval.upper} days</span>
                </div>
              </div>
            </div>
          )}

          {prediction.optimal_maintenance_window && (
            <div>
              <p className="text-sm font-medium text-slate-400 mb-2">Optimal Maintenance Window</p>
              <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3">
                <p className="text-white font-medium capitalize">{prediction.optimal_maintenance_window.urgency} Priority</p>
                <p className="text-sm text-slate-300 mt-1">
                  Schedule between {prediction.optimal_maintenance_window.start_days}-{prediction.optimal_maintenance_window.end_days} days
                </p>
              </div>
            </div>
          )}

          {prediction.failure_modes && Object.keys(prediction.failure_modes).length > 0 && (
            <div>
              <p className="text-sm font-medium text-slate-400 mb-2">Likely Failure Modes</p>
              <div className="space-y-2">
                {Object.entries(prediction.failure_modes)
                  .sort((a, b) => b[1] - a[1])
                  .map(([mode, probability], idx) => (
                    <div key={idx} className="bg-slate-800/50 rounded-lg p-3">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm text-white capitalize">{mode.replace(/_/g, ' ')}</span>
                        <span className="text-sm font-medium text-amber-400">{probability}%</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-1.5">
                        <div 
                          className="bg-amber-500 h-1.5 rounded-full"
                          style={{ width: `${probability}%` }}
                        />
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {prediction.risk_factors && prediction.risk_factors.length > 0 && (
            <div>
              <p className="text-sm font-medium text-slate-400 mb-2">Risk Factors</p>
              <div className="space-y-2">
                {prediction.risk_factors.map((factor, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-sm text-slate-300 bg-slate-800/50 rounded-lg p-2">
                    <TrendingDown className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                    {factor}
                  </div>
                ))}
              </div>
            </div>
          )}

          {prediction.model_performance && (
            <div>
              <p className="text-sm font-medium text-slate-400 mb-2">Model Performance Metrics</p>
              <div className="grid grid-cols-2 gap-2 bg-slate-800/50 rounded-lg p-3">
                <div>
                  <p className="text-xs text-slate-400">Accuracy</p>
                  <p className="text-sm font-medium text-emerald-400">{prediction.model_performance.accuracy}%</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Precision</p>
                  <p className="text-sm font-medium text-emerald-400">{prediction.model_performance.precision}%</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Recall</p>
                  <p className="text-sm font-medium text-emerald-400">{prediction.model_performance.recall}%</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">F1 Score</p>
                  <p className="text-sm font-medium text-emerald-400">{prediction.model_performance.f1_score}%</p>
                </div>
              </div>
            </div>
          )}

          {prediction.recommended_actions && prediction.recommended_actions.length > 0 && (
            <div>
              <p className="text-sm font-medium text-slate-400 mb-2">Recommended Actions</p>
              <div className="space-y-2">
                {prediction.recommended_actions.map((action, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-sm text-slate-300 bg-emerald-900/20 border border-emerald-500/20 rounded-lg p-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                    {action}
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}

      {!prediction && !isAnalyzing && (
        <div className="text-center py-8 text-slate-400">
          <Brain className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Click "Run Analysis" to generate AI-powered predictions</p>
          <p className="text-xs text-slate-500 mt-1">Uses advanced machine learning models</p>
        </div>
      )}
    </motion.div>
  );
}