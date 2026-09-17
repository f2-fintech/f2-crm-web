export const ROLES = {
  SUPER_ADMIN: "SUPER_ADMIN",
  ADMIN: "ADMIN",
  MANAGER: "MANAGER",
  TEAM_LEADER: "TEAM_LEADER",
  EMPLOYEE: "EMPLOYEE",
};

export const ALL_ROLES = [
  ROLES.SUPER_ADMIN,
  ROLES.ADMIN,
  ROLES.MANAGER,
  ROLES.TEAM_LEADER,
  ROLES.EMPLOYEE,
];

// Define minimum roles required for different route prefixes
// If a route is not specified here, it will be accessible by all authenticated users by default.
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
  // Check exact matches or prefixes
  for (const [route, allowedRoles] of Object.entries(ROUTE_PERMISSIONS)) {
    if (pathname === route || pathname.startsWith(`${route}/`)) {
      return allowedRoles.includes(userRole);
    }
  }
  return true; // Default allow if not restricted in ROUTE_PERMISSIONS
};
