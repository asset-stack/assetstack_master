import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Zap, Play, CheckCircle2, Loader2, AlertTriangle, Sparkles } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const SENSOR_PROFILES = {
  normal: { name: 'Normal Operation', variance: 0.1, anomalyRate: 0.02 },
  degrading: { name: 'Degrading Equipment', variance: 0.2, anomalyRate: 0.15, trend: 0.02 },
  critical: { name: 'Critical Condition', variance: 0.3, anomalyRate: 0.35, trend: 0.05 },
  random: { name: 'Random Variation', variance: 0.25, anomalyRate: 0.1 }
};

const DEFAULT_BASELINES = {
  vibration: { base: 2.5, unit: 'mm/s', min: 0, max: 10 },
  temperature: { base: 45, unit: '°C', min: 20, max: 90 },
  pressure: { base: 3.5, unit: 'bar', min: 1, max: 8 },
  current: { base: 15, unit: 'A', min: 5, max: 30 },
  voltage: { base: 380, unit: 'V', min: 360, max: 420 },
  rpm: { base: 1500, unit: 'RPM', min: 0, max: 3000 },
  humidity: { base: 55, unit: '%', min: 30, max: 80 },
  flow_rate: { base: 100, unit: 'L/min', min: 50, max: 200 },
  strain: { base: 150, unit: 'με', min: 0, max: 500 },
  displacement: { base: 0.5, unit: 'mm', min: 0, max: 5 },
  crack_width: { base: 0.2, unit: 'mm', min: 0, max: 2 },
  tilt: { base: 0.1, unit: '°', min: 0, max: 2 },
  acceleration: { base: 0.05, unit: 'g', min: 0, max: 1 }
};

export default function GenerateSampleData({ equipment, sensorConfigs, onDataGenerated }) {
  const [selectedEquipment, setSelectedEquipment] = useState('all');
  const [profile, setProfile] = useState('normal');
  const [readingsCount, setReadingsCount] = useState(50);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState(null);

  const queryClient = useQueryClient();

  const generateReadings = async () => {
    setIsGenerating(true);
    setProgress(0);
    setResults(null);

    const profileConfig = SENSOR_PROFILES[profile];
    const targetEquipment = selectedEquipment === 'all' 
      ? equipment 
      : equipment.filter(e => e.id === selectedEquipment);

    if (targetEquipment.length === 0) {
      setResults({ success: false, error: 'No equipment selected' });
      setIsGenerating(false);
      return;
    }

    let totalCreated = 0;
    let totalAnomalies = 0;
    const sensorTypesUsed = new Set();

    try {
      for (let eqIdx = 0; eqIdx < targetEquipment.length; eqIdx++) {
        const eq = targetEquipment[eqIdx];
        
        // Get sensor configs for this equipment or use defaults
        const eqSensors = sensorConfigs.filter(s => s.equipment_id === eq.id);
        const sensorTypes = eqSensors.length > 0 
          ? eqSensors.map(s => ({ type: s.sensor_type, config: s }))
          : [
              { type: 'vibration', config: null },
              { type: 'temperature', config: null },
              { type: 'pressure', config: null }
            ];

        const readingsPerEquipment = Math.ceil(readingsCount / targetEquipment.length);
        const readingsPerSensor = Math.ceil(readingsPerEquipment / sensorTypes.length);

        for (const sensor of sensorTypes) {
          const baseline = DEFAULT_BASELINES[sensor.type] || DEFAULT_BASELINES.vibration;
          const thresholdMin = sensor.config?.threshold_min ?? baseline.min;
          const thresholdMax = sensor.config?.threshold_max ?? baseline.max;

          for (let i = 0; i < readingsPerSensor; i++) {
            // Calculate time offset (spread over last 24 hours)
            const timeOffset = (readingsPerSensor - i) * (24 * 60 * 60 * 1000 / readingsPerSensor);
            const timestamp = new Date(Date.now() - timeOffset);

            // Generate value based on profile
            let value = baseline.base;
            
            // Add variance
            const variance = baseline.base * profileConfig.variance * (Math.random() - 0.5) * 2;
            value += variance;

            // Add trend for degrading profiles
            if (profileConfig.trend) {
              value += baseline.base * profileConfig.trend * (i / readingsPerSensor);
            }

            // Occasionally create anomalies
            const isAnomaly = Math.random() < profileConfig.anomalyRate;
            if (isAnomaly) {
              // Push value outside thresholds
              if (Math.random() > 0.5) {
                value = thresholdMax * (1 + 0.1 + Math.random() * 0.3);
              } else {
                value = thresholdMin * (0.9 - Math.random() * 0.3);
              }
              totalAnomalies++;
            }

            // Ensure value is reasonable
            value = Math.max(0, value);

            const anomalyScore = isAnomaly 
              ? Math.min(100, 30 + Math.random() * 70)
              : 0;

            await base44.entities.SensorReading.create({
              equipment_id: eq.id,
              sensor_type: sensor.type,
              value: Math.round(value * 100) / 100,
              unit: sensor.config?.unit || baseline.unit,
              timestamp: timestamp.toISOString(),
              threshold_min: thresholdMin,
              threshold_max: thresholdMax,
              is_anomaly: isAnomaly,
              anomaly_score: anomalyScore
            });

            totalCreated++;
            sensorTypesUsed.add(sensor.type);
          }

          // Update sensor config if it exists
          if (sensor.config) {
            await base44.entities.SensorConfiguration.update(sensor.config.id, {
              last_reading_at: new Date().toISOString(),
              last_reading_value: Math.round((baseline.base + (profileConfig.trend ? baseline.base * profileConfig.trend : 0)) * 100) / 100,
              status: 'online'
            });
          }
        }

        setProgress(((eqIdx + 1) / targetEquipment.length) * 100);
      }

      // Log the data generation
      await base44.entities.DataIngestionLog.create({
        source: 'manual',
        status: 'success',
        records_received: totalCreated,
        records_processed: totalCreated,
        records_failed: 0,
        equipment_ids: targetEquipment.map(e => e.id),
        sensor_types: Array.from(sensorTypesUsed),
        processing_time_ms: 0
      });

      // Update onboarding
      const onboarding = await base44.entities.OnboardingProgress.filter({});
      if (onboarding.length > 0) {
        await base44.entities.OnboardingProgress.update(onboarding[0].id, {
          step_sensor_data_received: true
        });
      }

      setResults({
        success: true,
        created: totalCreated,
        anomalies: totalAnomalies,
        equipmentCount: targetEquipment.length,
        sensorTypes: Array.from(sensorTypesUsed)
      });

      queryClient.invalidateQueries(['recentReadings', 'sensorConfigs', 'ingestionLogs']);
      onDataGenerated?.();

    } catch (error) {
      setResults({ success: false, error: error.message });
    }

    setIsGenerating(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl border border-purple-200 p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-white rounded-xl shadow-sm">
            <Sparkles className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Generate Sample Sensor Data</h2>
            <p className="text-sm text-slate-600 mt-1">
              Create realistic sensor readings for testing and demonstration. 
              Data is generated with configurable patterns and anomaly rates.
            </p>
          </div>
        </div>
      </div>

      {/* Configuration */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="font-semibold text-slate-900 mb-4">Configuration</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label>Target Equipment</Label>
            <Select value={selectedEquipment} onValueChange={setSelectedEquipment}>
              <SelectTrigger className="bg-white border-slate-200">
                <SelectValue placeholder="Select equipment" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="all">All Equipment ({equipment.length})</SelectItem>
                {equipment.map(eq => (
                  <SelectItem key={eq.id} value={eq.id}>{eq.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Data Profile</Label>
            <Select value={profile} onValueChange={setProfile}>
              <SelectTrigger className="bg-white border-slate-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {Object.entries(SENSOR_PROFILES).map(([key, config]) => (
                  <SelectItem key={key} value={key}>{config.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-slate-500">
              {SENSOR_PROFILES[profile].name}: ~{Math.round(SENSOR_PROFILES[profile].anomalyRate * 100)}% anomaly rate
            </p>
          </div>

          <div className="space-y-2">
            <Label>Number of Readings</Label>
            <Input
              type="number"
              min={10}
              max={500}
              value={readingsCount}
              onChange={(e) => setReadingsCount(parseInt(e.target.value) || 50)}
              className="bg-white border-slate-200"
            />
            <p className="text-xs text-slate-500">Distributed across equipment and sensors</p>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-4">
          <Button
            onClick={generateReadings}
            disabled={isGenerating || equipment.length === 0}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Generate Data
              </>
            )}
          </Button>
          
          {equipment.length === 0 && (
            <p className="text-sm text-amber-600 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Add equipment first to generate sensor data
            </p>
          )}
        </div>

        {isGenerating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4"
          >
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-slate-500 mt-1">{Math.round(progress)}% complete</p>
          </motion.div>
        )}
      </div>

      {/* Results */}
      {results && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-xl border p-6 ${
            results.success 
              ? 'bg-emerald-50 border-emerald-200' 
              : 'bg-rose-50 border-rose-200'
          }`}
        >
          {results.success ? (
            <div className="flex items-start gap-4">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-emerald-900">Data Generated Successfully!</h4>
                <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white rounded-lg p-3">
                    <p className="text-2xl font-bold text-slate-900">{results.created}</p>
                    <p className="text-xs text-slate-500">Readings Created</p>
                  </div>
                  <div className="bg-white rounded-lg p-3">
                    <p className="text-2xl font-bold text-amber-600">{results.anomalies}</p>
                    <p className="text-xs text-slate-500">Anomalies</p>
                  </div>
                  <div className="bg-white rounded-lg p-3">
                    <p className="text-2xl font-bold text-slate-900">{results.equipmentCount}</p>
                    <p className="text-xs text-slate-500">Equipment</p>
                  </div>
                  <div className="bg-white rounded-lg p-3">
                    <p className="text-2xl font-bold text-slate-900">{results.sensorTypes.length}</p>
                    <p className="text-xs text-slate-500">Sensor Types</p>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {results.sensorTypes.map(type => (
                    <Badge key={type} variant="outline" className="capitalize bg-white">
                      {type.replace(/_/g, ' ')}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-6 h-6 text-rose-600 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-rose-900">Generation Failed</h4>
                <p className="text-sm text-rose-700 mt-1">{results.error}</p>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Profile Descriptions */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="font-semibold text-slate-900 mb-4">Data Profiles</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(SENSOR_PROFILES).map(([key, config]) => (
            <div 
              key={key} 
              className={`p-4 rounded-lg border ${profile === key ? 'border-purple-300 bg-purple-50' : 'border-slate-200'}`}
            >
              <h4 className="font-medium text-slate-900">{config.name}</h4>
              <div className="mt-2 space-y-1 text-sm text-slate-600">
                <p>Variance: ±{Math.round(config.variance * 100)}%</p>
                <p>Anomaly Rate: ~{Math.round(config.anomalyRate * 100)}%</p>
                {config.trend && <p>Trend: +{Math.round(config.trend * 100)}% progressive</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}