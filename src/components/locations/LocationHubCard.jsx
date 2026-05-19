import React from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Building2, MapPin, Cpu, Box, AlertTriangle, CheckCircle2, ChevronRight, Edit2, Trash2, Upload } from 'lucide-react';

const TYPE_ICONS = {
  building: Building2, facility: Building2, depot: Building2, station: Building2,
  park: MapPin, road: MapPin, bridge: MapPin, other: MapPin,
};

export default function LocationHubCard({ location, stats, onEdit, onDelete, onImportAssets, index = 0 }) {
  const Icon = TYPE_ICONS[location.location_type] || MapPin;
  const { totalAssets, fixedAssets, unfixedAssets, scanCount, openAnomalies, avgHealth, criticalCount } = stats;

  const healthColor = avgHealth == null ? 'text-slate-400'
    : avgHealth >= 75 ? 'text-emerald-600'
    : avgHealth >= 55 ? 'text-amber-600' : 'text-rose-600';

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.03 }}>
      <Link
        to={`/LocationDetail?id=${location.id}`}
        className="block bg-white rounded-xl border border-slate-200 hover:shadow-md hover:border-indigo-300 transition-all group overflow-hidden"
      >
        {/* Header */}
        <div className="p-5 pb-4">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-start gap-3 min-w-0">
              <div className="p-2.5 bg-indigo-50 rounded-lg shrink-0">
                <Icon className="w-5 h-5 text-indigo-600" />
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-slate-900 truncate">{location.name}</h3>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  {location.code && <span className="text-xs text-slate-400">{location.code}</span>}
                  {location.client_name && <Badge variant="secondary" className="text-[10px] py-0">{location.client_name}</Badge>}
                </div>
              </div>
            </div>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onImportAssets?.(location); }}
                className="p-1.5 hover:bg-indigo-50 rounded-lg text-slate-400 hover:text-indigo-600"
                title="Import assets"
              >
                <Upload className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onEdit?.(location); }}
                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete?.(location); }}
                className="p-1.5 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-500"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Quick import CTA when empty */}
          {totalAssets === 0 && onImportAssets && (
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onImportAssets(location); }}
              className="w-full mb-3 py-2 px-3 bg-indigo-50 hover:bg-indigo-100 border border-dashed border-indigo-300 rounded-lg flex items-center justify-center gap-1.5 text-xs font-medium text-indigo-700 transition-colors"
            >
              <Upload className="w-3.5 h-3.5" /> Drop spreadsheet to import assets
            </button>
          )}

          {/* Big stats */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            <div className="bg-slate-50 rounded-lg p-2.5">
              <div className="flex items-center gap-1 text-[10px] uppercase tracking-wide font-semibold text-slate-500">
                <Cpu className="w-3 h-3" /> Assets
              </div>
              <div className="text-xl font-semibold text-slate-900 mt-0.5 tabular-nums">{totalAssets}</div>
            </div>
            <div className="bg-emerald-50/60 rounded-lg p-2.5">
              <div className="flex items-center gap-1 text-[10px] uppercase tracking-wide font-semibold text-emerald-700">
                <CheckCircle2 className="w-3 h-3" /> Fixed
              </div>
              <div className="text-xl font-semibold text-emerald-700 mt-0.5 tabular-nums">{fixedAssets}</div>
            </div>
            <div className="bg-rose-50/60 rounded-lg p-2.5">
              <div className="flex items-center gap-1 text-[10px] uppercase tracking-wide font-semibold text-rose-700">
                <AlertTriangle className="w-3 h-3" /> Unfixed
              </div>
              <div className="text-xl font-semibold text-rose-700 mt-0.5 tabular-nums">{unfixedAssets}</div>
            </div>
          </div>
        </div>

        {/* Footer row */}
        <div className="px-5 py-3 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between text-xs">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1 text-slate-600">
              <Box className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-medium">{scanCount}</span>
              <span className="text-slate-400">scans</span>
            </div>
            {openAnomalies > 0 && (
              <div className="flex items-center gap-1 text-amber-700">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span className="font-medium">{openAnomalies}</span>
                <span className="text-amber-600/80">open</span>
              </div>
            )}
            {avgHealth != null && (
              <div className={`font-semibold ${healthColor}`}>
                {avgHealth}% <span className="text-slate-400 font-normal">health</span>
              </div>
            )}
            {criticalCount > 0 && (
              <Badge className="bg-rose-100 text-rose-700 border-rose-200 text-[10px] py-0">{criticalCount} critical</Badge>
            )}
          </div>
          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 transition-colors" />
        </div>
      </Link>
    </motion.div>
  );
}