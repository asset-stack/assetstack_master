import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, Pencil, Trash2, Lock } from 'lucide-react';
import { PERMISSION_LABELS } from '@/hooks/usePermissions';

export default function RoleCard({ role, onEdit, onDelete }) {
  const isSystem = role.is_system_role;

  // Count enabled permissions
  const permCount = Object.entries(role.permissions || {}).reduce((total, [area, actions]) => {
    return total + Object.values(actions || {}).filter(v => v === true).length;
  }, 0);

  const totalPerms = Object.values(PERMISSION_LABELS).reduce((total, config) => {
    return total + Object.keys(config.actions).length;
  }, 0);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            isSystem ? 'bg-indigo-100' : 'bg-slate-100'
          }`}>
            {isSystem ? <Lock className="w-5 h-5 text-indigo-600" /> : <Shield className="w-5 h-5 text-slate-600" />}
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 capitalize">{role.name}</h3>
            {isSystem && <Badge variant="outline" className="text-[10px] mt-0.5">System Role</Badge>}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(role)}>
            <Pencil className="w-3.5 h-3.5 text-slate-500" />
          </Button>
          {!isSystem && (
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onDelete(role)}>
              <Trash2 className="w-3.5 h-3.5 text-red-500" />
            </Button>
          )}
        </div>
      </div>

      {role.description && (
        <p className="text-xs text-slate-500 mb-3">{role.description}</p>
      )}

      <div className="flex items-center gap-2">
        <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
          <div
            className="h-full bg-indigo-500 rounded-full transition-all"
            style={{ width: `${(permCount / totalPerms) * 100}%` }}
          />
        </div>
        <span className="text-xs text-slate-500 font-medium">{permCount}/{totalPerms}</span>
      </div>
    </div>
  );
}