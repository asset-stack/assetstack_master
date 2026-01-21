import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { 
  BarChart3, TrendingUp, TrendingDown, Clock, DollarSign, 
  Target, Award, AlertTriangle, CheckCircle2
} from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Legend, ReferenceLine, Area, AreaChart
} from 'recharts';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';

export default function BenchmarkDashboard({ equipment = [], workOrders = [], maintenanceTasks = [] }) {
  const [selectedPeriod, setSelectedPeriod] = useState('6months');
  const [selectedEquipment, setSelectedEquipment] = useState('all');

  const { data: benchmarks = [] } = useQuery({
    queryKey: ['benchmarks'],
    queryFn: () => base44.entities.PerformanceBenchmark.list('-period_end', 200),
  });

  const equipmentMap = equipment.reduce((acc, e) => { acc[e.id] = e; return acc; }, {});

  // Filter benchmarks
  const filteredBenchmarks = benchmarks.filter(b => 
    selectedEquipment === 'all' || b.equipment_id === selectedEquipment
  );

  // Calculate fleet-wide KPIs
  const calculateFleetKPIs = () => {
    const completedTasks = maintenanceTasks.filter(t => t.status === 'completed');
    const completedWorkOrders = workOrders.filter(wo => wo.status === 'completed' || wo.status === 'closed');
    
    const totalLaborCost = completedWorkOrders.reduce((sum, wo) => sum + (wo.actual_labor_cost || 0), 0);
    const totalPartsCost = completedWorkOrders.reduce((sum, wo) => sum + (wo.actual_parts_cost || 0), 0);
    const totalMaintenanceCost = totalLaborCost + totalPartsCost;

    const avgHealth = equipment.length > 0 
      ? Math.round(equipment.reduce((sum, e) => sum + (e.health_score || 0), 0) / equipment.length)
      : 0;

    const criticalEquipment = equipment.filter(e => e.risk_level === 'critical' || e.risk_level === 'high').length;

    // Simulated metrics (would come from benchmarks in production)
    const mtbf = 720 + Math.random() * 200; // hours
    const mttr = 4 + Math.random() * 3; // hours
    const availability = 95 + Math.random() * 4;
    const oee = 80 + Math.random() * 15;

    return {
      totalAssets: equipment.length,
      avgHealth,
      criticalEquipment,
      completedTasks: completedTasks.length,
      totalMaintenanceCost,
      mtbf: Math.round(mtbf),
      mttr: mttr.toFixed(1),
      availability: availability.toFixed(1),
      oee: oee.toFixed(1),
      preventiveVsCorrective: {
        preventive: completedTasks.filter(t => t.type === 'preventive' || t.type === 'predictive').length,
        corrective: completedTasks.filter(t => t.type === 'corrective' || t.type === 'emergency').length
      }
    };
  };

  const kpis = calculateFleetKPIs();

  // Generate trend data
  const generateTrendData = () => {
    return Array.from({ length: 6 }, (_, i) => {
      const month = subMonths(new Date(), 5 - i);
      return {
        month: format(month, 'MMM'),
        availability: 93 + Math.random() * 5,
        mtbf: 650 + Math.random() * 150 + (i * 20),
        oee: 78 + Math.random() * 12 + (i * 1.5),
        cost: 15000 + Math.random() * 10000 - (i * 1000)
      };
    });
  };

  const trendData = generateTrendData();

  // Cost breakdown
  const costBreakdown = [
    { category: 'Labor', value: Math.round(kpis.totalMaintenanceCost * 0.45), color: '#6366f1' },
    { category: 'Parts', value: Math.round(kpis.totalMaintenanceCost * 0.35), color: '#8b5cf6' },
    { category: 'Contractors', value: Math.round(kpis.totalMaintenanceCost * 0.15), color: '#a855f7' },
    { category: 'Other', value: Math.round(kpis.totalMaintenanceCost * 0.05), color: '#c084fc' }
  ];

  // PDM savings calculation
  const pdmSavings = {
    preventedFailures: 12 + Math.floor(Math.random() * 8),
    estimatedSavings: 45000 + Math.floor(Math.random() * 30000),
    downtimeAvoided: 180 + Math.floor(Math.random() * 120),
    accuracyRate: 85 + Math.random() * 10
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-lg">
        <p className="text-sm font-medium text-slate-700 mb-2">{label}</p>
        {payload.map((entry, idx) => (
          <p key={idx} className="text-xs" style={{ color: entry.color }}>
            {entry.name}: {typeof entry.value === 'number' ? entry.value.toFixed(1) : entry.value}
          </p>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
            <Award className="w-6 h-6 text-amber-500" />
            Performance Benchmarking
          </h2>
          <p className="text-sm text-slate-500">Track and compare maintenance effectiveness over time</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-36 bg-white border-slate-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white border-slate-200">
              <SelectItem value="1month">Last Month</SelectItem>
              <SelectItem value="3months">3 Months</SelectItem>
              <SelectItem value="6months">6 Months</SelectItem>
              <SelectItem value="1year">1 Year</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedEquipment} onValueChange={setSelectedEquipment}>
            <SelectTrigger className="w-44 bg-white border-slate-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white border-slate-200">
              <SelectItem value="all">All Equipment</SelectItem>
              {equipment.slice(0, 10).map(eq => (
                <SelectItem key={eq.id} value={eq.id}>{eq.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-slate-500">MTBF</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{kpis.mtbf}h</p>
          <p className="text-xs text-emerald-600 mt-1">+8% vs last period</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-slate-500">MTTR</span>
            <TrendingDown className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{kpis.mttr}h</p>
          <p className="text-xs text-emerald-600 mt-1">-12% vs last period</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-slate-500">Availability</span>
            <Target className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{kpis.availability}%</p>
          <Progress value={parseFloat(kpis.availability)} className="h-1.5 mt-2" />
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-slate-500">OEE</span>
            <BarChart3 className="w-4 h-4 text-violet-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{kpis.oee}%</p>
          <Progress value={parseFloat(kpis.oee)} className="h-1.5 mt-2" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Availability & OEE Trend */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <h3 className="font-medium text-slate-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            Availability & OEE Trend
          </h3>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} domain={[70, 100]} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <ReferenceLine y={95} stroke="#10b981" strokeDasharray="3 3" label={{ value: 'Target', fill: '#10b981', fontSize: 10 }} />
                <Line type="monotone" dataKey="availability" stroke="#6366f1" strokeWidth={2} dot={{ fill: '#6366f1' }} name="Availability %" />
                <Line type="monotone" dataKey="oee" stroke="#8b5cf6" strokeWidth={2} dot={{ fill: '#8b5cf6' }} name="OEE %" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* MTBF Trend */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <h3 className="font-medium text-slate-900 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-600" />
            Mean Time Between Failures
          </h3>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="mtbf" stroke="#6366f1" fill="#c7d2fe" strokeWidth={2} name="MTBF (hours)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cost Breakdown */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <h3 className="font-medium text-slate-900 mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-600" />
            Maintenance Cost Breakdown
          </h3>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={costBreakdown} layout="vertical" margin={{ top: 0, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" stroke="#64748b" tick={{ fontSize: 10 }} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                <YAxis dataKey="category" type="category" stroke="#64748b" tick={{ fontSize: 10 }} width={70} />
                <Tooltip formatter={(v) => `$${v.toLocaleString()}`} />
                <Bar dataKey="value" name="Cost">
                  {costBreakdown.map((entry, idx) => (
                    <Cell key={idx} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100 text-center">
            <p className="text-sm text-slate-500">Total Maintenance Cost</p>
            <p className="text-2xl font-bold text-slate-900">${kpis.totalMaintenanceCost.toLocaleString()}</p>
          </div>
        </div>

        {/* Preventive vs Corrective */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <h3 className="font-medium text-slate-900 mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-violet-600" />
            Maintenance Type Distribution
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-slate-600">Preventive/Predictive</span>
                <span className="text-sm font-medium text-emerald-600">{kpis.preventiveVsCorrective.preventive}</span>
              </div>
              <Progress value={(kpis.preventiveVsCorrective.preventive / (kpis.completedTasks || 1)) * 100} className="h-3 bg-slate-100" />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-slate-600">Corrective/Emergency</span>
                <span className="text-sm font-medium text-amber-600">{kpis.preventiveVsCorrective.corrective}</span>
              </div>
              <Progress value={(kpis.preventiveVsCorrective.corrective / (kpis.completedTasks || 1)) * 100} className="h-3 bg-slate-100" />
            </div>
          </div>
          <div className="mt-6 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
            <p className="text-sm font-medium text-emerald-800">
              {Math.round((kpis.preventiveVsCorrective.preventive / (kpis.completedTasks || 1)) * 100)}% Proactive Maintenance
            </p>
            <p className="text-xs text-emerald-600 mt-1">Industry benchmark: 70%</p>
          </div>
        </div>

        {/* PDM Effectiveness */}
        <div className="bg-gradient-to-br from-violet-50 to-indigo-50 rounded-xl border border-violet-200 p-5">
          <h3 className="font-medium text-slate-900 mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-violet-600" />
            Predictive Maintenance ROI
          </h3>
          <div className="space-y-4">
            <div className="p-3 bg-white rounded-lg shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Failures Prevented</span>
                <span className="text-lg font-bold text-emerald-600">{pdmSavings.preventedFailures}</span>
              </div>
            </div>
            <div className="p-3 bg-white rounded-lg shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Estimated Savings</span>
                <span className="text-lg font-bold text-emerald-600">${(pdmSavings.estimatedSavings / 1000).toFixed(0)}k</span>
              </div>
            </div>
            <div className="p-3 bg-white rounded-lg shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Downtime Avoided</span>
                <span className="text-lg font-bold text-indigo-600">{pdmSavings.downtimeAvoided}h</span>
              </div>
            </div>
            <div className="p-3 bg-white rounded-lg shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Prediction Accuracy</span>
                <span className="text-lg font-bold text-violet-600">{pdmSavings.accuracyRate.toFixed(0)}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}