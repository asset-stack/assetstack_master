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
import { jsPDF } from 'jspdf';

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
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    let yPos = margin;

    // Helper function to add new page if needed
    const checkNewPage = (requiredHeight = 20) => {
      if (yPos + requiredHeight > pageHeight - margin) {
        doc.addPage();
        yPos = margin;
        return true;
      }
      return false;
    };

    // Header with gradient-like background
    doc.setFillColor(79, 70, 229); // Indigo
    doc.rect(0, 0, pageWidth, 45, 'F');
    
    // Logo area
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(margin, 10, 10, 10, 2, 2, 'F');
    doc.setFontSize(8);
    doc.setTextColor(79, 70, 229);
    doc.text('AS', margin + 2.5, 17);

    // Title
    doc.setFontSize(20);
    doc.setTextColor(255, 255, 255);
    doc.setFont(undefined, 'bold');
    doc.text(report.name, margin + 15, 18);

    // Subtitle
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(200, 200, 255);
    doc.text(`Generated: ${format(new Date(), 'MMMM d, yyyy \'at\' h:mm a')}`, margin + 15, 26);
    doc.text(`Total Records: ${filteredData.length}`, margin + 15, 33);

    yPos = 55;

    // Metrics section
    if (includeMetrics && report.metrics && report.metrics.length > 0) {
      doc.setFontSize(12);
      doc.setTextColor(30, 41, 59);
      doc.setFont(undefined, 'bold');
      doc.text('Summary Metrics', margin, yPos);
      yPos += 8;

      const metricsPerRow = 3;
      const metricWidth = (pageWidth - margin * 2 - 10) / metricsPerRow;
      
      report.metrics.forEach((metric, idx) => {
        const col = idx % metricsPerRow;
        const row = Math.floor(idx / metricsPerRow);
        const xPos = margin + col * (metricWidth + 5);
        const metricYPos = yPos + row * 25;

        // Metric card background
        doc.setFillColor(248, 250, 252);
        doc.roundedRect(xPos, metricYPos, metricWidth, 22, 3, 3, 'F');

        // Metric label
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        doc.setFont(undefined, 'normal');
        doc.text(metric.label, xPos + 4, metricYPos + 7);

        // Metric value
        doc.setFontSize(14);
        doc.setTextColor(30, 41, 59);
        doc.setFont(undefined, 'bold');
        const metricValue = String(metric.calc(data));
        doc.text(metricValue, xPos + 4, metricYPos + 17);
      });

      const metricRows = Math.ceil(report.metrics.length / metricsPerRow);
      yPos += metricRows * 25 + 15;
    }

    // Table section
    checkNewPage(50);
    doc.setFontSize(12);
    doc.setTextColor(30, 41, 59);
    doc.setFont(undefined, 'bold');
    doc.text('Data', margin, yPos);
    yPos += 8;

    // Calculate column widths
    const availableWidth = pageWidth - margin * 2;
    const colCount = report.columns.length;
    const colWidth = Math.min(availableWidth / colCount, 45);
    const tableWidth = colWidth * colCount;

    // Table header
    doc.setFillColor(241, 245, 249);
    doc.rect(margin, yPos, tableWidth, 10, 'F');
    doc.setFontSize(7);
    doc.setTextColor(71, 85, 105);
    doc.setFont(undefined, 'bold');

    report.columns.forEach((col, idx) => {
      const headerText = col.replace(/_/g, ' ').toUpperCase();
      const truncatedHeader = headerText.length > 12 ? headerText.substring(0, 10) + '..' : headerText;
      doc.text(truncatedHeader, margin + idx * colWidth + 2, yPos + 7);
    });
    yPos += 12;

    // Table rows
    doc.setFont(undefined, 'normal');
    doc.setFontSize(7);

    const formatCellValue = (value, col) => {
      if (value === null || value === undefined) return '-';
      
      if ((col.includes('date') || col.includes('_at')) && value) {
        try {
          return format(new Date(value), 'MMM d, yyyy');
        } catch { return String(value); }
      }
      if ((col.includes('cost') || col.includes('price')) && typeof value === 'number') {
        return '$' + value.toLocaleString();
      }
      if ((col.includes('score') || col.includes('probability')) && typeof value === 'number') {
        return value.toFixed(1) + '%';
      }
      return String(value).replace(/_/g, ' ');
    };

    const getStatusColor = (value, col) => {
      if (col !== 'status' && col !== 'priority' && col !== 'severity' && col !== 'risk_level') return null;
      const v = String(value).toLowerCase();
      if (['operational', 'completed', 'resolved', 'available', 'low'].includes(v)) return [220, 252, 231];
      if (['degraded', 'in_progress', 'warning', 'medium', 'busy'].includes(v)) return [254, 243, 199];
      if (['critical', 'overdue', 'emergency', 'high', 'urgent'].includes(v)) return [254, 226, 226];
      return [219, 234, 254];
    };

    filteredData.forEach((row, rowIdx) => {
      if (checkNewPage(12)) {
        // Redraw header on new page
        doc.setFillColor(241, 245, 249);
        doc.rect(margin, yPos, tableWidth, 10, 'F');
        doc.setFontSize(7);
        doc.setTextColor(71, 85, 105);
        doc.setFont(undefined, 'bold');
        report.columns.forEach((col, idx) => {
          const headerText = col.replace(/_/g, ' ').toUpperCase();
          const truncatedHeader = headerText.length > 12 ? headerText.substring(0, 10) + '..' : headerText;
          doc.text(truncatedHeader, margin + idx * colWidth + 2, yPos + 7);
        });
        yPos += 12;
        doc.setFont(undefined, 'normal');
      }

      // Alternate row background
      if (rowIdx % 2 === 0) {
        doc.setFillColor(250, 250, 250);
        doc.rect(margin, yPos - 3, tableWidth, 10, 'F');
      }

      doc.setTextColor(51, 65, 85);
      report.columns.forEach((col, colIdx) => {
        const value = row[col];
        const cellText = formatCellValue(value, col);
        const truncatedText = cellText.length > 15 ? cellText.substring(0, 13) + '..' : cellText;
        const xPos = margin + colIdx * colWidth + 2;

        // Status badge
        const statusColor = getStatusColor(value, col);
        if (statusColor) {
          doc.setFillColor(...statusColor);
          doc.roundedRect(xPos - 1, yPos - 2, colWidth - 4, 7, 1, 1, 'F');
        }

        doc.text(truncatedText, xPos, yPos + 3);
      });
      yPos += 10;
    });

    // Footer
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.setFont(undefined, 'normal');
      doc.text(`AssetStack Platform • ${report.name}`, margin, pageHeight - 10);
      doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin - 20, pageHeight - 10);
    }

    // Download
    doc.save(`${report.name.replace(/\s+/g, '_')}_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
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