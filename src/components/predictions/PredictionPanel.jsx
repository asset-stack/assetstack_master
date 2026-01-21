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
      // Prepare sensor data summary
      const sensorSummary = sensorReadings.reduce((acc, r) => {
        if (!acc[r.sensor_type]) {
          acc[r.sensor_type] = { values: [], anomalies: 0 };
        }
        acc[r.sensor_type].values.push(r.value);
        if (r.is_anomaly) acc[r.sensor_type].anomalies++;
        return acc;
      }, {});

      const sensorStats = Object.entries(sensorSummary).map(([type, data]) => ({
        type,
        avg: data.values.reduce((a, b) => a + b, 0) / data.values.length,
        max: Math.max(...data.values),
        min: Math.min(...data.values),
        anomalyCount: data.anomalies,
        trend: data.values.length > 1 ? 
          (data.values[data.values.length - 1] > data.values[0] ? 'increasing' : 'decreasing') : 'stable'
      }));

      const prompt = `You are an advanced predictive maintenance AI system. Analyze the following equipment data and provide a detailed failure prediction.

Equipment Information:
- Name: ${equipment.name}
- Type: ${equipment.type}
- Operating Hours: ${equipment.operating_hours || 'Unknown'}
- Current Health Score: ${equipment.health_score || 'Unknown'}%
- Installation Date: ${equipment.installation_date || 'Unknown'}
- Last Maintenance: ${equipment.last_maintenance_date || 'Unknown'}
- Criticality: ${equipment.criticality || 'medium'}

Sensor Data Summary (last 24 hours):
${sensorStats.map(s => `- ${s.type}: avg=${s.avg.toFixed(2)}, max=${s.max.toFixed(2)}, min=${s.min.toFixed(2)}, anomalies=${s.anomalyCount}, trend=${s.trend}`).join('\n')}

Based on this data, provide a comprehensive predictive maintenance analysis.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            failure_probability: {
              type: "number",
              description: "Probability of failure in the next 30 days (0-100)"
            },
            remaining_useful_life_days: {
              type: "number",
              description: "Estimated remaining useful life in days"
            },
            confidence_score: {
              type: "number",
              description: "Model confidence in this prediction (0-100)"
            },
            risk_level: {
              type: "string",
              enum: ["low", "medium", "high", "critical"]
            },
            primary_failure_mode: {
              type: "string",
              description: "Most likely failure mode"
            },
            risk_factors: {
              type: "array",
              items: { type: "string" },
              description: "Key risk factors identified"
            },
            recommended_actions: {
              type: "array",
              items: { type: "string" },
              description: "Recommended maintenance actions"
            },
            degradation_indicators: {
              type: "array",
              items: { type: "string" },
              description: "Signs of degradation detected"
            },
            next_maintenance_date: {
              type: "string",
              description: "Recommended next maintenance date (YYYY-MM-DD format)"
            },
            analysis_summary: {
              type: "string",
              description: "Brief summary of the analysis"
            }
          },
          required: ["failure_probability", "remaining_useful_life_days", "risk_level", "recommended_actions"]
        }
      });

      setPrediction(result);
      
      // Update equipment with new predictions
      if (onPredictionComplete) {
        onPredictionComplete(result);
      }

      // Log the prediction
      await base44.entities.PredictionLog.create({
        equipment_id: equipment.id,
        prediction_type: 'failure_probability',
        model_version: 'LLM-v1',
        input_features: { sensorStats, equipment_data: { operating_hours: equipment.operating_hours, health_score: equipment.health_score } },
        prediction_result: result,
        confidence_score: result.confidence_score,
        risk_factors: result.risk_factors,
        recommendations: result.recommended_actions
      });

    } catch (error) {
      console.error('Prediction failed:', error);
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