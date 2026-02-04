import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { 
  Search, AlertTriangle, CheckCircle2, Target, Zap, ChevronRight,
  Clock, Wrench, Brain, FileText, X
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { format } from 'date-fns';

export default function RootCausePanel({ equipment = [], alerts = [] }) {
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const queryClient = useQueryClient();

  const { data: analyses = [] } = useQuery({
    queryKey: ['rootCauseAnalyses'],
    queryFn: () => base44.entities.RootCauseAnalysis.list('-created_date', 100),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.RootCauseAnalysis.create(data),
    onSuccess: () => queryClient.invalidateQueries(['rootCauseAnalyses']),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.RootCauseAnalysis.update(id, data),
    onSuccess: () => queryClient.invalidateQueries(['rootCauseAnalyses']),
  });

  const equipmentMap = (equipment || []).reduce((acc, e) => { acc[e.id] = e; return acc; }, {});

  const getSeverityConfig = (severity) => {
    const configs = {
      critical: { color: 'bg-rose-50 text-rose-700 border-rose-200', icon: AlertTriangle },
      high: { color: 'bg-orange-50 text-orange-700 border-orange-200', icon: AlertTriangle },
      medium: { color: 'bg-amber-50 text-amber-700 border-amber-200', icon: Zap },
      low: { color: 'bg-blue-50 text-blue-700 border-blue-200', icon: Target }
    };
    return configs[severity] || configs.medium;
  };

  const getStatusConfig = (status) => {
    const configs = {
      pending_review: { color: 'bg-slate-100 text-slate-600', label: 'Pending Review' },
      investigating: { color: 'bg-blue-50 text-blue-700', label: 'Investigating' },
      action_taken: { color: 'bg-violet-50 text-violet-700', label: 'Action Taken' },
      resolved: { color: 'bg-emerald-50 text-emerald-700', label: 'Resolved' },
      false_positive: { color: 'bg-slate-100 text-slate-500', label: 'False Positive' }
    };
    return configs[status] || configs.pending_review;
  };

  // Trigger AI analysis for an alert using LLM
  const runAIAnalysis = async (alert) => {
    setIsAnalyzing(true);
    
    const eq = equipmentMap[alert.equipment_id];
    
    try {
      // Use AI to generate real root cause analysis
      const analysisResult = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an expert industrial maintenance engineer performing root cause analysis.

Alert Details:
- Equipment: ${eq?.name || 'Unknown'} (Type: ${eq?.type || 'N/A'})
- Alert Type: ${alert.type}
- Severity: ${alert.severity}
- Alert Title: ${alert.title}
- Alert Message: ${alert.message || 'No message'}
- Triggered Value: ${alert.triggered_value || 'N/A'}
- Threshold Value: ${alert.threshold_value || 'N/A'}
- Sensor Type: ${alert.sensor_type || 'N/A'}
- Equipment Health Score: ${eq?.health_score || 'N/A'}%
- Operating Hours: ${eq?.operating_hours || 'N/A'}
- Last Maintenance: ${eq?.last_maintenance_date || 'Unknown'}

Analyze this alert and provide:
1. Top 3 probable root causes with probability percentages (must add up to around 100%)
2. Technical description for each cause
3. Recommended corrective actions with priority, time estimates, and cost estimates
4. Any historical patterns that might be relevant`,
        response_json_schema: {
          type: "object",
          properties: {
            probable_causes: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  cause: { type: "string" },
                  probability: { type: "number" },
                  description: { type: "string" }
                }
              }
            },
            recommended_actions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  action: { type: "string" },
                  priority: { type: "string", enum: ["high", "medium", "low"] },
                  estimated_time_hours: { type: "number" },
                  estimated_cost: { type: "number" },
                  parts_required: { type: "array", items: { type: "string" } }
                }
              }
            },
            historical_patterns: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  pattern: { type: "string" },
                  occurrences: { type: "number" },
                  correlation: { type: "number" }
                }
              }
            }
          }
        }
      });

      const newAnalysis = {
        equipment_id: alert.equipment_id,
        alert_id: alert.id,
        anomaly_type: alert.sensor_type || 'other',
        severity: alert.severity === 'emergency' ? 'critical' : alert.severity,
        detected_at: alert.created_date,
        sensor_readings: { value: alert.triggered_value, threshold: alert.threshold_value },
        probable_causes: analysisResult.probable_causes || [],
        recommended_actions: analysisResult.recommended_actions || [],
        historical_patterns: analysisResult.historical_patterns || [],
        status: 'pending_review'
      };

      await createMutation.mutateAsync(newAnalysis);
    } catch (error) {
      console.error('AI analysis error:', error);
      // Fallback to basic analysis if AI fails
      const fallbackAnalysis = {
        equipment_id: alert.equipment_id,
        alert_id: alert.id,
        anomaly_type: alert.sensor_type || 'other',
        severity: alert.severity === 'emergency' ? 'critical' : alert.severity,
        detected_at: alert.created_date,
        sensor_readings: { value: alert.triggered_value, threshold: alert.threshold_value },
        probable_causes: [
          { cause: 'Component degradation', probability: 60, description: 'Sensor readings indicate gradual wear or degradation' },
          { cause: 'Calibration drift', probability: 25, description: 'Possible sensor calibration issues' },
          { cause: 'Environmental factors', probability: 15, description: 'External conditions may be affecting performance' }
        ],
        recommended_actions: [
          { action: 'Perform detailed inspection', priority: 'high', estimated_time_hours: 2, estimated_cost: 300, parts_required: [] },
          { action: 'Check sensor calibration', priority: 'medium', estimated_time_hours: 1, estimated_cost: 100, parts_required: [] }
        ],
        historical_patterns: [],
        status: 'pending_review'
      };
      await createMutation.mutateAsync(fallbackAnalysis);
    }
    
    setIsAnalyzing(false);
  };

  // Active alerts without analysis
  const unresolvedAlerts = alerts
    .filter(a => a.status === 'active' || a.status === 'acknowledged')
    .filter(a => !analyses.some(an => an.alert_id === a.id));

  const pendingAnalyses = analyses.filter(a => a.status === 'pending_review' || a.status === 'investigating');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
            <Search className="w-6 h-6 text-violet-600" />
            Root Cause Analysis
          </h2>
          <p className="text-sm text-slate-500">{pendingAnalyses.length} analyses pending • {unresolvedAlerts.length} alerts need analysis</p>
        </div>
      </div>

      {/* Alerts Needing Analysis */}
      {unresolvedAlerts.length > 0 && (
        <div className="bg-amber-50 rounded-xl border border-amber-200 p-5">
          <h3 className="font-medium text-amber-800 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Alerts Requiring Analysis
          </h3>
          <div className="space-y-3">
            {unresolvedAlerts.slice(0, 5).map(alert => {
              const eq = equipmentMap[alert.equipment_id];
              return (
                <div key={alert.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-amber-200">
                  <div>
                    <p className="font-medium text-slate-700">{alert.title}</p>
                    <p className="text-sm text-slate-500">{eq?.name || 'Unknown'} • {alert.type}</p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => runAIAnalysis(alert)}
                    disabled={isAnalyzing}
                    className="bg-violet-600 hover:bg-violet-700"
                  >
                    <Brain className="w-4 h-4 mr-1" />
                    Analyze
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Analysis Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {analyses.map((analysis, idx) => {
          const eq = equipmentMap[analysis.equipment_id];
          const severityConfig = getSeverityConfig(analysis.severity);
          const statusConfig = getStatusConfig(analysis.status);
          const SeverityIcon = severityConfig.icon;
          const topCause = analysis.probable_causes?.[0];

          return (
            <motion.div
              key={analysis.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.03 }}
              className="bg-white rounded-xl border border-slate-200 p-5 hover:border-violet-300 hover:shadow-md transition-all cursor-pointer"
              onClick={() => setSelectedAnalysis(analysis)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Badge className={severityConfig.color}>
                    <SeverityIcon className="w-3 h-3 mr-1" />
                    {analysis.severity}
                  </Badge>
                  <Badge className={statusConfig.color}>{statusConfig.label}</Badge>
                </div>
                <span className="text-xs text-slate-400">
                  {analysis.detected_at ? format(new Date(analysis.detected_at), 'MMM d, HH:mm') : 'N/A'}
                </span>
              </div>

              <h4 className="font-medium text-slate-900 mb-1">{eq?.name || 'Unknown Equipment'}</h4>
              <p className="text-sm text-slate-500 capitalize mb-3">{analysis.anomaly_type?.replace(/_/g, ' ')} anomaly</p>

              {topCause && (
                <div className="p-3 bg-slate-50 rounded-lg mb-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-slate-700">Most Likely: {topCause.cause}</span>
                    <span className="text-sm font-semibold text-violet-600">{topCause.probability}%</span>
                  </div>
                  <Progress value={topCause.probability} className="h-1.5" />
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Wrench className="w-4 h-4" />
                  {analysis.recommended_actions?.length || 0} actions recommended
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>
            </motion.div>
          );
        })}
      </div>

      {analyses.length === 0 && unresolvedAlerts.length === 0 && (
        <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
          <CheckCircle2 className="w-16 h-16 text-emerald-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-600">All Clear</h3>
          <p className="text-sm text-slate-400">No anomalies detected or analyses pending</p>
        </div>
      )}

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedAnalysis && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedAnalysis(null)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">
                      {equipmentMap[selectedAnalysis.equipment_id]?.name || 'Unknown'}
                    </h3>
                    <p className="text-sm text-slate-500 capitalize">{selectedAnalysis.anomaly_type} Analysis</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setSelectedAnalysis(null)}>
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Probable Causes */}
                <div>
                  <h4 className="font-medium text-slate-700 mb-3 flex items-center gap-2">
                    <Target className="w-4 h-4 text-violet-600" />
                    Probable Root Causes
                  </h4>
                  <div className="space-y-3">
                    {selectedAnalysis.probable_causes?.map((cause, idx) => (
                      <div key={idx} className="p-3 bg-slate-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-slate-700">{cause.cause}</span>
                          <Badge className={cause.probability > 70 ? 'bg-violet-100 text-violet-700' : 'bg-slate-100 text-slate-600'}>
                            {cause.probability}% confidence
                          </Badge>
                        </div>
                        <Progress value={cause.probability} className="h-1.5 mb-2" />
                        <p className="text-sm text-slate-500">{cause.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommended Actions */}
                <div>
                  <h4 className="font-medium text-slate-700 mb-3 flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-indigo-600" />
                    Recommended Actions
                  </h4>
                  <div className="space-y-3">
                    {selectedAnalysis.recommended_actions?.map((action, idx) => (
                      <div key={idx} className="p-4 bg-white border border-slate-200 rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-medium text-slate-700">{action.action}</p>
                            <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" /> {action.estimated_time_hours}h
                              </span>
                              <span>${action.estimated_cost}</span>
                            </div>
                          </div>
                          <Badge className={action.priority === 'high' ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-700'}>
                            {action.priority}
                          </Badge>
                        </div>
                        {action.parts_required?.length > 0 && (
                          <div className="mt-2 pt-2 border-t border-slate-100">
                            <p className="text-xs text-slate-400 mb-1">Parts Required:</p>
                            <div className="flex flex-wrap gap-1">
                              {action.parts_required.map((part, pIdx) => (
                                <Badge key={pIdx} variant="outline" className="text-xs">{part}</Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Resolution */}
                {selectedAnalysis.status === 'resolved' && selectedAnalysis.actual_cause && (
                  <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                    <h4 className="font-medium text-emerald-800 mb-2">Resolved</h4>
                    <p className="text-sm text-emerald-700">
                      <strong>Actual Cause:</strong> {selectedAnalysis.actual_cause}
                    </p>
                    {selectedAnalysis.resolution_notes && (
                      <p className="text-sm text-emerald-600 mt-2">{selectedAnalysis.resolution_notes}</p>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                  {selectedAnalysis.status === 'pending_review' && (
                    <Button 
                      onClick={() => {
                        updateMutation.mutate({ id: selectedAnalysis.id, data: { status: 'investigating' } });
                        setSelectedAnalysis({ ...selectedAnalysis, status: 'investigating' });
                      }}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Start Investigation
                    </Button>
                  )}
                  {selectedAnalysis.status === 'investigating' && (
                    <Button 
                      onClick={() => {
                        updateMutation.mutate({ id: selectedAnalysis.id, data: { status: 'resolved' } });
                        setSelectedAnalysis(null);
                      }}
                      className="bg-emerald-600 hover:bg-emerald-700"
                    >
                      Mark Resolved
                    </Button>
                  )}
                  <Button variant="outline" onClick={() => setSelectedAnalysis(null)}>
                    Close
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}