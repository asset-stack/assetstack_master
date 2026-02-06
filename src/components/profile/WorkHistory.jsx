import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Wrench, CheckCircle2, Clock, AlertTriangle, Calendar, 
  ChevronDown, ChevronUp, Filter
} from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from 'date-fns';

const STATUS_STYLES = {
  completed: { bg: 'bg-emerald-50', text: 'text-emerald-700', icon: CheckCircle2 },
  in_progress: { bg: 'bg-blue-50', text: 'text-blue-700', icon: Clock },
  scheduled: { bg: 'bg-slate-50', text: 'text-slate-700', icon: Calendar },
  overdue: { bg: 'bg-red-50', text: 'text-red-700', icon: AlertTriangle },
  cancelled: { bg: 'bg-slate-50', text: 'text-slate-400', icon: null },
};

const TYPE_COLORS = {
  preventive: 'bg-blue-100 text-blue-700',
  predictive: 'bg-violet-100 text-violet-700',
  corrective: 'bg-amber-100 text-amber-700',
  emergency: 'bg-red-100 text-red-700',
  inspection: 'bg-teal-100 text-teal-700',
};

export default function WorkHistory({ tasks, workOrders, equipmentMap }) {
  const [filter, setFilter] = useState('all');
  const [showAll, setShowAll] = useState(false);

  const filteredTasks = tasks.filter(t => {
    if (filter === 'all') return true;
    return t.status === filter;
  }).sort((a, b) => new Date(b.scheduled_date || b.created_date) - new Date(a.scheduled_date || a.created_date));

  const displayTasks = showAll ? filteredTasks : filteredTasks.slice(0, 10);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-50 rounded-lg">
            <Wrench className="w-4 h-4 text-blue-600" />
          </div>
          <h3 className="text-base font-semibold text-slate-900">Work History</h3>
          <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">{filteredTasks.length} tasks</span>
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-36 h-8 text-xs">
            <Filter className="w-3.5 h-3.5 mr-1" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        {displayTasks.map((task, i) => {
          const status = STATUS_STYLES[task.status] || STATUS_STYLES.scheduled;
          const StatusIcon = status.icon;
          const equipName = equipmentMap?.[task.equipment_id] || 'Unknown Equipment';
          return (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 hover:border-slate-200 hover:bg-slate-50/50 transition-all"
            >
              <div className={`w-9 h-9 rounded-lg ${status.bg} flex items-center justify-center shrink-0`}>
                {StatusIcon && <StatusIcon className={`w-4 h-4 ${status.text}`} />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">{task.title}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-slate-500 truncate">{equipName}</span>
                  {task.scheduled_date && (
                    <span className="text-xs text-slate-400">
                      {format(new Date(task.scheduled_date), 'MMM d, yyyy')}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Badge className={TYPE_COLORS[task.type] || 'bg-slate-100 text-slate-600'} variant="secondary">
                  {task.type}
                </Badge>
                {task.actual_duration_hours && (
                  <span className="text-xs text-slate-500">{task.actual_duration_hours}h</span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {filteredTasks.length > 10 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="w-full mt-3 py-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center justify-center gap-1"
        >
          {showAll ? <><ChevronUp className="w-4 h-4" /> Show Less</> : <><ChevronDown className="w-4 h-4" /> Show All ({filteredTasks.length})</>}
        </button>
      )}

      {filteredTasks.length === 0 && (
        <div className="text-center py-8 text-slate-400">
          <Wrench className="w-8 h-8 mx-auto mb-2 opacity-40" />
          <p className="text-sm">No tasks found</p>
        </div>
      )}
    </motion.div>
  );
}