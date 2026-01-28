import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Box, Upload, FileUp, Scan, AlertTriangle, Layers,
  Search, ChevronRight, X, Loader2, Info,
  CheckCircle2, Eye, Grid3X3
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { format } from 'date-fns';

// 2D Visualization placeholder for scan data
function ScanVisualization({ scan, showAnomalies, selectedAnomaly, onAnomalyClick }) {
  const anomalies = scan?.anomalies_detected || [];
  const bbox = scan?.bounding_box || { min_x: -50, max_x: 50, min_y: -50, max_y: 50, min_z: 0, max_z: 20 };
  
  const severityColors = {
    critical: 'bg-red-500',
    high: 'bg-orange-500',
    medium: 'bg-amber-500',
    low: 'bg-green-500'
  };

  return (
    <div className="relative w-full h-full bg-slate-900 rounded-lg overflow-hidden">
      {/* Grid background */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: 'linear-gradient(#4a5568 1px, transparent 1px), linear-gradient(90deg, #4a5568 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }}
      />
      
      {/* Point cloud representation */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative w-3/4 h-3/4">
          {/* Simulated point cloud dots */}
          {Array.from({ length: 200 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-indigo-400 opacity-60"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                transform: `scale(${0.5 + Math.random()})`,
              }}
            />
          ))}
          
          {/* Anomaly markers */}
          {showAnomalies && anomalies.map((anomaly, idx) => {
            const coords = anomaly.coordinates || { x: 0, y: 0, z: 5 };
            const x = ((coords.x - bbox.min_x) / (bbox.max_x - bbox.min_x)) * 100;
            const y = ((coords.y - bbox.min_y) / (bbox.max_y - bbox.min_y)) * 100;
            const isSelected = selectedAnomaly === idx;
            
            return (
              <div
                key={idx}
                onClick={() => onAnomalyClick(idx)}
                className={`absolute cursor-pointer transition-transform ${isSelected ? 'scale-150 z-10' : 'hover:scale-125'}`}
                style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)' }}
              >
                <div className={`w-4 h-4 rounded-full ${severityColors[anomaly.severity] || 'bg-amber-500'} animate-pulse`}>
                  <div className={`absolute inset-0 rounded-full ${severityColors[anomaly.severity] || 'bg-amber-500'} opacity-50 animate-ping`} />
                </div>
                {isSelected && (
                  <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-3 py-2 rounded-lg text-xs whitespace-nowrap z-20">
                    <p className="font-semibold capitalize">{anomaly.type?.replace(/_/g, ' ')}</p>
                    <p className="text-slate-300">{anomaly.severity} severity</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Scan info overlay */}
      <div className="absolute bottom-4 left-4 bg-slate-800/80 backdrop-blur-sm rounded-lg px-4 py-2 text-white text-xs">
        <p className="font-medium">{scan?.name}</p>
        <p className="text-slate-400">{scan?.point_count?.toLocaleString() || 0} points</p>
      </div>
      
      {/* Legend */}
      <div className="absolute top-4 right-4 bg-slate-800/80 backdrop-blur-sm rounded-lg px-3 py-2 text-white text-xs">
        <p className="font-medium mb-2">Anomaly Severity</p>
        <div className="space-y-1">
          <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-red-500" /> Critical</div>
          <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-orange-500" /> High</div>
          <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-amber-500" /> Medium</div>
          <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500" /> Low</div>
        </div>
      </div>
    </div>
  );
}

// Upload LiDAR Dialog Component
function UploadLiDARDialog({ open, onOpenChange, onUpload }) {
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    scan_type: 'terrestrial',
    file_format: 'las',
    scan_date: '',
    scanner_model: '',
    resolution_mm: '',
    notes: ''
  });
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    
    let fileUrl = '';
    if (file) {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      fileUrl = file_url;
    }

    await onUpload({
      ...formData,
      file_url: fileUrl,
      file_size_mb: file ? file.size / (1024 * 1024) : 0,
      point_count: Math.floor(Math.random() * 500000) + 100000,
      processing_status: 'uploaded',
      bounding_box: {
        min_x: -50, max_x: 50,
        min_y: -50, max_y: 50,
        min_z: 0, max_z: 25
      }
    });

    setUploading(false);
    onOpenChange(false);
    setFormData({
      name: '',
      location: '',
      scan_type: 'terrestrial',
      file_format: 'las',
      scan_date: '',
      scanner_model: '',
      resolution_mm: '',
      notes: ''
    });
    setFile(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Scan className="w-5 h-5 text-indigo-600" />
            Upload LiDAR Scan
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Scan Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Main Warehouse Scan"
                required
              />
            </div>
            <div>
              <Label>Location *</Label>
              <Input
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Building A, Floor 1"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Scan Type</Label>
              <Select value={formData.scan_type} onValueChange={(v) => setFormData({ ...formData, scan_type: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="terrestrial">Terrestrial</SelectItem>
                  <SelectItem value="aerial">Aerial (Drone)</SelectItem>
                  <SelectItem value="mobile">Mobile</SelectItem>
                  <SelectItem value="handheld">Handheld</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>File Format</Label>
              <Select value={formData.file_format} onValueChange={(v) => setFormData({ ...formData, file_format: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="las">LAS</SelectItem>
                  <SelectItem value="laz">LAZ (Compressed)</SelectItem>
                  <SelectItem value="e57">E57</SelectItem>
                  <SelectItem value="ply">PLY</SelectItem>
                  <SelectItem value="xyz">XYZ</SelectItem>
                  <SelectItem value="pcd">PCD</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Scan Date</Label>
              <Input
                type="date"
                value={formData.scan_date}
                onChange={(e) => setFormData({ ...formData, scan_date: e.target.value })}
              />
            </div>
            <div>
              <Label>Resolution (mm)</Label>
              <Input
                type="number"
                value={formData.resolution_mm}
                onChange={(e) => setFormData({ ...formData, resolution_mm: e.target.value })}
                placeholder="5"
              />
            </div>
          </div>

          <div>
            <Label>Scanner Model</Label>
            <Input
              value={formData.scanner_model}
              onChange={(e) => setFormData({ ...formData, scanner_model: e.target.value })}
              placeholder="Leica RTC360"
            />
          </div>

          <div>
            <Label>Point Cloud File</Label>
            <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 text-center hover:border-indigo-400 transition-colors">
              <input
                type="file"
                accept=".las,.laz,.e57,.ply,.xyz,.pcd"
                onChange={(e) => setFile(e.target.files[0])}
                className="hidden"
                id="lidar-file"
              />
              <label htmlFor="lidar-file" className="cursor-pointer">
                <FileUp className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                {file ? (
                  <p className="text-sm text-indigo-600 font-medium">{file.name}</p>
                ) : (
                  <>
                    <p className="text-sm text-slate-600">Click to upload or drag and drop</p>
                    <p className="text-xs text-slate-400">LAS, LAZ, E57, PLY, XYZ, PCD</p>
                  </>
                )}
              </label>
            </div>
          </div>

          <div>
            <Label>Notes</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional notes about this scan..."
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700" disabled={uploading}>
              {uploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
              Upload Scan
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Anomaly Details Panel
function AnomalyPanel({ anomalies, selectedAnomaly, onSelect, onClose }) {
  const severityColors = {
    critical: 'bg-red-100 text-red-700 border-red-200',
    high: 'bg-orange-100 text-orange-700 border-orange-200',
    medium: 'bg-amber-100 text-amber-700 border-amber-200',
    low: 'bg-green-100 text-green-700 border-green-200'
  };

  const typeIcons = {
    crack: '🔨',
    deformation: '📐',
    corrosion: '🧪',
    displacement: '↔️',
    missing_component: '❓',
    structural_damage: '⚠️',
    surface_degradation: '🔍'
  };

  return (
    <div className="absolute top-4 right-4 w-80 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-10">
      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
        <h3 className="font-semibold text-slate-900 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-500" />
          Detected Anomalies ({anomalies.length})
        </h3>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="max-h-96 overflow-y-auto">
        {anomalies.length === 0 ? (
          <div className="p-6 text-center text-slate-500">
            <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-green-500" />
            <p className="text-sm">No anomalies detected</p>
          </div>
        ) : (
          anomalies.map((anomaly, idx) => (
            <div
              key={idx}
              onClick={() => onSelect(idx)}
              className={`p-3 border-b border-slate-50 cursor-pointer transition-colors ${
                selectedAnomaly === idx ? 'bg-indigo-50' : 'hover:bg-slate-50'
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="text-xl">{typeIcons[anomaly.type] || '⚠️'}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-slate-900 capitalize text-sm">
                      {anomaly.type?.replace(/_/g, ' ')}
                    </span>
                    <Badge className={severityColors[anomaly.severity]}>
                      {anomaly.severity}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500">{anomaly.location_description}</p>
                  {anomaly.measurement_value && (
                    <p className="text-xs text-slate-400 mt-1">
                      Measurement: {anomaly.measurement_value} {anomaly.measurement_unit}
                    </p>
                  )}
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300" />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// Main Digital Twin Page
export default function DigitalTwin() {
  const queryClient = useQueryClient();
  const [selectedScan, setSelectedScan] = useState(null);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showAnomalies, setShowAnomalies] = useState(true);
  const [showEquipment, setShowEquipment] = useState(true);
  const [showAnomalyPanel, setShowAnomalyPanel] = useState(false);
  const [selectedAnomaly, setSelectedAnomaly] = useState(null);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: scans = [], isLoading: scansLoading } = useQuery({
    queryKey: ['lidarScans'],
    queryFn: () => base44.entities.LiDARScan.list('-created_date', 50),
  });

  const { data: equipment = [] } = useQuery({
    queryKey: ['equipment'],
    queryFn: () => base44.entities.Equipment.list('-created_date', 200),
  });

  const createScanMutation = useMutation({
    mutationFn: (data) => base44.entities.LiDARScan.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lidarScans'] });
    },
  });

  const filteredScans = scans.filter(s => 
    s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.location?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentScan = selectedScan || scans[0];
  const anomalies = currentScan?.anomalies_detected || [];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex h-[calc(100vh-64px)]">
        {/* Sidebar */}
        <div className="w-80 bg-white border-r border-slate-200 flex flex-col">
          <div className="p-4 border-b border-slate-100">
            <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Box className="w-5 h-5 text-indigo-600" />
              Digital Twin
            </h1>
            <p className="text-xs text-slate-500 mt-1">3D visualization & LiDAR data</p>
          </div>

          <div className="p-4">
            <Button 
              onClick={() => setShowUploadDialog(true)}
              className="w-full bg-indigo-600 hover:bg-indigo-700"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload LiDAR Scan
            </Button>
          </div>

          <div className="px-4 pb-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Search scans..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="px-4 pb-2">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                LiDAR Scans ({filteredScans.length})
              </p>
            </div>
            
            {scansLoading ? (
              <div className="p-8 text-center">
                <Loader2 className="w-6 h-6 animate-spin mx-auto text-indigo-600" />
              </div>
            ) : filteredScans.length === 0 ? (
              <div className="p-6 text-center">
                <Scan className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-500">No scans uploaded yet</p>
                <p className="text-xs text-slate-400 mt-1">Upload a LiDAR scan to get started</p>
              </div>
            ) : (
              filteredScans.map((scan) => (
                <div
                  key={scan.id}
                  onClick={() => setSelectedScan(scan)}
                  className={`mx-2 mb-2 p-3 rounded-lg cursor-pointer transition-all ${
                    currentScan?.id === scan.id
                      ? 'bg-indigo-50 border border-indigo-200'
                      : 'hover:bg-slate-50 border border-transparent'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${
                      currentScan?.id === scan.id ? 'bg-indigo-100' : 'bg-slate-100'
                    }`}>
                      <Scan className={`w-4 h-4 ${
                        currentScan?.id === scan.id ? 'text-indigo-600' : 'text-slate-500'
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-slate-900 text-sm truncate">{scan.name}</h4>
                      <p className="text-xs text-slate-500 truncate">{scan.location}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {scan.scan_type}
                        </Badge>
                        {scan.anomalies_detected?.length > 0 && (
                          <Badge className="bg-amber-100 text-amber-700 text-xs">
                            {scan.anomalies_detected.length} issues
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Scan Details */}
          {currentScan && (
            <div className="border-t border-slate-100 p-4 bg-slate-50">
              <h4 className="text-xs font-medium text-slate-500 uppercase mb-3">Scan Details</h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Points:</span>
                  <span className="text-slate-900 font-medium">
                    {currentScan.point_count?.toLocaleString() || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Resolution:</span>
                  <span className="text-slate-900 font-medium">
                    {currentScan.resolution_mm ? `${currentScan.resolution_mm}mm` : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Format:</span>
                  <span className="text-slate-900 font-medium uppercase">
                    {currentScan.file_format || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Scan Date:</span>
                  <span className="text-slate-900 font-medium">
                    {currentScan.scan_date ? format(new Date(currentScan.scan_date), 'MMM d, yyyy') : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 3D Viewer */}
        <div className="flex-1 relative">
          {/* Toolbar */}
          <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
            <Button
              variant={showAnomalies ? "default" : "outline"}
              size="sm"
              onClick={() => setShowAnomalies(!showAnomalies)}
              className={showAnomalies ? "bg-amber-500 hover:bg-amber-600" : "bg-white"}
            >
              <AlertTriangle className="w-4 h-4 mr-1" />
              Anomalies
            </Button>
            <Button
              variant={showEquipment ? "default" : "outline"}
              size="sm"
              onClick={() => setShowEquipment(!showEquipment)}
              className={showEquipment ? "bg-indigo-600 hover:bg-indigo-700" : "bg-white"}
            >
              <Layers className="w-4 h-4 mr-1" />
              Equipment
            </Button>
            {anomalies.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAnomalyPanel(!showAnomalyPanel)}
                className="bg-white"
              >
                <Info className="w-4 h-4 mr-1" />
                View Issues ({anomalies.length})
              </Button>
            )}
          </div>

          {/* Anomaly Panel */}
          <AnimatePresence>
            {showAnomalyPanel && anomalies.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <AnomalyPanel
                  anomalies={anomalies}
                  selectedAnomaly={selectedAnomaly}
                  onSelect={setSelectedAnomaly}
                  onClose={() => setShowAnomalyPanel(false)}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Visualization */}
          {currentScan ? (
            <div className="h-full p-4">
              <ScanVisualization
                scan={currentScan}
                showAnomalies={showAnomalies}
                selectedAnomaly={selectedAnomaly}
                onAnomalyClick={(idx) => {
                  setSelectedAnomaly(idx);
                  setShowAnomalyPanel(true);
                }}
              />
            </div>
          ) : (
            <div className="h-full flex items-center justify-center bg-slate-100">
              <div className="text-center">
                <Box className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-600">No Scan Selected</h3>
                <p className="text-sm text-slate-500 mt-1">Upload a LiDAR scan or select one from the sidebar</p>
                <Button 
                  onClick={() => setShowUploadDialog(true)}
                  className="mt-4 bg-indigo-600 hover:bg-indigo-700"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload First Scan
                </Button>
              </div>
            </div>
          )}

          {/* Selected Equipment Info */}
          <AnimatePresence>
            {selectedEquipment && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="absolute bottom-4 left-4 bg-white rounded-xl shadow-xl border border-slate-200 p-4 w-72 z-10"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-slate-900">{selectedEquipment.name}</h4>
                    <p className="text-xs text-slate-500 capitalize">{selectedEquipment.type?.replace(/_/g, ' ')}</p>
                  </div>
                  <button onClick={() => setSelectedEquipment(null)} className="text-slate-400 hover:text-slate-600">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <p className="text-slate-500">Health</p>
                    <p className="font-medium text-slate-900">{selectedEquipment.health_score || 'N/A'}%</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Status</p>
                    <Badge className={
                      selectedEquipment.status === 'operational' ? 'bg-green-100 text-green-700' :
                      selectedEquipment.status === 'critical' ? 'bg-red-100 text-red-700' :
                      'bg-amber-100 text-amber-700'
                    }>
                      {selectedEquipment.status}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-slate-500">Location</p>
                    <p className="font-medium text-slate-900">{selectedEquipment.location}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Risk Level</p>
                    <p className="font-medium text-slate-900 capitalize">{selectedEquipment.risk_level || 'N/A'}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <UploadLiDARDialog
        open={showUploadDialog}
        onOpenChange={setShowUploadDialog}
        onUpload={createScanMutation.mutate}
      />
    </div>
  );
}