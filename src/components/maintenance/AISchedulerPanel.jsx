import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { 
  Brain, Calendar, Loader2, CheckCircle2, AlertTriangle, 
  Clock, DollarSign, Users, Package, Zap, ChevronDown, ChevronUp,
  Mail, Play, Cpu
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function AISchedulerPanel({ onTaskCreated }) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [autoCreate, setAutoCreate] = useState(false);
  const [notifyTechnicians, setNotifyTechnicians] = useState(false);
  const [expandedWeeks, setExpandedWeeks] = useState({});

  const queryClient = useQueryClient();

  const runAIScheduler = async () => {
    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      const response = await base44.functions.invoke('aiScheduleMaintenance', {
        mode: 'analyze',
        auto_create: autoCreate,
        notify_technicians: notifyTechnicians
      });

      if (response.data.success) {
        setResult(response.data);
        queryClient.invalidateQueries(['tasks']);
        queryClient.invalidateQueries(['workOrders']);
        if (onTaskCreated && response.data.created?.tasks?.length > 0) {
          onTaskCreated(response.data.created.tasks);
        }
      } else {
        setError(response.data.error || 'Analysis failed');
      }
    } catch (err) {
      setError(err.message || 'Failed to run AI scheduler');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const toggleWeek = (weekKey) => {
    setExpandedWeeks(prev => ({ ...prev, [weekKey]: !prev[weekKey] }));
  };

  const getPriorityColor = (priority) => {
    const colors = {
      urgent: 'bg-rose-100 text-rose-700 border-rose-200',
      high: 'bg-amber-100 text-amber-700 border-amber-200',
      medium: 'bg-blue-100 text-blue-700 border-blue-200',
      low: 'bg-slate-100 text-slate-600 border-slate-200'
    };
    return colors[priority] || colors.medium;
  };

  const getUrgencyColor = (urgency) => {
    if (urgency >= 90) return 'text-rose-600';
    if (urgency >= 70) return 'text-amber-600';
    if (urgency >= 50) return 'text-blue-600';
    return 'text-slate-600';
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-6 bg-gradient-to-r from-violet-50 to-indigo-50 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-violet-100 rounded-xl">
              <Brain className="w-6 h-6 text-violet-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">AI Maintenance Scheduler</h2>
              <p className="text-sm text-slate-500">Intelligent scheduling based on predictions & resources</p>
            </div>
          </div>
        </div>

        {/* Options */}
        <div className="mt-4 flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-2">
            <Switch 
              checked={autoCreate} 
              onCheckedChange={setAutoCreate}
              id="auto-create"
            />
            <Label htmlFor="auto-create" className="text-sm text-slate-700">
              Auto-create tasks & work orders
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch 
              checked={notifyTechnicians} 
              onCheckedChange={setNotifyTechnicians}
              disabled={!autoCreate}
              id="notify"
            />
            <Label htmlFor="notify" className={`text-sm ${autoCreate ? 'text-slate-700' : 'text-slate-400'}`}>
              Notify technicians via email
            </Label>
          </div>
          <Button 
            onClick={runAIScheduler} 
            disabled={isAnalyzing}
            className="ml-auto bg-violet-600 hover:bg-violet-700"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Run AI Scheduler
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-rose-50 border-b border-rose-200">
          <div className="flex items-center gap-2 text-rose-700">
            <AlertTriangle className="w-5 h-5" />
            <p className="font-medium">{error}</p>
          </div>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="p-6 space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center gap-2 mb-1">
                <Cpu className="w-4 h-4 text-slate-500" />
                <span className="text-xs text-slate-500">Equipment Analyzed</span>
              </div>
              <p className="text-2xl font-semibold text-slate-900">{result.analysis.total_equipment}</p>
            </div>
            <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span className="text-xs text-amber-600">Needs Maintenance</span>
              </div>
              <p className="text-2xl font-semibold text-amber-700">{result.analysis.equipment_needing_maintenance}</p>
            </div>
            <div className="p-4 bg-rose-50 rounded-xl border border-rose-200">
              <div className="flex items-center gap-2 mb-1">
                <Zap className="w-4 h-4 text-rose-500" />
                <span className="text-xs text-rose-600">Critical</span>
              </div>
              <p className="text-2xl font-semibold text-rose-700">{result.analysis.critical_count}</p>
            </div>
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span className="text-xs text-emerald-600">Tasks Created</span>
              </div>
              <p className="text-2xl font-semibold text-emerald-700">{result.created?.tasks?.length || 0}</p>
            </div>
          </div>

          {/* Schedule Summary */}
          {result.schedule?.summary && (
            <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-200">
              <h3 className="font-medium text-indigo-900 mb-3">Schedule Summary</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-indigo-600">Total Estimated Cost</p>
                  <p className="font-semibold text-indigo-900">${result.schedule.summary.total_estimated_cost.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-indigo-600">Total Labor Hours</p>
                  <p className="font-semibold text-indigo-900">{result.schedule.summary.total_estimated_hours}h</p>
                </div>
                <div>
                  <p className="text-indigo-600">Weeks Scheduled</p>
                  <p className="font-semibold text-indigo-900">{result.schedule.summary.weeks_scheduled}</p>
                </div>
                <div>
                  <p className="text-indigo-600">Parts Issues</p>
                  <p className="font-semibold text-indigo-900">{result.schedule.summary.tasks_with_parts_issue}</p>
                </div>
              </div>
            </div>
          )}

          {/* Notifications Sent */}
          {result.notifications_sent > 0 && (
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center gap-3">
              <Mail className="w-5 h-5 text-emerald-600" />
              <p className="text-emerald-700">
                <span className="font-medium">{result.notifications_sent}</span> email notifications sent to technicians
              </p>
            </div>
          )}

          {/* Weekly Breakdown */}
          {result.schedule?.weekly_breakdown?.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-medium text-slate-900">Weekly Schedule</h3>
              {result.schedule.weekly_breakdown.map((week) => (
                <div key={week.week_start} className="border border-slate-200 rounded-xl overflow-hidden">
                  <button
                    onClick={() => toggleWeek(week.week_start)}
                    className="w-full p-4 bg-slate-50 flex items-center justify-between hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <Calendar className="w-5 h-5 text-slate-500" />
                      <div className="text-left">
                        <p className="font-medium text-slate-900">Week of {week.week_start}</p>
                        <p className="text-sm text-slate-500">
                          {week.tasks.length} tasks • {week.total_hours}h • ${week.total_cost.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex -space-x-2">
                        {week.technicians_needed.slice(0, 3).map((tech, idx) => (
                          <div key={idx} className="w-8 h-8 rounded-full bg-indigo-100 border-2 border-white flex items-center justify-center">
                            <span className="text-xs font-medium text-indigo-600">{tech.charAt(0)}</span>
                          </div>
                        ))}
                        {week.technicians_needed.length > 3 && (
                          <div className="w-8 h-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center">
                            <span className="text-xs text-slate-600">+{week.technicians_needed.length - 3}</span>
                          </div>
                        )}
                      </div>
                      {expandedWeeks[week.week_start] ? (
                        <ChevronUp className="w-5 h-5 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                  </button>

                  <AnimatePresence>
                    {expandedWeeks[week.week_start] && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="p-4 space-y-3 border-t border-slate-200">
                          {week.tasks.map((task, idx) => (
                            <div key={idx} className="p-4 bg-white rounded-lg border border-slate-200">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <Badge className={getPriorityColor(task.priority)}>
                                      {task.priority}
                                    </Badge>
                                    <Badge variant="outline" className="capitalize">
                                      {task.type}
                                    </Badge>
                                  </div>
                                  <h4 className="font-medium text-slate-900">{task.equipment_name}</h4>
                                  <p className="text-sm text-slate-500">{task.equipment_location}</p>
                                </div>
                                <div className="text-right">
                                  <p className={`text-lg font-semibold ${getUrgencyColor(task.urgency)}`}>
                                    {task.urgency}%
                                  </p>
                                  <p className="text-xs text-slate-500">urgency</p>
                                </div>
                              </div>
                              
                              <p className="text-sm text-slate-600 mb-3">{task.trigger_reason}</p>
                              
                              <div className="flex flex-wrap items-center gap-4 text-sm">
                                <div className="flex items-center gap-1 text-slate-600">
                                  <Clock className="w-4 h-4" />
                                  {task.estimated_hours}h
                                </div>
                                <div className="flex items-center gap-1 text-slate-600">
                                  <DollarSign className="w-4 h-4" />
                                  ${task.estimated_cost}
                                </div>
                                {task.suggested_technician && (
                                  <div className="flex items-center gap-1 text-slate-600">
                                    <Users className="w-4 h-4" />
                                    {task.suggested_technician}
                                  </div>
                                )}
                                {task.required_parts.length > 0 && (
                                  <div className="flex items-center gap-1 text-slate-600">
                                    <Package className="w-4 h-4" />
                                    {task.required_parts.length} parts
                                    {!task.parts_available && (
                                      <AlertTriangle className="w-3 h-3 text-amber-500 ml-1" />
                                    )}
                                  </div>
                                )}
                              </div>

                              <div className="mt-3">
                                <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                                  <span>AI Confidence</span>
                                  <span>{task.confidence}%</span>
                                </div>
                                <Progress value={task.confidence} className="h-1.5" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          )}

          {/* No recommendations */}
          {result.schedule?.recommendations?.length === 0 && (
            <div className="text-center py-12">
              <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-700">All Equipment Healthy</h3>
              <p className="text-slate-500">No immediate maintenance actions required</p>
            </div>
          )}
        </div>
      )}

      {/* Initial State */}
      {!result && !isAnalyzing && !error && (
        <div className="p-12 text-center">
          <Brain className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-600 mb-2">Ready to Optimize</h3>
          <p className="text-slate-400 max-w-md mx-auto">
            AI will analyze equipment health, failure predictions, technician availability, 
            and spare parts inventory to generate an optimized maintenance schedule.
          </p>
        </div>
      )}
    </div>
  );
}