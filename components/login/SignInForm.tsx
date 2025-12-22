"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import { loginUser } from "@/store/slices/authSlice";

interface FormErrors {
  email?: string;
  password?: string;
}

export default function SignInForm() {
  const router = useRouter();
  const { login, isLoading, isAuthenticated } = useAuth();
  const toast = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, router]);

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

  const validatePassword = (password: string): string | undefined => {
    if (!password) {
      return "Password is required";
    }
    if (password.length < 6) {
      return "Password must be at least 6 characters";
    }
    return undefined;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: FormErrors = {};
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);

    if (emailError) {
      newErrors.email = emailError;
    }
    if (passwordError) {
      newErrors.password = passwordError;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Clear errors if validation passes
    setErrors({});
    
    // Handle form submission
    const result = await login(email, password);
    if (loginUser.fulfilled.match(result)) {
      toast.success("Login successful!");
      router.push("/dashboard");
    } else {
      toast.error(result.payload as string || "Login failed");
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    // Clear error when user starts typing
    if (errors.email) {
      setErrors((prev) => ({ ...prev, email: undefined }));
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    // Clear error when user starts typing
    if (errors.password) {
      setErrors((prev) => ({ ...prev, password: undefined }));
    }
  };

  return (
    <div className="w-full max-w-[440px] flex flex-col gap-6">
      {/* Header / Logo Area */}
      <div className="flex flex-col items-center justify-center gap-2 mb-2">
        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/20 text-primary mb-2">
          <span className="material-symbols-outlined text-3xl">inventory_2</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Inventory
        </h1>
        <p className="text-sm text-slate-500 dark:text-[#92adc9] text-center">
          Enter your credentials to access the dashboard
        </p>
      </div>

      {/* Login Card */}
      <div className="bg-white dark:bg-[#1a232e] rounded-xl shadow-lg dark:shadow-none border border-slate-200 dark:border-[#324d67] p-8">
        <form action="#" className="flex flex-col" onSubmit={handleSubmit}>
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

          {/* Password Field */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label
                className="text-sm font-medium leading-none text-slate-700 dark:text-white"
                htmlFor="password"
              >
                Password
              </label>
            </div>
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

          {/* Forgot Password Link */}
          <div className="flex justify-end pb-4">
            <Link
              className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
              href="/forgot-password"
            >
              Forgot password?
            </Link>
          </div>

          {/* Submit Button */}
          <button
            className="flex w-full cursor-pointer items-center justify-center rounded-lg h-12 px-5 bg-primary hover:bg-blue-600 text-white text-base font-bold leading-normal tracking-wide transition-all shadow-md shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}

