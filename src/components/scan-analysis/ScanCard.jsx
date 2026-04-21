import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Box, AlertTriangle, Clock, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ScanCard({ scan, selected, onClick }) {
  return (
    <motion.button
      whileHover={{ y: -2 }}
      onClick={onClick}
      className={`text-left w-full bg-white rounded-xl border-2 overflow-hidden shadow-sm transition-all ${
        selected ? 'border-indigo-500 ring-2 ring-indigo-200' : 'border-slate-200 hover:border-slate-300'
      }`}
    >
      <div className="aspect-video bg-gradient-to-br from-slate-800 to-slate-900 relative overflow-hidden">
        {scan.preview_image_url ? (
          <img src={scan.preview_image_url} alt={scan.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Box className="w-12 h-12 text-white/20" />
          </div>
        )}
        <Badge className="absolute top-2 left-2 bg-black/60 text-white border-0 text-[10px]">
          {scan.model_type?.toUpperCase() || 'DEMO'}
        </Badge>
        {scan.pending_review_count > 0 && (
          <Badge className="absolute top-2 right-2 bg-amber-500 text-white border-0 text-[10px]">
            {scan.pending_review_count} to review
          </Badge>
        )}
      </div>
      <div className="p-3">
        <h4 className="font-semibold text-sm text-slate-900 truncate">{scan.name}</h4>
        <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-500">
          <span className="flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> {scan.total_anomalies || 0}</span>
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {scan.scan_date || '—'}</span>
          {scan.file_size_mb > 0 && <span>{scan.file_size_mb}MB</span>}
        </div>
      </div>
    </motion.button>
  );
}