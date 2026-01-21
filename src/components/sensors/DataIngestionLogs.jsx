import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, AlertTriangle, FileText, Clock, Database } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from 'date-fns';

export default function DataIngestionLogs({ logs }) {
  const getStatusBadge = (status) => {
    const configs = {
      success: { icon: CheckCircle, className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
      partial: { icon: AlertTriangle, className: 'bg-amber-50 text-amber-700 border-amber-200' },
      failed: { icon: XCircle, className: 'bg-rose-50 text-rose-700 border-rose-200' }
    };
    const config = configs[status] || configs.failed;
    const Icon = config.icon;
    return (
      <Badge className={config.className}>
        <Icon className="w-3 h-3 mr-1" />
        {status}
      </Badge>
    );
  };

  const getSourceBadge = (source) => {
    const colors = {
      api: 'bg-blue-50 text-blue-700 border-blue-200',
      csv_import: 'bg-purple-50 text-purple-700 border-purple-200',
      mqtt: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      webhook: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      manual: 'bg-slate-50 text-slate-700 border-slate-200'
    };
    return (
      <Badge variant="outline" className={colors[source] || colors.manual}>
        {source?.replace(/_/g, ' ')}
      </Badge>
    );
  };

  // Calculate stats
  const totalRecords = logs.reduce((sum, log) => sum + (log.records_processed || 0), 0);
  const successfulImports = logs.filter(l => l.status === 'success').length;
  const failedImports = logs.filter(l => l.status === 'failed').length;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl border border-slate-200 p-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-slate-900">{logs.length}</p>
              <p className="text-xs text-slate-500">Total Imports</p>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-white rounded-xl border border-slate-200 p-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-emerald-600">{successfulImports}</p>
              <p className="text-xs text-slate-500">Successful</p>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl border border-slate-200 p-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-rose-50 flex items-center justify-center">
              <XCircle className="w-5 h-5 text-rose-600" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-rose-600">{failedImports}</p>
              <p className="text-xs text-slate-500">Failed</p>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white rounded-xl border border-slate-200 p-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
              <Database className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-purple-600">{totalRecords.toLocaleString()}</p>
              <p className="text-xs text-slate-500">Records Processed</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {logs.length === 0 ? (
          <div className="text-center py-16">
            <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-600">No ingestion logs yet</h3>
            <p className="text-sm text-slate-400">Import sensor data to see activity here</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 hover:bg-slate-50">
                <TableHead className="text-slate-600">Time</TableHead>
                <TableHead className="text-slate-600">Source</TableHead>
                <TableHead className="text-slate-600">Status</TableHead>
                <TableHead className="text-slate-600">Records</TableHead>
                <TableHead className="text-slate-600">Processing Time</TableHead>
                <TableHead className="text-slate-600">Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log, idx) => (
                <TableRow key={log.id} className="hover:bg-slate-50">
                  <TableCell className="text-slate-600">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-slate-400" />
                      {format(new Date(log.created_date), 'MMM d, HH:mm:ss')}
                    </div>
                  </TableCell>
                  <TableCell>{getSourceBadge(log.source)}</TableCell>
                  <TableCell>{getStatusBadge(log.status)}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <span className="text-emerald-600 font-medium">{log.records_processed || 0}</span>
                      <span className="text-slate-400"> / {log.records_received || 0}</span>
                      {log.records_failed > 0 && (
                        <span className="text-rose-500 ml-2">({log.records_failed} failed)</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-600">
                    {log.processing_time_ms ? `${log.processing_time_ms}ms` : '-'}
                  </TableCell>
                  <TableCell className="max-w-xs">
                    {log.file_name && (
                      <p className="text-sm text-slate-600 truncate">{log.file_name}</p>
                    )}
                    {log.error_message && (
                      <p className="text-xs text-rose-600 truncate" title={log.error_message}>
                        {log.error_message}
                      </p>
                    )}
                    {log.sensor_types && log.sensor_types.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {log.sensor_types.slice(0, 3).map(type => (
                          <Badge key={type} variant="outline" className="text-xs capitalize">
                            {type.replace(/_/g, ' ')}
                          </Badge>
                        ))}
                        {log.sensor_types.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{log.sensor_types.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}