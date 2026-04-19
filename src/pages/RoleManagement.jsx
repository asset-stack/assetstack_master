import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Shield, Plus, Users } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { usePermissions, BUILT_IN_ROLES } from '@/hooks/usePermissions';
import { AccessDenied } from '@/components/permissions/PermissionGate';
import RoleCard from '@/components/permissions/RoleCard';
import EditRoleDialog from '@/components/permissions/EditRoleDialog';
import UserRoleAssignment from '@/components/permissions/UserRoleAssignment';

export default function RoleManagement() {
  const { can } = usePermissions();
  const queryClient = useQueryClient();
  const [editingRole, setEditingRole] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const [showUsers, setShowUsers] = useState(false);

  const { data: roles = [], isLoading } = useQuery({
    queryKey: ['roles'],
    queryFn: () => base44.entities.Role.list('name', 100),
  });

  const createRoleMutation = useMutation({
    mutationFn: (data) => base44.entities.Role.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['roles'] }),
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Role.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['roles'] }),
  });

  const deleteRoleMutation = useMutation({
    mutationFn: (id) => base44.entities.Role.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['roles'] }),
  });

  if (!can('admin', 'manage_roles')) {
    return <AccessDenied message="Only administrators can manage roles and permissions." />;
  }

  // Build display list: system roles first, then custom
  const systemRoleEntries = ['admin', 'manager', 'technician'].map(name => {
    const existing = roles.find(r => r.name === name && r.is_system_role);
    return existing || {
      name,
      is_system_role: true,
      description: name === 'admin' ? 'Full access to all features' : name === 'manager' ? 'View all, edit assigned items' : 'View and edit own work only',
      permissions: BUILT_IN_ROLES[name],
    };
  });

  const customRoles = roles.filter(r => !r.is_system_role);

  const handleSave = async (roleData) => {
    if (roleData.id) {
      await updateRoleMutation.mutateAsync({ id: roleData.id, data: roleData });
    } else {
      await createRoleMutation.mutateAsync(roleData);
    }
  };

  const handleDelete = async (role) => {
    if (role.id && confirm(`Delete role "${role.name}"? Users with this role will lose their permissions.`)) {
      await deleteRoleMutation.mutateAsync(role.id);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
              <Shield className="w-5 h-5 text-indigo-600" />
              Roles & Permissions
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">Manage access levels and custom roles</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowUsers(true)}>
              <Users className="w-4 h-4 mr-2" />
              Assign Users
            </Button>
            <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={() => { setEditingRole(null); setShowDialog(true); }}>
              <Plus className="w-4 h-4 mr-2" />
              New Role
            </Button>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 py-6 space-y-6">
        {/* System Roles */}
        <div>
          <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-3">System Roles</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {systemRoleEntries.map((role) => (
              <RoleCard
                key={role.name}
                role={role}
                onEdit={(r) => { setEditingRole(r); setShowDialog(true); }}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </div>

        {/* Custom Roles */}
        <div>
          <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-3">Custom Roles</h2>
          {customRoles.length === 0 ? (
            <div className="bg-white border border-dashed border-slate-300 rounded-xl p-8 text-center">
              <Shield className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-sm text-slate-500 mb-2">No custom roles yet</p>
              <Button variant="outline" size="sm" onClick={() => { setEditingRole(null); setShowDialog(true); }}>
                <Plus className="w-4 h-4 mr-1" />
                Create your first custom role
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {customRoles.map((role) => (
                <RoleCard
                  key={role.id}
                  role={role}
                  onEdit={(r) => { setEditingRole(r); setShowDialog(true); }}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <EditRoleDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        role={editingRole}
        onSave={handleSave}
      />

      <UserRoleAssignment
        open={showUsers}
        onOpenChange={setShowUsers}
        roles={roles}
      />
    </div>
  );
}