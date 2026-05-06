import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  KeyRound, Database, Cloud, Server, Eye, Bot,
  ShieldCheck, FileLock2, Users, AlertTriangle
} from 'lucide-react';

const sections = [
  {
    icon: KeyRound, title: 'Authentication',
    color: 'text-indigo-600', bg: 'bg-indigo-50',
    status: 'active',
    items: [
      'Email + Google SSO via Base44',
      'Token-based sessions (no passwords stored)',
      'Every backend function verifies identity via createClientFromRequest',
      'Auth errors → automatic redirect to login',
    ],
  },
  {
    icon: Users, title: 'Authorization (RBAC)',
    color: 'text-purple-600', bg: 'bg-purple-50',
    status: 'active',
    items: [
      'Roles: admin / user (extensible)',
      'Admin-only functions enforce user.role === "admin"',
      'User entity: only admins can list/manage other users',
      'Per-function authorization gates',
    ],
  },
  {
    icon: Database, title: 'Data Isolation',
    color: 'text-emerald-600', bg: 'bg-emerald-50',
    status: 'active',
    items: [
      'Test & Production databases fully separated',
      'No code changes required to switch environments',
      'Test mistakes cannot corrupt production data',
      'JSON Schema validation on every write',
    ],
  },
  {
    icon: Server, title: 'Backend Privilege Levels',
    color: 'text-blue-600', bg: 'bg-blue-50',
    status: 'active',
    items: [
      'User-scoped: base44.entities (respects RLS)',
      'Service role: base44.asServiceRole (admin tasks only)',
      'Service role used only after auth verification',
      'Never exposed to frontend',
    ],
  },
  {
    icon: FileLock2, title: 'Secrets Management',
    color: 'text-amber-600', bg: 'bg-amber-50',
    status: 'active',
    items: [
      'API keys in encrypted environment variables',
      'Accessed only inside Deno functions',
      'Never sent to the browser',
      'Never committed to source control',
    ],
  },
  {
    icon: Cloud, title: 'Transport & Storage',
    color: 'text-cyan-600', bg: 'bg-cyan-50',
    status: 'active',
    items: [
      'HTTPS enforced for all traffic',
      'Public file storage for asset images',
      'Private storage with signed URLs available',
      'File URLs only — no base64 payloads in DB',
    ],
  },
  {
    icon: Bot, title: 'AI Data Handling',
    color: 'text-pink-600', bg: 'bg-pink-50',
    status: 'active',
    items: [
      'LLM calls proxied via Base44 (Gemini / GPT / Claude)',
      'Provider keys never reach client',
      'Image-based analysis uses gemini_3_1_pro',
      'Every prediction logged to PredictionAccuracy',
    ],
  },
  {
    icon: Eye, title: 'Audit & Observability',
    color: 'text-rose-600', bg: 'bg-rose-50',
    status: 'active',
    items: [
      'Immutable AuditLogEntry records',
      'Actor identity verified server-side (never trusted from client)',
      'IP hint + user agent captured per action',
      'Filterable, exportable audit log viewer (admin only)',
    ],
  },
  {
    icon: ShieldCheck, title: 'Verifiable Outcomes',
    color: 'text-teal-600', bg: 'bg-teal-50',
    status: 'active',
    items: [
      'PredictionAccuracy ledger of every AI call',
      'Verified Savings Ledger ties predictions → dollars',
      'Human verification required for "verified" status',
      'Defensible audit trail for buyers & regulators',
    ],
  },
];

const StatusBadge = ({ status }) => {
  if (status === 'active') return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-[10px]">ACTIVE</Badge>;
  if (status === 'roadmap') return <Badge variant="outline" className="text-[10px]">ROADMAP</Badge>;
  return null;
};

export default function SecurityPostureGrid() {
  return (
    <div>
      <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-3">Security Posture</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sections.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.title} className="border-slate-200">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className={`w-10 h-10 ${s.bg} rounded-lg flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${s.color}`} />
                  </div>
                  <StatusBadge status={s.status} />
                </div>
                <CardTitle className="text-base mt-3">{s.title}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <ul className="space-y-1.5">
                  {s.items.map((item, i) => (
                    <li key={i} className="text-xs text-slate-600 flex items-start gap-2">
                      <span className="text-emerald-500 mt-0.5 shrink-0">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}