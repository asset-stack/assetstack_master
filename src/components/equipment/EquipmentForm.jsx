import React, { useState, useEffect } from 'react';
import { Cpu, Save, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const EQUIPMENT_TYPES = [
  'motor', 'pump', 'compressor', 'turbine', 'conveyor', 
  'hvac', 'generator', 'transformer', 'valve', 'heat_exchanger',
  'railway_track', 'railway_switch', 'railway_signal',
  'bridge', 'building', 'tunnel', 'dam', 'power_line',
  'wind_turbine', 'elevator', 'escalator', 'hvac_system',
  'fire_suppression', 'water_treatment', 'road_surface',
  'retaining_wall', 'parking_structure'
];

const STATUSES = ['operational', 'degraded', 'critical', 'maintenance', 'offline'];
const RISK_LEVELS = ['low', 'medium', 'high', 'critical'];
const CRITICALITIES = ['low', 'medium', 'high', 'mission_critical'];

export default function EquipmentForm({ open, onOpenChange, equipment, onSave, isSaving, locations = [], defaultLocation = '' }) {
  const isEditing = !!equipment?.id;
  
  const [formData, setFormData] = useState({
    name: '',
    type: 'motor',
    location: '',
    room: '',
    manufacturer: '',
    model: '',
    serial_number: '',
    installation_date: '',
    last_maintenance_date: '',
    operating_hours: '',
    rated_capacity: '',
    capacity_unit: '',
    health_score: 100,
    status: 'operational',
    risk_level: 'low',
    criticality: 'medium',
    predicted_failure_date: '',
    remaining_useful_life_days: '',
    failure_probability: '',
    tags: [],
  });

  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    if (equipment) {
      setFormData({
        name: equipment.name || '',
        type: equipment.type || 'motor',
        location: equipment.location || '',
        room: equipment.room || '',
        manufacturer: equipment.manufacturer || '',
        model: equipment.model || '',
        serial_number: equipment.serial_number || '',
        installation_date: equipment.installation_date || '',
        last_maintenance_date: equipment.last_maintenance_date || '',
        operating_hours: equipment.operating_hours || '',
        rated_capacity: equipment.rated_capacity || '',
        capacity_unit: equipment.capacity_unit || '',
        health_score: equipment.health_score ?? 100,
        status: equipment.status || 'operational',
        risk_level: equipment.risk_level || 'low',
        criticality: equipment.criticality || 'medium',
        predicted_failure_date: equipment.predicted_failure_date || '',
        remaining_useful_life_days: equipment.remaining_useful_life_days || '',
        failure_probability: equipment.failure_probability || '',
        tags: equipment.tags || [],
      });
    } else {
      setFormData({
        name: '',
        type: 'motor',
        location: defaultLocation || '',
        room: '',
        manufacturer: '',
        model: '',
        serial_number: '',
        installation_date: '',
        last_maintenance_date: '',
        operating_hours: '',
        rated_capacity: '',
        capacity_unit: '',
        health_score: 100,
        status: 'operational',
        risk_level: 'low',
        criticality: 'medium',
        predicted_failure_date: '',
        remaining_useful_life_days: '',
        failure_probability: '',
        tags: [],
      });
    }
  }, [equipment, open]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanData = { ...formData };
    // Convert numeric fields
    if (cleanData.operating_hours) cleanData.operating_hours = Number(cleanData.operating_hours);
    if (cleanData.rated_capacity) cleanData.rated_capacity = Number(cleanData.rated_capacity);
    if (cleanData.health_score) cleanData.health_score = Number(cleanData.health_score);
    if (cleanData.remaining_useful_life_days) cleanData.remaining_useful_life_days = Number(cleanData.remaining_useful_life_days);
    if (cleanData.failure_probability) cleanData.failure_probability = Number(cleanData.failure_probability);
    // Remove empty strings
    Object.keys(cleanData).forEach(key => {
      if (cleanData[key] === '') delete cleanData[key];
    });
    onSave(cleanData);
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] });
      setTagInput('');
    }
  };

  const removeTag = (tag) => {
    setFormData({ ...formData, tags: formData.tags.filter(t => t !== tag) });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white border-slate-200 text-slate-900 max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-indigo-600" />
            {isEditing ? 'Edit Equipment' : 'Add New Equipment'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="bg-slate-100 mb-4">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="technical">Technical</TabsTrigger>
              <TabsTrigger value="status">Status & Risk</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Name *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Equipment name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Type *</Label>
                  <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="max-h-60 bg-white">
                      {EQUIPMENT_TYPES.map(type => (
                        <SelectItem key={type} value={type} className="capitalize">
                          {type.replace(/_/g, ' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Location *</Label>
                  {locations.length > 0 ? (
                    <Select value={formData.location} onValueChange={(v) => setFormData({ ...formData, location: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select location" />
                      </SelectTrigger>
                      <SelectContent className="max-h-60 bg-white">
                        {locations.map(loc => (
                          <SelectItem key={loc.id} value={loc.name}>
                            {loc.name}{loc.code ? ` (${loc.code})` : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="Building / Zone / Area"
                      required
                    />
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Room / Zone</Label>
                  <Input
                    value={formData.room}
                    onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                    placeholder="e.g. Plant Room, Level 2 — Office 204"
                  />
                  <p className="text-[11px] text-slate-500">Every asset should be tied to a room or zone inside its location.</p>
                </div>
                <div className="space-y-2">
                  <Label>Manufacturer</Label>
                  <Input
                    value={formData.manufacturer}
                    onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                    placeholder="Manufacturer name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Model</Label>
                  <Input
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    placeholder="Model number"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Serial Number</Label>
                  <Input
                    value={formData.serial_number}
                    onChange={(e) => setFormData({ ...formData, serial_number: e.target.value })}
                    placeholder="Serial number"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Installation Date</Label>
                  <Input
                    type="date"
                    value={formData.installation_date}
                    onChange={(e) => setFormData({ ...formData, installation_date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Criticality</Label>
                  <Select value={formData.criticality} onValueChange={(v) => setFormData({ ...formData, criticality: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      {CRITICALITIES.map(c => (
                        <SelectItem key={c} value={c} className="capitalize">
                          {c.replace(/_/g, ' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Tags</Label>
                <div className="flex gap-2">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="Add a tag"
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  />
                  <Button type="button" variant="outline" onClick={addTag}>Add</Button>
                </div>
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.tags.map(tag => (
                      <span key={tag} className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm flex items-center gap-1">
                        {tag}
                        <button type="button" onClick={() => removeTag(tag)} className="hover:text-indigo-900">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="technical" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Operating Hours</Label>
                  <Input
                    type="number"
                    value={formData.operating_hours}
                    onChange={(e) => setFormData({ ...formData, operating_hours: e.target.value })}
                    placeholder="Total operating hours"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Last Maintenance Date</Label>
                  <Input
                    type="date"
                    value={formData.last_maintenance_date}
                    onChange={(e) => setFormData({ ...formData, last_maintenance_date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Rated Capacity</Label>
                  <Input
                    type="number"
                    value={formData.rated_capacity}
                    onChange={(e) => setFormData({ ...formData, rated_capacity: e.target.value })}
                    placeholder="Capacity value"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Capacity Unit</Label>
                  <Input
                    value={formData.capacity_unit}
                    onChange={(e) => setFormData({ ...formData, capacity_unit: e.target.value })}
                    placeholder="kW, HP, tons, etc."
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="status" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      {STATUSES.map(s => (
                        <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Risk Level</Label>
                  <Select value={formData.risk_level} onValueChange={(v) => setFormData({ ...formData, risk_level: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      {RISK_LEVELS.map(r => (
                        <SelectItem key={r} value={r} className="capitalize">{r}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Health Score (0-100)</Label>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={formData.health_score}
                    onChange={(e) => setFormData({ ...formData, health_score: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Failure Probability (%)</Label>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={formData.failure_probability}
                    onChange={(e) => setFormData({ ...formData, failure_probability: e.target.value })}
                    placeholder="0-100"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Remaining Useful Life (days)</Label>
                  <Input
                    type="number"
                    value={formData.remaining_useful_life_days}
                    onChange={(e) => setFormData({ ...formData, remaining_useful_life_days: e.target.value })}
                    placeholder="Days"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Predicted Failure Date</Label>
                  <Input
                    type="date"
                    value={formData.predicted_failure_date}
                    onChange={(e) => setFormData({ ...formData, predicted_failure_date: e.target.value })}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700" disabled={isSaving}>
              <Save className="w-4 h-4 mr-2" />
              {isEditing ? 'Update Equipment' : 'Add Equipment'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}