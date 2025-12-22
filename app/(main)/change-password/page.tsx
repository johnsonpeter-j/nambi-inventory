"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axiosInstance from "@/lib/axios";
import { useToast } from "@/hooks/useToast";
import Link from "next/link";

export default function ChangePasswordPage() {
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<{
    newPassword?: string;
    confirmPassword?: string;
  }>({});

  const validatePassword = (password: string): string | undefined => {
    if (!password) {
      return "Password is required";
    }
    if (password.length < 6) {
      return "Password must be at least 6 characters";
    }
    return undefined;
  };

  const validateConfirmPassword = (
    password: string,
    confirmPassword: string
  ): string | undefined => {
    if (!confirmPassword) {
      return "Please confirm your password";
    }
    if (password !== confirmPassword) {
      return "Passwords do not match";
    }
    return undefined;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    const newErrors: { newPassword?: string; confirmPassword?: string } = {};
    const passwordError = validatePassword(formData.newPassword);
    const confirmPasswordError = validateConfirmPassword(
      formData.newPassword,
      formData.confirmPassword
    );

    if (passwordError) {
      newErrors.newPassword = passwordError;
    }
    if (confirmPasswordError) {
      newErrors.confirmPassword = confirmPasswordError;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setLoading(true);
      setErrors({});

      const response = await axiosInstance.put("/user/change-password", {
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword,
      });

      toast.success(response.data.message || "Password changed successfully");
      
      // Reset form
      setFormData({
        newPassword: "",
        confirmPassword: "",
      });


    } catch (error: any) {
      console.error("Error changing password:", error);
      toast.error(error.response?.data?.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
    // Also clear confirm password error if passwords now match
    if (field === "newPassword" && value === formData.confirmPassword && errors.confirmPassword) {
      setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
    }
    if (field === "confirmPassword" && value === formData.newPassword && errors.confirmPassword) {
      setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
    }
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark p-4 md:p-8 flex items-center justify-center">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
            Change Password
          </h1>
          <p className="text-sm text-slate-500 dark:text-[#92adc9] mt-1">
            Update your account password
          </p>
        </div>

        {/* Password Card */}
        <div className="bg-white dark:bg-[#1a232e] rounded-xl shadow-lg dark:shadow-none border border-slate-200 dark:border-[#324d67] p-6 md:p-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {/* New Password Field */}
            <div className="flex flex-col gap-2">
              <label
                className="text-sm font-medium leading-none text-slate-700 dark:text-white"
                htmlFor="newPassword"
              >
                New Password
              </label>
              <div className="relative flex w-full rounded-lg">
                <input
                  className={`flex-1 w-full rounded-lg border ${
                    errors.newPassword
                      ? "border-red-500 dark:border-red-500 focus:border-red-500 focus:ring-red-500"
                      : "border-slate-300 dark:border-[#324d67] focus:border-primary focus:ring-primary"
                  } bg-slate-50 dark:bg-[#101922] focus:ring-1 h-12 pl-4 pr-12 placeholder:text-slate-400 dark:placeholder:text-[#92adc9] text-base dark:text-white transition-colors outline-none`}
                  id="newPassword"
                  placeholder="Enter new password"
                  type={showPassword ? "text" : "password"}
                  value={formData.newPassword}
                  onChange={(e) => handleInputChange("newPassword", e.target.value)}
                />
                <button
                  className="absolute right-0 top-0 bottom-0 px-3 flex items-center justify-center text-slate-400 dark:text-[#92adc9] hover:text-primary transition-colors"
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
              <div className="min-h-[20px]">
                {errors.newPassword && (
                  <p className="text-sm text-red-500 dark:text-red-400 mt-1">
                    {errors.newPassword}
                  </p>
                )}
              </div>
            </div>

            {/* Confirm Password Field */}
            <div className="flex flex-col gap-2">
              <label
                className="text-sm font-medium leading-none text-slate-700 dark:text-white"
                htmlFor="confirmPassword"
              >
                Confirm Password
              </label>
              <div className="relative flex w-full rounded-lg">
                <input
                  className={`flex-1 w-full rounded-lg border ${
                    errors.confirmPassword
                      ? "border-red-500 dark:border-red-500 focus:border-red-500 focus:ring-red-500"
                      : "border-slate-300 dark:border-[#324d67] focus:border-primary focus:ring-primary"
                  } bg-slate-50 dark:bg-[#101922] focus:ring-1 h-12 pl-4 pr-12 placeholder:text-slate-400 dark:placeholder:text-[#92adc9] text-base dark:text-white transition-colors outline-none`}
                  id="confirmPassword"
                  placeholder="Confirm new password"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                />
                <button
                  className="absolute right-0 top-0 bottom-0 px-3 flex items-center justify-center text-slate-400 dark:text-[#92adc9] hover:text-primary transition-colors"
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showConfirmPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
              <div className="min-h-[20px]">
                {errors.confirmPassword && (
                  <p className="text-sm text-red-500 dark:text-red-400 mt-1">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-primary hover:bg-blue-600 text-white text-base font-bold leading-normal tracking-wide transition-all shadow-md shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <span className="material-symbols-outlined text-lg animate-spin">
                      refresh
                    </span>
                    <span>Changing Password...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-lg">lock</span>
                    <span>Change Password</span>
                  </>
                )}
              </button>
              <Link
                href="/profile"
                className="flex items-center justify-center gap-2 px-5 py-3 rounded-lg border border-slate-300 dark:border-[#324d67] bg-white dark:bg-[#1a232e] text-slate-700 dark:text-white hover:bg-slate-50 dark:hover:bg-[#101922] transition-colors font-medium"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

