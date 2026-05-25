import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { secureEntity } from '@/lib/secureEntities';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Radio, Wifi, Upload, Settings, Plus, Activity, AlertTriangle,
  CheckCircle, XCircle, Clock, Download, RefreshCw, Trash2,
  Eye, Code, FileText, Zap, Server, Database
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from 'date-fns';

import SensorConfigForm from '@/components/sensors/SensorConfigForm';
import CSVImportPanel from '@/components/sensors/CSVImportPanel';
import APIDocumentation from '@/components/sensors/APIDocumentation';
import SensorMonitoringDashboard from '@/components/sensors/SensorMonitoringDashboard';
import DataIngestionLogs from '@/components/sensors/DataIngestionLogs';
import GenerateSampleData from '@/components/sensors/GenerateSampleData';
import SendTestReading from '@/components/sensors/SendTestReading';
import PullToRefresh from '@/components/mobile/PullToRefresh';

const SENSOR_TYPES = [
  'vibration', 'temperature', 'pressure', 'current', 'voltage', 'flow_rate',
  'rpm', 'humidity', 'noise_level', 'oil_quality', 'strain', 'displacement',
  'crack_width', 'tilt', 'acceleration', 'corrosion', 'moisture', 'wind_speed',
  'seismic_activity', 'structural_load', 'deflection', 'acoustic_emission',
  'rail_profile', 'track_geometry', 'concrete_integrity', 'settlement',
  'water_level', 'chloride_content', 'ph_level'
];

export default function SensorIntegration() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedConfig, setSelectedConfig] = useState(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  
  const queryClient = useQueryClient();

  const { data: sensorConfigs = [], isLoading: loadingConfigs } = useQuery({
    queryKey: ['sensorConfigs'],
    queryFn: () => secureEntity('SensorConfiguration').list('-created_date', 200),
  });

  const { data: equipment = [] } = useQuery({
    queryKey: ['equipment'],
    queryFn: () => secureEntity('Equipment').list('-created_date', 200),
  });

  const { data: recentReadings = [] } = useQuery({
    queryKey: ['recentReadings'],
    queryFn: () => secureEntity('SensorReading').list('-created_date', 100),
  });

  const { data: ingestionLogs = [] } = useQuery({
    queryKey: ['ingestionLogs'],
    queryFn: () => secureEntity('DataIngestionLog').list('-created_date', 50),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => secureEntity('SensorConfiguration').delete(id),
    onSuccess: () => queryClient.invalidateQueries(['sensorConfigs']),
  });

  // Calculate stats
  const activeSensors = sensorConfigs.filter(s => s.is_active).length;
  const onlineSensors = sensorConfigs.filter(s => s.status === 'online').length;
  const offlineSensors = sensorConfigs.filter(s => s.status === 'offline' || !s.status).length;
  const errorSensors = sensorConfigs.filter(s => s.status === 'error').length;
  
  const last24hReadings = recentReadings.filter(r => {
    const readingTime = new Date(r.created_date);
    return Date.now() - readingTime.getTime() < 24 * 60 * 60 * 1000;
  }).length;

  const getStatusColor = (status) => {
    const colors = {
      online: 'bg-emerald-500',
      offline: 'bg-slate-400',
      error: 'bg-rose-500',
      calibrating: 'bg-amber-500'
    };
    return colors[status] || colors.offline;
  };

  const getStatusBadge = (status) => {
    const configs = {
      online: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      offline: 'bg-slate-50 text-slate-600 border-slate-200',
      error: 'bg-rose-50 text-rose-700 border-rose-200',
      calibrating: 'bg-amber-50 text-amber-700 border-amber-200'
    };
    return configs[status] || configs.offline;
  };

  return (
    <div className="min-h-screen bg-gray-50 text-slate-900">
      <PullToRefresh onRefresh={async () => { await queryClient.invalidateQueries(['sensorConfigs']); await queryClient.invalidateQueries(['recentReadings']); }}>
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 py-4 sm:py-8" style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 16px)' }}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900 flex items-center gap-3">
              <Radio className="w-7 h-7 text-indigo-600" />
              Sensor Integration
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Configure sensors, import data, and monitor real-time readings
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              onClick={() => queryClient.invalidateQueries(['sensorConfigs', 'recentReadings'])}
              className="border-slate-200"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-indigo-600 hover:bg-indigo-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Sensor
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-white max-w-2xl max-h-[90vh] overflow-y-auto" aria-describedby="sensor-dialog-description">
                <DialogHeader>
                  <DialogTitle>Configure New Sensor</DialogTitle>
                  <p id="sensor-dialog-description" className="text-sm text-slate-500">Set up a new sensor to collect data from your equipment.</p>
                </DialogHeader>
                <SensorConfigForm 
                  equipment={equipment}
                  sensorTypes={SENSOR_TYPES}
                  onSuccess={() => {
                    setIsAddDialogOpen(false);
                    queryClient.invalidateQueries(['sensorConfigs']);
                  }}
                  onCancel={() => setIsAddDialogOpen(false)}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl border border-slate-200 p-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center">
                <Radio className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-slate-900">{sensorConfigs.length}</p>
                <p className="text-xs text-slate-500">Total Sensors</p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-white rounded-xl border border-slate-200 p-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                <Wifi className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-emerald-600">{onlineSensors}</p>
                <p className="text-xs text-slate-500">Online</p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl border border-slate-200 p-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <XCircle className="w-5 h-5 text-slate-500" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-slate-600">{offlineSensors}</p>
                <p className="text-xs text-slate-500">Offline</p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white rounded-xl border border-slate-200 p-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-rose-50 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-rose-600">{errorSensors}</p>
                <p className="text-xs text-slate-500">Errors</p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl border border-slate-200 p-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <Activity className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-blue-600">{last24hReadings}</p>
                <p className="text-xs text-slate-500">Readings (24h)</p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-white rounded-xl border border-slate-200 p-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                <Database className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-purple-600">{ingestionLogs.length}</p>
                <p className="text-xs text-slate-500">Data Imports</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white border border-slate-200 flex-wrap h-auto p-1 w-full sm:w-auto overflow-x-auto">
            <TabsTrigger value="overview" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
              <Settings className="w-4 h-4 mr-2" />
              Sensor Configs
            </TabsTrigger>
            <TabsTrigger value="monitoring" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
              <Activity className="w-4 h-4 mr-2" />
              Live Monitoring
            </TabsTrigger>
            <TabsTrigger value="import" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
              <Upload className="w-4 h-4 mr-2" />
              Import Data
            </TabsTrigger>
            <TabsTrigger value="api" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
              <Code className="w-4 h-4 mr-2" />
              API Integration
            </TabsTrigger>
            <TabsTrigger value="logs" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
              <FileText className="w-4 h-4 mr-2" />
              Ingestion Logs
            </TabsTrigger>
            <TabsTrigger value="test" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
              <Zap className="w-4 h-4 mr-2" />
              Test Reading
            </TabsTrigger>
            <TabsTrigger value="generate" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
              <Server className="w-4 h-4 mr-2" />
              Generate Data
            </TabsTrigger>
          </TabsList>

          {/* Sensor Configurations */}
          <TabsContent value="overview">
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              {sensorConfigs.length === 0 ? (
                <div className="text-center py-16">
                  <Radio className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-600">No sensors configured</h3>
                  <p className="text-sm text-slate-400 mb-4">Add your first sensor to start collecting data</p>
                  <Button onClick={() => setIsAddDialogOpen(true)} className="bg-indigo-600 hover:bg-indigo-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Add First Sensor
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50 hover:bg-slate-50">
                      <TableHead className="text-slate-600">Sensor</TableHead>
                      <TableHead className="text-slate-600">Equipment</TableHead>
                      <TableHead className="text-slate-600">Type</TableHead>
                      <TableHead className="text-slate-600">Status</TableHead>
                      <TableHead className="text-slate-600">Last Reading</TableHead>
                      <TableHead className="text-slate-600">Thresholds</TableHead>
                      <TableHead className="text-slate-600">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sensorConfigs.map((config) => {
                      const equip = equipment.find(e => e.id === config.equipment_id);
                      return (
                        <TableRow key={config.id} className="hover:bg-slate-50">
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className={`w-2 h-2 rounded-full ${getStatusColor(config.status)}`} />
                              <span className="font-medium text-slate-900">{config.sensor_name}</span>
                            </div>
                            {config.external_sensor_id && (
                              <p className="text-xs text-slate-400 mt-0.5">ID: {config.external_sensor_id}</p>
                            )}
                          </TableCell>
                          <TableCell className="text-slate-600">
                            {equip?.name || 'Unknown'}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">
                              {config.sensor_type?.replace(/_/g, ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusBadge(config.status)}>
                              {config.status || 'offline'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {config.last_reading_value !== undefined && config.last_reading_value !== null ? (
                              <div>
                                <span className="font-medium">{Number(config.last_reading_value).toFixed(2)}</span>
                                <span className="text-slate-400 ml-1">{config.unit}</span>
                                {config.last_reading_at && (
                                  <p className="text-xs text-slate-400">
                                    {format(new Date(config.last_reading_at), 'MMM d, HH:mm')}
                                  </p>
                                )}
                              </div>
                            ) : (
                              <span className="text-slate-400">No data</span>
                            )}
                          </TableCell>
                          <TableCell className="text-sm text-slate-600">
                            {config.threshold_min !== undefined || config.threshold_max !== undefined ? (
                              <span>
                                {config.threshold_min ?? '–'} / {config.threshold_max ?? '–'} {config.unit}
                              </span>
                            ) : (
                              <span className="text-slate-400">Not set</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setSelectedConfig(config)}
                                className="text-slate-400 hover:text-slate-600"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  if (confirm('Delete this sensor configuration?')) {
                                    deleteMutation.mutate(config.id);
                                  }
                                }}
                                className="text-slate-400 hover:text-rose-600"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </div>
          </TabsContent>

          {/* Live Monitoring */}
          <TabsContent value="monitoring">
            <SensorMonitoringDashboard 
              sensorConfigs={sensorConfigs}
              equipment={equipment}
              recentReadings={recentReadings}
            />
          </TabsContent>

          {/* CSV Import */}
          <TabsContent value="import">
            <CSVImportPanel equipment={equipment} />
          </TabsContent>

          {/* API Documentation */}
          <TabsContent value="api">
            <APIDocumentation />
          </TabsContent>

          {/* Ingestion Logs */}
          <TabsContent value="logs">
            <DataIngestionLogs logs={ingestionLogs} />
          </TabsContent>

          {/* Test Reading */}
          <TabsContent value="test">
            <SendTestReading 
              equipment={equipment}
              sensorConfigs={sensorConfigs}
            />
          </TabsContent>

          {/* Generate Sample Data */}
          <TabsContent value="generate">
            <GenerateSampleData 
              equipment={equipment} 
              sensorConfigs={sensorConfigs}
              onDataGenerated={() => queryClient.invalidateQueries(['recentReadings', 'sensorConfigs'])}
            />
          </TabsContent>
        </Tabs>
      </div>
      </PullToRefresh>

      {/* Sensor Config Detail Dialog */}
      <AnimatePresence>
        {selectedConfig && (
          <Dialog open={!!selectedConfig} onOpenChange={() => setSelectedConfig(null)}>
            <DialogContent className="bg-white max-w-2xl" aria-describedby="sensor-details-description">
              <DialogHeader>
                <DialogTitle>Sensor Configuration Details</DialogTitle>
                <p id="sensor-details-description" className="text-sm text-slate-500">View detailed information about this sensor configuration.</p>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-slate-500">Sensor Name</Label>
                    <p className="font-medium">{selectedConfig.sensor_name}</p>
                  </div>
                  <div>
                    <Label className="text-slate-500">Type</Label>
                    <p className="font-medium capitalize">{selectedConfig.sensor_type?.replace(/_/g, ' ')}</p>
                  </div>
                  <div>
                    <Label className="text-slate-500">External ID</Label>
                    <p className="font-medium">{selectedConfig.external_sensor_id || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-slate-500">Data Source</Label>
                    <p className="font-medium capitalize">{selectedConfig.data_source?.replace(/_/g, ' ') || 'API'}</p>
                  </div>
                  <div>
                    <Label className="text-slate-500">Unit</Label>
                    <p className="font-medium">{selectedConfig.unit || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-slate-500">Sampling Rate</Label>
                    <p className="font-medium">{selectedConfig.sampling_rate_seconds ? `${selectedConfig.sampling_rate_seconds}s` : 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-slate-500">Thresholds (Min/Max)</Label>
                    <p className="font-medium">
                      {selectedConfig.threshold_min ?? '–'} / {selectedConfig.threshold_max ?? '–'}
                    </p>
                  </div>
                  <div>
                    <Label className="text-slate-500">Warning Levels (Min/Max)</Label>
                    <p className="font-medium">
                      {selectedConfig.warning_min ?? '–'} / {selectedConfig.warning_max ?? '–'}
                    </p>
                  </div>
                </div>
                {selectedConfig.notes && (
                  <div>
                    <Label className="text-slate-500">Notes</Label>
                    <p className="text-slate-700">{selectedConfig.notes}</p>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </div>
  );
}