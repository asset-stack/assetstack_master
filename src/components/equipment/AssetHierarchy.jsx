import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronRight, ChevronDown, MapPin, Building2, Cpu, 
  Activity, AlertTriangle, Layers, FolderOpen, Folder
} from 'lucide-react';
import { Badge } from "@/components/ui/badge";

export default function AssetHierarchy({ equipment, groupBy, onSelectEquipment, selectedId }) {
  const [expandedGroups, setExpandedGroups] = useState(new Set());

  const groupedData = useMemo(() => {
    const groups = {};
    
    equipment.forEach(eq => {
      let groupKey;
      switch (groupBy) {
        case 'location':
          groupKey = eq.location || 'Unassigned';
          break;
        case 'type':
          groupKey = eq.type?.replace(/_/g, ' ') || 'Unknown';
          break;
        case 'status':
          groupKey = eq.status || 'Unknown';
          break;
        case 'criticality':
          groupKey = eq.criticality?.replace(/_/g, ' ') || 'Medium';
          break;
        default:
          groupKey = 'All Equipment';
      }
      
      if (!groups[groupKey]) {
        groups[groupKey] = {
          items: [],
          stats: { operational: 0, degraded: 0, critical: 0, total: 0 }
        };
      }
      groups[groupKey].items.push(eq);
      groups[groupKey].stats.total++;
      if (eq.status === 'operational') groups[groupKey].stats.operational++;
      if (eq.status === 'degraded') groups[groupKey].stats.degraded++;
      if (eq.status === 'critical' || eq.risk_level === 'critical') groups[groupKey].stats.critical++;
    });

    // Sort groups alphabetically
    return Object.entries(groups)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([name, data]) => ({ name, ...data }));
  }, [equipment, groupBy]);

  const toggleGroup = (groupName) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(groupName)) {
        next.delete(groupName);
      } else {
        next.add(groupName);
      }
      return next;
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      operational: 'bg-emerald-500',
      degraded: 'bg-amber-500',
      critical: 'bg-rose-500',
      maintenance: 'bg-blue-500',
      offline: 'bg-slate-400'
    };
    return colors[status] || colors.offline;
  };

  const getHealthColor = (score) => {
    if (score >= 80) return 'text-emerald-600';
    if (score >= 60) return 'text-amber-600';
    return 'text-rose-600';
  };

  const getGroupIcon = () => {
    switch (groupBy) {
      case 'location': return MapPin;
      case 'type': return Cpu;
      case 'status': return Activity;
      case 'criticality': return AlertTriangle;
      default: return Layers;
    }
  };

  const GroupIcon = getGroupIcon();

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="p-4 border-b border-slate-100 bg-slate-50">
        <h3 className="font-semibold text-slate-900 flex items-center gap-2">
          <Layers className="w-4 h-4 text-indigo-600" />
          Asset Hierarchy
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          {groupedData.length} groups • {equipment.length} total assets
        </p>
      </div>

      <div className="max-h-[600px] overflow-y-auto">
        {groupedData.map((group) => {
          const isExpanded = expandedGroups.has(group.name);
          
          return (
            <div key={group.name} className="border-b border-slate-100 last:border-b-0">
              <button
                onClick={() => toggleGroup(group.name)}
                className="w-full px-4 py-3 flex items-center gap-3 hover:bg-slate-50 transition-colors text-left"
              >
                <motion.div
                  animate={{ rotate: isExpanded ? 90 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </motion.div>
                
                <div className="p-1.5 bg-indigo-100 rounded-lg">
                  <GroupIcon className="w-4 h-4 text-indigo-600" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900 capitalize truncate">{group.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-slate-500">{group.stats.total} assets</span>
                    {group.stats.critical > 0 && (
                      <Badge className="bg-rose-100 text-rose-700 text-xs py-0 px-1.5">
                        {group.stats.critical} critical
                      </Badge>
                    )}
                    {group.stats.degraded > 0 && (
                      <Badge className="bg-amber-100 text-amber-700 text-xs py-0 px-1.5">
                        {group.stats.degraded} degraded
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" title={`${group.stats.operational} operational`} />
                  {group.stats.degraded > 0 && <div className="w-2 h-2 rounded-full bg-amber-500" />}
                  {group.stats.critical > 0 && <div className="w-2 h-2 rounded-full bg-rose-500" />}
                </div>
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="bg-slate-50/50 border-t border-slate-100">
                      {group.items.map((eq) => (
                        <button
                          key={eq.id}
                          onClick={() => onSelectEquipment(eq)}
                          className={`w-full px-4 py-2.5 pl-12 flex items-center gap-3 hover:bg-indigo-50 transition-colors text-left ${
                            selectedId === eq.id ? 'bg-indigo-50 border-l-2 border-indigo-500' : ''
                          }`}
                        >
                          <span className={`w-2 h-2 rounded-full ${getStatusColor(eq.status)}`} />
                          
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-800 truncate">{eq.name}</p>
                            <p className="text-xs text-slate-500 truncate">
                              {eq.type?.replace(/_/g, ' ')} • {eq.manufacturer || 'N/A'}
                            </p>
                          </div>

                          <div className="text-right">
                            <p className={`text-sm font-medium ${getHealthColor(eq.health_score || 0)}`}>
                              {eq.health_score || 0}%
                            </p>
                            <p className="text-xs text-slate-400">health</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}