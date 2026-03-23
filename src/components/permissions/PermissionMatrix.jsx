import React from 'react';
import { PERMISSION_LABELS } from '@/hooks/usePermissions';
import { Switch } from "@/components/ui/switch";

export default function PermissionMatrix({ permissions, onChange, readOnly }) {
  const handleToggle = (area, action) => {
    if (readOnly) return;
    const updated = {
      ...permissions,
      [area]: {
        ...permissions[area],
        [action]: !permissions[area]?.[action],
      },
    };
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      {Object.entries(PERMISSION_LABELS).map(([area, config]) => (
        <div key={area} className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-100">
            <h4 className="text-sm font-semibold text-slate-900">{config.label}</h4>
          </div>
          <div className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
            {Object.entries(config.actions).map(([action, label]) => (
              <label
                key={action}
                className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <span className="text-xs font-medium text-slate-700">{label}</span>
                <Switch
                  checked={permissions?.[area]?.[action] === true}
                  onCheckedChange={() => handleToggle(area, action)}
                  disabled={readOnly}
                  className="scale-75"
                />
              </label>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}