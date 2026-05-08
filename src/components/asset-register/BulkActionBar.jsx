import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Wrench, Edit3, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function BulkActionBar({ count, onClear, onBulkEdit, onExport }) {
  return (
    <AnimatePresence>
      {count > 0 && (
        <motion.div
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 60, opacity: 0 }}
          transition={{ type: 'spring', damping: 24, stiffness: 280 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white rounded-2xl shadow-2xl border border-slate-800 px-3 py-2 flex items-center gap-2"
        >
          <button onClick={onClear} className="p-1 hover:bg-slate-800 rounded">
            <X className="w-4 h-4" />
          </button>
          <span className="text-[12px] font-semibold pr-2">{count} selected</span>
          <div className="w-px h-5 bg-slate-700" />
          <Button onClick={onBulkEdit} variant="ghost" size="sm" className="h-7 gap-1.5 text-white hover:bg-slate-800 hover:text-white text-[12px]">
            <Edit3 className="w-3.5 h-3.5" /> Bulk edit
          </Button>
          <Button onClick={() => window.location.href = '/Maintenance'} variant="ghost" size="sm" className="h-7 gap-1.5 text-white hover:bg-slate-800 hover:text-white text-[12px]">
            <Wrench className="w-3.5 h-3.5" /> Raise WO
          </Button>
          <Button onClick={onExport} variant="ghost" size="sm" className="h-7 gap-1.5 text-white hover:bg-slate-800 hover:text-white text-[12px]">
            <Download className="w-3.5 h-3.5" /> Export
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}