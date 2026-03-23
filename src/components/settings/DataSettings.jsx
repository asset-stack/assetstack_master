import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Database, Cpu, Wrench, FileText, Radio, MapPin, Users, Brain,
  ArrowRight, HardDrive, BarChart3
} from 'lucide-react';

export default function DataSettings() {
  const { data: equipment = [] } = useQuery({ queryKey: ['equipment'], queryFn: () => base44.entities.Equipment.list('-created_date', 200) });
  const { data: locations = [] } = useQuery({ queryKey: ['locations'], queryFn: () => base44.entities.Location.list('-created_date', 100) });
  const { data: tasks = [] } = useQuery({ queryKey: ['tasks'], queryFn: () => base44.entities.MaintenanceTask.list('-created_date', 500) });
  const { data: workOrders = [] } = useQuery({ queryKey: ['workOrders'], queryFn: () => base44.entities.WorkOrder.list('-created_date', 200) });
  const { data: sensors = [] } = useQuery({ queryKey: ['sensorConfigs'], queryFn: () => base44.entities.SensorConfiguration.list('-created_date', 200) });
  const { data: technicians = [] } = useQuery({ queryKey: ['technicians'], queryFn: () => base44.entities.Technician.list('-created_date', 200) });
  const { data: alerts = [] } = useQuery({ queryKey: ['alerts'], queryFn: () => base44.entities.Alert.list('-created_date', 500) });
  const { data: models = [] } = useQuery({ queryKey: ['mlmodels'], queryFn: () => base44.entities.MLModel.list('-created_date', 100) });

  const entities = [
    { name: 'Equipment', count: equipment.length, icon: Cpu, link: '/Equipment', color: 'bg-blue-100 text-blue-600' },
    { name: 'Locations', count: locations.length, icon: MapPin, link: '/Locations', color: 'bg-emerald-100 text-emerald-600' },
    { name: 'Maintenance Tasks', count: tasks.length, icon: Wrench, link: '/Maintenance', color: 'bg-amber-100 text-amber-600' },
    { name: 'Work Orders', count: workOrders.length, icon: FileText, link: '/Maintenance', color: 'bg-violet-100 text-violet-600' },
    { name: 'Sensor Configs', count: sensors.length, icon: Radio, link: '/SensorIntegration', color: 'bg-indigo-100 text-indigo-600' },
    { name: 'Technicians', count: technicians.length, icon: Users, link: '/TeamDirectory', color: 'bg-pink-100 text-pink-600' },
    { name: 'Alerts', count: alerts.length, icon: BarChart3, link: '/Analytics', color: 'bg-red-100 text-red-600' },
    { name: 'ML Models', count: models.length, icon: Brain, link: '/MLModels', color: 'bg-purple-100 text-purple-600' },
  ];

  const totalRecords = entities.reduce((sum, e) => sum + e.count, 0);

  return (
    <div className="space-y-6">
      {/* Overview */}
      <div>
        <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Database className="w-4 h-4 text-indigo-500" />
          Data Overview
        </h3>
        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100 rounded-xl p-4 sm:p-5 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-100 rounded-xl">
              <HardDrive className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{totalRecords.toLocaleString()}</p>
              <p className="text-sm text-slate-600">Total records across {entities.length} data types</p>
            </div>
          </div>
        </div>
      </div>

      {/* Entity Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {entities.map(entity => {
          const Icon = entity.icon;
          return (
            <Link key={entity.name} to={entity.link} className="block">
              <div className="bg-white border border-slate-200 rounded-lg p-4 hover:border-indigo-200 hover:shadow-sm transition-all flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${entity.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">{entity.name}</p>
                    <p className="text-xs text-slate-500">{entity.count} records</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Quick Links */}
      <div>
        <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-3">Quick Actions</h3>
        <div className="flex flex-wrap gap-2">
          <Link to="/DataImport">
            <Button variant="outline" size="sm">Import Data</Button>
          </Link>
          <Link to="/SensorIntegration">
            <Button variant="outline" size="sm">Manage Sensors</Button>
          </Link>
          <Link to="/Reports">
            <Button variant="outline" size="sm">Generate Reports</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}