import React from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { 
  Calendar, Clock, User, Users, Cpu, ChevronRight, 
  DollarSign, Package, FileText, AlertTriangle, CheckCircle2, ClipboardList 
} from 'lucide-react';
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from 'date-fns';

export default function WorkOrderCard({ workOrder, equipment, onViewDetails, delay = 0 }) {
  // Fetch technicians to display names
  const { data: technicians = [] } = useQuery({
    queryKey: ['technicians'],
    queryFn: () => base44.entities.Technician.list('-created_date', 100),
  });

  const assignedTechnician = technicians.find(t => t.id === workOrder.assigned_to);
  const getStatusConfig = (status) => {
    const configs = {
      draft: { color: 'bg-slate-100 text-slate-600', label: 'Draft' },
      open: { color: 'bg-blue-50 text-blue-700', label: 'Open' },
      assigned: { color: 'bg-indigo-50 text-indigo-700', label: 'Assigned' },
      in_progress: { color: 'bg-violet-50 text-violet-700', label: 'In Progress' },
      on_hold: { color: 'bg-amber-50 text-amber-700', label: 'On Hold' },
      completed: { color: 'bg-emerald-50 text-emerald-700', label: 'Completed' },
      closed: { color: 'bg-slate-100 text-slate-600', label: 'Closed' },
      cancelled: { color: 'bg-rose-50 text-rose-700', label: 'Cancelled' }
    };
    return configs[status] || configs.draft;
  };

  const getPriorityConfig = (priority) => {
    const configs = {
      urgent: { color: 'bg-rose-50 text-rose-700 border-rose-200', dot: 'bg-rose-500' },
      high: { color: 'bg-orange-50 text-orange-700 border-orange-200', dot: 'bg-orange-500' },
      medium: { color: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
      low: { color: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' }
    };
    return configs[priority] || configs.medium;
  };

  const statusConfig = getStatusConfig(workOrder.status);
  const priorityConfig = getPriorityConfig(workOrder.priority);

  const totalLaborHours = workOrder.labor_entries?.reduce((sum, e) => sum + (e.hours || 0), 0) || 0;
  const totalPartsCount = workOrder.parts_used?.reduce((sum, p) => sum + (p.quantity || 0), 0) || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className="bg-white rounded-xl border border-slate-200 p-5 hover:border-indigo-300 hover:shadow-md transition-all group cursor-pointer"
      onClick={() => onViewDetails && onViewDetails(workOrder)}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-mono text-slate-400">{workOrder.work_order_number || 'WO-NEW'}</span>
          <Badge variant="outline" className={priorityConfig.color}>
            {workOrder.priority}
          </Badge>
          <Badge className={statusConfig.color}>
            {statusConfig.label}
          </Badge>
          {workOrder.follow_up_required && (
            <Badge className="bg-amber-50 text-amber-700 border-amber-200">
              <AlertTriangle className="w-3 h-3 mr-1" />
              Follow-up
            </Badge>
          )}
        </div>
      </div>

      <h4 className="text-base font-semibold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">
        {workOrder.title}
      </h4>

      {workOrder.description && (
        <p className="text-sm text-slate-500 mb-4 line-clamp-2">{workOrder.description}</p>
      )}

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Cpu className="w-4 h-4" />
          <span className="truncate">{equipment?.name || 'Unknown'}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <User className="w-4 h-4" />
          <span className="truncate">{assignedTechnician?.name || 'Unassigned'}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Calendar className="w-4 h-4" />
          <span>
            {workOrder.scheduled_start 
              ? format(new Date(workOrder.scheduled_start), 'MMM d, yyyy') 
              : 'Not scheduled'}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Clock className="w-4 h-4" />
          <span>{totalLaborHours || workOrder.estimated_hours || 0}h logged</span>
        </div>
      </div>

      {/* Checklist Progress */}
      {workOrder.checklist?.length > 0 && (
        <div className="mb-4 p-2.5 bg-slate-50 rounded-lg">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-slate-500 flex items-center gap-1">
              <ClipboardList className="w-3 h-3" />
              Checklist
            </span>
            <span className="text-xs font-medium text-slate-700">
              {workOrder.checklist_completion_percent || 0}%
            </span>
          </div>
          <Progress value={workOrder.checklist_completion_percent || 0} className="h-1.5" />
          {workOrder.checklist_completed && (
            <Badge className="mt-1.5 text-xs bg-emerald-50 text-emerald-600 border-emerald-200">
              <CheckCircle2 className="w-3 h-3 mr-1" /> Complete
            </Badge>
          )}
        </div>
      )}

      {/* Cost & Parts Summary */}
      <div className="flex items-center gap-4 mb-4 p-3 bg-slate-50 rounded-lg">
        <div className="flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-emerald-600" />
          <span className="text-sm font-medium text-slate-700">
            ${(workOrder.actual_total_cost || workOrder.estimated_cost || 0).toLocaleString()}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Package className="w-4 h-4 text-indigo-600" />
          <span className="text-sm text-slate-600">{totalPartsCount} parts</span>
        </div>
        {workOrder.assigned_team?.length > 0 && (
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-violet-600" />
            <span className="text-sm text-slate-600">{workOrder.assigned_team.length} team</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
        <div className="flex items-center gap-2">
          {workOrder.status === 'completed' && (
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          )}
          {workOrder.history?.length > 0 && (
            <span className="text-xs text-slate-400">{workOrder.history.length} updates</span>
          )}
        </div>
        <Button 
          size="sm" 
          variant="ghost" 
          className="text-slate-500 hover:text-slate-700 text-xs"
          onClick={(e) => { e.stopPropagation(); onViewDetails && onViewDetails(workOrder); }}
        >
          View Details <ChevronRight className="w-3 h-3 ml-1" />
        </Button>
      </div>
    </motion.div>
  );
}