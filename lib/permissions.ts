import { IRolePermissions } from "@/models/Role";

export interface PermissionCheck {
  path: string;
  requiredPermission?: string;
}

// Map routes to permission paths
const routePermissionMap: Record<string, string> = {
  "/dashboard": "dashboard.view",
  "/yarn-in": "inEntry.create",
  "/yarn-out": "outEntry.create",
  "/master/yarn-category": "master.category.view",
  "/master/party": "master.party.view",
  "/accounts/user": "accounts.user.view",
  "/accounts/role": "accounts.role.view",
};

// Helper function to get nested permission value
function getNestedPermission(
  permissions: IRolePermissions,
  path: string
): boolean {
  const parts = path.split(".");
  let current: any = permissions;

  for (const part of parts) {
    if (current && typeof current === "object" && part in current) {
      current = current[part];
    } else {
      return false;
    }
  }

  return current === true;
}

// Check if user has permission for a route
export function hasPermission(
  permissions: IRolePermissions | undefined,
  route: string
): boolean {
  // If no permissions object, deny access
  if (!permissions) {
    return false;
  }

  // Normalize route - remove query params and trailing slashes
  const normalizedRoute = route.split("?")[0].replace(/\/$/, "") || "/";
  
  // Check exact match first
  let permissionPath = routePermissionMap[normalizedRoute];
  
  // If no exact match, try to find a matching route pattern
  // (e.g., /dashboard/123 should match /dashboard)
  if (!permissionPath) {
    // Find the longest matching route prefix
    const matchingRoute = Object.keys(routePermissionMap)
      .filter((key) => normalizedRoute.startsWith(key + "/") || normalizedRoute === key)
      .sort((a, b) => b.length - a.length)[0]; // Get the longest match
    
    if (matchingRoute) {
      permissionPath = routePermissionMap[matchingRoute];
    }
  }
  
  if (!permissionPath) {
    // If route is not in the map, allow access (for routes like /profile, /change-password)
    return true;
  }

  return getNestedPermission(permissions, permissionPath);
}

// Check if user can access a navigation item
export function canAccessNavigationItem(
  permissions: IRolePermissions | undefined,
  item: { href?: string; children?: Array<{ href: string }> }
): boolean {
  if (!permissions) {
    return false;
  }

  // If item has direct href, check permission
  if (item.href) {
    return hasPermission(permissions, item.href);
  }

  // If item has children, check if any child is accessible
  if (item.children && item.children.length > 0) {
    return item.children.some((child) =>
      hasPermission(permissions, child.href)
    );
  }

  // Default: allow if no specific check needed
  return true;
}

