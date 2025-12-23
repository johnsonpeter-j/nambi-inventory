"use client";

import { User } from "@/app/(main)/accounts/user/page";

interface UserListProps {
  users: User[];
  loading: boolean;
  onInviteAgain: (email: string) => void;
  onEdit: (user: User) => void;
  onDelete: (id: string) => void;
  onRecover: (id: string) => void;
}

export default function UserList({
  users,
  loading,
  onInviteAgain,
  onEdit,
  onDelete,
  onRecover,
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
          className={`bg-white dark:bg-[#1a232e] rounded-xl shadow-lg dark:shadow-none border p-6 hover:shadow-xl transition-shadow ${
            user.isDeleted
              ? "border-orange-300 dark:border-orange-700 opacity-75"
              : "border-slate-200 dark:border-[#324d67]"
          }`}
        >
          {/* Deleted Badge */}
          {user.isDeleted && (
            <div className="mb-4 px-3 py-1.5 bg-orange-100 dark:bg-orange-900/30 border border-orange-300 dark:border-orange-700 rounded-lg">
              <p className="text-xs font-medium text-orange-700 dark:text-orange-300 flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">delete</span>
                Deleted User
              </p>
            </div>
          )}
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
          <div className="mb-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-slate-400 dark:text-[#64748b] text-lg">
                admin_panel_settings
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-500 dark:text-[#92adc9]">
                  Role
                </p>
                <p className="text-sm font-medium text-slate-900 dark:text-white">
                  {user.role?.name || "No Role"}
                </p>
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="mb-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-slate-400 dark:text-[#64748b] text-lg">
                {user.status === "joined" ? "check_circle" : "mail"}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-500 dark:text-[#92adc9]">
                  Status
                </p>
                <p className="text-sm font-medium text-slate-900 dark:text-white capitalize">
                  {user.status === "joined" ? "Joined" : "Invited"}
                </p>
              </div>
            </div>
          </div>

          {/* Date */}
          <div className="mb-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-slate-400 dark:text-[#64748b] text-lg">
                {user.status === "joined" ? "event" : "schedule"}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-500 dark:text-[#92adc9]">
                  {user.status === "joined" ? "Joined on" : "Invited on"}
                </p>
                <p className="text-sm font-medium text-slate-900 dark:text-white">
                  {user.status === "joined" && user.updatedAt
                    ? new Date(user.updatedAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })
                    : user.createdAt
                    ? new Date(user.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })
                    : "N/A"}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4 border-t border-slate-200 dark:border-[#324d67]">
            {user.isDeleted ? (
              // Recover button for deleted users
              <button
                onClick={() => onRecover(user.id)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-green-600 dark:border-green-400 hover:bg-green-50 dark:hover:bg-green-500/10 text-green-600 dark:text-green-400 transition-colors font-medium"
              >
                <span className="material-symbols-outlined text-lg">restore</span>
                <span className="hidden lg:inline">Recover</span>
              </button>
            ) : (
              <>
                <button
                  onClick={() => onEdit(user)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-slate-300 dark:border-[#324d67] hover:bg-slate-100 dark:hover:bg-[#101922] text-slate-700 dark:text-white transition-colors font-medium"
                >
                  <span className="material-symbols-outlined text-lg">edit</span>
                  <span className="hidden lg:inline">Edit</span>
                </button>
                {user.status !== "joined" && (
                  <button
                    onClick={() => onInviteAgain(user.email)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-primary dark:border-blue-400 hover:bg-primary/10 dark:hover:bg-primary/20 text-primary dark:text-blue-400 transition-colors font-medium"
                  >
                    <span className="material-symbols-outlined text-lg">mail</span>
                    <span className="hidden lg:inline">Invite</span>
                  </button>
                )}
                <button
                  onClick={() => onDelete(user.id)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-red-600 dark:border-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 text-red-600 dark:text-red-400 transition-colors font-medium"
                >
                  <span className="material-symbols-outlined text-lg">delete</span>
                  <span className="hidden lg:inline">Delete</span>
                </button>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

