import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Lock, FileSearch, KeyRound, Database, ServerCog } from 'lucide-react';

const FEATURES = [
  { icon: Lock, title: 'TLS 1.3 + AES-256 at rest', text: 'Every byte encrypted in transit and on disk. No exceptions.' },
  { icon: FileSearch, title: 'Immutable audit trail', text: 'Every prediction, retrain, and ledger row signed and tamper-evident.' },
  { icon: Database, title: 'Per-tenant isolation', text: 'Your data is logically isolated and never used to train shared models.' },
  { icon: KeyRound, title: 'SSO + role-based access', text: 'SAML, OIDC, SCIM. Granular permissions down to the asset.' },
  { icon: ServerCog, title: 'On-prem option', text: 'Deploy AssetStack in your own VPC or private cloud for regulated estates.' },
  { icon: ShieldCheck, title: 'Continuous compliance', text: 'SOC 2 Type II, ISO 27001 alignment, GDPR-ready DPA on request.' },
];

export default function SecuritySection() {
  return (
    <section id="security" className="py-20 md:py-32 bg-slate-50/40 border-y border-slate-100">
      <div className="max-w-[1280px] mx-auto px-5 md:px-8">
        <div className="grid lg:grid-cols-[1fr_1.4fr] gap-12 lg:gap-16">
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">Security & trust</span>
            <h2 className="mt-3 text-4xl md:text-5xl font-semibold tracking-[-0.03em] leading-[1.05] text-slate-900 text-balance">
              Designed for the teams{' '}
              <span className="font-serif italic font-medium text-primary">procurement signs off.</span>
            </h2>
            <p className="mt-5 text-[15px] text-slate-600 leading-[1.6]">
              Every architectural decision optimises for one outcome: when your CISO, regulator, or insurer asks, you have a defensible answer in seconds.
            </p>
            <div className="mt-7 flex flex-wrap gap-2">
              {['SOC 2 Type II', 'ISO 27001', 'GDPR', 'HIPAA-ready'].map((b) => (
                <span key={b} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-200 text-[11px] font-semibold text-slate-700">
                  <ShieldCheck className="w-3 h-3 text-primary" /> {b}
                </span>
              ))}
            </div>
          </motion.div>

          <div className="grid sm:grid-cols-2 gap-3">
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="rounded-xl border border-slate-200 bg-white p-5 hover-lift hover:border-primary/25 elevation-1"
                >
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                    <Icon className="w-4 h-4 text-primary" />
                  </div>
                  <div className="text-[14px] font-semibold text-slate-900 tracking-tight">{f.title}</div>
                  <p className="mt-1.5 text-[13px] text-slate-600 leading-relaxed">{f.text}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}