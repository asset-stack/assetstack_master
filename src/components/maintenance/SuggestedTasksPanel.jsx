import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { secureEntity } from '@/lib/secureEntities';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, Check, X, Clock, AlertTriangle, User, 
  Wrench, ChevronRight, Calendar, Package, Brain, Loader2
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { format, addDays } from 'date-fns';

const priorityColors = {
  low: 'bg-slate-100 text-slate-700',
  medium: 'bg-blue-100 text-blue-700',
  high: 'bg-amber-100 text-amber-700',
  urgent: 'bg-red-100 text-red-700',
};

export default function SuggestedTasksPanel({ suggestions, technicians, onRefresh }) {
  const [selectedTask, setSelectedTask] = useState(null);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const queryClient = useQueryClient();

  const pendingSuggestions = suggestions.filter(s => s.status === 'pending');

  const updateSuggestionMutation = useMutation({
    mutationFn: ({ id, data }) => secureEntity('SuggestedTask').update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['suggestedTasks']);
      onRefresh?.();
    },
  });

  const createTaskMutation = useMutation({
    mutationFn: (data) => secureEntity('MaintenanceTask').create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['maintenanceTasks']);
    },
  });

  const handleReject = async (suggestion) => {
    await updateSuggestionMutation.mutateAsync({
      id: suggestion.id,
      data: { 
        status: 'rejected',
        reviewed_at: new Date().toISOString()
      }
    });
  };

  const handleApproveClick = (suggestion) => {
    setSelectedTask(suggestion);
    setShowApproveDialog(true);
  };

  const handleApprove = async (approvalData) => {
    // Find technician details
    const assignedTechnician = technicians?.find(t => t.id === approvalData.assigned_to);
    
    // Create the actual maintenance task
    const newTask = await createTaskMutation.mutateAsync({
      equipment_id: selectedTask.equipment_id,
      title: selectedTask.title,
      description: selectedTask.description,
      type: selectedTask.type,
      priority: approvalData.priority,
      status: 'scheduled',
      scheduled_date: approvalData.scheduled_date,
      estimated_duration_hours: approvalData.estimated_hours,
      assigned_to: assignedTechnician?.name || approvalData.assigned_to,
      ai_recommended: true,
      ai_confidence: selectedTask.ai_confidence,
      parts_required: selectedTask.suggested_parts,
    });

    // Update the suggestion as converted
    await updateSuggestionMutation.mutateAsync({
      id: selectedTask.id,
      data: {
        status: 'converted',
        converted_task_id: newTask.id,
        reviewed_at: new Date().toISOString()
      }
    });

    // Send email notification to assigned technician
    if (assignedTechnician?.email) {
      try {
        await base44.functions.invoke('sendNotificationEmail', {
          type: 'task_assigned',
          data: {
            title: selectedTask.title,
            type: selectedTask.type,
            priority: approvalData.priority,
            equipment_name: selectedTask.equipment_name,
            scheduled_date: approvalData.scheduled_date,
            estimated_duration_hours: approvalData.estimated_hours,
            description: selectedTask.description,
            assigned_to: assignedTechnician.name,
            recipient_email: assignedTechnician.email
          }
        });
      } catch (err) {
        console.error('Failed to send notification email:', err);
      }
    }

    setShowApproveDialog(false);
    setSelectedTask(null);
  };

  if (pendingSuggestions.length === 0) {
    return (
      <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-300">
        <Sparkles className="w-10 h-10 text-slate-300 mx-auto mb-3" />
        <h4 className="font-medium text-slate-600">No pending suggestions</h4>
        <p className="text-sm text-slate-500 mt-1">AI-generated tasks will appear here</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-900 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-500" />
          AI Suggested Tasks
          <Badge className="bg-indigo-100 text-indigo-700">{pendingSuggestions.length}</Badge>
        </h3>
      </div>

      <AnimatePresence>
        {pendingSuggestions.map((suggestion, idx) => (
          <motion.div
            key={suggestion.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start gap-4">
              <div className="p-2 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg">
                <Brain className="w-5 h-5 text-indigo-600" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-slate-900 truncate">{suggestion.title}</h4>
                  <Badge className={priorityColors[suggestion.priority]}>{suggestion.priority}</Badge>
                </div>
                
                <p className="text-sm text-slate-600 mb-2">{suggestion.equipment_name}</p>
                
                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    {suggestion.trigger_reason}
                  </span>
                  {suggestion.ai_confidence && (
                    <span className="flex items-center gap-1">
                      <Brain className="w-3 h-3" />
                      {suggestion.ai_confidence}% confidence
                    </span>
                  )}
                  {suggestion.estimated_hours && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      ~{suggestion.estimated_hours}h
                    </span>
                  )}
                </div>

                {suggestion.suggested_technician && (
                  <div className="flex items-center gap-1 mt-2 text-xs text-slate-500">
                    <User className="w-3 h-3" />
                    Suggested: {suggestion.suggested_technician}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleReject(suggestion)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <X className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleApproveClick(suggestion)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Check className="w-4 h-4 mr-1" />
                  Approve
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      <ApproveTaskDialog
        open={showApproveDialog}
        onOpenChange={setShowApproveDialog}
        suggestion={selectedTask}
        technicians={technicians}
        onApprove={handleApprove}
      />
    </div>
  );
}

function ApproveTaskDialog({ open, onOpenChange, suggestion, technicians, onApprove }) {
  const [formData, setFormData] = useState({
    priority: 'medium',
    scheduled_date: format(addDays(new Date(), 7), 'yyyy-MM-dd'),
    estimated_hours: 4,
    assigned_to: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (suggestion) {
      // Find technician by name if suggested_technician is a name
      const suggestedTech = technicians?.find(t => 
        t.name === suggestion.suggested_technician || t.id === suggestion.suggested_technician
      );
      
      setFormData({
        priority: suggestion.priority || 'medium',
        scheduled_date: suggestion.recommended_date || format(addDays(new Date(), 7), 'yyyy-MM-dd'),
        estimated_hours: suggestion.estimated_hours || 4,
        assigned_to: suggestedTech?.id || '',
      });
    }
  }, [suggestion, technicians]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    await onApprove(formData);
    setIsSubmitting(false);
  };

  if (!suggestion) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-white" aria-describedby="approve-task-description">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Check className="w-5 h-5 text-green-600" />
            Approve & Schedule Task
          </DialogTitle>
          <p id="approve-task-description" className="text-sm text-slate-500 mt-1">Review and approve this AI-suggested maintenance task.</p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="p-3 bg-slate-50 rounded-lg">
            <h4 className="font-medium text-slate-900">{suggestion.title}</h4>
            <p className="text-sm text-slate-600 mt-1">{suggestion.equipment_name}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Priority</Label>
              <Select value={formData.priority} onValueChange={(v) => setFormData({ ...formData, priority: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Estimated Hours</Label>
              <Input
                type="number"
                value={formData.estimated_hours}
                onChange={(e) => setFormData({ ...formData, estimated_hours: Number(e.target.value) })}
                min={0.5}
                step={0.5}
              />
            </div>
          </div>

          <div>
            <Label>Scheduled Date</Label>
            <Input
              type="date"
              value={formData.scheduled_date}
              onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
            />
          </div>

          <div>
            <Label>Assign To</Label>
            <Select value={formData.assigned_to} onValueChange={(v) => setFormData({ ...formData, assigned_to: v })}>
              <SelectTrigger>
                <User className="w-4 h-4 mr-2 text-slate-400" />
                <SelectValue placeholder="Select technician" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {technicians?.map((tech) => (
                  <SelectItem key={tech.id} value={tech.id}>
                    <div className="flex items-center gap-2">
                      <span>{tech.name}</span>
                      <span className="text-xs text-slate-500">({tech.availability_status})</span>
                      {tech.email && <span className="text-xs text-indigo-500">• will be notified</span>}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {formData.assigned_to && technicians?.find(t => t.id === formData.assigned_to)?.email && (
              <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                ✓ Email notification will be sent to {technicians.find(t => t.id === formData.assigned_to).email}
              </p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-green-600 hover:bg-green-700" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Check className="w-4 h-4 mr-2" />}
              Create Task
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}