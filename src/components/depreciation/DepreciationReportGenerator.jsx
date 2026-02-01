import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { FileText, Download, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { jsPDF } from 'jspdf';
import { format } from 'date-fns';

export default function DepreciationReportGenerator({ open, onClose, depreciationRecords, equipment }) {
  const [generating, setGenerating] = useState(false);
  const [reportConfig, setReportConfig] = useState({
    reportType: 'summary',
    includeSchedules: true,
    includeCharts: true,
    groupBy: 'equipment_type',
    fiscalYear: new Date().getFullYear()
  });
  const [generatedReport, setGeneratedReport] = useState(null);

  const generateReport = async () => {
    setGenerating(true);
    
    try {
      // Calculate totals
      const totalAcquisitionCost = depreciationRecords.reduce((sum, r) => sum + (r.acquisition_cost || 0), 0);
      const totalAccumulatedDepreciation = depreciationRecords.reduce((sum, r) => sum + (r.accumulated_depreciation || 0), 0);
      const totalBookValue = depreciationRecords.reduce((sum, r) => sum + (r.current_book_value || 0), 0);
      const totalAnnualDepreciation = depreciationRecords.reduce((sum, r) => sum + (r.annual_depreciation || 0), 0);
      
      // Group by method
      const byMethod = depreciationRecords.reduce((acc, r) => {
        const method = r.depreciation_method || 'unknown';
        if (!acc[method]) acc[method] = { count: 0, totalValue: 0, totalDepreciation: 0 };
        acc[method].count++;
        acc[method].totalValue += r.current_book_value || 0;
        acc[method].totalDepreciation += r.annual_depreciation || 0;
        return acc;
      }, {});
      
      // Group by status
      const byStatus = depreciationRecords.reduce((acc, r) => {
        const status = r.status || 'active';
        if (!acc[status]) acc[status] = 0;
        acc[status]++;
        return acc;
      }, {});
      
      // Get AI insights
      const aiInsights = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze this depreciation data and provide insights:

Total Assets: ${depreciationRecords.length}
Total Acquisition Cost: $${totalAcquisitionCost.toLocaleString()}
Total Accumulated Depreciation: $${totalAccumulatedDepreciation.toLocaleString()}
Total Current Book Value: $${totalBookValue.toLocaleString()}
Total Annual Depreciation Expense: $${totalAnnualDepreciation.toLocaleString()}

Methods Used: ${Object.entries(byMethod).map(([m, d]) => `${m}: ${d.count} assets`).join(', ')}
Status: ${Object.entries(byStatus).map(([s, c]) => `${s}: ${c}`).join(', ')}

Provide:
1. Key observations about the depreciation portfolio
2. Tax planning recommendations
3. Asset replacement timing suggestions
4. Risk factors to consider`,
        response_json_schema: {
          type: "object",
          properties: {
            key_observations: { type: "array", items: { type: "string" } },
            tax_recommendations: { type: "array", items: { type: "string" } },
            replacement_suggestions: { type: "array", items: { type: "string" } },
            risk_factors: { type: "array", items: { type: "string" } }
          }
        }
      });
      
      setGeneratedReport({
        generatedAt: new Date().toISOString(),
        fiscalYear: reportConfig.fiscalYear,
        summary: {
          totalAssets: depreciationRecords.length,
          totalAcquisitionCost,
          totalAccumulatedDepreciation,
          totalBookValue,
          totalAnnualDepreciation,
          averageUsefulLife: depreciationRecords.reduce((sum, r) => sum + (r.useful_life_years || 0), 0) / depreciationRecords.length
        },
        byMethod,
        byStatus,
        aiInsights,
        records: depreciationRecords
      });
    } catch (error) {
      console.error('Report generation error:', error);
    }
    
    setGenerating(false);
  };

  const downloadReport = () => {
    if (!generatedReport) return;
    
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    let yPos = margin;

    const checkNewPage = (requiredHeight = 20) => {
      if (yPos + requiredHeight > pageHeight - margin) {
        doc.addPage();
        yPos = margin;
        return true;
      }
      return false;
    };

    const wrapText = (text, maxWidth) => doc.splitTextToSize(text, maxWidth);

    // Header
    doc.setFillColor(79, 70, 229);
    doc.rect(0, 0, pageWidth, 50, 'F');
    doc.setFillColor(99, 102, 241);
    doc.rect(0, 0, pageWidth, 25, 'F');

    // Logo
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(margin, 12, 12, 12, 3, 3, 'F');
    doc.setFontSize(9);
    doc.setTextColor(79, 70, 229);
    doc.setFont(undefined, 'bold');
    doc.text('AS', margin + 2.5, 20);

    // Title
    doc.setFontSize(22);
    doc.setTextColor(255, 255, 255);
    doc.text('Depreciation Report', margin + 18, 22);

    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(200, 200, 255);
    doc.text(`Fiscal Year: ${generatedReport.fiscalYear}`, margin + 18, 32);
    doc.text(`Generated: ${format(new Date(generatedReport.generatedAt), 'MMMM d, yyyy')}`, margin + 18, 40);

    yPos = 60;

    // Summary Section
    doc.setFontSize(14);
    doc.setTextColor(30, 41, 59);
    doc.setFont(undefined, 'bold');
    doc.text('Financial Summary', margin, yPos);
    yPos += 10;

    const summaryData = [
      { label: 'Total Assets', value: generatedReport.summary.totalAssets.toString(), color: [79, 70, 229] },
      { label: 'Acquisition Cost', value: `$${generatedReport.summary.totalAcquisitionCost.toLocaleString()}`, color: [16, 185, 129] },
      { label: 'Book Value', value: `$${generatedReport.summary.totalBookValue.toLocaleString()}`, color: [59, 130, 246] },
      { label: 'Annual Depreciation', value: `$${generatedReport.summary.totalAnnualDepreciation.toLocaleString()}`, color: [245, 158, 11] },
      { label: 'Accumulated Depreciation', value: `$${generatedReport.summary.totalAccumulatedDepreciation.toLocaleString()}`, color: [239, 68, 68] },
      { label: 'Avg. Useful Life', value: `${generatedReport.summary.averageUsefulLife.toFixed(1)} years`, color: [139, 92, 246] }
    ];

    const metricsPerRow = 3;
    const metricWidth = (pageWidth - margin * 2 - 10) / metricsPerRow;

    summaryData.forEach((item, idx) => {
      const col = idx % metricsPerRow;
      const row = Math.floor(idx / metricsPerRow);
      const xPos = margin + col * (metricWidth + 5);
      const metricYPos = yPos + row * 28;

      doc.setFillColor(248, 250, 252);
      doc.roundedRect(xPos, metricYPos, metricWidth, 24, 3, 3, 'F');

      // Color accent
      doc.setFillColor(...item.color);
      doc.rect(xPos, metricYPos, 3, 24, 'F');

      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.setFont(undefined, 'normal');
      doc.text(item.label, xPos + 8, metricYPos + 8);

      doc.setFontSize(14);
      doc.setTextColor(30, 41, 59);
      doc.setFont(undefined, 'bold');
      doc.text(item.value, xPos + 8, metricYPos + 18);
    });

    yPos += Math.ceil(summaryData.length / metricsPerRow) * 28 + 15;

    // By Method Section
    checkNewPage(50);
    doc.setFontSize(14);
    doc.setTextColor(30, 41, 59);
    doc.setFont(undefined, 'bold');
    doc.text('By Depreciation Method', margin, yPos);
    yPos += 10;

    Object.entries(generatedReport.byMethod).forEach(([method, data]) => {
      checkNewPage(20);
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(margin, yPos, pageWidth - margin * 2, 16, 2, 2, 'F');

      doc.setFontSize(9);
      doc.setTextColor(30, 41, 59);
      doc.setFont(undefined, 'bold');
      doc.text(method.replace(/_/g, ' ').toUpperCase(), margin + 5, yPos + 6);

      doc.setFont(undefined, 'normal');
      doc.setTextColor(71, 85, 105);
      doc.text(`${data.count} assets`, margin + 5, yPos + 12);
      doc.text(`Book Value: $${data.totalValue.toLocaleString()}`, margin + 50, yPos + 12);
      doc.text(`Annual: $${data.totalDepreciation.toLocaleString()}`, margin + 110, yPos + 12);

      yPos += 20;
    });

    yPos += 10;

    // AI Insights
    if (generatedReport.aiInsights) {
      checkNewPage(60);
      doc.setFontSize(14);
      doc.setTextColor(30, 41, 59);
      doc.setFont(undefined, 'bold');
      doc.text('AI Insights & Recommendations', margin, yPos);
      yPos += 10;

      const sections = [
        { title: 'Key Observations', items: generatedReport.aiInsights.key_observations, color: [219, 234, 254] },
        { title: 'Tax Recommendations', items: generatedReport.aiInsights.tax_recommendations, color: [220, 252, 231] },
        { title: 'Replacement Suggestions', items: generatedReport.aiInsights.replacement_suggestions, color: [254, 243, 199] },
        { title: 'Risk Factors', items: generatedReport.aiInsights.risk_factors, color: [254, 226, 226] }
      ];

      sections.forEach(section => {
        if (section.items && section.items.length > 0) {
          checkNewPage(30);
          doc.setFillColor(...section.color);
          const sectionHeight = section.items.length * 6 + 12;
          doc.roundedRect(margin, yPos, pageWidth - margin * 2, sectionHeight, 3, 3, 'F');

          doc.setFontSize(10);
          doc.setTextColor(30, 41, 59);
          doc.setFont(undefined, 'bold');
          doc.text(section.title, margin + 5, yPos + 8);

          doc.setFontSize(8);
          doc.setFont(undefined, 'normal');
          doc.setTextColor(51, 65, 85);
          section.items.forEach((item, i) => {
            const lines = wrapText(`• ${item}`, pageWidth - margin * 2 - 15);
            doc.text(lines[0], margin + 5, yPos + 14 + i * 6);
          });

          yPos += sectionHeight + 8;
        }
      });
    }

    // Asset Details Table
    checkNewPage(40);
    doc.setFontSize(14);
    doc.setTextColor(30, 41, 59);
    doc.setFont(undefined, 'bold');
    doc.text('Asset Details', margin, yPos);
    yPos += 10;

    // Table header
    doc.setFillColor(241, 245, 249);
    doc.rect(margin, yPos, pageWidth - margin * 2, 10, 'F');
    doc.setFontSize(7);
    doc.setTextColor(71, 85, 105);
    doc.setFont(undefined, 'bold');
    
    const cols = [
      { label: 'ASSET NAME', width: 55 },
      { label: 'COST', width: 30 },
      { label: 'BOOK VALUE', width: 30 },
      { label: 'ANNUAL DEP.', width: 28 },
      { label: 'METHOD', width: 28 }
    ];
    
    let colX = margin + 3;
    cols.forEach(col => {
      doc.text(col.label, colX, yPos + 7);
      colX += col.width;
    });
    yPos += 12;

    // Table rows
    doc.setFont(undefined, 'normal');
    doc.setFontSize(7);

    generatedReport.records.forEach((record, idx) => {
      if (checkNewPage(12)) {
        // Redraw header
        doc.setFillColor(241, 245, 249);
        doc.rect(margin, yPos, pageWidth - margin * 2, 10, 'F');
        doc.setFontSize(7);
        doc.setTextColor(71, 85, 105);
        doc.setFont(undefined, 'bold');
        colX = margin + 3;
        cols.forEach(col => {
          doc.text(col.label, colX, yPos + 7);
          colX += col.width;
        });
        yPos += 12;
        doc.setFont(undefined, 'normal');
      }

      if (idx % 2 === 0) {
        doc.setFillColor(250, 250, 250);
        doc.rect(margin, yPos - 2, pageWidth - margin * 2, 9, 'F');
      }

      doc.setTextColor(51, 65, 85);
      colX = margin + 3;
      
      const name = (record.equipment_name || '').substring(0, 30);
      doc.text(name, colX, yPos + 4);
      colX += 55;
      
      doc.text(`$${(record.acquisition_cost || 0).toLocaleString()}`, colX, yPos + 4);
      colX += 30;
      
      doc.text(`$${(record.current_book_value || 0).toLocaleString()}`, colX, yPos + 4);
      colX += 30;
      
      doc.text(`$${(record.annual_depreciation || 0).toLocaleString()}`, colX, yPos + 4);
      colX += 28;
      
      doc.text((record.depreciation_method || '').replace(/_/g, ' '), colX, yPos + 4);

      yPos += 9;
    });

    // Footer
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.setFont(undefined, 'normal');
      doc.setDrawColor(226, 232, 240);
      doc.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);
      doc.text(`AssetStack Platform • Depreciation Report FY${generatedReport.fiscalYear}`, margin, pageHeight - 8);
      doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin - 20, pageHeight - 8);
    }

    doc.save(`Depreciation_Report_FY${generatedReport.fiscalYear}.pdf`);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600" />
            Generate Depreciation Report
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Config Options */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Report Type</Label>
              <Select
                value={reportConfig.reportType}
                onValueChange={(value) => setReportConfig({ ...reportConfig, reportType: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="summary">Summary Report</SelectItem>
                  <SelectItem value="detailed">Detailed Report</SelectItem>
                  <SelectItem value="tax">Tax Report</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Fiscal Year</Label>
              <Select
                value={reportConfig.fiscalYear.toString()}
                onValueChange={(value) => setReportConfig({ ...reportConfig, fiscalYear: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[2024, 2025, 2026].map(year => (
                    <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Checkbox
                id="includeSchedules"
                checked={reportConfig.includeSchedules}
                onCheckedChange={(checked) => setReportConfig({ ...reportConfig, includeSchedules: checked })}
              />
              <Label htmlFor="includeSchedules">Include Schedules</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="includeCharts"
                checked={reportConfig.includeCharts}
                onCheckedChange={(checked) => setReportConfig({ ...reportConfig, includeCharts: checked })}
              />
              <Label htmlFor="includeCharts">Include Charts</Label>
            </div>
          </div>
          
          <Button onClick={generateReport} disabled={generating} className="w-full">
            {generating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileText className="w-4 h-4 mr-2" />}
            Generate Report
          </Button>
          
          {/* Generated Report Preview */}
          {generatedReport && (
            <div className="space-y-4">
              <div className="bg-slate-50 rounded-lg p-4">
                <h4 className="font-semibold mb-3">Report Summary</h4>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-slate-500">Total Assets</p>
                    <p className="font-semibold text-lg">{generatedReport.summary.totalAssets}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Total Book Value</p>
                    <p className="font-semibold text-lg text-green-600">
                      ${generatedReport.summary.totalBookValue.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500">Annual Depreciation</p>
                    <p className="font-semibold text-lg text-amber-600">
                      ${generatedReport.summary.totalAnnualDepreciation.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
              
              {generatedReport.aiInsights && (
                <div className="bg-indigo-50 rounded-lg p-4">
                  <h4 className="font-semibold mb-3 text-indigo-900">AI Insights</h4>
                  <div className="space-y-3 text-sm">
                    {generatedReport.aiInsights.key_observations?.length > 0 && (
                      <div>
                        <p className="font-medium text-indigo-800">Key Observations:</p>
                        <ul className="list-disc list-inside text-indigo-700">
                          {generatedReport.aiInsights.key_observations.map((obs, i) => (
                            <li key={i}>{obs}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {generatedReport.aiInsights.tax_recommendations?.length > 0 && (
                      <div>
                        <p className="font-medium text-indigo-800">Tax Recommendations:</p>
                        <ul className="list-disc list-inside text-indigo-700">
                          {generatedReport.aiInsights.tax_recommendations.map((rec, i) => (
                            <li key={i}>{rec}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Close</Button>
          {generatedReport && (
            <Button onClick={downloadReport}>
              <Download className="w-4 h-4 mr-2" />
              Download Report
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}