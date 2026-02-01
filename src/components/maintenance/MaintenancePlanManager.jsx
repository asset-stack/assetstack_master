import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CalendarClock, Plus, Settings, Trash2, ToggleLeft, ToggleRight, 
  Clock, Gauge, Activity, Zap, Play, Pause, ChevronRight, Edit, Copy
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

const SCHEDULE_TYPES = [
  { value: 'time_based', label: 'Time-Based', icon: Clock, description: 'Schedule at regular intervals' },
  { value: 'usage_based', label: 'Usage-Based', icon: Gauge, description: 'Based on operating hours or cycles' },
  { value: 'condition_based', label: 'Condition-Based', icon: Activity, description: 'Triggered by sensor readings or health score' },
  { value: 'hybrid', label: 'Hybrid', icon: Zap, description: 'Combination of time, usage, and condition' },
];

const FREQUENCY_UNITS = [
  { value: 'days', label: 'Days' },
  { value: 'weeks', label: 'Weeks' },
  { value: 'months', label: 'Months' },
  { value: 'years', label: 'Years' },
  { value: 'hours', label: 'Operating Hours' },
  { value: 'cycles', label: 'Cycles' },
];

export default function MaintenancePlanManager({ equipment = [], technicians = [] }) {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const queryClient = useQueryClient();

  const { data: plans = [] } = useQuery({
    queryKey: ['maintenancePlans'],
    queryFn: () => base44.entities.MaintenancePlan.list('-created_date', 100),
  });

  const { data: templates = [] } = useQuery({
    queryKey: ['maintenanceTemplates'],
    queryFn: () => base44.entities.MaintenanceTemplate.list('-created_date', 100),
  });

  const createPlanMutation = useMutation({
    mutationFn: (data) => base44.entities.MaintenancePlan.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['maintenancePlans']);
      setShowAddDialog(false);
    },
  });

  const updatePlanMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.MaintenancePlan.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['maintenancePlans']);
      setEditingPlan(null);
    },
  });

  const deletePlanMutation = useMutation({
    mutationFn: (id) => base44.entities.MaintenancePlan.delete(id),
    onSuccess: () => queryClient.invalidateQueries(['maintenancePlans']),
  });

  const togglePlan = (plan) => {
    updatePlanMutation.mutate({ id: plan.id, data: { is_active: !plan.is_active } });
  };

  const getScheduleTypeInfo = (type) => SCHEDULE_TYPES.find(t => t.value === type) || SCHEDULE_TYPES[0];

  const equipmentMap = equipment.reduce((acc, e) => { acc[e.id] = e; return acc; }, {});

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Maintenance Plans</h3>
          <p className="text-sm text-slate-500">Configure recurring preventive maintenance schedules</p>
        </div>
        <Button onClick={() => setShowAddDialog(true)} className="bg-indigo-600 hover:bg-indigo-700">
          <Plus className="w-4 h-4 mr-2" />
          Create Plan
        </Button>
      </div>

      {plans.length === 0 ? (
        <div className="text-center py-16 bg-slate-50 rounded-xl border border-dashed border-slate-300">
          <CalendarClock className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h4 className="font-medium text-slate-600">No maintenance plans configured</h4>
          <p className="text-sm text-slate-500 mt-1">Create plans to automate recurring maintenance schedules</p>
          <Button onClick={() => setShowAddDialog(true)} variant="outline" className="mt-4">
            <Plus className="w-4 h-4 mr-2" />
            Create First Plan
          </Button>
        </div>
      ) : (
        <div className="grid gap-4">
          {plans.map((plan) => {
            const typeInfo = getScheduleTypeInfo(plan.schedule_type);
            const Icon = typeInfo.icon;
            const equipmentNames = (plan.equipment_ids || [])
              .map(id => equipmentMap[id]?.name)
              .filter(Boolean)
              .slice(0, 3);
            
            return (
              <motion.div
                key={plan.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-5 rounded-xl border ${
                  plan.is_active ? 'bg-white border-slate-200' : 'bg-slate-50 border-slate-200 opacity-60'
                } shadow-sm hover:shadow-md transition-all`}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl ${plan.is_active ? 'bg-indigo-100' : 'bg-slate-200'}`}>
                    <Icon className={`w-6 h-6 ${plan.is_active ? 'text-indigo-600' : 'text-slate-500'}`} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-slate-900">{plan.name}</h4>
                      <Badge variant="outline" className="text-xs">
                        {typeInfo.label}
                      </Badge>
                      {!plan.is_active && (
                        <Badge className="bg-slate-200 text-slate-600">Paused</Badge>
                      )}
                      {plan.auto_assign && (
                        <Badge className="bg-emerald-100 text-emerald-700">Auto-Assign</Badge>
                      )}
                    </div>
                    
                    {plan.description && (
                      <p className="text-sm text-slate-600 mb-2">{plan.description}</p>
                    )}
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                      {plan.schedule_type === 'time_based' && plan.frequency_value && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          Every {plan.frequency_value} {plan.frequency_unit}
                        </span>
                      )}
                      {plan.schedule_type === 'usage_based' && plan.usage_threshold && (
                        <span className="flex items-center gap-1">
                          <Gauge className="w-4 h-4" />
                          Every {plan.usage_threshold} {plan.frequency_unit || 'hours'}
                        </span>
                      )}
                      {plan.health_score_threshold && (
                        <span className="flex items-center gap-1">
                          <Activity className="w-4 h-4" />
                          Health &lt; {plan.health_score_threshold}%
                        </span>
                      )}
                      {plan.tasks_generated_count > 0 && (
                        <span>{plan.tasks_generated_count} tasks generated</span>
                      )}
                    </div>

                    {equipmentNames.length > 0 && (
                      <div className="flex items-center gap-2 mt-3">
                        <span className="text-xs text-slate-400">Equipment:</span>
                        {equipmentNames.map((name, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {name}
                          </Badge>
                        ))}
                        {(plan.equipment_ids?.length || 0) > 3 && (
                          <span className="text-xs text-slate-400">
                            +{plan.equipment_ids.length - 3} more
                          </span>
                        )}
                      </div>
                    )}

                    {plan.equipment_types?.length > 0 && (
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-slate-400">Types:</span>
                        {plan.equipment_types.slice(0, 3).map((type, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs capitalize">
                            {type.replace(/_/g, ' ')}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => togglePlan(plan)}
                      className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                      title={plan.is_active ? 'Pause plan' : 'Activate plan'}
                    >
                      {plan.is_active ? (
                        <ToggleRight className="w-6 h-6 text-indigo-600" />
                      ) : (
                        <ToggleLeft className="w-6 h-6 text-slate-400" />
                      )}
                    </button>
                    <button
                      onClick={() => setEditingPlan(plan)}
                      className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4 text-slate-500" />
                    </button>
                    <button
                      onClick={() => deletePlanMutation.mutate(plan.id)}
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

      <PlanDialog
        open={showAddDialog || !!editingPlan}
        onOpenChange={(open) => {
          if (!open) {
            setShowAddDialog(false);
            setEditingPlan(null);
          }
        }}
        plan={editingPlan}
        equipment={equipment}
        templates={templates}
        onSave={(data) => {
          if (editingPlan) {
            updatePlanMutation.mutate({ id: editingPlan.id, data });
          } else {
            createPlanMutation.mutate(data);
          }
        }}
      />
    </div>
  );
}

function PlanDialog({ open, onOpenChange, plan, equipment, templates, onSave }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    schedule_type: 'time_based',
    frequency_value: 30,
    frequency_unit: 'days',
    usage_threshold: 1000,
    health_score_threshold: 70,
    equipment_ids: [],
    equipment_types: [],
    auto_assign: false,
    assignment_rules: {
      prefer_specialist: true,
      balance_workload: true,
      consider_location: false,
      min_skill_level: 'intermediate'
    },
    advance_notice_days: 7,
    is_active: true,
    task_template: {
      title: '',
      description: '',
      type: 'preventive',
      priority: 'medium',
      estimated_hours: 4,
      required_skills: [],
      required_parts: []
    }
  });

  React.useEffect(() => {
    if (plan) {
      setFormData({
        name: plan.name || '',
        description: plan.description || '',
        schedule_type: plan.schedule_type || 'time_based',
        frequency_value: plan.frequency_value || 30,
        frequency_unit: plan.frequency_unit || 'days',
        usage_threshold: plan.usage_threshold || 1000,
        health_score_threshold: plan.health_score_threshold || 70,
        equipment_ids: plan.equipment_ids || [],
        equipment_types: plan.equipment_types || [],
        auto_assign: plan.auto_assign || false,
        assignment_rules: plan.assignment_rules || {
          prefer_specialist: true,
          balance_workload: true,
          consider_location: false,
          min_skill_level: 'intermediate'
        },
        advance_notice_days: plan.advance_notice_days || 7,
        is_active: plan.is_active !== false,
        task_template: plan.task_template || {
          title: '',
          description: '',
          type: 'preventive',
          priority: 'medium',
          estimated_hours: 4,
          required_skills: [],
          required_parts: []
        }
      });
    } else {
      setFormData({
        name: '',
        description: '',
        schedule_type: 'time_based',
        frequency_value: 30,
        frequency_unit: 'days',
        usage_threshold: 1000,
        health_score_threshold: 70,
        equipment_ids: [],
        equipment_types: [],
        auto_assign: false,
        assignment_rules: {
          prefer_specialist: true,
          balance_workload: true,
          consider_location: false,
          min_skill_level: 'intermediate'
        },
        advance_notice_days: 7,
        is_active: true,
        task_template: {
          title: '',
          description: '',
          type: 'preventive',
          priority: 'medium',
          estimated_hours: 4,
          required_skills: [],
          required_parts: []
        }
      });
    }
  }, [plan, open]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const uniqueEquipmentTypes = [...new Set(equipment.map(e => e.type).filter(Boolean))];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarClock className="w-5 h-5 text-indigo-600" />
            {plan ? 'Edit Maintenance Plan' : 'Create Maintenance Plan'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <Label>Plan Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Monthly HVAC Inspection"
                required
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe this maintenance plan..."
                rows={2}
              />
            </div>
          </div>

          {/* Schedule Configuration */}
          <div className="border-t pt-4">
            <h4 className="font-medium text-slate-900 mb-3">Schedule Configuration</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Schedule Type</Label>
                <Select value={formData.schedule_type} onValueChange={(v) => setFormData({ ...formData, schedule_type: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SCHEDULE_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <type.icon className="w-4 h-4" />
                          {type.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {(formData.schedule_type === 'time_based' || formData.schedule_type === 'hybrid') && (
                <>
                  <div>
                    <Label>Frequency</Label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        value={formData.frequency_value}
                        onChange={(e) => setFormData({ ...formData, frequency_value: Number(e.target.value) })}
                        className="w-24"
                        min={1}
                      />
                      <Select value={formData.frequency_unit} onValueChange={(v) => setFormData({ ...formData, frequency_unit: v })}>
                        <SelectTrigger className="flex-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {FREQUENCY_UNITS.slice(0, 4).map((unit) => (
                            <SelectItem key={unit.value} value={unit.value}>{unit.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </>
              )}

              {(formData.schedule_type === 'usage_based' || formData.schedule_type === 'hybrid') && (
                <div>
                  <Label>Usage Threshold</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      value={formData.usage_threshold}
                      onChange={(e) => setFormData({ ...formData, usage_threshold: Number(e.target.value) })}
                      className="flex-1"
                      min={1}
                    />
                    <Select value={formData.frequency_unit} onValueChange={(v) => setFormData({ ...formData, frequency_unit: v })}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {FREQUENCY_UNITS.slice(4).map((unit) => (
                          <SelectItem key={unit.value} value={unit.value}>{unit.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {(formData.schedule_type === 'condition_based' || formData.schedule_type === 'hybrid') && (
                <div>
                  <Label>Health Score Threshold</Label>
                  <Input
                    type="number"
                    value={formData.health_score_threshold}
                    onChange={(e) => setFormData({ ...formData, health_score_threshold: Number(e.target.value) })}
                    min={0}
                    max={100}
                    placeholder="Trigger when health drops below..."
                  />
                  <p className="text-xs text-slate-500 mt-1">Trigger maintenance when health score falls below this value</p>
                </div>
              )}

              <div>
                <Label>Advance Notice (days)</Label>
                <Input
                  type="number"
                  value={formData.advance_notice_days}
                  onChange={(e) => setFormData({ ...formData, advance_notice_days: Number(e.target.value) })}
                  min={1}
                />
              </div>
            </div>
          </div>

          {/* Equipment Selection */}
          <div className="border-t pt-4">
            <h4 className="font-medium text-slate-900 mb-3">Equipment Selection</h4>
            
            <div className="space-y-3">
              <div>
                <Label>Equipment Types</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {uniqueEquipmentTypes.map((type) => (
                    <label key={type} className="flex items-center gap-2 cursor-pointer">
                      <Checkbox
                        checked={formData.equipment_types.includes(type)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setFormData({ ...formData, equipment_types: [...formData.equipment_types, type] });
                          } else {
                            setFormData({ ...formData, equipment_types: formData.equipment_types.filter(t => t !== type) });
                          }
                        }}
                      />
                      <span className="text-sm capitalize">{type.replace(/_/g, ' ')}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <Label>Specific Equipment</Label>
                <Select
                  value=""
                  onValueChange={(v) => {
                    if (!formData.equipment_ids.includes(v)) {
                      setFormData({ ...formData, equipment_ids: [...formData.equipment_ids, v] });
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Add specific equipment..." />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {equipment
                      .filter(e => !formData.equipment_ids.includes(e.id))
                      .map((eq) => (
                        <SelectItem key={eq.id} value={eq.id}>{eq.name}</SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                {formData.equipment_ids.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.equipment_ids.map((id) => {
                      const eq = equipment.find(e => e.id === id);
                      return eq ? (
                        <Badge key={id} variant="secondary" className="flex items-center gap-1">
                          {eq.name}
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, equipment_ids: formData.equipment_ids.filter(i => i !== id) })}
                            className="ml-1 hover:text-red-500"
                          >
                            ×
                          </button>
                        </Badge>
                      ) : null;
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Task Template */}
          <div className="border-t pt-4">
            <h4 className="font-medium text-slate-900 mb-3">Task Template</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label>Task Title</Label>
                <Input
                  value={formData.task_template.title}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    task_template: { ...formData.task_template, title: e.target.value } 
                  })}
                  placeholder="e.g., Scheduled Inspection - {equipment_name}"
                />
              </div>
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
                    <SelectItem value="preventive">Preventive</SelectItem>
                    <SelectItem value="predictive">Predictive</SelectItem>
                    <SelectItem value="inspection">Inspection</SelectItem>
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
                  value={formData.task_template.estimated_hours}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    task_template: { ...formData.task_template, estimated_hours: Number(e.target.value) } 
                  })}
                  min={0.5}
                  step={0.5}
                />
              </div>
            </div>
          </div>

          {/* Assignment Rules */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="font-medium text-slate-900">Automatic Assignment</h4>
                <p className="text-sm text-slate-500">Automatically assign tasks to the best available technician</p>
              </div>
              <Switch
                checked={formData.auto_assign}
                onCheckedChange={(v) => setFormData({ ...formData, auto_assign: v })}
              />
            </div>

            {formData.auto_assign && (
              <div className="space-y-3 p-4 bg-slate-50 rounded-lg">
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={formData.assignment_rules.prefer_specialist}
                    onCheckedChange={(v) => setFormData({ 
                      ...formData, 
                      assignment_rules: { ...formData.assignment_rules, prefer_specialist: v } 
                    })}
                  />
                  <span className="text-sm">Prefer technicians specialized in this equipment type</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={formData.assignment_rules.balance_workload}
                    onCheckedChange={(v) => setFormData({ 
                      ...formData, 
                      assignment_rules: { ...formData.assignment_rules, balance_workload: v } 
                    })}
                  />
                  <span className="text-sm">Balance workload across team members</span>
                </label>
                <div>
                  <Label className="text-sm">Minimum Skill Level</Label>
                  <Select 
                    value={formData.assignment_rules.min_skill_level} 
                    onValueChange={(v) => setFormData({ 
                      ...formData, 
                      assignment_rules: { ...formData.assignment_rules, min_skill_level: v } 
                    })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="junior">Junior</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="senior">Senior</SelectItem>
                      <SelectItem value="expert">Expert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">
              {plan ? 'Update Plan' : 'Create Plan'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}