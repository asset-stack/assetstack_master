import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Ruler, X, Save, Calculator, TrendingUp, TrendingDown, 
  AlertTriangle, CheckCircle2, Clock
} from 'lucide-react';

const severityThresholds = {
  crack: { low: 1, medium: 3, high: 5, unit: 'mm width' },
  deformation: { low: 5, medium: 15, high: 30, unit: 'mm deviation' },
  corrosion: { low: 10, medium: 30, high: 50, unit: '% area' },
  displacement: { low: 10, medium: 25, high: 50, unit: 'mm' },
  settlement: { low: 5, medium: 15, high: 30, unit: 'mm' },
  structural_damage: { low: 5, medium: 15, high: 25, unit: '% integrity loss' },
  surface_degradation: { low: 10, medium: 25, high: 40, unit: '% area' }
};

export default function AnomalyMeasurementPanel({ anomaly, index, onUpdate, onClose }) {
  const [measurements, setMeasurements] = useState({
    length: anomaly?.measurement_value || '',
    width: '',
    depth: '',
    area: '',
    unit: anomaly?.measurement_unit || 'mm'
  });
  const [calculatedSeverity, setCalculatedSeverity] = useState(anomaly?.severity || 'medium');

  const thresholds = severityThresholds[anomaly?.type] || severityThresholds.crack;

  const calculateSeverity = (value) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return 'medium';
    if (numValue <= thresholds.low) return 'low';
    if (numValue <= thresholds.medium) return 'medium';
    if (numValue <= thresholds.high) return 'high';
    return 'critical';
  };

  const handleMeasurementChange = (field, value) => {
    setMeasurements({ ...measurements, [field]: value });
    if (field === 'length' || field === 'width') {
      const severity = calculateSeverity(value);
      setCalculatedSeverity(severity);
    }
  };

  const calculateArea = () => {
    const l = parseFloat(measurements.length);
    const w = parseFloat(measurements.width);
    if (!isNaN(l) && !isNaN(w)) {
      setMeasurements({ ...measurements, area: (l * w).toFixed(2) });
    }
  };

  const handleSave = () => {
    onUpdate(index, {
      ...anomaly,
      measurement_value: parseFloat(measurements.length) || anomaly.measurement_value,
      measurement_unit: measurements.unit,
      severity: calculatedSeverity,
      detailed_measurements: {
        length: measurements.length,
        width: measurements.width,
        depth: measurements.depth,
        area: measurements.area,
        unit: measurements.unit
      }
    });
    onClose();
  };

  const severityColors = {
    low: 'bg-green-100 text-green-700 border-green-200',
    medium: 'bg-amber-100 text-amber-700 border-amber-200',
    high: 'bg-orange-100 text-orange-700 border-orange-200',
    critical: 'bg-red-100 text-red-700 border-red-200'
  };

  const typeIcons = {
    crack: '🔨', deformation: '📐', corrosion: '🧪', displacement: '↔️',
    missing_component: '❓', structural_damage: '⚠️', surface_degradation: '🔍'
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="absolute top-4 right-4 w-96 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-20"
    >
      <div className="p-4 border-b border-slate-100 bg-slate-50">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-slate-900 flex items-center gap-2">
            <Ruler className="w-4 h-4 text-indigo-600" />
            Anomaly Measurement
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Anomaly Info */}
        <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
          <span className="text-2xl">{typeIcons[anomaly?.type] || '⚠️'}</span>
          <div className="flex-1">
            <p className="font-medium text-slate-900 capitalize">
              {anomaly?.type?.replace(/_/g, ' ')}
            </p>
            <p className="text-xs text-slate-500">{anomaly?.location_description}</p>
          </div>
          <Badge className={severityColors[anomaly?.severity]}>
            {anomaly?.severity}
          </Badge>
        </div>

        {/* Measurement Thresholds Info */}
        <div className="p-3 bg-indigo-50 rounded-lg text-xs">
          <p className="font-medium text-indigo-900 mb-2">Severity Thresholds ({thresholds.unit})</p>
          <div className="grid grid-cols-4 gap-2">
            <div className="text-center">
              <Badge className="bg-green-100 text-green-700 text-xs">Low</Badge>
              <p className="text-indigo-700 mt-1">≤{thresholds.low}</p>
            </div>
            <div className="text-center">
              <Badge className="bg-amber-100 text-amber-700 text-xs">Medium</Badge>
              <p className="text-indigo-700 mt-1">≤{thresholds.medium}</p>
            </div>
            <div className="text-center">
              <Badge className="bg-orange-100 text-orange-700 text-xs">High</Badge>
              <p className="text-indigo-700 mt-1">≤{thresholds.high}</p>
            </div>
            <div className="text-center">
              <Badge className="bg-red-100 text-red-700 text-xs">Critical</Badge>
              <p className="text-indigo-700 mt-1">&gt;{thresholds.high}</p>
            </div>
          </div>
        </div>

        {/* Measurement Inputs */}
        <div className="space-y-3">
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <Label className="text-xs">Primary Measurement</Label>
              <Input
                type="number"
                step="0.01"
                value={measurements.length}
                onChange={(e) => handleMeasurementChange('length', e.target.value)}
                placeholder="e.g., 5.5"
              />
            </div>
            <div className="w-24">
              <Select value={measurements.unit} onValueChange={(v) => setMeasurements({ ...measurements, unit: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mm">mm</SelectItem>
                  <SelectItem value="cm">cm</SelectItem>
                  <SelectItem value="m">m</SelectItem>
                  <SelectItem value="%">%</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">Width</Label>
              <Input
                type="number"
                step="0.01"
                value={measurements.width}
                onChange={(e) => handleMeasurementChange('width', e.target.value)}
                placeholder="Width"
              />
            </div>
            <div>
              <Label className="text-xs">Depth</Label>
              <Input
                type="number"
                step="0.01"
                value={measurements.depth}
                onChange={(e) => handleMeasurementChange('depth', e.target.value)}
                placeholder="Depth"
              />
            </div>
          </div>

          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <Label className="text-xs">Calculated Area</Label>
              <Input
                type="number"
                value={measurements.area}
                onChange={(e) => setMeasurements({ ...measurements, area: e.target.value })}
                placeholder="Area"
                readOnly={measurements.length && measurements.width}
              />
            </div>
            <Button 
              type="button" 
              variant="outline" 
              size="sm"
              onClick={calculateArea}
              disabled={!measurements.length || !measurements.width}
            >
              <Calculator className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Calculated Severity */}
        {measurements.length && (
          <div className="p-3 rounded-lg border-2 border-dashed border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Calculated Severity:</span>
              <Badge className={`${severityColors[calculatedSeverity]} text-sm`}>
                {calculatedSeverity === 'critical' && <AlertTriangle className="w-3 h-3 mr-1" />}
                {calculatedSeverity === 'low' && <CheckCircle2 className="w-3 h-3 mr-1" />}
                {calculatedSeverity.toUpperCase()}
              </Badge>
            </div>
            {calculatedSeverity !== anomaly?.severity && (
              <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                Severity changed from {anomaly?.severity} based on measurement
              </p>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button className="flex-1 bg-indigo-600 hover:bg-indigo-700" onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            Save Measurements
          </Button>
        </div>
      </div>
    </motion.div>
  );
}