export type Role = "ADMIN" | "MANAGER" | "MEMBER" | "VIEWER";

export const PERMISSIONS: Record<Role, {
  canCreateTask: boolean;
  canEditOwnTask: boolean;
  canEditAnyTask: boolean;
  canDeleteOwnTask: boolean;
  canDeleteAnyTask: boolean;
  canAssignTask: boolean;
  canViewAllTasks: boolean;
  canManageUsers: boolean;
  canViewActivityLog: boolean;
  canPurgeData: boolean;
}> = {
  ADMIN: {
    canCreateTask: true,
    canEditOwnTask: true,
    canEditAnyTask: true,
    canDeleteOwnTask: true,
    canDeleteAnyTask: true,
    canAssignTask: true,
    canViewAllTasks: true,
    canManageUsers: true,
    canViewActivityLog: true,
    canPurgeData: true,
  },
  MANAGER: {
    canCreateTask: true,
    canEditOwnTask: true,
    canEditAnyTask: true,
    canDeleteOwnTask: true,
    canDeleteAnyTask: true,
    canAssignTask: true,
    canViewAllTasks: true,
    canManageUsers: false,
    canViewActivityLog: true,
    canPurgeData: false,
  },
  MEMBER: {
    canCreateTask: true,
    canEditOwnTask: true,
    canEditAnyTask: false,
    canDeleteOwnTask: true,
    canDeleteAnyTask: false,
    canAssignTask: false,
    canViewAllTasks: false,
    canManageUsers: false,
    canViewActivityLog: false,
    canPurgeData: false,
  },
  VIEWER: {
    canCreateTask: false,
    canEditOwnTask: false,
    canEditAnyTask: false,
    canDeleteOwnTask: false,
    canDeleteAnyTask: false,
    canAssignTask: false,
    canViewAllTasks: true,  // read-only
    canManageUsers: false,
    canViewActivityLog: false,
    canPurgeData: false,
  },
};

export function can(role: Role, action: keyof typeof PERMISSIONS.ADMIN): boolean {
  return PERMISSIONS[role]?.[action] ?? false;
}