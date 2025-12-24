"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { canAccessNavigationItem } from "@/lib/permissions";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, logout, isAuthenticated, isLoading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [showAppbar, setShowAppbar] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/signin");
    }
  }, [isAuthenticated, isLoading, router]);

  // Check screen size to show/hide appbar
  useEffect(() => {
    const checkScreenSize = () => {
      if (typeof window !== "undefined") {
        setShowAppbar(window.innerWidth < 1024);
      }
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => {
      window.removeEventListener("resize", checkScreenSize);
    };
  }, []);

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node)
      ) {
        setProfileMenuOpen(false);
      }
    };

    if (profileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [profileMenuOpen]);

  const handleLogout = async () => {
    await logout();
    router.push("/signin");
  };

  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(
    new Set(["Yarn In", "Yarn Out"])
  );

  const allNavigationItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: "dashboard",
    },
    {
      name: "Yarn In",
      icon: "input",
      children: [
        {
          name: "Entry",
          href: "/yarn-in/add",
          icon: "add",
        },
        {
          name: "List",
          href: "/yarn-in",
          icon: "list",
        },
      ],
    },
    {
      name: "Yarn Out",
      icon: "output",
      children: [
        {
          name: "Entry",
          href: "/yarn-out/add",
          icon: "add",
        },
        {
          name: "List",
          href: "/yarn-out",
          icon: "list",
        },
      ],
    },
    {
      name: "Master",
      icon: "folder",
      children: [
        {
          name: "Yarn Category",
          href: "/master/yarn-category",
          icon: "category",
        },
        {
          name: "Party",
          href: "/master/party",
          icon: "groups",
        },
      ],
    },
    {
      name: "Accounts",
      icon: "manage_accounts",
      children: [
        {
          name: "User",
          href: "/accounts/user",
          icon: "person",
        },
        {
          name: "Role",
          href: "/accounts/role",
          icon: "admin_panel_settings",
        },
      ],
    },
  ];

  // Filter navigation items based on user permissions
  const navigationItems = useMemo(() => {
    const permissions = user?.roleDetails?.permissions;
    return allNavigationItems
      .map((item) => {
        // If item has children, filter them first
        if (item.children) {
          const filteredChildren = item.children.filter((child) =>
            canAccessNavigationItem(permissions, { href: child.href })
          );
          // Only include parent if it has accessible children
          if (filteredChildren.length > 0) {
            return { ...item, children: filteredChildren };
          }
          return null;
        }
        // For items without children, check direct permission
        return canAccessNavigationItem(permissions, item) ? item : null;
      })
      .filter((item) => item !== null);
  }, [user?.roleDetails?.permissions]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center">
        <div className="text-slate-500 dark:text-[#92adc9]">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      {/* Mobile sidebar overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-screen w-64 bg-white dark:bg-[#1a232e] border-r border-slate-200 dark:border-[#324d67] transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo/Brand */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-slate-200 dark:border-[#324d67]">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-xl">
                  inventory_2
                </span>
              </div>
              <span className="text-lg font-bold text-slate-900 dark:text-white">
                Inventory
              </span>
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden text-slate-500 dark:text-[#92adc9] hover:text-slate-900 dark:hover:text-white"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 overflow-y-auto">
            <ul className="space-y-1">
              {navigationItems.map((item) => {
                const hasChildren = "children" in item && item.children;
                const isExpanded = expandedMenus.has(item.name);

                return (
                  <li key={item.name}>
                    {hasChildren ? (
                      <>
                        <button
                          onClick={() => {
                            setExpandedMenus((prev) => {
                              const newSet = new Set(prev);
                              if (isExpanded) {
                                newSet.delete(item.name);
                              } else {
                                newSet.add(item.name);
                              }
                              return newSet;
                            });
                          }}
                          className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg text-slate-700 dark:text-[#92adc9] hover:bg-slate-100 dark:hover:bg-[#101922] transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-xl">
                              {item.icon}
                            </span>
                            <span className="font-medium">{item.name}</span>
                          </div>
                          <span
                            className={`material-symbols-outlined text-lg transition-transform ${
                              isExpanded ? "rotate-90" : ""
                            }`}
                          >
                            chevron_right
                          </span>
                        </button>
                        {isExpanded && item.children && (
                          <ul className="ml-4 mt-1 space-y-1 border-l border-slate-200 dark:border-[#324d67] pl-4">
                            {item.children.map((child) => (
                              <li key={child.name}>
                                <Link
                                  href={child.href}
                                  onClick={() => setMobileMenuOpen(false)}
                                  className="flex items-center gap-3 px-4 py-2 rounded-lg text-slate-600 dark:text-[#92adc9] hover:bg-slate-100 dark:hover:bg-[#101922] transition-colors text-sm"
                                >
                                  <span className="material-symbols-outlined text-lg">
                                    {child.icon}
                                  </span>
                                  <span>{child.name}</span>
                                </Link>
                              </li>
                            ))}
                          </ul>
                        )}
                      </>
                    ) : (
                      <Link
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-700 dark:text-[#92adc9] hover:bg-slate-100 dark:hover:bg-[#101922] transition-colors"
                      >
                        <span className="material-symbols-outlined text-xl">
                          {item.icon}
                        </span>
                        <span className="font-medium">{item.name}</span>
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-slate-200 dark:border-[#324d67]">
            <Link
              href="/profile"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-lg bg-slate-50 dark:bg-[#101922] mb-3 hover:bg-slate-100 dark:hover:bg-[#1a232e] transition-colors cursor-pointer"
            >
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 overflow-hidden">
                {user?.profilePic ? (
                  <img
                    src={user.profilePic}
                    alt={user.name || user.email}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-primary font-bold">
                    {(user?.name || user?.email || "U").charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                  {user?.name || "User"}
                </p>
                <p className="text-xs text-slate-500 dark:text-[#92adc9] truncate">
                  {user?.email}
                </p>
              </div>
            </Link>
            <Link
              href="/change-password"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-700 dark:text-[#92adc9] hover:bg-slate-100 dark:hover:bg-[#101922] transition-colors mb-3"
            >
              <span className="material-symbols-outlined text-xl">lock</span>
              <span className="font-medium">Change Password</span>
            </Link>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
            >
              <span className="material-symbols-outlined text-xl">logout</span>
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main content area */}
      <div className="lg:pl-64">
        {/* Appbar for mobile and tablet only - hidden on lg screens (1024px+) */}
        {showAppbar && (
        <header className="flex fixed top-0 left-0 right-0 z-30 bg-white dark:bg-[#1a232e] border-b border-slate-200 dark:border-[#324d67] h-16 items-center justify-between px-4">
          {/* Left: Sidebar toggle */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="text-slate-500 dark:text-[#92adc9] hover:text-slate-900 dark:hover:text-white p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-[#101922] transition-colors"
          >
            <span className="material-symbols-outlined text-2xl">menu</span>
          </button>

          {/* Center: App name */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-xl">
                inventory_2
              </span>
            </div>
            <span className="text-lg font-bold text-slate-900 dark:text-white">
              Inventory
            </span>
          </div>

          {/* Right: Profile avatar with popover */}
          <div className="relative" ref={profileMenuRef}>
            <button
              onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-[#101922] transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden">
                {user?.profilePic ? (
                  <img
                    src={user.profilePic}
                    alt={user.name || user.email}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-primary font-bold text-sm">
                    {(user?.name || user?.email || "U").charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
            </button>

            {/* Profile popover */}
            {profileMenuOpen && (
              <div className="absolute right-0 top-14 w-72 bg-white dark:bg-[#1a232e] rounded-xl shadow-xl border border-slate-200 dark:border-[#324d67] overflow-hidden z-50">
                {/* Profile header */}
                <Link
                  href="/profile"
                  onClick={() => setProfileMenuOpen(false)}
                  className="block p-4 border-b border-slate-200 dark:border-[#324d67] hover:bg-slate-50 dark:hover:bg-[#101922] transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden flex-shrink-0">
                      {user?.profilePic ? (
                        <img
                          src={user.profilePic}
                          alt={user.name || user.email}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-primary font-bold">
                          {(user?.name || user?.email || "U")
                            .charAt(0)
                            .toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                        {user?.name || "User"}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-[#92adc9] truncate">
                        {user?.email}
                      </p>
                    </div>
                  </div>
                </Link>

                {/* Menu items */}
                <div className="p-2 space-y-1">
                  <Link
                    href="/profile"
                    onClick={() => setProfileMenuOpen(false)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-700 dark:text-[#92adc9] hover:bg-slate-100 dark:hover:bg-[#101922] transition-colors"
                  >
                    <span className="material-symbols-outlined text-xl">
                      person
                    </span>
                    <span className="font-medium">View Profile</span>
                  </Link>
                  <Link
                    href="/change-password"
                    onClick={() => setProfileMenuOpen(false)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-700 dark:text-[#92adc9] hover:bg-slate-100 dark:hover:bg-[#101922] transition-colors"
                  >
                    <span className="material-symbols-outlined text-xl">
                      lock
                    </span>
                    <span className="font-medium">Change Password</span>
                  </Link>
                  <button
                    onClick={() => {
                      setProfileMenuOpen(false);
                      handleLogout();
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                  >
                    <span className="material-symbols-outlined text-xl">
                      logout
                    </span>
                    <span className="font-medium">Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </header>
        )}

        {/* Page content with top padding for appbar on mobile/tablet */}
        <main className="lg:pt-0 pt-16">{children}</main>
      </div>
    </div>
  );
}

