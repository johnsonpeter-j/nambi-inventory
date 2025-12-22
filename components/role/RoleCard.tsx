"use client";

import { Role } from "./RoleForm";

interface RoleCardProps {
  role: Role;
  onView: (role: Role) => void;
  onEdit: (role: Role) => void;
  onDelete: (id: string) => void;
}

export default function RoleCard({
  role,
  onView,
  onEdit,
  onDelete,
}: RoleCardProps) {
  return (
    <div className="bg-white dark:bg-[#1a232e] rounded-xl shadow-lg dark:shadow-none border border-slate-200 dark:border-[#324d67] p-6 hover:shadow-xl transition-shadow">
      {/* Card Header */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1 truncate overflow-hidden text-ellipsis whitespace-nowrap">
          {role.name}
        </h3>
      </div>

      {/* Card Body */}
      <div className="space-y-3 mb-4">
        {/* Created By */}
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-slate-400 dark:text-[#64748b] text-lg flex-shrink-0">
            person
          </span>
          <div className="flex-1 min-w-0 overflow-hidden">
            <p className="text-xs text-slate-500 dark:text-[#92adc9]">
              Created By
            </p>
            <p className="text-sm font-medium text-slate-900 dark:text-white truncate overflow-hidden text-ellipsis whitespace-nowrap">
              {role.createdByName || role.createdBy}
            </p>
          </div>
        </div>

        {/* Created At */}
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-slate-400 dark:text-[#64748b] text-lg flex-shrink-0">
            calendar_today
          </span>
          <div className="flex-1 min-w-0 overflow-hidden">
            <p className="text-xs text-slate-500 dark:text-[#92adc9]">
              Created On
            </p>
            <p className="text-sm font-medium text-slate-900 dark:text-white truncate overflow-hidden text-ellipsis whitespace-nowrap">
              {new Date(role.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Card Footer - Action Buttons */}
      <div className="flex gap-2 pt-4 border-t border-slate-200 dark:border-[#324d67]">
        <button
          onClick={() => onView(role)}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-slate-300 dark:border-[#324d67] hover:bg-slate-50 dark:hover:bg-[#101922] text-slate-700 dark:text-white transition-colors font-medium"
        >
          <span className="material-symbols-outlined text-lg">visibility</span>
          <span>View</span>
        </button>
        <button
          onClick={() => onEdit(role)}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-primary dark:border-blue-400 hover:bg-primary/10 dark:hover:bg-primary/20 text-primary dark:text-blue-400 transition-colors font-medium"
        >
          <span className="material-symbols-outlined text-lg">edit</span>
          <span>Edit</span>
        </button>
        <button
          onClick={() => onDelete(role.id)}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-red-600 dark:border-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 text-red-600 dark:text-red-400 transition-colors font-medium"
        >
          <span className="material-symbols-outlined text-lg">delete</span>
          <span>Delete</span>
        </button>
      </div>
    </div>
  );
}

