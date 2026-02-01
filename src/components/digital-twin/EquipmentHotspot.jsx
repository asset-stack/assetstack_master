import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, Thermometer, Gauge, Wrench, History, 
  Plus, X, ChevronRight, AlertTriangle, CheckCircle2,
  Clock, TrendingUp, TrendingDown
} from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const statusColors = {
  operational: 'bg-green-500',
  degraded: 'bg-amber-500',
  critical: 'bg-red-500',
  offline: 'bg-slate-400',
  maintenance: 'bg-blue-500'
};

const statusBg = {
  operational: 'bg-green-100 text-green-700',
  degraded: 'bg-amber-100 text-amber-700',
  critical: 'bg-red-100 text-red-700',
  offline: 'bg-slate-100 text-slate-700',
  maintenance: 'bg-blue-100 text-blue-700'
};

export default function EquipmentHotspot({ 
  equipment, 
  sensorReadings = [], 
  recentTasks = [],
  position = { x: 50, y: 50 },
  onCreateWorkOrder,
  isSelected,
  onSelect
}) {
  const [showDetails, setShowDetails] = useState(false);

  const latestReadings = sensorReadings.slice(0, 3);
  const pendingTasks = recentTasks.filter(t => t.status !== 'completed').slice(0, 3);

  const handleClick = (e) => {
    e.stopPropagation();
    onSelect(equipment.id);
    setShowDetails(true);
  };

  return (
    <div
      className="absolute"
      style={{ 
        left: `${position.x}%`, 
        top: `${position.y}%`, 
        transform: 'translate(-50%, -50%)',
        zIndex: isSelected ? 50 : 10
      }}
    >
      {/* Hotspot Marker */}
      <motion.button
        onClick={handleClick}
        whileHover={{ scale: 1.2 }}
        whileTap={{ scale: 0.95 }}
        className={`relative cursor-pointer group`}
      >
        {/* Pulse ring for critical/degraded */}
        {(equipment.status === 'critical' || equipment.status === 'degraded') && (
          <div className={`absolute inset-0 rounded-full ${statusColors[equipment.status]} opacity-40 animate-ping`} />
        )}
        
        {/* Main dot */}
        <div className={`w-5 h-5 rounded-full ${statusColors[equipment.status] || 'bg-slate-400'} 
          border-2 border-white shadow-lg transition-all
          ${isSelected ? 'ring-4 ring-indigo-400 ring-opacity-50' : ''}
        `}>
          {equipment.status === 'critical' && (
            <AlertTriangle className="w-3 h-3 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          )}
        </div>

        {/* Hover label */}
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 
          transition-opacity whitespace-nowrap bg-slate-900 text-white text-xs px-2 py-1 rounded-md pointer-events-none">
          {equipment.name}
        </div>
      </motion.button>

      {/* Details Popup */}
      <AnimatePresence>
        {showDetails && isSelected && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute top-8 left-1/2 -translate-x-1/2 w-80 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-4 border-b border-slate-100 bg-slate-50">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-semibold text-slate-900">{equipment.name}</h4>
                  <p className="text-xs text-slate-500 capitalize">{equipment.type?.replace(/_/g, ' ')}</p>
                </div>
                <button 
                  onClick={() => setShowDetails(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Badge className={statusBg[equipment.status]}>
                  {equipment.status}
                </Badge>
                {equipment.health_score && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Activity className="w-3 h-3" />
                    {equipment.health_score}% Health
                  </Badge>
                )}
              </div>
            </div>

            {/* Sensor Readings */}
            {latestReadings.length > 0 && (
              <div className="p-4 border-b border-slate-100">
                <h5 className="text-xs font-medium text-slate-500 uppercase mb-2">Live Sensors</h5>
                <div className="space-y-2">
                  {latestReadings.map((reading, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        {reading.sensor_type === 'temperature' ? (
                          <Thermometer className="w-4 h-4 text-orange-500" />
                        ) : reading.sensor_type === 'pressure' ? (
                          <Gauge className="w-4 h-4 text-blue-500" />
                        ) : (
                          <Activity className="w-4 h-4 text-indigo-500" />
                        )}
                        <span className="text-slate-600 capitalize">
                          {reading.sensor_type?.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className={`font-medium ${reading.is_anomaly ? 'text-red-600' : 'text-slate-900'}`}>
                          {reading.value?.toFixed(1)} {reading.unit}
                        </span>
                        {reading.is_anomaly && (
                          <AlertTriangle className="w-3 h-3 text-red-500" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Health Metrics */}
            <div className="p-4 border-b border-slate-100">
              <h5 className="text-xs font-medium text-slate-500 uppercase mb-2">Health Metrics</h5>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 rounded-lg p-2 text-center">
                  <p className="text-lg font-bold text-slate-900">
                    {equipment.remaining_useful_life_days || '—'}
                  </p>
                  <p className="text-xs text-slate-500">Days RUL</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-2 text-center">
                  <p className="text-lg font-bold text-slate-900">
                    {equipment.failure_probability || 0}%
                  </p>
                  <p className="text-xs text-slate-500">Failure Risk</p>
                </div>
              </div>
            </div>

            {/* Recent Tasks */}
            {pendingTasks.length > 0 && (
              <div className="p-4 border-b border-slate-100">
                <h5 className="text-xs font-medium text-slate-500 uppercase mb-2">Pending Tasks</h5>
                <div className="space-y-2">
                  {pendingTasks.map((task, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span className="text-slate-600 truncate max-w-[160px]">{task.title}</span>
                      </div>
                      <Badge variant="outline" className="text-xs capitalize">
                        {task.priority}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="p-4 bg-slate-50 flex gap-2">
              <Link 
                to={createPageUrl(`Equipment?id=${equipment.id}`)}
                className="flex-1"
              >
                <Button variant="outline" size="sm" className="w-full">
                  <History className="w-4 h-4 mr-1" />
                  History
                </Button>
              </Link>
              <Button 
                size="sm" 
                className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                onClick={() => onCreateWorkOrder(equipment)}
              >
                <Plus className="w-4 h-4 mr-1" />
                Work Order
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}