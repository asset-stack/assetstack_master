import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { 
  FileText, Download, Calendar, Clock, BarChart3, 
  PieChart, Loader2, CheckCircle2, FileSpreadsheet,
  Filter, Printer, Share2, Brain
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';
import { jsPDF } from 'jspdf';

export default function Reports() {
  const [selectedReport, setSelectedReport] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedReport, setGeneratedReport] = useState(null);
  const [dateRange, setDateRange] = useState('30d');

  const { data: equipment = [] } = useQuery({
    queryKey: ['equipment'],
    queryFn: () => base44.entities.Equipment.list('-created_date', 200),
  });

  const { data: alerts = [] } = useQuery({
    queryKey: ['alerts'],
    queryFn: () => base44.entities.Alert.list('-created_date', 500),
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => base44.entities.MaintenanceTask.list('-created_date', 500),
  });

  const { data: workOrders = [] } = useQuery({
    queryKey: ['workOrders'],
    queryFn: () => base44.entities.WorkOrder.list('-created_date', 200),
  });

  const reportTypes = [
    {
      id: 'executive_summary',
      name: 'Executive Summary',
      description: 'High-level overview of asset health, risks, and maintenance status',
      icon: BarChart3,
      color: 'bg-indigo-50 text-indigo-600'
    },
    {
      id: 'asset_health',
      name: 'Asset Health Report',
      description: 'Detailed health scores, degradation trends, and risk assessments',
      icon: PieChart,
      color: 'bg-emerald-50 text-emerald-600'
    },
    {
      id: 'maintenance_performance',
      name: 'Maintenance Performance',
      description: 'Task completion rates, MTTR, MTBF, and technician performance',
      icon: Clock,
      color: 'bg-blue-50 text-blue-600'
    },
    {
      id: 'predictive_insights',
      name: 'AI Predictive Insights',
      description: 'ML model predictions, failure forecasts, and recommendations',
      icon: Brain,
      color: 'bg-purple-50 text-purple-600'
    },
    {
      id: 'cost_analysis',
      name: 'Cost Analysis',
      description: 'Maintenance costs, savings from predictive maintenance, ROI',
      icon: FileSpreadsheet,
      color: 'bg-amber-50 text-amber-600'
    }
  ];

  const generateReport = async (reportType) => {
    setIsGenerating(true);
    setSelectedReport(reportType);
    setGeneratedReport(null);

    // Calculate metrics
    const totalEquipment = equipment.length;
    const avgHealth = totalEquipment > 0 
      ? Math.round(equipment.reduce((sum, e) => sum + (e.health_score || 0), 0) / totalEquipment)
      : 0;
    const criticalAssets = equipment.filter(e => e.risk_level === 'critical' || e.risk_level === 'high').length;
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const taskCompletionRate = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;
    const activeAlerts = alerts.filter(a => a.status === 'active').length;
    const criticalAlerts = alerts.filter(a => a.severity === 'critical' || a.severity === 'emergency').length;

    const reportData = {
      equipment_total: totalEquipment,
      avg_health_score: avgHealth,
      critical_assets: criticalAssets,
      tasks_completed: completedTasks,
      task_completion_rate: taskCompletionRate,
      active_alerts: activeAlerts,
      critical_alerts: criticalAlerts,
      work_orders_count: workOrders.length,
      date_range: dateRange
    };

    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate a professional ${reportType.name} report for an asset management platform with the following data:

DATA SUMMARY:
- Total Equipment: ${reportData.equipment_total}
- Average Health Score: ${reportData.avg_health_score}%
- Critical/High Risk Assets: ${reportData.critical_assets}
- Completed Tasks: ${reportData.tasks_completed}
- Task Completion Rate: ${reportData.task_completion_rate}%
- Active Alerts: ${reportData.active_alerts}
- Critical Alerts: ${reportData.critical_alerts}
- Work Orders: ${reportData.work_orders_count}
- Reporting Period: Last ${dateRange === '7d' ? '7 days' : dateRange === '30d' ? '30 days' : dateRange === '90d' ? '90 days' : 'year'}

Generate a detailed, actionable report with:
1. Executive summary
2. Key metrics and KPIs
3. Trend analysis
4. Risk assessment
5. Recommendations
6. Next steps`,
        response_json_schema: {
          type: "object",
          properties: {
            executive_summary: { type: "string" },
            key_metrics: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  value: { type: "string" },
                  trend: { type: "string", enum: ["up", "down", "stable"] },
                  analysis: { type: "string" }
                }
              }
            },
            risk_assessment: {
              type: "object",
              properties: {
                overall_risk_level: { type: "string" },
                high_risk_areas: { type: "array", items: { type: "string" } },
                mitigation_actions: { type: "array", items: { type: "string" } }
              }
            },
            recommendations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  priority: { type: "string", enum: ["critical", "high", "medium", "low"] },
                  recommendation: { type: "string" },
                  expected_impact: { type: "string" }
                }
              }
            },
            next_steps: { type: "array", items: { type: "string" } }
          }
        }
      });

      setGeneratedReport({
        type: reportType,
        data: reportData,
        content: response,
        generatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Report generation failed:', error);
    }

    setIsGenerating(false);
  };

  const getTrendIcon = (trend) => {
    if (trend === 'up') return '↑';
    if (trend === 'down') return '↓';
    return '→';
  };

  const getTrendColor = (trend) => {
    if (trend === 'up') return 'text-emerald-600';
    if (trend === 'down') return 'text-rose-600';
    return 'text-slate-500';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      critical: 'bg-rose-100 text-rose-700',
      high: 'bg-orange-100 text-orange-700',
      medium: 'bg-amber-100 text-amber-700',
      low: 'bg-blue-100 text-blue-700'
    };
    return colors[priority] || colors.medium;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-[1600px] mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
              <FileText className="w-7 h-7 text-indigo-600" />
              AI-Powered Reports
            </h1>
            <p className="text-sm text-slate-500 mt-1">Generate intelligent insights and analytics reports</p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-40 bg-white">
                <Calendar className="w-4 h-4 mr-2 text-slate-400" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Report Types */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h2 className="font-semibold text-slate-900 mb-4">Report Templates</h2>
              <div className="space-y-3">
                {reportTypes.map((report) => {
                  const Icon = report.icon;
                  const isSelected = selectedReport?.id === report.id;
                  return (
                    <motion.button
                      key={report.id}
                      onClick={() => generateReport(report)}
                      disabled={isGenerating}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      className={`w-full p-4 rounded-xl border text-left transition-all ${
                        isSelected 
                          ? 'border-indigo-300 bg-indigo-50 ring-2 ring-indigo-200' 
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${report.color}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-slate-900">{report.name}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{report.description}</p>
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Generated Report */}
          <div className="lg:col-span-2">
            {isGenerating ? (
              <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
                <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900">Generating Report...</h3>
                <p className="text-sm text-slate-500 mt-2">AI is analyzing your data and generating insights</p>
              </div>
            ) : generatedReport ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden"
              >
                {/* Report Header */}
                <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-indigo-50 to-purple-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-semibold text-slate-900">{generatedReport.type.name}</h2>
                      <p className="text-sm text-slate-500 mt-1">
                        Generated {format(new Date(generatedReport.generatedAt), 'PPp')}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => exportReportToPDF()}>
                        <Download className="w-4 h-4 mr-2" />
                        Download PDF
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Report Content */}
                <div className="p-6 space-y-6">
                  {/* Executive Summary */}
                  {generatedReport.content.executive_summary && (
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-3">Executive Summary</h3>
                      <p className="text-slate-600 bg-slate-50 rounded-lg p-4 text-sm leading-relaxed">
                        {generatedReport.content.executive_summary}
                      </p>
                    </div>
                  )}

                  {/* Key Metrics */}
                  {generatedReport.content.key_metrics && (
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-3">Key Metrics</h3>
                      <div className="grid grid-cols-2 gap-4">
                        {generatedReport.content.key_metrics.map((metric, idx) => (
                          <div key={idx} className="p-4 bg-slate-50 rounded-xl">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm text-slate-500">{metric.name}</span>
                              <span className={`text-sm font-medium ${getTrendColor(metric.trend)}`}>
                                {getTrendIcon(metric.trend)}
                              </span>
                            </div>
                            <p className="text-2xl font-bold text-slate-900">{metric.value}</p>
                            <p className="text-xs text-slate-500 mt-1">{metric.analysis}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Risk Assessment */}
                  {generatedReport.content.risk_assessment && (
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-3">Risk Assessment</h3>
                      <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                        <div className="flex items-center gap-2 mb-3">
                          <Badge className="bg-amber-100 text-amber-700">
                            {generatedReport.content.risk_assessment.overall_risk_level}
                          </Badge>
                        </div>
                        {generatedReport.content.risk_assessment.high_risk_areas?.length > 0 && (
                          <div className="mb-3">
                            <p className="text-sm font-medium text-amber-800 mb-2">High Risk Areas:</p>
                            <ul className="space-y-1">
                              {generatedReport.content.risk_assessment.high_risk_areas.map((area, idx) => (
                                <li key={idx} className="text-sm text-amber-700 flex items-center gap-2">
                                  <span>•</span> {area}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {generatedReport.content.risk_assessment.mitigation_actions?.length > 0 && (
                          <div>
                            <p className="text-sm font-medium text-amber-800 mb-2">Mitigation Actions:</p>
                            <ul className="space-y-1">
                              {generatedReport.content.risk_assessment.mitigation_actions.map((action, idx) => (
                                <li key={idx} className="text-sm text-amber-700 flex items-center gap-2">
                                  <CheckCircle2 className="w-3 h-3" /> {action}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Recommendations */}
                  {generatedReport.content.recommendations && (
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-3">Recommendations</h3>
                      <div className="space-y-3">
                        {generatedReport.content.recommendations.map((rec, idx) => (
                          <div key={idx} className="p-4 border border-slate-200 rounded-xl">
                            <div className="flex items-start justify-between mb-2">
                              <p className="text-sm font-medium text-slate-900">{rec.recommendation}</p>
                              <Badge className={getPriorityColor(rec.priority)}>
                                {rec.priority}
                              </Badge>
                            </div>
                            <p className="text-xs text-slate-500">Expected Impact: {rec.expected_impact}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Next Steps */}
                  {generatedReport.content.next_steps && (
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-3">Next Steps</h3>
                      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                        <ul className="space-y-2">
                          {generatedReport.content.next_steps.map((step, idx) => (
                            <li key={idx} className="text-sm text-emerald-700 flex items-start gap-2">
                              <span className="font-bold text-emerald-600">{idx + 1}.</span> {step}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ) : (
              <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
                <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-600">Select a Report Template</h3>
                <p className="text-sm text-slate-400 mt-2">Choose a report type from the left to generate AI-powered insights</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}