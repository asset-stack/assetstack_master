import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, AlertCircle, Info, Zap, Clock, CheckCircle2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from 'date-fns';

export default function AlertsPanel({ alerts, onAcknowledge, onResolve }) {
  const getSeverityConfig = (severity) => {
    switch (severity) {
      case 'emergency':
        return { 
          icon: Zap, 
          bg: 'bg-rose-50', 
          border: 'border-rose-200',
          iconColor: 'text-rose-500',
          pulse: true
        };
      case 'critical':
        return { 
          icon: AlertTriangle, 
          bg: 'bg-orange-50', 
          border: 'border-orange-200',
          iconColor: 'text-orange-500',
          pulse: true
        };
      case 'warning':
        return { 
          icon: AlertCircle, 
          bg: 'bg-amber-50', 
          border: 'border-amber-200',
          iconColor: 'text-amber-500',
          pulse: false
        };
      default:
        return { 
          icon: Info, 
          bg: 'bg-blue-50', 
          border: 'border-blue-200',
          iconColor: 'text-blue-500',
          pulse: false
        };
    }
  };

  const activeAlerts = alerts.filter(a => a.status === 'active');

  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
      <div className="p-5 border-b border-slate-100/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-[15px] font-bold text-slate-900">Active Alerts</h3>
          {activeAlerts.length > 0 && (
            <span className="px-2.5 py-1 bg-rose-50 text-rose-600 text-[11px] font-semibold rounded-full">
              {activeAlerts.length} active
            </span>
          )}
        </div>
      </div>
      
      <div className="max-h-[400px] overflow-y-auto">
        <AnimatePresence>
          {alerts.length === 0 ? (
            <div className="p-8 text-center">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
              <p className="text-slate-500">All systems operational</p>
            </div>
          ) : (
            alerts.slice(0, 8).map((alert, idx) => {
              const config = getSeverityConfig(alert.severity);
              const Icon = config.icon;
              
              return (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`p-4 border-b border-slate-100 ${config.bg} hover:bg-slate-50 transition-colors`}
                >
                  <div className="flex gap-3">
                    <div className={`relative ${config.iconColor}`}>
                      <Icon className="w-5 h-5" />
                      {config.pulse && alert.status === 'active' && (
                        <span className="absolute -top-1 -right-1 w-2 h-2 bg-rose-500 rounded-full animate-ping" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-sm font-medium text-slate-900 truncate">{alert.title}</h4>
                        <span className="text-xs text-slate-400 whitespace-nowrap flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDistanceToNow(new Date(alert.created_date), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">{alert.message}</p>
                      {alert.recommended_action && (
                        <p className="text-xs text-indigo-600 mt-2">
                          💡 {alert.recommended_action}
                        </p>
                      )}
                      {alert.status === 'active' && (
                        <div className="flex gap-2 mt-3">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="h-7 text-xs bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                            onClick={() => onAcknowledge && onAcknowledge(alert.id)}
                          >
                            Acknowledge
                          </Button>
                          <Button 
                            size="sm" 
                            className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                            onClick={() => onResolve && onResolve(alert.id)}
                          >
                            Resolve
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}