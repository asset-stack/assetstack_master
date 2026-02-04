import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { 
  Activity, TrendingUp, AlertTriangle, Clock, Brain, BarChart3, 
  PieChart as PieChartIcon, Calendar, Target, Zap,
  Package, Users, Search, Sparkles, Timer, Wrench, DollarSign, 
  CheckCircle2, TrendingDown, Gauge, ShieldCheck, MapPin, CalendarDays,
  Award, ArrowUpRight, Server
} from 'lucide-react';
import { 
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  ResponsiveContainer, Legend, RadialBarChart, RadialBar, ComposedChart, Scatter
} from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import MetricCard from '@/components/dashboard/MetricCard';
import RULVisualization from '@/components/analytics/RULVisualization';
import SparePartsInventory from '@/components/inventory/SparePartsInventory';
import RootCausePanel from '@/components/analytics/RootCausePanel';
import ResourceOptimizer from '@/components/analytics/ResourceOptimizer';
import PredictiveWorkflowConfig from '@/components/maintenance/PredictiveWorkflowConfig';
import SuggestedTasksPanel from '@/components/maintenance/SuggestedTasksPanel';
import RunPredictiveAnalysis from '@/components/maintenance/RunPredictiveAnalysis';

// Metric definitions for user education
const METRIC_DEFINITIONS = {
  fleetHealth: "Average health score across all equipment. Based on sensor readings, maintenance history, and age. 100% = perfect condition.",
  atRisk: "Number of assets with 'high' or 'critical' risk levels that need attention soon.",
  pendingTasks: "Maintenance tasks that are scheduled or currently in progress.",
  completed: "Total maintenance tasks that have been successfully completed.",
  activeAlerts: "Current alerts requiring attention. Includes warnings, critical issues, and emergencies.",
  aiConfidence: "Average confidence level of AI predictions. Higher = more reliable predictions.",
  healthTrend: "Daily average health score over the past 30 days. Shows fleet health trajectory.",
  equipmentByType: "Distribution of equipment across different categories in your fleet.",
  healthDistribution: "How equipment is distributed across health score ranges (excellent, good, fair, poor).",
  riskDistribution: "Breakdown of assets by risk level (low, medium, high, critical).",
  taskCompletion: "Percentage of all maintenance tasks that have been completed.",
  maintenanceByType: "Distribution of maintenance tasks by type (preventive, corrective, etc.).",
  alertSeverity: "Breakdown of alerts by severity level to prioritize response.",
  // Operational metrics
  avgCompletionTime: "Average time (in hours) to complete a maintenance task from start to finish.",
  mttr: "Mean Time To Repair - average hours to restore equipment to operational status after a failure.",
  overdueTasks: "Tasks that have passed their scheduled date but haven't been completed yet.",
  firstTimeFix: "Percentage of work orders completed without requiring follow-up work. Higher = better quality.",
  avgCost: "Average cost per completed maintenance task, including labor and parts.",
  efficiency: "How well actual task duration matches estimates. 100% = perfectly on time, >100% = faster than expected.",
  preventiveRatio: "Percentage of maintenance that is proactive (preventive/predictive) vs reactive (corrective/emergency). Higher = better strategy.",
  // New advanced metrics
  techPerformance: "Compares technician completed tasks, average completion time, and performance rating.",
  statusByLocation: "Equipment status breakdown by physical location. Helps identify problem areas.",
  weeklyTrend: "Weekly trend of completed, scheduled, and overdue tasks over the past month.",
  costBreakdown: "Distribution of maintenance costs between labor, parts, and other expenses.",
  uptime: "Percentage of equipment currently in operational status.",
  avgRUL: "Average Remaining Useful Life across all equipment with predictions. Higher = healthier fleet.",
};

export default function Analytics() {
  const [timeRange, setTimeRange] = useState('30d');

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

  const { data: predictions = [] } = useQuery({
    queryKey: ['predictions'],
    queryFn: () => base44.entities.PredictionLog.list('-created_date', 200),
  });

  const { data: workOrders = [] } = useQuery({
    queryKey: ['workOrders'],
    queryFn: () => base44.entities.WorkOrder.list('-created_date', 200),
  });

  const { data: triggers = [], refetch: refetchTriggers } = useQuery({
    queryKey: ['triggers'],
    queryFn: () => base44.entities.MaintenanceTrigger.list('-created_date', 50),
  });

  const { data: suggestedTasks = [], refetch: refetchSuggestions } = useQuery({
    queryKey: ['suggestedTasks'],
    queryFn: () => base44.entities.SuggestedTask.list('-created_date', 100),
  });

  const { data: technicians = [] } = useQuery({
    queryKey: ['technicians'],
    queryFn: () => base44.entities.Technician.list('-created_date', 50),
  });

  // Calculate metrics
  const totalEquipment = equipment.length;
  const avgHealth = totalEquipment > 0 
    ? Math.round(equipment.reduce((sum, e) => sum + (e.health_score || 0), 0) / totalEquipment)
    : 0;
  const criticalAssets = equipment.filter(e => e.risk_level === 'critical' || e.risk_level === 'high').length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const pendingTasks = tasks.filter(t => t.status === 'scheduled' || t.status === 'in_progress').length;
  const avgPredictionConfidence = predictions.length > 0
    ? Math.round(predictions.reduce((sum, p) => sum + (p.confidence_score || 0), 0) / predictions.length)
    : 0;

  // NEW: Calculate operational metrics
  const tasksWithDuration = tasks.filter(t => t.actual_duration_hours && t.estimated_duration_hours);
  const avgTaskCompletionTime = tasksWithDuration.length > 0
    ? (tasksWithDuration.reduce((sum, t) => sum + (t.actual_duration_hours || 0), 0) / tasksWithDuration.length).toFixed(1)
    : 0;
  
  const overdueTasks = tasks.filter(t => t.status === 'overdue' || (t.status !== 'completed' && t.scheduled_date && new Date(t.scheduled_date) < new Date())).length;
  
  // Work order metrics
  const completedWorkOrders = workOrders.filter(wo => wo.status === 'completed' || wo.status === 'closed');
  const avgMTTR = completedWorkOrders.length > 0
    ? (completedWorkOrders.reduce((sum, wo) => {
        if (wo.actual_start && wo.actual_end) {
          const start = new Date(wo.actual_start);
          const end = new Date(wo.actual_end);
          return sum + ((end - start) / (1000 * 60 * 60)); // hours
        }
        return sum + (wo.actual_duration_hours || wo.estimated_hours || 0);
      }, 0) / completedWorkOrders.length).toFixed(1)
    : 0;

  // First time fix rate (tasks completed without follow-up)
  const tasksWithoutFollowUp = completedWorkOrders.filter(wo => !wo.follow_up_required).length;
  const firstTimeFixRate = completedWorkOrders.length > 0 
    ? Math.round((tasksWithoutFollowUp / completedWorkOrders.length) * 100)
    : 0;

  // Cost metrics
  const totalMaintenanceCost = workOrders.reduce((sum, wo) => sum + (wo.actual_total_cost || wo.estimated_cost || 0), 0);
  const avgCostPerTask = completedWorkOrders.length > 0 
    ? Math.round(totalMaintenanceCost / completedWorkOrders.length)
    : 0;

  // Efficiency: actual vs estimated time
  const efficiencyTasks = tasks.filter(t => t.actual_duration_hours && t.estimated_duration_hours && t.estimated_duration_hours > 0);
  const taskEfficiency = efficiencyTasks.length > 0
    ? Math.round((efficiencyTasks.reduce((sum, t) => sum + (t.estimated_duration_hours / t.actual_duration_hours), 0) / efficiencyTasks.length) * 100)
    : 100;

  // Preventive vs Reactive ratio
  const preventiveTasks = tasks.filter(t => t.type === 'preventive' || t.type === 'predictive').length;
  const reactiveTasks = tasks.filter(t => t.type === 'corrective' || t.type === 'emergency').length;
  const preventiveRatio = (preventiveTasks + reactiveTasks) > 0 
    ? Math.round((preventiveTasks / (preventiveTasks + reactiveTasks)) * 100)
    : 0;

  // NEW: Technician performance metrics
  const technicianPerformance = technicians.map(tech => ({
    name: tech.name?.split(' ')[0] || 'Unknown',
    completed: tech.completed_tasks_count || 0,
    avgTime: tech.average_task_completion_time || 0,
    rating: tech.performance_rating || 0,
    workload: tech.current_workload_hours || 0,
    maxHours: tech.max_weekly_hours || 40,
  })).slice(0, 8);

  // Equipment downtime by location
  const downtimeByLocation = equipment.reduce((acc, e) => {
    const loc = e.location || 'Unknown';
    if (!acc[loc]) acc[loc] = { operational: 0, degraded: 0, critical: 0, offline: 0 };
    acc[loc][e.status] = (acc[loc][e.status] || 0) + 1;
    return acc;
  }, {});
  const locationData = Object.entries(downtimeByLocation).slice(0, 6).map(([name, data]) => ({
    name: name.length > 12 ? name.substring(0, 12) + '...' : name,
    operational: data.operational || 0,
    degraded: data.degraded || 0,
    critical: data.critical || 0,
    offline: data.offline || 0,
  }));

  // Weekly task trend (simulated based on tasks)
  const weeklyTaskTrend = React.useMemo(() => {
    const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
    const seededRandom = (seed) => {
      const x = Math.sin(seed) * 10000;
      return x - Math.floor(x);
    };
    return weeks.map((week, i) => ({
      week,
      completed: Math.floor(seededRandom(i * 5.2) * 15) + 5,
      scheduled: Math.floor(seededRandom(i * 3.8) * 12) + 8,
      overdue: Math.floor(seededRandom(i * 2.1) * 4),
    }));
  }, []);

  // Cost breakdown
  const costBreakdown = [
    { name: 'Labor', value: workOrders.reduce((sum, wo) => sum + (wo.actual_labor_cost || 0), 0), color: '#3b82f6' },
    { name: 'Parts', value: workOrders.reduce((sum, wo) => sum + (wo.actual_parts_cost || 0), 0), color: '#10b981' },
    { name: 'Other', value: workOrders.reduce((sum, wo) => {
      const additionalCosts = wo.additional_costs || [];
      return sum + additionalCosts.reduce((s, c) => s + (c.amount || 0), 0);
    }, 0), color: '#f59e0b' },
  ].filter(d => d.value > 0);

  // Uptime percentage
  const operationalCount = equipment.filter(e => e.status === 'operational').length;
  const uptimePercent = totalEquipment > 0 ? Math.round((operationalCount / totalEquipment) * 100) : 0;

  // Avg RUL
  const equipmentWithRUL = equipment.filter(e => e.remaining_useful_life_days);
  const avgRUL = equipmentWithRUL.length > 0 
    ? Math.round(equipmentWithRUL.reduce((sum, e) => sum + e.remaining_useful_life_days, 0) / equipmentWithRUL.length)
    : 0;

  // Equipment by type
  const equipmentByType = equipment.reduce((acc, e) => {
    const type = e.type || 'unknown';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});
  const typeChartData = Object.entries(equipmentByType).map(([name, value]) => ({
    name: name.replace(/_/g, ' '),
    value
  }));

  // Health distribution
  const healthDistribution = [
    { name: 'Excellent (90-100)', value: equipment.filter(e => (e.health_score || 0) >= 90).length, color: '#10b981' },
    { name: 'Good (70-89)', value: equipment.filter(e => (e.health_score || 0) >= 70 && (e.health_score || 0) < 90).length, color: '#3b82f6' },
    { name: 'Fair (50-69)', value: equipment.filter(e => (e.health_score || 0) >= 50 && (e.health_score || 0) < 70).length, color: '#f59e0b' },
    { name: 'Poor (<50)', value: equipment.filter(e => (e.health_score || 0) < 50).length, color: '#ef4444' },
  ].filter(d => d.value > 0);

  // Risk distribution
  const riskDistribution = [
    { name: 'Low', value: equipment.filter(e => e.risk_level === 'low').length, color: '#10b981' },
    { name: 'Medium', value: equipment.filter(e => e.risk_level === 'medium').length, color: '#f59e0b' },
    { name: 'High', value: equipment.filter(e => e.risk_level === 'high').length, color: '#f97316' },
    { name: 'Critical', value: equipment.filter(e => e.risk_level === 'critical').length, color: '#ef4444' },
  ].filter(d => d.value > 0);

  // Alert severity breakdown
  const alertSeverity = [
    { name: 'Info', value: alerts.filter(a => a.severity === 'info').length, color: '#3b82f6' },
    { name: 'Warning', value: alerts.filter(a => a.severity === 'warning').length, color: '#f59e0b' },
    { name: 'Critical', value: alerts.filter(a => a.severity === 'critical').length, color: '#f97316' },
    { name: 'Emergency', value: alerts.filter(a => a.severity === 'emergency').length, color: '#ef4444' },
  ].filter(d => d.value > 0);

  // Task completion rate
  const taskCompletionRate = tasks.length > 0 
    ? Math.round((completedTasks / tasks.length) * 100) 
    : 0;

  // Maintenance by type
  const tasksByType = tasks.reduce((acc, t) => {
    const type = t.type || 'other';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});
  const taskTypeData = Object.entries(tasksByType).map(([name, value]) => ({
    name,
    value
  }));

  // Trend data with seeded random for consistency
  const trendData = React.useMemo(() => {
    const seededRandom = (seed) => {
      const x = Math.sin(seed) * 10000;
      return x - Math.floor(x);
    };
    return Array.from({ length: 30 }, (_, i) => ({
      day: `Day ${i + 1}`,
      health: 75 + seededRandom(i * 3.7) * 15 - 7,
      predictions: Math.floor(seededRandom(i * 2.3) * 10) + 1,
      alerts: Math.floor(seededRandom(i * 1.9) * 8),
    }));
  }, []);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  const ChartTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xl">
          <p className="text-slate-500 text-xs mb-2 font-medium">{label}</p>
          {payload.map((entry, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
              <p className="text-sm font-medium text-slate-700">
                {entry.name}: <span className="text-slate-900">{typeof entry.value === 'number' ? entry.value.toFixed(1) : entry.value}</span>
              </p>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  // Helper component for metric info tooltips
  const MetricInfo = ({ definition }) => (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button className="ml-1.5 p-0.5 rounded-full bg-slate-100 hover:bg-indigo-100 text-slate-400 hover:text-indigo-600 transition-all">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" strokeWidth="2" />
              <path strokeLinecap="round" strokeWidth="2" d="M12 16v-4M12 8h.01" />
            </svg>
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs bg-slate-900 text-white border-slate-700 shadow-lg z-50">
          <p className="text-xs leading-relaxed">{definition}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-[1800px] mx-auto px-6 py-8">
        {/* Header with Explanation Banner */}
        <div className="bg-gradient-to-r from-indigo-50 via-blue-50 to-violet-50 border border-indigo-100 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg shrink-0">
              <Brain className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Understanding Your Analytics</h2>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                This dashboard provides real-time insights into your fleet's health, maintenance operations, and AI predictions. 
                Look for the <span className="inline-flex items-center px-1 py-0.5 bg-white rounded text-indigo-600 font-medium">ⓘ</span> icons 
                next to metrics for detailed explanations. Use the tabs to explore RUL predictions, root cause analysis, and resource optimization.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Analytics Dashboard</h1>
            <p className="text-sm text-slate-500 mt-1">Comprehensive insights into your maintenance operations</p>
          </div>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40 bg-white border-slate-200 shadow-sm">
              <Calendar className="w-4 h-4 mr-2 text-slate-400" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white border-slate-200">
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="mb-8">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-1.5 mb-6 overflow-x-auto">
            <TabsList className="bg-transparent flex-nowrap h-auto gap-1 w-max min-w-full">
              <TabsTrigger value="overview" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg px-4 py-2.5 text-sm font-medium transition-all">
                <BarChart3 className="w-4 h-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="predictions" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg px-4 py-2.5 text-sm font-medium transition-all">
                <Brain className="w-4 h-4 mr-2" />
                RUL & Predictions
              </TabsTrigger>
              <TabsTrigger value="rootcause" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg px-4 py-2.5 text-sm font-medium transition-all">
                <Search className="w-4 h-4 mr-2" />
                Root Cause
              </TabsTrigger>
              <TabsTrigger value="resources" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg px-4 py-2.5 text-sm font-medium transition-all">
                <Users className="w-4 h-4 mr-2" />
                Resources
              </TabsTrigger>
              <TabsTrigger value="inventory" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg px-4 py-2.5 text-sm font-medium transition-all">
                <Package className="w-4 h-4 mr-2" />
                Spare Parts
              </TabsTrigger>
              <TabsTrigger value="automation" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg px-4 py-2.5 text-sm font-medium transition-all">
                <Sparkles className="w-4 h-4 mr-2" />
                AI Automation
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview" className="mt-0">
            {/* Key Metrics Section */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <h2 className="text-lg font-semibold text-slate-800">Key Performance Indicators</h2>
                <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">Hover ⓘ for details</span>
              </div>
              <p className="text-sm text-slate-500 mb-4">
                These metrics provide a snapshot of your fleet's current status. Green indicates healthy values, amber/orange suggests caution, and red signals issues requiring attention.
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
              <div className="relative">
                <MetricCard title="Fleet Health" value={`${avgHealth}%`} icon={Activity} color="green" />
                <div className="absolute top-2 right-2"><MetricInfo definition={METRIC_DEFINITIONS.fleetHealth} /></div>
              </div>
              <div className="relative">
                <MetricCard title="At Risk Assets" value={criticalAssets} icon={AlertTriangle} color="amber" />
                <div className="absolute top-2 right-2"><MetricInfo definition={METRIC_DEFINITIONS.atRisk} /></div>
              </div>
              <div className="relative">
                <MetricCard title="Pending Tasks" value={pendingTasks} icon={Clock} color="blue" />
                <div className="absolute top-2 right-2"><MetricInfo definition={METRIC_DEFINITIONS.pendingTasks} /></div>
              </div>
              <div className="relative">
                <MetricCard title="Completed" value={completedTasks} icon={Target} color="green" />
                <div className="absolute top-2 right-2"><MetricInfo definition={METRIC_DEFINITIONS.completed} /></div>
              </div>
              <div className="relative">
                <MetricCard title="Active Alerts" value={alerts.filter(a => a.status === 'active').length} icon={Zap} color="rose" />
                <div className="absolute top-2 right-2"><MetricInfo definition={METRIC_DEFINITIONS.activeAlerts} /></div>
              </div>
              <div className="relative">
                <MetricCard title="AI Confidence" value={`${avgPredictionConfidence}%`} icon={Brain} color="purple" />
                <div className="absolute top-2 right-2"><MetricInfo definition={METRIC_DEFINITIONS.aiConfidence} /></div>
              </div>
            </div>

            {/* Trends & Distribution Section */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <h2 className="text-lg font-semibold text-slate-800">Trends & Distribution Analysis</h2>
              </div>
              <p className="text-sm text-slate-500 mb-4">
                Visual breakdowns of your fleet's health over time and how assets are distributed across different categories. Use these charts to identify patterns and areas needing attention.
              </p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Health Trend */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                    <div className="p-2 bg-emerald-50 rounded-lg">
                      <TrendingUp className="w-4 h-4 text-emerald-600" />
                    </div>
                    Fleet Health Trend
                    <MetricInfo definition={METRIC_DEFINITIONS.healthTrend} />
                  </h3>
                  <span className="text-xs text-slate-400 bg-slate-50 px-2 py-1 rounded-md">Last 30 days</span>
                </div>
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                      <defs>
                        <linearGradient id="healthGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                      <XAxis dataKey="day" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 10 }} domain={[60, 100]} axisLine={false} tickLine={false} />
                      <RechartsTooltip content={<ChartTooltip />} />
                      <Area type="monotone" dataKey="health" stroke="#10b981" fill="url(#healthGradient)" strokeWidth={2.5} name="Health %" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

              {/* Equipment by Type */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <BarChart3 className="w-4 h-4 text-blue-600" />
                    </div>
                    Equipment by Type
                    <MetricInfo definition={METRIC_DEFINITIONS.equipmentByType} />
                  </h3>
                  <span className="text-xs text-slate-400 bg-slate-50 px-2 py-1 rounded-md">{totalEquipment} total</span>
                </div>
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={typeChartData} layout="vertical" margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                      <XAxis type="number" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis dataKey="name" type="category" stroke="#94a3b8" tick={{ fill: '#64748b', fontSize: 11 }} width={100} axisLine={false} tickLine={false} />
                      <RechartsTooltip content={<ChartTooltip />} />
                      <Bar dataKey="value" fill="#3b82f6" radius={[0, 6, 6, 0]} name="Count" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

              {/* Health Distribution */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                    <div className="p-2 bg-emerald-50 rounded-lg">
                      <PieChartIcon className="w-4 h-4 text-emerald-600" />
                    </div>
                    Health Distribution
                    <MetricInfo definition={METRIC_DEFINITIONS.healthDistribution} />
                  </h3>
                </div>
                <div className="h-[280px] flex items-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={healthDistribution}
                        cx="50%"
                        cy="45%"
                        innerRadius={65}
                        outerRadius={95}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {healthDistribution.map((entry, index) => (
                          <Cell key={index} fill={entry.color} stroke="transparent" />
                        ))}
                      </Pie>
                      <RechartsTooltip content={<ChartTooltip />} />
                      <Legend 
                        verticalAlign="bottom" 
                        height={50}
                        formatter={(value) => <span className="text-slate-600 text-xs">{value}</span>}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

              {/* Risk Distribution */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                    <div className="p-2 bg-amber-50 rounded-lg">
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                    </div>
                    Risk Distribution
                    <MetricInfo definition={METRIC_DEFINITIONS.riskDistribution} />
                  </h3>
                </div>
                <div className="h-[280px] flex items-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={riskDistribution}
                        cx="50%"
                        cy="45%"
                        innerRadius={65}
                        outerRadius={95}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {riskDistribution.map((entry, index) => (
                          <Cell key={index} fill={entry.color} stroke="transparent" />
                        ))}
                      </Pie>
                      <RechartsTooltip content={<ChartTooltip />} />
                      <Legend 
                        verticalAlign="bottom" 
                        height={50}
                        formatter={(value) => <span className="text-slate-600 text-xs">{value}</span>}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            </div>

            {/* NEW: Operational Performance Metrics */}
            <div className="mb-6 mt-8">
              <div className="flex items-center gap-2 mb-3">
                <h2 className="text-lg font-semibold text-slate-800">Operational Performance</h2>
                <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">Time & Efficiency Metrics</span>
              </div>
              <p className="text-sm text-slate-500 mb-4">
                Key metrics measuring how efficiently your maintenance operations run. Track completion times, costs, and the balance between proactive and reactive maintenance.
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4 mb-8">
              <div className="relative">
                <MetricCard title="Avg Completion" value={`${avgTaskCompletionTime}h`} icon={Timer} color="blue" />
                <div className="absolute top-2 right-2"><MetricInfo definition={METRIC_DEFINITIONS.avgCompletionTime} /></div>
              </div>
              <div className="relative">
                <MetricCard title="MTTR" value={`${avgMTTR}h`} icon={Wrench} color="amber" />
                <div className="absolute top-2 right-2"><MetricInfo definition={METRIC_DEFINITIONS.mttr} /></div>
              </div>
              <div className="relative">
                <MetricCard title="Overdue" value={overdueTasks} icon={TrendingDown} color={overdueTasks > 0 ? "rose" : "green"} />
                <div className="absolute top-2 right-2"><MetricInfo definition={METRIC_DEFINITIONS.overdueTasks} /></div>
              </div>
              <div className="relative">
                <MetricCard title="First Time Fix" value={`${firstTimeFixRate}%`} icon={CheckCircle2} color={firstTimeFixRate >= 80 ? "green" : "amber"} />
                <div className="absolute top-2 right-2"><MetricInfo definition={METRIC_DEFINITIONS.firstTimeFix} /></div>
              </div>
              <div className="relative">
                <MetricCard title="Avg Cost/Task" value={`$${avgCostPerTask}`} icon={DollarSign} color="purple" />
                <div className="absolute top-2 right-2"><MetricInfo definition={METRIC_DEFINITIONS.avgCost} /></div>
              </div>
              <div className="relative">
                <MetricCard title="Efficiency" value={`${taskEfficiency}%`} icon={Gauge} color={taskEfficiency >= 90 ? "green" : "amber"} />
                <div className="absolute top-2 right-2"><MetricInfo definition={METRIC_DEFINITIONS.efficiency} /></div>
              </div>
              <div className="relative">
                <MetricCard title="Preventive %" value={`${preventiveRatio}%`} icon={ShieldCheck} color={preventiveRatio >= 60 ? "green" : "amber"} />
                <div className="absolute top-2 right-2"><MetricInfo definition={METRIC_DEFINITIONS.preventiveRatio} /></div>
              </div>
            </div>

            {/* Additional KPIs Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="relative">
                <MetricCard title="Uptime" value={`${uptimePercent}%`} icon={Server} color={uptimePercent >= 90 ? "green" : "amber"} />
                <div className="absolute top-2 right-2"><MetricInfo definition={METRIC_DEFINITIONS.uptime} /></div>
              </div>
              <div className="relative">
                <MetricCard title="Avg RUL" value={`${avgRUL}d`} icon={Clock} color={avgRUL > 60 ? "green" : avgRUL > 30 ? "amber" : "rose"} />
                <div className="absolute top-2 right-2"><MetricInfo definition={METRIC_DEFINITIONS.avgRUL} /></div>
              </div>
              <div className="relative">
                <MetricCard title="Total Cost" value={`$${(totalMaintenanceCost / 1000).toFixed(1)}k`} icon={DollarSign} color="purple" />
                <div className="absolute top-2 right-2"><MetricInfo definition="Total maintenance expenditure across all work orders." /></div>
              </div>
              <div className="relative">
                <MetricCard title="Technicians" value={technicians.filter(t => t.availability_status === 'available').length} icon={Users} color="blue" />
                <div className="absolute top-2 right-2"><MetricInfo definition="Number of technicians currently available for work." /></div>
              </div>
            </div>

            {/* Advanced Analytics Section */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <h2 className="text-lg font-semibold text-slate-800">Advanced Analytics</h2>
                <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">Deep Insights</span>
              </div>
              <p className="text-sm text-slate-500 mb-4">
                Detailed breakdowns of technician performance, location-based status, weekly trends, and cost analysis to identify optimization opportunities.
              </p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Technician Performance */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                    <div className="p-2 bg-indigo-50 rounded-lg">
                      <Award className="w-4 h-4 text-indigo-600" />
                    </div>
                    Technician Performance
                    <MetricInfo definition={METRIC_DEFINITIONS.techPerformance} />
                  </h3>
                </div>
                <div className="h-[280px]">
                  {technicianPerformance.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={technicianPerformance} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                        <XAxis dataKey="name" stroke="#94a3b8" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                        <YAxis yAxisId="left" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
                        <YAxis yAxisId="right" orientation="right" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} domain={[0, 100]} />
                        <RechartsTooltip content={<ChartTooltip />} />
                        <Bar yAxisId="left" dataKey="completed" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Tasks Completed" />
                        <Line yAxisId="right" type="monotone" dataKey="rating" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981', r: 4 }} name="Rating %" />
                      </ComposedChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-slate-400 text-sm">No technician data available</div>
                  )}
                </div>
              </motion.div>

              {/* Equipment Status by Location */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                    <div className="p-2 bg-teal-50 rounded-lg">
                      <MapPin className="w-4 h-4 text-teal-600" />
                    </div>
                    Status by Location
                    <MetricInfo definition={METRIC_DEFINITIONS.statusByLocation} />
                  </h3>
                </div>
                <div className="h-[280px]">
                  {locationData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={locationData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                        <XAxis dataKey="name" stroke="#94a3b8" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                        <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
                        <RechartsTooltip content={<ChartTooltip />} />
                        <Legend formatter={(value) => <span className="text-slate-600 text-xs capitalize">{value}</span>} />
                        <Bar dataKey="operational" stackId="a" fill="#10b981" name="Operational" />
                        <Bar dataKey="degraded" stackId="a" fill="#f59e0b" name="Degraded" />
                        <Bar dataKey="critical" stackId="a" fill="#f97316" name="Critical" />
                        <Bar dataKey="offline" stackId="a" fill="#ef4444" name="Offline" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-slate-400 text-sm">No location data available</div>
                  )}
                </div>
              </motion.div>

              {/* Weekly Task Trend */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                    <div className="p-2 bg-violet-50 rounded-lg">
                      <CalendarDays className="w-4 h-4 text-violet-600" />
                    </div>
                    Weekly Task Trend
                    <MetricInfo definition={METRIC_DEFINITIONS.weeklyTrend} />
                  </h3>
                </div>
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={weeklyTaskTrend} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                      <defs>
                        <linearGradient id="completedGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="scheduledGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                      <XAxis dataKey="week" stroke="#94a3b8" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <RechartsTooltip content={<ChartTooltip />} />
                      <Legend formatter={(value) => <span className="text-slate-600 text-xs capitalize">{value}</span>} />
                      <Area type="monotone" dataKey="completed" stroke="#10b981" fill="url(#completedGrad)" strokeWidth={2} name="Completed" />
                      <Area type="monotone" dataKey="scheduled" stroke="#3b82f6" fill="url(#scheduledGrad)" strokeWidth={2} name="Scheduled" />
                      <Line type="monotone" dataKey="overdue" stroke="#ef4444" strokeWidth={2} dot={{ fill: '#ef4444', r: 4 }} name="Overdue" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

              {/* Cost Breakdown */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                    <div className="p-2 bg-amber-50 rounded-lg">
                      <DollarSign className="w-4 h-4 text-amber-600" />
                    </div>
                    Cost Breakdown
                    <MetricInfo definition={METRIC_DEFINITIONS.costBreakdown} />
                  </h3>
                  <span className="text-xs text-slate-400 bg-slate-50 px-2 py-1 rounded-md">${totalMaintenanceCost.toLocaleString()} total</span>
                </div>
                <div className="h-[280px] flex items-center">
                  {costBreakdown.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={costBreakdown}
                          cx="50%"
                          cy="45%"
                          innerRadius={65}
                          outerRadius={95}
                          paddingAngle={4}
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          labelLine={false}
                        >
                          {costBreakdown.map((entry, index) => (
                            <Cell key={index} fill={entry.color} stroke="transparent" />
                          ))}
                        </Pie>
                        <RechartsTooltip 
                          formatter={(value) => `$${value.toLocaleString()}`}
                          content={<ChartTooltip />} 
                        />
                        <Legend 
                          verticalAlign="bottom" 
                          height={50}
                          formatter={(value) => <span className="text-slate-600 text-xs">{value}</span>}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">No cost data available</div>
                  )}
                </div>
              </motion.div>
            </div>

            {/* Operations Summary Section */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <h2 className="text-lg font-semibold text-slate-800">Operations Summary</h2>
              </div>
              <p className="text-sm text-slate-500 mb-4">
                Track maintenance task completion rates, work order distribution by type, and alert severity levels to understand your operational efficiency.
              </p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Task Completion */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow relative"
              >
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 bg-green-50 rounded-lg">
                    <Target className="w-4 h-4 text-green-600" />
                  </div>
                  <h3 className="text-base font-semibold text-slate-900">Task Completion</h3>
                  <MetricInfo definition={METRIC_DEFINITIONS.taskCompletion} />
                </div>
                <div className="h-[180px] flex items-center justify-center relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart 
                      cx="50%" 
                      cy="50%" 
                      innerRadius="65%" 
                      outerRadius="90%" 
                      data={[{ name: 'Completion', value: taskCompletionRate, fill: '#10b981' }]}
                      startAngle={90}
                      endAngle={-270}
                    >
                      <RadialBar
                        background={{ fill: '#f1f5f9' }}
                        dataKey="value"
                        cornerRadius={12}
                      />
                    </RadialBarChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-slate-900">{taskCompletionRate}%</p>
                      <p className="text-xs text-slate-500 mt-1">Completed</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Maintenance by Type */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 bg-violet-50 rounded-lg">
                    <Activity className="w-4 h-4 text-violet-600" />
                  </div>
                  <h3 className="text-base font-semibold text-slate-900">Maintenance by Type</h3>
                  <MetricInfo definition={METRIC_DEFINITIONS.maintenanceByType} />
                </div>
                <div className="h-[180px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={taskTypeData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                      <XAxis dataKey="name" stroke="#94a3b8" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <RechartsTooltip content={<ChartTooltip />} />
                      <Bar dataKey="value" radius={[6, 6, 0, 0]} name="Tasks">
                        {taskTypeData.map((entry, index) => (
                          <Cell key={index} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

              {/* Alert Severity */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 bg-red-50 rounded-lg">
                    <Zap className="w-4 h-4 text-red-600" />
                  </div>
                  <h3 className="text-base font-semibold text-slate-900">Alert Severity</h3>
                  <MetricInfo definition={METRIC_DEFINITIONS.alertSeverity} />
                </div>
                <div className="h-[180px] flex items-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={alertSeverity}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={70}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {alertSeverity.map((entry, index) => (
                          <Cell key={index} fill={entry.color} stroke="transparent" />
                        ))}
                      </Pie>
                      <RechartsTooltip content={<ChartTooltip />} />
                      <Legend 
                        verticalAlign="bottom" 
                        height={40}
                        formatter={(value) => <span className="text-slate-600 text-xs">{value}</span>}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            </div>
          </TabsContent>

          <TabsContent value="predictions" className="mt-0">
            <div className="bg-gradient-to-r from-violet-50 to-indigo-50 border border-violet-100 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-violet-100 rounded-lg shrink-0">
                  <Clock className="w-5 h-5 text-violet-600" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">Remaining Useful Life (RUL) Predictions</h2>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    RUL estimates how many days/hours an asset can operate before failure. 
                    <strong className="text-violet-700"> Lower RUL = higher urgency</strong>. 
                    Failure probability shows the likelihood of failure within 30 days. Use these predictions to prioritize maintenance and prevent unexpected downtime.
                  </p>
                </div>
              </div>
            </div>
            <RULVisualization 
              equipment={equipment}
              predictions={predictions}
            />
          </TabsContent>

          <TabsContent value="rootcause" className="mt-0">
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-amber-100 rounded-lg shrink-0">
                  <Search className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">Root Cause Analysis</h2>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    When anomalies or failures occur, root cause analysis identifies <strong className="text-amber-700">probable causes</strong> ranked by likelihood. 
                    This helps technicians fix the underlying issue rather than just symptoms. Higher probability percentages indicate more confident diagnoses.
                  </p>
                </div>
              </div>
            </div>
            <RootCausePanel 
              equipment={equipment}
              alerts={alerts}
            />
          </TabsContent>

          <TabsContent value="resources" className="mt-0">
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-emerald-100 rounded-lg shrink-0">
                  <Users className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">Resource Optimization</h2>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Balance technician workloads and optimize scheduling to maximize efficiency. 
                    <strong className="text-emerald-700"> Green bars</strong> indicate available capacity, while 
                    <strong className="text-amber-700"> orange/red</strong> shows overloaded resources that may cause delays.
                  </p>
                </div>
              </div>
            </div>
            <ResourceOptimizer 
              workOrders={workOrders}
              maintenanceTasks={tasks}
              equipment={equipment}
            />
          </TabsContent>

          <TabsContent value="inventory" className="mt-0">
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-100 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-100 rounded-lg shrink-0">
                  <Package className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">Spare Parts Inventory</h2>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Monitor stock levels and predicted demand for spare parts. 
                    <strong className="text-red-600"> Low stock</strong> items need reordering soon. 
                    <strong className="text-blue-700"> AI-predicted demand</strong> helps you order proactively before running out.
                  </p>
                </div>
              </div>
            </div>
            <SparePartsInventory 
              workOrders={workOrders}
              maintenanceTasks={tasks}
            />
          </TabsContent>

          <TabsContent value="automation" className="mt-0">
            <div className="bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-100 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-pink-100 rounded-lg shrink-0">
                  <Sparkles className="w-5 h-5 text-pink-600" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">AI-Powered Maintenance Automation</h2>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Configure automated triggers that create maintenance tasks when conditions are met (e.g., health score drops below 50%). 
                    <strong className="text-pink-700"> Run Predictive Analysis</strong> to scan all equipment and generate AI-suggested maintenance tasks. 
                    Review and approve suggestions before they become actual work orders.
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <RunPredictiveAnalysis
                equipment={equipment}
                predictions={predictions}
                triggers={triggers}
                technicians={technicians}
                onComplete={() => refetchSuggestions()}
              />

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                  <PredictiveWorkflowConfig 
                    triggers={triggers}
                    onRefresh={refetchTriggers}
                  />
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                  <SuggestedTasksPanel
                    suggestions={suggestedTasks}
                    technicians={technicians}
                    onRefresh={refetchSuggestions}
                  />
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}