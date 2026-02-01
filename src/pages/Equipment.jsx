import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Search, Filter, Grid3X3, List, Layers,
  Cpu, Activity, MapPin, AlertTriangle, X
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from 'date-fns';
import EquipmentCard from '@/components/dashboard/EquipmentCard';
import EquipmentDetails from '@/components/equipment/EquipmentDetails';
import EquipmentForm from '@/components/equipment/EquipmentForm';
import EquipmentStats from '@/components/equipment/EquipmentStats';
import AssetHierarchy from '@/components/equipment/AssetHierarchy';
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
  const [filterLocation, setFilterLocation] = useState('all');
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState(null);
  const [recentUpdates, setRecentUpdates] = useState([]);
  const [groupBy, setGroupBy] = useState('location');

  const queryClient = useQueryClient();
  
  // Get equipment ID from URL params
  const urlParams = new URLSearchParams(window.location.search);
  const equipmentIdFromUrl = urlParams.get('id');

  const { data: equipment = [], isLoading } = useQuery({
    queryKey: ['equipment'],
    queryFn: () => base44.entities.Equipment.list('-created_date', 200),
  });

  // Auto-select equipment from URL param
  useEffect(() => {
    if (equipmentIdFromUrl && equipment.length > 0 && !selectedEquipment) {
      const eq = equipment.find(e => e.id === equipmentIdFromUrl);
      if (eq) {
        setSelectedEquipment(eq);
      }
    }
  }, [equipmentIdFromUrl, equipment, selectedEquipment]);

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
      setIsFormOpen(false);
      setEditingEquipment(null);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Equipment.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['equipment']);
      setIsFormOpen(false);
      setEditingEquipment(null);
      setSelectedEquipment(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Equipment.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['equipment']);
      setSelectedEquipment(null);
    },
  });

  // Get unique locations for filter
  const uniqueLocations = [...new Set(equipment.map(e => e.location).filter(Boolean))];

  const filteredEquipment = equipment.filter(e => {
    const matchesSearch = !searchQuery || 
      e.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.manufacturer?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.serial_number?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || e.type === filterType;
    const matchesStatus = filterStatus === 'all' || e.status === filterStatus;
    const matchesRisk = filterRisk === 'all' || e.risk_level === filterRisk;
    const matchesLocation = filterLocation === 'all' || e.location === filterLocation;
    return matchesSearch && matchesType && matchesStatus && matchesRisk && matchesLocation;
  });

  const handleSaveEquipment = (data) => {
    if (editingEquipment?.id) {
      updateMutation.mutate({ id: editingEquipment.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEditFromDetails = (eq) => {
    setEditingEquipment(eq);
    setIsFormOpen(true);
  };

  const handleDeleteEquipment = (id) => {
    deleteMutation.mutate(id);
  };

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
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Equipment Management</h1>
            <p className="text-sm text-slate-500">{equipment.length} total assets registered</p>
          </div>
          <Button 
            onClick={() => { setEditingEquipment(null); setIsFormOpen(true); }}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Equipment
          </Button>
        </div>

        {/* Stats */}
        <div className="mb-6">
          <EquipmentStats equipment={equipment} />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-6 p-4 bg-white rounded-xl border border-slate-200">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search name, type, location, serial..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-slate-50 border-slate-200 text-slate-900"
            />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-36 bg-slate-50 border-slate-200">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent className="bg-white border-slate-200 max-h-60">
              <SelectItem value="all">All Types</SelectItem>
              {EQUIPMENT_TYPES.map(type => (
                <SelectItem key={type} value={type} className="capitalize">
                  {type.replace(/_/g, ' ')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterLocation} onValueChange={setFilterLocation}>
            <SelectTrigger className="w-44 bg-slate-50 border-slate-200">
              <SelectValue placeholder="Location" />
            </SelectTrigger>
            <SelectContent className="bg-white border-slate-200 max-h-60">
              <SelectItem value="all">All Locations</SelectItem>
              {uniqueLocations.map(loc => (
                <SelectItem key={loc} value={loc}>{loc}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-36 bg-slate-50 border-slate-200">
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
            <SelectTrigger className="w-32 bg-slate-50 border-slate-200">
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
          
          {(searchQuery || filterType !== 'all' || filterStatus !== 'all' || filterRisk !== 'all' || filterLocation !== 'all') && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => {
                setSearchQuery('');
                setFilterType('all');
                setFilterStatus('all');
                setFilterRisk('all');
                setFilterLocation('all');
              }}
              className="text-slate-500 hover:text-slate-700"
            >
              <X className="w-4 h-4 mr-1" />
              Clear
            </Button>
          )}

          <div className="flex items-center gap-1 ml-auto border-l border-slate-200 pl-3">
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
            <Button
              variant={viewMode === 'hierarchy' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('hierarchy')}
              className={viewMode === 'hierarchy' ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-white border-slate-200 text-slate-600'}
            >
              <Layers className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Results count */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-slate-500">
            Showing {filteredEquipment.length} of {equipment.length} equipment
          </p>
          {viewMode === 'hierarchy' && (
            <Select value={groupBy} onValueChange={setGroupBy}>
              <SelectTrigger className="w-40 bg-white border-slate-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white border-slate-200">
                <SelectItem value="location">Group by Location</SelectItem>
                <SelectItem value="type">Group by Type</SelectItem>
                <SelectItem value="status">Group by Status</SelectItem>
                <SelectItem value="criticality">Group by Criticality</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Equipment Grid/List/Hierarchy */}
        {viewMode === 'hierarchy' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <AssetHierarchy
                equipment={filteredEquipment}
                groupBy={groupBy}
                onSelectEquipment={setSelectedEquipment}
                selectedId={selectedEquipment?.id}
              />
            </div>
            <div className="lg:col-span-2">
              {selectedEquipment ? (
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-slate-900">{selectedEquipment.name}</h3>
                      <p className="text-sm text-slate-500">{selectedEquipment.type?.replace(/_/g, ' ')} • {selectedEquipment.location}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEditFromDetails(selectedEquipment)}>
                        Edit
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-rose-600 border-rose-200 hover:bg-rose-50"
                        onClick={() => handleDeleteEquipment(selectedEquipment.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <p className="text-xs text-slate-500">Health Score</p>
                      <p className="text-xl font-bold text-slate-900">{selectedEquipment.health_score || 0}%</p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <p className="text-xs text-slate-500">Status</p>
                      <p className="text-xl font-bold capitalize text-slate-900">{selectedEquipment.status}</p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <p className="text-xs text-slate-500">Risk Level</p>
                      <p className="text-xl font-bold capitalize text-slate-900">{selectedEquipment.risk_level || 'low'}</p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <p className="text-xs text-slate-500">RUL</p>
                      <p className="text-xl font-bold text-slate-900">{selectedEquipment.remaining_useful_life_days || 'N/A'} days</p>
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                    <div><span className="text-slate-500">Manufacturer:</span> <span className="text-slate-900">{selectedEquipment.manufacturer || 'N/A'}</span></div>
                    <div><span className="text-slate-500">Model:</span> <span className="text-slate-900">{selectedEquipment.model || 'N/A'}</span></div>
                    <div><span className="text-slate-500">Serial:</span> <span className="text-slate-900">{selectedEquipment.serial_number || 'N/A'}</span></div>
                    <div><span className="text-slate-500">Installed:</span> <span className="text-slate-900">{selectedEquipment.installation_date ? format(new Date(selectedEquipment.installation_date), 'MMM d, yyyy') : 'N/A'}</span></div>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-50 rounded-xl border border-dashed border-slate-300 p-12 text-center">
                  <Cpu className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500">Select an asset from the hierarchy to view details</p>
                </div>
              )}
            </div>
          </div>
        ) : viewMode === 'grid' ? (
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
        {selectedEquipment && viewMode !== 'hierarchy' && (
          <EquipmentDetails
            equipment={selectedEquipment}
            readings={sensorReadings}
            onClose={() => setSelectedEquipment(null)}
            onEdit={handleEditFromDetails}
            onDelete={handleDeleteEquipment}
          />
        )}
      </AnimatePresence>

      <EquipmentForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        equipment={editingEquipment}
        onSave={handleSaveEquipment}
        isSaving={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
}