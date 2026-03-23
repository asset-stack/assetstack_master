import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Save, Loader2 } from 'lucide-react';

export default function UserRoleAssignment({ open, onOpenChange, roles = [] }) {
  const queryClient = useQueryClient();
  const [changes, setChanges] = useState({});
  const [saving, setSaving] = useState(false);

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['allUsers'],
    queryFn: () => base44.entities.User.list('full_name', 100),
    enabled: open,
  });

  const handleRoleChange = (userId, newRole) => {
    setChanges(prev => ({ ...prev, [userId]: { role: newRole } }));
  };

  const handleCustomRoleChange = (userId, customRoleId) => {
    setChanges(prev => ({
      ...prev,
      [userId]: { ...prev[userId], role: 'custom', custom_role_id: customRoleId },
    }));
  };

  const handleSaveAll = async () => {
    setSaving(true);
    const updates = Object.entries(changes);
    for (const [userId, data] of updates) {
      await base44.entities.User.update(userId, data);
    }
    queryClient.invalidateQueries({ queryKey: ['allUsers'] });
    setChanges({});
    setSaving(false);
    onOpenChange(false);
  };

  const customRoles = roles.filter(r => !r.is_system_role);
  const hasChanges = Object.keys(changes).length > 0;

  const getUserRole = (user) => {
    if (changes[user.id]) return changes[user.id].role || user.role;
    return user.role || 'technician';
  };

  const getUserCustomRoleId = (user) => {
    if (changes[user.id]) return changes[user.id].custom_role_id || user.custom_role_id;
    return user.custom_role_id;
  };

  const roleColors = {
    admin: 'bg-red-100 text-red-700',
    manager: 'bg-blue-100 text-blue-700',
    technician: 'bg-green-100 text-green-700',
    custom: 'bg-purple-100 text-purple-700',
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            Assign User Roles
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
          </div>
        ) : (
          <div className="space-y-2">
            {users.map(user => {
              const currentRole = getUserRole(user);
              return (
                <div key={user.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{user.full_name || user.email}</p>
                    <p className="text-xs text-slate-500 truncate">{user.email}</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Select value={currentRole} onValueChange={(v) => handleRoleChange(user.id, v)}>
                      <SelectTrigger className="w-36 h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                        <SelectItem value="technician">Technician</SelectItem>
                        {customRoles.length > 0 && <SelectItem value="custom">Custom Role</SelectItem>}
                      </SelectContent>
                    </Select>

                    {currentRole === 'custom' && customRoles.length > 0 && (
                      <Select value={getUserCustomRoleId(user) || ''} onValueChange={(v) => handleCustomRoleChange(user.id, v)}>
                        <SelectTrigger className="w-40 h-9">
                          <SelectValue placeholder="Select role..." />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                          {customRoles.map(role => (
                            <SelectItem key={role.id} value={role.id}>{role.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}

                    {changes[user.id] && (
                      <Badge className="bg-amber-100 text-amber-700 text-[10px]">Changed</Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <Button variant="outline" onClick={() => { setChanges({}); onOpenChange(false); }}>Cancel</Button>
          <Button
            onClick={handleSaveAll}
            disabled={!hasChanges || saving}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}