"use client";

import { useState, useEffect } from "react";
import CustomSelect from "@/components/common/CustomSelect";
import { User } from "@/app/(main)/accounts/user/page";

interface EditUserModalProps {
  show: boolean;
  user: User | null;
  roles: { id: string; name: string }[];
  onSubmit: (userId: string, roleId: string) => Promise<void>;
  onCancel: () => void;
  submitting: boolean;
}

export default function EditUserModal({
  show,
  user,
  roles,
  onSubmit,
  onCancel,
  submitting,
}: EditUserModalProps) {
  const [formData, setFormData] = useState({
    roleId: "",
  });
  const [formErrors, setFormErrors] = useState({
    roleId: "",
  });

  // Update form data when user changes
  useEffect(() => {
    if (user) {
      setFormData({
        roleId: user.role?.id || "",
      });
      setFormErrors({
        roleId: "",
      });
    }
  }, [user]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement> | { target: { name: string; value: string } }
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = (): boolean => {
    const errors = {
      roleId: "",
    };

    if (!formData.roleId.trim()) {
      errors.roleId = "Role is required";
    }

    setFormErrors(errors);
    return !errors.roleId;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !user) {
      return;
    }

    await onSubmit(user.id, formData.roleId);
  };

  if (!show || !user) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white dark:bg-[#1a232e] rounded-xl shadow-xl border border-slate-200 dark:border-[#324d67] w-full max-w-md">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
              Edit User Role
            </h3>
            <button
              onClick={onCancel}
              className="text-slate-500 dark:text-[#92adc9] hover:text-slate-900 dark:hover:text-white"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          {/* User Info */}
          <div className="mb-6 p-4 bg-slate-50 dark:bg-[#101922] rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 overflow-hidden">
                {user.profilePic ? (
                  <img
                    src={user.profilePic}
                    alt={user.name || user.email}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-primary font-bold">
                    {(user.name || user.email || "U").charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                  {user.name || "No Name"}
                </p>
                <p className="text-xs text-slate-500 dark:text-[#92adc9] truncate">
                  {user.email}
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Role */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 dark:text-white mb-2">
                Role <span className="text-red-500">*</span>
              </label>
              <CustomSelect
                name="roleId"
                value={formData.roleId}
                onChange={handleInputChange}
                options={roles.map((role) => ({
                  value: role.id,
                  label: role.name,
                }))}
                placeholder="Select a role"
                error={formErrors.roleId}
              />
            </div>

            {/* Form Actions */}
            <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-[#324d67]">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 px-4 py-2 rounded-lg border border-slate-300 dark:border-[#324d67] bg-slate-50 dark:bg-[#101922] text-slate-700 dark:text-white hover:bg-slate-100 dark:hover:bg-[#0f172a] transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 px-4 py-2 rounded-lg bg-primary hover:bg-blue-600 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "Updating..." : "Update Role"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

