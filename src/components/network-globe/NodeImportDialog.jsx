import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Upload, FileJson, FileSpreadsheet, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

/**
 * Parse CSV with headers. Expects columns: name, lat, lng, [zone, node_type, condition, sensors, notes]
 */
function parseCSV(text) {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) throw new Error('CSV needs a header row and at least one data row');
  const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
  const nameIdx = headers.indexOf('name');
  const latIdx = ['lat', 'latitude'].map((k) => headers.indexOf(k)).find((i) => i >= 0);
  const lngIdx = ['lng', 'lon', 'longitude'].map((k) => headers.indexOf(k)).find((i) => i >= 0);
  if (nameIdx < 0 || latIdx === undefined || lngIdx === undefined) {
    throw new Error('CSV must have name, lat, lng columns');
  }
  return lines.slice(1).map((line, i) => {
    const cols = line.split(',').map((c) => c.trim());
    return {
      name: cols[nameIdx] || `Node ${i + 1}`,
      lat: parseFloat(cols[latIdx]),
      lng: parseFloat(cols[lngIdx]),
      zone: headers.indexOf('zone') >= 0 ? cols[headers.indexOf('zone')] : '',
      node_type: headers.indexOf('node_type') >= 0 ? cols[headers.indexOf('node_type')] : 'custom',
      condition: headers.indexOf('condition') >= 0 ? cols[headers.indexOf('condition')] : 'operational',
      sensors: headers.indexOf('sensors') >= 0 ? cols[headers.indexOf('sensors')].split(';').filter(Boolean) : [],
      notes: headers.indexOf('notes') >= 0 ? cols[headers.indexOf('notes')] : '',
    };
  }).filter((n) => !isNaN(n.lat) && !isNaN(n.lng));
}

function parseGeoJSON(text) {
  const data = JSON.parse(text);
  const features = data.features || [];
  const nodes = [];
  features.forEach((f, i) => {
    if (f.geometry?.type === 'Point') {
      const [lng, lat] = f.geometry.coordinates;
      const props = f.properties || {};
      nodes.push({
        name: props.name || props.NAME || props.title || `Node ${i + 1}`,
        lat, lng,
        zone: props.zone || props.region || '',
        node_type: props.type || props.node_type || 'custom',
        condition: props.condition || 'operational',
        sensors: props.sensors ? (Array.isArray(props.sensors) ? props.sensors : String(props.sensors).split(',').map(s => s.trim())) : [],
        notes: props.notes || props.description || '',
      });
    }
  });
  return nodes;
}

export default function NodeImportDialog({ open, onClose, network }) {
  const qc = useQueryClient();
  const [text, setText] = useState('');
  const [preview, setPreview] = useState([]);
  const [error, setError] = useState('');
  const [importing, setImporting] = useState(false);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const content = await file.text();
    setText(content);
    parseAndPreview(content, file.name);
  };

  const parseAndPreview = (content, fileName = '') => {
    setError('');
    try {
      const isJSON = content.trim().startsWith('{') || fileName.endsWith('.json') || fileName.endsWith('.geojson');
      const nodes = isJSON ? parseGeoJSON(content) : parseCSV(content);
      if (!nodes.length) throw new Error('No valid nodes found');
      setPreview(nodes);
    } catch (err) {
      setError(err.message);
      setPreview([]);
    }
  };

  const handleImport = async () => {
    if (!preview.length || !network) return;
    setImporting(true);
    try {
      const created = await base44.entities.NetworkNode.bulkCreate(
        preview.map((n, i) => ({ ...n, network_id: network.id, order_index: i }))
      );
      // update node_count + line_order on the network
      const ids = (created || []).map((c) => c.id).filter(Boolean);
      await base44.entities.AssetNetwork.update(network.id, {
        node_count: (network.node_count || 0) + preview.length,
        line_order: [...(network.line_order || []), ...ids],
      });
      qc.invalidateQueries({ queryKey: ['asset-networks'] });
      qc.invalidateQueries({ queryKey: ['network-nodes', network.id] });
      toast.success(`Imported ${preview.length} nodes to ${network.name}`);
      onClose();
      setText(''); setPreview([]);
    } catch (err) {
      toast.error(`Import failed: ${err.message}`);
    }
    setImporting(false);
  };

  const loadTemplate = () => {
    const tmpl = `name,lat,lng,zone,node_type,condition,sensors,notes
Pump Station Alpha,-33.8688,151.2093,Zone A,facility,operational,vibration;temperature,Primary pumping hub
Valve Junction 12,-33.8700,151.2100,Zone A,valve,degraded,pressure;flow_rate,Needs inspection
Sensor Point 05,-33.8720,151.2120,Zone A,sensor,operational,temperature;humidity,Weather station`;
    setText(tmpl);
    parseAndPreview(tmpl, 'template.csv');
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl bg-slate-900 border-white/10 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-indigo-400" />
            Import Nodes {network && <span className="text-white/50 text-sm font-normal">→ {network.name}</span>}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="border-white/10 text-white bg-white/5 gap-2" asChild>
            <label className="cursor-pointer">
              <FileSpreadsheet className="w-4 h-4" />
              Upload CSV
              <input type="file" accept=".csv,text/csv" onChange={handleFile} className="hidden" />
            </label>
          </Button>
          <Button variant="outline" className="border-white/10 text-white bg-white/5 gap-2" asChild>
            <label className="cursor-pointer">
              <FileJson className="w-4 h-4" />
              Upload GeoJSON
              <input type="file" accept=".json,.geojson,application/json" onChange={handleFile} className="hidden" />
            </label>
          </Button>
          <Button variant="outline" className="border-white/10 text-white bg-white/5 gap-2" onClick={loadTemplate}>
            <Sparkles className="w-4 h-4" />
            Load CSV Template
          </Button>
        </div>

        <div>
          <Textarea
            value={text}
            onChange={(e) => { setText(e.target.value); parseAndPreview(e.target.value); }}
            placeholder="Or paste CSV / GeoJSON here...
CSV format: name,lat,lng,zone,node_type,condition,sensors,notes
(sensors separated by semicolons)"
            className="bg-slate-950 border-white/10 text-white font-mono text-xs min-h-[160px]"
          />
          {error && <p className="text-xs text-rose-400 mt-1">{error}</p>}
        </div>

        {preview.length > 0 && (
          <div className="bg-slate-950/60 border border-emerald-500/30 rounded-xl p-3">
            <p className="text-sm font-semibold text-emerald-300 mb-2">
              ✓ {preview.length} valid nodes detected
            </p>
            <div className="max-h-32 overflow-y-auto space-y-0.5 text-xs text-white/70 font-mono">
              {preview.slice(0, 10).map((n, i) => (
                <div key={i} className="truncate">
                  {n.name} — {n.lat.toFixed(4)}, {n.lng.toFixed(4)} {n.zone && `(${n.zone})`}
                </div>
              ))}
              {preview.length > 10 && <div className="text-white/40">... and {preview.length - 10} more</div>}
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="border-white/10 text-white bg-white/5">Cancel</Button>
          <Button onClick={handleImport} disabled={!preview.length || importing} className="bg-indigo-500 hover:bg-indigo-600">
            {importing ? 'Importing...' : `Import ${preview.length} Nodes`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}