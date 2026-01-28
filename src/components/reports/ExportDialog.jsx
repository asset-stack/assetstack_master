import React, { useState } from 'react';
import { 
  FileSpreadsheet, FileText, Download, Loader2, CheckCircle2
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from 'date-fns';

export default function ExportDialog({ open, onOpenChange, report, data }) {
  const [exportFormat, setExportFormat] = useState('csv');
  const [includeMetrics, setIncludeMetrics] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [exportComplete, setExportComplete] = useState(false);

  if (!report) return null;

  const rawData = data[report.dataSource] || [];

  // Apply filters to get export data
  const getFilteredData = () => {
    let result = [...rawData];

    if (report.defaultFilters) {
      Object.entries(report.defaultFilters).forEach(([key, value]) => {
        result = result.filter(item => item[key] === value);
      });
    }

    if (report.filters) {
      report.filters.forEach(filter => {
        result = result.filter(item => {
          const itemValue = item[filter.field];
          const filterValue = filter.value;

          switch (filter.operator) {
            case 'equals':
              return String(itemValue).toLowerCase() === String(filterValue).toLowerCase();
            case 'not_equals':
              return String(itemValue).toLowerCase() !== String(filterValue).toLowerCase();
            case 'contains':
              return String(itemValue).toLowerCase().includes(String(filterValue).toLowerCase());
            case 'greater_than':
              return Number(itemValue) > Number(filterValue);
            case 'less_than':
              return Number(itemValue) < Number(filterValue);
            case 'is_empty':
              return !itemValue;
            case 'is_not_empty':
              return !!itemValue;
            default:
              return true;
          }
        });
      });
    }

    return result;
  };

  const exportAsCSV = () => {
    const filteredData = getFilteredData();
    const headers = report.columns.map(col => col.replace(/_/g, ' ').toUpperCase());
    
    let csvContent = '';
    
    // Add report title and date
    csvContent += `"${report.name}"\n`;
    csvContent += `"Generated: ${format(new Date(), 'PPpp')}"\n`;
    csvContent += `"Total Records: ${filteredData.length}"\n`;
    
    // Add metrics if enabled
    if (includeMetrics && report.metrics) {
      csvContent += '\n"Summary Metrics"\n';
      report.metrics.forEach(metric => {
        csvContent += `"${metric.label}","${metric.calc(data)}"\n`;
      });
    }
    
    csvContent += '\n';
    
    // Add headers
    csvContent += headers.map(h => `"${h}"`).join(',') + '\n';
    
    // Add data rows
    filteredData.forEach(row => {
      const values = report.columns.map(col => {
        const value = row[col];
        if (value === null || value === undefined) return '';
        if (typeof value === 'string' && value.includes(',')) return `"${value}"`;
        return value;
      });
      csvContent += values.join(',') + '\n';
    });

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${report.name.replace(/\s+/g, '_')}_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
  };

  const exportAsPDF = async () => {
    const filteredData = getFilteredData();
    
    // Create a printable HTML document
    const printWindow = window.open('', '_blank');
    
    let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${report.name}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { color: #1e293b; margin-bottom: 5px; }
          .subtitle { color: #64748b; margin-bottom: 20px; }
          .metrics { display: flex; gap: 20px; margin-bottom: 20px; flex-wrap: wrap; }
          .metric { background: #f8fafc; padding: 15px; border-radius: 8px; min-width: 150px; }
          .metric-label { font-size: 12px; color: #64748b; }
          .metric-value { font-size: 24px; font-weight: bold; color: #1e293b; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th { background: #f1f5f9; text-align: left; padding: 10px; border-bottom: 2px solid #e2e8f0; font-size: 12px; text-transform: uppercase; color: #64748b; }
          td { padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 13px; }
          tr:hover { background: #f8fafc; }
          .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 500; }
          .badge-success { background: #dcfce7; color: #166534; }
          .badge-warning { background: #fef3c7; color: #92400e; }
          .badge-danger { background: #fee2e2; color: #991b1b; }
          .badge-info { background: #dbeafe; color: #1e40af; }
          .footer { margin-top: 30px; padding-top: 15px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8; }
          @media print { body { padding: 0; } }
        </style>
      </head>
      <body>
        <h1>${report.name}</h1>
        <p class="subtitle">Generated: ${format(new Date(), 'PPpp')} • ${filteredData.length} records</p>
    `;

    // Add metrics
    if (includeMetrics && report.metrics) {
      html += '<div class="metrics">';
      report.metrics.forEach(metric => {
        html += `
          <div class="metric">
            <div class="metric-label">${metric.label}</div>
            <div class="metric-value">${metric.calc(data)}</div>
          </div>
        `;
      });
      html += '</div>';
    }

    // Add table
    html += '<table><thead><tr>';
    report.columns.forEach(col => {
      html += `<th>${col.replace(/_/g, ' ')}</th>`;
    });
    html += '</tr></thead><tbody>';

    filteredData.forEach(row => {
      html += '<tr>';
      report.columns.forEach(col => {
        let value = row[col];
        let cellContent = value ?? '-';

        // Format dates
        if ((col.includes('date') || col.includes('_at')) && value) {
          try {
            cellContent = format(new Date(value), 'MMM d, yyyy');
          } catch {}
        }

        // Format currency
        if ((col.includes('cost') || col.includes('price')) && typeof value === 'number') {
          cellContent = '$' + value.toLocaleString();
        }

        // Format percentages
        if ((col.includes('score') || col.includes('probability')) && typeof value === 'number') {
          cellContent = value.toFixed(1) + '%';
        }

        // Format status badges
        if (col === 'status' || col === 'priority' || col === 'severity' || col === 'risk_level') {
          const badgeClass = 
            ['operational', 'completed', 'resolved', 'available', 'low'].includes(String(value).toLowerCase()) ? 'badge-success' :
            ['degraded', 'in_progress', 'warning', 'medium', 'busy'].includes(String(value).toLowerCase()) ? 'badge-warning' :
            ['critical', 'overdue', 'emergency', 'high', 'urgent'].includes(String(value).toLowerCase()) ? 'badge-danger' :
            'badge-info';
          cellContent = `<span class="badge ${badgeClass}">${String(value).replace(/_/g, ' ')}</span>`;
        }

        html += `<td>${cellContent}</td>`;
      });
      html += '</tr>';
    });

    html += '</tbody></table>';
    html += `<div class="footer">Report: ${report.name} • AssetStack Platform</div>`;
    html += '</body></html>';

    printWindow.document.write(html);
    printWindow.document.close();
    
    // Wait for content to load then print
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      if (exportFormat === 'csv') {
        exportAsCSV();
      } else {
        await exportAsPDF();
      }
      setExportComplete(true);
      setTimeout(() => {
        setExportComplete(false);
        onOpenChange(false);
      }, 1500);
    } catch (error) {
      console.error('Export error:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-white">
        <DialogHeader>
          <DialogTitle>Export Report</DialogTitle>
        </DialogHeader>

        {exportComplete ? (
          <div className="py-8 text-center">
            <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
            <p className="text-lg font-medium text-slate-900">Export Complete!</p>
            <p className="text-sm text-slate-500">Your report has been downloaded</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <Label className="text-slate-700 mb-3 block">Export Format</Label>
              <RadioGroup value={exportFormat} onValueChange={setExportFormat}>
                <div className="grid grid-cols-2 gap-3">
                  <label className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                    exportFormat === 'csv' ? 'border-indigo-300 bg-indigo-50' : 'border-slate-200 hover:border-slate-300'
                  }`}>
                    <RadioGroupItem value="csv" />
                    <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                    <div>
                      <p className="font-medium text-slate-900">CSV</p>
                      <p className="text-xs text-slate-500">Spreadsheet format</p>
                    </div>
                  </label>
                  <label className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                    exportFormat === 'pdf' ? 'border-indigo-300 bg-indigo-50' : 'border-slate-200 hover:border-slate-300'
                  }`}>
                    <RadioGroupItem value="pdf" />
                    <FileText className="w-5 h-5 text-red-600" />
                    <div>
                      <p className="font-medium text-slate-900">PDF</p>
                      <p className="text-xs text-slate-500">Print-ready format</p>
                    </div>
                  </label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-3">
              <Label className="text-slate-700">Options</Label>
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox 
                  checked={includeMetrics} 
                  onCheckedChange={setIncludeMetrics}
                />
                <span className="text-sm text-slate-700">Include summary metrics</span>
              </label>
            </div>

            <div className="bg-slate-50 rounded-lg p-4">
              <p className="text-sm text-slate-600">
                <strong>Report:</strong> {report.name}
              </p>
              <p className="text-sm text-slate-600">
                <strong>Records:</strong> {getFilteredData().length}
              </p>
              <p className="text-sm text-slate-600">
                <strong>Columns:</strong> {report.columns.length}
              </p>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button 
                className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                onClick={handleExport}
                disabled={isExporting}
              >
                {isExporting ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Download className="w-4 h-4 mr-2" />
                )}
                Export {exportFormat.toUpperCase()}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}