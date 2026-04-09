import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, AlertCircle, Info, Zap, Clock, CheckCircle2, Bell } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from 'date-fns';
import SwipeableCard from '@/components/mobile/SwipeableCard';

export default function AlertsPanel({ alerts = [], onAcknowledge, onResolve }) {
  const getSeverityConfig = (severity) => {
    switch (severity) {
      case 'emergency':
        return { icon: Zap, bg: 'bg-rose-50', iconColor: 'text-rose-500', pulse: true };
      case 'critical':
        return { icon: AlertTriangle, bg: 'bg-orange-50', iconColor: 'text-orange-500', pulse: true };
      case 'warning':
        return { icon: AlertCircle, bg: 'bg-amber-50', iconColor: 'text-amber-500', pulse: false };
      default:
        return { icon: Info, bg: 'bg-blue-50', iconColor: 'text-blue-500', pulse: false };
    }
  };

  const activeAlerts = alerts.filter(a => a.status === 'active');

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden h-full flex flex-col">
      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-rose-50 rounded-lg">
            <Bell className="w-4 h-4 text-rose-600" />
          </div>
          <h3 className="text-sm font-semibold text-slate-900">Alerts</h3>
          {activeAlerts.length > 0 && (
            <span className="px-2 py-0.5 bg-rose-100 text-rose-600 text-[11px] font-semibold rounded-full">
              {activeAlerts.length}
            </span>
          )}
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto max-h-[300px]">
        <AnimatePresence>
          {alerts.length === 0 ? (
            <div className="p-8 text-center">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
              <p className="text-sm text-slate-500 font-medium">All systems operational</p>
              <p className="text-xs text-slate-400 mt-0.5">No alerts at this time</p>
            </div>
          ) : (
            alerts.slice(0, 6).map((alert, idx) => {
              const config = getSeverityConfig(alert.severity);
              const Icon = config.icon;
              
              return (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ delay: idx * 0.03 }}
                >
                <SwipeableCard
                  onSwipeRight={alert.status === 'active' ? () => onAcknowledge?.(alert.id) : undefined}
                  onSwipeLeft={alert.status === 'active' ? () => onResolve?.(alert.id) : undefined}
                  rightLabel="Acknowledge"
                  leftLabel="Resolve"
                  rightColor="bg-amber-500"
                  leftColor="bg-emerald-500"
                  disabled={alert.status !== 'active'}
                >
                <div className={`p-3.5 border-b border-slate-100 ${config.bg} hover:brightness-[0.98] transition-all`}>
                  <div className="flex gap-3">
                    <div className={`relative ${config.iconColor} mt-0.5 shrink-0`}>
                      <Icon className="w-4 h-4" />
                      {config.pulse && alert.status === 'active' && (
                        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-rose-500 rounded-full animate-ping" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs font-semibold text-slate-900 line-clamp-1">{alert.title}</h4>
                        <span className="text-[11px] text-slate-400 whitespace-nowrap flex items-center gap-0.5 shrink-0">
                          <Clock className="w-3 h-3" />
                          {formatDistanceToNow(new Date(alert.created_date), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{alert.message}</p>
                      {alert.status === 'active' && (
                        <div className="flex gap-2 mt-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="h-7 text-[11px] px-2.5 bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                            onClick={() => onAcknowledge && onAcknowledge(alert.id)}
                          >
                            Acknowledge
                          </Button>
                          <Button 
                            size="sm" 
                            className="h-7 text-[11px] px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white"
                            onClick={() => onResolve && onResolve(alert.id)}
                          >
                            Resolve
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                </SwipeableCard>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}