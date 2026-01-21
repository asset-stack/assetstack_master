import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Upload, FileText, CheckCircle, XCircle, AlertTriangle, Download, Info } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export default function CSVImportPanel({ equipment }) {
  const [file, setFile] = useState(null);
  const [csvContent, setCsvContent] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  
  const queryClient = useQueryClient();

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResult(null);
      
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target.result;
        setCsvContent(content);
        
        // Parse preview
        const lines = content.trim().split('\n');
        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        const preview = lines.slice(1, 6).map(line => {
          const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
          const row = {};
          headers.forEach((h, i) => row[h] = values[i]);
          return row;
        });
        setPreviewData({ headers, rows: preview, totalRows: lines.length - 1 });
      };
      reader.readAsText(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!csvContent) return;
    
    setIsUploading(true);
    setResult(null);
    
    try {
      const response = await base44.functions.invoke('processSensorCSV', {
        csv_content: csvContent,
        file_name: file?.name
      });
      
      setResult(response.data);
      queryClient.invalidateQueries(['recentReadings', 'ingestionLogs']);
      
    } catch (error) {
      setResult({
        success: false,
        error: error.message
      });
    } finally {
      setIsUploading(false);
    }
  };

  const downloadTemplate = () => {
    const template = `equipment_id,sensor_type,value,unit,timestamp
${equipment[0]?.id || 'EQUIPMENT_ID'},temperature,45.2,°C,2024-01-15T10:30:00Z
${equipment[0]?.id || 'EQUIPMENT_ID'},vibration,2.5,mm/s,2024-01-15T10:30:00Z
${equipment[0]?.id || 'EQUIPMENT_ID'},pressure,3.2,bar,2024-01-15T10:30:00Z`;
    
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sensor_data_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <Info className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-blue-900 mb-2">CSV Import Instructions</h3>
            <div className="text-sm text-blue-800 space-y-2">
              <p>Upload a CSV file with sensor readings. Required columns:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li><strong>equipment_id</strong> - Equipment ID, name, or serial number</li>
                <li><strong>sensor_type</strong> - Type of sensor (temperature, vibration, pressure, etc.)</li>
                <li><strong>value</strong> - Numeric sensor reading value</li>
              </ul>
              <p className="mt-2">Optional columns: <strong>unit</strong>, <strong>timestamp</strong></p>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={downloadTemplate}
              className="mt-4 border-blue-300 text-blue-700 hover:bg-blue-100"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Template
            </Button>
          </div>
        </div>
      </div>

      {/* File Upload */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <Upload className="w-5 h-5 text-indigo-600" />
          Upload CSV File
        </h3>
        
        <div className="border-2 border-dashed border-slate-200 rounded-lg p-8 text-center hover:border-indigo-300 transition-colors">
          <input
            type="file"
            accept=".csv"
            onChange={handleFileSelect}
            className="hidden"
            id="csv-upload"
          />
          <label htmlFor="csv-upload" className="cursor-pointer">
            <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            {file ? (
              <div>
                <p className="font-medium text-slate-900">{file.name}</p>
                <p className="text-sm text-slate-500">{(file.size / 1024).toFixed(1)} KB</p>
              </div>
            ) : (
              <div>
                <p className="font-medium text-slate-700">Click to select a CSV file</p>
                <p className="text-sm text-slate-500">or drag and drop</p>
              </div>
            )}
          </label>
        </div>

        {/* Preview */}
        {previewData && (
          <div className="mt-6">
            <h4 className="font-medium text-slate-900 mb-3">
              Preview ({previewData.totalRows} rows total)
            </h4>
            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    {previewData.headers.map((h, i) => (
                      <th key={i} className="px-3 py-2 text-left font-medium text-slate-600 border-b">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {previewData.rows.map((row, i) => (
                    <tr key={i} className="border-b last:border-0">
                      {previewData.headers.map((h, j) => (
                        <td key={j} className="px-3 py-2 text-slate-700">
                          {row[h] || '-'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Upload Button */}
        {file && (
          <Button 
            onClick={handleUpload}
            disabled={isUploading}
            className="mt-6 bg-indigo-600 hover:bg-indigo-700"
          >
            {isUploading ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Processing...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Import Data
              </>
            )}
          </Button>
        )}
      </div>

      {/* Results */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-xl border p-6 ${
            result.success 
              ? result.failed > 0 
                ? 'bg-amber-50 border-amber-200' 
                : 'bg-emerald-50 border-emerald-200'
              : 'bg-rose-50 border-rose-200'
          }`}
        >
          <div className="flex items-start gap-4">
            {result.success ? (
              result.failed > 0 ? (
                <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0" />
              ) : (
                <CheckCircle className="w-6 h-6 text-emerald-600 flex-shrink-0" />
              )
            ) : (
              <XCircle className="w-6 h-6 text-rose-600 flex-shrink-0" />
            )}
            
            <div className="flex-1">
              <h4 className={`font-semibold ${
                result.success 
                  ? result.failed > 0 ? 'text-amber-900' : 'text-emerald-900'
                  : 'text-rose-900'
              }`}>
                {result.success 
                  ? result.failed > 0 
                    ? 'Import Partially Completed' 
                    : 'Import Successful!'
                  : 'Import Failed'}
              </h4>
              
              {result.success ? (
                <div className="mt-3 space-y-2">
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-slate-600">Received: <strong>{result.received}</strong></span>
                    <span className="text-emerald-600">Processed: <strong>{result.processed}</strong></span>
                    {result.failed > 0 && (
                      <span className="text-rose-600">Failed: <strong>{result.failed}</strong></span>
                    )}
                  </div>
                  <p className="text-sm text-slate-500">
                    Processing time: {result.processing_time_ms}ms
                  </p>
                </div>
              ) : (
                <p className="mt-2 text-sm text-rose-800">{result.error}</p>
              )}

              {result.errors && result.errors.length > 0 && (
                <div className="mt-4 bg-white/50 rounded-lg p-3">
                  <p className="text-sm font-medium text-slate-700 mb-2">Errors:</p>
                  <ul className="text-sm text-rose-700 space-y-1">
                    {result.errors.slice(0, 5).map((err, i) => (
                      <li key={i}>• {err}</li>
                    ))}
                  </ul>
                  {result.errors.length > 5 && (
                    <p className="text-sm text-slate-500 mt-2">
                      ... and {result.errors.length - 5} more errors
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Equipment Reference */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="font-semibold text-slate-900 mb-4">Available Equipment IDs</h3>
        <p className="text-sm text-slate-500 mb-4">
          Use these IDs in your CSV file's equipment_id column:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {equipment.slice(0, 12).map(eq => (
            <div key={eq.id} className="bg-slate-50 rounded-lg p-3">
              <p className="font-medium text-slate-900 text-sm truncate">{eq.name}</p>
              <p className="text-xs text-slate-500 font-mono truncate">{eq.id}</p>
              {eq.serial_number && (
                <p className="text-xs text-slate-400">S/N: {eq.serial_number}</p>
              )}
            </div>
          ))}
        </div>
        {equipment.length > 12 && (
          <p className="text-sm text-slate-500 mt-3">
            ... and {equipment.length - 12} more equipment
          </p>
        )}
      </div>
    </div>
  );
}