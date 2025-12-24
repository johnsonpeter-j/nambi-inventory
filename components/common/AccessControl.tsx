"use client";

import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { hasPermission } from "@/lib/permissions";

interface AccessControlProps {
  children: React.ReactNode;
  requiredPermission?: string;
  fallback?: React.ReactNode;
}

export default function AccessControl({
  children,
  requiredPermission,
  fallback,
}: AccessControlProps) {
  const { user } = useAuth();
  const pathname = usePathname();
  const permissions = user?.roleDetails?.permissions;

  // If no permission is specified, use the route-based permission
  const permissionToCheck = requiredPermission || pathname;

  // Check if user has permission
  const hasAccess = hasPermission(permissions, permissionToCheck);

  if (!hasAccess) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-[#1a232e] rounded-xl shadow-lg border border-slate-200 dark:border-[#324d67] p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-500/20 flex items-center justify-center">
            <span className="material-symbols-outlined text-red-600 dark:text-red-400 text-3xl">
              block
            </span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Access Denied
          </h2>
          <p className="text-slate-600 dark:text-[#92adc9] mb-6">
            You don't have access to this page. Please contact your administrator
            if you believe this is an error.
          </p>
          <a
            href="/dashboard"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            <span className="material-symbols-outlined">home</span>
            Go to Dashboard
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}


