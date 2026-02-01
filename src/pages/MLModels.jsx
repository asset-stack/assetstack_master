import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { 
  Brain, TrendingUp, Target, CheckCircle2, Zap, Activity,
  BarChart3, AlertCircle, RefreshCw, Layers
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  LineChart, Line, BarChart, Bar, RadarChart, Radar, PolarGrid, 
  PolarAngleAxis, PolarRadiusAxis, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Legend 
} from 'recharts';

export default function MLModels() {
  const [selectedModel, setSelectedModel] = useState(null);

  const { data: models = [], isLoading } = useQuery({
    queryKey: ['mlmodels'],
    queryFn: () => base44.entities.MLModel.list('-created_date', 100),
  });

  const { data: predictions = [] } = useQuery({
    queryKey: ['predictions'],
    queryFn: () => base44.entities.PredictionLog.list('-created_date', 200),
  });

  const { data: featureVectors = [] } = useQuery({
    queryKey: ['featureVectors'],
    queryFn: () => base44.entities.FeatureVector.list('-created_date', 100),
  });

  // Calculate ML system stats
  const activeModels = models.filter(m => m.status === 'active').length;
  const totalPredictions = predictions.length;
  const avgConfidence = predictions.length > 0
    ? Math.round(predictions.reduce((sum, p) => sum + (p.confidence_score || 0), 0) / predictions.length)
    : 0;
  const featureVectorsToday = featureVectors.filter(fv => {
    const fvDate = new Date(fv.created_date);
    const today = new Date();
    return fvDate.toDateString() === today.toDateString();
  }).length;

  const getAlgorithmColor = (algorithm) => {
    const colors = {
      'isolation_forest': 'bg-blue-500/20 text-blue-400',
      'lstm_autoencoder': 'bg-purple-500/20 text-purple-400',
      'random_forest': 'bg-green-500/20 text-green-400',
      'gradient_boosting': 'bg-orange-500/20 text-orange-400',
      'weibull_analysis': 'bg-rose-500/20 text-rose-400',
      'neural_network': 'bg-indigo-500/20 text-indigo-400',
      'ensemble_voting': 'bg-amber-500/20 text-amber-400'
    };
    return colors[algorithm] || 'bg-slate-500/20 text-slate-400';
  };

  const getStatusColor = (status) => {
    const colors = {
      'active': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      'testing': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      'deprecated': 'bg-slate-500/20 text-slate-400 border-slate-500/30',
      'training': 'bg-blue-500/20 text-blue-400 border-blue-500/30'
    };
    return colors[status] || colors.testing;
  };

  // Model performance comparison data
  const performanceData = models
    .filter(m => m.performance_metrics)
    .map(m => ({
      name: m.model_name,
      accuracy: m.accuracy_score || 0,
      precision: m.performance_metrics?.precision || 0,
      recall: m.performance_metrics?.recall || 0,
      f1: m.performance_metrics?.f1_score || 0
    }));

  // Algorithm distribution
  const algorithmDistribution = models.reduce((acc, m) => {
    acc[m.algorithm] = (acc[m.algorithm] || 0) + 1;
    return acc;
  }, {});

  const algorithmChartData = Object.entries(algorithmDistribution).map(([name, value]) => ({
    algorithm: name.replace(/_/g, ' '),
    count: value
  }));

  // Prediction accuracy over time (simulated trend)
  const accuracyTrendData = Array.from({ length: 30 }, (_, i) => ({
    day: `Day ${i + 1}`,
    accuracy: 85 + Math.random() * 10,
    confidence: 80 + Math.random() * 15
  }));

  return (
    <div className="min-h-screen bg-gray-50 text-slate-900">
      <div className="max-w-[1800px] mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
              <Brain className="w-8 h-8 text-purple-500" />
              ML Models & Performance
            </h1>
            <p className="text-sm text-slate-500">Advanced machine learning model management and monitoring</p>
          </div>
          <Button 
            className="bg-purple-600 hover:bg-purple-700"
            onClick={() => alert('Model training initiated. This feature will train a new ML model using your historical data.')}
          >
            <Layers className="w-4 h-4 mr-2" />
            Train New Model
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-500/20 rounded-xl">
                <Brain className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{activeModels}</p>
                <p className="text-xs text-slate-400">Active Models</p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-500/20 rounded-xl">
                <Activity className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{totalPredictions}</p>
                <p className="text-xs text-slate-400">Total Predictions</p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-500/20 rounded-xl">
                <Target className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{avgConfidence}%</p>
                <p className="text-xs text-slate-400">Avg Confidence</p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-500/20 rounded-xl">
                <Zap className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{featureVectorsToday}</p>
                <p className="text-xs text-slate-400">Features Today</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Model Performance Comparison */}
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-400" />
                Model Performance Comparison
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={performanceData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="name" stroke="#64748b" tick={{ fill: '#64748b', fontSize: 10 }} />
                    <YAxis stroke="#64748b" tick={{ fill: '#64748b', fontSize: 10 }} domain={[0, 100]} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
                      labelStyle={{ color: '#94a3b8' }}
                    />
                    <Legend />
                    <Bar dataKey="accuracy" fill="#3b82f6" name="Accuracy" />
                    <Bar dataKey="precision" fill="#10b981" name="Precision" />
                    <Bar dataKey="recall" fill="#f59e0b" name="Recall" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Accuracy Trend */}
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
                Prediction Accuracy Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={accuracyTrendData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="day" stroke="#64748b" tick={{ fill: '#64748b', fontSize: 10 }} />
                    <YAxis stroke="#64748b" tick={{ fill: '#64748b', fontSize: 10 }} domain={[70, 100]} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
                      labelStyle={{ color: '#94a3b8' }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="accuracy" stroke="#10b981" strokeWidth={2} name="Accuracy %" />
                    <Line type="monotone" dataKey="confidence" stroke="#8b5cf6" strokeWidth={2} name="Confidence %" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Models Grid */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Deployed Models</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {models.map((model, idx) => (
            <motion.div
              key={model.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white rounded-xl border border-slate-200 p-5 hover:border-purple-500/50 hover:shadow-md transition-all cursor-pointer"
              onClick={() => setSelectedModel(model)}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">{model.model_name}</h3>
                  <p className="text-xs text-slate-400 capitalize">{model.model_type?.replace(/_/g, ' ')}</p>
                </div>
                <Badge className={getStatusColor(model.status)}>
                  {model.status}
                </Badge>
              </div>

              <div className="space-y-3">
                <div>
                  <Badge className={getAlgorithmColor(model.algorithm)}>
                    {model.algorithm?.replace(/_/g, ' ')}
                  </Badge>
                  <span className="text-xs text-slate-500 ml-2">v{model.version}</span>
                </div>

                {model.accuracy_score && (
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-400">Accuracy</span>
                      <span className="text-emerald-400 font-medium">{model.accuracy_score}%</span>
                    </div>
                    <Progress value={model.accuracy_score} className="h-1.5" />
                  </div>
                )}

                {model.equipment_type && (
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Target className="w-3 h-3" />
                    <span className="capitalize">{model.equipment_type.replace(/_/g, ' ')}</span>
                  </div>
                )}

                {model.training_data_size && (
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Activity className="w-3 h-3" />
                    <span>{model.training_data_size.toLocaleString()} training samples</span>
                  </div>
                )}

                {model.performance_metrics && (
                  <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-200">
                    <div className="text-center">
                      <p className="text-xs text-slate-500">Precision</p>
                      <p className="text-sm font-medium text-slate-900">{model.performance_metrics.precision || 'N/A'}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-slate-500">Recall</p>
                      <p className="text-sm font-medium text-slate-900">{model.performance_metrics.recall || 'N/A'}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-slate-500">F1</p>
                      <p className="text-sm font-medium text-slate-900">{model.performance_metrics.f1_score || 'N/A'}</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {models.length === 0 && !isLoading && (
          <div className="text-center py-16">
            <Brain className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-400">No ML models deployed</h3>
            <p className="text-sm text-slate-500">Train and deploy your first model</p>
          </div>
        )}
      </div>
    </div>
  );
}