import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Search, Filter, Calendar, Clock, Wrench, 
  CheckCircle2, AlertTriangle, Sparkles, Loader2
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

const TASK_TYPES = ['preventive', 'predictive', 'corrective', 'emergency', 'inspection'];
const PRIORITIES = ['low', 'medium', 'high', 'urgent'];

export default function Maintenance() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [activeTab, setActiveTab] = useState('scheduled');
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

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-[1800px] mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Maintenance Tasks</h1>
            <p className="text-sm text-slate-400">{tasks.length} total tasks • {aiCount} AI recommended</p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline"
              onClick={generateAIRecommendations}
              disabled={isGenerating}
              className="border-purple-500/50 text-purple-400 hover:bg-purple-500/10"
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
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Task
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create Maintenance Task</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="col-span-2 space-y-2">
                    <Label>Title *</Label>
                    <Input
                      value={newTask.title}
                      onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                      placeholder="Task title"
                      className="bg-slate-800 border-slate-700"
                    />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      value={newTask.description}
                      onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                      placeholder="Task details..."
                      className="bg-slate-800 border-slate-700"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Equipment *</Label>
                    <Select value={newTask.equipment_id} onValueChange={(v) => setNewTask({ ...newTask, equipment_id: v })}>
                      <SelectTrigger className="bg-slate-800 border-slate-700">
                        <SelectValue placeholder="Select equipment" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700 max-h-60">
                        {equipment.map(eq => (
                          <SelectItem key={eq.id} value={eq.id}>
                            {eq.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Select value={newTask.type} onValueChange={(v) => setNewTask({ ...newTask, type: v })}>
                      <SelectTrigger className="bg-slate-800 border-slate-700">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        {TASK_TYPES.map(type => (
                          <SelectItem key={type} value={type} className="capitalize">
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Priority</Label>
                    <Select value={newTask.priority} onValueChange={(v) => setNewTask({ ...newTask, priority: v })}>
                      <SelectTrigger className="bg-slate-800 border-slate-700">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        {PRIORITIES.map(p => (
                          <SelectItem key={p} value={p} className="capitalize">
                            {p}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Scheduled Date</Label>
                    <Input
                      type="date"
                      value={newTask.scheduled_date}
                      onChange={(e) => setNewTask({ ...newTask, scheduled_date: e.target.value })}
                      className="bg-slate-800 border-slate-700"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Est. Duration (hours)</Label>
                    <Input
                      type="number"
                      value={newTask.estimated_duration_hours}
                      onChange={(e) => setNewTask({ ...newTask, estimated_duration_hours: Number(e.target.value) })}
                      className="bg-slate-800 border-slate-700"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Assigned To</Label>
                    <Input
                      value={newTask.assigned_to}
                      onChange={(e) => setNewTask({ ...newTask, assigned_to: e.target.value })}
                      placeholder="Technician name"
                      className="bg-slate-800 border-slate-700"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="border-slate-700">
                    Cancel
                  </Button>
                  <Button 
                    onClick={() => createMutation.mutate({ ...newTask, status: 'scheduled' })}
                    disabled={!newTask.title || !newTask.equipment_id || createMutation.isPending}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Create Task
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-900/50 rounded-xl border border-slate-700/50 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Calendar className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{scheduledCount}</p>
                <p className="text-xs text-slate-400">Scheduled</p>
              </div>
            </div>
          </div>
          <div className="bg-slate-900/50 rounded-xl border border-slate-700/50 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-rose-500/20 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{overdueCount}</p>
                <p className="text-xs text-slate-400">Overdue</p>
              </div>
            </div>
          </div>
          <div className="bg-slate-900/50 rounded-xl border border-slate-700/50 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/20 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{completedCount}</p>
                <p className="text-xs text-slate-400">Completed</p>
              </div>
            </div>
          </div>
          <div className="bg-slate-900/50 rounded-xl border border-slate-700/50 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Sparkles className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{aiCount}</p>
                <p className="text-xs text-slate-400">AI Recommended</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs & Filters */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
            <TabsList className="bg-slate-900/50 border border-slate-700">
              <TabsTrigger value="scheduled" className="data-[state=active]:bg-blue-600">
                Scheduled ({scheduledCount})
              </TabsTrigger>
              <TabsTrigger value="overdue" className="data-[state=active]:bg-blue-600">
                Overdue ({overdueCount})
              </TabsTrigger>
              <TabsTrigger value="completed" className="data-[state=active]:bg-blue-600">
                Completed ({completedCount})
              </TabsTrigger>
              <TabsTrigger value="all" className="data-[state=active]:bg-blue-600">
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
                className="pl-10 w-56 bg-slate-900/50 border-slate-700 text-white"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-36 bg-slate-900/50 border-slate-700">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="all">All Types</SelectItem>
                {TASK_TYPES.map(type => (
                  <SelectItem key={type} value={type} className="capitalize">
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="w-36 bg-slate-900/50 border-slate-700">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
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
            <Wrench className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-400">No tasks found</h3>
            <p className="text-sm text-slate-500">Create a new task or generate AI recommendations</p>
          </div>
        )}
      </div>
    </div>
  );
}