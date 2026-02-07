import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Bell, Shield, Cpu, Clock } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';

const severityConfig = {
  emergency: { bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-700', dot: 'bg-rose-500' },
  critical: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', dot: 'bg-orange-500' },
  warning: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', dot: 'bg-amber-500' },
  info: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', dot: 'bg-blue-500' },
};

export default function ManagerAlertsSummary({ alerts = [], equipment = [] }) {
  const equipmentMap = equipment.reduce((acc, e) => { acc[e.id] = e; return acc; }, {});
  
  const activeAlerts = alerts.filter(a => a.status === 'active');
  const emergencyCount = activeAlerts.filter(a => a.severity === 'emergency').length;
  const criticalCount = activeAlerts.filter(a => a.severity === 'critical').length;
  const warningCount = activeAlerts.filter(a => a.severity === 'warning').length;

  const topAlerts = activeAlerts
    .sort((a, b) => {
      const order = { emergency: 0, critical: 1, warning: 2, info: 3 };
      return (order[a.severity] || 4) - (order[b.severity] || 4);
    })
    .slice(0, 8);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
      className="bg-white rounded-xl border border-slate-200 p-5"
    >
      <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
        <Bell className="w-4 h-4 text-amber-600" /> Active Alerts ({activeAlerts.length})
      </h3>

      {/* Severity Summary */}
      <div className="flex gap-2 mb-4">
        {emergencyCount > 0 && (
          <Badge className="bg-rose-50 text-rose-700 border-rose-200">{emergencyCount} Emergency</Badge>
        )}
        {criticalCount > 0 && (
          <Badge className="bg-orange-50 text-orange-700 border-orange-200">{criticalCount} Critical</Badge>
        )}
        {warningCount > 0 && (
          <Badge className="bg-amber-50 text-amber-700 border-amber-200">{warningCount} Warning</Badge>
        )}
        {activeAlerts.length === 0 && (
          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">
            <Shield className="w-3 h-3 mr-1" /> All Clear
          </Badge>
        )}
      </div>

      {/* Alert List */}
      {topAlerts.length === 0 ? (
        <div className="text-center py-8">
          <Shield className="w-12 h-12 text-emerald-300 mx-auto mb-3" />
          <p className="text-slate-400 text-sm">No active alerts</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[340px] overflow-y-auto">
          {topAlerts.map((alert) => {
            const config = severityConfig[alert.severity] || severityConfig.info;
            const eq = equipmentMap[alert.equipment_id];
            return (
              <div key={alert.id} className={`p-3 rounded-lg border ${config.bg} ${config.border}`}>
                <div className="flex items-start gap-2">
                  <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${config.dot}`} />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${config.text}`}>{alert.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{alert.message}</p>
                    <div className="flex items-center gap-3 mt-1.5">
                      {eq && (
                        <span className="text-[10px] text-slate-500 flex items-center gap-1">
                          <Cpu className="w-3 h-3" /> {eq.name}
                        </span>
                      )}
                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {format(new Date(alert.created_date), 'MMM d, h:mm a')}
                      </span>
                    </div>
                  </div>
                  <Badge variant="outline" className={`text-[10px] shrink-0 ${config.text}`}>
                    {alert.severity}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}