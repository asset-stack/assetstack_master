import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, Trash2, GripVertical, Filter, ArrowUpDown, 
  Play, Settings, Database, Columns, X
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

const DATA_SOURCES = [
  { id: 'equipment', name: 'Equipment', fields: ['name', 'type', 'location', 'manufacturer', 'model', 'serial_number', 'status', 'health_score', 'risk_level', 'criticality', 'operating_hours', 'remaining_useful_life_days', 'failure_probability', 'installation_date', 'last_maintenance_date'] },
  { id: 'maintenanceTasks', name: 'Maintenance Tasks', fields: ['title', 'equipment_id', 'type', 'priority', 'status', 'scheduled_date', 'completed_date', 'estimated_duration_hours', 'actual_duration_hours', 'assigned_to', 'cost_estimate', 'actual_cost', 'ai_recommended'] },
  { id: 'workOrders', name: 'Work Orders', fields: ['work_order_number', 'title', 'equipment_id', 'type', 'priority', 'status', 'assigned_to', 'scheduled_start', 'actual_start', 'actual_end', 'estimated_hours', 'actual_labor_cost', 'actual_parts_cost', 'actual_total_cost'] },
  { id: 'alerts', name: 'Alerts', fields: ['title', 'equipment_id', 'severity', 'type', 'status', 'message', 'triggered_value', 'threshold_value', 'created_date', 'acknowledged_at', 'resolved_at'] },
  { id: 'predictions', name: 'Prediction Logs', fields: ['equipment_id', 'prediction_type', 'confidence_score', 'model_version', 'created_date'] },
  { id: 'sensorReadings', name: 'Sensor Readings', fields: ['equipment_id', 'sensor_type', 'value', 'unit', 'is_anomaly', 'anomaly_score', 'timestamp'] },
  { id: 'spareParts', name: 'Spare Parts', fields: ['part_number', 'name', 'category', 'quantity_in_stock', 'minimum_stock_level', 'unit_cost', 'status', 'supplier', 'lead_time_days'] },
  { id: 'technicians', name: 'Technicians', fields: ['name', 'employee_id', 'email', 'certification_level', 'availability_status', 'completed_tasks_count', 'performance_rating', 'hourly_rate'] }
];

const FILTER_OPERATORS = [
  { id: 'equals', label: 'Equals' },
  { id: 'not_equals', label: 'Not Equals' },
  { id: 'contains', label: 'Contains' },
  { id: 'greater_than', label: 'Greater Than' },
  { id: 'less_than', label: 'Less Than' },
  { id: 'is_empty', label: 'Is Empty' },
  { id: 'is_not_empty', label: 'Is Not Empty' }
];

export default function ReportBuilder({ data, onReportGenerated }) {
  const [reportName, setReportName] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [dataSource, setDataSource] = useState('');
  const [selectedColumns, setSelectedColumns] = useState([]);
  const [filters, setFilters] = useState([]);
  const [sortField, setSortField] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');
  const [groupBy, setGroupBy] = useState('');

  const currentSource = DATA_SOURCES.find(s => s.id === dataSource);
  const availableFields = currentSource?.fields || [];

  const handleDataSourceChange = (source) => {
    setDataSource(source);
    setSelectedColumns([]);
    setFilters([]);
    setSortField('');
    setGroupBy('');
  };

  const toggleColumn = (field) => {
    setSelectedColumns(prev => 
      prev.includes(field) 
        ? prev.filter(f => f !== field)
        : [...prev, field]
    );
  };

  const addFilter = () => {
    setFilters([...filters, { field: '', operator: 'equals', value: '' }]);
  };

  const updateFilter = (index, updates) => {
    const newFilters = [...filters];
    newFilters[index] = { ...newFilters[index], ...updates };
    setFilters(newFilters);
  };

  const removeFilter = (index) => {
    setFilters(filters.filter((_, i) => i !== index));
  };

  const generateReport = () => {
    if (!reportName || !dataSource || selectedColumns.length === 0) return;

    const report = {
      id: `custom-${Date.now()}`,
      name: reportName,
      description: reportDescription,
      dataSource,
      columns: selectedColumns,
      filters: filters.filter(f => f.field && f.value),
      defaultSort: sortField ? { field: sortField, direction: sortDirection } : null,
      groupBy: groupBy || null,
      isCustom: true,
      metrics: [
        { label: 'Total Records', calc: (d) => d[dataSource]?.length || 0 }
      ]
    };

    onReportGenerated(report);
  };

  const selectAllColumns = () => {
    setSelectedColumns(availableFields);
  };

  const clearColumns = () => {
    setSelectedColumns([]);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Configuration Panel */}
      <div className="lg:col-span-2 space-y-6">
        {/* Basic Info */}
        <Card className="bg-white border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Settings className="w-5 h-5 text-slate-500" />
              Report Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Report Name *</Label>
                <Input
                  value={reportName}
                  onChange={(e) => setReportName(e.target.value)}
                  placeholder="e.g., Monthly Equipment Status"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Data Source *</Label>
                <Select value={dataSource} onValueChange={handleDataSourceChange}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select data source" />
                  </SelectTrigger>
                  <SelectContent>
                    {DATA_SOURCES.map(source => (
                      <SelectItem key={source.id} value={source.id}>
                        {source.name} ({data[source.id]?.length || 0} records)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={reportDescription}
                onChange={(e) => setReportDescription(e.target.value)}
                placeholder="Brief description of this report..."
                className="mt-1"
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        {/* Column Selection */}
        {dataSource && (
          <Card className="bg-white border-slate-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Columns className="w-5 h-5 text-slate-500" />
                  Select Columns
                </CardTitle>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={selectAllColumns}>
                    Select All
                  </Button>
                  <Button variant="ghost" size="sm" onClick={clearColumns}>
                    Clear
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {availableFields.map(field => (
                  <label
                    key={field}
                    className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors ${
                      selectedColumns.includes(field)
                        ? 'border-indigo-300 bg-indigo-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <Checkbox
                      checked={selectedColumns.includes(field)}
                      onCheckedChange={() => toggleColumn(field)}
                    />
                    <span className="text-sm text-slate-700 capitalize">
                      {field.replace(/_/g, ' ')}
                    </span>
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        {dataSource && (
          <Card className="bg-white border-slate-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Filter className="w-5 h-5 text-slate-500" />
                  Filters
                </CardTitle>
                <Button variant="outline" size="sm" onClick={addFilter}>
                  <Plus className="w-4 h-4 mr-1" />
                  Add Filter
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {filters.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-4">
                  No filters applied. Add filters to narrow down your report data.
                </p>
              ) : (
                <div className="space-y-3">
                  {filters.map((filter, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                      <Select value={filter.field} onValueChange={(v) => updateFilter(idx, { field: v })}>
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="Field" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableFields.map(f => (
                            <SelectItem key={f} value={f} className="capitalize">
                              {f.replace(/_/g, ' ')}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select value={filter.operator} onValueChange={(v) => updateFilter(idx, { operator: v })}>
                        <SelectTrigger className="w-36">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {FILTER_OPERATORS.map(op => (
                            <SelectItem key={op.id} value={op.id}>{op.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {!['is_empty', 'is_not_empty'].includes(filter.operator) && (
                        <Input
                          value={filter.value}
                          onChange={(e) => updateFilter(idx, { value: e.target.value })}
                          placeholder="Value"
                          className="flex-1"
                        />
                      )}
                      <Button variant="ghost" size="icon" onClick={() => removeFilter(idx)}>
                        <X className="w-4 h-4 text-slate-400" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Sorting & Grouping */}
        {dataSource && selectedColumns.length > 0 && (
          <Card className="bg-white border-slate-200">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <ArrowUpDown className="w-5 h-5 text-slate-500" />
                Sorting & Grouping
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Sort By</Label>
                  <Select value={sortField} onValueChange={setSortField}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select field" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={null}>None</SelectItem>
                      {selectedColumns.map(f => (
                        <SelectItem key={f} value={f} className="capitalize">
                          {f.replace(/_/g, ' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Direction</Label>
                  <Select value={sortDirection} onValueChange={setSortDirection}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="asc">Ascending</SelectItem>
                      <SelectItem value="desc">Descending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Group By</Label>
                  <Select value={groupBy} onValueChange={setGroupBy}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="None" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={null}>None</SelectItem>
                      {selectedColumns.map(f => (
                        <SelectItem key={f} value={f} className="capitalize">
                          {f.replace(/_/g, ' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Preview Panel */}
      <div className="lg:col-span-1">
        <Card className="bg-white border-slate-200 sticky top-6">
          <CardHeader>
            <CardTitle className="text-lg">Report Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-slate-500">Name</p>
              <p className="font-medium text-slate-900">{reportName || 'Untitled Report'}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Data Source</p>
              <p className="font-medium text-slate-900">
                {currentSource?.name || 'Not selected'}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Columns Selected</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {selectedColumns.length === 0 ? (
                  <span className="text-slate-400 text-sm">None</span>
                ) : (
                  selectedColumns.slice(0, 5).map(col => (
                    <Badge key={col} variant="outline" className="text-xs capitalize">
                      {col.replace(/_/g, ' ')}
                    </Badge>
                  ))
                )}
                {selectedColumns.length > 5 && (
                  <Badge variant="outline" className="text-xs">
                    +{selectedColumns.length - 5} more
                  </Badge>
                )}
              </div>
            </div>
            <div>
              <p className="text-sm text-slate-500">Filters Applied</p>
              <p className="font-medium text-slate-900">{filters.filter(f => f.field).length}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Estimated Records</p>
              <p className="font-medium text-slate-900">
                {dataSource ? data[dataSource]?.length || 0 : 0}
              </p>
            </div>

            <Button
              onClick={generateReport}
              disabled={!reportName || !dataSource || selectedColumns.length === 0}
              className="w-full bg-indigo-600 hover:bg-indigo-700"
            >
              <Play className="w-4 h-4 mr-2" />
              Generate Report
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}