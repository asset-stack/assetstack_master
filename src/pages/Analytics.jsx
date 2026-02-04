import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { 
  Activity, TrendingUp, AlertTriangle, Clock, Brain, BarChart3, 
  PieChart as PieChartIcon, Calendar, Target, Zap,
  Package, Users, Search, Sparkles
} from 'lucide-react';
import { 
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Legend, RadialBarChart, RadialBar
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

  const CustomTooltip = ({ active, payload, label }) => {
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
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button className="ml-1 text-slate-400 hover:text-slate-600 transition-colors">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" strokeWidth="2" />
              <path strokeLinecap="round" strokeWidth="2" d="M12 16v-4M12 8h.01" />
            </svg>
          </button>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs bg-slate-900 text-white border-slate-700">
          <p className="text-xs">{definition}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-[1800px] mx-auto px-6 py-8">
        {/* Header */}
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
            {/* Metrics with definitions */}
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

            {/* Charts Grid */}
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
                      <Tooltip content={<CustomTooltip />} />
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
                      <Tooltip content={<CustomTooltip />} />
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
                      <Tooltip content={<CustomTooltip />} />
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
                      <Tooltip content={<CustomTooltip />} />
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

            {/* Bottom Row */}
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
                </div>
                <div className="h-[180px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={taskTypeData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                      <XAxis dataKey="name" stroke="#94a3b8" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} />
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
                      <Tooltip content={<CustomTooltip />} />
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
            <RULVisualization 
              equipment={equipment}
              predictions={predictions}
            />
          </TabsContent>

          <TabsContent value="rootcause" className="mt-0">
            <RootCausePanel 
              equipment={equipment}
              alerts={alerts}
            />
          </TabsContent>

          <TabsContent value="resources" className="mt-0">
            <ResourceOptimizer 
              workOrders={workOrders}
              maintenanceTasks={tasks}
              equipment={equipment}
            />
          </TabsContent>

          <TabsContent value="inventory" className="mt-0">
            <SparePartsInventory 
              workOrders={workOrders}
              maintenanceTasks={tasks}
            />
          </TabsContent>

          <TabsContent value="automation" className="mt-0">
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