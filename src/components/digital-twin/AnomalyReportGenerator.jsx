import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  FileText, Download, Loader2, AlertTriangle, CheckCircle2,
  Calendar, MapPin, Scan, ClipboardList
} from 'lucide-react';
import { format } from 'date-fns';
import { base44 } from '@/api/base44Client';

const severityColors = {
  critical: 'bg-red-100 text-red-700',
  high: 'bg-orange-100 text-orange-700',
  medium: 'bg-amber-100 text-amber-700',
  low: 'bg-green-100 text-green-700'
};

export default function AnomalyReportGenerator({ open, onOpenChange, scan, anomalies }) {
  const [generating, setGenerating] = useState(false);
  const [reportGenerated, setReportGenerated] = useState(false);
  const [reportContent, setReportContent] = useState('');
  const [options, setOptions] = useState({
    includeSummary: true,
    includeDetails: true,
    includeRecommendations: true,
    includeMeasurements: true,
    additionalNotes: ''
  });

  const anomalyCounts = anomalies.reduce((acc, a) => {
    acc[a.severity] = (acc[a.severity] || 0) + 1;
    return acc;
  }, {});

  const typeGroups = anomalies.reduce((acc, a) => {
    const type = a.type?.replace(/_/g, ' ') || 'Unknown';
    if (!acc[type]) acc[type] = [];
    acc[type].push(a);
    return acc;
  }, {});

  const generateReport = async () => {
    setGenerating(true);

    const prompt = `Generate a professional structural inspection report for the following LiDAR scan data. Be thorough but concise.

SCAN INFORMATION:
- Name: ${scan?.name || 'Unknown'}
- Location: ${scan?.location || 'Unknown'}
- Scan Date: ${scan?.scan_date ? format(new Date(scan.scan_date), 'MMMM d, yyyy') : 'Not specified'}
- Scan Type: ${scan?.scan_type || 'Unknown'}
- Point Count: ${scan?.point_count?.toLocaleString() || 'N/A'}
- Resolution: ${scan?.resolution_mm ? `${scan.resolution_mm}mm` : 'Not specified'}

DETECTED ANOMALIES (${anomalies.length} total):
${Object.entries(anomalyCounts).map(([sev, count]) => `- ${sev}: ${count}`).join('\n')}

ANOMALY DETAILS:
${anomalies.map((a, i) => `
${i + 1}. Type: ${a.type?.replace(/_/g, ' ')}
   Severity: ${a.severity}
   Location: ${a.location_description || 'Not specified'}
   Measurement: ${a.measurement_value ? `${a.measurement_value} ${a.measurement_unit}` : 'Not measured'}
   Notes: ${a.notes || 'None'}
`).join('\n')}

${options.additionalNotes ? `ADDITIONAL NOTES FROM INSPECTOR:\n${options.additionalNotes}` : ''}

Please generate a report that includes:
${options.includeSummary ? '1. Executive Summary' : ''}
${options.includeDetails ? '2. Detailed Findings for each anomaly' : ''}
${options.includeRecommendations ? '3. Recommended Actions and Maintenance Priorities' : ''}
${options.includeMeasurements ? '4. Measurement Analysis and Severity Assessment' : ''}

Format the report professionally with clear sections and bullet points where appropriate.`;

    const response = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          executive_summary: { type: "string" },
          detailed_findings: { 
            type: "array", 
            items: { 
              type: "object",
              properties: {
                anomaly_type: { type: "string" },
                severity: { type: "string" },
                description: { type: "string" },
                potential_causes: { type: "array", items: { type: "string" } },
                recommended_actions: { type: "array", items: { type: "string" } }
              }
            }
          },
          priority_actions: { type: "array", items: { type: "string" } },
          overall_condition: { type: "string" },
          next_inspection_recommendation: { type: "string" }
        }
      }
    });

    setReportContent(response);
    setReportGenerated(true);
    setGenerating(false);
  };

  const downloadReport = () => {
    const reportText = `
STRUCTURAL INSPECTION REPORT
============================
Generated: ${format(new Date(), 'MMMM d, yyyy HH:mm')}

SCAN INFORMATION
----------------
Name: ${scan?.name || 'Unknown'}
Location: ${scan?.location || 'Unknown'}
Scan Date: ${scan?.scan_date ? format(new Date(scan.scan_date), 'MMMM d, yyyy') : 'Not specified'}
Scan Type: ${scan?.scan_type || 'Unknown'}
Points: ${scan?.point_count?.toLocaleString() || 'N/A'}

EXECUTIVE SUMMARY
-----------------
${reportContent.executive_summary || 'N/A'}

Overall Condition: ${reportContent.overall_condition || 'N/A'}
Next Inspection: ${reportContent.next_inspection_recommendation || 'N/A'}

ANOMALY SUMMARY
---------------
Total Anomalies: ${anomalies.length}
${Object.entries(anomalyCounts).map(([sev, count]) => `- ${sev.charAt(0).toUpperCase() + sev.slice(1)}: ${count}`).join('\n')}

DETAILED FINDINGS
-----------------
${reportContent.detailed_findings?.map((f, i) => `
${i + 1}. ${f.anomaly_type} (${f.severity})
   ${f.description}
   
   Potential Causes:
   ${f.potential_causes?.map(c => `   • ${c}`).join('\n') || '   N/A'}
   
   Recommended Actions:
   ${f.recommended_actions?.map(a => `   • ${a}`).join('\n') || '   N/A'}
`).join('\n') || 'N/A'}

PRIORITY ACTIONS
----------------
${reportContent.priority_actions?.map((a, i) => `${i + 1}. ${a}`).join('\n') || 'N/A'}

---
Report generated by AssetStack Digital Twin Module
    `;

    const blob = new Blob([reportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inspection-report-${scan?.name?.replace(/\s+/g, '-').toLowerCase() || 'scan'}-${format(new Date(), 'yyyy-MM-dd')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl bg-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600" />
            Generate Anomaly Report
          </DialogTitle>
        </DialogHeader>

        {!reportGenerated ? (
          <div className="space-y-6">
            {/* Scan Summary */}
            <div className="p-4 bg-slate-50 rounded-lg">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-white rounded-lg shadow-sm">
                  <Scan className="w-6 h-6 text-indigo-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-900">{scan?.name || 'Unknown Scan'}</h4>
                  <div className="flex flex-wrap gap-4 mt-2 text-sm text-slate-600">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {scan?.location || 'Unknown'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {scan?.scan_date ? format(new Date(scan.scan_date), 'MMM d, yyyy') : 'No date'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Anomaly Summary */}
            <div className="p-4 border border-slate-200 rounded-lg">
              <h4 className="font-medium text-slate-900 mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Anomalies to Include ({anomalies.length})
              </h4>
              <div className="flex flex-wrap gap-2">
                {Object.entries(anomalyCounts).map(([severity, count]) => (
                  <Badge key={severity} className={severityColors[severity]}>
                    {count} {severity}
                  </Badge>
                ))}
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                {Object.entries(typeGroups).map(([type, items]) => (
                  <div key={type} className="flex justify-between text-slate-600">
                    <span className="capitalize">{type}:</span>
                    <span className="font-medium">{items.length}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Report Options */}
            <div className="space-y-3">
              <h4 className="font-medium text-slate-900">Report Sections</h4>
              <div className="grid grid-cols-2 gap-3">
                <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-slate-50">
                  <Checkbox 
                    checked={options.includeSummary}
                    onCheckedChange={(c) => setOptions({ ...options, includeSummary: c })}
                  />
                  <span className="text-sm">Executive Summary</span>
                </label>
                <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-slate-50">
                  <Checkbox 
                    checked={options.includeDetails}
                    onCheckedChange={(c) => setOptions({ ...options, includeDetails: c })}
                  />
                  <span className="text-sm">Detailed Findings</span>
                </label>
                <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-slate-50">
                  <Checkbox 
                    checked={options.includeRecommendations}
                    onCheckedChange={(c) => setOptions({ ...options, includeRecommendations: c })}
                  />
                  <span className="text-sm">Recommendations</span>
                </label>
                <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-slate-50">
                  <Checkbox 
                    checked={options.includeMeasurements}
                    onCheckedChange={(c) => setOptions({ ...options, includeMeasurements: c })}
                  />
                  <span className="text-sm">Measurement Analysis</span>
                </label>
              </div>
            </div>

            {/* Additional Notes */}
            <div>
              <Label>Additional Notes (Optional)</Label>
              <Textarea
                value={options.additionalNotes}
                onChange={(e) => setOptions({ ...options, additionalNotes: e.target.value })}
                placeholder="Add any additional observations or context for the report..."
                rows={3}
              />
            </div>

            {/* Generate Button */}
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button 
                className="bg-indigo-600 hover:bg-indigo-700"
                onClick={generateReport}
                disabled={generating || anomalies.length === 0}
              >
                {generating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating Report...
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4 mr-2" />
                    Generate Report
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Generated Report Preview */}
            <div className="p-4 bg-green-50 rounded-lg flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <span className="text-green-800 font-medium">Report Generated Successfully</span>
            </div>

            {/* Executive Summary */}
            <div className="p-4 border border-slate-200 rounded-lg">
              <h4 className="font-medium text-slate-900 mb-2">Executive Summary</h4>
              <p className="text-sm text-slate-600">{reportContent.executive_summary}</p>
              <div className="mt-3 flex gap-4 text-sm">
                <div>
                  <span className="text-slate-500">Overall Condition:</span>
                  <Badge className="ml-2">{reportContent.overall_condition}</Badge>
                </div>
              </div>
            </div>

            {/* Priority Actions */}
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <h4 className="font-medium text-amber-900 mb-2 flex items-center gap-2">
                <ClipboardList className="w-4 h-4" />
                Priority Actions
              </h4>
              <ul className="space-y-2">
                {reportContent.priority_actions?.map((action, i) => (
                  <li key={i} className="text-sm text-amber-800 flex items-start gap-2">
                    <span className="font-bold">{i + 1}.</span>
                    {action}
                  </li>
                ))}
              </ul>
            </div>

            {/* Detailed Findings Preview */}
            <div className="space-y-3">
              <h4 className="font-medium text-slate-900">Detailed Findings</h4>
              <div className="max-h-64 overflow-y-auto space-y-3">
                {reportContent.detailed_findings?.map((finding, i) => (
                  <div key={i} className="p-3 border border-slate-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium capitalize">{finding.anomaly_type}</span>
                      <Badge className={severityColors[finding.severity]}>{finding.severity}</Badge>
                    </div>
                    <p className="text-sm text-slate-600 mb-2">{finding.description}</p>
                    {finding.potential_causes?.length > 0 && (
                      <div className="text-xs">
                        <span className="text-slate-500">Potential Causes: </span>
                        <span className="text-slate-700">{finding.potential_causes.join(', ')}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Download Button */}
            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setReportGenerated(false)}>
                Regenerate
              </Button>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Close
                </Button>
                <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={downloadReport}>
                  <Download className="w-4 h-4 mr-2" />
                  Download Report
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}