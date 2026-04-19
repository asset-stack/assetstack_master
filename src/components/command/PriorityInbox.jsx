import React from 'react';
import { motion } from 'framer-motion';
import { Inbox, Wrench, Eye, Replace, FileText, CalendarClock, Package, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const ACTION_ICONS = {
  inspect: Eye,
  repair: Wrench,
  replace: Replace,
  review: FileText,
  schedule: CalendarClock,
  order_parts: Package,
};

const URGENCY_STYLES = {
  critical: { dot: 'bg-rose-500', bg: 'bg-rose-50 border-rose-200', text: 'text-rose-700', label: 'Critical' },
  high: { dot: 'bg-amber-500', bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700', label: 'High' },
  medium: { dot: 'bg-blue-500', bg: 'bg-blue-50 border-blue-200', text: 'text-blue-700', label: 'Medium' },
};

export default function PriorityInbox({ actions = [], loading }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm">
      <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center">
            <Inbox className="w-4 h-4 text-indigo-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 text-[15px]">Priority Inbox</h3>
            <p className="text-[11px] text-slate-500">What needs your attention today</p>
          </div>
        </div>
        {actions.length > 0 && (
          <span className="text-[11px] font-semibold px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-full">
            {actions.length} items
          </span>
        )}
      </div>

      <div className="p-2 sm:p-3 max-h-[440px] overflow-y-auto scrollbar-thin">
        {loading && actions.length === 0 ? (
          <div className="p-6 text-center">
            <div className="inline-flex items-center gap-2 text-sm text-slate-400">
              <div className="w-4 h-4 border-2 border-slate-200 border-t-indigo-500 rounded-full animate-spin" />
              Analyzing priorities...
            </div>
          </div>
        ) : actions.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-50 flex items-center justify-center mb-3">
              <Inbox className="w-6 h-6 text-emerald-500" />
            </div>
            <p className="text-sm font-semibold text-slate-700">Inbox Zero</p>
            <p className="text-xs text-slate-500 mt-0.5">Nothing urgent right now</p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {actions.map((action, idx) => {
              const urgency = URGENCY_STYLES[action.urgency] || URGENCY_STYLES.medium;
              const ActionIcon = ACTION_ICONS[action.action_type] || Wrench;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Link
                    to="/Maintenance"
                    className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group"
                  >
                    <div className={`relative w-9 h-9 rounded-lg border ${urgency.bg} flex items-center justify-center shrink-0`}>
                      <ActionIcon className={`w-4 h-4 ${urgency.text}`} />
                      <span className={`absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full ${urgency.dot} ring-2 ring-white`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-sm font-semibold text-slate-900 truncate">{action.title}</p>
                      </div>
                      <p className="text-[12px] text-slate-600 line-clamp-2 leading-relaxed">{action.reason}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className={`text-[10px] font-semibold uppercase tracking-wider ${urgency.text}`}>
                          {urgency.label}
                        </span>
                        {action.asset_name && (
                          <>
                            <span className="text-slate-300 text-[10px]">•</span>
                            <span className="text-[11px] text-slate-500 truncate">{action.asset_name}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all shrink-0 mt-2" />
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}