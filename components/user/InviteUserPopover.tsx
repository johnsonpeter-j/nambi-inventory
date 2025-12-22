"use client";

import { useState } from "react";

interface InviteUserPopoverProps {
  roles: { id: string; name: string }[];
  onSubmit: (data: { email: string; roleId: string }) => Promise<void>;
  onCancel: () => void;
  submitting: boolean;
}

export default function InviteUserPopover({
  roles,
  onSubmit,
  onCancel,
  submitting,
}: InviteUserPopoverProps) {
  const [formData, setFormData] = useState({
    email: "",
    roleId: "",
  });
  const [formErrors, setFormErrors] = useState({
    email: "",
    roleId: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
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
      email: "",
      roleId: "",
    };

    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else {
      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        errors.email = "Invalid email format";
      }
    }

    setFormErrors(errors);
    return !errors.email;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    await onSubmit({
      email: formData.email.trim(),
      roleId: formData.roleId,
    });

    // Reset form
    setFormData({ email: "", roleId: "" });
    setFormErrors({ email: "", roleId: "" });
  };

  return (
    <div
      data-invite-popover
      className="absolute right-0 top-12 w-80 bg-white dark:bg-[#1a232e] rounded-xl shadow-xl border border-slate-200 dark:border-[#324d67] z-50"
    >
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Invite User
          </h3>
          <button
            onClick={onCancel}
            className="text-slate-500 dark:text-[#92adc9] hover:text-slate-900 dark:hover:text-white"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-white mb-2">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-[#324d67] bg-slate-50 dark:bg-[#101922] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Enter email address"
            />
            <div className="min-h-[20px]">
              {formErrors.email && (
                <p className="text-sm text-red-500 dark:text-red-400 mt-1">
                  {formErrors.email}
                </p>
              )}
            </div>
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-white mb-2">
              Role
            </label>
            <select
              name="roleId"
              value={formData.roleId}
              onChange={handleInputChange}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-[#324d67] bg-slate-50 dark:bg-[#101922] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Select a role</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
            <div className="min-h-[20px]">
              {formErrors.roleId && (
                <p className="text-sm text-red-500 dark:text-red-400 mt-1">
                  {formErrors.roleId}
                </p>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 pt-2">
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
              {submitting ? "Sending..." : "Invite"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

