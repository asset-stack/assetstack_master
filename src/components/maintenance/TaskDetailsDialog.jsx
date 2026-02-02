import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Calendar, Clock, User, Wrench, Cpu, Sparkles, AlertTriangle, 
  DollarSign, Package, Pencil, Trash2, Loader2, X
} from 'lucide-react';
import { format } from 'date-fns';

const priorityColors = {
  urgent: 'bg-rose-100 text-rose-700 border-rose-200',
  high: 'bg-orange-100 text-orange-700 border-orange-200',
  medium: 'bg-amber-100 text-amber-700 border-amber-200',
  low: 'bg-emerald-100 text-emerald-700 border-emerald-200'
};

const statusColors = {
  scheduled: 'bg-indigo-100 text-indigo-700',
  in_progress: 'bg-violet-100 text-violet-700',
  completed: 'bg-emerald-100 text-emerald-700',
  overdue: 'bg-rose-100 text-rose-700',
  cancelled: 'bg-slate-100 text-slate-600'
};

const typeIcons = {
  preventive: '🔧',
  predictive: '🤖',
  corrective: '⚠️',
  emergency: '🚨',
  inspection: '🔍'
};

export default function TaskDetailsDialog({ 
  open, 
  onClose, 
  task, 
  equipment, 
  technicians = [],
  onUpdate, 
  onDelete,
  onStatusChange 
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  React.useEffect(() => {
    if (task) {
      setEditData({
        title: task.title || '',
        description: task.description || '',
        priority: task.priority || 'medium',
        scheduled_date: task.scheduled_date || '',
        estimated_duration_hours: task.estimated_duration_hours || 2,
        assigned_to: task.assigned_to || '',
        cost_estimate: task.cost_estimate || 0,
        notes: task.notes || ''
      });
    }
  }, [task]);

  if (!task) return null;

  const handleSave = async () => {
    setIsLoading(true);
    await onUpdate?.(task.id, editData);
    setIsLoading(false);
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      setIsLoading(true);
      await onDelete?.(task.id);
      setIsLoading(false);
      onClose();
    }
  };

  const handleStatusChange = async (newStatus) => {
    setIsLoading(true);
    await onStatusChange?.(task.id, newStatus);
    setIsLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-white max-h-[90vh] overflow-y-auto" aria-describedby="task-details-description">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <span className="text-xl">{typeIcons[task.type] || '🔧'}</span>
              {isEditing ? 'Edit Task' : 'Task Details'}
            </DialogTitle>
            {!isEditing && (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700" onClick={handleDelete}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
          <p id="task-details-description" className="text-sm text-slate-500">View and manage maintenance task details.</p>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Status & Priority Badges */}
          <div className="flex items-center gap-2 flex-wrap">
            <Badge className={statusColors[task.status]}>{task.status?.replace('_', ' ')}</Badge>
            <Badge variant="outline" className={priorityColors[task.priority]}>{task.priority}</Badge>
            <Badge variant="outline" className="capitalize">{task.type}</Badge>
            {task.ai_recommended && (
              <Badge className="bg-violet-100 text-violet-700 border-violet-200 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                AI Recommended ({task.ai_confidence}%)
              </Badge>
            )}
          </div>

          {/* Main Content */}
          {isEditing ? (
            <div className="space-y-4">
              <div>
                <Label>Title</Label>
                <Input 
                  value={editData.title} 
                  onChange={(e) => setEditData({...editData, title: e.target.value})}
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea 
                  value={editData.description} 
                  onChange={(e) => setEditData({...editData, description: e.target.value})}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Priority</Label>
                  <Select value={editData.priority} onValueChange={(v) => setEditData({...editData, priority: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Scheduled Date</Label>
                  <Input 
                    type="date" 
                    value={editData.scheduled_date} 
                    onChange={(e) => setEditData({...editData, scheduled_date: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Estimated Hours</Label>
                  <Input 
                    type="number" 
                    value={editData.estimated_duration_hours} 
                    onChange={(e) => setEditData({...editData, estimated_duration_hours: Number(e.target.value)})}
                  />
                </div>
                <div>
                  <Label>Cost Estimate ($)</Label>
                  <Input 
                    type="number" 
                    value={editData.cost_estimate} 
                    onChange={(e) => setEditData({...editData, cost_estimate: Number(e.target.value)})}
                  />
                </div>
              </div>
              <div>
                <Label>Assigned To</Label>
                <Select value={editData.assigned_to} onValueChange={(v) => setEditData({...editData, assigned_to: v})}>
                  <SelectTrigger><SelectValue placeholder="Select technician" /></SelectTrigger>
                  <SelectContent className="bg-white">
                    {technicians.map((tech) => (
                      <SelectItem key={tech.id} value={tech.name}>{tech.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Notes</Label>
                <Textarea 
                  value={editData.notes} 
                  onChange={(e) => setEditData({...editData, notes: e.target.value})}
                  rows={2}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">{task.title}</h3>
                {task.description && (
                  <p className="text-sm text-slate-600 mt-1">{task.description}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 bg-slate-50 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500">Equipment</p>
                    <p className="text-sm font-medium">{equipment?.name || 'Unknown'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500">Scheduled Date</p>
                    <p className="text-sm font-medium">
                      {task.scheduled_date ? format(new Date(task.scheduled_date), 'MMM d, yyyy') : 'Not scheduled'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500">Estimated Duration</p>
                    <p className="text-sm font-medium">{task.estimated_duration_hours || '?'} hours</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500">Assigned To</p>
                    <p className="text-sm font-medium">{task.assigned_to || 'Unassigned'}</p>
                  </div>
                </div>
                {task.cost_estimate > 0 && (
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-slate-400" />
                    <div>
                      <p className="text-xs text-slate-500">Cost Estimate</p>
                      <p className="text-sm font-medium">${task.cost_estimate.toLocaleString()}</p>
                    </div>
                  </div>
                )}
              </div>

              {task.parts_required && task.parts_required.length > 0 && (
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-xs text-slate-500 mb-2 flex items-center gap-1">
                    <Package className="w-3 h-3" />
                    Parts Required
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {task.parts_required.map((part, idx) => (
                      <Badge key={idx} variant="outline">{part}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {task.notes && (
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-xs text-slate-500 mb-1">Notes</p>
                  <p className="text-sm text-slate-700">{task.notes}</p>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={() => setIsEditing(false)} disabled={isLoading}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isLoading} className="bg-indigo-600 hover:bg-indigo-700">
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Save Changes
              </Button>
            </>
          ) : (
            <>
              {task.status === 'scheduled' && (
                <Button 
                  onClick={() => handleStatusChange('in_progress')} 
                  disabled={isLoading}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Start Task
                </Button>
              )}
              {task.status === 'in_progress' && (
                <Button 
                  onClick={() => handleStatusChange('completed')} 
                  disabled={isLoading}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Complete Task
                </Button>
              )}
              <Button variant="outline" onClick={onClose}>Close</Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}