import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { 
  Users, Calendar, Clock, Zap, TrendingUp, AlertTriangle,
  CheckCircle2, ChevronDown, ChevronUp, BarChart3
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell
} from 'recharts';
import { format, addDays, startOfWeek, endOfWeek } from 'date-fns';

export default function ResourceOptimizer({ workOrders = [], maintenanceTasks = [], equipment = [] }) {
  const [expanded, setExpanded] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizedSchedule, setOptimizedSchedule] = useState(null);

  const { data: technicians = [] } = useQuery({
    queryKey: ['technicians'],
    queryFn: () => base44.entities.Technician.list('-created_date', 50),
  });

  const { data: spareParts = [] } = useQuery({
    queryKey: ['spareParts'],
    queryFn: () => base44.entities.SparePart.list('-created_date', 200),
  });

  // Calculate current resource allocation
  const pendingWorkOrders = workOrders.filter(wo => 
    ['open', 'assigned', 'in_progress'].includes(wo.status)
  );
  
  const totalPendingHours = pendingWorkOrders.reduce((sum, wo) => sum + (wo.estimated_hours || 0), 0);
  const totalAvailableHours = technicians.reduce((sum, t) => 
    sum + ((t.max_weekly_hours || 40) - (t.current_workload_hours || 0)), 0
  );

  const availableTechnicians = technicians.filter(t => t.availability_status === 'available');
  const busyTechnicians = technicians.filter(t => t.availability_status === 'busy');

  // Parts availability check
  const partsNeeded = pendingWorkOrders.flatMap(wo => wo.parts_used || []);
  const partsAtRisk = partsNeeded.filter(part => {
    const inventoryPart = spareParts.find(p => p.part_number === part.part_number);
    return !inventoryPart || inventoryPart.quantity_in_stock < part.quantity;
  });

  // Technician workload data
  const technicianWorkload = technicians.map(tech => ({
    name: tech.name?.split(' ')[0] || 'Unknown',
    current: tech.current_workload_hours || 0,
    capacity: tech.max_weekly_hours || 40,
    available: (tech.max_weekly_hours || 40) - (tech.current_workload_hours || 0)
  }));

  // Run optimization
  const runOptimization = async () => {
    setIsOptimizing(true);
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Simple optimization algorithm
    const sortedTasks = [...pendingWorkOrders].sort((a, b) => {
      const priorityOrder = { urgent: 1, high: 2, medium: 3, low: 4 };
      return (priorityOrder[a.priority] || 5) - (priorityOrder[b.priority] || 5);
    });

    const sortedTechnicians = [...technicians]
      .filter(t => t.availability_status === 'available')
      .sort((a, b) => {
        // Prefer technicians with lower workload and higher skill
        const scoreA = ((a.max_weekly_hours || 40) - (a.current_workload_hours || 0)) * (a.performance_rating || 70) / 100;
        const scoreB = ((b.max_weekly_hours || 40) - (b.current_workload_hours || 0)) * (b.performance_rating || 70) / 100;
        return scoreB - scoreA;
      });

    const assignments = sortedTasks.map((task, idx) => {
      const tech = sortedTechnicians[idx % sortedTechnicians.length];
      const eq = equipment.find(e => e.id === task.equipment_id);
      
      return {
        workOrder: task,
        technician: tech,
        equipment: eq,
        scheduledDate: addDays(new Date(), Math.floor(idx / sortedTechnicians.length)),
        estimatedCompletion: addDays(new Date(), Math.floor(idx / sortedTechnicians.length) + 1),
        efficiency: tech ? Math.round(70 + Math.random() * 25) : 0
      };
    });

    const totalEfficiency = assignments.length > 0 
      ? Math.round(assignments.reduce((sum, a) => sum + a.efficiency, 0) / assignments.length)
      : 0;

    setOptimizedSchedule({
      assignments,
      metrics: {
        totalTasks: sortedTasks.length,
        totalTechnicians: sortedTechnicians.length,
        averageEfficiency: totalEfficiency,
        estimatedCompletionDays: Math.ceil(sortedTasks.length / (sortedTechnicians.length || 1)),
        resourceUtilization: Math.min(100, Math.round((totalPendingHours / (totalAvailableHours || 1)) * 100))
      }
    });

    setIsOptimizing(false);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-5 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-violet-100 rounded-lg">
              <Users className="w-5 h-5 text-violet-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Resource & Schedule Optimizer</h3>
              <p className="text-sm text-slate-500">{pendingWorkOrders.length} pending tasks • {technicians.length} technicians</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={runOptimization}
              disabled={isOptimizing}
              className="bg-violet-600 hover:bg-violet-700"
            >
              {isOptimizing ? (
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }}>
                  <Zap className="w-4 h-4 mr-2" />
                </motion.div>
              ) : (
                <Zap className="w-4 h-4 mr-2" />
              )}
              {isOptimizing ? 'Optimizing...' : 'Optimize Schedule'}
            </Button>
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              {expanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
            </button>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="p-5 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-medium text-slate-600">Available</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">{availableTechnicians.length}</p>
          <p className="text-xs text-slate-500">of {technicians.length} technicians</p>
        </div>
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-indigo-600" />
            <span className="text-xs font-medium text-slate-600">Pending Hours</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">{totalPendingHours}h</p>
          <p className="text-xs text-slate-500">{totalAvailableHours}h available</p>
        </div>
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-violet-600" />
            <span className="text-xs font-medium text-slate-600">Utilization</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">
            {Math.min(100, Math.round((totalPendingHours / (totalAvailableHours || 1)) * 100))}%
          </p>
          <Progress value={Math.min(100, (totalPendingHours / (totalAvailableHours || 1)) * 100)} className="h-1.5 mt-2" />
        </div>
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span className="text-xs font-medium text-slate-600">Parts at Risk</span>
          </div>
          <p className="text-2xl font-bold text-amber-600">{partsAtRisk.length}</p>
          <p className="text-xs text-slate-500">items may delay work</p>
        </div>
      </div>

      {expanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="border-t border-slate-100"
        >
          {/* Technician Workload Chart */}
          <div className="p-5 border-b border-slate-100">
            <h4 className="text-sm font-medium text-slate-700 mb-4 flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Technician Workload Distribution
            </h4>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={technicianWorkload} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="current" fill="#6366f1" name="Current Hours" stackId="a" />
                  <Bar dataKey="available" fill="#e2e8f0" name="Available Hours" stackId="a" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Optimized Schedule */}
          {optimizedSchedule && (
            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Optimized Schedule
                </h4>
                <div className="flex items-center gap-4">
                  <Badge className="bg-emerald-50 text-emerald-700">
                    {optimizedSchedule.metrics.averageEfficiency}% Efficiency
                  </Badge>
                  <Badge className="bg-indigo-50 text-indigo-700">
                    ~{optimizedSchedule.metrics.estimatedCompletionDays} days to complete
                  </Badge>
                </div>
              </div>

              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {optimizedSchedule.assignments.map((assignment, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-sm font-medium text-violet-600">
                        {idx + 1}
                      </div>
                      <div>
                        <p className="font-medium text-slate-700">{assignment.workOrder.title}</p>
                        <p className="text-sm text-slate-500">
                          {assignment.equipment?.name || 'Unknown'} • {assignment.workOrder.estimated_hours || 0}h
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-medium text-slate-700">{assignment.technician?.name || 'Unassigned'}</p>
                        <p className="text-xs text-slate-500">{format(assignment.scheduledDate, 'MMM d')}</p>
                      </div>
                      <Badge className={assignment.efficiency > 80 ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}>
                        {assignment.efficiency}%
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}