import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Plus, FileText, Clock, DollarSign, CheckCircle2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import WorkOrderCard from './WorkOrderCard';
import WorkOrderDetails from './WorkOrderDetails';

const STATUSES = ['draft', 'open', 'assigned', 'in_progress', 'on_hold', 'completed', 'closed', 'cancelled'];

export default function WorkOrderList({ 
  workOrders = [], 
  equipment = [], 
  onCreateWorkOrder, 
  onUpdateWorkOrder,
  onStatusChange 
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [activeTab, setActiveTab] = useState('active');
  const [selectedWorkOrder, setSelectedWorkOrder] = useState(null);
  const [isCreating, setIsCreating] = useState(false);

  const equipmentMap = equipment.reduce((acc, e) => { acc[e.id] = e; return acc; }, {});

  const filteredWorkOrders = workOrders
    .filter(wo => {
      const matchesSearch = !searchQuery || 
        wo.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        wo.work_order_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        equipmentMap[wo.equipment_id]?.name?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = filterStatus === 'all' || wo.status === filterStatus;
      const matchesPriority = filterPriority === 'all' || wo.priority === filterPriority;
      const matchesTab = 
        (activeTab === 'active' && !['completed', 'closed', 'cancelled'].includes(wo.status)) ||
        (activeTab === 'completed' && wo.status === 'completed') ||
        (activeTab === 'closed' && (wo.status === 'closed' || wo.status === 'cancelled')) ||
        (activeTab === 'all');
      return matchesSearch && matchesStatus && matchesPriority && matchesTab;
    })
    .sort((a, b) => {
      const priorityOrder = { urgent: 1, high: 2, medium: 3, low: 4 };
      return (priorityOrder[a.priority] || 5) - (priorityOrder[b.priority] || 5);
    });

  const activeCount = workOrders.filter(wo => !['completed', 'closed', 'cancelled'].includes(wo.status)).length;
  const completedCount = workOrders.filter(wo => wo.status === 'completed').length;
  const closedCount = workOrders.filter(wo => wo.status === 'closed' || wo.status === 'cancelled').length;

  const totalCost = workOrders.reduce((sum, wo) => sum + (wo.actual_total_cost || 0), 0);
  const totalHours = workOrders.reduce((sum, wo) => {
    const laborHours = wo.labor_entries?.reduce((s, e) => s + (e.hours || 0), 0) || 0;
    return sum + laborHours;
  }, 0);

  const handleSaveWorkOrder = (workOrderData) => {
    if (isCreating) {
      // Generate work order number
      const woNumber = `WO-${Date.now().toString().slice(-8)}`;
      const newWorkOrder = {
        ...workOrderData,
        work_order_number: woNumber,
        history: [{
          timestamp: new Date().toISOString(),
          action: 'Work Order Created',
          user: 'Current User',
          details: 'Work order was created'
        }]
      };
      onCreateWorkOrder && onCreateWorkOrder(newWorkOrder);
      setIsCreating(false);
    } else {
      onUpdateWorkOrder && onUpdateWorkOrder(workOrderData);
      setSelectedWorkOrder(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <FileText className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-slate-900">{workOrders.length}</p>
              <p className="text-xs text-slate-500">Total Work Orders</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-violet-100 rounded-lg">
              <Clock className="w-5 h-5 text-violet-600" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-slate-900">{totalHours}h</p>
              <p className="text-xs text-slate-500">Total Labor Hours</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-slate-900">${totalCost.toLocaleString()}</p>
              <p className="text-xs text-slate-500">Total Cost</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-slate-900">{completedCount}</p>
              <p className="text-xs text-slate-500">Completed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs & Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
          <TabsList className="bg-white border border-slate-200">
            <TabsTrigger value="active" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
              Active ({activeCount})
            </TabsTrigger>
            <TabsTrigger value="completed" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
              Completed ({completedCount})
            </TabsTrigger>
            <TabsTrigger value="closed" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
              Closed ({closedCount})
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
              placeholder="Search work orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-56 bg-white border-slate-200"
            />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-36 bg-white border-slate-200">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="bg-white border-slate-200">
              <SelectItem value="all">All Statuses</SelectItem>
              {STATUSES.map(s => (
                <SelectItem key={s} value={s} className="capitalize">{s.replace('_', ' ')}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={() => setIsCreating(true)} className="bg-indigo-600 hover:bg-indigo-700">
            <Plus className="w-4 h-4 mr-2" />
            New Work Order
          </Button>
        </div>
      </div>

      {/* Work Orders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {filteredWorkOrders.map((wo, idx) => (
            <WorkOrderCard
              key={wo.id}
              workOrder={wo}
              equipment={equipmentMap[wo.equipment_id]}
              onViewDetails={setSelectedWorkOrder}
              delay={idx * 0.03}
            />
          ))}
        </AnimatePresence>
      </div>

      {filteredWorkOrders.length === 0 && (
        <div className="text-center py-16">
          <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-600">No work orders found</h3>
          <p className="text-sm text-slate-400">Create a new work order to get started</p>
        </div>
      )}

      {/* Work Order Details Modal */}
      <AnimatePresence>
        {(selectedWorkOrder || isCreating) && (
          <WorkOrderDetails
            workOrder={selectedWorkOrder}
            equipment={equipment}
            onClose={() => { setSelectedWorkOrder(null); setIsCreating(false); }}
            onSave={handleSaveWorkOrder}
            onStatusChange={onStatusChange}
            isNew={isCreating}
          />
        )}
      </AnimatePresence>
    </div>
  );
}