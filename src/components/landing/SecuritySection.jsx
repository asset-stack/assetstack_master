import React from 'react';
import { motion } from 'framer-motion';
import { Lock, KeyRound, Eye, Database, Shield, FileLock2 } from 'lucide-react';

const ITEMS = [
  { icon: Lock, title: 'HTTPS everywhere', desc: 'TLS 1.3 enforced on every request' },
  { icon: KeyRound, title: 'Verified identity', desc: 'Every action traced to a cryptographically verified session' },
  { icon: Eye, title: 'Immutable audit log', desc: 'IP, user-agent, role, and outcome on every privileged action' },
  { icon: Database, title: 'Test/Prod isolation', desc: 'A bug in test cannot touch production data — ever' },
  { icon: Shield, title: 'RBAC + service role', desc: 'Admin-only paths gate sensitive operations server-side' },
  { icon: FileLock2, title: 'Encrypted secrets', desc: 'API keys never reach the browser' },
];

export default function SecuritySection() {
  return (
    <section id="security" className="py-20 md:py-28 bg-slate-50/50">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-600">Security</span>
            <h2 className="mt-3 text-4xl md:text-5xl font-black tracking-tight text-slate-900">
              Built for procurement
              <br />
              not just product demos.
            </h2>
            <p className="mt-5 text-lg text-slate-600 leading-relaxed">
              We don't just say we're secure. We hand you the audit log, the data flow diagram,
              and the compliance pack — exportable as a single PDF, signed off by your CTO.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {['SOC 2 ready', 'ISO 27001 aligned', 'GDPR processor', 'Australian data residency'].map((b) => (
                <span key={b} className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
                  ✓ {b}
                </span>
              ))}
            </div>
          </motion.div>

          <div className="grid grid-cols-2 gap-3">
            {ITEMS.map((it, i) => {
              const Icon = it.icon;
              return (
                <motion.div
                  key={it.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06 }}
                  className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-lg hover:shadow-slate-900/5 transition-all"
                >
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-3">
                    <Icon className="w-5 h-5 text-emerald-600" />
                  </div>
                  <h4 className="font-bold text-sm text-slate-900">{it.title}</h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{it.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}