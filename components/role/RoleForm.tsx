"use client";

import { useState, useEffect } from "react";
import { IRolePermissions } from "@/models/Role";

export interface Role {
  id: string;
  name: string;
  permissions: IRolePermissions;
  createdBy: string;
  createdByName?: string;
  createdAt: string;
  updatedAt: string;
}

interface RoleFormProps {
  show: boolean;
  editingRole: Role | null;
  onSubmit: (data: {
    name: string;
    permissions: IRolePermissions;
  }) => Promise<void>;
  onCancel: () => void;
  submitting: boolean;
}

export default function RoleForm({
  show,
  editingRole,
  onSubmit,
  onCancel,
  submitting,
}: RoleFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    permissions: {
      dashboard: { view: false },
      inEntry: { create: false },
      outEntry: { create: false },
      master: {
        category: { view: false, create: false, edit: false, delete: false },
        party: { view: false, create: false, edit: false, delete: false },
      },
      accounts: {
        user: { view: false, create: false, edit: false, delete: false },
        role: { view: false, create: false, edit: false, delete: false },
      },
    } as IRolePermissions,
  });

  const [expandedSections, setExpandedSections] = useState<{
    master: boolean;
    accounts: boolean;
  }>({
    master: false,
    accounts: false,
  });

  const [formErrors, setFormErrors] = useState({ name: "" });

  // Update form data when editing
  useEffect(() => {
    if (editingRole) {
      setFormData({
        name: editingRole.name,
        permissions: editingRole.permissions || {
          dashboard: { view: false },
          inEntry: { create: false },
          outEntry: { create: false },
          master: {
            category: { create: false, edit: false, delete: false },
            party: { create: false, edit: false, delete: false },
          },
          accounts: {
            user: { create: false, edit: false, delete: false },
            role: { create: false, edit: false, delete: false },
          },
        },
      });
    } else {
      setFormData({
        name: "",
        permissions: {
          dashboard: { view: false },
          inEntry: { create: false },
          outEntry: { create: false },
          master: {
            category: { create: false, edit: false, delete: false },
            party: { create: false, edit: false, delete: false },
          },
          accounts: {
            user: { create: false, edit: false, delete: false },
            role: { create: false, edit: false, delete: false },
          },
        },
      });
    }
    setFormErrors({ name: "" });
  }, [editingRole, show]);

  // Handle name input change
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      name: e.target.value,
    }));
    if (formErrors.name) {
      setFormErrors({ name: "" });
    }
  };

  // Handle permission checkbox change
  const handlePermissionChange = (
    path: string[],
    value: boolean
  ) => {
    setFormData((prev) => {
      const newPermissions = { ...prev.permissions };
      let current: any = newPermissions;

      // Navigate to the nested property
      for (let i = 0; i < path.length - 1; i++) {
        if (!current[path[i]]) {
          current[path[i]] = {};
        }
        current = current[path[i]];
      }

      // Set the final value
      current[path[path.length - 1]] = value;

      return {
        ...prev,
        permissions: newPermissions,
      };
    });
  };

  // Toggle accordion section
  const toggleSection = (section: "master" | "accounts") => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Check if all permissions are selected for a section
  const areAllSelected = (path: string[]) => {
    const permissions = formData.permissions;
    let current: any = permissions;
    
    for (const key of path) {
      current = current?.[key];
      if (!current) return false;
    }
    
    // Check if all four permissions are true
    return (
      current.view === true &&
      current.create === true &&
      current.edit === true &&
      current.delete === true
    );
  };

  // Toggle all permissions for a section
  const toggleAllPermissions = (path: string[], value: boolean) => {
    setFormData((prev) => {
      const newPermissions = { ...prev.permissions };
      let current: any = newPermissions;

      // Navigate to the nested property
      for (let i = 0; i < path.length; i++) {
        if (!current[path[i]]) {
          current[path[i]] = {};
        }
        current = current[path[i]];
      }

      // Set all permissions
      current.view = value;
      current.create = value;
      current.edit = value;
      current.delete = value;

      return {
        ...prev,
        permissions: newPermissions,
      };
    });
  };

  // Validate form
  const validateForm = (): boolean => {
    const errors = { name: "" };

    if (!formData.name.trim()) {
      errors.name = "Name is required";
    }

    setFormErrors(errors);
    return !errors.name;
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    await onSubmit({
      name: formData.name.trim(),
      permissions: formData.permissions,
    });
  };

  if (!show) return null;

  const isAdminRole = editingRole?.name === "Admin";

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-[#1a232e] rounded-xl shadow-xl border border-slate-200 dark:border-[#324d67] w-full max-w-2xl my-8 max-h-[90vh] flex flex-col">
        {/* Sticky Header */}
        <div className="sticky top-0 bg-white dark:bg-[#1a232e] border-b border-slate-200 dark:border-[#324d67] px-6 py-4 rounded-t-xl z-10">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              {editingRole ? "Edit Role" : "Add New Role"}
            </h2>
            <button
              type="button"
              onClick={onCancel}
              className="text-slate-500 dark:text-[#92adc9] hover:text-slate-900 dark:hover:text-white transition-colors p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-[#101922]"
            >
              <span className="material-symbols-outlined text-2xl">close</span>
            </button>
          </div>
          {isAdminRole && (
            <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
              <p className="text-sm text-amber-800 dark:text-amber-200 flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">info</span>
                This is a protected system role and cannot be edited.
              </p>
            </div>
          )}
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            <form onSubmit={handleSubmit} >
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-white ">
                Role Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={handleNameChange}
                disabled={isAdminRole}
                className={`w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-[#324d67] bg-slate-50 dark:bg-[#101922] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary ${
                  isAdminRole ? "opacity-60 cursor-not-allowed" : ""
                }`}
                placeholder="Enter role name"
              />
              <div className="min-h-[20px]">
                {formErrors.name && (
                  <p className="text-sm text-red-500 dark:text-red-400 mt-1">
                    {formErrors.name}
                  </p>
                )}
              </div>
            </div>

            {/* Permissions Section */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-white mb-4">
                Permissions
              </label>

              <div className="space-y-3">
                {/* Dashboard */}
                <div className="border border-slate-200 dark:border-[#324d67] rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-slate-900 dark:text-white">
                      Dashboard
                    </h3>
                  </div>
                  <div className="space-y-2">
                    <label className={`flex items-center gap-2 ${isAdminRole ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}>
                      <input
                        type="checkbox"
                        checked={formData.permissions.dashboard?.view || false}
                        onChange={(e) =>
                          handlePermissionChange(["dashboard", "view"], e.target.checked)
                        }
                        disabled={isAdminRole}
                        className="w-4 h-4 rounded border-slate-300 dark:border-[#324d67] text-primary focus:ring-primary"
                      />
                      <span className="text-sm text-slate-700 dark:text-[#92adc9]">
                        View
                      </span>
                    </label>
                  </div>
                </div>

                {/* In Entry */}
                <div className="border border-slate-200 dark:border-[#324d67] rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-slate-900 dark:text-white">
                      In Entry
                    </h3>
                  </div>
                  <div className="space-y-2">
                    <label className={`flex items-center gap-2 ${isAdminRole ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}>
                      <input
                        type="checkbox"
                        checked={formData.permissions.inEntry?.create || false}
                        onChange={(e) =>
                          handlePermissionChange(["inEntry", "create"], e.target.checked)
                        }
                        disabled={isAdminRole}
                        className="w-4 h-4 rounded border-slate-300 dark:border-[#324d67] text-primary focus:ring-primary"
                      />
                      <span className="text-sm text-slate-700 dark:text-[#92adc9]">
                        Create
                      </span>
                    </label>
                  </div>
                </div>

                {/* Ex Entry */}
                <div className="border border-slate-200 dark:border-[#324d67] rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-slate-900 dark:text-white">
                      Ex Entry
                    </h3>
                  </div>
                  <div className="space-y-2">
                    <label className={`flex items-center gap-2 ${isAdminRole ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}>
                      <input
                        type="checkbox"
                        checked={formData.permissions.outEntry?.create || false}
                        onChange={(e) =>
                          handlePermissionChange(["outEntry", "create"], e.target.checked)
                        }
                        disabled={isAdminRole}
                        className="w-4 h-4 rounded border-slate-300 dark:border-[#324d67] text-primary focus:ring-primary"
                      />
                      <span className="text-sm text-slate-700 dark:text-[#92adc9]">
                        Create
                      </span>
                    </label>
                  </div>
                </div>

                {/* Master Accordion */}
                <div className="border border-slate-200 dark:border-[#324d67] rounded-lg overflow-hidden">
                  <button
                    type="button"
                    onClick={() => toggleSection("master")}
                    className="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-[#101922] transition-colors"
                  >
                    <h3 className="font-medium text-slate-900 dark:text-white">
                      Master
                    </h3>
                    <span
                      className={`material-symbols-outlined transition-transform ${
                        expandedSections.master ? "rotate-90" : ""
                      }`}
                    >
                      chevron_right
                    </span>
                  </button>
                  {expandedSections.master && (
                    <div className="p-4 space-y-4 border-t border-slate-200 dark:border-[#324d67]">
                      {/* Category Accordion */}
                      <div className="border border-slate-200 dark:border-[#324d67] rounded-lg overflow-hidden">
                        <div className="p-3 bg-slate-50 dark:bg-[#101922] flex items-center justify-between">
                          <h4 className="font-medium text-slate-900 dark:text-white text-sm">
                            Category
                          </h4>
                          <label className={`flex items-center gap-2 ${isAdminRole ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}>
                            <span className="text-xs text-slate-600 dark:text-[#92adc9]">
                              Select All
                            </span>
                            <input
                              type="checkbox"
                              checked={areAllSelected(["master", "category"])}
                              onChange={(e) =>
                                toggleAllPermissions(
                                  ["master", "category"],
                                  e.target.checked
                                )
                              }
                              disabled={isAdminRole}
                              className="w-4 h-4 rounded border-slate-300 dark:border-[#324d67] text-primary focus:ring-primary"
                            />
                          </label>
                        </div>
                        <div className="p-3 space-y-2">
                          <label className={`flex items-center gap-2 ${isAdminRole ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}>
                            <input
                              type="checkbox"
                              checked={
                                formData.permissions.master?.category?.view || false
                              }
                              onChange={(e) =>
                                handlePermissionChange(
                                  ["master", "category", "view"],
                                  e.target.checked
                                )
                              }
                              disabled={isAdminRole}
                              className="w-4 h-4 rounded border-slate-300 dark:border-[#324d67] text-primary focus:ring-primary"
                            />
                            <span className="text-sm text-slate-700 dark:text-[#92adc9]">
                              View
                            </span>
                          </label>
                          <label className={`flex items-center gap-2 ${isAdminRole ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}>
                            <input
                              type="checkbox"
                              checked={
                                formData.permissions.master?.category?.create || false
                              }
                              onChange={(e) =>
                                handlePermissionChange(
                                  ["master", "category", "create"],
                                  e.target.checked
                                )
                              }
                              disabled={isAdminRole}
                              className="w-4 h-4 rounded border-slate-300 dark:border-[#324d67] text-primary focus:ring-primary"
                            />
                            <span className="text-sm text-slate-700 dark:text-[#92adc9]">
                              Create
                            </span>
                          </label>
                          <label className={`flex items-center gap-2 ${isAdminRole ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}>
                            <input
                              type="checkbox"
                              checked={
                                formData.permissions.master?.category?.edit || false
                              }
                              onChange={(e) =>
                                handlePermissionChange(
                                  ["master", "category", "edit"],
                                  e.target.checked
                                )
                              }
                              disabled={isAdminRole}
                              className="w-4 h-4 rounded border-slate-300 dark:border-[#324d67] text-primary focus:ring-primary"
                            />
                            <span className="text-sm text-slate-700 dark:text-[#92adc9]">
                              Edit
                            </span>
                          </label>
                          <label className={`flex items-center gap-2 ${isAdminRole ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}>
                            <input
                              type="checkbox"
                              checked={
                                formData.permissions.master?.category?.delete || false
                              }
                              onChange={(e) =>
                                handlePermissionChange(
                                  ["master", "category", "delete"],
                                  e.target.checked
                                )
                              }
                              disabled={isAdminRole}
                              className="w-4 h-4 rounded border-slate-300 dark:border-[#324d67] text-primary focus:ring-primary"
                            />
                            <span className="text-sm text-slate-700 dark:text-[#92adc9]">
                              Delete
                            </span>
                          </label>
                        </div>
                      </div>

                      {/* Party Accordion */}
                      <div className="border border-slate-200 dark:border-[#324d67] rounded-lg overflow-hidden">
                        <div className="p-3 bg-slate-50 dark:bg-[#101922] flex items-center justify-between">
                          <h4 className="font-medium text-slate-900 dark:text-white text-sm">
                            Party
                          </h4>
                          <label className={`flex items-center gap-2 ${isAdminRole ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}>
                            <span className="text-xs text-slate-600 dark:text-[#92adc9]">
                              Select All
                            </span>
                            <input
                              type="checkbox"
                              checked={areAllSelected(["master", "party"])}
                              onChange={(e) =>
                                toggleAllPermissions(
                                  ["master", "party"],
                                  e.target.checked
                                )
                              }
                              disabled={isAdminRole}
                              className="w-4 h-4 rounded border-slate-300 dark:border-[#324d67] text-primary focus:ring-primary"
                            />
                          </label>
                        </div>
                        <div className="p-3 space-y-2">
                          <label className={`flex items-center gap-2 ${isAdminRole ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}>
                            <input
                              type="checkbox"
                              checked={
                                formData.permissions.master?.party?.view || false
                              }
                              onChange={(e) =>
                                handlePermissionChange(
                                  ["master", "party", "view"],
                                  e.target.checked
                                )
                              }
                              disabled={isAdminRole}
                              className="w-4 h-4 rounded border-slate-300 dark:border-[#324d67] text-primary focus:ring-primary"
                            />
                            <span className="text-sm text-slate-700 dark:text-[#92adc9]">
                              View
                            </span>
                          </label>
                          <label className={`flex items-center gap-2 ${isAdminRole ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}>
                            <input
                              type="checkbox"
                              checked={
                                formData.permissions.master?.party?.create || false
                              }
                              onChange={(e) =>
                                handlePermissionChange(
                                  ["master", "party", "create"],
                                  e.target.checked
                                )
                              }
                              disabled={isAdminRole}
                              className="w-4 h-4 rounded border-slate-300 dark:border-[#324d67] text-primary focus:ring-primary"
                            />
                            <span className="text-sm text-slate-700 dark:text-[#92adc9]">
                              Create
                            </span>
                          </label>
                          <label className={`flex items-center gap-2 ${isAdminRole ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}>
                            <input
                              type="checkbox"
                              checked={
                                formData.permissions.master?.party?.edit || false
                              }
                              onChange={(e) =>
                                handlePermissionChange(
                                  ["master", "party", "edit"],
                                  e.target.checked
                                )
                              }
                              disabled={isAdminRole}
                              className="w-4 h-4 rounded border-slate-300 dark:border-[#324d67] text-primary focus:ring-primary"
                            />
                            <span className="text-sm text-slate-700 dark:text-[#92adc9]">
                              Edit
                            </span>
                          </label>
                          <label className={`flex items-center gap-2 ${isAdminRole ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}>
                            <input
                              type="checkbox"
                              checked={
                                formData.permissions.master?.party?.delete || false
                              }
                              onChange={(e) =>
                                handlePermissionChange(
                                  ["master", "party", "delete"],
                                  e.target.checked
                                )
                              }
                              disabled={isAdminRole}
                              className="w-4 h-4 rounded border-slate-300 dark:border-[#324d67] text-primary focus:ring-primary"
                            />
                            <span className="text-sm text-slate-700 dark:text-[#92adc9]">
                              Delete
                            </span>
                          </label>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Accounts Accordion */}
                <div className="border border-slate-200 dark:border-[#324d67] rounded-lg overflow-hidden">
                  <button
                    type="button"
                    onClick={() => toggleSection("accounts")}
                    className="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-[#101922] transition-colors"
                  >
                    <h3 className="font-medium text-slate-900 dark:text-white">
                      Account
                    </h3>
                    <span
                      className={`material-symbols-outlined transition-transform ${
                        expandedSections.accounts ? "rotate-90" : ""
                      }`}
                    >
                      chevron_right
                    </span>
                  </button>
                  {expandedSections.accounts && (
                    <div className="p-4  space-y-4 border-t border-slate-200 dark:border-[#324d67]">
                      {/* User Accordion */}
                      <div className="border border-slate-200 dark:border-[#324d67] rounded-lg overflow-hidden">
                        <div className="p-3 bg-slate-50 dark:bg-[#101922] flex items-center justify-between">
                          <h4 className="font-medium text-slate-900 dark:text-white text-sm">
                            User
                          </h4>
                          <label className={`flex items-center gap-2 ${isAdminRole ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}>
                            <span className="text-xs text-slate-600 dark:text-[#92adc9]">
                              Select All
                            </span>
                            <input
                              type="checkbox"
                              checked={areAllSelected(["accounts", "user"])}
                              onChange={(e) =>
                                toggleAllPermissions(
                                  ["accounts", "user"],
                                  e.target.checked
                                )
                              }
                              disabled={isAdminRole}
                              className="w-4 h-4 rounded border-slate-300 dark:border-[#324d67] text-primary focus:ring-primary"
                            />
                          </label>
                        </div>
                        <div className="p-3 space-y-2">
                          <label className={`flex items-center gap-2 ${isAdminRole ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}>
                            <input
                              type="checkbox"
                              checked={
                                formData.permissions.accounts?.user?.view || false
                              }
                              onChange={(e) =>
                                handlePermissionChange(
                                  ["accounts", "user", "view"],
                                  e.target.checked
                                )
                              }
                              disabled={isAdminRole}
                              className="w-4 h-4 rounded border-slate-300 dark:border-[#324d67] text-primary focus:ring-primary"
                            />
                            <span className="text-sm text-slate-700 dark:text-[#92adc9]">
                              View
                            </span>
                          </label>
                          <label className={`flex items-center gap-2 ${isAdminRole ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}>
                            <input
                              type="checkbox"
                              checked={
                                formData.permissions.accounts?.user?.create || false
                              }
                              onChange={(e) =>
                                handlePermissionChange(
                                  ["accounts", "user", "create"],
                                  e.target.checked
                                )
                              }
                              disabled={isAdminRole}
                              className="w-4 h-4 rounded border-slate-300 dark:border-[#324d67] text-primary focus:ring-primary"
                            />
                            <span className="text-sm text-slate-700 dark:text-[#92adc9]">
                              Create
                            </span>
                          </label>
                          <label className={`flex items-center gap-2 ${isAdminRole ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}>
                            <input
                              type="checkbox"
                              checked={
                                formData.permissions.accounts?.user?.edit || false
                              }
                              onChange={(e) =>
                                handlePermissionChange(
                                  ["accounts", "user", "edit"],
                                  e.target.checked
                                )
                              }
                              disabled={isAdminRole}
                              className="w-4 h-4 rounded border-slate-300 dark:border-[#324d67] text-primary focus:ring-primary"
                            />
                            <span className="text-sm text-slate-700 dark:text-[#92adc9]">
                              Edit
                            </span>
                          </label>
                          <label className={`flex items-center gap-2 ${isAdminRole ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}>
                            <input
                              type="checkbox"
                              checked={
                                formData.permissions.accounts?.user?.delete || false
                              }
                              onChange={(e) =>
                                handlePermissionChange(
                                  ["accounts", "user", "delete"],
                                  e.target.checked
                                )
                              }
                              disabled={isAdminRole}
                              className="w-4 h-4 rounded border-slate-300 dark:border-[#324d67] text-primary focus:ring-primary"
                            />
                            <span className="text-sm text-slate-700 dark:text-[#92adc9]">
                              Delete
                            </span>
                          </label>
                        </div>
                      </div>

                      {/* Role Accordion */}
                      <div className="border border-slate-200 dark:border-[#324d67] rounded-lg overflow-hidden">
                        <div className="p-3 bg-slate-50 dark:bg-[#101922] flex items-center justify-between">
                          <h4 className="font-medium text-slate-900 dark:text-white text-sm">
                            Role
                          </h4>
                          <label className={`flex items-center gap-2 ${isAdminRole ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}>
                            <span className="text-xs text-slate-600 dark:text-[#92adc9]">
                              Select All
                            </span>
                            <input
                              type="checkbox"
                              checked={areAllSelected(["accounts", "role"])}
                              onChange={(e) =>
                                toggleAllPermissions(
                                  ["accounts", "role"],
                                  e.target.checked
                                )
                              }
                              disabled={isAdminRole}
                              className="w-4 h-4 rounded border-slate-300 dark:border-[#324d67] text-primary focus:ring-primary"
                            />
                          </label>
                        </div>
                        <div className="p-3 space-y-2">
                          <label className={`flex items-center gap-2 ${isAdminRole ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}>
                            <input
                              type="checkbox"
                              checked={
                                formData.permissions.accounts?.role?.view || false
                              }
                              onChange={(e) =>
                                handlePermissionChange(
                                  ["accounts", "role", "view"],
                                  e.target.checked
                                )
                              }
                              disabled={isAdminRole}
                              className="w-4 h-4 rounded border-slate-300 dark:border-[#324d67] text-primary focus:ring-primary"
                            />
                            <span className="text-sm text-slate-700 dark:text-[#92adc9]">
                              View
                            </span>
                          </label>
                          <label className={`flex items-center gap-2 ${isAdminRole ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}>
                            <input
                              type="checkbox"
                              checked={
                                formData.permissions.accounts?.role?.create || false
                              }
                              onChange={(e) =>
                                handlePermissionChange(
                                  ["accounts", "role", "create"],
                                  e.target.checked
                                )
                              }
                              disabled={isAdminRole}
                              className="w-4 h-4 rounded border-slate-300 dark:border-[#324d67] text-primary focus:ring-primary"
                            />
                            <span className="text-sm text-slate-700 dark:text-[#92adc9]">
                              Create
                            </span>
                          </label>
                          <label className={`flex items-center gap-2 ${isAdminRole ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}>
                            <input
                              type="checkbox"
                              checked={
                                formData.permissions.accounts?.role?.edit || false
                              }
                              onChange={(e) =>
                                handlePermissionChange(
                                  ["accounts", "role", "edit"],
                                  e.target.checked
                                )
                              }
                              disabled={isAdminRole}
                              className="w-4 h-4 rounded border-slate-300 dark:border-[#324d67] text-primary focus:ring-primary"
                            />
                            <span className="text-sm text-slate-700 dark:text-[#92adc9]">
                              Edit
                            </span>
                          </label>
                          <label className={`flex items-center gap-2 ${isAdminRole ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}>
                            <input
                              type="checkbox"
                              checked={
                                formData.permissions.accounts?.role?.delete || false
                              }
                              onChange={(e) =>
                                handlePermissionChange(
                                  ["accounts", "role", "delete"],
                                  e.target.checked
                                )
                              }
                              disabled={isAdminRole}
                              className="w-4 h-4 rounded border-slate-300 dark:border-[#324d67] text-primary focus:ring-primary"
                            />
                            <span className="text-sm text-slate-700 dark:text-[#92adc9]">
                              Delete
                            </span>
                          </label>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 px-4 py-2 rounded-lg border border-slate-300 dark:border-[#324d67] bg-slate-50 dark:bg-[#101922] text-slate-700 dark:text-white hover:bg-slate-100 dark:hover:bg-[#0f172a] transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || isAdminRole}
                className="flex-1 px-4 py-2 rounded-lg bg-primary hover:bg-blue-600 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting
                  ? "Saving..."
                  : editingRole
                  ? "Update"
                  : "Create"}
              </button>
            </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

