import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { secureEntity } from '@/lib/secureEntities';
import { motion } from 'framer-motion';
import {
  Users, Wrench, AlertTriangle, CheckCircle2, Clock, TrendingUp, 
  BarChart3, Cpu, Calendar, Activity, ArrowUpRight, ArrowDownRight, 
  Loader2, Shield, Target
} from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { format, subDays, isAfter } from 'date-fns';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts';

import ManagerTeamPerformance from '@/components/manager/ManagerTeamPerformance';
import ManagerAlertsSummary from '@/components/manager/ManagerAlertsSummary';

export default function ManagerDashboard() {
  const [dateRange, setDateRange] = useState('30');

  const { data: tasks = [], isLoading: loadingTasks } = useQuery({
    queryKey: ['all-tasks'],
    queryFn: () => secureEntity('MaintenanceTask').list('-created_date', 500),
  });

  const { data: workOrders = [], isLoading: loadingWO } = useQuery({
    queryKey: ['all-workorders'],
    queryFn: () => secureEntity('WorkOrder').list('-created_date', 500),
  });

  const { data: technicians = [] } = useQuery({
    queryKey: ['technicians'],
    queryFn: () => secureEntity('Technician').list('-created_date', 200),
  });

  const { data: equipment = [] } = useQuery({
    queryKey: ['equipment'],
    queryFn: () => secureEntity('Equipment').list('-created_date', 500),
  });

  const { data: alerts = [] } = useQuery({
    queryKey: ['all-alerts'],
    queryFn: () => secureEntity('Alert').list('-created_date', 500),
  });

  const isLoading = loadingTasks || loadingWO;
  const cutoffDate = subDays(new Date(), parseInt(dateRange));

  // Filtered data
  const recentTasks = tasks.filter(t => isAfter(new Date(t.created_date), cutoffDate));
  const recentWOs = workOrders.filter(w => isAfter(new Date(w.created_date), cutoffDate));
  const activeAlerts = alerts.filter(a => a.status === 'active');

  // KPIs
  const completedTasks = recentTasks.filter(t => t.status === 'completed').length;
  const totalTasks = recentTasks.length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const overdueTasks = tasks.filter(t => t.status === 'overdue').length;
  const inProgressWOs = workOrders.filter(w => w.status === 'in_progress').length;
  const avgHealthScore = equipment.length > 0 
    ? Math.round(equipment.reduce((sum, e) => sum + (e.health_score || 0), 0) / equipment.length) 
    : 0;
  const criticalEquipment = equipment.filter(e => e.status === 'critical' || e.risk_level === 'critical').length;
  const availableTechs = technicians.filter(t => t.availability_status === 'available').length;

  // Task type distribution
  const taskTypeData = ['preventive', 'predictive', 'corrective', 'emergency', 'inspection'].map(type => ({
    name: type.charAt(0).toUpperCase() + type.slice(1),
    count: recentTasks.filter(t => t.type === type).length,
  })).filter(d => d.count > 0);

  const typeColors = ['#6366f1', '#8b5cf6', '#f59e0b', '#ef4444', '#10b981'];

  // Task status distribution
  const taskStatusData = [
    { name: 'Scheduled', value: tasks.filter(t => t.status === 'scheduled').length, color: '#6366f1' },
    { name: 'In Progress', value: tasks.filter(t => t.status === 'in_progress').length, color: '#8b5cf6' },
    { name: 'Completed', value: tasks.filter(t => t.status === 'completed').length, color: '#10b981' },
    { name: 'Overdue', value: tasks.filter(t => t.status === 'overdue').length, color: '#ef4444' },
  ].filter(d => d.value > 0);

  // Work order costs
  const totalCostEstimated = recentWOs.reduce((sum, w) => sum + (w.estimated_cost || 0), 0);
  const totalCostActual = recentWOs.reduce((sum, w) => sum + (w.actual_total_cost || 0), 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-slate-900">
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 py-4 sm:py-8" style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 80px)' }}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-slate-900 flex items-center gap-2">
              <Shield className="w-6 h-6 text-indigo-600" />
              Manager Dashboard
            </h1>
            <p className="text-sm text-slate-500">Overview of team performance, tasks & fleet health</p>
          </div>
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-40 bg-white border-slate-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <KPICard icon={Target} label="Completion Rate" value={`${completionRate}%`} sub={`${completedTasks}/${totalTasks} tasks`} color="indigo" />
          <KPICard icon={AlertTriangle} label="Overdue Tasks" value={overdueTasks} sub="Require attention" color="rose" trend={overdueTasks > 3 ? 'up' : 'down'} trendBad={overdueTasks > 3} />
          <KPICard icon={Activity} label="Avg Health Score" value={avgHealthScore} sub={`${criticalEquipment} critical assets`} color="emerald" />
          <KPICard icon={Users} label="Available Techs" value={`${availableTechs}/${technicians.length}`} sub={`${inProgressWOs} active work orders`} color="violet" />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          {/* Task Type Distribution */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-indigo-600" /> Task Types
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={taskTypeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Task Status Pie */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Wrench className="w-4 h-4 text-indigo-600" /> Task Status Overview
            </h3>
            <div className="flex items-center">
              <ResponsiveContainer width="50%" height={220}>
                <PieChart>
                  <Pie data={taskStatusData} cx="50%" cy="50%" outerRadius={80} dataKey="value" strokeWidth={2}>
                    {taskStatusData.map((entry, idx) => (
                      <Cell key={idx} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2">
                {taskStatusData.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-sm text-slate-600">{item.name}</span>
                    <span className="text-sm font-semibold text-slate-800 ml-auto">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Cost Summary */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-white rounded-xl border border-slate-200 p-5 mb-6">
          <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-600" /> Cost Summary (Last {dateRange} days)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-50 rounded-lg">
              <p className="text-sm text-slate-500">Estimated Costs</p>
              <p className="text-2xl font-semibold text-slate-900">${totalCostEstimated.toLocaleString()}</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg">
              <p className="text-sm text-slate-500">Actual Costs</p>
              <p className="text-2xl font-semibold text-slate-900">${totalCostActual.toLocaleString()}</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg">
              <p className="text-sm text-slate-500">Variance</p>
              <p className={`text-2xl font-semibold ${totalCostActual <= totalCostEstimated ? 'text-emerald-600' : 'text-rose-600'}`}>
                {totalCostActual <= totalCostEstimated ? '-' : '+'}${Math.abs(totalCostActual - totalCostEstimated).toLocaleString()}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Team Performance & Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ManagerTeamPerformance technicians={technicians} tasks={tasks} workOrders={workOrders} />
          <ManagerAlertsSummary alerts={alerts} equipment={equipment} />
        </div>
      </div>
    </div>
  );
}

function KPICard({ icon: Icon, label, value, sub, color, trend, trendBad }) {
  const colorMap = {
    indigo: 'bg-indigo-100 text-indigo-600',
    rose: 'bg-rose-100 text-rose-600',
    emerald: 'bg-emerald-100 text-emerald-600',
    violet: 'bg-violet-100 text-violet-600',
  };
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
      <div className="flex items-start justify-between mb-2">
        <div className={`p-2 rounded-lg ${colorMap[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
        {trend && (
          <span className={`flex items-center text-xs font-medium ${trendBad ? 'text-rose-600' : 'text-emerald-600'}`}>
            {trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          </span>
        )}
      </div>
      <p className="text-2xl font-semibold text-slate-900">{value}</p>
      <p className="text-xs text-slate-500 mt-0.5">{label}</p>
      <p className="text-[11px] text-slate-400">{sub}</p>
    </motion.div>
  );
}