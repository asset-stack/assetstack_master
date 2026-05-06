import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Lock } from 'lucide-react';

const Step = ({ num, title, desc, color }) => (
  <div className="flex-1 min-w-0">
    <div className={`rounded-lg border-2 ${color} p-3 text-center h-full`}>
      <div className="text-[10px] font-bold opacity-60 mb-1">STEP {num}</div>
      <div className="text-sm font-bold mb-1">{title}</div>
      <div className="text-[11px] opacity-80 leading-snug">{desc}</div>
    </div>
  </div>
);

const Arrow = () => (
  <div className="flex items-center justify-center px-1">
    <ArrowRight className="w-4 h-4 text-slate-300" />
  </div>
);

export default function DataFlowDiagram() {
  return (
    <Card className="border-slate-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Lock className="w-5 h-5 text-indigo-600" />
          Request Lifecycle
        </CardTitle>
        <p className="text-xs text-slate-500">
          Every privileged action — like running an AI scan — passes through these gates.
        </p>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row items-stretch gap-1">
          <Step
            num="1"
            title="Frontend Request"
            desc="React app calls base44.functions.invoke() over HTTPS with auth token"
            color="border-indigo-200 bg-indigo-50 text-indigo-900"
          />
          <Arrow />
          <Step
            num="2"
            title="Auth Verify"
            desc="Function calls auth.me() — invalid token → 401"
            color="border-purple-200 bg-purple-50 text-purple-900"
          />
          <Arrow />
          <Step
            num="3"
            title="Role Gate"
            desc="Admin-only paths check user.role === 'admin' → 403 if not"
            color="border-amber-200 bg-amber-50 text-amber-900"
          />
          <Arrow />
          <Step
            num="4"
            title="Execute + Log"
            desc="Run logic with service role; write AuditLogEntry"
            color="border-emerald-200 bg-emerald-50 text-emerald-900"
          />
          <Arrow />
          <Step
            num="5"
            title="Response"
            desc="JSON returned over HTTPS; UI updates via React Query"
            color="border-teal-200 bg-teal-50 text-teal-900"
          />
        </div>
      </CardContent>
    </Card>
  );
}