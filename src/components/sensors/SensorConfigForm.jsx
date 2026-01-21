import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

const DEFAULT_UNITS = {
  vibration: 'mm/s',
  temperature: '°C',
  pressure: 'bar',
  current: 'A',
  voltage: 'V',
  flow_rate: 'L/min',
  rpm: 'RPM',
  humidity: '%',
  noise_level: 'dB',
  oil_quality: '%',
  strain: 'με',
  displacement: 'mm',
  crack_width: 'mm',
  tilt: '°',
  acceleration: 'm/s²',
  corrosion: 'μm/year',
  moisture: '%',
  wind_speed: 'm/s',
  seismic_activity: 'g',
  structural_load: 'kN',
  deflection: 'mm',
  acoustic_emission: 'dB',
  water_level: 'm'
};

export default function SensorConfigForm({ equipment, sensorTypes, onSuccess, onCancel, initialData }) {
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState(initialData || {
    equipment_id: '',
    sensor_name: '',
    sensor_type: '',
    external_sensor_id: '',
    unit: '',
    threshold_min: '',
    threshold_max: '',
    warning_min: '',
    warning_max: '',
    sampling_rate_seconds: '',
    data_source: 'api',
    is_active: true,
    notes: ''
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.SensorConfiguration.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['sensorConfigs']);
      
      // Update onboarding
      base44.entities.OnboardingProgress.filter({}).then(progress => {
        if (progress.length > 0) {
          base44.entities.OnboardingProgress.update(progress[0].id, {
            step_sensors_configured: true
          });
        }
      });
      
      onSuccess?.();
    },
  });

  const handleSensorTypeChange = (type) => {
    setFormData({
      ...formData,
      sensor_type: type,
      unit: formData.unit || DEFAULT_UNITS[type] || ''
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const dataToSave = {
      ...formData,
      threshold_min: formData.threshold_min ? parseFloat(formData.threshold_min) : undefined,
      threshold_max: formData.threshold_max ? parseFloat(formData.threshold_max) : undefined,
      warning_min: formData.warning_min ? parseFloat(formData.warning_min) : undefined,
      warning_max: formData.warning_max ? parseFloat(formData.warning_max) : undefined,
      sampling_rate_seconds: formData.sampling_rate_seconds ? parseInt(formData.sampling_rate_seconds) : undefined,
      status: 'offline'
    };
    
    createMutation.mutate(dataToSave);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Equipment *</Label>
          <Select 
            value={formData.equipment_id} 
            onValueChange={(v) => setFormData({ ...formData, equipment_id: v })}
          >
            <SelectTrigger className="bg-white border-slate-200">
              <SelectValue placeholder="Select equipment" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              {equipment.map(eq => (
                <SelectItem key={eq.id} value={eq.id}>
                  {eq.name} ({eq.type?.replace(/_/g, ' ')})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Sensor Name *</Label>
          <Input
            value={formData.sensor_name}
            onChange={(e) => setFormData({ ...formData, sensor_name: e.target.value })}
            placeholder="e.g., Main Motor Temperature"
            className="bg-white border-slate-200"
          />
        </div>

        <div className="space-y-2">
          <Label>Sensor Type *</Label>
          <Select 
            value={formData.sensor_type} 
            onValueChange={handleSensorTypeChange}
          >
            <SelectTrigger className="bg-white border-slate-200">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent className="bg-white max-h-60">
              {sensorTypes.map(type => (
                <SelectItem key={type} value={type} className="capitalize">
                  {type.replace(/_/g, ' ')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>External Sensor ID</Label>
          <Input
            value={formData.external_sensor_id}
            onChange={(e) => setFormData({ ...formData, external_sensor_id: e.target.value })}
            placeholder="ID from IoT platform"
            className="bg-white border-slate-200"
          />
        </div>

        <div className="space-y-2">
          <Label>Unit</Label>
          <Input
            value={formData.unit}
            onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
            placeholder="e.g., °C, bar, mm/s"
            className="bg-white border-slate-200"
          />
        </div>

        <div className="space-y-2">
          <Label>Data Source</Label>
          <Select 
            value={formData.data_source} 
            onValueChange={(v) => setFormData({ ...formData, data_source: v })}
          >
            <SelectTrigger className="bg-white border-slate-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="api">API Integration</SelectItem>
              <SelectItem value="mqtt">MQTT</SelectItem>
              <SelectItem value="csv_import">CSV Import</SelectItem>
              <SelectItem value="manual">Manual Entry</SelectItem>
              <SelectItem value="iot_platform">IoT Platform</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="border-t border-slate-200 pt-4">
        <h4 className="font-medium text-slate-900 mb-4">Thresholds & Alerts</h4>
        <div className="grid grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label className="text-slate-500">Critical Min</Label>
            <Input
              type="number"
              step="any"
              value={formData.threshold_min}
              onChange={(e) => setFormData({ ...formData, threshold_min: e.target.value })}
              placeholder="Min"
              className="bg-white border-slate-200"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-slate-500">Warning Min</Label>
            <Input
              type="number"
              step="any"
              value={formData.warning_min}
              onChange={(e) => setFormData({ ...formData, warning_min: e.target.value })}
              placeholder="Min"
              className="bg-white border-slate-200"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-slate-500">Warning Max</Label>
            <Input
              type="number"
              step="any"
              value={formData.warning_max}
              onChange={(e) => setFormData({ ...formData, warning_max: e.target.value })}
              placeholder="Max"
              className="bg-white border-slate-200"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-slate-500">Critical Max</Label>
            <Input
              type="number"
              step="any"
              value={formData.threshold_max}
              onChange={(e) => setFormData({ ...formData, threshold_max: e.target.value })}
              placeholder="Max"
              className="bg-white border-slate-200"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Sampling Rate (seconds)</Label>
          <Input
            type="number"
            value={formData.sampling_rate_seconds}
            onChange={(e) => setFormData({ ...formData, sampling_rate_seconds: e.target.value })}
            placeholder="e.g., 60"
            className="bg-white border-slate-200"
          />
        </div>
        <div className="flex items-center gap-3 pt-6">
          <Switch
            checked={formData.is_active}
            onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
          />
          <Label>Sensor Active</Label>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Notes</Label>
        <Textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Additional notes about this sensor..."
          className="bg-white border-slate-200"
          rows={3}
        />
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
        <Button type="button" variant="outline" onClick={onCancel} className="border-slate-200">
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={!formData.equipment_id || !formData.sensor_name || !formData.sensor_type || createMutation.isPending}
          className="bg-indigo-600 hover:bg-indigo-700"
        >
          {createMutation.isPending ? 'Saving...' : 'Save Sensor'}
        </Button>
      </div>
    </form>
  );
}