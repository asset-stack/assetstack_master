import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Thermometer, Gauge, Zap, Droplet, Volume2, Settings } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Area } from 'recharts';
import { format } from 'date-fns';
import { Badge } from "@/components/ui/badge";

export default function SensorReadingsChart({ sensorType, readings }) {
  const getSensorConfig = (type) => {
    const configs = {
      vibration: { icon: Activity, color: '#3b82f6', unit: 'mm/s', label: 'Vibration' },
      temperature: { icon: Thermometer, color: '#ef4444', unit: '°C', label: 'Temperature' },
      pressure: { icon: Gauge, color: '#8b5cf6', unit: 'bar', label: 'Pressure' },
      current: { icon: Zap, color: '#f59e0b', unit: 'A', label: 'Current' },
      voltage: { icon: Zap, color: '#10b981', unit: 'V', label: 'Voltage' },
      flow_rate: { icon: Droplet, color: '#06b6d4', unit: 'L/min', label: 'Flow Rate' },
      rpm: { icon: Settings, color: '#ec4899', unit: 'RPM', label: 'RPM' },
      noise_level: { icon: Volume2, color: '#6366f1', unit: 'dB', label: 'Noise Level' },
      strain: { icon: Activity, color: '#f97316', unit: 'με', label: 'Strain' },
      displacement: { icon: Activity, color: '#8b5cf6', unit: 'mm', label: 'Displacement' },
      crack_width: { icon: Activity, color: '#ef4444', unit: 'mm', label: 'Crack Width' },
      tilt: { icon: Activity, color: '#f59e0b', unit: '°', label: 'Tilt' },
      acceleration: { icon: Activity, color: '#06b6d4', unit: 'g', label: 'Acceleration' },
      corrosion: { icon: Activity, color: '#dc2626', unit: 'mm/year', label: 'Corrosion Rate' },
      deflection: { icon: Activity, color: '#7c3aed', unit: 'mm', label: 'Deflection' },
      rail_profile: { icon: Settings, color: '#2563eb', unit: 'mm', label: 'Rail Profile' },
      track_geometry: { icon: Settings, color: '#059669', unit: 'mm', label: 'Track Geometry' },
      structural_load: { icon: Gauge, color: '#ea580c', unit: 'kN', label: 'Structural Load' },
      seismic_activity: { icon: Activity, color: '#be123c', unit: 'g', label: 'Seismic Activity' },
      wind_speed: { icon: Activity, color: '#0891b2', unit: 'm/s', label: 'Wind Speed' },
    };
    return configs[type] || { icon: Activity, color: '#64748b', unit: '', label: type.replace(/_/g, ' ') };
  };

  const config = getSensorConfig(sensorType);
  const Icon = config.icon;

  const chartData = readings
    .sort((a, b) => new Date(a.timestamp || a.created_date) - new Date(b.timestamp || b.created_date))
    .slice(-50)
    .map((r, idx) => ({
      name: format(new Date(r.timestamp || r.created_date), 'HH:mm'),
      value: r.value,
      anomaly: r.is_anomaly,
      threshold_max: r.threshold_max,
      threshold_min: r.threshold_min
    }));

  const latestReading = readings[readings.length - 1];
  const avgValue = readings.reduce((sum, r) => sum + r.value, 0) / readings.length;
  const maxValue = Math.max(...readings.map(r => r.value));
  const anomalyCount = readings.filter(r => r.is_anomaly).length;

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-800/95 backdrop-blur-xl border border-slate-700 rounded-lg p-3 shadow-xl">
          <p className="text-slate-400 text-xs mb-1">{label}</p>
          <p className="text-sm font-medium text-white">
            {payload[0].value?.toFixed(2)} {config.unit}
          </p>
          {data.anomaly && (
            <Badge className="mt-1 bg-rose-500/20 text-rose-400 text-xs">Anomaly</Badge>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/50"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg" style={{ backgroundColor: `${config.color}20` }}>
            <Icon className="w-5 h-5" style={{ color: config.color }} />
          </div>
          <div>
            <h4 className="text-sm font-medium text-white">{config.label}</h4>
            <p className="text-xs text-slate-400">Latest: {latestReading?.value?.toFixed(2)} {config.unit}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="text-center">
            <p className="text-slate-400">Avg</p>
            <p className="text-white font-medium">{avgValue.toFixed(1)}</p>
          </div>
          <div className="text-center">
            <p className="text-slate-400">Max</p>
            <p className="text-white font-medium">{maxValue.toFixed(1)}</p>
          </div>
          {anomalyCount > 0 && (
            <Badge className="bg-rose-500/20 text-rose-400">{anomalyCount} anomalies</Badge>
          )}
        </div>
      </div>

      <div className="h-[160px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id={`gradient-${sensorType}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={config.color} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={config.color} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis 
              dataKey="name" 
              stroke="#64748b" 
              tick={{ fill: '#64748b', fontSize: 10 }}
              axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
            />
            <YAxis 
              stroke="#64748b" 
              tick={{ fill: '#64748b', fontSize: 10 }}
              axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
            />
            <Tooltip content={<CustomTooltip />} />
            {chartData[0]?.threshold_max && (
              <ReferenceLine 
                y={chartData[0].threshold_max} 
                stroke="#ef4444" 
                strokeDasharray="3 3"
                strokeOpacity={0.7}
              />
            )}
            {chartData[0]?.threshold_min && (
              <ReferenceLine 
                y={chartData[0].threshold_min} 
                stroke="#ef4444" 
                strokeDasharray="3 3"
                strokeOpacity={0.7}
              />
            )}
            <Area
              type="monotone"
              dataKey="value"
              stroke="transparent"
              fill={`url(#gradient-${sensorType})`}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke={config.color}
              strokeWidth={2}
              dot={(props) => {
                const { cx, cy, payload } = props;
                if (payload.anomaly) {
                  return (
                    <circle cx={cx} cy={cy} r={4} fill="#ef4444" stroke="#ef4444" strokeWidth={2} />
                  );
                }
                return null;
              }}
              activeDot={{ r: 4, fill: config.color }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}