import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';
import { Upload, FileText, Cpu, Radio, Wrench, Users, MapPin, Package, CheckCircle, AlertCircle, Loader2, ArrowLeft, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import ImportCard from '@/components/data-import/ImportCard';

const IMPORT_TARGETS = [
  { entity: 'Equipment', label: 'Equipment / Assets', icon: Cpu, color: 'bg-blue-50 text-blue-600', description: 'Import motors, pumps, HVAC units, buildings, and other assets' },
  { entity: 'SensorReading', label: 'Sensor Readings', icon: Radio, color: 'bg-rose-50 text-rose-600', description: 'Import vibration, temperature, pressure, and other sensor data' },
  { entity: 'MaintenanceTask', label: 'Maintenance Tasks', icon: Wrench, color: 'bg-orange-50 text-orange-600', description: 'Import scheduled maintenance, inspections, and repairs' },
  { entity: 'Technician', label: 'Technicians', icon: Users, color: 'bg-cyan-50 text-cyan-600', description: 'Import your team — names, skills, certifications, and contact info' },
  { entity: 'Location', label: 'Locations / Sites', icon: MapPin, color: 'bg-pink-50 text-pink-600', description: 'Import your sites, buildings, depots, and facilities' },
  { entity: 'SparePart', label: 'Spare Parts', icon: Package, color: 'bg-amber-50 text-amber-600', description: 'Import spare parts inventory with stock levels and costs' },
];

export default function DataImport() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 p-4 lg:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <Link to="/">
            <Button variant="ghost" size="icon" className="h-10 w-10">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Import Data</h1>
            <p className="text-sm text-slate-500">Upload CSV or Excel files to populate your platform</p>
          </div>
        </div>

        {/* Info banner */}
        <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 mb-8 flex items-start gap-3">
          <Database className="w-5 h-5 text-indigo-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-indigo-800">How it works</p>
            <p className="text-xs text-indigo-600 mt-1">
              Upload a CSV or Excel file and the system will match columns to fields automatically. 
              Make sure your column headers match the field names (e.g. "name", "type", "location", "status").
              You can download a sample template for each data type below.
            </p>
          </div>
        </div>

        {/* Import cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {IMPORT_TARGETS.map((target) => (
            <ImportCard key={target.entity} target={target} />
          ))}
        </div>
      </div>
    </div>
  );
}