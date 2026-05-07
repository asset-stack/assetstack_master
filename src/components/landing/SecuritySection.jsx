import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Lock, FileSearch, KeyRound, Database, ServerCog } from 'lucide-react';

const FEATURES = [
{ icon: Lock, title: 'Encryption in transit & at rest', text: 'Customer data is encrypted on the wire and on disk via the underlying cloud platform.' },
{ icon: FileSearch, title: 'Detailed audit trail', text: 'Every prediction, retrain, and savings entry is logged with the actor, timestamp and outcome.' },
{ icon: Database, title: 'Per-tenant data isolation', text: 'Your records are logically scoped to your workspace and never used to train shared models.' },
{ icon: KeyRound, title: 'Role-based access control', text: 'Granular permissions per role — from technicians to admins — configurable in-product.' },
{ icon: ServerCog, title: 'Deployment options', text: 'Run on our managed cloud today; private-cloud and self-hosted deployment available on Enterprise.' },
{ icon: ShieldCheck, title: 'Compliance-ready posture', text: 'Architecture and processes designed to support SOC 2 and ISO 27001 evidence requests.' }];


export default function SecuritySection() {
  return (
    <section id="security" className="py-20 md:py-32 bg-slate-50/40 border-y border-slate-100">
      <div className="max-w-[1280px] mx-auto px-5 md:px-8">
        <div className="grid lg:grid-cols-[1fr_1.4fr] gap-12 lg:gap-16">
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}>
            
            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">Security & trust</span>
            <h2 className="mt-3 text-4xl md:text-5xl font-semibold tracking-[-0.03em] leading-[1.05] text-slate-900 text-balance">
              Designed for the teams{' '}
              <span className="font-serif italic font-medium text-primary">procurement signs off.</span>
            </h2>
            <p className="mt-5 text-[15px] text-slate-600 leading-[1.6]">
              Every architectural decision optimises for one outcome: when your CISO, regulator, or insurer asks, you have a defensible answer in seconds.
            </p>
            <div className="mt-7 flex flex-wrap gap-2">
              {['SOC 2 — in progress', 'ISO 27001 — aligned', 'GDPR-ready DPA', 'Australian data residency'].map((b) =>
              <span key={b} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-200 text-[11px] font-semibold text-slate-700 hidden">
                  <ShieldCheck className="w-3 h-3 text-primary" /> {b}
                </span>
              )}
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
                  className="rounded-xl border border-slate-200 bg-white p-5 hover-lift hover:border-primary/25 elevation-1">
                  
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                    <Icon className="w-4 h-4 text-primary" />
                  </div>
                  <div className="text-[14px] font-semibold text-slate-900 tracking-tight">{f.title}</div>
                  <p className="mt-1.5 text-[13px] text-slate-600 leading-relaxed">{f.text}</p>
                </motion.div>);

            })}
          </div>
        </div>
      </div>
    </section>);

}