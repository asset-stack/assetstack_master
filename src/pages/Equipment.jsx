import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Search, Filter, Grid3X3, List, Download, Upload, 
  Cpu, Activity, MapPin, AlertTriangle, X
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from 'date-fns';
import EquipmentCard from '@/components/dashboard/EquipmentCard';
import EquipmentDetails from '@/components/equipment/EquipmentDetails';
import HealthGauge from '@/components/dashboard/HealthGauge';

const EQUIPMENT_TYPES = [
  'motor', 'pump', 'compressor', 'turbine', 'conveyor', 
  'hvac', 'generator', 'transformer', 'valve', 'heat_exchanger',
  'railway_track', 'railway_switch', 'railway_signal',
  'bridge', 'building', 'tunnel', 'dam', 'power_line',
  'wind_turbine', 'elevator', 'escalator', 'hvac_system',
  'fire_suppression', 'water_treatment', 'road_surface',
  'retaining_wall', 'parking_structure'
];

export default function Equipment() {
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterRisk, setFilterRisk] = useState('all');
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [recentUpdates, setRecentUpdates] = useState([]);
  const [newEquipment, setNewEquipment] = useState({
    name: '',
    type: 'motor',
    location: '',
    manufacturer: '',
    model: '',
    serial_number: '',
    installation_date: '',
    criticality: 'medium',
    health_score: 100,
    status: 'operational',
    risk_level: 'low'
  });

  const queryClient = useQueryClient();

  const { data: equipment = [], isLoading } = useQuery({
    queryKey: ['equipment'],
    queryFn: () => base44.entities.Equipment.list('-created_date', 200),
  });

  // Real-time subscription
  useEffect(() => {
    const unsubscribe = base44.entities.Equipment.subscribe((event) => {
      queryClient.invalidateQueries(['equipment']);
      setRecentUpdates(prev => {
        const newUpdate = { id: event.id, type: event.type, timestamp: Date.now() };
        return [newUpdate, ...prev.slice(0, 19)];
      });
      
      // Auto-remove update indicator after 3 seconds
      setTimeout(() => {
        setRecentUpdates(prev => prev.filter(u => u.id !== event.id || Date.now() - u.timestamp > 3000));
      }, 3000);
    });

    return unsubscribe;
  }, [queryClient]);

  const { data: sensorReadings = [] } = useQuery({
    queryKey: ['sensorReadings', selectedEquipment?.id],
    queryFn: () => selectedEquipment 
      ? base44.entities.SensorReading.filter({ equipment_id: selectedEquipment.id }, '-created_date', 100)
      : [],
    enabled: !!selectedEquipment,
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Equipment.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['equipment']);
      setIsAddDialogOpen(false);
      setNewEquipment({
        name: '',
        type: 'motor',
        location: '',
        manufacturer: '',
        model: '',
        serial_number: '',
        installation_date: '',
        criticality: 'medium',
        health_score: 100,
        status: 'operational',
        risk_level: 'low'
      });
    },
  });

  const filteredEquipment = equipment.filter(e => {
    const matchesSearch = !searchQuery || 
      e.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.location?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || e.type === filterType;
    const matchesStatus = filterStatus === 'all' || e.status === filterStatus;
    const matchesRisk = filterRisk === 'all' || e.risk_level === filterRisk;
    return matchesSearch && matchesType && matchesStatus && matchesRisk;
  });

  const getStatusColor = (status) => {
    const colors = {
      operational: 'bg-emerald-500',
      degraded: 'bg-amber-500',
      critical: 'bg-rose-500',
      maintenance: 'bg-blue-500',
      offline: 'bg-slate-500'
    };
    return colors[status] || colors.offline;
  };

  const getRiskBadge = (risk) => {
    const configs = {
      low: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      medium: 'bg-amber-50 text-amber-700 border-amber-200',
      high: 'bg-orange-50 text-orange-700 border-orange-200',
      critical: 'bg-rose-50 text-rose-700 border-rose-200'
    };
    return configs[risk] || configs.low;
  };

  return (
    <div className="min-h-screen bg-gray-50 text-slate-900">
      <div className="max-w-[1800px] mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Equipment Management</h1>
            <p className="text-sm text-slate-500">{equipment.length} total assets registered</p>
          </div>
          <div className="flex items-center gap-3">
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-indigo-600 hover:bg-indigo-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Equipment
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-white border-slate-200 text-slate-900 max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add New Equipment</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="space-y-2">
                    <Label className="text-slate-700">Name *</Label>
                    <Input
                      value={newEquipment.name}
                      onChange={(e) => setNewEquipment({ ...newEquipment, name: e.target.value })}
                      placeholder="Equipment name"
                      className="bg-white border-slate-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-700">Type *</Label>
                    <Select value={newEquipment.type} onValueChange={(v) => setNewEquipment({ ...newEquipment, type: v })}>
                      <SelectTrigger className="bg-white border-slate-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-slate-200">
                        {EQUIPMENT_TYPES.map(type => (
                          <SelectItem key={type} value={type} className="capitalize">
                            {type.replace(/_/g, ' ')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-700">Location *</Label>
                    <Input
                      value={newEquipment.location}
                      onChange={(e) => setNewEquipment({ ...newEquipment, location: e.target.value })}
                      placeholder="Building/Zone"
                      className="bg-white border-slate-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-700">Manufacturer</Label>
                    <Input
                      value={newEquipment.manufacturer}
                      onChange={(e) => setNewEquipment({ ...newEquipment, manufacturer: e.target.value })}
                      placeholder="Manufacturer"
                      className="bg-white border-slate-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-700">Model</Label>
                    <Input
                      value={newEquipment.model}
                      onChange={(e) => setNewEquipment({ ...newEquipment, model: e.target.value })}
                      placeholder="Model number"
                      className="bg-white border-slate-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-700">Serial Number</Label>
                    <Input
                      value={newEquipment.serial_number}
                      onChange={(e) => setNewEquipment({ ...newEquipment, serial_number: e.target.value })}
                      placeholder="Serial number"
                      className="bg-white border-slate-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-700">Installation Date</Label>
                    <Input
                      type="date"
                      value={newEquipment.installation_date}
                      onChange={(e) => setNewEquipment({ ...newEquipment, installation_date: e.target.value })}
                      className="bg-white border-slate-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-700">Criticality</Label>
                    <Select value={newEquipment.criticality} onValueChange={(v) => setNewEquipment({ ...newEquipment, criticality: v })}>
                      <SelectTrigger className="bg-white border-slate-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-slate-200">
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="mission_critical">Mission Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="border-slate-200">
                    Cancel
                  </Button>
                  <Button 
                    onClick={() => createMutation.mutate(newEquipment)}
                    disabled={!newEquipment.name || !newEquipment.location || createMutation.isPending}
                    className="bg-indigo-600 hover:bg-indigo-700"
                  >
                    Add Equipment
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search equipment..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white border-slate-200 text-slate-900"
            />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-40 bg-white border-slate-200">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent className="bg-white border-slate-200">
              <SelectItem value="all">All Types</SelectItem>
              {EQUIPMENT_TYPES.map(type => (
                <SelectItem key={type} value={type} className="capitalize">
                  {type.replace(/_/g, ' ')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-40 bg-white border-slate-200">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="bg-white border-slate-200">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="operational">Operational</SelectItem>
              <SelectItem value="degraded">Degraded</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
              <SelectItem value="offline">Offline</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterRisk} onValueChange={setFilterRisk}>
            <SelectTrigger className="w-40 bg-white border-slate-200">
              <SelectValue placeholder="Risk" />
            </SelectTrigger>
            <SelectContent className="bg-white border-slate-200">
              <SelectItem value="all">All Risk</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center gap-1 ml-auto">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('grid')}
              className={viewMode === 'grid' ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-white border-slate-200 text-slate-600'}
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('list')}
              className={viewMode === 'list' ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-white border-slate-200 text-slate-600'}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Results count */}
        <p className="text-sm text-slate-500 mb-4">
          Showing {filteredEquipment.length} of {equipment.length} equipment
        </p>

        {/* Equipment Grid/List */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredEquipment.map((eq, idx) => {
              const hasRecentUpdate = recentUpdates.some(u => u.id === eq.id && Date.now() - u.timestamp < 3000);
              return (
                <div key={eq.id} className="relative">
                  {hasRecentUpdate && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      className="absolute -top-2 -right-2 z-10 flex items-center gap-1 px-2 py-1 bg-blue-500 rounded-full shadow-lg"
                    >
                      <Activity className="w-3 h-3 text-white animate-pulse" />
                      <span className="text-xs text-white font-medium">UPDATED</span>
                    </motion.div>
                  )}
                  <EquipmentCard 
                    equipment={eq}
                    onClick={() => setSelectedEquipment(eq)}
                    delay={idx * 0.03}
                  />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-100 hover:bg-transparent bg-slate-50">
                  <TableHead className="text-slate-600 font-medium">Name</TableHead>
                  <TableHead className="text-slate-600 font-medium">Type</TableHead>
                  <TableHead className="text-slate-600 font-medium">Location</TableHead>
                  <TableHead className="text-slate-600 font-medium">Health</TableHead>
                  <TableHead className="text-slate-600 font-medium">Status</TableHead>
                  <TableHead className="text-slate-600 font-medium">Risk</TableHead>
                  <TableHead className="text-slate-600 font-medium">RUL</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEquipment.map((eq) => {
                  const hasRecentUpdate = recentUpdates.some(u => u.id === eq.id && Date.now() - u.timestamp < 3000);
                  return (
                    <TableRow 
                      key={eq.id} 
                      className={`border-slate-100 cursor-pointer hover:bg-slate-50 ${hasRecentUpdate ? 'bg-indigo-50' : ''}`}
                      onClick={() => setSelectedEquipment(eq)}
                    >
                      <TableCell className="font-medium text-slate-900">
                        <div className="flex items-center gap-2">
                          {hasRecentUpdate && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"
                            />
                          )}
                          {eq.name}
                        </div>
                      </TableCell>
                    <TableCell className="text-slate-500 capitalize">{eq.type?.replace(/_/g, ' ')}</TableCell>
                    <TableCell className="text-slate-500">{eq.location}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-8">
                          <HealthGauge score={eq.health_score || 0} size={32} label="" />
                        </div>
                        <span className="text-slate-900">{eq.health_score || 0}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${getStatusColor(eq.status)}`} />
                        <span className="text-slate-600 capitalize">{eq.status}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getRiskBadge(eq.risk_level)}>
                        {eq.risk_level || 'low'}
                      </Badge>
                    </TableCell>
                      <TableCell className="text-slate-600">
                        {eq.remaining_useful_life_days || 'N/A'} days
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}

        {filteredEquipment.length === 0 && !isLoading && (
          <div className="text-center py-16">
            <Cpu className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-600">No equipment found</h3>
            <p className="text-sm text-slate-400">Try adjusting your filters or add new equipment</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedEquipment && (
          <EquipmentDetails
            equipment={selectedEquipment}
            readings={sensorReadings}
            onClose={() => setSelectedEquipment(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}