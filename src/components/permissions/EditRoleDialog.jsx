import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Shield, Save } from 'lucide-react';
import { BUILT_IN_ROLES } from '@/hooks/usePermissions';
import PermissionMatrix from './PermissionMatrix';

const EMPTY_PERMISSIONS = {
  equipment: { view: false, create: false, edit: false, delete: false },
  locations: { view: false, create: false, edit: false, delete: false },
  work_orders: { view_all: false, view_assigned: false, create: false, edit_all: false, edit_assigned: false, delete: false },
  maintenance: { view_all: false, view_assigned: false, create: false, edit_all: false, edit_assigned: false, delete: false },
  financial: { view_costs: false, edit_costs: false, view_depreciation: false, edit_depreciation: false },
  team: { view: false, manage: false, invite: false },
  admin: { manage_roles: false, manage_users: false, system_settings: false, view_analytics: false, manage_ml_models: false },
};

export default function EditRoleDialog({ open, onOpenChange, role, onSave }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [permissions, setPermissions] = useState(EMPTY_PERMISSIONS);
  const [saving, setSaving] = useState(false);

  const isSystem = role?.is_system_role;
  const isEditing = !!role;

  useEffect(() => {
    if (role) {
      setName(role.name || '');
      setDescription(role.description || '');
      // For system roles, load from BUILT_IN_ROLES as source of truth
      if (role.is_system_role && BUILT_IN_ROLES[role.name]) {
        setPermissions(BUILT_IN_ROLES[role.name]);
      } else {
        setPermissions(role.permissions || EMPTY_PERMISSIONS);
      }
    } else {
      setName('');
      setDescription('');
      setPermissions(EMPTY_PERMISSIONS);
    }
  }, [role, open]);

  const handleSave = async () => {
    setSaving(true);
    await onSave({
      id: role?.id,
      name,
      description,
      permissions,
      is_system_role: isSystem || false,
    });
    setSaving(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-indigo-600" />
            {isEditing ? `Edit Role: ${role.name}` : 'Create Custom Role'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Role Name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Senior Technician"
                disabled={isSystem}
              />
            </div>
            <div>
              <Label>Description</Label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What this role can do..."
              />
            </div>
          </div>

          <div>
            <Label className="mb-2 block">Permissions</Label>
            <PermissionMatrix
              permissions={permissions}
              onChange={setPermissions}
              readOnly={false}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button
              onClick={handleSave}
              disabled={!name.trim() || saving}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              <Save className="w-4 h-4 mr-2" />
              {isEditing ? 'Save Changes' : 'Create Role'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}