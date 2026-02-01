import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { 
  FileText, Plus, Copy, Edit, Trash2, Search, Filter, 
  Wrench, Droplets, Settings, RefreshCw, Sparkles, ShieldCheck, Loader2
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

const CATEGORIES = [
  { value: 'inspection', label: 'Inspection', icon: Search },
  { value: 'lubrication', label: 'Lubrication', icon: Droplets },
  { value: 'calibration', label: 'Calibration', icon: Settings },
  { value: 'replacement', label: 'Replacement', icon: RefreshCw },
  { value: 'overhaul', label: 'Overhaul', icon: Wrench },
  { value: 'cleaning', label: 'Cleaning', icon: Sparkles },
  { value: 'testing', label: 'Testing', icon: Settings },
  { value: 'safety_check', label: 'Safety Check', icon: ShieldCheck },
  { value: 'custom', label: 'Custom', icon: FileText },
];

const SKILL_LEVELS = ['junior', 'intermediate', 'senior', 'expert', 'master'];

export default function MaintenanceTemplateLibrary({ onUseTemplate }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const queryClient = useQueryClient();

  const { data: templates = [] } = useQuery({
    queryKey: ['maintenanceTemplates'],
    queryFn: () => base44.entities.MaintenanceTemplate.list('-created_date', 100),
  });

  const createTemplateMutation = useMutation({
    mutationFn: (data) => base44.entities.MaintenanceTemplate.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['maintenanceTemplates']);
      setShowAddDialog(false);
    },
  });

  const updateTemplateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.MaintenanceTemplate.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['maintenanceTemplates']);
      setEditingTemplate(null);
    },
  });

  const deleteTemplateMutation = useMutation({
    mutationFn: (id) => base44.entities.MaintenanceTemplate.delete(id),
    onSuccess: () => queryClient.invalidateQueries(['maintenanceTemplates']),
  });

  const generateAITemplates = async () => {
    setIsGenerating(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate 5 common maintenance task templates for industrial equipment. For each template provide:
- name: descriptive name
- description: what the maintenance involves
- category: one of [inspection, lubrication, calibration, replacement, overhaul, cleaning, testing, safety_check]
- equipment_types: array of compatible equipment types
- task_type: one of [preventive, predictive, inspection]
- default_priority: one of [low, medium, high]
- estimated_hours: number
- required_skills: array of skills needed
- min_technician_level: one of [junior, intermediate, senior, expert]
- checklist_items: array of {question, type: "boolean" or "text", required: boolean}
- safety_requirements: array of safety items/PPE`,
        response_json_schema: {
          type: "object",
          properties: {
            templates: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  description: { type: "string" },
                  category: { type: "string" },
                  equipment_types: { type: "array", items: { type: "string" } },
                  task_type: { type: "string" },
                  default_priority: { type: "string" },
                  estimated_hours: { type: "number" },
                  required_skills: { type: "array", items: { type: "string" } },
                  min_technician_level: { type: "string" },
                  checklist_items: { type: "array", items: { type: "object" } },
                  safety_requirements: { type: "array", items: { type: "string" } }
                }
              }
            }
          }
        }
      });

      if (result.templates) {
        for (const template of result.templates) {
          await base44.entities.MaintenanceTemplate.create({
            ...template,
            is_system_template: false
          });
        }
        queryClient.invalidateQueries(['maintenanceTemplates']);
      }
    } catch (error) {
      console.error('Error generating templates:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const filteredTemplates = templates.filter(t => {
    const matchesSearch = !searchQuery || 
      t.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || t.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryInfo = (category) => CATEGORIES.find(c => c.value === category) || CATEGORIES[8];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Template Library</h3>
          <p className="text-sm text-slate-500">Reusable maintenance task templates</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={generateAITemplates}
            disabled={isGenerating}
            className="border-violet-300 text-violet-600 hover:bg-violet-50"
          >
            {isGenerating ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4 mr-2" />
            )}
            Generate AI Templates
          </Button>
          <Button onClick={() => setShowAddDialog(true)} className="bg-indigo-600 hover:bg-indigo-700">
            <Plus className="w-4 h-4 mr-2" />
            New Template
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-xs">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-40">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {CATEGORIES.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Templates Grid */}
      {filteredTemplates.length === 0 ? (
        <div className="text-center py-16 bg-slate-50 rounded-xl border border-dashed border-slate-300">
          <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h4 className="font-medium text-slate-600">No templates found</h4>
          <p className="text-sm text-slate-500 mt-1">Create templates or generate with AI</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTemplates.map((template, idx) => {
            const categoryInfo = getCategoryInfo(template.category);
            const Icon = categoryInfo.icon;
            
            return (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-indigo-100">
                    <Icon className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-slate-900 truncate">{template.name}</h4>
                    <p className="text-sm text-slate-500 line-clamp-2 mt-1">{template.description}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mt-3">
                  <Badge variant="outline" className="text-xs capitalize">{categoryInfo.label}</Badge>
                  <Badge variant="outline" className="text-xs">{template.estimated_hours}h</Badge>
                  <Badge variant="outline" className="text-xs capitalize">{template.default_priority}</Badge>
                </div>

                {template.equipment_types?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {template.equipment_types.slice(0, 3).map((type, i) => (
                      <span key={i} className="text-xs text-slate-400 capitalize">
                        {type.replace(/_/g, ' ')}{i < Math.min(template.equipment_types.length - 1, 2) ? ',' : ''}
                      </span>
                    ))}
                    {template.equipment_types.length > 3 && (
                      <span className="text-xs text-slate-400">+{template.equipment_types.length - 3}</span>
                    )}
                  </div>
                )}

                <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-100">
                  <Button
                    size="sm"
                    onClick={() => onUseTemplate?.(template)}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                  >
                    <Copy className="w-3 h-3 mr-1" />
                    Use Template
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setEditingTemplate(template)}
                  >
                    <Edit className="w-3 h-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => deleteTemplateMutation.mutate(template.id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <TemplateDialog
        open={showAddDialog || !!editingTemplate}
        onOpenChange={(open) => {
          if (!open) {
            setShowAddDialog(false);
            setEditingTemplate(null);
          }
        }}
        template={editingTemplate}
        onSave={(data) => {
          if (editingTemplate) {
            updateTemplateMutation.mutate({ id: editingTemplate.id, data });
          } else {
            createTemplateMutation.mutate(data);
          }
        }}
      />
    </div>
  );
}

function TemplateDialog({ open, onOpenChange, template, onSave }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'inspection',
    equipment_types: [],
    task_type: 'preventive',
    default_priority: 'medium',
    estimated_hours: 4,
    required_skills: [],
    min_technician_level: 'intermediate',
    safety_requirements: [],
    instructions: ''
  });

  const [newSkill, setNewSkill] = useState('');
  const [newSafety, setNewSafety] = useState('');

  React.useEffect(() => {
    if (template) {
      setFormData({
        name: template.name || '',
        description: template.description || '',
        category: template.category || 'inspection',
        equipment_types: template.equipment_types || [],
        task_type: template.task_type || 'preventive',
        default_priority: template.default_priority || 'medium',
        estimated_hours: template.estimated_hours || 4,
        required_skills: template.required_skills || [],
        min_technician_level: template.min_technician_level || 'intermediate',
        safety_requirements: template.safety_requirements || [],
        instructions: template.instructions || ''
      });
    } else {
      setFormData({
        name: '',
        description: '',
        category: 'inspection',
        equipment_types: [],
        task_type: 'preventive',
        default_priority: 'medium',
        estimated_hours: 4,
        required_skills: [],
        min_technician_level: 'intermediate',
        safety_requirements: [],
        instructions: ''
      });
    }
  }, [template, open]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const addSkill = () => {
    if (newSkill && !formData.required_skills.includes(newSkill)) {
      setFormData({ ...formData, required_skills: [...formData.required_skills, newSkill] });
      setNewSkill('');
    }
  };

  const addSafety = () => {
    if (newSafety && !formData.safety_requirements.includes(newSafety)) {
      setFormData({ ...formData, safety_requirements: [...formData.safety_requirements, newSafety] });
      setNewSafety('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl bg-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600" />
            {template ? 'Edit Template' : 'Create Template'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Template Name *</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Motor Bearing Inspection"
              required
            />
          </div>

          <div>
            <Label>Description</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe this maintenance task..."
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Category</Label>
              <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Task Type</Label>
              <Select value={formData.task_type} onValueChange={(v) => setFormData({ ...formData, task_type: v })}>
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
              <Label>Default Priority</Label>
              <Select value={formData.default_priority} onValueChange={(v) => setFormData({ ...formData, default_priority: v })}>
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
                value={formData.estimated_hours}
                onChange={(e) => setFormData({ ...formData, estimated_hours: Number(e.target.value) })}
                min={0.5}
                step={0.5}
              />
            </div>
          </div>

          <div>
            <Label>Minimum Technician Level</Label>
            <Select value={formData.min_technician_level} onValueChange={(v) => setFormData({ ...formData, min_technician_level: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SKILL_LEVELS.map((level) => (
                  <SelectItem key={level} value={level} className="capitalize">{level}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Required Skills</Label>
            <div className="flex gap-2 mt-1">
              <Input
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="Add skill..."
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
              />
              <Button type="button" onClick={addSkill} variant="outline">Add</Button>
            </div>
            {formData.required_skills.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.required_skills.map((skill, i) => (
                  <Badge key={i} variant="secondary" className="flex items-center gap-1">
                    {skill}
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, required_skills: formData.required_skills.filter((_, idx) => idx !== i) })}
                      className="ml-1 hover:text-red-500"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div>
            <Label>Safety Requirements</Label>
            <div className="flex gap-2 mt-1">
              <Input
                value={newSafety}
                onChange={(e) => setNewSafety(e.target.value)}
                placeholder="Add safety requirement..."
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSafety())}
              />
              <Button type="button" onClick={addSafety} variant="outline">Add</Button>
            </div>
            {formData.safety_requirements.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.safety_requirements.map((req, i) => (
                  <Badge key={i} variant="outline" className="flex items-center gap-1 bg-amber-50 text-amber-700 border-amber-200">
                    {req}
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, safety_requirements: formData.safety_requirements.filter((_, idx) => idx !== i) })}
                      className="ml-1 hover:text-red-500"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div>
            <Label>Work Instructions</Label>
            <Textarea
              value={formData.instructions}
              onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
              placeholder="Detailed step-by-step instructions..."
              rows={4}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">
              {template ? 'Update Template' : 'Create Template'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}