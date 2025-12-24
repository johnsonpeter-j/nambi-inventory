"use client";

import { Role } from "./RoleForm";
import RoleCard from "./RoleCard";

interface RoleListProps {
  roles: Role[];
  loading: boolean;
  onView: (role: Role) => void;
  onEdit: (role: Role) => void;
  onDelete: (id: string) => void;
}

export default function RoleList({
  roles,
  loading,
  onView,
  onEdit,
  onDelete,
}: RoleListProps) {
  if (loading) {
    return (
      <div className="bg-white dark:bg-[#1a232e] rounded-xl shadow-lg dark:shadow-none border border-slate-200 dark:border-[#324d67] p-8 text-center">
        <p className="text-slate-500 dark:text-[#92adc9]">Loading...</p>
      </div>
    );
  }

  if (roles.length === 0) {
    return (
      <div className="bg-white dark:bg-[#1a232e] rounded-xl shadow-lg dark:shadow-none border border-slate-200 dark:border-[#324d67] p-8 text-center">
        <span className="material-symbols-outlined text-6xl text-slate-400 dark:text-[#64748b] mb-4">
          admin_panel_settings
        </span>
        <p className="text-slate-500 dark:text-[#92adc9] text-lg mb-2">
          No roles found
        </p>
        <p className="text-slate-400 dark:text-[#64748b] text-sm">
          Click "Add Role" to create your first role
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {roles.map((role) => (
        <RoleCard
          key={role.id}
          role={role}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}


