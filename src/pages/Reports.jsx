import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { 
  FileText, Download, BarChart3, Wrench, Cpu, AlertTriangle, Brain
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";

import ReportBuilder from '@/components/reports/ReportBuilder';
import ReportPreview from '@/components/reports/ReportPreview';
import ReportTemplates from '@/components/reports/ReportTemplates';
import ExportDialog from '@/components/reports/ExportDialog';

export default function Reports() {
  const [activeTab, setActiveTab] = useState('templates');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [customReport, setCustomReport] = useState(null);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [reportToExport, setReportToExport] = useState(null);

  const { data: equipment = [] } = useQuery({
    queryKey: ['equipment'],
    queryFn: () => base44.entities.Equipment.list('-created_date', 500),
  });

  const { data: maintenanceTasks = [] } = useQuery({
    queryKey: ['maintenanceTasks'],
    queryFn: () => base44.entities.MaintenanceTask.list('-created_date', 500),
  });

  const { data: workOrders = [] } = useQuery({
    queryKey: ['workOrders'],
    queryFn: () => base44.entities.WorkOrder.list('-created_date', 500),
  });

  const { data: alerts = [] } = useQuery({
    queryKey: ['alerts'],
    queryFn: () => base44.entities.Alert.list('-created_date', 500),
  });

  const { data: predictions = [] } = useQuery({
    queryKey: ['predictions'],
    queryFn: () => base44.entities.PredictionLog.list('-created_date', 500),
  });

  const { data: sensorReadings = [] } = useQuery({
    queryKey: ['sensorReadings'],
    queryFn: () => base44.entities.SensorReading.list('-created_date', 1000),
  });

  const { data: spareParts = [] } = useQuery({
    queryKey: ['spareParts'],
    queryFn: () => base44.entities.SparePart.list('-created_date', 200),
  });

  const { data: technicians = [] } = useQuery({
    queryKey: ['technicians'],
    queryFn: () => base44.entities.Technician.list('-created_date', 100),
  });

  const allData = {
    equipment,
    maintenanceTasks,
    workOrders,
    alerts,
    predictions,
    sensorReadings,
    spareParts,
    technicians
  };

  const handleSelectTemplate = (template) => {
    setSelectedTemplate(template);
    setActiveTab('preview');
  };

  const handleCustomReportGenerated = (report) => {
    setCustomReport(report);
    setActiveTab('preview');
  };

  const handleExport = (report) => {
    setReportToExport(report);
    setShowExportDialog(true);
  };

  const currentReport = selectedTemplate || customReport;

  const totalEquipment = equipment.length;
  const totalTasks = maintenanceTasks.length;
  const totalAlerts = alerts.filter(a => a.status === 'active').length;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-[1800px] mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900 flex items-center gap-3">
              <FileText className="w-7 h-7 text-indigo-600" />
              Reports & Analytics
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Generate custom reports and export data insights
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-white border-slate-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-50 rounded-lg">
                  <Cpu className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <p className="text-2xl font-semibold text-slate-900">{totalEquipment}</p>
                  <p className="text-xs text-slate-500">Total Assets</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white border-slate-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-50 rounded-lg">
                  <Wrench className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-2xl font-semibold text-slate-900">{totalTasks}</p>
                  <p className="text-xs text-slate-500">Maintenance Tasks</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white border-slate-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-50 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-semibold text-slate-900">{totalAlerts}</p>
                  <p className="text-xs text-slate-500">Active Alerts</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white border-slate-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-50 rounded-lg">
                  <Brain className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-semibold text-slate-900">{predictions.length}</p>
                  <p className="text-xs text-slate-500">AI Predictions</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white border border-slate-200 mb-6">
            <TabsTrigger value="templates" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
              <FileText className="w-4 h-4 mr-2" />
              Report Templates
            </TabsTrigger>
            <TabsTrigger value="builder" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
              <BarChart3 className="w-4 h-4 mr-2" />
              Custom Report Builder
            </TabsTrigger>
            <TabsTrigger value="preview" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white" disabled={!currentReport}>
              <Download className="w-4 h-4 mr-2" />
              Report Preview
            </TabsTrigger>
          </TabsList>

          <TabsContent value="templates">
            <ReportTemplates 
              data={allData}
              onSelectTemplate={handleSelectTemplate}
            />
          </TabsContent>

          <TabsContent value="builder">
            <ReportBuilder 
              data={allData}
              onReportGenerated={handleCustomReportGenerated}
            />
          </TabsContent>

          <TabsContent value="preview">
            {currentReport && (
              <ReportPreview 
                report={currentReport}
                data={allData}
                onExport={() => handleExport(currentReport)}
                onBack={() => {
                  setSelectedTemplate(null);
                  setCustomReport(null);
                  setActiveTab('templates');
                }}
              />
            )}
          </TabsContent>
        </Tabs>
      </div>

      <ExportDialog
        open={showExportDialog}
        onOpenChange={setShowExportDialog}
        report={reportToExport}
        data={allData}
      />
    </div>
  );
}