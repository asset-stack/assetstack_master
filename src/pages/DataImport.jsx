import React from 'react';
import { Upload, FileText, Cpu, Radio, Wrench, Users, MapPin, Package, ArrowLeft, Database, BarChart3, Globe, Settings, Zap, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import ImportCard from '@/components/data-import/ImportCard';
import IntegrationCard from '@/components/data-import/IntegrationCard';

const IMPORT_TARGETS = [
  { entity: 'Equipment', label: 'Equipment / Assets', icon: Cpu, color: 'bg-blue-50 text-blue-600', description: 'Import motors, pumps, HVAC units, buildings, and other assets' },
  { entity: 'SensorReading', label: 'Sensor Readings', icon: Radio, color: 'bg-rose-50 text-rose-600', description: 'Import vibration, temperature, pressure, and other sensor data' },
  { entity: 'MaintenanceTask', label: 'Maintenance Tasks', icon: Wrench, color: 'bg-orange-50 text-orange-600', description: 'Import scheduled maintenance, inspections, and repairs' },
  { entity: 'Technician', label: 'Technicians', icon: Users, color: 'bg-cyan-50 text-cyan-600', description: 'Import your team — names, skills, certifications, and contact info' },
  { entity: 'Location', label: 'Locations / Sites', icon: MapPin, color: 'bg-pink-50 text-pink-600', description: 'Import your sites, buildings, depots, and facilities' },
  { entity: 'SparePart', label: 'Spare Parts', icon: Package, color: 'bg-amber-50 text-amber-600', description: 'Import spare parts inventory with stock levels and costs' },
];

const INTEGRATIONS = [
  {
    id: 'powerbi',
    icon: BarChart3,
    title: 'Power BI',
    desc: 'Embed interactive Power BI dashboards directly into AssetStack.',
    category: 'Analytics',
    color: 'bg-yellow-50 text-yellow-600',
    configurable: true,
    embeddable: true,
    urlLabel: 'Power BI Embed URL',
    placeholder: 'https://app.powerbi.com/reportEmbed?reportId=...',
    helpText: 'In Power BI → File → Embed report → Website or portal → Copy the embed URL',
  },
  {
    id: 'powerbi_publish',
    icon: Globe,
    title: 'Power BI Publish to Web',
    desc: 'Embed a publicly published Power BI report (no auth required).',
    category: 'Analytics',
    color: 'bg-yellow-50 text-yellow-600',
    configurable: true,
    embeddable: true,
    urlLabel: 'Publish to Web URL',
    placeholder: 'https://app.powerbi.com/view?r=...',
    helpText: 'In Power BI → File → Publish to web → Copy the embed URL',
  },
  {
    id: 'sql_database',
    icon: Database,
    title: 'SQL Databases',
    desc: 'Connect to SQL Server, PostgreSQL, MySQL, or Azure SQL for live data sync.',
    category: 'Database',
    color: 'bg-indigo-50 text-indigo-600',
    configurable: true,
    urlLabel: 'Connection String',
    placeholder: 'Server=myserver;Database=mydb;User=...',
    helpText: 'Connection details will be used in backend functions to sync data.',
  },
  {
    id: 'sharepoint',
    icon: FileText,
    title: 'SharePoint & OneDrive',
    desc: 'Pull documents, maintenance manuals, and asset records from your SharePoint.',
    category: 'Documents',
    color: 'bg-teal-50 text-teal-600',
    configurable: true,
    urlLabel: 'SharePoint Site URL',
    placeholder: 'https://yourorg.sharepoint.com/sites/...',
    helpText: 'Enter your SharePoint site or library URL to connect documents.',
  },
  {
    id: 'google_sheets',
    icon: FileText,
    title: 'Google Sheets',
    desc: 'Import asset registers, inventory lists, or schedule data from spreadsheets.',
    category: 'Spreadsheets',
    color: 'bg-emerald-50 text-emerald-600',
    configurable: true,
    embeddable: true,
    urlLabel: 'Published Google Sheet URL',
    placeholder: 'https://docs.google.com/spreadsheets/d/.../pubhtml',
    helpText: 'Publish your sheet: File → Share → Publish to web → Copy the link.',
  },
  {
    id: 'bigquery',
    icon: Database,
    title: 'Google BigQuery',
    desc: 'Connect to BigQuery for large-scale sensor data and analytics.',
    category: 'Analytics',
    color: 'bg-blue-50 text-blue-600',
    configurable: true,
    urlLabel: 'BigQuery Project ID',
    placeholder: 'my-project-id',
    helpText: 'Used in backend functions to query your BigQuery datasets.',
  },
  {
    id: 'iot',
    icon: Radio,
    title: 'IoT Platforms',
    desc: 'Connect any IoT platform via REST API or MQTT for real-time sensor data.',
    category: 'IoT',
    color: 'bg-rose-50 text-rose-600',
    configurable: true,
    urlLabel: 'API Endpoint URL',
    placeholder: 'https://your-iot-platform.com/api/v1/...',
    helpText: 'Enter your IoT platform API endpoint. Data will be pulled via backend functions.',
  },
  {
    id: 'erp',
    icon: Settings,
    title: 'ERP / CMMS Systems',
    desc: 'Integrate with SAP, Maximo, or any system with a REST API.',
    category: 'Enterprise',
    color: 'bg-slate-100 text-slate-600',
    configurable: true,
    urlLabel: 'API Base URL',
    placeholder: 'https://your-erp.com/api/...',
    helpText: 'Connect your ERP or CMMS system via its REST API.',
  },
  {
    id: 'zapier',
    icon: Zap,
    title: 'Zapier / Make',
    desc: 'Connect to 5,000+ apps via automation platforms — no coding needed.',
    category: 'Automation',
    color: 'bg-orange-50 text-orange-600',
    configurable: false,
    externalUrl: 'https://zapier.com',
  },
];

export default function DataImport() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 p-4 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <Link to="/">
            <Button variant="ghost" size="icon" className="h-10 w-10">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Data & Integrations</h1>
            <p className="text-sm text-slate-500">Connect your data sources, embed dashboards, and import files</p>
          </div>
        </div>

        {/* Integrations Section */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-4 mt-6">
            <Share2 className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-semibold text-slate-900">Integrations & Dashboards</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {INTEGRATIONS.map((item) => (
              <IntegrationCard key={item.id} integration={item} />
            ))}
          </div>
        </div>

        {/* File Import Section */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Upload className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-semibold text-slate-900">File Import</h2>
          </div>
          <p className="text-xs text-slate-500 mb-4 ml-7">
            Upload CSV or Excel files — column headers are matched to fields automatically.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {IMPORT_TARGETS.map((target) => (
              <ImportCard key={target.entity} target={target} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}