"use client";

import { User } from "@/app/(main)/accounts/user/page";

interface UserListProps {
  users: User[];
  loading: boolean;
  onInviteAgain: (email: string) => void;
  onDelete: (id: string) => void;
}

export default function UserList({
  users,
  loading,
  onInviteAgain,
  onDelete,
}: UserListProps) {
  if (loading) {
    return (
      <div className="bg-white dark:bg-[#1a232e] rounded-xl shadow-lg dark:shadow-none border border-slate-200 dark:border-[#324d67] p-8 text-center">
        <p className="text-slate-500 dark:text-[#92adc9]">Loading...</p>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="bg-white dark:bg-[#1a232e] rounded-xl shadow-lg dark:shadow-none border border-slate-200 dark:border-[#324d67] p-8 text-center">
        <span className="material-symbols-outlined text-6xl text-slate-400 dark:text-[#64748b] mb-4">
          person
        </span>
        <p className="text-slate-500 dark:text-[#92adc9] text-lg mb-2">
          No users found
        </p>
        <p className="text-slate-400 dark:text-[#64748b] text-sm">
          Click "Invite User" to invite your first user
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {users.map((user) => (
        <div
          key={user.id}
          className="bg-white dark:bg-[#1a232e] rounded-xl shadow-lg dark:shadow-none border border-slate-200 dark:border-[#324d67] p-6 hover:shadow-xl transition-shadow"
        >
          {/* User Info */}
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 overflow-hidden">
              {user.profilePic ? (
                <img
                  src={user.profilePic}
                  alt={user.name || user.email}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="text-primary font-bold text-lg">
                  {(user.name || user.email || "U").charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white truncate">
                {user.name || "No Name"}
              </h3>
              <p className="text-sm text-slate-500 dark:text-[#92adc9] truncate">
                {user.email}
              </p>
            </div>
          </div>

          {/* Role */}
          {user.role && (
            <div className="mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-slate-400 dark:text-[#64748b] text-lg">
                  admin_panel_settings
                </span>
                <span className="text-sm text-slate-700 dark:text-[#92adc9]">
                  {user.role.name}
                </span>
              </div>
            </div>
          )}

          {/* Invited On */}
          <div className="mb-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-slate-400 dark:text-[#64748b] text-lg">
                calendar_today
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-500 dark:text-[#92adc9]">
                  Invited On
                </p>
                <p className="text-sm font-medium text-slate-900 dark:text-white">
                  {new Date(user.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4 border-t border-slate-200 dark:border-[#324d67]">
            <button
              onClick={() => onInviteAgain(user.email)}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-primary dark:border-blue-400 hover:bg-primary/10 dark:hover:bg-primary/20 text-primary dark:text-blue-400 transition-colors font-medium"
            >
              <span className="material-symbols-outlined text-lg">mail</span>
              <span>Invite Again</span>
            </button>
            <button
              onClick={() => onDelete(user.id)}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-red-600 dark:border-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 text-red-600 dark:text-red-400 transition-colors font-medium"
            >
              <span className="material-symbols-outlined text-lg">delete</span>
              <span>Delete</span>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

