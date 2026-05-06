import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, ShieldAlert } from 'lucide-react';

import SecurityHero from '@/components/security/SecurityHero';
import SecurityPostureGrid from '@/components/security/SecurityPostureGrid';
import DataFlowDiagram from '@/components/security/DataFlowDiagram';
import AuditLogViewer from '@/components/security/AuditLogViewer';

export default function SecurityCenter() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.auth.me().then((u) => {
      setUser(u);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-12 flex items-center justify-center text-slate-500">
        <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading…
      </div>
    );
  }

  const isAdmin = user?.role === 'admin';

  return (
    <div className="p-4 md:p-6 max-w-[1400px] mx-auto">
      <SecurityHero />

      <div className="space-y-6">
        <DataFlowDiagram />
        <SecurityPostureGrid />

        {isAdmin ? (
          <AuditLogViewer />
        ) : (
          <div className="rounded-xl border-2 border-dashed border-amber-200 bg-amber-50 p-8 text-center">
            <ShieldAlert className="w-10 h-10 text-amber-600 mx-auto mb-2" />
            <p className="font-semibold text-amber-900">Audit log is admin-only</p>
            <p className="text-sm text-amber-700 mt-1">
              Sign in as an administrator to view detailed activity records.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}