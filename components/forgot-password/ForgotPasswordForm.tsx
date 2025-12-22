"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import { forgotPassword } from "@/store/slices/authSlice";

interface FormErrors {
  email?: string;
}

export default function ForgotPasswordForm() {
  const { requestPasswordReset, isLoading } = useAuth();
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const validateEmail = (email: string): string | undefined => {
    if (!email.trim()) {
      return "Email address is required";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return "Please enter a valid email address";
    }
    return undefined;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: FormErrors = {};
    const emailError = validateEmail(email);

    if (emailError) {
      newErrors.email = emailError;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Clear errors if validation passes
    setErrors({});

    // Handle form submission
    const result = await requestPasswordReset(email);
    if (forgotPassword.fulfilled.match(result)) {
      toast.success(result.payload as string || "Password reset link sent to your email");
      setIsSubmitted(true);
    } else {
      toast.error(result.payload as string || "Failed to send reset link");
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    // Clear error when user starts typing
    if (errors.email) {
      setErrors((prev) => ({ ...prev, email: undefined }));
    }
  };

  return (
    <div className="w-full max-w-[440px] flex flex-col gap-6">
      {/* Header / Logo Area */}
      <div className="flex flex-col items-center justify-center gap-2 mb-2">
        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/20 text-primary mb-2">
          <span className="material-symbols-outlined text-3xl">lock_reset</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Forgot Password
        </h1>
        <p className="text-sm text-slate-500 dark:text-[#92adc9] text-center">
          {isSubmitted
            ? "Check your email for reset instructions"
            : "Enter your email address and we'll send you a link to reset your password"}
        </p>
      </div>

      {/* Card */}
      <div className="bg-white dark:bg-[#1a232e] rounded-xl shadow-lg dark:shadow-none border border-slate-200 dark:border-[#324d67] p-8">
        {isSubmitted ? (
          <div className="flex flex-col gap-6 items-center text-center">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 text-primary mb-2">
              <span className="material-symbols-outlined text-4xl">mail</span>
            </div>
            <div className="flex flex-col gap-2">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Check your email
              </h2>
              <p className="text-sm text-slate-500 dark:text-[#92adc9]">
                We've sent a password reset link to <strong>{email}</strong>
              </p>
            </div>
            <Link
              href="/signin"
              className="flex w-full cursor-pointer items-center justify-center rounded-lg h-12 px-5 bg-primary hover:bg-blue-600 text-white text-base font-bold leading-normal tracking-wide transition-all shadow-md shadow-primary/20"
            >
              Back to Sign in
            </Link>
          </div>
        ) : (
          <form action="#" className="flex flex-col gap-5" onSubmit={handleSubmit}>
            {/* Email Field */}
            <div className="flex flex-col gap-2">
              <label
                className="text-sm font-medium leading-none text-slate-700 dark:text-white"
                htmlFor="email"
              >
                Email address
              </label>
              <input
                className={`flex w-full rounded-lg border ${
                  errors.email
                    ? "border-red-500 dark:border-red-500 focus:border-red-500 focus:ring-red-500"
                    : "border-slate-300 dark:border-[#324d67] focus:border-primary focus:ring-primary"
                } bg-slate-50 dark:bg-[#101922] focus:ring-1 h-12 px-4 placeholder:text-slate-400 dark:placeholder:text-[#92adc9] text-base dark:text-white transition-colors outline-none`}
                id="email"
                placeholder="user@company.com"
                type="email"
                value={email}
                onChange={handleEmailChange}
              />
              <div className="min-h-[20px]">
                {errors.email && (
                  <p className="text-sm text-red-500 dark:text-red-400 mt-1">
                    {errors.email}
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
              {isLoading ? "Sending..." : "Send reset link"}
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
  );
}

