import React from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import { ShieldAlert } from 'lucide-react';

// Wrapper component that hides children if user lacks permission
export default function PermissionGate({ area, action, fallback, children }) {
  const { can } = usePermissions();

  if (!can(area, action)) {
    if (fallback) return fallback;
    return null;
  }

  return <>{children}</>;
}

// Full page access denied message
export function AccessDenied({ message }) {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="text-lg font-semibold text-slate-900 mb-1">Access Denied</h2>
        <p className="text-sm text-slate-500 max-w-sm">
          {message || "You don't have permission to access this section. Contact your administrator to request access."}
        </p>
      </div>
    </div>
  );
}