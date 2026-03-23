import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';
import { Send, CheckCircle, XCircle, Loader2, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

const SENSOR_TYPES = [
  'temperature', 'vibration', 'pressure', 'current', 'voltage', 'flow_rate',
  'rpm', 'humidity', 'noise_level', 'oil_quality'
];

const DEFAULT_UNITS = {
  temperature: '°C', vibration: 'mm/s', pressure: 'bar', current: 'A',
  voltage: 'V', flow_rate: 'L/min', rpm: 'RPM', humidity: '%',
  noise_level: 'dB', oil_quality: '%'
};

export default function SendTestReading({ equipment, sensorConfigs }) {
  const queryClient = useQueryClient();
  const [equipmentId, setEquipmentId] = useState('');
  const [sensorType, setSensorType] = useState('temperature');
  const [value, setValue] = useState('45.2');
  const [isSending, setIsSending] = useState(false);
  const [result, setResult] = useState(null);

  const handleSend = async () => {
    if (!equipmentId || !value) return;
    setIsSending(true);
    setResult(null);

    const response = await base44.functions.invoke('ingestSensorData', {
      readings: [{
        equipment_id: equipmentId,
        sensor_type: sensorType,
        value: parseFloat(value),
        unit: DEFAULT_UNITS[sensorType] || '',
        timestamp: new Date().toISOString()
      }]
    });

    setResult(response.data);
    setIsSending(false);
    queryClient.invalidateQueries(['recentReadings', 'sensorConfigs', 'ingestionLogs']);
  };

  const handleQuickSend = async (config) => {
    setIsSending(true);
    setResult(null);

    // Generate a realistic random value near the midpoint of thresholds
    const mid = ((config.threshold_min || 0) + (config.threshold_max || 100)) / 2;
    const range = ((config.threshold_max || 100) - (config.threshold_min || 0));
    const randomValue = mid + (Math.random() - 0.5) * range * 0.8;

    const response = await base44.functions.invoke('ingestSensorData', {
      readings: [{
        equipment_id: config.equipment_id,
        sensor_type: config.sensor_type,
        value: parseFloat(randomValue.toFixed(2)),
        unit: config.unit || DEFAULT_UNITS[config.sensor_type] || '',
        timestamp: new Date().toISOString(),
        external_sensor_id: config.external_sensor_id
      }]
    });

    setResult(response.data);
    setIsSending(false);
    queryClient.invalidateQueries(['recentReadings', 'sensorConfigs', 'ingestionLogs']);
  };

  return (
    <div className="space-y-6">
      {/* Quick send from existing configs */}
      {sensorConfigs.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="font-semibold text-slate-900 mb-1 flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500" />
            Quick Test — Send to Existing Sensors
          </h3>
          <p className="text-sm text-slate-500 mb-4">Click a sensor below to send a simulated reading through the full pipeline.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {sensorConfigs.slice(0, 9).map(config => {
              const equip = equipment.find(e => e.id === config.equipment_id);
              return (
                <button
                  key={config.id}
                  onClick={() => handleQuickSend(config)}
                  disabled={isSending}
                  className="text-left bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 rounded-lg p-3 transition-colors disabled:opacity-50"
                >
                  <p className="font-medium text-slate-900 text-sm truncate">{config.sensor_name}</p>
                  <p className="text-xs text-slate-500 truncate">{equip?.name || 'Unknown'}</p>
                  <Badge variant="outline" className="capitalize mt-1 text-[10px]">
                    {config.sensor_type?.replace(/_/g, ' ')}
                  </Badge>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Manual test */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="font-semibold text-slate-900 mb-1 flex items-center gap-2">
          <Send className="w-5 h-5 text-indigo-600" />
          Manual Test Reading
        </h3>
        <p className="text-sm text-slate-500 mb-4">Send a custom sensor reading to verify the pipeline works end-to-end.</p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <div className="space-y-2">
            <Label className="text-xs text-slate-600">Equipment</Label>
            <Select value={equipmentId} onValueChange={setEquipmentId}>
              <SelectTrigger className="bg-white border-slate-200">
                <SelectValue placeholder="Select equipment" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {equipment.map(eq => (
                  <SelectItem key={eq.id} value={eq.id}>{eq.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-slate-600">Sensor Type</Label>
            <Select value={sensorType} onValueChange={setSensorType}>
              <SelectTrigger className="bg-white border-slate-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {SENSOR_TYPES.map(t => (
                  <SelectItem key={t} value={t} className="capitalize">{t.replace(/_/g, ' ')}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-slate-600">Value ({DEFAULT_UNITS[sensorType] || ''})</Label>
            <Input
              type="number"
              step="any"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="bg-white border-slate-200"
            />
          </div>
        </div>

        <Button
          onClick={handleSend}
          disabled={!equipmentId || !value || isSending}
          className="bg-indigo-600 hover:bg-indigo-700"
        >
          {isSending ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sending...</>
          ) : (
            <><Send className="w-4 h-4 mr-2" /> Send Test Reading</>
          )}
        </Button>
      </div>

      {/* Result */}
      {result && (
        <div className={`rounded-xl border p-4 flex items-start gap-3 ${
          result.success && result.failed === 0 
            ? 'bg-emerald-50 border-emerald-200' 
            : 'bg-rose-50 border-rose-200'
        }`}>
          {result.success && result.failed === 0 ? (
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          )}
          <div>
            <p className={`font-medium text-sm ${result.success && result.failed === 0 ? 'text-emerald-800' : 'text-rose-800'}`}>
              {result.success && result.failed === 0
                ? `Reading ingested successfully (${result.processing_time_ms}ms)`
                : result.error || `Failed: ${result.errors?.join(', ')}`}
            </p>
            {result.success && (
              <p className="text-xs text-slate-600 mt-1">
                Received: {result.received} • Processed: {result.processed} • Failed: {result.failed}
              </p>
            )}
            {result.success && result.failed === 0 && (
              <p className="text-xs text-emerald-600 mt-1">
                Check "Live Monitoring" tab to see the reading appear in real-time.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}