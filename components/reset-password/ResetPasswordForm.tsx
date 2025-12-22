"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import { resetPassword, validateToken } from "@/store/slices/authSlice";
import InvalidTokenModal from "@/components/common/InvalidTokenModal";

interface FormErrors {
  password?: string;
  confirmPassword?: string;
}

export default function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const { resetPasswordWithToken, validateTokenForAuth, isLoading } = useAuth();
  const toast = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isTokenValid, setIsTokenValid] = useState<boolean | null>(null);
  const [showInvalidModal, setShowInvalidModal] = useState(false);

  useEffect(() => {
    const checkToken = async () => {
      if (!token) {
        setShowInvalidModal(true);
        setIsTokenValid(false);
        return;
      }

      const result = await validateTokenForAuth(token);
      if (validateToken.fulfilled.match(result) && result.payload?.valid) {
        setIsTokenValid(true);
        setShowInvalidModal(false);
      } else {
        setIsTokenValid(false);
        setShowInvalidModal(true);
      }
    };

    checkToken();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

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

    if (!token) {
      toast.error("Invalid token");
      return;
    }

    const newErrors: FormErrors = {};
    const passwordError = validatePassword(password);
    const confirmPasswordError = validateConfirmPassword(
      password,
      confirmPassword
    );

    if (passwordError) {
      newErrors.password = passwordError;
    }
    if (confirmPasswordError) {
      newErrors.confirmPassword = confirmPasswordError;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Clear errors if validation passes
    setErrors({});

    // Handle form submission
    const result = await resetPasswordWithToken(token, password, confirmPassword);
    if (resetPassword.fulfilled.match(result)) {
      toast.success(result.payload as string || "Password reset successfully");
      setIsSubmitted(true);
    } else {
      toast.error(result.payload as string || "Failed to reset password");
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    // Clear error when user starts typing
    if (errors.password) {
      setErrors((prev) => ({ ...prev, password: undefined }));
    }
    // Also clear confirm password error if passwords now match
    if (errors.confirmPassword && e.target.value === confirmPassword) {
      setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
    }
  };

  const handleConfirmPasswordChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setConfirmPassword(e.target.value);
    // Clear error when user starts typing
    if (errors.confirmPassword) {
      setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
    }
  };

  if (isTokenValid === null) {
    return (
      <div className="w-full max-w-[440px] flex flex-col gap-6 items-center justify-center">
        <div className="text-slate-500 dark:text-[#92adc9]">Validating token...</div>
      </div>
    );
  }

  if (!isTokenValid) {
    return (
      <>
        <InvalidTokenModal
          isOpen={showInvalidModal}
          message="Invalid or expired token. Please request a new password reset link."
        />
        <div className="w-full max-w-[440px] flex flex-col gap-6"></div>
      </>
    );
  }

  return (
    <>
      <div className="w-full max-w-[440px] flex flex-col gap-6">
      {/* Header / Logo Area */}
      <div className="flex flex-col items-center justify-center gap-2 mb-2">
        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/20 text-primary mb-2">
          <span className="material-symbols-outlined text-3xl">lock_reset</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Reset Password
        </h1>
        <p className="text-sm text-slate-500 dark:text-[#92adc9] text-center">
          {isSubmitted
            ? "Your password has been reset successfully"
            : "Enter your new password below"}
        </p>
      </div>

      {/* Card */}
      <div className="bg-white dark:bg-[#1a232e] rounded-xl shadow-lg dark:shadow-none border border-slate-200 dark:border-[#324d67] p-8">
        {isSubmitted ? (
          <div className="flex flex-col gap-6 items-center text-center">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 text-primary mb-2">
              <span className="material-symbols-outlined text-4xl">check_circle</span>
            </div>
            <div className="flex flex-col gap-2">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Password Reset Successful
              </h2>
              <p className="text-sm text-slate-500 dark:text-[#92adc9]">
                You can now sign in with your new password
              </p>
            </div>
            <Link
              href="/signin"
              className="flex w-full cursor-pointer items-center justify-center rounded-lg h-12 px-5 bg-primary hover:bg-blue-600 text-white text-base font-bold leading-normal tracking-wide transition-all shadow-md shadow-primary/20"
            >
              Sign in
            </Link>
          </div>
        ) : (
          <form action="#" className="flex flex-col gap-5" onSubmit={handleSubmit}>
            {/* Password Field */}
            <div className="flex flex-col gap-2">
              <label
                className="text-sm font-medium leading-none text-slate-700 dark:text-white"
                htmlFor="password"
              >
                New Password
              </label>
              <div className="relative flex w-full rounded-lg">
                <input
                  className={`flex-1 w-full rounded-lg border ${
                    errors.password
                      ? "border-red-500 dark:border-red-500 focus:border-red-500 focus:ring-red-500"
                      : "border-slate-300 dark:border-[#324d67] focus:border-primary focus:ring-primary"
                  } bg-slate-50 dark:bg-[#101922] focus:ring-1 h-12 pl-4 pr-12 placeholder:text-slate-400 dark:placeholder:text-[#92adc9] text-base dark:text-white transition-colors outline-none`}
                  id="password"
                  placeholder="••••••••"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={handlePasswordChange}
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
                {errors.password && (
                  <p className="text-sm text-red-500 dark:text-red-400 mt-1">
                    {errors.password}
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
                  placeholder="••••••••"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={handleConfirmPasswordChange}
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
            <button
              className="flex w-full cursor-pointer items-center justify-center rounded-lg h-12 px-5 bg-primary hover:bg-blue-600 text-white text-base font-bold leading-normal tracking-wide transition-all shadow-md shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        )}
      </div>

      {/* Footer */}
      <div className="text-center">
        <p className="text-sm text-slate-500 dark:text-[#92adc9]">
          Remember your password?{" "}
          <Link
            className="font-medium text-slate-900 dark:text-white hover:underline"
            href="/signin"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
    </>
  );
}

