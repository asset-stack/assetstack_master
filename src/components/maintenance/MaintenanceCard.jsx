import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, User, Wrench, Cpu, ChevronRight, Sparkles } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from 'date-fns';

export default function MaintenanceCard({ task, equipment, onStatusChange, delay = 0 }) {
  const getPriorityConfig = (priority) => {
    const configs = {
      urgent: { color: 'bg-rose-500/20 text-rose-400 border-rose-500/30', dot: 'bg-rose-500' },
      high: { color: 'bg-orange-500/20 text-orange-400 border-orange-500/30', dot: 'bg-orange-500' },
      medium: { color: 'bg-amber-500/20 text-amber-400 border-amber-500/30', dot: 'bg-amber-500' },
      low: { color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', dot: 'bg-emerald-500' }
    };
    return configs[priority] || configs.medium;
  };

  const getStatusConfig = (status) => {
    const configs = {
      scheduled: { color: 'bg-blue-500/20 text-blue-400', label: 'Scheduled' },
      in_progress: { color: 'bg-purple-500/20 text-purple-400', label: 'In Progress' },
      completed: { color: 'bg-emerald-500/20 text-emerald-400', label: 'Completed' },
      overdue: { color: 'bg-rose-500/20 text-rose-400', label: 'Overdue' },
      cancelled: { color: 'bg-slate-500/20 text-slate-400', label: 'Cancelled' }
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
      transition={{ duration: 0.4, delay }}
      className="bg-slate-900/50 rounded-xl border border-slate-700/50 p-5 backdrop-blur-xl hover:border-blue-500/30 transition-all group"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">{getTypeIcon(task.type)}</span>
          <Badge variant="outline" className={priorityConfig.color}>
            {task.priority}
          </Badge>
          <Badge className={statusConfig.color}>
            {statusConfig.label}
          </Badge>
          {task.ai_recommended && (
            <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              AI
            </Badge>
          )}
        </div>
        {task.ai_confidence && (
          <span className="text-xs text-slate-500">{task.ai_confidence}% confidence</span>
        )}
      </div>

      <h4 className="text-lg font-semibold text-white mb-2 group-hover:text-blue-400 transition-colors">
        {task.title}
      </h4>
      
      {task.description && (
        <p className="text-sm text-slate-400 mb-4 line-clamp-2">{task.description}</p>
      )}

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <Cpu className="w-4 h-4" />
          <span className="truncate">{equipment?.name || 'Unknown Equipment'}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <Calendar className="w-4 h-4" />
          <span>
            {task.scheduled_date ? format(new Date(task.scheduled_date), 'MMM d, yyyy') : 'Not scheduled'}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <Clock className="w-4 h-4" />
          <span>{task.estimated_duration_hours || '?'}h estimated</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <User className="w-4 h-4" />
          <span className="truncate">{task.assigned_to || 'Unassigned'}</span>
        </div>
      </div>

      {task.parts_required && task.parts_required.length > 0 && (
        <div className="mb-4">
          <p className="text-xs text-slate-500 mb-1">Parts Required:</p>
          <div className="flex flex-wrap gap-1">
            {task.parts_required.slice(0, 3).map((part, idx) => (
              <Badge key={idx} variant="outline" className="text-xs bg-slate-800/50">
                {part}
              </Badge>
            ))}
            {task.parts_required.length > 3 && (
              <Badge variant="outline" className="text-xs bg-slate-800/50">
                +{task.parts_required.length - 3} more
              </Badge>
            )}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-slate-700/50">
        {task.cost_estimate && (
          <span className="text-sm text-slate-400">
            Est. ${task.cost_estimate.toLocaleString()}
          </span>
        )}
        <div className="flex gap-2 ml-auto">
          {task.status === 'scheduled' && (
            <Button 
              size="sm" 
              className="bg-blue-600 hover:bg-blue-700 text-xs"
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
            className="text-slate-400 hover:text-white text-xs"
          >
            Details <ChevronRight className="w-3 h-3 ml-1" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}