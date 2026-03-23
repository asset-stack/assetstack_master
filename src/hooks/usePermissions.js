import { useAuth } from '@/lib/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

// Default permission sets for built-in roles
const ADMIN_PERMISSIONS = {
  equipment: { view: true, create: true, edit: true, delete: true },
  locations: { view: true, create: true, edit: true, delete: true },
  work_orders: { view_all: true, view_assigned: true, create: true, edit_all: true, edit_assigned: true, delete: true },
  maintenance: { view_all: true, view_assigned: true, create: true, edit_all: true, edit_assigned: true, delete: true },
  financial: { view_costs: true, edit_costs: true, view_depreciation: true, edit_depreciation: true },
  team: { view: true, manage: true, invite: true },
  admin: { manage_roles: true, manage_users: true, system_settings: true, view_analytics: true, manage_ml_models: true },
};

const MANAGER_PERMISSIONS = {
  equipment: { view: true, create: true, edit: true, delete: false },
  locations: { view: true, create: false, edit: false, delete: false },
  work_orders: { view_all: true, view_assigned: true, create: true, edit_all: false, edit_assigned: true, delete: false },
  maintenance: { view_all: true, view_assigned: true, create: true, edit_all: false, edit_assigned: true, delete: false },
  financial: { view_costs: true, edit_costs: false, view_depreciation: true, edit_depreciation: false },
  team: { view: true, manage: false, invite: true },
  admin: { manage_roles: false, manage_users: false, system_settings: false, view_analytics: true, manage_ml_models: false },
};

const TECHNICIAN_PERMISSIONS = {
  equipment: { view: true, create: false, edit: false, delete: false },
  locations: { view: true, create: false, edit: false, delete: false },
  work_orders: { view_all: false, view_assigned: true, create: false, edit_all: false, edit_assigned: true, delete: false },
  maintenance: { view_all: false, view_assigned: true, create: false, edit_all: false, edit_assigned: true, delete: false },
  financial: { view_costs: false, edit_costs: false, view_depreciation: false, edit_depreciation: false },
  team: { view: true, manage: false, invite: false },
  admin: { manage_roles: false, manage_users: false, system_settings: false, view_analytics: false, manage_ml_models: false },
};

const BUILT_IN_ROLES = {
  admin: ADMIN_PERMISSIONS,
  manager: MANAGER_PERMISSIONS,
  technician: TECHNICIAN_PERMISSIONS,
};

export const PERMISSION_LABELS = {
  equipment: { label: 'Equipment & Assets', actions: { view: 'View', create: 'Create', edit: 'Edit', delete: 'Delete' } },
  locations: { label: 'Locations', actions: { view: 'View', create: 'Create', edit: 'Edit', delete: 'Delete' } },
  work_orders: { label: 'Work Orders', actions: { view_all: 'View All', view_assigned: 'View Assigned', create: 'Create', edit_all: 'Edit All', edit_assigned: 'Edit Assigned', delete: 'Delete' } },
  maintenance: { label: 'Maintenance Tasks', actions: { view_all: 'View All', view_assigned: 'View Assigned', create: 'Create', edit_all: 'Edit All', edit_assigned: 'Edit Assigned', delete: 'Delete' } },
  financial: { label: 'Financial Data', actions: { view_costs: 'View Costs', edit_costs: 'Edit Costs', view_depreciation: 'View Depreciation', edit_depreciation: 'Edit Depreciation' } },
  team: { label: 'Team Management', actions: { view: 'View', manage: 'Manage', invite: 'Invite' } },
  admin: { label: 'Administration', actions: { manage_roles: 'Manage Roles', manage_users: 'Manage Users', system_settings: 'System Settings', view_analytics: 'View Analytics', manage_ml_models: 'Manage ML Models' } },
};

export function usePermissions() {
  const { user } = useAuth();
  const userRole = user?.role || 'technician';

  // Fetch custom role if user has one
  const { data: customRole } = useQuery({
    queryKey: ['customRole', user?.custom_role_id],
    queryFn: () => base44.entities.Role.filter({ id: user.custom_role_id }),
    enabled: userRole === 'custom' && !!user?.custom_role_id,
    select: (data) => data?.[0],
  });

  // Resolve effective permissions
  const getPermissions = () => {
    if (userRole === 'custom' && customRole?.permissions) {
      return customRole.permissions;
    }
    return BUILT_IN_ROLES[userRole] || TECHNICIAN_PERMISSIONS;
  };

  const permissions = getPermissions();

  // Check a specific permission: can('equipment', 'edit')
  const can = (area, action) => {
    return permissions?.[area]?.[action] === true;
  };

  // Check if user can view a specific area at all
  const canViewArea = (area) => {
    const areaPerms = permissions?.[area];
    if (!areaPerms) return false;
    return Object.values(areaPerms).some(v => v === true);
  };

  const isAdmin = userRole === 'admin';
  const isManager = userRole === 'manager';
  const isTechnician = userRole === 'technician';

  return {
    permissions,
    can,
    canViewArea,
    isAdmin,
    isManager,
    isTechnician,
    userRole,
    roleName: userRole === 'custom' ? customRole?.name : userRole,
  };
}

export { BUILT_IN_ROLES };