import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, Plus, Ruler } from 'lucide-react';

const anomalyTypes = [
  { value: 'crack', label: 'Crack', icon: '🔨' },
  { value: 'deformation', label: 'Deformation', icon: '📐' },
  { value: 'corrosion', label: 'Corrosion', icon: '🧪' },
  { value: 'displacement', label: 'Displacement', icon: '↔️' },
  { value: 'missing_component', label: 'Missing Component', icon: '❓' },
  { value: 'structural_damage', label: 'Structural Damage', icon: '⚠️' },
  { value: 'surface_degradation', label: 'Surface Degradation', icon: '🔍' }
];

const severityLevels = [
  { value: 'low', label: 'Low', color: 'bg-green-100 text-green-700' },
  { value: 'medium', label: 'Medium', color: 'bg-amber-100 text-amber-700' },
  { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-700' },
  { value: 'critical', label: 'Critical', color: 'bg-red-100 text-red-700' }
];

export default function AddAnomalyDialog({ open, onOpenChange, onAdd, scanBoundingBox }) {
  const [formData, setFormData] = useState({
    type: 'crack',
    severity: 'medium',
    location_description: '',
    measurement_value: '',
    measurement_unit: 'mm',
    notes: '',
    coordinates: { x: 0, y: 0, z: 0 }
  });

  const bbox = scanBoundingBox || { min_x: -50, max_x: 50, min_y: -50, max_y: 50, min_z: 0, max_z: 20 };

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd({
      ...formData,
      measurement_value: formData.measurement_value ? parseFloat(formData.measurement_value) : null,
      coordinates: {
        x: parseFloat(formData.coordinates.x),
        y: parseFloat(formData.coordinates.y),
        z: parseFloat(formData.coordinates.z)
      }
    });
    onOpenChange(false);
    setFormData({
      type: 'crack',
      severity: 'medium',
      location_description: '',
      measurement_value: '',
      measurement_unit: 'mm',
      notes: '',
      coordinates: { x: 0, y: 0, z: 0 }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            Add Manual Anomaly
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Anomaly Type *</Label>
              <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {anomalyTypes.map(t => (
                    <SelectItem key={t.value} value={t.value}>
                      <span className="flex items-center gap-2">
                        <span>{t.icon}</span>
                        {t.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Severity *</Label>
              <Select value={formData.severity} onValueChange={(v) => setFormData({ ...formData, severity: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {severityLevels.map(s => (
                    <SelectItem key={s.value} value={s.value}>
                      <span className={`px-2 py-0.5 rounded text-xs ${s.color}`}>{s.label}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Location Description *</Label>
            <Input
              value={formData.location_description}
              onChange={(e) => setFormData({ ...formData, location_description: e.target.value })}
              placeholder="e.g., North wall, 2m from floor, near column A3"
              required
            />
          </div>

          <div className="p-3 bg-slate-50 rounded-lg">
            <Label className="flex items-center gap-2 mb-3">
              <Ruler className="w-4 h-4" />
              Coordinates (within scan bounds)
            </Label>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label className="text-xs text-slate-500">X ({bbox.min_x} to {bbox.max_x})</Label>
                <Input
                  type="number"
                  value={formData.coordinates.x}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    coordinates: { ...formData.coordinates, x: e.target.value }
                  })}
                  min={bbox.min_x}
                  max={bbox.max_x}
                />
              </div>
              <div>
                <Label className="text-xs text-slate-500">Y ({bbox.min_y} to {bbox.max_y})</Label>
                <Input
                  type="number"
                  value={formData.coordinates.y}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    coordinates: { ...formData.coordinates, y: e.target.value }
                  })}
                  min={bbox.min_y}
                  max={bbox.max_y}
                />
              </div>
              <div>
                <Label className="text-xs text-slate-500">Z ({bbox.min_z} to {bbox.max_z})</Label>
                <Input
                  type="number"
                  value={formData.coordinates.z}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    coordinates: { ...formData.coordinates, z: e.target.value }
                  })}
                  min={bbox.min_z}
                  max={bbox.max_z}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Measurement Value</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.measurement_value}
                onChange={(e) => setFormData({ ...formData, measurement_value: e.target.value })}
                placeholder="e.g., 5.5"
              />
            </div>
            <div>
              <Label>Unit</Label>
              <Select value={formData.measurement_unit} onValueChange={(v) => setFormData({ ...formData, measurement_unit: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="mm">Millimeters (mm)</SelectItem>
                  <SelectItem value="cm">Centimeters (cm)</SelectItem>
                  <SelectItem value="m">Meters (m)</SelectItem>
                  <SelectItem value="in">Inches (in)</SelectItem>
                  <SelectItem value="deg">Degrees (°)</SelectItem>
                  <SelectItem value="%">Percentage (%)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Notes</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional observations, context, or details..."
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-amber-500 hover:bg-amber-600">
              <Plus className="w-4 h-4 mr-2" />
              Add Anomaly
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}