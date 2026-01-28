import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Download, Search, ArrowUpDown, ArrowUp, ArrowDown,
  ChevronLeft, ChevronRight, Printer, RefreshCw
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from 'date-fns';

export default function ReportPreview({ report, data, onExport, onBack }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState(report.defaultSort?.field || '');
  const [sortDirection, setSortDirection] = useState(report.defaultSort?.direction || 'asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const rawData = data[report.dataSource] || [];

  // Apply filters
  const filteredData = useMemo(() => {
    let result = [...rawData];

    // Apply default filters from template
    if (report.defaultFilters) {
      Object.entries(report.defaultFilters).forEach(([key, value]) => {
        result = result.filter(item => item[key] === value);
      });
    }

    // Apply custom filters
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

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(item =>
        report.columns.some(col => 
          String(item[col] || '').toLowerCase().includes(query)
        )
      );
    }

    return result;
  }, [rawData, report, searchQuery]);

  // Apply sorting
  const sortedData = useMemo(() => {
    if (!sortField) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];

      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      let comparison = 0;
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        comparison = aVal - bVal;
      } else {
        comparison = String(aVal).localeCompare(String(bVal));
      }

      return sortDirection === 'desc' ? -comparison : comparison;
    });
  }, [filteredData, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(sortedData.length / pageSize);
  const paginatedData = sortedData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const formatCellValue = (value, column) => {
    if (value === null || value === undefined) return '-';
    
    // Date formatting
    if (column.includes('date') || column.includes('_at')) {
      try {
        return format(new Date(value), 'MMM d, yyyy');
      } catch {
        return value;
      }
    }

    // Currency formatting
    if (column.includes('cost') || column.includes('price') || column.includes('rate')) {
      if (typeof value === 'number') {
        return '$' + value.toLocaleString();
      }
    }

    // Percentage formatting
    if (column.includes('score') || column.includes('probability') || column.includes('rating')) {
      if (typeof value === 'number') {
        return value.toFixed(1) + '%';
      }
    }

    // Boolean formatting
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }

    return String(value);
  };

  const getStatusBadge = (value, column) => {
    if (!value) return null;
    
    const statusColors = {
      // Equipment status
      operational: 'bg-emerald-100 text-emerald-700',
      degraded: 'bg-amber-100 text-amber-700',
      critical: 'bg-red-100 text-red-700',
      maintenance: 'bg-blue-100 text-blue-700',
      offline: 'bg-slate-100 text-slate-600',
      // Task status
      scheduled: 'bg-blue-100 text-blue-700',
      in_progress: 'bg-amber-100 text-amber-700',
      completed: 'bg-emerald-100 text-emerald-700',
      cancelled: 'bg-slate-100 text-slate-600',
      overdue: 'bg-red-100 text-red-700',
      // Priority
      low: 'bg-slate-100 text-slate-600',
      medium: 'bg-blue-100 text-blue-700',
      high: 'bg-orange-100 text-orange-700',
      urgent: 'bg-red-100 text-red-700',
      // Risk
      // Severity
      info: 'bg-blue-100 text-blue-700',
      warning: 'bg-amber-100 text-amber-700',
      emergency: 'bg-red-100 text-red-700',
      // Alert status
      active: 'bg-amber-100 text-amber-700',
      acknowledged: 'bg-blue-100 text-blue-700',
      resolved: 'bg-emerald-100 text-emerald-700',
      dismissed: 'bg-slate-100 text-slate-600',
      // Availability
      available: 'bg-emerald-100 text-emerald-700',
      busy: 'bg-amber-100 text-amber-700',
      on_leave: 'bg-slate-100 text-slate-600',
      unavailable: 'bg-red-100 text-red-700'
    };

    const colorClass = statusColors[value.toLowerCase()] || 'bg-slate-100 text-slate-600';
    
    if (column === 'status' || column === 'priority' || column === 'severity' || 
        column === 'risk_level' || column === 'availability_status') {
      return (
        <Badge className={`${colorClass} capitalize`}>
          {value.replace(/_/g, ' ')}
        </Badge>
      );
    }
    
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h2 className="text-xl font-semibold text-slate-900">{report.name}</h2>
            {report.description && (
              <p className="text-sm text-slate-500">{report.description}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={onExport}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Metrics */}
      {report.metrics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {report.metrics.map((metric, idx) => (
            <Card key={idx} className="bg-white border-slate-200">
              <CardContent className="p-4">
                <p className="text-sm text-slate-500">{metric.label}</p>
                <p className="text-2xl font-semibold text-slate-900 mt-1">
                  {metric.calc(data)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Table Controls */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search in report..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500">
            {sortedData.length} records
          </span>
          <Select value={String(pageSize)} onValueChange={(v) => { setPageSize(Number(v)); setCurrentPage(1); }}>
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10 rows</SelectItem>
              <SelectItem value="25">25 rows</SelectItem>
              <SelectItem value="50">50 rows</SelectItem>
              <SelectItem value="100">100 rows</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Data Table */}
      <Card className="bg-white border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                {report.columns.map(column => (
                  <TableHead 
                    key={column}
                    className="cursor-pointer hover:bg-slate-100 transition-colors"
                    onClick={() => handleSort(column)}
                  >
                    <div className="flex items-center gap-2 capitalize">
                      {column.replace(/_/g, ' ')}
                      {sortField === column ? (
                        sortDirection === 'asc' ? 
                          <ArrowUp className="w-3 h-3" /> : 
                          <ArrowDown className="w-3 h-3" />
                      ) : (
                        <ArrowUpDown className="w-3 h-3 text-slate-300" />
                      )}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={report.columns.length} className="text-center py-8 text-slate-500">
                    No data matches your criteria
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((row, idx) => (
                  <TableRow key={row.id || idx} className="hover:bg-slate-50">
                    {report.columns.map(column => (
                      <TableCell key={column}>
                        {getStatusBadge(row[column], column) || formatCellValue(row[column], column)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">
            Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, sortedData.length)} of {sortedData.length} records
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm text-slate-600 px-2">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}