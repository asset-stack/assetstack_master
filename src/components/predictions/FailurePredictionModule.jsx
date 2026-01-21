import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, AlertTriangle, TrendingUp, Activity, Clock, 
  Loader2, RefreshCw, ChevronDown, ChevronUp, Zap,
  Shield, Target, Calendar
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { base44 } from '@/api/base44Client';
import { format } from 'date-fns';

export default function FailurePredictionModule({ equipment = [], onPredictionComplete }) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [predictions, setPredictions] = useState([]);
  const [expandedAsset, setExpandedAsset] = useState(null);
  const [lastAnalysis, setLastAnalysis] = useState(null);

  const runPrediction = async (equipmentId = null) => {
    setIsAnalyzing(true);
    try {
      const result = await base44.functions.invoke('predictAssetFailures', {
        equipment_id: equipmentId
      });
      
      if (result.data.success) {
        setPredictions(result.data.results);
        setLastAnalysis(new Date());
        if (onPredictionComplete) {
          onPredictionComplete(result.data);
        }
      }
    } catch (error) {
      console.error('Prediction failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getRiskColor = (level) => ({
    critical: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
    high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    medium: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    low: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
  }[level] || 'bg-slate-500/20 text-slate-400');

  const getHealthColor = (score) => {
    if (score >= 80) return 'text-emerald-400';
    if (score >= 60) return 'text-amber-400';
    if (score >= 40) return 'text-orange-400';
    return 'text-rose-400';
  };

  const criticalAssets = predictions.filter(p => p.prediction.riskLevel === 'critical');
  const highRiskAssets = predictions.filter(p => p.prediction.riskLevel === 'high');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-500/20 rounded-xl">
            <Brain className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">AI Failure Prediction</h3>
            <p className="text-sm text-slate-400">
              {lastAnalysis 
                ? `Last analysis: ${format(lastAnalysis, 'MMM d, HH:mm')}`
                : 'Analyze sensor data and maintenance history'
              }
            </p>
          </div>
        </div>
        <Button
          onClick={() => runPrediction()}
          disabled={isAnalyzing}
          className="bg-purple-600 hover:bg-purple-700"
        >
          {isAnalyzing ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4 mr-2" />
          )}
          {isAnalyzing ? 'Analyzing...' : 'Run Analysis'}
        </Button>
      </div>

      {/* Summary Cards */}
      {predictions.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-900/50 rounded-xl border border-slate-700/50 p-4">
            <div className="flex items-center gap-2 text-slate-400 mb-2">
              <Target className="w-4 h-4" />
              <span className="text-sm">Analyzed</span>
            </div>
            <p className="text-2xl font-bold text-white">{predictions.length}</p>
            <p className="text-xs text-slate-500">assets</p>
          </div>
          
          <div className="bg-slate-900/50 rounded-xl border border-rose-500/30 p-4">
            <div className="flex items-center gap-2 text-rose-400 mb-2">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm">Critical</span>
            </div>
            <p className="text-2xl font-bold text-rose-400">{criticalAssets.length}</p>
            <p className="text-xs text-slate-500">need immediate action</p>
          </div>
          
          <div className="bg-slate-900/50 rounded-xl border border-orange-500/30 p-4">
            <div className="flex items-center gap-2 text-orange-400 mb-2">
              <Zap className="w-4 h-4" />
              <span className="text-sm">High Risk</span>
            </div>
            <p className="text-2xl font-bold text-orange-400">{highRiskAssets.length}</p>
            <p className="text-xs text-slate-500">require attention</p>
          </div>
          
          <div className="bg-slate-900/50 rounded-xl border border-slate-700/50 p-4">
            <div className="flex items-center gap-2 text-slate-400 mb-2">
              <Shield className="w-4 h-4" />
              <span className="text-sm">Avg Health</span>
            </div>
            <p className="text-2xl font-bold text-white">
              {predictions.length > 0 
                ? Math.round(predictions.reduce((a, p) => a + p.prediction.healthScore, 0) / predictions.length)
                : 0}%
            </p>
            <p className="text-xs text-slate-500">fleet average</p>
          </div>
        </div>
      )}

      {/* Predictions List */}
      {predictions.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-slate-400">Prediction Results</h4>
          
          <AnimatePresence>
            {predictions
              .sort((a, b) => b.prediction.probability - a.prediction.probability)
              .map((pred, idx) => (
                <motion.div
                  key={pred.asset_id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-slate-900/50 rounded-xl border border-slate-700/50 overflow-hidden"
                >
                  <div 
                    className="p-4 cursor-pointer hover:bg-slate-800/30 transition-colors"
                    onClick={() => setExpandedAsset(expandedAsset === pred.asset_id ? null : pred.asset_id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center">
                          <span className={`text-2xl font-bold ${getHealthColor(pred.prediction.healthScore)}`}>
                            {pred.prediction.healthScore}
                          </span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h5 className="font-semibold text-white">{pred.asset_name}</h5>
                            <Badge variant="outline" className={getRiskColor(pred.prediction.riskLevel)}>
                              {pred.prediction.riskLevel.toUpperCase()}
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-400">
                            {pred.asset_type?.replace(/_/g, ' ')} • {pred.prediction.confidence}% confidence
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-lg font-bold text-white">{pred.prediction.probability}%</p>
                          <p className="text-xs text-slate-500">failure probability</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-blue-400">{pred.prediction.rulDays}</p>
                          <p className="text-xs text-slate-500">days RUL</p>
                        </div>
                        {expandedAsset === pred.asset_id ? (
                          <ChevronUp className="w-5 h-5 text-slate-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-slate-400" />
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <Progress 
                        value={100 - pred.prediction.probability} 
                        className="h-2 bg-slate-700"
                      />
                    </div>
                  </div>

                  <AnimatePresence>
                    {expandedAsset === pred.asset_id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-slate-700/50"
                      >
                        <div className="p-4 space-y-4">
                          {/* Risk Factors */}
                          {pred.prediction.riskFactors.length > 0 && (
                            <div>
                              <p className="text-xs font-medium text-slate-400 mb-2">Risk Factors</p>
                              <div className="flex flex-wrap gap-2">
                                {pred.prediction.riskFactors.map((factor, i) => (
                                  <Badge key={i} variant="outline" className="bg-rose-500/10 text-rose-300 border-rose-500/30">
                                    {factor}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Warnings */}
                          {pred.warnings.warnings.length > 0 && (
                            <div>
                              <p className="text-xs font-medium text-slate-400 mb-2">Warnings</p>
                              <div className="space-y-2">
                                {pred.warnings.warnings.map((warning, i) => (
                                  <div 
                                    key={i}
                                    className={`p-3 rounded-lg flex items-start gap-3 ${
                                      warning.level === 'emergency' 
                                        ? 'bg-rose-500/10 border border-rose-500/30'
                                        : warning.level === 'warning'
                                        ? 'bg-amber-500/10 border border-amber-500/30'
                                        : 'bg-blue-500/10 border border-blue-500/30'
                                    }`}
                                  >
                                    <AlertTriangle className={`w-4 h-4 mt-0.5 ${
                                      warning.level === 'emergency' ? 'text-rose-400' : 
                                      warning.level === 'warning' ? 'text-amber-400' : 'text-blue-400'
                                    }`} />
                                    <div>
                                      <p className="text-sm text-white">{warning.message}</p>
                                      <p className="text-xs text-slate-400 mt-1">{warning.action}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Recommendations */}
                          {pred.warnings.recommendations.length > 0 && (
                            <div>
                              <p className="text-xs font-medium text-slate-400 mb-2">AI Recommendations</p>
                              <ul className="space-y-1">
                                {pred.warnings.recommendations.map((rec, i) => (
                                  <li key={i} className="text-sm text-slate-300 flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                                    {rec}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Predicted Failure Date */}
                          <div className="flex items-center gap-2 pt-2 border-t border-slate-700/50">
                            <Calendar className="w-4 h-4 text-slate-400" />
                            <span className="text-sm text-slate-400">Predicted failure by:</span>
                            <span className="text-sm font-medium text-white">
                              {format(new Date(pred.prediction.predictedDate), 'MMMM d, yyyy')}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
          </AnimatePresence>
        </div>
      )}

      {/* Empty State */}
      {predictions.length === 0 && !isAnalyzing && (
        <div className="text-center py-12 bg-slate-900/30 rounded-xl border border-slate-700/50">
          <Brain className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-slate-400 mb-2">No Predictions Yet</h4>
          <p className="text-sm text-slate-500 mb-4">
            Run AI analysis to predict potential failures across all assets
          </p>
          <Button onClick={() => runPrediction()} className="bg-purple-600 hover:bg-purple-700">
            <Brain className="w-4 h-4 mr-2" />
            Start Analysis
          </Button>
        </div>
      )}

      {/* Loading State */}
      {isAnalyzing && (
        <div className="text-center py-12 bg-slate-900/30 rounded-xl border border-purple-500/30">
          <Loader2 className="w-12 h-12 text-purple-400 mx-auto mb-4 animate-spin" />
          <h4 className="text-lg font-medium text-white mb-2">Analyzing Assets...</h4>
          <p className="text-sm text-slate-400">
            Processing sensor data, maintenance history, and operational parameters
          </p>
        </div>
      )}
    </div>
  );
}