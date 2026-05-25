import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { secureEntity } from '@/lib/secureEntities';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, Cpu, Activity, AlertTriangle, Clock, TrendingDown, 
  Sparkles, ChevronRight, Filter, RefreshCw
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from 'date-fns';
import PredictionPanel from '@/components/predictions/PredictionPanel';
import HealthGauge from '@/components/dashboard/HealthGauge';
import FailurePredictionModule from '@/components/predictions/FailurePredictionModule';
import PullToRefresh from '@/components/mobile/PullToRefresh';

export default function Predictions() {
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [filterRisk, setFilterRisk] = useState('all');
  const queryClient = useQueryClient();

  const { data: equipment = [], isLoading } = useQuery({
    queryKey: ['equipment'],
    queryFn: () => secureEntity('Equipment').list('-created_date', 200),
  });

  const { data: sensorReadings = [] } = useQuery({
    queryKey: ['sensorReadings', selectedEquipment?.id],
    queryFn: () => selectedEquipment 
      ? secureEntity('SensorReading').filter({ equipment_id: selectedEquipment.id }, '-created_date', 200)
      : [],
    enabled: !!selectedEquipment,
  });

  const { data: predictions = [] } = useQuery({
    queryKey: ['predictions'],
    queryFn: () => secureEntity('PredictionLog').list('-created_date', 100),
  });

  const handlePredictionComplete = async (result) => {
    if (selectedEquipment) {
      await secureEntity('Equipment').update(selectedEquipment.id, {
        health_score: Math.max(0, 100 - result.failure_probability),
        risk_level: result.risk_level,
        failure_probability: result.failure_probability,
        remaining_useful_life_days: result.remaining_useful_life_days,
        predicted_failure_date: result.next_maintenance_date
      });
      queryClient.invalidateQueries(['equipment']);
    }
  };

  const filteredEquipment = equipment.filter(e => {
    if (filterRisk === 'all') return true;
    return e.risk_level === filterRisk;
  });

  const atRiskEquipment = equipment.filter(e => 
    e.risk_level === 'high' || e.risk_level === 'critical'
  );

  const getRiskColor = (risk) => {
    const colors = {
      low: 'text-emerald-400 bg-emerald-500/20',
      medium: 'text-amber-400 bg-amber-500/20',
      high: 'text-orange-400 bg-orange-500/20',
      critical: 'text-rose-400 bg-rose-500/20'
    };
    return colors[risk] || colors.low;
  };

  const getStatusColor = (status) => {
    const colors = {
      operational: 'bg-emerald-500',
      degraded: 'bg-amber-500',
      critical: 'bg-rose-500',
      maintenance: 'bg-blue-500',
      offline: 'bg-slate-500'
    };
    return colors[status] || colors.offline;
  };

  return (
    <div className="min-h-screen bg-gray-50 text-slate-900">
      <PullToRefresh onRefresh={async () => { await queryClient.invalidateQueries(['equipment']); await queryClient.invalidateQueries(['predictions']); }}>
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 py-4 sm:py-8" style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 16px)' }}>
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900 flex items-center gap-3">
              <Brain className="w-7 h-7 text-indigo-600" />
              Predictive Analytics
            </h1>
            <p className="text-sm text-slate-500 mt-1">AI-powered failure prediction and remaining useful life estimation</p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={filterRisk} onValueChange={setFilterRisk}>
              <SelectTrigger className="w-40 bg-white border-slate-200">
                <SelectValue placeholder="Risk Level" />
              </SelectTrigger>
              <SelectContent className="bg-white border-slate-200">
                <SelectItem value="all">All Risk Levels</SelectItem>
                <SelectItem value="low">Low Risk</SelectItem>
                <SelectItem value="medium">Medium Risk</SelectItem>
                <SelectItem value="high">High Risk</SelectItem>
                <SelectItem value="critical">Critical Risk</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              variant="outline"
              onClick={() => queryClient.invalidateQueries(['equipment', 'predictions'])}
              className="border-slate-200"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl border border-slate-200 p-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                <Brain className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-slate-900">{predictions.length}</p>
                <p className="text-xs text-slate-500">Predictions Made</p>
              </div>
            </div>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl border border-slate-200 p-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-rose-50 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-rose-600">{atRiskEquipment.length}</p>
                <p className="text-xs text-slate-500">At Risk Assets</p>
              </div>
            </div>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl border border-slate-200 p-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <Cpu className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-slate-900">{equipment.length}</p>
                <p className="text-xs text-slate-500">Monitored Assets</p>
              </div>
            </div>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl border border-slate-200 p-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                <Activity className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-emerald-600">
                  {equipment.length > 0 
                    ? Math.round(equipment.reduce((s, e) => s + (e.health_score || 0), 0) / equipment.length)
                    : 0}%
                </p>
                <p className="text-xs text-slate-500">Avg Fleet Health</p>
              </div>
            </div>
          </motion.div>
        </div>

        <Tabs defaultValue="fleet" className="mb-6">
          <TabsList className="bg-white border border-slate-200">
            <TabsTrigger value="fleet" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
              <Brain className="w-4 h-4 mr-2" />
              Fleet Analysis
            </TabsTrigger>
            <TabsTrigger value="individual" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
              <Cpu className="w-4 h-4 mr-2" />
              Individual Asset
            </TabsTrigger>
          </TabsList>

          <TabsContent value="fleet" className="mt-6">
            <FailurePredictionModule 
              equipment={equipment}
              onPredictionComplete={() => queryClient.invalidateQueries(['equipment', 'predictions'])}
            />
          </TabsContent>

          <TabsContent value="individual" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Equipment List */}
              <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="p-4 border-b border-slate-100">
                <h3 className="text-lg font-semibold text-slate-900">Select Equipment</h3>
                <p className="text-xs text-slate-500">Choose equipment to analyze</p>
              </div>
              <div className="max-h-[600px] overflow-y-auto">
                {filteredEquipment.map((eq, idx) => (
                  <motion.div
                    key={eq.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    onClick={() => setSelectedEquipment(eq)}
                    className={`p-4 border-b border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors ${
                      selectedEquipment?.id === eq.id ? 'bg-indigo-50 border-l-2 border-l-indigo-500' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <HealthGauge score={eq.health_score || 0} size={48} label="" />
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-slate-900">{eq.name}</h4>
                          <p className="text-xs text-slate-500">{eq.type?.replace(/_/g, ' ')}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`w-1.5 h-1.5 rounded-full ${getStatusColor(eq.status)}`} />
                            <Badge className={`text-xs ${getRiskColor(eq.risk_level)}`}>
                              {eq.risk_level || 'low'} risk
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-500" />
                    </div>
                    {eq.failure_probability > 0 && (
                      <div className="mt-3">
                        <div className="flex justify-between text-xs text-slate-500 mb-1">
                          <span>Failure Risk</span>
                          <span>{eq.failure_probability?.toFixed(1)}%</span>
                        </div>
                        <Progress 
                          value={eq.failure_probability} 
                          className="h-1.5"
                        />
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Prediction Panel */}
          <div className="lg:col-span-2">
            {selectedEquipment ? (
              <div className="space-y-6">
                {/* Equipment Summary */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl border border-slate-200 p-6"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-4 bg-indigo-50 rounded-xl">
                      <Cpu className="w-10 h-10 text-indigo-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`w-2 h-2 rounded-full ${getStatusColor(selectedEquipment.status)}`} />
                        <span className="text-sm text-slate-500 capitalize">{selectedEquipment.status}</span>
                      </div>
                      <h2 className="text-2xl font-bold text-slate-900">{selectedEquipment.name}</h2>
                      <p className="text-slate-500">{selectedEquipment.type?.replace(/_/g, ' ')} • {selectedEquipment.location}</p>
                    </div>
                    <HealthGauge score={selectedEquipment.health_score || 0} size={100} />
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-6">
                    <div className="bg-slate-50 rounded-xl p-3 text-center">
                      <Clock className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                      <p className="text-lg font-bold text-slate-900">{selectedEquipment.remaining_useful_life_days || 'N/A'}</p>
                      <p className="text-xs text-slate-500">Days RUL</p>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-3 text-center">
                      <AlertTriangle className="w-5 h-5 text-amber-600 mx-auto mb-1" />
                      <p className="text-lg font-bold text-slate-900">{selectedEquipment.failure_probability?.toFixed(1) || 0}%</p>
                      <p className="text-xs text-slate-500">Failure Risk</p>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-3 text-center">
                      <Activity className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
                      <p className="text-lg font-bold text-slate-900">{selectedEquipment.operating_hours?.toLocaleString() || 0}</p>
                      <p className="text-xs text-slate-500">Op. Hours</p>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-3 text-center">
                      <TrendingDown className="w-5 h-5 text-purple-600 mx-auto mb-1" />
                      <Badge className={getRiskColor(selectedEquipment.risk_level)}>
                        {selectedEquipment.risk_level || 'low'}
                      </Badge>
                      <p className="text-xs text-slate-500 mt-1">Risk Level</p>
                    </div>
                  </div>
                </motion.div>

                {/* AI Prediction Panel */}
                <PredictionPanel
                  equipment={selectedEquipment}
                  sensorReadings={sensorReadings}
                  onPredictionComplete={handlePredictionComplete}
                />

                {/* Recent Predictions */}
                {predictions.filter(p => p.equipment_id === selectedEquipment.id).length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-xl border border-slate-200 p-6"
                  >
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">Prediction History</h3>
                    <div className="space-y-3">
                      {predictions
                        .filter(p => p.equipment_id === selectedEquipment.id)
                        .slice(0, 5)
                        .map((pred, idx) => (
                          <div key={pred.id} className="bg-slate-50 rounded-lg p-3 flex items-center justify-between">
                            <div>
                              <p className="text-sm text-slate-900 capitalize">{pred.prediction_type?.replace(/_/g, ' ')}</p>
                              <p className="text-xs text-slate-500">
                                {format(new Date(pred.created_date), 'MMM d, yyyy HH:mm')}
                              </p>
                            </div>
                            <div className="text-right">
                              <Badge className="bg-purple-100 text-purple-700 border-purple-200">
                                {pred.confidence_score}% confidence
                              </Badge>
                            </div>
                          </div>
                        ))}
                    </div>
                  </motion.div>
                )}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white rounded-xl border border-slate-200 p-12 text-center h-full flex flex-col items-center justify-center"
              >
                <Brain className="w-20 h-20 text-slate-300 mb-4" />
                <h3 className="text-xl font-medium text-slate-600">Select Equipment</h3>
                <p className="text-sm text-slate-500 mt-2 max-w-md">
                  Choose equipment from the list to run AI-powered predictive analysis and get failure probability estimates
                </p>
              </motion.div>
            )}
          </div>
        </div>
          </TabsContent>
        </Tabs>
      </div>
      </PullToRefresh>
    </div>
  );
}