import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { 
  ZoomIn, ZoomOut, Maximize2, Grid3X3, Layers,
  RefreshCw, Filter, MapPin
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import EquipmentHotspot from './EquipmentHotspot';
import QuickWorkOrderDialog from './QuickWorkOrderDialog';

// Generate pseudo-random but consistent positions based on equipment ID
function getEquipmentPosition(equipmentId, index, total) {
  // Use a simple hash of the ID to get consistent positions
  const hash = equipmentId?.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) || index;
  const gridCols = Math.ceil(Math.sqrt(total));
  const col = index % gridCols;
  const row = Math.floor(index / gridCols);
  
  // Add some variation based on hash
  const xOffset = ((hash % 20) - 10) / 100;
  const yOffset = (((hash * 7) % 20) - 10) / 100;
  
  const x = (col + 0.5) / gridCols * 80 + 10 + xOffset * 10;
  const y = (row + 0.5) / Math.ceil(total / gridCols) * 70 + 15 + yOffset * 10;
  
  return { x: Math.min(90, Math.max(10, x)), y: Math.min(85, Math.max(15, y)) };
}

export default function InteractiveFloorPlan({ selectedLocation, onLocationChange }) {
  const [zoom, setZoom] = useState(1);
  const [selectedEquipmentId, setSelectedEquipmentId] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [showWorkOrderDialog, setShowWorkOrderDialog] = useState(false);
  const [workOrderEquipment, setWorkOrderEquipment] = useState(null);

  const { data: equipment = [], refetch: refetchEquipment } = useQuery({
    queryKey: ['equipment'],
    queryFn: () => base44.entities.Equipment.list('-updated_date', 100),
  });

  const { data: sensorReadings = [] } = useQuery({
    queryKey: ['sensorReadings'],
    queryFn: () => base44.entities.SensorReading.list('-timestamp', 200),
  });

  const { data: maintenanceTasks = [] } = useQuery({
    queryKey: ['maintenanceTasks'],
    queryFn: () => base44.entities.MaintenanceTask.list('-created_date', 100),
  });

  // Get unique locations
  const locations = [...new Set(equipment.map(e => e.location).filter(Boolean))];

  // Filter equipment by location and status
  const filteredEquipment = equipment.filter(e => {
    const locationMatch = !selectedLocation || selectedLocation === 'all' || e.location === selectedLocation;
    const statusMatch = statusFilter === 'all' || e.status === statusFilter;
    return locationMatch && statusMatch;
  });

  // Get sensor readings and tasks for each equipment
  const getEquipmentSensorReadings = (equipmentId) => {
    return sensorReadings.filter(r => r.equipment_id === equipmentId).slice(0, 5);
  };

  const getEquipmentTasks = (equipmentId) => {
    return maintenanceTasks.filter(t => t.equipment_id === equipmentId);
  };

  const handleCreateWorkOrder = (equip) => {
    setWorkOrderEquipment(equip);
    setShowWorkOrderDialog(true);
  };

  const handleBackgroundClick = () => {
    setSelectedEquipmentId(null);
  };

  // Count equipment by status
  const statusCounts = {
    operational: filteredEquipment.filter(e => e.status === 'operational').length,
    degraded: filteredEquipment.filter(e => e.status === 'degraded').length,
    critical: filteredEquipment.filter(e => e.status === 'critical').length,
    offline: filteredEquipment.filter(e => e.status === 'offline').length,
    maintenance: filteredEquipment.filter(e => e.status === 'maintenance').length,
  };

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-3 border-b border-slate-200 bg-white">
        <div className="flex items-center gap-3">
          <Select value={selectedLocation || 'all'} onValueChange={onLocationChange}>
            <SelectTrigger className="w-48">
              <MapPin className="w-4 h-4 mr-2 text-slate-400" />
              <SelectValue placeholder="All Locations" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="all">All Locations</SelectItem>
              {locations.map(loc => (
                <SelectItem key={loc} value={loc}>{loc}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <Filter className="w-4 h-4 mr-2 text-slate-400" />
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="operational">Operational</SelectItem>
              <SelectItem value="degraded">Degraded</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="offline">Offline</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          {/* Status summary */}
          <div className="flex items-center gap-1 mr-4">
            {statusCounts.critical > 0 && (
              <Badge className="bg-red-100 text-red-700">{statusCounts.critical} Critical</Badge>
            )}
            {statusCounts.degraded > 0 && (
              <Badge className="bg-amber-100 text-amber-700">{statusCounts.degraded} Degraded</Badge>
            )}
            <Badge className="bg-green-100 text-green-700">{statusCounts.operational} OK</Badge>
          </div>

          <Button variant="outline" size="sm" onClick={() => refetchEquipment()}>
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => setZoom(z => Math.max(0.5, z - 0.25))}>
            <ZoomOut className="w-4 h-4" />
          </Button>
          <span className="text-sm text-slate-500 w-12 text-center">{Math.round(zoom * 100)}%</span>
          <Button variant="outline" size="sm" onClick={() => setZoom(z => Math.min(2, z + 0.25))}>
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => setZoom(1)}>
            <Maximize2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Floor Plan Canvas */}
      <div 
        className="flex-1 overflow-auto bg-slate-100 relative"
        onClick={handleBackgroundClick}
      >
        <motion.div
          className="relative min-h-full"
          style={{ 
            transform: `scale(${zoom})`,
            transformOrigin: 'top left',
            width: `${100 / zoom}%`,
            height: `${100 / zoom}%`,
            minHeight: '600px'
          }}
        >
          {/* Grid background */}
          <div 
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: `
                linear-gradient(#cbd5e1 1px, transparent 1px),
                linear-gradient(90deg, #cbd5e1 1px, transparent 1px)
              `,
              backgroundSize: '50px 50px'
            }}
          />

          {/* Floor plan outline */}
          <div className="absolute inset-8 border-2 border-slate-300 rounded-lg bg-white/50">
            {/* Room labels */}
            {selectedLocation && selectedLocation !== 'all' ? (
              <div className="absolute top-4 left-4 text-lg font-semibold text-slate-400">
                {selectedLocation}
              </div>
            ) : (
              <div className="absolute top-4 left-4 text-lg font-semibold text-slate-400">
                Facility Overview
              </div>
            )}
          </div>

          {/* Equipment Hotspots */}
          {filteredEquipment.map((equip, index) => {
            const position = getEquipmentPosition(equip.id, index, filteredEquipment.length);
            return (
              <EquipmentHotspot
                key={equip.id}
                equipment={equip}
                position={position}
                sensorReadings={getEquipmentSensorReadings(equip.id)}
                recentTasks={getEquipmentTasks(equip.id)}
                isSelected={selectedEquipmentId === equip.id}
                onSelect={setSelectedEquipmentId}
                onCreateWorkOrder={handleCreateWorkOrder}
              />
            );
          })}

          {/* Empty state */}
          {filteredEquipment.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <Layers className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">No equipment found</p>
                <p className="text-sm text-slate-400">Try adjusting your filters</p>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Legend */}
      <div className="p-3 border-t border-slate-200 bg-white flex items-center justify-between">
        <div className="flex items-center gap-4 text-xs">
          <span className="text-slate-500 font-medium">Status:</span>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span>Operational</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-amber-500" />
            <span>Degraded</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span>Critical</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span>Maintenance</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-slate-400" />
            <span>Offline</span>
          </div>
        </div>
        <p className="text-xs text-slate-400">
          Click on equipment markers to view details and create work orders
        </p>
      </div>

      {/* Quick Work Order Dialog */}
      <QuickWorkOrderDialog
        open={showWorkOrderDialog}
        onOpenChange={setShowWorkOrderDialog}
        equipment={workOrderEquipment}
      />
    </div>
  );
}