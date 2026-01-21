import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { 
  Package, Search, Plus, AlertTriangle, TrendingUp, DollarSign,
  Filter, ShoppingCart, Truck, BarChart3, ChevronRight
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const CATEGORIES = ['bearing', 'seal', 'filter', 'belt', 'motor', 'sensor', 'valve', 'electrical', 'hydraulic', 'pneumatic', 'structural', 'consumable', 'other'];

export default function SparePartsInventory({ workOrders = [], maintenanceTasks = [] }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedPart, setSelectedPart] = useState(null);
  const [newPart, setNewPart] = useState({
    part_number: '',
    name: '',
    category: 'other',
    quantity_in_stock: 0,
    minimum_stock_level: 5,
    unit_cost: 0,
    lead_time_days: 7,
    supplier: '',
    location: '',
    criticality: 'medium'
  });

  const queryClient = useQueryClient();

  const { data: parts = [], isLoading } = useQuery({
    queryKey: ['spareParts'],
    queryFn: () => base44.entities.SparePart.list('-created_date', 200),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.SparePart.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['spareParts']);
      setIsAddDialogOpen(false);
      setNewPart({
        part_number: '',
        name: '',
        category: 'other',
        quantity_in_stock: 0,
        minimum_stock_level: 5,
        unit_cost: 0,
        lead_time_days: 7,
        supplier: '',
        location: '',
        criticality: 'medium'
      });
    },
  });

  const getStatusConfig = (part) => {
    if (part.quantity_in_stock === 0) return { status: 'out_of_stock', color: 'bg-rose-50 text-rose-700 border-rose-200', label: 'Out of Stock' };
    if (part.quantity_in_stock <= part.minimum_stock_level) return { status: 'low_stock', color: 'bg-amber-50 text-amber-700 border-amber-200', label: 'Low Stock' };
    return { status: 'in_stock', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'In Stock' };
  };

  const filteredParts = parts.filter(p => {
    const matchesSearch = !searchQuery || 
      p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.part_number?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || p.category === filterCategory;
    const statusConfig = getStatusConfig(p);
    const matchesStatus = filterStatus === 'all' || statusConfig.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Calculate inventory metrics
  const totalValue = parts.reduce((sum, p) => sum + ((p.quantity_in_stock || 0) * (p.unit_cost || 0)), 0);
  const lowStockCount = parts.filter(p => getStatusConfig(p).status === 'low_stock').length;
  const outOfStockCount = parts.filter(p => getStatusConfig(p).status === 'out_of_stock').length;
  const criticalParts = parts.filter(p => p.criticality === 'critical' && getStatusConfig(p).status !== 'in_stock').length;

  // Predict demand based on upcoming tasks
  const predictedDemand = parts.map(part => {
    const upcomingUsage = workOrders
      .filter(wo => wo.status !== 'completed' && wo.status !== 'closed')
      .reduce((sum, wo) => {
        const partUsed = wo.parts_used?.find(p => p.part_number === part.part_number);
        return sum + (partUsed?.quantity || 0);
      }, 0);
    return { ...part, predictedDemand: upcomingUsage + (part.average_monthly_usage || 0) };
  }).filter(p => p.predictedDemand > 0).sort((a, b) => b.predictedDemand - a.predictedDemand).slice(0, 10);

  // Category distribution for chart
  const categoryDistribution = CATEGORIES.map(cat => ({
    category: cat.charAt(0).toUpperCase() + cat.slice(1),
    count: parts.filter(p => p.category === cat).length,
    value: parts.filter(p => p.category === cat).reduce((sum, p) => sum + ((p.quantity_in_stock || 0) * (p.unit_cost || 0)), 0)
  })).filter(c => c.count > 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
            <Package className="w-6 h-6 text-indigo-600" />
            Spare Parts Inventory
          </h2>
          <p className="text-sm text-slate-500">{parts.length} parts tracked • ${totalValue.toLocaleString()} total value</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-indigo-600 hover:bg-indigo-700">
              <Plus className="w-4 h-4 mr-2" /> Add Part
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white border-slate-200 max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add Spare Part</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="space-y-2">
                <Label>Part Number *</Label>
                <Input
                  value={newPart.part_number}
                  onChange={(e) => setNewPart({ ...newPart, part_number: e.target.value })}
                  placeholder="e.g., BRG-001"
                  className="bg-white border-slate-200"
                />
              </div>
              <div className="space-y-2">
                <Label>Name *</Label>
                <Input
                  value={newPart.name}
                  onChange={(e) => setNewPart({ ...newPart, name: e.target.value })}
                  placeholder="Part name"
                  className="bg-white border-slate-200"
                />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={newPart.category} onValueChange={(v) => setNewPart({ ...newPart, category: v })}>
                  <SelectTrigger className="bg-white border-slate-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-slate-200">
                    {CATEGORIES.map(cat => (
                      <SelectItem key={cat} value={cat} className="capitalize">{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Quantity in Stock</Label>
                <Input
                  type="number"
                  value={newPart.quantity_in_stock}
                  onChange={(e) => setNewPart({ ...newPart, quantity_in_stock: Number(e.target.value) })}
                  className="bg-white border-slate-200"
                />
              </div>
              <div className="space-y-2">
                <Label>Minimum Stock Level</Label>
                <Input
                  type="number"
                  value={newPart.minimum_stock_level}
                  onChange={(e) => setNewPart({ ...newPart, minimum_stock_level: Number(e.target.value) })}
                  className="bg-white border-slate-200"
                />
              </div>
              <div className="space-y-2">
                <Label>Unit Cost ($)</Label>
                <Input
                  type="number"
                  value={newPart.unit_cost}
                  onChange={(e) => setNewPart({ ...newPart, unit_cost: Number(e.target.value) })}
                  className="bg-white border-slate-200"
                />
              </div>
              <div className="space-y-2">
                <Label>Lead Time (days)</Label>
                <Input
                  type="number"
                  value={newPart.lead_time_days}
                  onChange={(e) => setNewPart({ ...newPart, lead_time_days: Number(e.target.value) })}
                  className="bg-white border-slate-200"
                />
              </div>
              <div className="space-y-2">
                <Label>Supplier</Label>
                <Input
                  value={newPart.supplier}
                  onChange={(e) => setNewPart({ ...newPart, supplier: e.target.value })}
                  placeholder="Supplier name"
                  className="bg-white border-slate-200"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
              <Button 
                onClick={() => createMutation.mutate(newPart)}
                disabled={!newPart.part_number || !newPart.name}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                Add Part
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Package className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-slate-900">{parts.length}</p>
              <p className="text-xs text-slate-500">Total Parts</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-amber-600">{lowStockCount}</p>
              <p className="text-xs text-slate-500">Low Stock</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-100 rounded-lg">
              <ShoppingCart className="w-5 h-5 text-rose-600" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-rose-600">{outOfStockCount}</p>
              <p className="text-xs text-slate-500">Out of Stock</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-emerald-600">${(totalValue / 1000).toFixed(1)}k</p>
              <p className="text-xs text-slate-500">Inventory Value</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Inventory List */}
        <div className="lg:col-span-2 space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Search parts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white border-slate-200"
              />
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-36 bg-white border-slate-200">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent className="bg-white border-slate-200">
                <SelectItem value="all">All Categories</SelectItem>
                {CATEGORIES.map(cat => (
                  <SelectItem key={cat} value={cat} className="capitalize">{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-36 bg-white border-slate-200">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-white border-slate-200">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="in_stock">In Stock</SelectItem>
                <SelectItem value="low_stock">Low Stock</SelectItem>
                <SelectItem value="out_of_stock">Out of Stock</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Parts Grid */}
          <div className="space-y-3">
            {filteredParts.map((part, idx) => {
              const statusConfig = getStatusConfig(part);
              const stockPercentage = part.minimum_stock_level > 0 
                ? Math.min(100, ((part.quantity_in_stock || 0) / part.minimum_stock_level) * 100)
                : 100;
              
              return (
                <motion.div
                  key={part.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.02 }}
                  className="bg-white rounded-xl border border-slate-200 p-4 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer"
                  onClick={() => setSelectedPart(part)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono text-slate-400">{part.part_number}</span>
                        <Badge className={statusConfig.color}>{statusConfig.label}</Badge>
                        {part.criticality === 'critical' && (
                          <Badge className="bg-rose-50 text-rose-700 border-rose-200">Critical</Badge>
                        )}
                      </div>
                      <h4 className="font-medium text-slate-900">{part.name}</h4>
                      <p className="text-sm text-slate-500 capitalize">{part.category} • {part.supplier || 'No supplier'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-slate-900">{part.quantity_in_stock || 0}</p>
                      <p className="text-xs text-slate-500">in stock</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="flex justify-between text-xs text-slate-500 mb-1">
                        <span>Stock Level</span>
                        <span>Min: {part.minimum_stock_level || 0}</span>
                      </div>
                      <Progress value={stockPercentage} className="h-1.5" />
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-slate-700">${(part.unit_cost || 0).toFixed(2)}</p>
                      <p className="text-xs text-slate-400">per unit</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Predicted Demand */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <h3 className="font-medium text-slate-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-violet-600" />
              Predicted Demand
            </h3>
            {predictedDemand.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4">No demand predicted</p>
            ) : (
              <div className="space-y-3">
                {predictedDemand.slice(0, 5).map(part => (
                  <div key={part.id} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-slate-700">{part.name}</p>
                      <p className="text-xs text-slate-500">{part.quantity_in_stock} in stock</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-violet-600">+{part.predictedDemand}</p>
                      <p className="text-xs text-slate-400">needed</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Category Distribution */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <h3 className="font-medium text-slate-900 mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-600" />
              Category Distribution
            </h3>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryDistribution} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis type="number" stroke="#64748b" tick={{ fontSize: 10 }} />
                  <YAxis dataKey="category" type="category" stroke="#64748b" tick={{ fontSize: 10 }} width={70} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#6366f1" name="Parts" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Reorder Alerts */}
          {(lowStockCount > 0 || outOfStockCount > 0) && (
            <div className="bg-amber-50 rounded-xl border border-amber-200 p-5">
              <h3 className="font-medium text-amber-800 mb-3 flex items-center gap-2">
                <Truck className="w-5 h-5" />
                Reorder Required
              </h3>
              <div className="space-y-2">
                {parts.filter(p => getStatusConfig(p).status !== 'in_stock').slice(0, 5).map(part => (
                  <div key={part.id} className="flex items-center justify-between text-sm">
                    <span className="text-amber-700">{part.name}</span>
                    <Badge className={getStatusConfig(part).color}>
                      {part.quantity_in_stock || 0} left
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}