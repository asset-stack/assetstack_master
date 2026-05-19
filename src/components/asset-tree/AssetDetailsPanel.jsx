import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Cpu, MapPin, Activity, AlertTriangle, Calendar, Gauge, Wrench, DoorOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';

const statusStyles = {
  operational: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  degraded: 'bg-amber-50 text-amber-700 border-amber-200',
  critical: 'bg-rose-50 text-rose-700 border-rose-200',
  maintenance: 'bg-blue-50 text-blue-700 border-blue-200',
  offline: 'bg-slate-50 text-slate-600 border-slate-200',
};

export default function AssetDetailsPanel({ asset, onClose }) {
  return (
    <AnimatePresence>
      {asset && (
        <motion.div
          initial={{ x: 420, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 420, opacity: 0 }}
          transition={{ type: 'spring', damping: 26, stiffness: 220 }}
          className="fixed right-4 top-20 bottom-4 w-[380px] bg-white rounded-2xl border border-slate-200 shadow-2xl z-40 overflow-hidden flex flex-col"
        >
          <div className="p-5 border-b border-slate-100 bg-gradient-to-br from-indigo-50 via-white to-violet-50">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-md">
                  <Cpu className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base leading-tight">{asset.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5 capitalize">
                    {asset.type?.replace(/_/g, ' ')}
                  </p>
                </div>
              </div>
              <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex gap-2 mt-3">
              <Badge variant="outline" className={statusStyles[asset.status] || statusStyles.offline}>
                {asset.status || 'unknown'}
              </Badge>
              {asset.risk_level && (
                <Badge variant="outline" className={asset.risk_level === 'critical' || asset.risk_level === 'high' ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-slate-50 text-slate-600'}>
                  <AlertTriangle className="w-3 h-3 mr-1" /> {asset.risk_level} risk
                </Badge>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {/* Health gauge */}
            <div className="bg-gradient-to-br from-slate-50 to-white rounded-xl p-4 border border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Health Score</span>
                <Gauge className="w-4 h-4 text-indigo-500" />
              </div>
              <div className="flex items-end gap-1">
                <span className="text-3xl font-bold text-slate-900">{asset.health_score ?? 0}</span>
                <span className="text-sm text-slate-500 mb-1">/100</span>
              </div>
              <div className="mt-2 w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${asset.health_score ?? 0}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  className={`h-full rounded-full ${
                    (asset.health_score ?? 0) >= 80 ? 'bg-emerald-500' :
                    (asset.health_score ?? 0) >= 60 ? 'bg-amber-500' : 'bg-rose-500'
                  }`}
                />
              </div>
            </div>

            {/* Quick facts */}
            <div className="grid grid-cols-2 gap-3">
              <InfoCard icon={MapPin} label="Location" value={asset.location || '—'} />
              <InfoCard icon={DoorOpen} label="Room" value={asset.room || '—'} />
              <InfoCard icon={Activity} label="Operating Hrs" value={asset.operating_hours?.toLocaleString() || '0'} />
              <InfoCard icon={AlertTriangle} label="Failure Prob." value={asset.failure_probability ? `${asset.failure_probability}%` : '—'} />
              <InfoCard icon={Calendar} label="Last Maint." value={asset.last_maintenance_date || '—'} />
            </div>

            {asset.manufacturer && (
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Specs</p>
                <div className="space-y-1.5 text-sm">
                  <Row label="Manufacturer" value={asset.manufacturer} />
                  <Row label="Model" value={asset.model} />
                  <Row label="Serial" value={asset.serial_number} />
                  {asset.rated_capacity && (
                    <Row label="Capacity" value={`${asset.rated_capacity} ${asset.capacity_unit || ''}`} />
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-slate-100 bg-slate-50">
            <Link to="/Equipment">
              <Button className="w-full bg-indigo-600 hover:bg-indigo-700 gap-2">
                <Wrench className="w-4 h-4" /> Manage Equipment
              </Button>
            </Link>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function InfoCard({ icon: Icon, label, value }) {
  return (
    <div className="bg-white rounded-lg p-3 border border-slate-100">
      <div className="flex items-center gap-1.5 text-slate-400 mb-1">
        <Icon className="w-3 h-3" />
        <span className="text-[10px] font-semibold uppercase tracking-wide">{label}</span>
      </div>
      <p className="text-sm font-semibold text-slate-900 truncate">{value}</p>
    </div>
  );
}

function Row({ label, value }) {
  if (!value) return null;
  return (
    <div className="flex justify-between">
      <span className="text-slate-500">{label}</span>
      <span className="text-slate-900 font-medium">{value}</span>
    </div>
  );
}