import React from 'react';
import { motion } from 'framer-motion';
import { 
  Activity, Wrench, DollarSign, AlertTriangle, Brain, 
  Cpu, TrendingUp, Clock, Package, Users, BarChart3,
  FileText, ChevronRight
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const REPORT_TEMPLATES = [
  {
    id: 'fleet-health-summary',
    name: 'Fleet Health Summary',
    description: 'Overview of equipment health scores, risk levels, and operational status across your entire fleet',
    icon: Activity,
    color: 'bg-emerald-500',
    category: 'Equipment',
    dataSource: 'equipment',
    columns: ['name', 'type', 'location', 'status', 'health_score', 'risk_level', 'remaining_useful_life_days', 'failure_probability'],
    defaultFilters: {},
    defaultSort: { field: 'health_score', direction: 'asc' },
    metrics: [
      { label: 'Avg Health Score', calc: (data) => data.equipment.length ? Math.round(data.equipment.reduce((s, e) => s + (e.health_score || 0), 0) / data.equipment.length) + '%' : 'N/A' },
      { label: 'At Risk Assets', calc: (data) => data.equipment.filter(e => e.risk_level === 'high' || e.risk_level === 'critical').length },
      { label: 'Operational', calc: (data) => data.equipment.filter(e => e.status === 'operational').length },
      { label: 'Critical', calc: (data) => data.equipment.filter(e => e.status === 'critical').length }
    ]
  },
  {
    id: 'maintenance-cost-analysis',
    name: 'Maintenance Cost Analysis',
    description: 'Detailed breakdown of maintenance costs including labor, parts, and total expenses by equipment',
    icon: DollarSign,
    color: 'bg-blue-500',
    category: 'Financial',
    dataSource: 'workOrders',
    columns: ['work_order_number', 'title', 'equipment_id', 'type', 'status', 'actual_labor_cost', 'actual_parts_cost', 'actual_total_cost', 'scheduled_start'],
    defaultFilters: { status: 'completed' },
    defaultSort: { field: 'actual_total_cost', direction: 'desc' },
    metrics: [
      { label: 'Total Cost', calc: (data) => '$' + data.workOrders.reduce((s, w) => s + (w.actual_total_cost || 0), 0).toLocaleString() },
      { label: 'Labor Cost', calc: (data) => '$' + data.workOrders.reduce((s, w) => s + (w.actual_labor_cost || 0), 0).toLocaleString() },
      { label: 'Parts Cost', calc: (data) => '$' + data.workOrders.reduce((s, w) => s + (w.actual_parts_cost || 0), 0).toLocaleString() },
      { label: 'Avg per Work Order', calc: (data) => {
        const completed = data.workOrders.filter(w => w.actual_total_cost);
        return completed.length ? '$' + Math.round(completed.reduce((s, w) => s + w.actual_total_cost, 0) / completed.length).toLocaleString() : 'N/A';
      }}
    ]
  },
  {
    id: 'maintenance-history',
    name: 'Maintenance History Report',
    description: 'Complete history of all maintenance tasks with completion status, duration, and assigned technicians',
    icon: Wrench,
    color: 'bg-purple-500',
    category: 'Maintenance',
    dataSource: 'maintenanceTasks',
    columns: ['title', 'equipment_id', 'type', 'priority', 'status', 'scheduled_date', 'completed_date', 'actual_duration_hours', 'assigned_to'],
    defaultFilters: {},
    defaultSort: { field: 'scheduled_date', direction: 'desc' },
    metrics: [
      { label: 'Total Tasks', calc: (data) => data.maintenanceTasks.length },
      { label: 'Completed', calc: (data) => data.maintenanceTasks.filter(t => t.status === 'completed').length },
      { label: 'In Progress', calc: (data) => data.maintenanceTasks.filter(t => t.status === 'in_progress').length },
      { label: 'Completion Rate', calc: (data) => {
        const total = data.maintenanceTasks.length;
        const completed = data.maintenanceTasks.filter(t => t.status === 'completed').length;
        return total ? Math.round((completed / total) * 100) + '%' : 'N/A';
      }}
    ]
  },
  {
    id: 'prediction-accuracy',
    name: 'AI Prediction Log',
    description: 'Summary of AI predictions including confidence scores, risk factors, and recommendations',
    icon: Brain,
    color: 'bg-violet-500',
    category: 'AI/ML',
    dataSource: 'predictions',
    columns: ['equipment_id', 'prediction_type', 'confidence_score', 'model_version', 'created_date'],
    defaultFilters: {},
    defaultSort: { field: 'created_date', direction: 'desc' },
    metrics: [
      { label: 'Total Predictions', calc: (data) => data.predictions.length },
      { label: 'Avg Confidence', calc: (data) => data.predictions.length ? Math.round(data.predictions.reduce((s, p) => s + (p.confidence_score || 0), 0) / data.predictions.length) + '%' : 'N/A' },
      { label: 'High Confidence (>80%)', calc: (data) => data.predictions.filter(p => (p.confidence_score || 0) > 80).length },
      { label: 'Unique Assets', calc: (data) => new Set(data.predictions.map(p => p.equipment_id)).size }
    ]
  },
  {
    id: 'alert-summary',
    name: 'Alert Summary Report',
    description: 'Overview of all alerts including severity distribution, response times, and resolution status',
    icon: AlertTriangle,
    color: 'bg-amber-500',
    category: 'Alerts',
    dataSource: 'alerts',
    columns: ['title', 'equipment_id', 'severity', 'type', 'status', 'created_date', 'acknowledged_at', 'resolved_at'],
    defaultFilters: {},
    defaultSort: { field: 'created_date', direction: 'desc' },
    metrics: [
      { label: 'Total Alerts', calc: (data) => data.alerts.length },
      { label: 'Active', calc: (data) => data.alerts.filter(a => a.status === 'active').length },
      { label: 'Critical', calc: (data) => data.alerts.filter(a => a.severity === 'critical' || a.severity === 'emergency').length },
      { label: 'Resolved', calc: (data) => data.alerts.filter(a => a.status === 'resolved').length }
    ]
  },
  {
    id: 'spare-parts-inventory',
    name: 'Spare Parts Inventory',
    description: 'Current inventory levels, reorder points, and stock status for all spare parts',
    icon: Package,
    color: 'bg-orange-500',
    category: 'Inventory',
    dataSource: 'spareParts',
    columns: ['part_number', 'name', 'category', 'quantity_in_stock', 'minimum_stock_level', 'unit_cost', 'status', 'supplier'],
    defaultFilters: {},
    defaultSort: { field: 'quantity_in_stock', direction: 'asc' },
    metrics: [
      { label: 'Total Parts', calc: (data) => data.spareParts.length },
      { label: 'Low Stock', calc: (data) => data.spareParts.filter(p => p.status === 'low_stock' || (p.quantity_in_stock || 0) <= (p.minimum_stock_level || 0)).length },
      { label: 'Out of Stock', calc: (data) => data.spareParts.filter(p => p.status === 'out_of_stock' || (p.quantity_in_stock || 0) === 0).length },
      { label: 'Inventory Value', calc: (data) => '$' + data.spareParts.reduce((s, p) => s + ((p.quantity_in_stock || 0) * (p.unit_cost || 0)), 0).toLocaleString() }
    ]
  },
  {
    id: 'technician-performance',
    name: 'Technician Performance',
    description: 'Performance metrics for maintenance technicians including completed tasks and ratings',
    icon: Users,
    color: 'bg-cyan-500',
    category: 'Personnel',
    dataSource: 'technicians',
    columns: ['name', 'employee_id', 'certification_level', 'availability_status', 'completed_tasks_count', 'performance_rating', 'current_workload_hours'],
    defaultFilters: {},
    defaultSort: { field: 'performance_rating', direction: 'desc' },
    metrics: [
      { label: 'Total Technicians', calc: (data) => data.technicians.length },
      { label: 'Available', calc: (data) => data.technicians.filter(t => t.availability_status === 'available').length },
      { label: 'Avg Performance', calc: (data) => data.technicians.length ? Math.round(data.technicians.reduce((s, t) => s + (t.performance_rating || 0), 0) / data.technicians.length) + '%' : 'N/A' },
      { label: 'Total Tasks Done', calc: (data) => data.technicians.reduce((s, t) => s + (t.completed_tasks_count || 0), 0) }
    ]
  },
  {
    id: 'equipment-by-type',
    name: 'Equipment by Type Analysis',
    description: 'Breakdown of equipment by type with health metrics and risk distribution',
    icon: Cpu,
    color: 'bg-indigo-500',
    category: 'Equipment',
    dataSource: 'equipment',
    columns: ['name', 'type', 'manufacturer', 'model', 'installation_date', 'health_score', 'status', 'criticality'],
    defaultFilters: {},
    defaultSort: { field: 'type', direction: 'asc' },
    groupBy: 'type',
    metrics: [
      { label: 'Equipment Types', calc: (data) => new Set(data.equipment.map(e => e.type)).size },
      { label: 'Mission Critical', calc: (data) => data.equipment.filter(e => e.criticality === 'mission_critical').length },
      { label: 'Avg Age (days)', calc: (data) => {
        const withDate = data.equipment.filter(e => e.installation_date);
        if (!withDate.length) return 'N/A';
        const avgMs = withDate.reduce((s, e) => s + (Date.now() - new Date(e.installation_date).getTime()), 0) / withDate.length;
        return Math.round(avgMs / (1000 * 60 * 60 * 24));
      }},
      { label: 'Total Assets', calc: (data) => data.equipment.length }
    ]
  }
];

export default function ReportTemplates({ data, onSelectTemplate }) {
  const categories = [...new Set(REPORT_TEMPLATES.map(t => t.category))];

  return (
    <div className="space-y-8">
      {categories.map(category => (
        <div key={category}>
          <h3 className="text-lg font-semibold text-slate-900 mb-4">{category} Reports</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {REPORT_TEMPLATES.filter(t => t.category === category).map((template, idx) => {
              const Icon = template.icon;
              const dataCount = data[template.dataSource]?.length || 0;
              
              return (
                <motion.div
                  key={template.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Card 
                    className="bg-white border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer group"
                    onClick={() => onSelectTemplate(template)}
                  >
                    <CardContent className="p-5">
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-xl ${template.color} bg-opacity-10`}>
                          <Icon className={`w-6 h-6 ${template.color.replace('bg-', 'text-')}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                            {template.name}
                          </h4>
                          <p className="text-sm text-slate-500 mt-1 line-clamp-2">
                            {template.description}
                          </p>
                          <div className="flex items-center gap-2 mt-3">
                            <Badge variant="outline" className="text-xs">
                              {dataCount} records
                            </Badge>
                            <Badge variant="outline" className="text-xs bg-slate-50">
                              {template.columns.length} fields
                            </Badge>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-500 transition-colors" />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

export { REPORT_TEMPLATES };