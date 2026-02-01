import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, User, Wrench, Cpu, ChevronRight, Sparkles, AlertTriangle } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from 'date-fns';

export default function MaintenanceCard({ task, equipment, onStatusChange, delay = 0 }) {
  const getPriorityConfig = (priority) => {
    const configs = {
      urgent: { color: 'bg-rose-50 text-rose-700 border-rose-200', dot: 'bg-rose-500' },
      high: { color: 'bg-orange-50 text-orange-700 border-orange-200', dot: 'bg-orange-500' },
      medium: { color: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
      low: { color: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' }
    };
    return configs[priority] || configs.medium;
  };

  const getStatusConfig = (status) => {
    const configs = {
      scheduled: { color: 'bg-indigo-50 text-indigo-700', label: 'Scheduled' },
      in_progress: { color: 'bg-violet-50 text-violet-700', label: 'In Progress' },
      completed: { color: 'bg-emerald-50 text-emerald-700', label: 'Completed' },
      overdue: { color: 'bg-rose-50 text-rose-700', label: 'Overdue' },
      cancelled: { color: 'bg-slate-100 text-slate-600', label: 'Cancelled' }
    };
    return configs[status] || configs.scheduled;
  };

  const getTypeIcon = (type) => {
    const icons = {
      preventive: '🔧',
      predictive: '🤖',
      corrective: '⚠️',
      emergency: '🚨',
      inspection: '🔍'
    };
    return icons[type] || '🔧';
  };

  const priorityConfig = getPriorityConfig(task.priority);
  const statusConfig = getStatusConfig(task.status);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className="bg-white rounded-xl border border-slate-200 p-5 hover:border-indigo-300 hover:shadow-md transition-all group"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-lg">{getTypeIcon(task.type)}</span>
          <Badge variant="outline" className={priorityConfig.color}>
            {task.priority}
          </Badge>
          <Badge className={statusConfig.color}>
            {statusConfig.label}
          </Badge>
          {task.ai_recommended && (
            <Badge className="bg-violet-50 text-violet-700 border-violet-200 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              AI {task.ai_confidence}%
            </Badge>
          )}
          {equipment?.criticality === 'mission_critical' && (
            <Badge className="bg-rose-50 text-rose-700 border-rose-200 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              CRITICAL
            </Badge>
          )}
        </div>
      </div>

      <h4 className="text-base font-semibold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">
        {task.title}
      </h4>
      
      {task.description && (
        <p className="text-sm text-slate-500 mb-4 line-clamp-2">{task.description}</p>
      )}

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Cpu className="w-4 h-4" />
          <span className="truncate">{equipment?.name || 'Unknown Equipment'}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Calendar className="w-4 h-4" />
          <span>
            {task.scheduled_date ? format(new Date(task.scheduled_date), 'MMM d, yyyy') : 'Not scheduled'}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Clock className="w-4 h-4" />
          <span>{task.estimated_duration_hours || '?'}h estimated</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <User className="w-4 h-4" />
          <span className="truncate">{task.assigned_to || 'Unassigned'}</span>
        </div>
      </div>

      {task.parts_required && task.parts_required.length > 0 && (
        <div className={`mb-4 p-2.5 rounded-lg ${task.ai_recommended ? 'bg-violet-50 border border-violet-100' : 'bg-slate-50'}`}>
          <p className={`text-xs mb-1.5 flex items-center gap-1 ${task.ai_recommended ? 'text-violet-600' : 'text-slate-500'}`}>
            {task.ai_recommended && <Sparkles className="w-3 h-3" />}
            {task.ai_recommended ? 'AI Suggested Parts:' : 'Parts Required:'}
          </p>
          <div className="flex flex-wrap gap-1">
            {task.parts_required.slice(0, 3).map((part, idx) => (
              <Badge key={idx} variant="outline" className={`text-xs ${task.ai_recommended ? 'bg-violet-100 text-violet-700' : 'bg-white'}`}>
                {part}
              </Badge>
            ))}
            {task.parts_required.length > 3 && (
              <Badge variant="outline" className={`text-xs ${task.ai_recommended ? 'bg-violet-100 text-violet-700' : 'bg-white'}`}>
                +{task.parts_required.length - 3} more
              </Badge>
            )}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
        {task.cost_estimate && (
          <span className="text-sm text-slate-500">
            Est. ${task.cost_estimate.toLocaleString()}
          </span>
        )}
        <div className="flex gap-2 ml-auto">
          {task.status === 'scheduled' && (
            <Button 
              size="sm" 
              className="bg-indigo-600 hover:bg-indigo-700 text-xs"
              onClick={() => onStatusChange && onStatusChange(task.id, 'in_progress')}
            >
              Start
            </Button>
          )}
          {task.status === 'in_progress' && (
            <Button 
              size="sm" 
              className="bg-emerald-600 hover:bg-emerald-700 text-xs"
              onClick={() => onStatusChange && onStatusChange(task.id, 'completed')}
            >
              Complete
            </Button>
          )}
          <Button 
            size="sm" 
            variant="ghost" 
            className="text-slate-500 hover:text-slate-700 text-xs"
            onClick={(e) => {
              e.stopPropagation();
              // Details button - could open a modal in the future
            }}
          >
            Details <ChevronRight className="w-3 h-3 ml-1" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}