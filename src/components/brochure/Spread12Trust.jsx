import React from 'react';
import { Shield, Lock, FileText, UserCheck, Database, Eye } from 'lucide-react';
import BrochureShell from './BrochureShell';

const PILLARS = [
  { i: Shield, k: 'ISO 27001 aligned', v: 'Controls mapped, evidence collected' },
  { i: Lock, k: 'Encryption everywhere', v: 'AES-256 at rest · TLS 1.3 in transit' },
  { i: UserCheck, k: 'SSO & role-based access', v: 'SAML, OIDC, granular permissions' },
  { i: FileText, k: 'Full audit log', v: 'Every action, every actor, every time' },
  { i: Database, k: 'Data residency', v: 'Choose your region · your data stays put' },
  { i: Eye, k: 'Explainable AI', v: 'Every prediction shows its working' },
];

export default function Spread12Trust() {
  return (
    <BrochureShell pageNumber={12} section="Trust" title="Built for procurement & audit.">
      <p className="text-[13px] leading-relaxed opacity-75 max-w-[150mm] mb-8">
        Public-sector and regulated buyers run AssetStack through procurement, legal and security
        reviews. Here&apos;s what we hand them on day one.
      </p>

      <div className="grid grid-cols-3 gap-4 mb-8">
        {PILLARS.map((p) => {
          const Icon = p.i;
          return (
            <div key={p.k} className="border border-current/15 rounded-lg p-5">
              <div className="w-9 h-9 rounded-md bg-indigo-50 grid place-items-center mb-3">
                <Icon className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="text-[13px] font-bold mb-1">{p.k}</div>
              <div className="text-[11px] opacity-70 leading-snug">{p.v}</div>
            </div>
          );
        })}
      </div>

      {/* Audit log preview */}
      <div className="border border-current/15 rounded-lg overflow-hidden">
        <div className="px-4 py-2.5 border-b border-current/15 bg-current/5 flex items-center justify-between">
          <div className="text-[11px] font-bold">Audit log · last 6 events</div>
          <div className="text-[9px] uppercase tracking-widest opacity-60">Tamper-evident</div>
        </div>
        <div className="divide-y divide-current/10 text-[10px]">
          {[
            ['09:42:17', 'a.tan@bunbury.wa.gov.au', 'savings.verify', 'SV-217', 'success'],
            ['09:38:04', 'system', 'ml.predict', 'CWP-3', 'success'],
            ['09:31:55', 'm.chen@bunbury.wa.gov.au', 'capital.approve', 'CP-2026-Q3', 'success'],
            ['09:22:11', 'inspector@field.au', 'condition.update', 'AHU-301', 'success'],
            ['09:14:09', 'a.tan@bunbury.wa.gov.au', 'user.role_change', 'j.lee → manager', 'success'],
            ['09:08:32', 'system', 'scan.analyze', 'BTH-W3-2026Q2', 'success'],
          ].map((row, i) => (
            <div key={i} className="grid grid-cols-12 gap-3 px-4 py-2 items-center">
              <span className="col-span-2 font-mono opacity-60">{row[0]}</span>
              <span className="col-span-4 truncate">{row[1]}</span>
              <span className="col-span-2 font-mono text-indigo-600 font-bold">{row[2]}</span>
              <span className="col-span-3 truncate opacity-80">{row[3]}</span>
              <span className="col-span-1 text-right">
                <span className="inline-block px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold text-[9px]">
                  ok
                </span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </BrochureShell>
  );
}