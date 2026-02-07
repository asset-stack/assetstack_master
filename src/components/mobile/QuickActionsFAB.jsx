import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Cpu, Wrench, Radio, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';

const ACTIONS = [
  { icon: Cpu, label: 'Add Equipment', page: 'Equipment', color: 'bg-blue-500' },
  { icon: Wrench, label: 'New Task', page: 'Maintenance', color: 'bg-amber-500' },
  { icon: Radio, label: 'Sensors', page: 'SensorIntegration', color: 'bg-emerald-500' },
  { icon: FileText, label: 'Reports', page: 'Reports', color: 'bg-violet-500' },
];

export default function QuickActionsFAB() {
  const [open, setOpen] = useState(false);

  return (
    <div className="lg:hidden fixed z-50" style={{ bottom: 'calc(70px + env(safe-area-inset-bottom, 0px))', right: '16px' }}>
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 z-40"
              onClick={() => setOpen(false)}
            />
            <div className="absolute bottom-16 right-0 z-50 space-y-2">
              {ACTIONS.map((action, idx) => {
                const Icon = action.icon;
                return (
                  <motion.div
                    key={action.label}
                    initial={{ opacity: 0, y: 20, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.8 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Link
                      to={createPageUrl(action.page)}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 justify-end"
                    >
                      <span className="bg-white shadow-lg rounded-lg px-3 py-1.5 text-sm font-medium text-slate-700 whitespace-nowrap">
                        {action.label}
                      </span>
                      <div className={`w-10 h-10 rounded-full ${action.color} flex items-center justify-center shadow-lg`}>
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </>
        )}
      </AnimatePresence>

      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => setOpen(!open)}
        className={`w-12 h-12 rounded-full flex items-center justify-center shadow-xl z-50 relative transition-colors ${
          open ? 'bg-slate-800' : 'bg-indigo-600'
        }`}
      >
        <motion.div animate={{ rotate: open ? 45 : 0 }} transition={{ duration: 0.2 }}>
          {open ? <X className="w-5 h-5 text-white" /> : <Plus className="w-5 h-5 text-white" />}
        </motion.div>
      </motion.button>
    </div>
  );
}