import React from 'react';
import { motion } from 'framer-motion';
import { 
  X, Activity, Clock, MapPin, Calendar, Wrench, AlertTriangle, 
  TrendingUp, Cpu, Gauge, Thermometer, Zap, Droplet
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from 'date-fns';
import HealthGauge from '../dashboard/HealthGauge';
import SensorReadingsChart from './SensorReadingsChart';

export default function EquipmentDetails({ equipment, readings, onClose }) {
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
          <Button variant="ghost" size="icon" onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </Button>
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

            <TabsContent value="history" className="mt-4">
              <div className="text-center py-12 text-slate-400">
                <Wrench className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>View maintenance tasks for this equipment</p>
                <Button className="mt-4 bg-blue-600 hover:bg-blue-700">View Tasks</Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </motion.div>
    </motion.div>
  );
}