import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Settings as SettingsIcon, Building2, Users, Shield, Bell, Database, ChevronRight } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import GeneralSettings from '@/components/settings/GeneralSettings';
import TeamSettings from '@/components/settings/TeamSettings';
import NotificationSettings from '@/components/settings/NotificationSettings';
import DataSettings from '@/components/settings/DataSettings';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { usePermissions, BUILT_IN_ROLES } from '@/hooks/usePermissions';
import { AccessDenied } from '@/components/permissions/PermissionGate';
import RoleCard from '@/components/permissions/RoleCard';
import EditRoleDialog from '@/components/permissions/EditRoleDialog';
import UserRoleAssignment from '@/components/permissions/UserRoleAssignment';
import { Button } from "@/components/ui/button";
import { Plus, Users as UsersIcon } from 'lucide-react';

const TAB_ITEMS = [
  { value: 'general', label: 'General', icon: Building2, mobileLabel: 'General' },
  { value: 'team', label: 'Team Members', icon: Users, mobileLabel: 'Team' },
  { value: 'permissions', label: 'Roles & Permissions', icon: Shield, mobileLabel: 'Roles' },
  { value: 'notifications', label: 'Notifications', icon: Bell, mobileLabel: 'Alerts' },
  { value: 'data', label: 'Data & Integrations', icon: Database, mobileLabel: 'Data' },
];

export default function Settings() {
  const [activeTab, setActiveTab] = useState('general');

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-4 sm:py-8" style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 80px)' }}>
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-3">
            <SettingsIcon className="w-6 h-6 text-indigo-600" />
            Settings
          </h1>
          <p className="text-sm text-slate-500 mt-1">Manage your organisation, team, permissions, and preferences</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Navigation — desktop */}
          <div className="hidden lg:block w-64 shrink-0">
            <nav className="bg-white rounded-xl border border-slate-200 p-2 sticky top-4">
              {TAB_ITEMS.map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.value;
                return (
                  <button
                    key={item.value}
                    onClick={() => setActiveTab(item.value)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-700'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                    <span className="text-sm font-medium">{item.label}</span>
                    {isActive && <ChevronRight className="w-4 h-4 ml-auto text-indigo-400" />}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Mobile Tab Bar */}
          <div className="lg:hidden overflow-x-auto -mx-4 px-4">
            <div className="flex gap-1 bg-white rounded-xl border border-slate-200 p-1 min-w-max">
              {TAB_ITEMS.map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.value;
                return (
                  <button
                    key={item.value}
                    onClick={() => setActiveTab(item.value)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                      isActive ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {item.mobileLabel}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 min-w-0">
            <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6">
              {activeTab === 'general' && <GeneralSettings />}
              {activeTab === 'team' && <TeamSettings />}
              {activeTab === 'permissions' && <EmbeddedRoleManagement />}
              {activeTab === 'notifications' && <NotificationSettings />}
              {activeTab === 'data' && <DataSettings />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmbeddedRoleManagement() {
  const { can } = usePermissions();
  const queryClient = useQueryClient();
  const [editingRole, setEditingRole] = React.useState(null);
  const [showDialog, setShowDialog] = React.useState(false);
  const [showUsers, setShowUsers] = React.useState(false);

  if (!can('admin', 'manage_roles')) {
    return <AccessDenied message="Only administrators can manage roles and permissions." />;
  }

  const { data: roles = [] } = useQuery({
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-2">
            <Shield className="w-4 h-4 text-indigo-500" />
            Roles & Permissions
          </h3>
          <p className="text-xs text-slate-500 mt-1">Manage access levels and custom roles</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowUsers(true)}>
            <UsersIcon className="w-4 h-4 mr-1" /> Assign
          </Button>
          <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700" onClick={() => { setEditingRole(null); setShowDialog(true); }}>
            <Plus className="w-4 h-4 mr-1" /> New Role
          </Button>
        </div>
      </div>

      {/* System Roles */}
      <div>
        <p className="text-xs font-medium text-slate-500 mb-2">System Roles</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {systemRoleEntries.map((role) => (
            <RoleCard key={role.name} role={role} onEdit={(r) => { setEditingRole(r); setShowDialog(true); }} onDelete={handleDelete} />
          ))}
        </div>
      </div>

      {/* Custom Roles */}
      <div>
        <p className="text-xs font-medium text-slate-500 mb-2">Custom Roles</p>
        {customRoles.length === 0 ? (
          <div className="border border-dashed border-slate-300 rounded-lg p-6 text-center">
            <p className="text-sm text-slate-500 mb-2">No custom roles yet</p>
            <Button variant="outline" size="sm" onClick={() => { setEditingRole(null); setShowDialog(true); }}>
              <Plus className="w-4 h-4 mr-1" /> Create Role
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {customRoles.map((role) => (
              <RoleCard key={role.id} role={role} onEdit={(r) => { setEditingRole(r); setShowDialog(true); }} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>

      <EditRoleDialog open={showDialog} onOpenChange={setShowDialog} role={editingRole} onSave={handleSave} />
      <UserRoleAssignment open={showUsers} onOpenChange={setShowUsers} roles={roles} />
    </div>
  );
}