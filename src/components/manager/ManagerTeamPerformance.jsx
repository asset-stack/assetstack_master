import React from 'react';
import { motion } from 'framer-motion';
import { Users, Star, Clock, CheckCircle2, TrendingUp } from 'lucide-react';
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

export default function ManagerTeamPerformance({ technicians = [], tasks = [], workOrders = [] }) {
  const techStats = technicians
    .map(tech => {
      const assignedTasks = tasks.filter(t => t.assigned_to === tech.id || t.assigned_to === tech.name);
      const completedTasks = assignedTasks.filter(t => t.status === 'completed');
      const assignedWOs = workOrders.filter(w => w.assigned_to === tech.id);
      const completedWOs = assignedWOs.filter(w => w.status === 'completed' || w.status === 'closed');

      return {
        ...tech,
        totalAssigned: assignedTasks.length + assignedWOs.length,
        totalCompleted: completedTasks.length + completedWOs.length,
        completionRate: (assignedTasks.length + assignedWOs.length) > 0
          ? Math.round(((completedTasks.length + completedWOs.length) / (assignedTasks.length + assignedWOs.length)) * 100)
          : 0,
      };
    })
    .sort((a, b) => b.totalCompleted - a.totalCompleted)
    .slice(0, 10);

  const statusColors = {
    available: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    busy: 'bg-amber-50 text-amber-700 border-amber-200',
    on_leave: 'bg-slate-50 text-slate-700 border-slate-200',
    unavailable: 'bg-rose-50 text-rose-700 border-rose-200',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-white rounded-xl border border-slate-200 p-5"
    >
      <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
        <Users className="w-4 h-4 text-violet-600" /> Team Performance
      </h3>

      {techStats.length === 0 ? (
        <p className="text-center text-slate-400 py-8 text-sm">No technicians found</p>
      ) : (
        <div className="space-y-3 max-h-[400px] overflow-y-auto">
          {techStats.map((tech, idx) => (
            <div key={tech.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold text-sm shrink-0">
                {idx + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-slate-700 text-sm truncate">{tech.name}</p>
                  <Badge variant="outline" className={`text-[10px] ${statusColors[tech.availability_status] || statusColors.available}`}>
                    {tech.availability_status || 'available'}
                  </Badge>
                </div>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> {tech.totalCompleted}/{tech.totalAssigned}
                  </span>
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <Star className="w-3 h-3" /> {tech.performance_rating || '-'}
                  </span>
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {tech.current_workload_hours || 0}h
                  </span>
                </div>
                <Progress value={tech.completionRate} className="h-1.5 mt-2" />
              </div>
              <div className="text-right shrink-0">
                <p className="text-lg font-semibold text-slate-800">{tech.completionRate}%</p>
                <p className="text-[10px] text-slate-400">completion</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}