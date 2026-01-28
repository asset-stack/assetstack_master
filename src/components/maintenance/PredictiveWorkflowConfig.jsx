import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, Plus, Settings, Trash2, ToggleLeft, ToggleRight, 
  Clock, AlertTriangle, Activity, Target, Bell, Save, X
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

const TRIGGER_TYPES = [
  { value: 'rul_threshold', label: 'Remaining Useful Life', icon: Clock, unit: 'days', description: 'Trigger when RUL drops below threshold' },
  { value: 'failure_probability', label: 'Failure Probability', icon: AlertTriangle, unit: '%', description: 'Trigger when failure probability exceeds threshold' },
  { value: 'health_score', label: 'Health Score', icon: Activity, unit: '%', description: 'Trigger when health score drops below threshold' },
  { value: 'alert_severity', label: 'Alert Severity', icon: Bell, unit: '', description: 'Trigger on specific alert severity levels' },
];

const TASK_TYPES = [
  { value: 'predictive', label: 'Predictive' },
  { value: 'preventive', label: 'Preventive' },
  { value: 'corrective', label: 'Corrective' },
  { value: 'emergency', label: 'Emergency' },
  { value: 'inspection', label: 'Inspection' },
];

const PRIORITIES = [
  { value: 'low', label: 'Low', color: 'bg-slate-100 text-slate-700' },
  { value: 'medium', label: 'Medium', color: 'bg-blue-100 text-blue-700' },
  { value: 'high', label: 'High', color: 'bg-amber-100 text-amber-700' },
  { value: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-700' },
];

export default function PredictiveWorkflowConfig({ triggers, onRefresh }) {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingTrigger, setEditingTrigger] = useState(null);
  const queryClient = useQueryClient();

  const createTriggerMutation = useMutation({
    mutationFn: (data) => base44.entities.MaintenanceTrigger.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['triggers']);
      setShowAddDialog(false);
      onRefresh?.();
    },
  });

  const updateTriggerMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.MaintenanceTrigger.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['triggers']);
      setEditingTrigger(null);
      onRefresh?.();
    },
  });

  const deleteTriggerMutation = useMutation({
    mutationFn: (id) => base44.entities.MaintenanceTrigger.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['triggers']);
      onRefresh?.();
    },
  });

  const toggleTrigger = (trigger) => {
    updateTriggerMutation.mutate({ 
      id: trigger.id, 
      data: { is_active: !trigger.is_active } 
    });
  };

  const getTriggerTypeInfo = (type) => TRIGGER_TYPES.find(t => t.value === type) || TRIGGER_TYPES[0];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-slate-900">Automation Triggers</h3>
          <p className="text-sm text-slate-500">Configure when to automatically suggest maintenance tasks</p>
        </div>
        <Button onClick={() => setShowAddDialog(true)} className="bg-indigo-600 hover:bg-indigo-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Trigger
        </Button>
      </div>

      {triggers.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-300">
          <Zap className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h4 className="font-medium text-slate-600">No triggers configured</h4>
          <p className="text-sm text-slate-500 mt-1">Add triggers to automate task suggestions</p>
          <Button onClick={() => setShowAddDialog(true)} variant="outline" className="mt-4">
            <Plus className="w-4 h-4 mr-2" />
            Create First Trigger
          </Button>
        </div>
      ) : (
        <div className="grid gap-3">
          {triggers.map((trigger) => {
            const typeInfo = getTriggerTypeInfo(trigger.trigger_type);
            const Icon = typeInfo.icon;
            
            return (
              <motion.div
                key={trigger.id}
                layout
                className={`p-4 rounded-xl border ${
                  trigger.is_active ? 'bg-white border-slate-200' : 'bg-slate-50 border-slate-200 opacity-60'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-2 rounded-lg ${trigger.is_active ? 'bg-indigo-100' : 'bg-slate-200'}`}>
                    <Icon className={`w-5 h-5 ${trigger.is_active ? 'text-indigo-600' : 'text-slate-500'}`} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-slate-900">{trigger.name}</h4>
                      <Badge variant="outline" className="text-xs">
                        {typeInfo.label}
                      </Badge>
                      {!trigger.is_active && (
                        <Badge className="bg-slate-200 text-slate-600">Paused</Badge>
                      )}
                    </div>
                    
                    <p className="text-sm text-slate-600">
                      {trigger.trigger_type === 'alert_severity' 
                        ? `Trigger on ${trigger.alert_severity_filter} alerts`
                        : `${trigger.condition_operator === 'less_than' ? '<' : '>'} ${trigger.threshold_value}${typeInfo.unit}`
                      }
                      {trigger.cooldown_days && ` • ${trigger.cooldown_days}d cooldown`}
                    </p>

                    {trigger.task_template && (
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className={PRIORITIES.find(p => p.value === trigger.task_template.priority)?.color}>
                          {trigger.task_template.priority}
                        </Badge>
                        <span className="text-xs text-slate-500">
                          Creates {trigger.task_template.type} task
                        </span>
                        {trigger.tasks_generated_count > 0 && (
                          <span className="text-xs text-slate-400">
                            • {trigger.tasks_generated_count} tasks generated
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleTrigger(trigger)}
                      className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      {trigger.is_active ? (
                        <ToggleRight className="w-6 h-6 text-indigo-600" />
                      ) : (
                        <ToggleLeft className="w-6 h-6 text-slate-400" />
                      )}
                    </button>
                    <button
                      onClick={() => setEditingTrigger(trigger)}
                      className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      <Settings className="w-4 h-4 text-slate-500" />
                    </button>
                    <button
                      onClick={() => deleteTriggerMutation.mutate(trigger.id)}
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <TriggerDialog
        open={showAddDialog || !!editingTrigger}
        onOpenChange={(open) => {
          if (!open) {
            setShowAddDialog(false);
            setEditingTrigger(null);
          }
        }}
        trigger={editingTrigger}
        onSave={(data) => {
          if (editingTrigger) {
            updateTriggerMutation.mutate({ id: editingTrigger.id, data });
          } else {
            createTriggerMutation.mutate(data);
          }
        }}
      />
    </div>
  );
}

function TriggerDialog({ open, onOpenChange, trigger, onSave }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    trigger_type: 'rul_threshold',
    condition_operator: 'less_than',
    threshold_value: 30,
    alert_severity_filter: 'critical',
    cooldown_days: 7,
    is_active: true,
    task_template: {
      title_prefix: 'AI Suggested:',
      type: 'predictive',
      priority: 'medium',
      estimated_hours: 4,
      auto_assign: false,
      notify_on_creation: true,
    }
  });

  React.useEffect(() => {
    if (trigger) {
      setFormData({
        name: trigger.name || '',
        description: trigger.description || '',
        trigger_type: trigger.trigger_type || 'rul_threshold',
        condition_operator: trigger.condition_operator || 'less_than',
        threshold_value: trigger.threshold_value || 30,
        alert_severity_filter: trigger.alert_severity_filter || 'critical',
        cooldown_days: trigger.cooldown_days || 7,
        is_active: trigger.is_active !== false,
        task_template: trigger.task_template || {
          title_prefix: 'AI Suggested:',
          type: 'predictive',
          priority: 'medium',
          estimated_hours: 4,
          auto_assign: false,
          notify_on_creation: true,
        }
      });
    } else {
      setFormData({
        name: '',
        description: '',
        trigger_type: 'rul_threshold',
        condition_operator: 'less_than',
        threshold_value: 30,
        alert_severity_filter: 'critical',
        cooldown_days: 7,
        is_active: true,
        task_template: {
          title_prefix: 'AI Suggested:',
          type: 'predictive',
          priority: 'medium',
          estimated_hours: 4,
          auto_assign: false,
          notify_on_creation: true,
        }
      });
    }
  }, [trigger, open]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const typeInfo = TRIGGER_TYPES.find(t => t.value === formData.trigger_type);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg bg-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-indigo-600" />
            {trigger ? 'Edit Trigger' : 'Create Automation Trigger'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Trigger Name *</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Low RUL Alert"
              required
            />
          </div>

          <div>
            <Label>Trigger Type</Label>
            <Select value={formData.trigger_type} onValueChange={(v) => setFormData({ ...formData, trigger_type: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TRIGGER_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex items-center gap-2">
                      <type.icon className="w-4 h-4" />
                      {type.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-slate-500 mt-1">{typeInfo?.description}</p>
          </div>

          {formData.trigger_type === 'alert_severity' ? (
            <div>
              <Label>Alert Severity</Label>
              <Select value={formData.alert_severity_filter} onValueChange={(v) => setFormData({ ...formData, alert_severity_filter: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="emergency">Emergency</SelectItem>
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Condition</Label>
                <Select value={formData.condition_operator} onValueChange={(v) => setFormData({ ...formData, condition_operator: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="less_than">Less than</SelectItem>
                    <SelectItem value="greater_than">Greater than</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Threshold ({typeInfo?.unit})</Label>
                <Input
                  type="number"
                  value={formData.threshold_value}
                  onChange={(e) => setFormData({ ...formData, threshold_value: Number(e.target.value) })}
                />
              </div>
            </div>
          )}

          <div>
            <Label>Cooldown Period (days)</Label>
            <Input
              type="number"
              value={formData.cooldown_days}
              onChange={(e) => setFormData({ ...formData, cooldown_days: Number(e.target.value) })}
              min={1}
            />
            <p className="text-xs text-slate-500 mt-1">Wait this many days before triggering again for same equipment</p>
          </div>

          <div className="border-t pt-4">
            <h4 className="font-medium text-slate-900 mb-3">Task Template</h4>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Task Type</Label>
                <Select 
                  value={formData.task_template.type} 
                  onValueChange={(v) => setFormData({ 
                    ...formData, 
                    task_template: { ...formData.task_template, type: v } 
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TASK_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Priority</Label>
                <Select 
                  value={formData.task_template.priority} 
                  onValueChange={(v) => setFormData({ 
                    ...formData, 
                    task_template: { ...formData.task_template, priority: v } 
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORITIES.map((p) => (
                      <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="mt-3">
              <Label>Estimated Hours</Label>
              <Input
                type="number"
                value={formData.task_template.estimated_hours}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  task_template: { ...formData.task_template, estimated_hours: Number(e.target.value) } 
                })}
                min={0.5}
                step={0.5}
              />
            </div>

            <div className="flex items-center justify-between mt-4">
              <div>
                <Label>Notify on creation</Label>
                <p className="text-xs text-slate-500">Send notification when task is suggested</p>
              </div>
              <Switch
                checked={formData.task_template.notify_on_creation}
                onCheckedChange={(v) => setFormData({ 
                  ...formData, 
                  task_template: { ...formData.task_template, notify_on_creation: v } 
                })}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">
              <Save className="w-4 h-4 mr-2" />
              {trigger ? 'Update Trigger' : 'Create Trigger'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}