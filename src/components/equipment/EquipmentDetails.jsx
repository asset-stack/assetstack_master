import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  X, Activity, Clock, MapPin, Calendar, Wrench, AlertTriangle, 
  TrendingUp, Cpu, Gauge, Thermometer, Zap, Droplet, Pencil, Trash2, ArrowRight
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { format } from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import HealthGauge from '../dashboard/HealthGauge';
import SensorReadingsChart from './SensorReadingsChart';
import TaskDetailsDialog from '../maintenance/TaskDetailsDialog';
import MatterportEmbed from '../dashboard/MatterportEmbed';

export default function EquipmentDetails({ equipment, readings, onClose, onEdit, onDelete }) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const { data: maintenanceTasks = [] } = useQuery({
    queryKey: ['maintenanceHistory', equipment.id],
    queryFn: () => base44.entities.MaintenanceTask.filter({ equipment_id: equipment.id }, '-completed_date', 50),
    enabled: !!equipment.id,
  });

  const getTaskStatusColor = (status) => {
    const colors = {
      completed: 'bg-emerald-500/20 text-emerald-400',
      scheduled: 'bg-blue-500/20 text-blue-400',
      in_progress: 'bg-amber-500/20 text-amber-400',
      overdue: 'bg-rose-500/20 text-rose-400'
    };
    return colors[status] || 'bg-slate-500/20 text-slate-400';
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

  const getSensorIcon = (type) => {
    const icons = {
      vibration: Activity,
      temperature: Thermometer,
      pressure: Gauge,
      current: Zap,
      flow_rate: Droplet,
      rpm: Cpu
    };
    return icons[type] || Activity;
  };

  const groupedReadings = readings.reduce((acc, r) => {
    if (!acc[r.sensor_type]) acc[r.sensor_type] = [];
    acc[r.sensor_type].push(r);
    return acc;
  }, {});

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-900 rounded-2xl border border-slate-700 w-full max-w-4xl max-h-[90vh] overflow-hidden"
      >
        <div className="p-6 border-b border-slate-700/50 flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-500/10 rounded-xl">
              <Cpu className="w-8 h-8 text-blue-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={`w-2 h-2 rounded-full ${getStatusColor(equipment.status)} animate-pulse`} />
                <span className="text-sm text-slate-400 capitalize">{equipment.status}</span>
              </div>
              <h2 className="text-2xl font-bold text-white">{equipment.name}</h2>
              <p className="text-slate-400">{equipment.type?.replace(/_/g, ' ')} • {equipment.manufacturer} {equipment.model}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onEdit && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onEdit(equipment)}
                className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
              >
                <Pencil className="w-4 h-4 mr-1" />
                Edit
              </Button>
            )}
            {onDelete && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowDeleteConfirm(true)}
                className="border-rose-600 text-rose-400 hover:bg-rose-600 hover:text-white"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Delete
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={onClose} className="text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-slate-800/50 rounded-xl p-4 flex flex-col items-center justify-center">
              <HealthGauge score={equipment.health_score || 0} size={100} label="Health Score" />
            </div>
            <div className="bg-slate-800/50 rounded-xl p-4">
              <div className="flex items-center gap-2 text-slate-400 mb-2">
                <Clock className="w-4 h-4" />
                <span className="text-sm">Remaining Useful Life</span>
              </div>
              <p className="text-2xl font-bold text-white">{equipment.remaining_useful_life_days || 'N/A'}</p>
              <p className="text-sm text-slate-500">days</p>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-4">
              <div className="flex items-center gap-2 text-slate-400 mb-2">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-sm">Failure Probability</span>
              </div>
              <p className="text-2xl font-bold text-amber-400">{equipment.failure_probability?.toFixed(1) || 0}%</p>
              <p className="text-sm text-slate-500">in next 30 days</p>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-4">
              <div className="flex items-center gap-2 text-slate-400 mb-2">
                <Activity className="w-4 h-4" />
                <span className="text-sm">Operating Hours</span>
              </div>
              <p className="text-2xl font-bold text-white">{equipment.operating_hours?.toLocaleString() || 0}</p>
              <p className="text-sm text-slate-500">hours total</p>
            </div>
          </div>

          <Tabs defaultValue="sensors" className="w-full">
            <TabsList className="bg-slate-800/50 border border-slate-700">
              <TabsTrigger value="sensors" className="data-[state=active]:bg-blue-600">Sensor Data</TabsTrigger>
              <TabsTrigger value="details" className="data-[state=active]:bg-blue-600">Details</TabsTrigger>
              <TabsTrigger value="history" className="data-[state=active]:bg-blue-600">Maintenance History</TabsTrigger>
              <TabsTrigger value="location" className="data-[state=active]:bg-blue-600">Location</TabsTrigger>
            </TabsList>

            <TabsContent value="sensors" className="mt-4 space-y-4">
              {Object.entries(groupedReadings).length > 0 ? (
                Object.entries(groupedReadings).map(([sensorType, sensorReadings]) => (
                  <SensorReadingsChart 
                    key={sensorType} 
                    sensorType={sensorType} 
                    readings={sensorReadings} 
                  />
                ))
              ) : (
                <div className="text-center py-12 text-slate-400">
                  <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No sensor data available</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="details" className="mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-800/50 rounded-xl p-4 space-y-3">
                  <h4 className="text-sm font-medium text-slate-400">Equipment Information</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Serial Number</span>
                      <span className="text-white">{equipment.serial_number || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Manufacturer</span>
                      <span className="text-white">{equipment.manufacturer || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Model</span>
                      <span className="text-white">{equipment.model || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Location</span>
                      <span className="text-white">{equipment.location}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Criticality</span>
                      <Badge variant="outline" className="capitalize">{equipment.criticality || 'medium'}</Badge>
                    </div>
                  </div>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-4 space-y-3">
                  <h4 className="text-sm font-medium text-slate-400">Dates & Maintenance</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Installation Date</span>
                      <span className="text-white">
                        {equipment.installation_date ? format(new Date(equipment.installation_date), 'MMM d, yyyy') : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Last Maintenance</span>
                      <span className="text-white">
                        {equipment.last_maintenance_date ? format(new Date(equipment.last_maintenance_date), 'MMM d, yyyy') : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Predicted Failure</span>
                      <span className="text-amber-400">
                        {equipment.predicted_failure_date ? format(new Date(equipment.predicted_failure_date), 'MMM d, yyyy') : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Rated Capacity</span>
                      <span className="text-white">
                        {equipment.rated_capacity ? `${equipment.rated_capacity} ${equipment.capacity_unit || ''}` : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="location" className="mt-4">
              <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-white mb-1">Equipment Location</h4>
                  <p className="text-xs text-slate-400">
                    <MapPin className="w-3 h-3 inline-block mr-1 mb-0.5" />
                    Pinned inside <strong>R16 - Plant Room</strong> (center of the room).
                  </p>
                </div>
                <div className="rounded-xl overflow-hidden shadow-2xl border border-slate-700">
                  <MatterportEmbed 
                    title={equipment.name}
                    subtitle={`R16 - Plant Room • ${equipment.location || 'South West Sports Centre'}`}
                    height={450}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="history" className="mt-4">
              {maintenanceTasks.length > 0 ? (
                <div className="space-y-3">
                  {maintenanceTasks.map((task) => (
                    <div 
                      key={task.id} 
                      onClick={() => setSelectedTask(task)}
                      className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 hover:bg-slate-800 cursor-pointer transition-colors group flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className={`border-0 ${getTaskStatusColor(task.status)} capitalize`}>
                            {task.status?.replace('_', ' ')}
                          </Badge>
                          <span className="text-xs text-slate-400 capitalize">{task.type}</span>
                        </div>
                        <h4 className="text-sm font-medium text-white group-hover:text-blue-400 transition-colors">{task.title}</h4>
                      </div>
                      
                      <div className="flex items-center gap-6 text-sm text-slate-400">
                        <div className="flex flex-col sm:items-end">
                          <span className="text-xs">Date</span>
                          <span className="text-white">
                            {task.completed_date 
                              ? format(new Date(task.completed_date), 'MMM d, yyyy') 
                              : task.scheduled_date ? format(new Date(task.scheduled_date), 'MMM d, yyyy') : 'N/A'
                            }
                          </span>
                        </div>
                        <div className="flex flex-col sm:items-end">
                          <span className="text-xs">Assigned To</span>
                          <span className="text-white">{task.assigned_to || 'Unassigned'}</span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 transition-colors hidden sm:block" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-slate-400">
                  <Wrench className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No maintenance tasks found for this equipment.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        <TaskDetailsDialog
          open={!!selectedTask}
          onClose={() => setSelectedTask(null)}
          task={selectedTask}
          equipment={equipment}
        />

        <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
          <DialogContent className="bg-white max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-rose-600">
                <AlertTriangle className="w-5 h-5" />
                Delete Equipment
              </DialogTitle>
            </DialogHeader>
            <p className="text-slate-600">
              Are you sure you want to delete <strong>{equipment.name}</strong>? This action cannot be undone.
            </p>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
                Cancel
              </Button>
              <Button 
                className="bg-rose-600 hover:bg-rose-700"
                onClick={() => {
                  onDelete(equipment.id);
                  setShowDeleteConfirm(false);
                }}
              >
                Delete Equipment
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </motion.div>
    </motion.div>
  );
}