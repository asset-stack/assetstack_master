import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { 
  Activity, Wifi, WifiOff, AlertTriangle, TrendingUp, 
  TrendingDown, Minus, RefreshCw, Eye
} from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { format } from 'date-fns';

export default function SensorMonitoringDashboard({ sensorConfigs, equipment, recentReadings }) {
  const [selectedEquipment, setSelectedEquipment] = useState('all');
  const [selectedSensorType, setSelectedSensorType] = useState('all');
  const [autoRefresh, setAutoRefresh] = useState(true);
  
  const queryClient = useQueryClient();

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      queryClient.invalidateQueries(['recentReadings']);
    }, 30000);
    return () => clearInterval(interval);
  }, [autoRefresh, queryClient]);

  // Real-time subscription
  useEffect(() => {
    const unsubscribe = base44.entities.SensorReading.subscribe((event) => {
      queryClient.invalidateQueries(['recentReadings']);
      // Also update sensor config last reading when new data arrives
      if (event.type === 'create' && event.data) {
        const config = sensorConfigs.find(
          s => s.equipment_id === event.data.equipment_id && s.sensor_type === event.data.sensor_type
        );
        if (config) {
          base44.entities.SensorConfiguration.update(config.id, {
            last_reading_at: new Date().toISOString(),
            last_reading_value: event.data.value,
            status: 'online'
          });
        }
      }
    });
    return unsubscribe;
  }, [queryClient, sensorConfigs]);

  // Filter sensors
  const filteredConfigs = sensorConfigs.filter(s => {
    if (selectedEquipment !== 'all' && s.equipment_id !== selectedEquipment) return false;
    if (selectedSensorType !== 'all' && s.sensor_type !== selectedSensorType) return false;
    return true;
  });

  // Get unique sensor types
  const sensorTypes = [...new Set(sensorConfigs.map(s => s.sensor_type))];

  // Group readings by sensor
  const getReadingsForSensor = (config) => {
    return recentReadings
      .filter(r => r.equipment_id === config.equipment_id && r.sensor_type === config.sensor_type)
      .slice(0, 20)
      .reverse()
      .map((r, idx) => ({
        time: format(new Date(r.created_date), 'HH:mm'),
        value: r.value,
        isAnomaly: r.is_anomaly
      }));
  };

  const getTrend = (readings) => {
    if (readings.length < 2) return 'stable';
    const recent = readings.slice(-5);
    const first = recent[0]?.value || 0;
    const last = recent[recent.length - 1]?.value || 0;
    const change = ((last - first) / first) * 100;
    if (change > 5) return 'up';
    if (change < -5) return 'down';
    return 'stable';
  };

  const getStatusColor = (status) => {
    const colors = {
      online: 'text-emerald-600',
      offline: 'text-slate-400',
      error: 'text-rose-600'
    };
    return colors[status] || colors.offline;
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-lg">
          <p className="text-xs text-slate-500">{label}</p>
          <p className="font-medium text-slate-900">
            {typeof payload[0].value === 'number' ? payload[0].value.toFixed(2) : '--'}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-indigo-600" />
          <span className="font-medium text-slate-900">Live Monitoring</span>
        </div>
        
        <div className="flex items-center gap-3 ml-auto">
          <Select value={selectedEquipment} onValueChange={setSelectedEquipment}>
            <SelectTrigger className="w-48 bg-white border-slate-200">
              <SelectValue placeholder="Filter by equipment" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="all">All Equipment</SelectItem>
              {equipment.map(eq => (
                <SelectItem key={eq.id} value={eq.id}>{eq.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedSensorType} onValueChange={setSelectedSensorType}>
            <SelectTrigger className="w-40 bg-white border-slate-200">
              <SelectValue placeholder="Sensor type" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="all">All Types</SelectItem>
              {sensorTypes.map(type => (
                <SelectItem key={type} value={type} className="capitalize">
                  {type.replace(/_/g, ' ')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant={autoRefresh ? 'default' : 'outline'}
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={autoRefresh ? 'bg-indigo-600 hover:bg-indigo-700' : 'border-slate-200'}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
            Auto-Refresh
          </Button>
        </div>
      </div>

      {/* Sensor Cards Grid */}
      {filteredConfigs.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <Activity className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-600">No sensors to display</h3>
          <p className="text-sm text-slate-400">Configure sensors or adjust filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredConfigs.map((config, idx) => {
            const equip = equipment.find(e => e.id === config.equipment_id);
            const readings = getReadingsForSensor(config);
            const trend = getTrend(readings);
            const latestValue = config.last_reading_value;
            const isOverThreshold = latestValue != null && (
              (config.threshold_max != null && latestValue > config.threshold_max) ||
              (config.threshold_min != null && latestValue < config.threshold_min)
            );

            return (
              <motion.div
                key={config.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`bg-white rounded-xl border p-4 ${
                  isOverThreshold ? 'border-rose-300 bg-rose-50/50' : 'border-slate-200'
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      {config.status === 'online' ? (
                        <Wifi className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <WifiOff className="w-4 h-4 text-slate-400" />
                      )}
                      <span className="font-medium text-slate-900">{config.sensor_name}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {equip?.name} • <span className="capitalize">{config.sensor_type?.replace(/_/g, ' ')}</span>
                    </p>
                  </div>
                  {isOverThreshold && (
                    <Badge className="bg-rose-100 text-rose-700 border-rose-200">
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      Alert
                    </Badge>
                  )}
                </div>

                {/* Value Display */}
                <div className="flex items-end gap-3 mb-4">
                  <span className="text-3xl font-bold text-slate-900">
                    {typeof latestValue === 'number' ? latestValue.toFixed(1) : '--'}
                  </span>
                  <span className="text-slate-500 mb-1">{config.unit}</span>
                  <div className="ml-auto flex items-center gap-1">
                    {trend === 'up' && <TrendingUp className="w-4 h-4 text-rose-500" />}
                    {trend === 'down' && <TrendingDown className="w-4 h-4 text-emerald-500" />}
                    {trend === 'stable' && <Minus className="w-4 h-4 text-slate-400" />}
                  </div>
                </div>

                {/* Mini Chart */}
                {readings.length > 0 ? (
                  <div className="h-20">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={readings}>
                        <Line 
                          type="monotone" 
                          dataKey="value" 
                          stroke={isOverThreshold ? '#ef4444' : '#6366f1'} 
                          strokeWidth={2}
                          dot={false}
                        />
                        {config.threshold_max !== undefined && (
                          <ReferenceLine 
                            y={config.threshold_max} 
                            stroke="#ef4444" 
                            strokeDasharray="3 3" 
                          />
                        )}
                        {config.threshold_min !== undefined && (
                          <ReferenceLine 
                            y={config.threshold_min} 
                            stroke="#ef4444" 
                            strokeDasharray="3 3" 
                          />
                        )}
                        <Tooltip content={<CustomTooltip />} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-20 flex items-center justify-center bg-slate-50 rounded-lg">
                    <p className="text-sm text-slate-400">No data yet</p>
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                  <div className="text-xs text-slate-500">
                    {config.last_reading_at ? (
                      <>Last: {format(new Date(config.last_reading_at), 'HH:mm:ss')}</>
                    ) : (
                      'No readings'
                    )}
                  </div>
                  {config.threshold_min !== undefined || config.threshold_max !== undefined ? (
                    <div className="text-xs text-slate-400">
                      Range: {config.threshold_min ?? '–'} - {config.threshold_max ?? '–'}
                    </div>
                  ) : null}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}