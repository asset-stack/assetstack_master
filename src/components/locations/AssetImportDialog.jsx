import React, { useState, useCallback, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Upload, FileText, CheckCircle2, AlertTriangle, X, Undo2, Loader2, Cpu, Sparkles } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const EQUIPMENT_FIELDS = [
  { value: 'name', label: 'Name *' },
  { value: 'type', label: 'Type' },
  { value: 'manufacturer', label: 'Manufacturer' },
  { value: 'model', label: 'Model' },
  { value: 'serial_number', label: 'Serial Number' },
  { value: 'installation_date', label: 'Installation Date' },
  { value: 'last_maintenance_date', label: 'Last Maintenance' },
  { value: 'operating_hours', label: 'Operating Hours' },
  { value: 'rated_capacity', label: 'Rated Capacity' },
  { value: 'capacity_unit', label: 'Capacity Unit' },
  { value: 'health_score', label: 'Health Score' },
  { value: 'status', label: 'Status' },
  { value: 'risk_level', label: 'Risk Level' },
  { value: 'failure_probability', label: 'Failure Probability' },
  { value: 'remaining_useful_life_days', label: 'RUL Days' },
  { value: 'predicted_failure_date', label: 'Predicted Failure Date' },
  { value: '__ignore__', label: '— Ignore —' },
];

// Heuristic auto-mapping based on header names
function guessField(header) {
  const h = header.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
  const patterns = {
    name: ['name', 'assetname', 'equipmentname', 'asset', 'title', 'description'],
    type: ['type', 'category', 'assettype', 'class'],
    manufacturer: ['manufacturer', 'make', 'brand', 'vendor', 'manuf'],
    model: ['model', 'modelnumber', 'modelno'],
    serial_number: ['serial', 'serialnumber', 'sn', 'serialno'],
    installation_date: ['installdate', 'installationdate', 'installed', 'commissioned', 'commission'],
    last_maintenance_date: ['lastmaintenance', 'lastservice', 'lastserviced'],
    operating_hours: ['hours', 'operatinghours', 'runhours'],
    rated_capacity: ['capacity', 'ratedcapacity', 'rating', 'power'],
    capacity_unit: ['unit', 'capacityunit'],
    health_score: ['health', 'healthscore', 'condition'],
    status: ['status', 'state'],
    risk_level: ['risk', 'risklevel'],
    failure_probability: ['failureprobability', 'failureprob', 'pof'],
    remaining_useful_life_days: ['rul', 'ruldays', 'lifedays', 'remaininglife'],
    predicted_failure_date: ['predictedfailure', 'failuredate'],
  };
  for (const [field, hints] of Object.entries(patterns)) {
    if (hints.some(hint => h === hint || h.includes(hint))) return field;
  }
  return '__ignore__';
}

function parseCSV(text) {
  const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
  if (lines.length === 0) return { headers: [], rows: [] };
  const parseLine = (line) => {
    const out = [];
    let cur = '', inQ = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') { inQ = !inQ; continue; }
      if (c === ',' && !inQ) { out.push(cur.trim()); cur = ''; continue; }
      cur += c;
    }
    out.push(cur.trim());
    return out;
  };
  const headers = parseLine(lines[0]);
  const rows = lines.slice(1).map(parseLine);
  return { headers, rows };
}

export default function AssetImportDialog({ open, onOpenChange, location, onImported }) {
  const [step, setStep] = useState('drop'); // drop | mapping | importing | done
  const [fileName, setFileName] = useState('');
  const [headers, setHeaders] = useState([]);
  const [rows, setRows] = useState([]);
  const [mapping, setMapping] = useState({});
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const reset = () => {
    setStep('drop');
    setFileName('');
    setHeaders([]);
    setRows([]);
    setMapping({});
    setError('');
    setResult(null);
  };

  const handleClose = () => {
    reset();
    onOpenChange(false);
  };

  const processFile = useCallback(async (file) => {
    setError('');
    setFileName(file.name);
    const ext = file.name.toLowerCase().split('.').pop();

    try {
      if (ext === 'json') {
        const text = await file.text();
        const data = JSON.parse(text);
        const arr = Array.isArray(data) ? data : (Array.isArray(data.items) ? data.items : [data]);
        if (arr.length === 0) throw new Error('JSON file contains no rows');
        const allKeys = [...new Set(arr.flatMap(o => Object.keys(o || {})))];
        setHeaders(allKeys);
        setRows(arr.map(o => allKeys.map(k => o?.[k] ?? '')));
        const autoMap = {};
        allKeys.forEach(h => { autoMap[h] = guessField(h); });
        setMapping(autoMap);
        setStep('mapping');
      } else if (ext === 'csv') {
        const text = await file.text();
        const { headers: h, rows: r } = parseCSV(text);
        if (h.length === 0) throw new Error('CSV is empty');
        setHeaders(h);
        setRows(r);
        const autoMap = {};
        h.forEach(header => { autoMap[header] = guessField(header); });
        setMapping(autoMap);
        setStep('mapping');
      } else if (ext === 'xlsx' || ext === 'xls') {
        // Upload to Base44 storage and extract via AI
        setStep('importing');
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        const schema = {
          type: 'object',
          properties: {
            items: {
              type: 'array',
              items: {
                type: 'object',
                properties: EQUIPMENT_FIELDS
                  .filter(f => f.value !== '__ignore__')
                  .reduce((acc, f) => { acc[f.value] = { type: 'string' }; return acc; }, {})
              }
            }
          }
        };
        const extracted = await base44.integrations.Core.ExtractDataFromUploadedFile({
          file_url,
          json_schema: schema,
        });
        if (extracted?.status !== 'success' || !extracted?.output?.items?.length) {
          throw new Error(extracted?.details || 'Could not extract data from Excel');
        }
        const items = extracted.output.items;
        const allKeys = [...new Set(items.flatMap(o => Object.keys(o || {})))];
        setHeaders(allKeys);
        setRows(items.map(o => allKeys.map(k => o?.[k] ?? '')));
        const autoMap = {};
        allKeys.forEach(h => { autoMap[h] = guessField(h); });
        setMapping(autoMap);
        setStep('mapping');
      } else {
        throw new Error(`Unsupported file type: .${ext}. Use CSV, XLSX, or JSON.`);
      }
    } catch (e) {
      setError(e.message);
      setStep('drop');
    }
  }, []);

  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer?.files?.[0];
    if (file) processFile(file);
  };

  const onFileInput = (e) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  // Build prepared rows for import based on mapping
  const preparedRows = useMemo(() => {
    return rows.map(row => {
      const obj = {};
      headers.forEach((h, idx) => {
        const target = mapping[h];
        if (target && target !== '__ignore__') {
          obj[target] = row[idx];
        } else if (target !== '__ignore__') {
          // unmapped — keep raw header
          obj[h] = row[idx];
        }
      });
      return obj;
    });
  }, [rows, headers, mapping]);

  const validCount = preparedRows.filter(r => r.name && String(r.name).trim()).length;
  const skipCount = preparedRows.length - validCount;

  const handleImport = async () => {
    setStep('importing');
    setError('');
    try {
      const response = await base44.functions.invoke('importAssetsToLocation', {
        location_id: location.id,
        rows: preparedRows,
      });
      setResult(response.data);
      setStep('done');
      onImported?.();
    } catch (e) {
      setError(e?.response?.data?.error || e.message);
      setStep('mapping');
    }
  };

  const handleUndo = async () => {
    if (!result?.import_batch_id) return;
    setStep('importing');
    try {
      await base44.functions.invoke('undoAssetImport', {
        import_batch_id: result.import_batch_id,
      });
      onImported?.();
      handleClose();
    } catch (e) {
      setError(e?.response?.data?.error || e.message);
      setStep('done');
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); }}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-indigo-600" />
            Import Assets to {location?.name}
          </DialogTitle>
          <DialogDescription>
            Every asset will be assigned to <span className="font-medium text-indigo-700">{location?.name}</span> automatically.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto -mx-6 px-6">
          {/* STEP: DROP */}
          {step === 'drop' && (
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={onDrop}
              className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
                isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-slate-300 bg-slate-50'
              }`}
            >
              <Upload className="w-12 h-12 mx-auto mb-3 text-slate-400" />
              <h3 className="text-lg font-semibold text-slate-900 mb-1">Drop your spreadsheet here</h3>
              <p className="text-sm text-slate-500 mb-4">CSV, Excel (.xlsx), or JSON</p>
              <label className="inline-block">
                <input type="file" accept=".csv,.xlsx,.xls,.json" onChange={onFileInput} className="hidden" />
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 cursor-pointer text-sm font-medium">
                  <FileText className="w-4 h-4" /> Choose file
                </span>
              </label>
              {error && (
                <div className="mt-4 text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-lg p-3 inline-block">
                  {error}
                </div>
              )}
              <div className="mt-6 text-xs text-slate-400 flex items-center justify-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Excel files are parsed by AI · column headers are auto-mapped
              </div>
            </div>
          )}

          {/* STEP: MAPPING */}
          {step === 'mapping' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm">
                <FileText className="w-4 h-4 text-slate-500" />
                <span className="font-medium text-slate-700">{fileName}</span>
                <Badge variant="secondary">{rows.length} rows</Badge>
                <button onClick={reset} className="ml-auto text-xs text-slate-500 hover:text-slate-700">Change file</button>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
                <p className="font-medium mb-1">Match columns to asset fields</p>
                <p className="text-xs">We've guessed the mapping — adjust any that look wrong. Unmapped columns will be saved under <code className="bg-amber-100 px-1 rounded">specifications</code>.</p>
              </div>

              <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
                {headers.map((h) => {
                  const sample = rows[0]?.[headers.indexOf(h)];
                  return (
                    <div key={h} className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-lg">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm text-slate-900 truncate">{h}</div>
                        <div className="text-xs text-slate-500 truncate">e.g. {String(sample ?? '').slice(0, 60) || '(empty)'}</div>
                      </div>
                      <span className="text-slate-300">→</span>
                      <Select value={mapping[h] || '__ignore__'} onValueChange={(v) => setMapping({ ...mapping, [h]: v })}>
                        <SelectTrigger className="w-48 bg-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="max-h-60">
                          {EQUIPMENT_FIELDS.map(f => (
                            <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <div className="text-sm flex-1">
                  <span className="font-semibold text-emerald-900">{validCount} valid</span>
                  <span className="text-emerald-700"> ready to import</span>
                  {skipCount > 0 && (
                    <span className="text-amber-700 ml-3">· {skipCount} missing name (will skip)</span>
                  )}
                </div>
              </div>

              {error && (
                <div className="text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-lg p-3">
                  {error}
                </div>
              )}
            </div>
          )}

          {/* STEP: IMPORTING */}
          {step === 'importing' && (
            <div className="py-16 text-center">
              <Loader2 className="w-10 h-10 text-indigo-600 mx-auto mb-4 animate-spin" />
              <p className="text-sm text-slate-600">Importing assets…</p>
            </div>
          )}

          {/* STEP: DONE */}
          {step === 'done' && result && (
            <div className="py-8 text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-1">Import complete</h3>
              <p className="text-sm text-slate-600 mb-1">
                <span className="font-semibold text-emerald-700">{result.created_count} assets</span> added to{' '}
                <span className="font-semibold">{result.location_name}</span>
              </p>
              {result.skipped_count > 0 && (
                <p className="text-xs text-amber-600 mb-4">{result.skipped_count} rows skipped (missing name)</p>
              )}
              <div className="flex gap-2 justify-center mt-6">
                <Button variant="outline" onClick={handleUndo} className="text-rose-600 border-rose-200 hover:bg-rose-50">
                  <Undo2 className="w-4 h-4 mr-1.5" /> Undo this import
                </Button>
                <Button onClick={handleClose} className="bg-indigo-600 hover:bg-indigo-700">Done</Button>
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        {step === 'mapping' && (
          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button variant="outline" onClick={handleClose}>Cancel</Button>
            <Button onClick={handleImport} disabled={validCount === 0} className="bg-indigo-600 hover:bg-indigo-700">
              Import {validCount} assets →
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}