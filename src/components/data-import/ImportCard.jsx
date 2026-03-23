import React, { useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';
import { Upload, CheckCircle, AlertCircle, Loader2, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ImportCard({ target }) {
  const [status, setStatus] = useState('idle'); // idle, uploading, extracting, importing, done, error
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const fileRef = useRef(null);
  const queryClient = useQueryClient();
  const Icon = target.icon;

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setStatus('uploading');
    setResult(null);
    setErrorMsg('');

    // 1. Upload the file
    const { file_url } = await base44.integrations.Core.UploadFile({ file });

    setStatus('extracting');

    // 2. Get the entity schema to guide extraction
    const schema = await base44.entities[target.entity].schema();

    // 3. Extract structured data from the file
    const extraction = await base44.integrations.Core.ExtractDataFromUploadedFile({
      file_url,
      json_schema: {
        type: 'object',
        properties: {
          records: {
            type: 'array',
            items: {
              type: 'object',
              properties: schema.properties || {},
            }
          }
        }
      }
    });

    if (extraction.status === 'error') {
      setStatus('error');
      setErrorMsg(extraction.details || 'Failed to extract data from file');
      return;
    }

    const records = extraction.output?.records || [];
    if (records.length === 0) {
      setStatus('error');
      setErrorMsg('No records found in the file. Check that column headers match field names.');
      return;
    }

    setStatus('importing');

    // 4. Bulk create the records
    await base44.entities[target.entity].bulkCreate(records);

    // 5. Invalidate queries
    queryClient.invalidateQueries();

    setResult({ count: records.length });
    setStatus('done');

    // Reset file input
    if (fileRef.current) fileRef.current.value = '';
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-10 h-10 rounded-xl ${target.color} flex items-center justify-center`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-semibold text-slate-900 text-sm">{target.label}</h3>
        </div>
      </div>
      <p className="text-xs text-slate-500 mb-4">{target.description}</p>

      {status === 'idle' && (
        <label className="block cursor-pointer">
          <input
            ref={fileRef}
            type="file"
            accept=".csv,.xlsx,.xls,.json"
            onChange={handleFileSelect}
            className="hidden"
          />
          <div className="border-2 border-dashed border-slate-200 rounded-lg p-4 text-center hover:border-indigo-300 hover:bg-indigo-50/30 transition-colors">
            <Upload className="w-6 h-6 text-slate-400 mx-auto mb-2" />
            <p className="text-xs font-medium text-slate-600">Click to upload CSV or Excel</p>
            <p className="text-[10px] text-slate-400 mt-1">.csv, .xlsx, .xls, .json</p>
          </div>
        </label>
      )}

      {(status === 'uploading' || status === 'extracting' || status === 'importing') && (
        <div className="border border-indigo-200 bg-indigo-50 rounded-lg p-4 text-center">
          <Loader2 className="w-6 h-6 text-indigo-600 mx-auto mb-2 animate-spin" />
          <p className="text-xs font-medium text-indigo-700">
            {status === 'uploading' && 'Uploading file...'}
            {status === 'extracting' && 'Extracting data from file...'}
            {status === 'importing' && 'Creating records...'}
          </p>
        </div>
      )}

      {status === 'done' && (
        <div className="border border-emerald-200 bg-emerald-50 rounded-lg p-4 text-center">
          <CheckCircle className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
          <p className="text-xs font-medium text-emerald-700">
            Successfully imported {result?.count} records
          </p>
          <Button
            variant="ghost"
            size="sm"
            className="mt-2 text-xs text-emerald-600 hover:text-emerald-700"
            onClick={() => { setStatus('idle'); setResult(null); }}
          >
            Import more
          </Button>
        </div>
      )}

      {status === 'error' && (
        <div className="border border-rose-200 bg-rose-50 rounded-lg p-4 text-center">
          <AlertCircle className="w-6 h-6 text-rose-600 mx-auto mb-2" />
          <p className="text-xs font-medium text-rose-700">{errorMsg}</p>
          <Button
            variant="ghost"
            size="sm"
            className="mt-2 text-xs text-rose-600 hover:text-rose-700"
            onClick={() => { setStatus('idle'); setErrorMsg(''); }}
          >
            Try again
          </Button>
        </div>
      )}
    </div>
  );
}