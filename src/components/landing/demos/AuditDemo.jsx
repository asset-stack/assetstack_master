import React from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, Bot, Database, DollarSign, Cog, Shield } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const LOGS = [
  { time: '2026-05-06 09:42:15', actor: 'sarah.chen@lgacouncil.gov.au', role: 'admin', action: 'data.import', cat: 'admin', sev: 'critical', summary: 'LGA Council Excel import: 247 equipment, 1,403 reports created', icon: Database, color: 'text-purple-600 bg-purple-50' },
  { time: '2026-05-06 09:38:02', actor: 'tom.davies@lgacouncil.gov.au', role: 'user', action: 'scan.analyze', cat: 'ai', sev: 'notice', summary: 'AI scan analysis produced 3 finding(s)', icon: Bot, color: 'text-pink-600 bg-pink-50' },
  { time: '2026-05-06 09:31:48', actor: 'admin@assetstack.io', role: 'admin', action: 'ml.retrain', cat: 'ai', sev: 'warning', summary: 'Retrained model v2.3 → v2.4 (+1.8% accuracy)', icon: Bot, color: 'text-pink-600 bg-pink-50' },
  { time: '2026-05-06 09:24:11', actor: 'maria.lopez@lgacouncil.gov.au', role: 'user', action: 'savings.verify', cat: 'financial', sev: 'notice', summary: 'Verified $24,800 savings on Pump #3 intervention', icon: DollarSign, color: 'text-emerald-600 bg-emerald-50' },
  { time: '2026-05-06 09:18:33', actor: 'unknown@external.co', role: 'user', action: 'data.import', cat: 'security', sev: 'warning', summary: 'Non-admin attempted to run LGA Council Excel import', icon: ShieldAlert, color: 'text-red-600 bg-red-50', denied: true },
  { time: '2026-05-06 09:12:09', actor: 'system', role: 'system', action: 'system.healthcheck', cat: 'system', sev: 'info', summary: 'Daily health check completed', icon: Cog, color: 'text-slate-600 bg-slate-50' },
];

const SEV = {
  info: 'bg-slate-100 text-slate-600',
  notice: 'bg-blue-100 text-blue-700',
  warning: 'bg-amber-100 text-amber-700',
  critical: 'bg-red-100 text-red-700',
};

export default function AuditDemo() {
  return (
    <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl shadow-slate-900/40">
      <div className="px-5 py-3 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-400" />
          <span className="font-mono text-xs text-slate-300">audit_log.live</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider">streaming</span>
        </div>
      </div>

      <div className="divide-y divide-slate-800/60">
        {LOGS.map((log, i) => {
          const Icon = log.icon;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="px-5 py-3 flex items-center gap-3 hover:bg-slate-900/40 transition-colors group"
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${log.color}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs font-semibold text-white">{log.action}</span>
                  <Badge className={`${SEV[log.sev]} border-0 text-[9px]`}>{log.sev}</Badge>
                  {log.denied && <Badge className="bg-red-500/20 text-red-300 border-0 text-[9px]">DENIED</Badge>}
                </div>
                <div className="text-xs text-slate-400 mt-0.5 truncate">{log.summary}</div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-[11px] font-medium text-slate-300">{log.actor}</div>
                <div className="text-[10px] text-slate-500 font-mono">{log.time}</div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="px-5 py-3 border-t border-slate-800 bg-slate-900/50">
        <p className="text-[11px] text-slate-500 font-mono">
          → Every action verified server-side · Immutable · Exportable as CSV for compliance
        </p>
      </div>
    </div>
  );
}