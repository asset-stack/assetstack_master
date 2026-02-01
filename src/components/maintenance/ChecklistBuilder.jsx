import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Trash2, GripVertical, Type, Hash, ToggleLeft, 
  List, Camera, ChevronDown, ChevronUp, Copy
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const QUESTION_TYPES = [
  { value: 'text', label: 'Text', icon: Type, description: 'Free text answer' },
  { value: 'number', label: 'Number', icon: Hash, description: 'Numeric value' },
  { value: 'boolean', label: 'Yes/No', icon: ToggleLeft, description: 'Binary choice' },
  { value: 'dropdown', label: 'Dropdown', icon: List, description: 'Select from options' },
  { value: 'photo', label: 'Photo', icon: Camera, description: 'Capture image' },
];

const CHECKLIST_TEMPLATES = [
  {
    name: 'Safety Inspection',
    items: [
      { question: 'Are all safety guards in place?', type: 'boolean', required: true },
      { question: 'Is the work area clear of hazards?', type: 'boolean', required: true },
      { question: 'Is PPE being used correctly?', type: 'boolean', required: true },
      { question: 'Emergency stop accessible?', type: 'boolean', required: true },
      { question: 'Additional safety observations', type: 'text', required: false },
    ]
  },
  {
    name: 'Equipment Condition',
    items: [
      { question: 'Visual condition assessment', type: 'dropdown', options: ['Excellent', 'Good', 'Fair', 'Poor', 'Critical'], required: true },
      { question: 'Vibration level (if applicable)', type: 'dropdown', options: ['Normal', 'Slightly elevated', 'High', 'Critical'], required: false },
      { question: 'Temperature reading (°C)', type: 'number', required: false },
      { question: 'Photo of equipment condition', type: 'photo', required: true },
      { question: 'Notes on observed issues', type: 'text', required: false },
    ]
  },
  {
    name: 'Preventive Maintenance',
    items: [
      { question: 'Lubrication completed?', type: 'boolean', required: true },
      { question: 'Filters inspected/replaced?', type: 'boolean', required: true },
      { question: 'Belts/chains checked for wear?', type: 'boolean', required: true },
      { question: 'Electrical connections secure?', type: 'boolean', required: true },
      { question: 'Operating hours reading', type: 'number', required: false },
      { question: 'Parts replaced (list)', type: 'text', required: false },
      { question: 'Before photo', type: 'photo', required: false },
      { question: 'After photo', type: 'photo', required: false },
    ]
  }
];

export default function ChecklistBuilder({ checklist = [], onChange }) {
  const [expandedItem, setExpandedItem] = useState(null);
  const [showTemplates, setShowTemplates] = useState(false);

  const generateId = () => `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const addItem = () => {
    const newItem = {
      id: generateId(),
      question: '',
      type: 'boolean',
      required: false,
      options: []
    };
    onChange([...checklist, newItem]);
    setExpandedItem(newItem.id);
  };

  const updateItem = (id, updates) => {
    onChange(checklist.map(item => item.id === id ? { ...item, ...updates } : item));
  };

  const removeItem = (id) => {
    onChange(checklist.filter(item => item.id !== id));
  };

  const duplicateItem = (item) => {
    const newItem = { ...item, id: generateId(), answer: undefined, completed: false };
    const index = checklist.findIndex(i => i.id === item.id);
    const newChecklist = [...checklist];
    newChecklist.splice(index + 1, 0, newItem);
    onChange(newChecklist);
  };

  const moveItem = (fromIndex, toIndex) => {
    const newChecklist = [...checklist];
    const [moved] = newChecklist.splice(fromIndex, 1);
    newChecklist.splice(toIndex, 0, moved);
    onChange(newChecklist);
  };

  const applyTemplate = (template) => {
    const templateItems = template.items.map(item => ({
      ...item,
      id: generateId()
    }));
    onChange([...checklist, ...templateItems]);
    setShowTemplates(false);
  };

  const getTypeIcon = (type) => {
    const typeConfig = QUESTION_TYPES.find(t => t.value === type);
    return typeConfig?.icon || Type;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-medium text-slate-900">Checklist Items</h4>
          <p className="text-sm text-slate-500">{checklist.length} items</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowTemplates(!showTemplates)}
          >
            <List className="w-4 h-4 mr-1" />
            Templates
          </Button>
          <Button size="sm" onClick={addItem} className="bg-indigo-600 hover:bg-indigo-700">
            <Plus className="w-4 h-4 mr-1" />
            Add Item
          </Button>
        </div>
      </div>

      {/* Templates Panel */}
      <AnimatePresence>
        {showTemplates && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-indigo-50 rounded-lg p-4 border border-indigo-100"
          >
            <h5 className="font-medium text-indigo-900 mb-3">Quick Templates</h5>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {CHECKLIST_TEMPLATES.map((template, idx) => (
                <button
                  key={idx}
                  onClick={() => applyTemplate(template)}
                  className="text-left p-3 bg-white rounded-lg border border-indigo-200 hover:border-indigo-400 hover:bg-indigo-50 transition-colors"
                >
                  <p className="font-medium text-slate-900 text-sm">{template.name}</p>
                  <p className="text-xs text-slate-500">{template.items.length} items</p>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Checklist Items */}
      <div className="space-y-2">
        <AnimatePresence>
          {checklist.map((item, index) => {
            const TypeIcon = getTypeIcon(item.type);
            const isExpanded = expandedItem === item.id;

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white border border-slate-200 rounded-lg overflow-hidden"
              >
                {/* Item Header */}
                <div 
                  className="flex items-center gap-3 p-3 cursor-pointer hover:bg-slate-50"
                  onClick={() => setExpandedItem(isExpanded ? null : item.id)}
                >
                  <GripVertical className="w-4 h-4 text-slate-400 cursor-grab" />
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                    <TypeIcon className="w-4 h-4 text-slate-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {item.question || 'Untitled question'}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge variant="outline" className="text-xs">
                        {QUESTION_TYPES.find(t => t.value === item.type)?.label}
                      </Badge>
                      {item.required && (
                        <Badge className="text-xs bg-rose-50 text-rose-600 border-rose-200">
                          Required
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => { e.stopPropagation(); duplicateItem(item); }}
                    >
                      <Copy className="w-4 h-4 text-slate-400" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => { e.stopPropagation(); removeItem(item.id); }}
                    >
                      <Trash2 className="w-4 h-4 text-slate-400 hover:text-rose-500" />
                    </Button>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </div>

                {/* Item Details */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: 'auto' }}
                      exit={{ height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-4 pt-0 border-t border-slate-100 space-y-4">
                        <div>
                          <Label className="text-xs text-slate-600">Question</Label>
                          <Input
                            value={item.question}
                            onChange={(e) => updateItem(item.id, { question: e.target.value })}
                            placeholder="Enter your question..."
                            className="mt-1"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-xs text-slate-600">Answer Type</Label>
                            <Select
                              value={item.type}
                              onValueChange={(v) => updateItem(item.id, { type: v })}
                            >
                              <SelectTrigger className="mt-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {QUESTION_TYPES.map(type => (
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

                          <div className="flex items-center justify-between pt-6">
                            <Label className="text-xs text-slate-600">Required</Label>
                            <Switch
                              checked={item.required}
                              onCheckedChange={(checked) => updateItem(item.id, { required: checked })}
                            />
                          </div>
                        </div>

                        {/* Dropdown Options */}
                        {item.type === 'dropdown' && (
                          <div>
                            <Label className="text-xs text-slate-600">Options (one per line)</Label>
                            <textarea
                              value={(item.options || []).join('\n')}
                              onChange={(e) => updateItem(item.id, { 
                                options: e.target.value.split('\n').filter(Boolean) 
                              })}
                              placeholder="Option 1&#10;Option 2&#10;Option 3"
                              className="mt-1 w-full min-h-[80px] rounded-md border border-slate-200 p-2 text-sm"
                            />
                          </div>
                        )}

                        {/* Reorder buttons */}
                        <div className="flex gap-2 pt-2 border-t border-slate-100">
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={index === 0}
                            onClick={() => moveItem(index, index - 1)}
                          >
                            Move Up
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={index === checklist.length - 1}
                            onClick={() => moveItem(index, index + 1)}
                          >
                            Move Down
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {checklist.length === 0 && (
        <div className="text-center py-8 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200">
          <List className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 mb-3">No checklist items yet</p>
          <Button size="sm" onClick={addItem}>
            <Plus className="w-4 h-4 mr-1" />
            Add First Item
          </Button>
        </div>
      )}
    </div>
  );
}