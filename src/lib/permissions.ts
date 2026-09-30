import type { AuthInfo } from "@/types/api";

export const CLUB_PERMISSIONS = {
  EDIT_CLUB: "EDIT_CLUB",
  EDIT_CLUB_MEMBERS: "EDIT_CLUB_MEMBERS",
  CREATE_EVENT: "CREATE_EVENT",
  EDIT_EVENT: "EDIT_EVENT",
  DELETE_EVENT_CESA: "DELETE_EVENT_CESA",
} as const;

export const ACM_ROLES = {
  DOCUMENTATION_MEMBER: "Documentation Member",
  SECRETARY: "Secretary",
  CO_SECRETARY: "Co-Secretary",
} as const;

/** True if the user is the Master Admin (superuser with universal access across all clubs). */
export const isMasterAdmin = (auth: AuthInfo | null): boolean =>
  auth?.isMasterAdmin === true;

/** True if the user has CESA-wide coordinator scope. */
export const isCesaAdmin = (auth: AuthInfo | null): boolean =>
  auth?.isCesaAdmin === true;

/**
 * Check if the user can perform `permission` inside a specific club.
 * Strictly ensures only Master Admin can access all clubs unconditionally.
 * Other roles/club admins are restricted to their assigned club memberships.
 */
export const canPerformInClub = (
  auth: AuthInfo | null,
  clubId: string,
  permission: string,
): boolean => {
  if (!auth) return false;
  if (auth.isMasterAdmin) return true; // Only Master Admin has universal access across all clubs
  const membership = auth.memberships?.find((m) => m.clubId === clubId);
  return membership?.permissions?.includes(permission) ?? false;
};

/** Check if the user has `permission` in ANY club they belong to. */
export const hasPermissionAnywhere = (
  auth: AuthInfo | null,
  permission: string,
): boolean => {
  if (!auth) return false;
  if (auth.isMasterAdmin) return true;
  return (
    auth.memberships?.some((m) => m.permissions?.includes(permission)) ?? false
  );
};

/** Check if the user holds a named role (e.g. "Secretary") within a given club code. */
export const hasRoleInClub = (
  auth: AuthInfo | null,
  clubCode: string,
  roleName: string,
): boolean => {
  const membership = auth?.memberships?.find((m) => m.clubCode === clubCode);
  return membership?.roles?.some((r) => r.name === roleName) ?? false;
};

export const isDocMember = (auth: AuthInfo | null) =>
  hasRoleInClub(auth, "ACM", ACM_ROLES.DOCUMENTATION_MEMBER);

export const isSecretary = (auth: AuthInfo | null) =>
  hasRoleInClub(auth, "ACM", ACM_ROLES.SECRETARY) ||
  hasRoleInClub(auth, "ACM", ACM_ROLES.CO_SECRETARY);
