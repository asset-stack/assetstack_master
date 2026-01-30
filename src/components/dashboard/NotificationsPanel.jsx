import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, X, AlertTriangle, Cpu, Wrench, Package, 
  Brain, Scan, CheckCircle2, Clock
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

const getNotificationIcon = (type) => {
  switch (type) {
    case 'anomaly_detected':
    case 'threshold_exceeded':
      return AlertTriangle;
    case 'failure_predicted':
    case 'degradation_trend':
      return Brain;
    case 'maintenance_due':
      return Wrench;
    case 'sensor_fault':
      return Cpu;
    default:
      return Bell;
  }
};

const getSeverityStyles = (severity) => {
  switch (severity) {
    case 'emergency':
      return 'bg-red-100 text-red-600 border-red-200';
    case 'critical':
      return 'bg-orange-100 text-orange-600 border-orange-200';
    case 'warning':
      return 'bg-amber-100 text-amber-600 border-amber-200';
    default:
      return 'bg-blue-100 text-blue-600 border-blue-200';
  }
};

const formatTimeAgo = (date) => {
  if (!date) return '';
  const now = new Date();
  const alertDate = new Date(date);
  const diffMs = now - alertDate;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
};

export default function NotificationsPanel({ 
  isOpen, 
  onClose, 
  alerts = [], 
  onAcknowledge, 
  onResolve 
}) {
  const activeAlerts = alerts.filter(a => a.status === 'active');
  const acknowledgedAlerts = alerts.filter(a => a.status === 'acknowledged');

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/20 z-50"
        onClick={onClose}
      />
      
      {/* Panel */}
      <motion.div
        initial={{ opacity: 0, x: 20, scale: 0.95 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: 20, scale: 0.95 }}
        className="fixed top-16 right-4 w-96 max-h-[calc(100vh-100px)] bg-white rounded-xl shadow-2xl border border-slate-200 z-50 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-slate-600" />
            <h3 className="font-semibold text-slate-900">Notifications</h3>
            {activeAlerts.length > 0 && (
              <span className="px-2 py-0.5 bg-rose-500 text-white text-xs font-medium rounded-full">
                {activeAlerts.length}
              </span>
            )}
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="w-4 h-4" />
          </Button>
        </div>

        <ScrollArea className="max-h-[500px]">
          {alerts.length === 0 ? (
            <div className="p-8 text-center">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
              <p className="text-slate-600 font-medium">All caught up!</p>
              <p className="text-sm text-slate-400 mt-1">No new notifications</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {/* Active Alerts */}
              {activeAlerts.length > 0 && (
                <div className="p-3">
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2 px-1">
                    Active ({activeAlerts.length})
                  </p>
                  <div className="space-y-2">
                    {activeAlerts.slice(0, 10).map((alert) => {
                      const Icon = getNotificationIcon(alert.type);
                      return (
                        <div 
                          key={alert.id}
                          className={`p-3 rounded-lg border ${getSeverityStyles(alert.severity)}`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="mt-0.5">
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-slate-900 truncate">
                                {alert.title}
                              </p>
                              <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                                {alert.message}
                              </p>
                              <div className="flex items-center gap-2 mt-2">
                                <span className="text-xs text-slate-400 flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {formatTimeAgo(alert.created_date)}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 mt-2">
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  className="h-7 text-xs"
                                  onClick={() => onAcknowledge(alert.id)}
                                >
                                  Acknowledge
                                </Button>
                                <Button 
                                  size="sm"
                                  className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700"
                                  onClick={() => onResolve(alert.id)}
                                >
                                  Resolve
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Acknowledged Alerts */}
              {acknowledgedAlerts.length > 0 && (
                <div className="p-3">
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2 px-1">
                    Acknowledged ({acknowledgedAlerts.length})
                  </p>
                  <div className="space-y-2">
                    {acknowledgedAlerts.slice(0, 5).map((alert) => {
                      const Icon = getNotificationIcon(alert.type);
                      return (
                        <div 
                          key={alert.id}
                          className="p-3 rounded-lg border border-slate-200 bg-slate-50"
                        >
                          <div className="flex items-start gap-3">
                            <div className="mt-0.5 text-slate-400">
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-slate-700 truncate">
                                {alert.title}
                              </p>
                              <p className="text-xs text-slate-400 mt-0.5">
                                {formatTimeAgo(alert.created_date)}
                              </p>
                              <Button 
                                size="sm"
                                variant="outline"
                                className="h-7 text-xs mt-2"
                                onClick={() => onResolve(alert.id)}
                              >
                                Mark Resolved
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>
      </motion.div>
    </>
  );
}