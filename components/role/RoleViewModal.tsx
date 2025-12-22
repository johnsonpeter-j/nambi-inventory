"use client";

import { Role } from "./RoleForm";
import { IRolePermissions } from "@/models/Role";

interface RoleViewModalProps {
  show: boolean;
  role: Role | null;
  onClose: () => void;
}

export default function RoleViewModal({
  show,
  role,
  onClose,
}: RoleViewModalProps) {
  if (!show || !role) return null;

  const permissions = role.permissions || {};

  const renderPermissionValue = (value: boolean | undefined) => {
    return value ? (
      <span className="text-green-600 dark:text-green-400 font-medium">Yes</span>
    ) : (
      <span className="text-slate-400 dark:text-[#64748b]">No</span>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-[#1a232e] rounded-xl shadow-xl border border-slate-200 dark:border-[#324d67] w-full max-w-2xl my-8 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Role Details
            </h2>
            <button
              onClick={onClose}
              className="text-slate-500 dark:text-[#92adc9] hover:text-slate-900 dark:hover:text-white"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          {/* Role Info */}
          <div className="mb-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-500 dark:text-[#92adc9] mb-1">
                Role Name
              </label>
              <p className="text-lg font-semibold text-slate-900 dark:text-white">
                {role.name}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-500 dark:text-[#92adc9] mb-1">
                Created By
              </label>
              <p className="text-slate-900 dark:text-white">
                {role.createdByName || role.createdBy}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-500 dark:text-[#92adc9] mb-1">
                Created On
              </label>
              <p className="text-slate-900 dark:text-white">
                {new Date(role.createdAt).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Permissions */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Permissions
            </h3>

            <div className="space-y-4">
              {/* Dashboard */}
              <div className="border border-slate-200 dark:border-[#324d67] rounded-lg p-4">
                <h4 className="font-medium text-slate-900 dark:text-white mb-2">
                  Dashboard
                </h4>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-700 dark:text-[#92adc9]">
                    View
                  </span>
                  {renderPermissionValue(permissions.dashboard?.view)}
                </div>
              </div>

              {/* In Entry */}
              <div className="border border-slate-200 dark:border-[#324d67] rounded-lg p-4">
                <h4 className="font-medium text-slate-900 dark:text-white mb-2">
                  In Entry
                </h4>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-700 dark:text-[#92adc9]">
                    Create
                  </span>
                  {renderPermissionValue(permissions.inEntry?.create)}
                </div>
              </div>

              {/* Ex Entry */}
              <div className="border border-slate-200 dark:border-[#324d67] rounded-lg p-4">
                <h4 className="font-medium text-slate-900 dark:text-white mb-2">
                  Ex Entry
                </h4>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-700 dark:text-[#92adc9]">
                    Create
                  </span>
                  {renderPermissionValue(permissions.outEntry?.create)}
                </div>
              </div>

              {/* Master */}
              <div className="border border-slate-200 dark:border-[#324d67] rounded-lg p-4">
                <h4 className="font-medium text-slate-900 dark:text-white mb-3">
                  Master
                </h4>
                <div className="space-y-3 pl-4 border-l-2 border-slate-200 dark:border-[#324d67]">
                  {/* Category */}
                  <div>
                    <h5 className="font-medium text-slate-900 dark:text-white text-sm mb-2">
                      Category
                    </h5>
                    <div className="space-y-1 pl-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-700 dark:text-[#92adc9]">
                          View
                        </span>
                        {renderPermissionValue(
                          permissions.master?.category?.view
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-700 dark:text-[#92adc9]">
                          Create
                        </span>
                        {renderPermissionValue(
                          permissions.master?.category?.create
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-700 dark:text-[#92adc9]">
                          Edit
                        </span>
                        {renderPermissionValue(
                          permissions.master?.category?.edit
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-700 dark:text-[#92adc9]">
                          Delete
                        </span>
                        {renderPermissionValue(
                          permissions.master?.category?.delete
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Party */}
                  <div>
                    <h5 className="font-medium text-slate-900 dark:text-white text-sm mb-2">
                      Party
                    </h5>
                    <div className="space-y-1 pl-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-700 dark:text-[#92adc9]">
                          View
                        </span>
                        {renderPermissionValue(permissions.master?.party?.view)}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-700 dark:text-[#92adc9]">
                          Create
                        </span>
                        {renderPermissionValue(permissions.master?.party?.create)}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-700 dark:text-[#92adc9]">
                          Edit
                        </span>
                        {renderPermissionValue(permissions.master?.party?.edit)}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-700 dark:text-[#92adc9]">
                          Delete
                        </span>
                        {renderPermissionValue(
                          permissions.master?.party?.delete
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Accounts */}
              <div className="border border-slate-200 dark:border-[#324d67] rounded-lg p-4">
                <h4 className="font-medium text-slate-900 dark:text-white mb-3">
                  Account
                </h4>
                <div className="space-y-3 pl-4 border-l-2 border-slate-200 dark:border-[#324d67]">
                  {/* User */}
                  <div>
                    <h5 className="font-medium text-slate-900 dark:text-white text-sm mb-2">
                      User
                    </h5>
                    <div className="space-y-1 pl-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-700 dark:text-[#92adc9]">
                          View
                        </span>
                        {renderPermissionValue(
                          permissions.accounts?.user?.view
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-700 dark:text-[#92adc9]">
                          Create
                        </span>
                        {renderPermissionValue(
                          permissions.accounts?.user?.create
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-700 dark:text-[#92adc9]">
                          Edit
                        </span>
                        {renderPermissionValue(permissions.accounts?.user?.edit)}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-700 dark:text-[#92adc9]">
                          Delete
                        </span>
                        {renderPermissionValue(
                          permissions.accounts?.user?.delete
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Role */}
                  <div>
                    <h5 className="font-medium text-slate-900 dark:text-white text-sm mb-2">
                      Role
                    </h5>
                    <div className="space-y-1 pl-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-700 dark:text-[#92adc9]">
                          View
                        </span>
                        {renderPermissionValue(
                          permissions.accounts?.role?.view
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-700 dark:text-[#92adc9]">
                          Create
                        </span>
                        {renderPermissionValue(
                          permissions.accounts?.role?.create
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-700 dark:text-[#92adc9]">
                          Edit
                        </span>
                        {renderPermissionValue(permissions.accounts?.role?.edit)}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-700 dark:text-[#92adc9]">
                          Delete
                        </span>
                        {renderPermissionValue(
                          permissions.accounts?.role?.delete
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Close Button */}
          <div className="mt-6 pt-4 border-t border-slate-200 dark:border-[#324d67]">
            <button
              onClick={onClose}
              className="w-full px-4 py-2 rounded-lg bg-primary hover:bg-blue-600 text-white font-medium transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

