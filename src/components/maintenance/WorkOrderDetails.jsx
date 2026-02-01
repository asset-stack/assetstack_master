import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { 
  X, Calendar, Clock, User, Users, Cpu, DollarSign, Package, 
  FileText, Plus, Trash2, Save, History, AlertTriangle, CheckCircle2,
  Play, Pause, Square, RefreshCw, Mail, Loader2
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from 'date-fns';

const STATUSES = ['draft', 'open', 'assigned', 'in_progress', 'on_hold', 'completed', 'closed', 'cancelled'];
const PRIORITIES = ['low', 'medium', 'high', 'urgent'];
const TYPES = ['preventive', 'predictive', 'corrective', 'emergency', 'inspection'];

export default function WorkOrderDetails({ 
  workOrder, 
  equipment = [], 
  onClose, 
  onSave, 
  onStatusChange,
  onCreateFollowUp,
  isNew = false 
}) {
  const queryClient = useQueryClient();
  
  const [editedWorkOrder, setEditedWorkOrder] = useState(workOrder || {
    title: '',
    description: '',
    equipment_id: '',
    type: 'corrective',
    priority: 'medium',
    status: 'draft',
    assigned_to: '',
    assigned_team: [],
    estimated_hours: 0,
    estimated_cost: 0,
    labor_entries: [],
    parts_used: [],
    additional_costs: [],
    history: []
  });

  const [newLaborEntry, setNewLaborEntry] = useState({ technician: '', date: '', hours: 0, hourly_rate: 75, description: '' });
  const [newPart, setNewPart] = useState({ part_name: '', part_number: '', quantity: 1, unit_cost: 0, notes: '' });
  const [newCost, setNewCost] = useState({ description: '', category: '', amount: 0 });
  const [activeTab, setActiveTab] = useState('details');
  const [notifyOnAssign, setNotifyOnAssign] = useState(true);
  const [isSendingNotification, setIsSendingNotification] = useState(false);

  // Fetch technicians for assignment dropdown
  const { data: technicians = [] } = useQuery({
    queryKey: ['technicians'],
    queryFn: () => base44.entities.Technician.list('-created_date', 100),
  });

  // Get available technicians (not on leave or unavailable)
  const availableTechnicians = technicians.filter(t => 
    t.availability_status === 'available' || t.availability_status === 'busy'
  );

  // Send notification to technician
  const sendAssignmentNotification = async (technicianId, workOrderData) => {
    const technician = technicians.find(t => t.id === technicianId);
    if (!technician?.email) return;

    const equipmentName = equipmentMap[workOrderData.equipment_id]?.name || 'Unknown Equipment';
    
    await base44.integrations.Core.SendEmail({
      to: technician.email,
      subject: `Work Order Assigned: ${workOrderData.title}`,
      body: `
Hello ${technician.name},

You have been assigned a new work order:

Work Order: ${workOrderData.work_order_number || 'New'}
Title: ${workOrderData.title}
Equipment: ${equipmentName}
Priority: ${workOrderData.priority?.toUpperCase()}
Type: ${workOrderData.type}
Estimated Hours: ${workOrderData.estimated_hours || 'TBD'}
${workOrderData.scheduled_start ? `Scheduled Start: ${format(new Date(workOrderData.scheduled_start), 'PPP')}` : ''}

${workOrderData.description ? `Description:\n${workOrderData.description}` : ''}

Please log into AssetStack to view the full details and begin work.

Best regards,
AssetStack Maintenance System
      `.trim()
    });
  };

  // Update technician workload when assigned
  const updateTechnicianWorkload = async (technicianId, hoursToAdd) => {
    const technician = technicians.find(t => t.id === technicianId);
    if (!technician) return;

    await base44.entities.Technician.update(technicianId, {
      current_workload_hours: (technician.current_workload_hours || 0) + hoursToAdd,
      availability_status: ((technician.current_workload_hours || 0) + hoursToAdd) >= (technician.max_weekly_hours || 40) ? 'busy' : 'available'
    });
    queryClient.invalidateQueries(['technicians']);
  };

  const equipmentMap = equipment.reduce((acc, e) => { acc[e.id] = e; return acc; }, {});
  const currentEquipment = equipmentMap[editedWorkOrder.equipment_id];

  const calculateTotals = () => {
    const laborCost = (editedWorkOrder.labor_entries || []).reduce((sum, e) => sum + (e.hours * e.hourly_rate), 0);
    const partsCost = (editedWorkOrder.parts_used || []).reduce((sum, p) => sum + (p.quantity * p.unit_cost), 0);
    const additionalCost = (editedWorkOrder.additional_costs || []).reduce((sum, c) => sum + c.amount, 0);
    return { laborCost, partsCost, additionalCost, total: laborCost + partsCost + additionalCost };
  };

  const totals = calculateTotals();
  const totalLaborHours = (editedWorkOrder.labor_entries || []).reduce((sum, e) => sum + e.hours, 0);

  const addLaborEntry = () => {
    if (!newLaborEntry.technician || !newLaborEntry.hours) return;
    const entries = [...(editedWorkOrder.labor_entries || []), { ...newLaborEntry }];
    setEditedWorkOrder({ ...editedWorkOrder, labor_entries: entries });
    setNewLaborEntry({ technician: '', date: '', hours: 0, hourly_rate: 75, description: '' });
  };

  const removeLaborEntry = (idx) => {
    const entries = editedWorkOrder.labor_entries.filter((_, i) => i !== idx);
    setEditedWorkOrder({ ...editedWorkOrder, labor_entries: entries });
  };

  const addPart = () => {
    if (!newPart.part_name) return;
    const parts = [...(editedWorkOrder.parts_used || []), { ...newPart }];
    setEditedWorkOrder({ ...editedWorkOrder, parts_used: parts });
    setNewPart({ part_name: '', part_number: '', quantity: 1, unit_cost: 0, notes: '' });
  };

  const removePart = (idx) => {
    const parts = editedWorkOrder.parts_used.filter((_, i) => i !== idx);
    setEditedWorkOrder({ ...editedWorkOrder, parts_used: parts });
  };

  const addCost = () => {
    if (!newCost.description || !newCost.amount) return;
    const costs = [...(editedWorkOrder.additional_costs || []), { ...newCost }];
    setEditedWorkOrder({ ...editedWorkOrder, additional_costs: costs });
    setNewCost({ description: '', category: '', amount: 0 });
  };

  const removeCost = (idx) => {
    const costs = editedWorkOrder.additional_costs.filter((_, i) => i !== idx);
    setEditedWorkOrder({ ...editedWorkOrder, additional_costs: costs });
  };

  const handleSave = async () => {
    setIsSendingNotification(true);
    
    const updatedWorkOrder = {
      ...editedWorkOrder,
      actual_labor_cost: totals.laborCost,
      actual_parts_cost: totals.partsCost,
      actual_total_cost: totals.total
    };

    // Check if technician was newly assigned or changed
    const wasAssigned = workOrder?.assigned_to !== editedWorkOrder.assigned_to && editedWorkOrder.assigned_to;
    
    // Send notification if assigned and notify is enabled
    if (wasAssigned && notifyOnAssign && editedWorkOrder.assigned_to) {
      await sendAssignmentNotification(editedWorkOrder.assigned_to, updatedWorkOrder);
      
      // Update technician workload
      await updateTechnicianWorkload(editedWorkOrder.assigned_to, editedWorkOrder.estimated_hours || 0);
      
      // If status is draft, auto-change to assigned
      if (updatedWorkOrder.status === 'draft' || updatedWorkOrder.status === 'open') {
        updatedWorkOrder.status = 'assigned';
        updatedWorkOrder.history = [...(updatedWorkOrder.history || []), {
          timestamp: new Date().toISOString(),
          action: 'Assigned to technician',
          user: 'Current User',
          details: `Assigned to ${technicians.find(t => t.id === editedWorkOrder.assigned_to)?.name || 'technician'}`
        }];
      }
    }
    
    setIsSendingNotification(false);
    onSave && onSave(updatedWorkOrder);
  };

  const handleStatusChange = (newStatus) => {
    const historyEntry = {
      timestamp: new Date().toISOString(),
      action: `Status changed to ${newStatus}`,
      user: 'Current User',
      details: `Status changed from ${editedWorkOrder.status} to ${newStatus}`
    };
    
    const updates = { 
      status: newStatus, 
      history: [...(editedWorkOrder.history || []), historyEntry] 
    };
    
    if (newStatus === 'in_progress' && !editedWorkOrder.actual_start) {
      updates.actual_start = new Date().toISOString();
    }
    if (newStatus === 'completed' && !editedWorkOrder.actual_end) {
      updates.actual_end = new Date().toISOString();
    }
    
    setEditedWorkOrder({ ...editedWorkOrder, ...updates });
    onStatusChange && onStatusChange(editedWorkOrder.id, updates);
  };

  const getStatusColor = (status) => {
    const colors = {
      draft: 'bg-slate-100 text-slate-600',
      open: 'bg-blue-50 text-blue-700',
      assigned: 'bg-indigo-50 text-indigo-700',
      in_progress: 'bg-violet-50 text-violet-700',
      on_hold: 'bg-amber-50 text-amber-700',
      completed: 'bg-emerald-50 text-emerald-700',
      closed: 'bg-slate-100 text-slate-600',
      cancelled: 'bg-rose-50 text-rose-700'
    };
    return colors[status] || colors.draft;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-200 bg-slate-50">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-sm font-mono text-slate-400">
                  {editedWorkOrder.work_order_number || 'New Work Order'}
                </span>
                <Badge className={getStatusColor(editedWorkOrder.status)}>
                  {editedWorkOrder.status}
                </Badge>
              </div>
              <h2 className="text-xl font-semibold text-slate-900">
                {isNew ? 'Create Work Order' : editedWorkOrder.title}
              </h2>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Quick Actions */}
          {!isNew && (
            <div className="flex items-center gap-2 mt-4">
              {editedWorkOrder.status === 'assigned' && (
                <Button size="sm" onClick={() => handleStatusChange('in_progress')} className="bg-indigo-600 hover:bg-indigo-700">
                  <Play className="w-4 h-4 mr-1" /> Start Work
                </Button>
              )}
              {editedWorkOrder.status === 'in_progress' && (
                <>
                  <Button size="sm" variant="outline" onClick={() => handleStatusChange('on_hold')}>
                    <Pause className="w-4 h-4 mr-1" /> Put On Hold
                  </Button>
                  <Button size="sm" onClick={() => handleStatusChange('completed')} className="bg-emerald-600 hover:bg-emerald-700">
                    <CheckCircle2 className="w-4 h-4 mr-1" /> Complete
                  </Button>
                </>
              )}
              {editedWorkOrder.status === 'on_hold' && (
                <Button size="sm" onClick={() => handleStatusChange('in_progress')} className="bg-indigo-600 hover:bg-indigo-700">
                  <Play className="w-4 h-4 mr-1" /> Resume Work
                </Button>
              )}
              {editedWorkOrder.status === 'completed' && (
                <>
                  <Button size="sm" onClick={() => handleStatusChange('closed')} className="bg-slate-600 hover:bg-slate-700">
                    <Square className="w-4 h-4 mr-1" /> Close Work Order
                  </Button>
                  {onCreateFollowUp && (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => onCreateFollowUp(editedWorkOrder)}
                      className="border-violet-300 text-violet-600 hover:bg-violet-50"
                    >
                      <RefreshCw className="w-4 h-4 mr-1" /> Create Follow-up
                    </Button>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Tabs Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-200px)]">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="px-6 pt-4 border-b border-slate-100">
              <TabsList className="bg-slate-100">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="labor">Labor ({editedWorkOrder.labor_entries?.length || 0})</TabsTrigger>
                <TabsTrigger value="parts">Parts ({editedWorkOrder.parts_used?.length || 0})</TabsTrigger>
                <TabsTrigger value="costs">Costs</TabsTrigger>
                <TabsTrigger value="history">History ({editedWorkOrder.history?.length || 0})</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="details" className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-2">
                  <Label className="text-slate-700">Title *</Label>
                  <Input
                    value={editedWorkOrder.title}
                    onChange={(e) => setEditedWorkOrder({ ...editedWorkOrder, title: e.target.value })}
                    placeholder="Work order title"
                    className="bg-white border-slate-200"
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label className="text-slate-700">Description</Label>
                  <Textarea
                    value={editedWorkOrder.description}
                    onChange={(e) => setEditedWorkOrder({ ...editedWorkOrder, description: e.target.value })}
                    placeholder="Detailed work description..."
                    className="bg-white border-slate-200"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-700">Equipment *</Label>
                  <Select 
                    value={editedWorkOrder.equipment_id} 
                    onValueChange={(v) => setEditedWorkOrder({ ...editedWorkOrder, equipment_id: v })}
                  >
                    <SelectTrigger className="bg-white border-slate-200">
                      <SelectValue placeholder="Select equipment" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-slate-200 max-h-60">
                      {equipment.map(eq => (
                        <SelectItem key={eq.id} value={eq.id}>{eq.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-700">Type</Label>
                  <Select 
                    value={editedWorkOrder.type} 
                    onValueChange={(v) => setEditedWorkOrder({ ...editedWorkOrder, type: v })}
                  >
                    <SelectTrigger className="bg-white border-slate-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-slate-200">
                      {TYPES.map(t => (
                        <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-700">Priority</Label>
                  <Select 
                    value={editedWorkOrder.priority} 
                    onValueChange={(v) => setEditedWorkOrder({ ...editedWorkOrder, priority: v })}
                  >
                    <SelectTrigger className="bg-white border-slate-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-slate-200">
                      {PRIORITIES.map(p => (
                        <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-700">Status</Label>
                  <Select 
                    value={editedWorkOrder.status} 
                    onValueChange={(v) => setEditedWorkOrder({ ...editedWorkOrder, status: v })}
                  >
                    <SelectTrigger className="bg-white border-slate-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-slate-200">
                      {STATUSES.map(s => (
                        <SelectItem key={s} value={s} className="capitalize">{s.replace('_', ' ')}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-700">Assign To Technician</Label>
                  <Select 
                    value={editedWorkOrder.assigned_to || ''} 
                    onValueChange={(v) => setEditedWorkOrder({ ...editedWorkOrder, assigned_to: v })}
                  >
                    <SelectTrigger className="bg-white border-slate-200">
                      <SelectValue placeholder="Select technician" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-slate-200 max-h-60">
                      <SelectItem value={null}>Unassigned</SelectItem>
                      {availableTechnicians.map(tech => (
                        <SelectItem key={tech.id} value={tech.id}>
                          <div className="flex items-center gap-2">
                            <span>{tech.name}</span>
                            <span className="text-xs text-slate-400">
                              ({tech.current_workload_hours || 0}/{tech.max_weekly_hours || 40}h)
                            </span>
                            {tech.availability_status === 'busy' && (
                              <Badge variant="outline" className="text-xs bg-amber-50 text-amber-600 border-amber-200">Busy</Badge>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {editedWorkOrder.assigned_to && (
                    <div className="flex items-center gap-2 mt-2">
                      <Checkbox 
                        id="notify-technician"
                        checked={notifyOnAssign}
                        onCheckedChange={setNotifyOnAssign}
                      />
                      <Label htmlFor="notify-technician" className="text-sm text-slate-600 cursor-pointer flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        Send email notification
                      </Label>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-700">Estimated Hours</Label>
                  <Input
                    type="number"
                    value={editedWorkOrder.estimated_hours}
                    onChange={(e) => setEditedWorkOrder({ ...editedWorkOrder, estimated_hours: Number(e.target.value) })}
                    className="bg-white border-slate-200"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-700">Scheduled Start</Label>
                  <Input
                    type="datetime-local"
                    value={editedWorkOrder.scheduled_start?.slice(0, 16) || ''}
                    onChange={(e) => setEditedWorkOrder({ ...editedWorkOrder, scheduled_start: e.target.value })}
                    className="bg-white border-slate-200"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-700">Scheduled End</Label>
                  <Input
                    type="datetime-local"
                    value={editedWorkOrder.scheduled_end?.slice(0, 16) || ''}
                    onChange={(e) => setEditedWorkOrder({ ...editedWorkOrder, scheduled_end: e.target.value })}
                    className="bg-white border-slate-200"
                  />
                </div>
              </div>

              {(editedWorkOrder.status === 'completed' || editedWorkOrder.status === 'closed') && (
                <div className="space-y-4 p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                  <h4 className="font-medium text-emerald-800">Completion Information</h4>
                  <div className="space-y-2">
                    <Label className="text-emerald-700">Completion Notes</Label>
                    <Textarea
                      value={editedWorkOrder.completion_notes}
                      onChange={(e) => setEditedWorkOrder({ ...editedWorkOrder, completion_notes: e.target.value })}
                      placeholder="Notes about completed work..."
                      className="bg-white border-emerald-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-emerald-700">Findings</Label>
                    <Textarea
                      value={editedWorkOrder.findings}
                      onChange={(e) => setEditedWorkOrder({ ...editedWorkOrder, findings: e.target.value })}
                      placeholder="Any findings during inspection..."
                      className="bg-white border-emerald-200"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={editedWorkOrder.follow_up_required}
                      onChange={(e) => setEditedWorkOrder({ ...editedWorkOrder, follow_up_required: e.target.checked })}
                      className="rounded border-emerald-300"
                    />
                    <Label className="text-emerald-700">Follow-up required</Label>
                  </div>
                  {editedWorkOrder.follow_up_required && (
                    <div className="space-y-2">
                      <Label className="text-emerald-700">Follow-up Notes</Label>
                      <Textarea
                        value={editedWorkOrder.follow_up_notes}
                        onChange={(e) => setEditedWorkOrder({ ...editedWorkOrder, follow_up_notes: e.target.value })}
                        placeholder="What follow-up is needed..."
                        className="bg-white border-emerald-200"
                      />
                    </div>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="labor" className="p-6 space-y-4">
              {/* Add Labor Entry */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <h4 className="font-medium text-slate-700 mb-3">Log Labor Hours</h4>
                <div className="grid grid-cols-5 gap-3">
                  <Input
                    placeholder="Technician"
                    value={newLaborEntry.technician}
                    onChange={(e) => setNewLaborEntry({ ...newLaborEntry, technician: e.target.value })}
                    className="bg-white"
                  />
                  <Input
                    type="date"
                    value={newLaborEntry.date}
                    onChange={(e) => setNewLaborEntry({ ...newLaborEntry, date: e.target.value })}
                    className="bg-white"
                  />
                  <Input
                    type="number"
                    placeholder="Hours"
                    value={newLaborEntry.hours || ''}
                    onChange={(e) => setNewLaborEntry({ ...newLaborEntry, hours: Number(e.target.value) })}
                    className="bg-white"
                  />
                  <Input
                    type="number"
                    placeholder="Rate/hr"
                    value={newLaborEntry.hourly_rate || ''}
                    onChange={(e) => setNewLaborEntry({ ...newLaborEntry, hourly_rate: Number(e.target.value) })}
                    className="bg-white"
                  />
                  <Button onClick={addLaborEntry} className="bg-indigo-600 hover:bg-indigo-700">
                    <Plus className="w-4 h-4 mr-1" /> Add
                  </Button>
                </div>
              </div>

              {/* Labor Entries List */}
              <div className="space-y-2">
                {(editedWorkOrder.labor_entries || []).map((entry, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200">
                    <div className="flex items-center gap-4">
                      <User className="w-4 h-4 text-slate-400" />
                      <div>
                        <p className="font-medium text-slate-700">{entry.technician}</p>
                        <p className="text-sm text-slate-500">{entry.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-medium text-slate-700">{entry.hours}h</p>
                        <p className="text-sm text-slate-500">${(entry.hours * entry.hourly_rate).toFixed(2)}</p>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => removeLaborEntry(idx)} className="text-rose-500">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-200">
                <div className="flex justify-between">
                  <span className="font-medium text-indigo-700">Total Labor</span>
                  <span className="font-bold text-indigo-700">{totalLaborHours}h / ${totals.laborCost.toFixed(2)}</span>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="parts" className="p-6 space-y-4">
              {/* Add Part */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <h4 className="font-medium text-slate-700 mb-3">Add Part Used</h4>
                <div className="grid grid-cols-5 gap-3">
                  <Input
                    placeholder="Part Name"
                    value={newPart.part_name}
                    onChange={(e) => setNewPart({ ...newPart, part_name: e.target.value })}
                    className="bg-white"
                  />
                  <Input
                    placeholder="Part #"
                    value={newPart.part_number}
                    onChange={(e) => setNewPart({ ...newPart, part_number: e.target.value })}
                    className="bg-white"
                  />
                  <Input
                    type="number"
                    placeholder="Qty"
                    value={newPart.quantity || ''}
                    onChange={(e) => setNewPart({ ...newPart, quantity: Number(e.target.value) })}
                    className="bg-white"
                  />
                  <Input
                    type="number"
                    placeholder="Unit Cost"
                    value={newPart.unit_cost || ''}
                    onChange={(e) => setNewPart({ ...newPart, unit_cost: Number(e.target.value) })}
                    className="bg-white"
                  />
                  <Button onClick={addPart} className="bg-indigo-600 hover:bg-indigo-700">
                    <Plus className="w-4 h-4 mr-1" /> Add
                  </Button>
                </div>
              </div>

              {/* Parts List */}
              <div className="space-y-2">
                {(editedWorkOrder.parts_used || []).map((part, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200">
                    <div className="flex items-center gap-4">
                      <Package className="w-4 h-4 text-slate-400" />
                      <div>
                        <p className="font-medium text-slate-700">{part.part_name}</p>
                        <p className="text-sm text-slate-500">{part.part_number}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-medium text-slate-700">{part.quantity} × ${part.unit_cost}</p>
                        <p className="text-sm text-slate-500">${(part.quantity * part.unit_cost).toFixed(2)}</p>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => removePart(idx)} className="text-rose-500">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-violet-50 rounded-xl border border-violet-200">
                <div className="flex justify-between">
                  <span className="font-medium text-violet-700">Total Parts Cost</span>
                  <span className="font-bold text-violet-700">${totals.partsCost.toFixed(2)}</span>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="costs" className="p-6 space-y-4">
              {/* Add Additional Cost */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <h4 className="font-medium text-slate-700 mb-3">Add Additional Cost</h4>
                <div className="grid grid-cols-4 gap-3">
                  <Input
                    placeholder="Description"
                    value={newCost.description}
                    onChange={(e) => setNewCost({ ...newCost, description: e.target.value })}
                    className="bg-white col-span-2"
                  />
                  <Input
                    type="number"
                    placeholder="Amount"
                    value={newCost.amount || ''}
                    onChange={(e) => setNewCost({ ...newCost, amount: Number(e.target.value) })}
                    className="bg-white"
                  />
                  <Button onClick={addCost} className="bg-indigo-600 hover:bg-indigo-700">
                    <Plus className="w-4 h-4 mr-1" /> Add
                  </Button>
                </div>
              </div>

              {/* Additional Costs List */}
              <div className="space-y-2">
                {(editedWorkOrder.additional_costs || []).map((cost, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200">
                    <div className="flex items-center gap-4">
                      <DollarSign className="w-4 h-4 text-slate-400" />
                      <p className="font-medium text-slate-700">{cost.description}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-medium text-slate-700">${cost.amount.toFixed(2)}</span>
                      <Button variant="ghost" size="icon" onClick={() => removeCost(idx)} className="text-rose-500">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Cost Summary */}
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-emerald-700">Labor Cost</span>
                  <span className="text-emerald-700">${totals.laborCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-emerald-700">Parts Cost</span>
                  <span className="text-emerald-700">${totals.partsCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-emerald-700">Additional Costs</span>
                  <span className="text-emerald-700">${totals.additionalCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-emerald-300">
                  <span className="font-semibold text-emerald-800">Total Cost</span>
                  <span className="font-bold text-emerald-800">${totals.total.toFixed(2)}</span>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="history" className="p-6">
              <div className="space-y-3">
                {(editedWorkOrder.history || []).length === 0 ? (
                  <div className="text-center py-8 text-slate-400">
                    <History className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No history entries yet</p>
                  </div>
                ) : (
                  [...(editedWorkOrder.history || [])].reverse().map((entry, idx) => (
                    <div key={idx} className="flex gap-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="w-2 h-2 rounded-full bg-indigo-500 mt-2" />
                      <div className="flex-1">
                        <p className="font-medium text-slate-700">{entry.action}</p>
                        <p className="text-sm text-slate-500">{entry.details}</p>
                        <p className="text-xs text-slate-400 mt-1">
                          {entry.user} • {format(new Date(entry.timestamp), 'MMM d, yyyy HH:mm')}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-200 bg-slate-50 flex justify-between items-center">
          <div className="text-sm text-slate-500">
            {currentEquipment && (
              <span className="flex items-center gap-2">
                <Cpu className="w-4 h-4" />
                {currentEquipment.name} • {currentEquipment.location}
              </span>
            )}
            {editedWorkOrder.assigned_to && (
              <span className="flex items-center gap-2 mt-1">
                <User className="w-4 h-4" />
                Assigned to: {technicians.find(t => t.id === editedWorkOrder.assigned_to)?.name || 'Unknown'}
              </span>
            )}
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSave} disabled={isSendingNotification} className="bg-indigo-600 hover:bg-indigo-700">
              {isSendingNotification ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {isNew ? 'Create Work Order' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}