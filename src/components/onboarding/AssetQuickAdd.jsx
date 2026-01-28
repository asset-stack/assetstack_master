import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, MapPin, Check, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Asset type suggestions by industry
const ASSET_SUGGESTIONS = {
  local_government: [
    { type: 'road_surface', name: 'Road Section' },
    { type: 'bridge', name: 'Bridge' },
    { type: 'building', name: 'Council Building' },
    { type: 'water_treatment', name: 'Water Treatment Plant' },
    { type: 'parking_structure', name: 'Parking Facility' },
  ],
  utilities: [
    { type: 'pump', name: 'Water Pump Station' },
    { type: 'transformer', name: 'Electrical Transformer' },
    { type: 'power_line', name: 'Power Line Section' },
    { type: 'water_treatment', name: 'Treatment Facility' },
    { type: 'valve', name: 'Main Valve' },
  ],
  property_management: [
    { type: 'hvac_system', name: 'HVAC System' },
    { type: 'elevator', name: 'Elevator' },
    { type: 'fire_suppression', name: 'Fire Suppression System' },
    { type: 'building', name: 'Building' },
    { type: 'generator', name: 'Backup Generator' },
  ],
  healthcare: [
    { type: 'hvac_system', name: 'HVAC System' },
    { type: 'generator', name: 'Emergency Generator' },
    { type: 'elevator', name: 'Patient Elevator' },
    { type: 'water_treatment', name: 'Water System' },
    { type: 'fire_suppression', name: 'Fire Safety System' },
  ],
  education: [
    { type: 'hvac_system', name: 'Campus HVAC' },
    { type: 'building', name: 'Academic Building' },
    { type: 'elevator', name: 'Building Elevator' },
    { type: 'fire_suppression', name: 'Fire System' },
    { type: 'generator', name: 'Backup Power' },
  ],
  rail_transport: [
    { type: 'railway_track', name: 'Track Section' },
    { type: 'railway_switch', name: 'Railway Switch' },
    { type: 'railway_signal', name: 'Signal System' },
    { type: 'bridge', name: 'Rail Bridge' },
    { type: 'tunnel', name: 'Tunnel Section' },
  ],
  manufacturing: [
    { type: 'motor', name: 'Production Motor' },
    { type: 'conveyor', name: 'Conveyor System' },
    { type: 'compressor', name: 'Air Compressor' },
    { type: 'pump', name: 'Process Pump' },
    { type: 'heat_exchanger', name: 'Heat Exchanger' },
  ],
  logistics: [
    { type: 'conveyor', name: 'Sorting Conveyor' },
    { type: 'hvac_system', name: 'Warehouse Climate' },
    { type: 'elevator', name: 'Loading Dock Lift' },
    { type: 'generator', name: 'Backup Power' },
    { type: 'fire_suppression', name: 'Fire System' },
  ],
  mining: [
    { type: 'conveyor', name: 'Material Conveyor' },
    { type: 'pump', name: 'Dewatering Pump' },
    { type: 'compressor', name: 'Mining Compressor' },
    { type: 'turbine', name: 'Ventilation Turbine' },
    { type: 'motor', name: 'Crusher Motor' },
  ],
  other: [
    { type: 'motor', name: 'Motor' },
    { type: 'pump', name: 'Pump' },
    { type: 'compressor', name: 'Compressor' },
    { type: 'hvac', name: 'HVAC Unit' },
    { type: 'generator', name: 'Generator' },
  ],
};

const ALL_ASSET_TYPES = [
  { value: 'motor', label: 'Motor' },
  { value: 'pump', label: 'Pump' },
  { value: 'compressor', label: 'Compressor' },
  { value: 'turbine', label: 'Turbine' },
  { value: 'conveyor', label: 'Conveyor' },
  { value: 'hvac', label: 'HVAC' },
  { value: 'generator', label: 'Generator' },
  { value: 'transformer', label: 'Transformer' },
  { value: 'valve', label: 'Valve' },
  { value: 'heat_exchanger', label: 'Heat Exchanger' },
  { value: 'railway_track', label: 'Railway Track' },
  { value: 'railway_switch', label: 'Railway Switch' },
  { value: 'railway_signal', label: 'Railway Signal' },
  { value: 'bridge', label: 'Bridge' },
  { value: 'building', label: 'Building' },
  { value: 'tunnel', label: 'Tunnel' },
  { value: 'dam', label: 'Dam' },
  { value: 'power_line', label: 'Power Line' },
  { value: 'wind_turbine', label: 'Wind Turbine' },
  { value: 'elevator', label: 'Elevator' },
  { value: 'escalator', label: 'Escalator' },
  { value: 'hvac_system', label: 'HVAC System' },
  { value: 'fire_suppression', label: 'Fire Suppression' },
  { value: 'water_treatment', label: 'Water Treatment' },
  { value: 'road_surface', label: 'Road Surface' },
  { value: 'retaining_wall', label: 'Retaining Wall' },
  { value: 'parking_structure', label: 'Parking Structure' },
];

export default function AssetQuickAdd({ industry, assets, onAssetsChange, isSubmitting }) {
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customAsset, setCustomAsset] = useState({ name: '', type: '', location: '' });

  const suggestions = ASSET_SUGGESTIONS[industry] || ASSET_SUGGESTIONS.other;

  const addSuggestedAsset = (suggestion) => {
    const newAsset = {
      id: `temp-${Date.now()}`,
      name: suggestion.name,
      type: suggestion.type,
      location: '',
    };
    onAssetsChange([...assets, newAsset]);
  };

  const addCustomAsset = () => {
    if (!customAsset.name || !customAsset.type) return;
    const newAsset = {
      id: `temp-${Date.now()}`,
      name: customAsset.name,
      type: customAsset.type,
      location: customAsset.location,
    };
    onAssetsChange([...assets, newAsset]);
    setCustomAsset({ name: '', type: '', location: '' });
    setShowCustomForm(false);
  };

  const removeAsset = (id) => {
    onAssetsChange(assets.filter(a => a.id !== id));
  };

  const updateAsset = (id, field, value) => {
    onAssetsChange(assets.map(a => a.id === id ? { ...a, [field]: value } : a));
  };

  return (
    <div className="space-y-4">
      {/* Added Assets */}
      <AnimatePresence>
        {assets.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            <Label className="text-slate-700">Your Assets ({assets.length})</Label>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {assets.map((asset, idx) => (
                <motion.div
                  key={asset.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="flex items-center gap-2 p-3 bg-indigo-50 border border-indigo-200 rounded-lg"
                >
                  <Check className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <Input
                      value={asset.name}
                      onChange={(e) => updateAsset(asset.id, 'name', e.target.value)}
                      className="h-8 text-sm bg-white border-indigo-200"
                      placeholder="Asset name"
                    />
                  </div>
                  <Input
                    value={asset.location}
                    onChange={(e) => updateAsset(asset.id, 'location', e.target.value)}
                    className="w-32 h-8 text-sm bg-white border-indigo-200"
                    placeholder="Location"
                  />
                  <button
                    type="button"
                    onClick={() => removeAsset(asset.id)}
                    className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Add Suggestions */}
      <div>
        <Label className="text-slate-700 mb-2 block">Quick Add Common Assets</Label>
        <div className="flex flex-wrap gap-2">
          {suggestions.map((suggestion) => (
            <Button
              key={suggestion.type}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addSuggestedAsset(suggestion)}
              className="h-8 text-xs"
              disabled={isSubmitting}
            >
              <Plus className="w-3 h-3 mr-1" />
              {suggestion.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Custom Asset Form */}
      <AnimatePresence>
        {showCustomForm ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-4 bg-slate-50 rounded-lg border border-slate-200"
          >
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label className="text-xs">Asset Name</Label>
                <Input
                  value={customAsset.name}
                  onChange={(e) => setCustomAsset({ ...customAsset, name: e.target.value })}
                  placeholder="e.g., Main Pump #1"
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs">Asset Type</Label>
                <Select value={customAsset.type} onValueChange={(v) => setCustomAsset({ ...customAsset, type: v })}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {ALL_ASSET_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Location</Label>
                <Input
                  value={customAsset.location}
                  onChange={(e) => setCustomAsset({ ...customAsset, location: e.target.value })}
                  placeholder="e.g., Building A"
                  className="mt-1"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              <Button type="button" size="sm" onClick={addCustomAsset} disabled={!customAsset.name || !customAsset.type}>
                Add Asset
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => setShowCustomForm(false)}>
                Cancel
              </Button>
            </div>
          </motion.div>
        ) : (
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowCustomForm(true)}
            className="w-full border-dashed"
            disabled={isSubmitting}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Custom Asset
          </Button>
        )}
      </AnimatePresence>

      {assets.length === 0 && (
        <p className="text-xs text-slate-500 text-center py-2">
          Add at least one asset to get started, or skip for now
        </p>
      )}
    </div>
  );
}