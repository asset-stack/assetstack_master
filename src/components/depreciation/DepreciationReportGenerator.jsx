import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { FileText, Download, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

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
    
    const reportContent = `
DEPRECIATION REPORT
Generated: ${new Date(generatedReport.generatedAt).toLocaleString()}
Fiscal Year: ${generatedReport.fiscalYear}

═══════════════════════════════════════════════════════════
SUMMARY
═══════════════════════════════════════════════════════════
Total Assets: ${generatedReport.summary.totalAssets}
Total Acquisition Cost: $${generatedReport.summary.totalAcquisitionCost.toLocaleString()}
Total Accumulated Depreciation: $${generatedReport.summary.totalAccumulatedDepreciation.toLocaleString()}
Total Current Book Value: $${generatedReport.summary.totalBookValue.toLocaleString()}
Total Annual Depreciation Expense: $${generatedReport.summary.totalAnnualDepreciation.toLocaleString()}
Average Useful Life: ${generatedReport.summary.averageUsefulLife.toFixed(1)} years

═══════════════════════════════════════════════════════════
BY DEPRECIATION METHOD
═══════════════════════════════════════════════════════════
${Object.entries(generatedReport.byMethod).map(([method, data]) => 
  `${method.replace('_', ' ').toUpperCase()}: ${data.count} assets, $${data.totalValue.toLocaleString()} book value`
).join('\n')}

═══════════════════════════════════════════════════════════
AI INSIGHTS
═══════════════════════════════════════════════════════════

Key Observations:
${generatedReport.aiInsights.key_observations?.map(o => `• ${o}`).join('\n') || 'N/A'}

Tax Recommendations:
${generatedReport.aiInsights.tax_recommendations?.map(r => `• ${r}`).join('\n') || 'N/A'}

Replacement Suggestions:
${generatedReport.aiInsights.replacement_suggestions?.map(s => `• ${s}`).join('\n') || 'N/A'}

Risk Factors:
${generatedReport.aiInsights.risk_factors?.map(r => `• ${r}`).join('\n') || 'N/A'}

═══════════════════════════════════════════════════════════
DETAILED ASSET LIST
═══════════════════════════════════════════════════════════
${generatedReport.records.map(r => 
  `${r.equipment_name}
   Cost: $${r.acquisition_cost?.toLocaleString()} | Book Value: $${r.current_book_value?.toLocaleString()} | Method: ${r.depreciation_method}
   Annual Depreciation: $${r.annual_depreciation?.toLocaleString()} | Status: ${r.status}
`).join('\n')}
    `;
    
    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `depreciation-report-${generatedReport.fiscalYear}.txt`;
    a.click();
    URL.revokeObjectURL(url);
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