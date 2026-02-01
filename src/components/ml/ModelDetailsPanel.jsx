import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { 
  Brain, X, Target, Activity, TrendingUp, AlertTriangle,
  CheckCircle2, Settings, Trash2, Play, Pause, RefreshCw,
  BarChart3, PieChart, Sliders, History, Zap
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart, Bar, LineChart, Line, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { format } from 'date-fns';

const statusColors = {
  active: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  testing: 'bg-amber-100 text-amber-700 border-amber-200',
  deprecated: 'bg-slate-100 text-slate-600 border-slate-200',
  training: 'bg-blue-100 text-blue-700 border-blue-200'
};

export default function ModelDetailsPanel({ model, onClose, predictions = [] }) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('overview');

  const updateModelMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.MLModel.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['mlmodels'] })
  });

  const deleteModelMutation = useMutation({
    mutationFn: (id) => base44.entities.MLModel.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mlmodels'] });
      onClose();
    }
  });

  if (!model) return null;

  const modelPredictions = predictions.filter(p => p.model_version === model.version);
  
  // Performance metrics for radar chart
  const performanceData = [
    { metric: 'Accuracy', value: model.accuracy_score || 0, fullMark: 100 },
    { metric: 'Precision', value: (model.performance_metrics?.precision || 0) * 100, fullMark: 100 },
    { metric: 'Recall', value: (model.performance_metrics?.recall || 0) * 100, fullMark: 100 },
    { metric: 'F1 Score', value: (model.performance_metrics?.f1_score || 0) * 100, fullMark: 100 },
    { metric: 'Low FPR', value: (1 - (model.false_positive_rate || 0)) * 100, fullMark: 100 },
    { metric: 'Low FNR', value: (1 - (model.false_negative_rate || 0)) * 100, fullMark: 100 },
  ];

  // Feature importance data
  const featureImportance = model.feature_importance 
    ? Object.entries(model.feature_importance)
        .map(([feature, importance]) => ({
          feature: feature.replace(/_/g, ' '),
          importance: parseFloat(importance) * 100
        }))
        .sort((a, b) => b.importance - a.importance)
    : [];

  // Simulated prediction confidence distribution
  const confidenceDistribution = [
    { range: '90-100%', count: Math.floor(Math.random() * 100 + 200) },
    { range: '80-90%', count: Math.floor(Math.random() * 80 + 150) },
    { range: '70-80%', count: Math.floor(Math.random() * 60 + 100) },
    { range: '60-70%', count: Math.floor(Math.random() * 40 + 50) },
    { range: '<60%', count: Math.floor(Math.random() * 20 + 10) },
  ];

  const handleStatusChange = (newStatus) => {
    updateModelMutation.mutate({
      id: model.id,
      data: { status: newStatus }
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 300 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 300 }}
      className="fixed right-0 top-0 h-screen w-[600px] bg-white border-l border-slate-200 shadow-2xl z-50 overflow-y-auto"
    >
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-slate-200 p-4 z-10">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-600" />
              {model.model_name}
            </h2>
            <p className="text-sm text-slate-500 capitalize mt-1">
              {model.model_type?.replace(/_/g, ' ')} • v{model.version}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={statusColors[model.status]}>{model.status}</Badge>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2 mt-4">
          {model.status === 'testing' && (
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={() => handleStatusChange('active')}>
              <Play className="w-3 h-3 mr-1" /> Deploy
            </Button>
          )}
          {model.status === 'active' && (
            <Button size="sm" variant="outline" onClick={() => handleStatusChange('deprecated')}>
              <Pause className="w-3 h-3 mr-1" /> Deprecate
            </Button>
          )}
          <Button size="sm" variant="outline">
            <RefreshCw className="w-3 h-3 mr-1" /> Retrain
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            className="text-red-600 hover:bg-red-50"
            onClick={() => deleteModelMutation.mutate(model.id)}
          >
            <Trash2 className="w-3 h-3 mr-1" /> Delete
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-slate-100 w-full">
            <TabsTrigger value="overview" className="flex-1">Overview</TabsTrigger>
            <TabsTrigger value="performance" className="flex-1">Performance</TabsTrigger>
            <TabsTrigger value="features" className="flex-1">Features</TabsTrigger>
            <TabsTrigger value="config" className="flex-1">Config</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-4 space-y-4">
            {/* Key Metrics */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-emerald-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Target className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs text-emerald-700">Accuracy</span>
                </div>
                <p className="text-2xl font-bold text-emerald-700">{model.accuracy_score || 0}%</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Activity className="w-4 h-4 text-blue-600" />
                  <span className="text-xs text-blue-700">Training Samples</span>
                </div>
                <p className="text-2xl font-bold text-blue-700">{(model.training_data_size || 0).toLocaleString()}</p>
              </div>
            </div>

            {/* Performance Radar */}
            <div className="bg-slate-50 rounded-lg p-4">
              <h4 className="font-medium text-slate-900 mb-3">Performance Overview</h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={performanceData}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis dataKey="metric" tick={{ fill: '#64748b', fontSize: 11 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 10 }} />
                    <Radar
                      name="Performance"
                      dataKey="value"
                      stroke="#8b5cf6"
                      fill="#8b5cf6"
                      fillOpacity={0.3}
                    />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Model Info */}
            <div className="bg-slate-50 rounded-lg p-4 space-y-3">
              <h4 className="font-medium text-slate-900">Model Information</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Algorithm</span>
                  <span className="font-medium capitalize">{model.algorithm?.replace(/_/g, ' ')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Equipment Type</span>
                  <span className="font-medium capitalize">{model.equipment_type?.replace(/_/g, ' ') || 'All'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Training Date</span>
                  <span className="font-medium">
                    {model.training_date ? format(new Date(model.training_date), 'MMM d, yyyy') : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Last Validation</span>
                  <span className="font-medium">
                    {model.last_validation_date ? format(new Date(model.last_validation_date), 'MMM d, yyyy') : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="mt-4 space-y-4">
            {/* Detailed Metrics */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-slate-50 rounded-lg p-3 text-center">
                <p className="text-lg font-bold text-slate-900">
                  {model.performance_metrics?.precision?.toFixed(3) || 'N/A'}
                </p>
                <p className="text-xs text-slate-500">Precision</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-3 text-center">
                <p className="text-lg font-bold text-slate-900">
                  {model.performance_metrics?.recall?.toFixed(3) || 'N/A'}
                </p>
                <p className="text-xs text-slate-500">Recall</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-3 text-center">
                <p className="text-lg font-bold text-slate-900">
                  {model.performance_metrics?.f1_score?.toFixed(3) || 'N/A'}
                </p>
                <p className="text-xs text-slate-500">F1 Score</p>
              </div>
            </div>

            {/* Error Rates */}
            <div className="bg-slate-50 rounded-lg p-4">
              <h4 className="font-medium text-slate-900 mb-3">Error Rates</h4>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-500">False Positive Rate</span>
                    <span className="text-red-600">{((model.false_positive_rate || 0) * 100).toFixed(2)}%</span>
                  </div>
                  <Progress value={(model.false_positive_rate || 0) * 100} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-500">False Negative Rate</span>
                    <span className="text-orange-600">{((model.false_negative_rate || 0) * 100).toFixed(2)}%</span>
                  </div>
                  <Progress value={(model.false_negative_rate || 0) * 100} className="h-2" />
                </div>
              </div>
            </div>

            {/* Confidence Distribution */}
            <div className="bg-slate-50 rounded-lg p-4">
              <h4 className="font-medium text-slate-900 mb-3">Prediction Confidence Distribution</h4>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={confidenceDistribution}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="range" tick={{ fill: '#64748b', fontSize: 10 }} />
                    <YAxis tick={{ fill: '#64748b', fontSize: 10 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {model.mean_absolute_error && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span className="text-sm text-amber-800">
                    Mean Absolute Error: <strong>{model.mean_absolute_error} days</strong>
                  </span>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Features Tab */}
          <TabsContent value="features" className="mt-4 space-y-4">
            <div className="bg-slate-50 rounded-lg p-4">
              <h4 className="font-medium text-slate-900 mb-3">Input Features ({model.features?.length || 0})</h4>
              <div className="flex flex-wrap gap-2">
                {model.features?.map(feature => (
                  <Badge key={feature} variant="outline" className="capitalize">
                    {feature.replace(/_/g, ' ')}
                  </Badge>
                ))}
              </div>
            </div>

            {featureImportance.length > 0 && (
              <div className="bg-slate-50 rounded-lg p-4">
                <h4 className="font-medium text-slate-900 mb-3">Feature Importance</h4>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={featureImportance} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis type="number" tick={{ fill: '#64748b', fontSize: 10 }} domain={[0, 100]} />
                      <YAxis dataKey="feature" type="category" tick={{ fill: '#64748b', fontSize: 10 }} width={80} />
                      <Tooltip />
                      <Bar dataKey="importance" fill="#10b981" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Config Tab */}
          <TabsContent value="config" className="mt-4 space-y-4">
            <div className="bg-slate-50 rounded-lg p-4">
              <h4 className="font-medium text-slate-900 mb-3">Hyperparameters</h4>
              {model.hyperparameters ? (
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {Object.entries(model.hyperparameters).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-slate-500 capitalize">{key.replace(/_/g, ' ')}</span>
                      <span className="font-medium">{String(value)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500">No hyperparameters configured</p>
              )}
            </div>

            <div className="bg-slate-50 rounded-lg p-4">
              <h4 className="font-medium text-slate-900 mb-3">Model Artifacts</h4>
              <div className="text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Model File</span>
                  <span className="font-medium text-purple-600">
                    {model.model_artifacts_url ? 'Available' : 'Not stored'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Version</span>
                  <span className="font-medium">{model.version}</span>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </motion.div>
  );
}