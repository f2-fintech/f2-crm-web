export const ROLES = {
  SUPER_ADMIN: "SUPER_ADMIN",
  ADMIN: "ADMIN",
  MANAGER: "MANAGER",
  TEAM_LEADER: "TEAM_LEADER",
  EMPLOYEE: "EMPLOYEE",
  SOURCER: "SOURCER",
  CHANNEL_PARTNER: "CHANNEL_PARTNER",
};

export const ALL_ROLES = [
  ROLES.SUPER_ADMIN,
  ROLES.ADMIN,
  ROLES.MANAGER,
  ROLES.TEAM_LEADER,
  ROLES.EMPLOYEE,
  ROLES.SOURCER,
  ROLES.CHANNEL_PARTNER,
];

export const ROUTE_PERMISSIONS: Record<string, string[]> = {
  "/users": [ROLES.SUPER_ADMIN, ROLES.ADMIN],
  "/roles": [ROLES.SUPER_ADMIN, ROLES.ADMIN],
  "/permissions": [ROLES.SUPER_ADMIN, ROLES.ADMIN],
  "/departments": [ROLES.SUPER_ADMIN, ROLES.ADMIN],
  "/branches": [ROLES.SUPER_ADMIN, ROLES.ADMIN],
  "/teams": [ROLES.SUPER_ADMIN, ROLES.ADMIN],
  "/settings": [ROLES.SUPER_ADMIN, ROLES.ADMIN],
  "/integrations": [ROLES.SUPER_ADMIN, ROLES.ADMIN],
  "/agents": [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER, ROLES.TEAM_LEADER],
};

export const hasPermission = (pathname: string, userRole: string): boolean => {
  if (!userRole) return false;
  for (const [route, allowedRoles] of Object.entries(ROUTE_PERMISSIONS)) {
    if (pathname === route || pathname.startsWith(`${route}/`)) {
      return allowedRoles.includes(userRole);
    }
  }
  return true;
};
