import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { 
  Activity, TrendingUp, AlertTriangle, Clock, Brain, BarChart3, 
  PieChart as PieChartIcon, Calendar, Target, Zap, DollarSign,
  Package, Users, Search, Award, Sparkles
} from 'lucide-react';
import { 
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Legend, RadialBarChart, RadialBar
} from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MetricCard from '@/components/dashboard/MetricCard';
import CostOptimizationModule from '@/components/analytics/CostOptimizationModule';
import RULVisualization from '@/components/analytics/RULVisualization';
import SparePartsInventory from '@/components/inventory/SparePartsInventory';
import RootCausePanel from '@/components/analytics/RootCausePanel';
import ResourceOptimizer from '@/components/analytics/ResourceOptimizer';
import BenchmarkDashboard from '@/components/analytics/BenchmarkDashboard';
import PredictiveWorkflowConfig from '@/components/maintenance/PredictiveWorkflowConfig';
import SuggestedTasksPanel from '@/components/maintenance/SuggestedTasksPanel';
import RunPredictiveAnalysis from '@/components/maintenance/RunPredictiveAnalysis';

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

  // Trend data (simulated for now)
  const trendData = Array.from({ length: 30 }, (_, i) => ({
    day: `Day ${i + 1}`,
    health: 75 + Math.random() * 15 - 7,
    predictions: Math.floor(Math.random() * 10) + 1,
    alerts: Math.floor(Math.random() * 8),
  }));

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-lg">
        <p className="text-slate-500 text-xs mb-1">{label}</p>
        {payload.map((entry, idx) => (
          <p key={idx} className="text-sm font-medium" style={{ color: entry.color }}>
            {entry.name}: {typeof entry.value === 'number' ? entry.value.toFixed(1) : entry.value}
          </p>
        ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50 text-slate-900">
      <div className="max-w-[1800px] mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Analytics Dashboard</h1>
            <p className="text-sm text-slate-500">Comprehensive insights into your maintenance operations</p>
          </div>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-36 bg-white border-slate-200">
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
          <TabsList className="bg-white border border-slate-200 flex-wrap h-auto p-1">
            <TabsTrigger value="overview" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
              <BarChart3 className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="predictions" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
              <Brain className="w-4 h-4 mr-2" />
              RUL & Predictions
            </TabsTrigger>
            <TabsTrigger value="rootcause" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
              <Search className="w-4 h-4 mr-2" />
              Root Cause
            </TabsTrigger>
            <TabsTrigger value="resources" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
              <Users className="w-4 h-4 mr-2" />
              Resources
            </TabsTrigger>
            <TabsTrigger value="inventory" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
              <Package className="w-4 h-4 mr-2" />
              Spare Parts
            </TabsTrigger>
            <TabsTrigger value="benchmarks" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
              <Award className="w-4 h-4 mr-2" />
              Benchmarks
            </TabsTrigger>
            <TabsTrigger value="optimization" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
              <DollarSign className="w-4 h-4 mr-2" />
              Cost Optimization
            </TabsTrigger>
            <TabsTrigger value="automation" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
              <Sparkles className="w-4 h-4 mr-2" />
              AI Automation
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            {/* Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
              <MetricCard title="Fleet Health" value={`${avgHealth}%`} icon={Activity} color="green" />
              <MetricCard title="At Risk Assets" value={criticalAssets} icon={AlertTriangle} color="amber" />
              <MetricCard title="Pending Tasks" value={pendingTasks} icon={Clock} color="blue" />
              <MetricCard title="Completed" value={completedTasks} icon={Target} color="green" />
              <MetricCard title="Active Alerts" value={alerts.filter(a => a.status === 'active').length} icon={Zap} color="rose" />
              <MetricCard title="AI Confidence" value={`${avgPredictionConfidence}%`} icon={Brain} color="purple" />
            </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Health Trend */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm"
          >
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-400" />
              Fleet Health Trend
            </h3>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="healthGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="day" stroke="#64748b" tick={{ fill: '#64748b', fontSize: 10 }} />
                  <YAxis stroke="#64748b" tick={{ fill: '#64748b', fontSize: 10 }} domain={[60, 100]} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="health" stroke="#10b981" fill="url(#healthGradient)" strokeWidth={2} name="Health %" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Equipment by Type */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm"
          >
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-400" />
              Equipment by Type
            </h3>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={typeChartData} layout="vertical" margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis type="number" stroke="#64748b" tick={{ fill: '#64748b', fontSize: 10 }} />
                  <YAxis dataKey="name" type="category" stroke="#64748b" tick={{ fill: '#64748b', fontSize: 10 }} width={100} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} name="Count" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Health Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm"
          >
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <PieChartIcon className="w-5 h-5 text-emerald-400" />
              Health Distribution
            </h3>
            <div className="h-[280px] flex items-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={healthDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {healthDistribution.map((entry, index) => (
                      <Cell key={index} fill={entry.color} stroke="transparent" />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36}
                    formatter={(value) => <span className="text-slate-400 text-xs">{value}</span>}
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
            className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm"
          >
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              Risk Distribution
            </h3>
            <div className="h-[280px] flex items-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={riskDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {riskDistribution.map((entry, index) => (
                      <Cell key={index} fill={entry.color} stroke="transparent" />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36}
                    formatter={(value) => <span className="text-slate-400 text-xs">{value}</span>}
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
            className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm"
          >
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Task Completion Rate</h3>
            <div className="h-[200px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart 
                  cx="50%" 
                  cy="50%" 
                  innerRadius="60%" 
                  outerRadius="90%" 
                  data={[{ name: 'Completion', value: taskCompletionRate, fill: '#10b981' }]}
                  startAngle={90}
                  endAngle={-270}
                >
                  <RadialBar
                    background={{ fill: 'rgba(255,255,255,0.05)' }}
                    dataKey="value"
                    cornerRadius={10}
                  />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="absolute text-center">
                <p className="text-3xl font-bold text-slate-900">{taskCompletionRate}%</p>
                <p className="text-xs text-slate-400">Completed</p>
              </div>
            </div>
          </motion.div>

          {/* Maintenance by Type */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm"
          >
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Maintenance by Type</h3>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={taskTypeData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" stroke="#64748b" tick={{ fill: '#64748b', fontSize: 10 }} />
                  <YAxis stroke="#64748b" tick={{ fill: '#64748b', fontSize: 10 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]} name="Tasks">
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
            className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm"
          >
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Alert Severity</h3>
            <div className="h-[200px] flex items-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={alertSeverity}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {alertSeverity.map((entry, index) => (
                      <Cell key={index} fill={entry.color} stroke="transparent" />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36}
                    formatter={(value) => <span className="text-slate-400 text-xs">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>
          </TabsContent>

          <TabsContent value="predictions" className="mt-6">
            <RULVisualization 
              equipment={equipment}
              predictions={predictions}
            />
          </TabsContent>

          <TabsContent value="rootcause" className="mt-6">
            <RootCausePanel 
              equipment={equipment}
              alerts={alerts}
            />
          </TabsContent>

          <TabsContent value="resources" className="mt-6">
            <ResourceOptimizer 
              workOrders={workOrders}
              maintenanceTasks={tasks}
              equipment={equipment}
            />
          </TabsContent>

          <TabsContent value="inventory" className="mt-6">
            <SparePartsInventory 
              workOrders={workOrders}
              maintenanceTasks={tasks}
            />
          </TabsContent>

          <TabsContent value="benchmarks" className="mt-6">
            <BenchmarkDashboard 
              equipment={equipment}
              workOrders={workOrders}
              maintenanceTasks={tasks}
            />
          </TabsContent>

          <TabsContent value="optimization" className="mt-6">
            <CostOptimizationModule 
              equipment={equipment}
              predictions={predictions}
              tasks={tasks}
            />
          </TabsContent>

          <TabsContent value="automation" className="mt-6">
            <div className="space-y-6">
              <RunPredictiveAnalysis
                equipment={equipment}
                predictions={predictions}
                triggers={triggers}
                technicians={technicians}
                onComplete={() => refetchSuggestions()}
              />

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <PredictiveWorkflowConfig 
                    triggers={triggers}
                    onRefresh={refetchTriggers}
                  />
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-6">
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