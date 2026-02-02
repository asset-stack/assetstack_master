import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Search, Filter, Calendar, Clock, Wrench, FileText,
  CheckCircle2, AlertTriangle, Sparkles, Loader2, Brain
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import MaintenanceCard from '@/components/maintenance/MaintenanceCard';
import AIScheduleOptimizer from '@/components/maintenance/AIScheduleOptimizer';
import WorkOrderList from '@/components/maintenance/WorkOrderList';
import AISchedulerPanel from '@/components/maintenance/AISchedulerPanel';

const TASK_TYPES = ['preventive', 'predictive', 'corrective', 'emergency', 'inspection'];
const PRIORITIES = ['low', 'medium', 'high', 'urgent'];

export default function Maintenance() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [activeTab, setActiveTab] = useState('scheduled');
  const [viewMode, setViewMode] = useState('tasks');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    equipment_id: '',
    type: 'preventive',
    priority: 'medium',
    scheduled_date: '',
    estimated_duration_hours: 2,
    assigned_to: '',
    cost_estimate: 0
  });

  const queryClient = useQueryClient();

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => base44.entities.MaintenanceTask.list('-created_date', 200),
  });

  const { data: equipment = [] } = useQuery({
    queryKey: ['equipment'],
    queryFn: () => base44.entities.Equipment.list('-created_date', 200),
  });

  const { data: workOrders = [] } = useQuery({
    queryKey: ['workOrders'],
    queryFn: () => base44.entities.WorkOrder.list('-created_date', 200),
  });

  const { data: alerts = [] } = useQuery({
    queryKey: ['alerts'],
    queryFn: () => base44.entities.Alert.list('-created_date', 100),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.MaintenanceTask.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['tasks']);
      setIsAddDialogOpen(false);
      setNewTask({
        title: '',
        description: '',
        equipment_id: '',
        type: 'preventive',
        priority: 'medium',
        scheduled_date: '',
        estimated_duration_hours: 2,
        assigned_to: '',
        cost_estimate: 0
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.MaintenanceTask.update(id, data),
    onSuccess: () => queryClient.invalidateQueries(['tasks']),
  });

  const createWorkOrderMutation = useMutation({
    mutationFn: (data) => base44.entities.WorkOrder.create(data),
    onSuccess: () => queryClient.invalidateQueries(['workOrders']),
  });

  const updateWorkOrderMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.WorkOrder.update(id, data),
    onSuccess: () => queryClient.invalidateQueries(['workOrders']),
  });

  const handleCreateWorkOrder = async (workOrderData) => {
    await createWorkOrderMutation.mutateAsync(workOrderData);
  };

  const handleUpdateWorkOrder = async (workOrderData) => {
    await updateWorkOrderMutation.mutateAsync({ id: workOrderData.id, data: workOrderData });
  };

  const handleWorkOrderStatusChange = async (workOrderId, updates) => {
    await updateWorkOrderMutation.mutateAsync({ id: workOrderId, data: updates });
  };

  const handleStatusChange = (taskId, newStatus) => {
    const updateData = { status: newStatus };
    if (newStatus === 'completed') {
      updateData.completed_date = new Date().toISOString().split('T')[0];
    }
    updateMutation.mutate({ id: taskId, data: updateData });
  };

  const generateAIRecommendations = async () => {
    setIsGenerating(true);
    try {
      const result = await base44.functions.invoke('autoGenerateTasks', {});
      
      if (result.data.success) {
        queryClient.invalidateQueries(['tasks']);
        alert(`Successfully generated ${result.data.tasksGenerated} AI-recommended tasks`);
      } else {
        alert('No tasks were generated. All at-risk equipment may already have scheduled tasks.');
      }
    } catch (error) {
      console.error('Error generating recommendations:', error);
      alert('Failed to generate tasks. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const equipmentMap = equipment.reduce((acc, e) => {
    acc[e.id] = e;
    return acc;
  }, {});

  const filteredTasks = tasks
    .filter(t => {
      const matchesSearch = !searchQuery || 
        t.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        equipmentMap[t.equipment_id]?.name?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = filterType === 'all' || t.type === filterType;
      const matchesPriority = filterPriority === 'all' || t.priority === filterPriority;
      const matchesTab = 
        (activeTab === 'scheduled' && (t.status === 'scheduled' || t.status === 'in_progress')) ||
        (activeTab === 'overdue' && t.status === 'overdue') ||
        (activeTab === 'completed' && t.status === 'completed') ||
        (activeTab === 'all');
      return matchesSearch && matchesType && matchesPriority && matchesTab;
    })
    .sort((a, b) => {
      // Priority sorting
      const priorityOrder = { urgent: 1, high: 2, medium: 3, low: 4 };
      const priorityA = priorityOrder[a.priority] || 5;
      const priorityB = priorityOrder[b.priority] || 5;
      
      // Criticality sorting
      const criticalityOrder = { mission_critical: 1, high: 2, medium: 3, low: 4 };
      const eqA = equipmentMap[a.equipment_id];
      const eqB = equipmentMap[b.equipment_id];
      const criticalityA = criticalityOrder[eqA?.criticality] || 5;
      const criticalityB = criticalityOrder[eqB?.criticality] || 5;
      
      // AI recommended first
      if (a.ai_recommended && !b.ai_recommended) return -1;
      if (!a.ai_recommended && b.ai_recommended) return 1;
      
      // Then by criticality
      if (criticalityA !== criticalityB) return criticalityA - criticalityB;
      
      // Then by priority
      return priorityA - priorityB;
    });

  const scheduledCount = tasks.filter(t => t.status === 'scheduled' || t.status === 'in_progress').length;
  const overdueCount = tasks.filter(t => t.status === 'overdue').length;
  const completedCount = tasks.filter(t => t.status === 'completed').length;
  const aiCount = tasks.filter(t => t.ai_recommended).length;

  const handleAICreateTask = async (taskData) => {
    await createMutation.mutateAsync({ ...taskData, status: 'scheduled' });
  };

  return (
    <div className="min-h-screen bg-gray-50 text-slate-900">
      <div className="max-w-[1800px] mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Maintenance Tasks</h1>
            <p className="text-sm text-slate-500">{tasks.length} total tasks • {aiCount} AI recommended</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex bg-white rounded-lg border border-slate-200 p-1">
              <Button
                variant={viewMode === 'tasks' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('tasks')}
                className={viewMode === 'tasks' ? 'bg-indigo-600 hover:bg-indigo-700' : 'text-slate-500'}
              >
                <Wrench className="w-4 h-4 mr-1" />
                Tasks
              </Button>
              <Button
                variant={viewMode === 'workorders' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('workorders')}
                className={viewMode === 'workorders' ? 'bg-indigo-600 hover:bg-indigo-700' : 'text-slate-500'}
              >
                <FileText className="w-4 h-4 mr-1" />
                Work Orders
              </Button>
              <Button
                variant={viewMode === 'scheduler' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('scheduler')}
                className={viewMode === 'scheduler' ? 'bg-violet-600 hover:bg-violet-700' : 'text-slate-500'}
              >
                <Brain className="w-4 h-4 mr-1" />
                AI Scheduler
              </Button>
            </div>
            <Button 
              variant="outline"
              onClick={generateAIRecommendations}
              disabled={isGenerating}
              className="border-violet-300 text-violet-600 hover:bg-violet-50"
            >
              {isGenerating ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4 mr-2" />
              )}
              Generate AI Tasks
            </Button>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-indigo-600 hover:bg-indigo-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Task
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-white border-slate-200 text-slate-900 max-w-2xl" aria-describedby="create-task-description">
                <DialogHeader>
                  <DialogTitle>Create Maintenance Task</DialogTitle>
                  <p id="create-task-description" className="text-sm text-slate-500">Fill in the details below to create a new maintenance task.</p>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="col-span-2 space-y-2">
                    <Label className="text-slate-700">Title *</Label>
                    <Input
                      value={newTask.title}
                      onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                      placeholder="Task title"
                      className="bg-white border-slate-200"
                    />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label className="text-slate-700">Description</Label>
                    <Textarea
                      value={newTask.description}
                      onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                      placeholder="Task details..."
                      className="bg-white border-slate-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-700">Equipment *</Label>
                    <Select value={newTask.equipment_id} onValueChange={(v) => setNewTask({ ...newTask, equipment_id: v })}>
                      <SelectTrigger className="bg-white border-slate-200">
                        <SelectValue placeholder="Select equipment" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-slate-200 max-h-60">
                        {equipment.map(eq => (
                          <SelectItem key={eq.id} value={eq.id}>
                            {eq.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-700">Type</Label>
                    <Select value={newTask.type} onValueChange={(v) => setNewTask({ ...newTask, type: v })}>
                      <SelectTrigger className="bg-white border-slate-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-slate-200">
                        {TASK_TYPES.map(type => (
                          <SelectItem key={type} value={type} className="capitalize">
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-700">Priority</Label>
                    <Select value={newTask.priority} onValueChange={(v) => setNewTask({ ...newTask, priority: v })}>
                      <SelectTrigger className="bg-white border-slate-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-slate-200">
                        {PRIORITIES.map(p => (
                          <SelectItem key={p} value={p} className="capitalize">
                            {p}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-700">Scheduled Date</Label>
                    <Input
                      type="date"
                      value={newTask.scheduled_date}
                      onChange={(e) => setNewTask({ ...newTask, scheduled_date: e.target.value })}
                      className="bg-white border-slate-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-700">Est. Duration (hours)</Label>
                    <Input
                      type="number"
                      value={newTask.estimated_duration_hours}
                      onChange={(e) => setNewTask({ ...newTask, estimated_duration_hours: Number(e.target.value) })}
                      className="bg-white border-slate-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-700">Assigned To</Label>
                    <Input
                      value={newTask.assigned_to}
                      onChange={(e) => setNewTask({ ...newTask, assigned_to: e.target.value })}
                      placeholder="Technician name"
                      className="bg-white border-slate-200"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="border-slate-200">
                    Cancel
                  </Button>
                  <Button 
                    onClick={() => createMutation.mutate({ ...newTask, status: 'scheduled' })}
                    disabled={!newTask.title || !newTask.equipment_id || createMutation.isPending}
                    className="bg-indigo-600 hover:bg-indigo-700"
                  >
                    Create Task
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* AI Scheduler View */}
        {viewMode === 'scheduler' && (
          <div className="mb-8">
            <AISchedulerPanel 
              onTaskCreated={() => {
                queryClient.invalidateQueries(['tasks']);
                queryClient.invalidateQueries(['workOrders']);
              }}
            />
          </div>
        )}

        {/* Work Orders View */}
        {viewMode === 'workorders' && (
          <WorkOrderList
            workOrders={workOrders}
            equipment={equipment}
            alerts={alerts}
            tasks={tasks}
            onCreateWorkOrder={handleCreateWorkOrder}
            onUpdateWorkOrder={handleUpdateWorkOrder}
            onStatusChange={handleWorkOrderStatusChange}
          />
        )}

        {/* Tasks View */}
        {viewMode === 'tasks' && (
          <>
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Calendar className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-slate-900">{scheduledCount}</p>
                <p className="text-xs text-slate-500">Scheduled</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-rose-100 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-slate-900">{overdueCount}</p>
                <p className="text-xs text-slate-500">Overdue</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-slate-900">{completedCount}</p>
                <p className="text-xs text-slate-500">Completed</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-violet-100 rounded-lg">
                <Sparkles className="w-5 h-5 text-violet-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-slate-900">{aiCount}</p>
                <p className="text-xs text-slate-500">AI Recommended</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs & Filters */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
            <TabsList className="bg-white border border-slate-200">
              <TabsTrigger value="scheduled" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
                Scheduled ({scheduledCount})
              </TabsTrigger>
              <TabsTrigger value="overdue" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
                Overdue ({overdueCount})
              </TabsTrigger>
              <TabsTrigger value="completed" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
                Completed ({completedCount})
              </TabsTrigger>
              <TabsTrigger value="all" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
                All
              </TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="flex items-center gap-4 ml-auto">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-56 bg-white border-slate-200 text-slate-900"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-36 bg-white border-slate-200">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent className="bg-white border-slate-200">
                <SelectItem value="all">All Types</SelectItem>
                {TASK_TYPES.map(type => (
                  <SelectItem key={type} value={type} className="capitalize">
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="w-36 bg-white border-slate-200">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent className="bg-white border-slate-200">
                <SelectItem value="all">All Priorities</SelectItem>
                {PRIORITIES.map(p => (
                  <SelectItem key={p} value={p} className="capitalize">
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Tasks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTasks.map((task, idx) => (
            <MaintenanceCard
              key={task.id}
              task={task}
              equipment={equipmentMap[task.equipment_id]}
              onStatusChange={handleStatusChange}
              delay={idx * 0.03}
            />
          ))}
        </div>

        {filteredTasks.length === 0 && !isLoading && (
          <div className="text-center py-16">
            <Wrench className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-600">No tasks found</h3>
            <p className="text-sm text-slate-400">Create a new task or generate AI recommendations</p>
          </div>
        )}
          </>
        )}
      </div>
    </div>
  );
}