import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { 
  CalendarClock, FileText, Sparkles, Play, Loader2, RefreshCw, 
  Clock, CheckCircle2, AlertTriangle
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import MaintenancePlanManager from '@/components/maintenance/MaintenancePlanManager';
import MaintenanceTemplateLibrary from '@/components/maintenance/MaintenanceTemplateLibrary';
import PredictiveWorkflowConfig from '@/components/maintenance/PredictiveWorkflowConfig';

export default function MaintenancePlanning() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastRunResult, setLastRunResult] = useState(null);
  const queryClient = useQueryClient();

  const { data: equipment = [] } = useQuery({
    queryKey: ['equipment'],
    queryFn: () => base44.entities.Equipment.list('-created_date', 200),
  });

  const { data: technicians = [] } = useQuery({
    queryKey: ['technicians'],
    queryFn: () => base44.entities.Technician.list('-created_date', 100),
  });

  const { data: plans = [] } = useQuery({
    queryKey: ['maintenancePlans'],
    queryFn: () => base44.entities.MaintenancePlan.list('-created_date', 100),
  });

  const { data: triggers = [], refetch: refetchTriggers } = useQuery({
    queryKey: ['triggers'],
    queryFn: () => base44.entities.MaintenanceTrigger.list('-created_date', 50),
  });

  const runScheduledGeneration = async () => {
    setIsGenerating(true);
    setLastRunResult(null);
    try {
      const result = await base44.functions.invoke('generateScheduledMaintenance', {});
      setLastRunResult(result.data);
      queryClient.invalidateQueries(['tasks']);
      queryClient.invalidateQueries(['maintenancePlans']);
    } catch (error) {
      console.error('Error running scheduled generation:', error);
      setLastRunResult({ error: error.message });
    } finally {
      setIsGenerating(false);
    }
  };

  const activePlans = plans.filter(p => p.is_active).length;
  const activeTriggers = triggers.filter(t => t.is_active).length;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 py-4 sm:py-8" style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 16px)' }}>
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Maintenance Planning</h1>
            <p className="text-sm text-slate-500 mt-1">
              Configure automated schedules, templates, and AI-driven maintenance workflows
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              onClick={runScheduledGeneration}
              disabled={isGenerating}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {isGenerating ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Play className="w-4 h-4 mr-2" />
              )}
              Run Scheduled Generation
            </Button>
          </div>
        </div>

        {/* Last Run Result */}
        {lastRunResult && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-6 p-4 rounded-xl border ${
              lastRunResult.error 
                ? 'bg-red-50 border-red-200' 
                : lastRunResult.tasksGenerated > 0 
                  ? 'bg-emerald-50 border-emerald-200'
                  : 'bg-amber-50 border-amber-200'
            }`}
          >
            <div className="flex items-center gap-3">
              {lastRunResult.error ? (
                <AlertTriangle className="w-5 h-5 text-red-600" />
              ) : lastRunResult.tasksGenerated > 0 ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              ) : (
                <Clock className="w-5 h-5 text-amber-600" />
              )}
              <div>
                {lastRunResult.error ? (
                  <p className="font-medium text-red-800">Generation failed: {lastRunResult.error}</p>
                ) : lastRunResult.tasksGenerated > 0 ? (
                  <>
                    <p className="font-medium text-emerald-800">
                      Successfully generated {lastRunResult.tasksGenerated} maintenance task(s)
                    </p>
                    <p className="text-sm text-emerald-600 mt-1">
                      {lastRunResult.details?.map(d => d.equipmentName).join(', ')}
                    </p>
                  </>
                ) : (
                  <p className="font-medium text-amber-800">
                    No tasks generated - all equipment is up to date with scheduled maintenance
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <CalendarClock className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-slate-900">{activePlans}</p>
                <p className="text-xs text-slate-500">Active Plans</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-violet-100 rounded-lg">
                <Sparkles className="w-5 h-5 text-violet-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-slate-900">{activeTriggers}</p>
                <p className="text-xs text-slate-500">AI Triggers</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <FileText className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-slate-900">
                  {plans.reduce((sum, p) => sum + (p.tasks_generated_count || 0), 0)}
                </p>
                <p className="text-xs text-slate-500">Tasks Generated</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <RefreshCw className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-slate-900">{equipment.length}</p>
                <p className="text-xs text-slate-500">Equipment Covered</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="plans" className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-1.5">
            <TabsList className="bg-transparent gap-1">
              <TabsTrigger 
                value="plans" 
                className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg px-4 py-2.5 text-sm font-medium"
              >
                <CalendarClock className="w-4 h-4 mr-2" />
                Maintenance Plans
              </TabsTrigger>
              <TabsTrigger 
                value="templates" 
                className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg px-4 py-2.5 text-sm font-medium"
              >
                <FileText className="w-4 h-4 mr-2" />
                Templates
              </TabsTrigger>
              <TabsTrigger 
                value="triggers" 
                className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg px-4 py-2.5 text-sm font-medium"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                AI Triggers
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="plans" className="mt-0">
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <MaintenancePlanManager 
                equipment={equipment}
                technicians={technicians}
              />
            </div>
          </TabsContent>

          <TabsContent value="templates" className="mt-0">
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <MaintenanceTemplateLibrary 
                onUseTemplate={(template) => {
                  // Could open a dialog to create a task from template
                  console.log('Use template:', template);
                }}
              />
            </div>
          </TabsContent>

          <TabsContent value="triggers" className="mt-0">
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <PredictiveWorkflowConfig 
                triggers={triggers}
                onRefresh={refetchTriggers}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}