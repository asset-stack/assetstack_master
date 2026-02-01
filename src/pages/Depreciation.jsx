import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingDown, Plus, Search, FileText, Calculator, 
  DollarSign, Building, Loader2, BarChart3 
} from 'lucide-react';

import DepreciationCalculator from '../components/depreciation/DepreciationCalculator';
import DepreciationCard from '../components/depreciation/DepreciationCard';
import DepreciationScheduleChart from '../components/depreciation/DepreciationScheduleChart';
import DepreciationReportGenerator from '../components/depreciation/DepreciationReportGenerator';

export default function Depreciation() {
  const [searchQuery, setSearchQuery] = useState('');
  const [methodFilter, setMethodFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCalculator, setShowCalculator] = useState(false);
  const [showReportGenerator, setShowReportGenerator] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [editingRecord, setEditingRecord] = useState(null);
  const [viewingSchedule, setViewingSchedule] = useState(null);
  
  const queryClient = useQueryClient();
  
  const { data: depreciationRecords = [], isLoading: loadingRecords } = useQuery({
    queryKey: ['depreciation'],
    queryFn: () => base44.entities.AssetDepreciation.list()
  });
  
  const { data: equipment = [], isLoading: loadingEquipment } = useQuery({
    queryKey: ['equipment'],
    queryFn: () => base44.entities.Equipment.list()
  });
  
  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.AssetDepreciation.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['depreciation'] })
  });
  
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.AssetDepreciation.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['depreciation'] })
  });
  
  // Equipment without depreciation records
  const equipmentWithoutDepreciation = equipment.filter(
    eq => !depreciationRecords.some(dr => dr.equipment_id === eq.id)
  );
  
  // Filter records
  const filteredRecords = depreciationRecords.filter(record => {
    const matchesSearch = record.equipment_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMethod = methodFilter === 'all' || record.depreciation_method === methodFilter;
    const matchesStatus = statusFilter === 'all' || record.status === statusFilter;
    return matchesSearch && matchesMethod && matchesStatus;
  });
  
  // Calculate totals
  const totals = {
    totalAssets: depreciationRecords.length,
    totalAcquisitionCost: depreciationRecords.reduce((sum, r) => sum + (r.acquisition_cost || 0), 0),
    totalBookValue: depreciationRecords.reduce((sum, r) => sum + (r.current_book_value || 0), 0),
    totalAnnualDepreciation: depreciationRecords.reduce((sum, r) => sum + (r.annual_depreciation || 0), 0),
    totalAccumulated: depreciationRecords.reduce((sum, r) => sum + (r.accumulated_depreciation || 0), 0)
  };
  
  const handleSaveDepreciation = async (data, existingId) => {
    if (existingId) {
      await updateMutation.mutateAsync({ id: existingId, data });
    } else {
      await createMutation.mutateAsync(data);
    }
  };
  
  const handleAddNew = (eq) => {
    setSelectedEquipment(eq);
    setEditingRecord(null);
    setShowCalculator(true);
  };
  
  const handleEdit = (record) => {
    setEditingRecord(record);
    setSelectedEquipment(equipment.find(e => e.id === record.equipment_id));
    setShowCalculator(true);
  };
  
  if (loadingRecords || loadingEquipment) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }
  
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <TrendingDown className="w-7 h-7 text-indigo-600" />
            Asset Depreciation
          </h1>
          <p className="text-slate-500 mt-1">Manage depreciation calculations and track asset values</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowReportGenerator(true)}>
            <FileText className="w-4 h-4 mr-2" />
            Generate Report
          </Button>
        </div>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Building className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Total Assets</p>
                <p className="text-xl font-bold">{totals.totalAssets}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Acquisition Cost</p>
                <p className="text-xl font-bold">${(totals.totalAcquisitionCost / 1000).toFixed(0)}k</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BarChart3 className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Book Value</p>
                <p className="text-xl font-bold">${(totals.totalBookValue / 1000).toFixed(0)}k</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <TrendingDown className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Annual Depreciation</p>
                <p className="text-xl font-bold">${(totals.totalAnnualDepreciation / 1000).toFixed(0)}k</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <Calculator className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Accumulated</p>
                <p className="text-xl font-bold">${(totals.totalAccumulated / 1000).toFixed(0)}k</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="configured" className="space-y-4">
        <TabsList>
          <TabsTrigger value="configured">Configured Assets ({depreciationRecords.length})</TabsTrigger>
          <TabsTrigger value="unconfigured">Unconfigured ({equipmentWithoutDepreciation.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="configured" className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search assets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={methodFilter} onValueChange={setMethodFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Methods</SelectItem>
                <SelectItem value="straight_line">Straight-Line</SelectItem>
                <SelectItem value="declining_balance">Declining Balance</SelectItem>
                <SelectItem value="double_declining">Double Declining</SelectItem>
                <SelectItem value="sum_of_years">Sum-of-Years</SelectItem>
                <SelectItem value="units_of_production">Units of Production</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="fully_depreciated">Fully Depreciated</SelectItem>
                <SelectItem value="disposed">Disposed</SelectItem>
                <SelectItem value="impaired">Impaired</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Records Grid */}
          {filteredRecords.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <TrendingDown className="w-12 h-12 mx-auto text-slate-300 mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">No depreciation records</h3>
                <p className="text-slate-500 mb-4">Configure depreciation for your assets to track their value over time.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredRecords.map(record => (
                <DepreciationCard
                  key={record.id}
                  record={record}
                  onEdit={handleEdit}
                  onViewSchedule={setViewingSchedule}
                />
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="unconfigured" className="space-y-4">
          {equipmentWithoutDepreciation.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Calculator className="w-12 h-12 mx-auto text-green-300 mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">All assets configured!</h3>
                <p className="text-slate-500">All your equipment has depreciation settings configured.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {equipmentWithoutDepreciation.map(eq => (
                <Card key={eq.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-slate-900">{eq.name}</h3>
                        <p className="text-sm text-slate-500 capitalize">{eq.type?.replace('_', ' ')}</p>
                        <p className="text-xs text-slate-400 mt-1">{eq.location}</p>
                      </div>
                      <Button size="sm" onClick={() => handleAddNew(eq)}>
                        <Plus className="w-4 h-4 mr-1" />
                        Configure
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      {/* Calculator Dialog */}
      {showCalculator && (
        <DepreciationCalculator
          open={showCalculator}
          onClose={() => {
            setShowCalculator(false);
            setSelectedEquipment(null);
            setEditingRecord(null);
          }}
          equipment={selectedEquipment}
          existingRecord={editingRecord}
          onSave={handleSaveDepreciation}
        />
      )}
      
      {/* Schedule Viewer Dialog */}
      {viewingSchedule && (
        <Dialog open={!!viewingSchedule} onOpenChange={() => setViewingSchedule(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Depreciation Schedule - {viewingSchedule.equipment_name}</DialogTitle>
            </DialogHeader>
            <DepreciationScheduleChart
              schedule={viewingSchedule.depreciation_schedule}
              acquisitionCost={viewingSchedule.acquisition_cost}
              salvageValue={viewingSchedule.salvage_value}
            />
          </DialogContent>
        </Dialog>
      )}
      
      {/* Report Generator */}
      {showReportGenerator && (
        <DepreciationReportGenerator
          open={showReportGenerator}
          onClose={() => setShowReportGenerator(false)}
          depreciationRecords={depreciationRecords}
          equipment={equipment}
        />
      )}
    </div>
  );
}