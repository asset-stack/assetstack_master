import React from 'react';
import { motion } from 'framer-motion';
import { 
  AlertTriangle, TrendingDown, TrendingUp, Activity, 
  RefreshCw, CheckCircle2, XCircle
} from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts';

export default function ModelDriftMonitor({ models = [], predictions = [] }) {
  // Calculate drift metrics for each model
  const modelDriftData = models.filter(m => m.status === 'active').map(model => {
    // Simulate drift detection
    const baseAccuracy = model.accuracy_score || 85;
    const currentAccuracy = baseAccuracy - (Math.random() * 5);
    const drift = baseAccuracy - currentAccuracy;
    const driftPercent = (drift / baseAccuracy) * 100;
    
    // Simulate confidence trend
    const confidenceTrend = Array.from({ length: 14 }, (_, i) => ({
      day: `Day ${i + 1}`,
      confidence: baseAccuracy - (i * (drift / 14)) + (Math.random() * 2 - 1),
      baseline: baseAccuracy
    }));

    return {
      ...model,
      currentAccuracy: currentAccuracy.toFixed(1),
      drift: drift.toFixed(2),
      driftPercent: driftPercent.toFixed(1),
      status: driftPercent > 5 ? 'critical' : driftPercent > 2 ? 'warning' : 'healthy',
      confidenceTrend,
      predictionsLastWeek: Math.floor(Math.random() * 500 + 100),
      dataDistributionShift: (Math.random() * 0.1).toFixed(3),
      featureDrift: model.features?.slice(0, 3).map(f => ({
        feature: f,
        drift: (Math.random() * 0.15).toFixed(3)
      })) || []
    };
  });

  const criticalCount = modelDriftData.filter(m => m.status === 'critical').length;
  const warningCount = modelDriftData.filter(m => m.status === 'warning').length;

  const getStatusIcon = (status) => {
    switch (status) {
      case 'critical': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      default: return <CheckCircle2 className="w-4 h-4 text-green-500" />;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'critical': return 'bg-red-100 text-red-700 border-red-200';
      case 'warning': return 'bg-amber-100 text-amber-700 border-amber-200';
      default: return 'bg-green-100 text-green-700 border-green-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Model Drift Monitor</h3>
          <p className="text-sm text-slate-500">Real-time performance degradation detection</p>
        </div>
        <div className="flex items-center gap-3">
          {criticalCount > 0 && (
            <Badge className="bg-red-100 text-red-700">
              {criticalCount} Critical
            </Badge>
          )}
          {warningCount > 0 && (
            <Badge className="bg-amber-100 text-amber-700">
              {warningCount} Warning
            </Badge>
          )}
          <Button variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-1" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Model Drift Cards */}
      <div className="space-y-4">
        {modelDriftData.map((model, idx) => (
          <motion.div
            key={model.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={`bg-white rounded-xl border p-4 ${
              model.status === 'critical' ? 'border-red-200' : 
              model.status === 'warning' ? 'border-amber-200' : 'border-slate-200'
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                {getStatusIcon(model.status)}
                <div>
                  <h4 className="font-semibold text-slate-900">{model.model_name}</h4>
                  <p className="text-xs text-slate-500 capitalize">
                    {model.algorithm?.replace(/_/g, ' ')} • v{model.version}
                  </p>
                </div>
              </div>
              <Badge className={getStatusBadge(model.status)}>
                {model.status === 'critical' ? 'Drift Detected' : 
                 model.status === 'warning' ? 'Minor Drift' : 'Healthy'}
              </Badge>
            </div>

            <div className="grid grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <p className="text-lg font-bold text-slate-900">{model.currentAccuracy}%</p>
                <p className="text-xs text-slate-500">Current Accuracy</p>
              </div>
              <div className="text-center">
                <p className={`text-lg font-bold ${
                  parseFloat(model.drift) > 2 ? 'text-red-600' : 
                  parseFloat(model.drift) > 1 ? 'text-amber-600' : 'text-green-600'
                }`}>
                  -{model.drift}%
                </p>
                <p className="text-xs text-slate-500">Drift</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-slate-900">{model.dataDistributionShift}</p>
                <p className="text-xs text-slate-500">Distribution Shift</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-slate-900">{model.predictionsLastWeek}</p>
                <p className="text-xs text-slate-500">Predictions (7d)</p>
              </div>
            </div>

            {/* Confidence Trend Chart */}
            <div className="h-32 mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={model.confidenceTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                  <YAxis domain={['dataMin - 2', 'dataMax + 2']} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                  <Tooltip />
                  <ReferenceLine y={model.accuracy_score} stroke="#10b981" strokeDasharray="5 5" />
                  <Line 
                    type="monotone" 
                    dataKey="confidence" 
                    stroke={model.status === 'critical' ? '#ef4444' : model.status === 'warning' ? '#f59e0b' : '#8b5cf6'} 
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Feature Drift */}
            {model.featureDrift.length > 0 && (
              <div className="bg-slate-50 rounded-lg p-3">
                <h5 className="text-xs font-medium text-slate-500 uppercase mb-2">Feature Drift</h5>
                <div className="space-y-2">
                  {model.featureDrift.map(({ feature, drift }) => (
                    <div key={feature} className="flex items-center justify-between text-sm">
                      <span className="text-slate-600 capitalize">{feature.replace(/_/g, ' ')}</span>
                      <div className="flex items-center gap-2">
                        <Progress value={parseFloat(drift) * 100} className="w-20 h-1.5" />
                        <span className={`text-xs font-medium ${
                          parseFloat(drift) > 0.1 ? 'text-red-600' : 'text-slate-500'
                        }`}>{drift}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {model.status !== 'healthy' && (
              <div className="flex justify-end mt-3 gap-2">
                <Button variant="outline" size="sm">
                  Investigate
                </Button>
                <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                  <RefreshCw className="w-3 h-3 mr-1" />
                  Retrain Model
                </Button>
              </div>
            )}
          </motion.div>
        ))}

        {modelDriftData.length === 0 && (
          <div className="text-center py-8 bg-slate-50 rounded-lg">
            <Activity className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No active models to monitor</p>
          </div>
        )}
      </div>
    </div>
  );
}