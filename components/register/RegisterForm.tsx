"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import { registerWithToken, validateToken } from "@/store/slices/authSlice";
import InvalidTokenModal from "@/components/common/InvalidTokenModal";

interface FormErrors {
  name?: string;
  password?: string;
  confirmPassword?: string;
  profilePic?: string;
}

export default function RegisterForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const { validateTokenForAuth, registerUsingToken, isLoading } = useAuth();
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [profilePic, setProfilePic] = useState<File | null>(null);
  const [profilePicPreview, setProfilePicPreview] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isTokenValid, setIsTokenValid] = useState<boolean | null>(null);
  const [showInvalidModal, setShowInvalidModal] = useState(false);
  const [isAlreadyRegistered, setIsAlreadyRegistered] = useState(false);

  useEffect(() => {
    const checkToken = async () => {
      if (!token) {
        setShowInvalidModal(true);
        setIsTokenValid(false);
        return;
      }

      const result = await validateTokenForAuth(token);
      
      // Get payload from either fulfilled or rejected action
      let payload: any = null;
      let message = "";
      
      if (validateToken.fulfilled.match(result)) {
        payload = result.payload;
        message = payload?.message || "";
      } else if (validateToken.rejected.match(result)) {
        payload = result.payload as any;
        message = payload?.message || "";
      }
      
      // Check if token is valid
      if (payload?.valid === true) {
        // Token is valid and user can register
        setIsTokenValid(true);
        setEmail(payload.email || "");
        setShowInvalidModal(false);
        setIsAlreadyRegistered(false);
      } else {
        // Token validation failed - check if user is already registered
        const lowerMessage = message.toLowerCase();
        const isAlreadyRegisteredMessage = 
          lowerMessage.includes("already registered") || 
          lowerMessage.includes("sign in instead") ||
          lowerMessage.includes("sign in");
        
        if (isAlreadyRegisteredMessage) {
          setIsAlreadyRegistered(true);
          setIsTokenValid(false);
          toast.info("You are already registered. Redirecting to sign in...");
          // Redirect to signin after 2 seconds
          setTimeout(() => {
            router.push("/signin");
          }, 2000);
        } else {
          setIsTokenValid(false);
          setShowInvalidModal(true);
          setIsAlreadyRegistered(false);
        }
      }
    };

    checkToken();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const validateName = (name: string): string | undefined => {
    if (!name.trim()) {
      return "Full name is required";
    }
    if (name.trim().length < 2) {
      return "Name must be at least 2 characters";
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          profilePic: "File size must be less than 5MB",
        }));
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        return;
      }
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setErrors((prev) => ({
          ...prev,
          profilePic: "Please select an image file",
        }));
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        return;
      }
      setProfilePic(file);
      setErrors((prev) => ({ ...prev, profilePic: undefined }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicPreview(reader.result as string);
      };
      reader.onerror = () => {
        setErrors((prev) => ({
          ...prev,
          profilePic: "Error reading file",
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      toast.error("Invalid token");
      return;
    }

    const newErrors: FormErrors = {};
    const nameError = validateName(name);
    const passwordError = validatePassword(password);
    const confirmPasswordError = validateConfirmPassword(password, confirmPassword);

    if (nameError) {
      newErrors.name = nameError;
    }
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
    const result = await registerUsingToken(
      token,
      password,
      name,
      profilePic || undefined
    );
    if (registerWithToken.fulfilled.match(result)) {
      toast.success("Registration successful!");
      setIsSubmitted(true);
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    } else {
      toast.error(result.payload as string || "Registration failed");
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
    if (errors.name) {
      setErrors((prev) => ({ ...prev, name: undefined }));
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (errors.password) {
      setErrors((prev) => ({ ...prev, password: undefined }));
    }
    if (errors.confirmPassword && e.target.value === confirmPassword) {
      setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
    }
  };

  const handleConfirmPasswordChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setConfirmPassword(e.target.value);
    if (errors.confirmPassword) {
      setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
    }
  };

  if (isTokenValid === null && !isAlreadyRegistered) {
    return (
      <div className="w-full max-w-[440px] flex flex-col gap-6 items-center justify-center">
        <div className="text-slate-500 dark:text-[#92adc9]">Validating token...</div>
      </div>
    );
  }

  if (isAlreadyRegistered) {
    return (
      <div className="w-full max-w-[440px] flex flex-col gap-6 items-center justify-center">
        <div className="bg-white dark:bg-[#1a232e] rounded-xl shadow-lg dark:shadow-none border border-slate-200 dark:border-[#324d67] p-8 text-center">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 mb-4 mx-auto">
            <span className="material-symbols-outlined text-4xl">info</span>
          </div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
            Already Registered
          </h2>
          <p className="text-sm text-slate-500 dark:text-[#92adc9] mb-6">
            You are already registered. Redirecting to sign in page...
          </p>
          <Link
            href="/signin"
            className="inline-flex items-center justify-center gap-2 px-6 py-2 rounded-lg bg-primary hover:bg-blue-600 text-white font-medium transition-colors"
          >
            <span>Go to Sign In</span>
            <span className="material-symbols-outlined text-lg">arrow_forward</span>
          </Link>
        </div>
      </div>
    );
  }

  if (!isTokenValid) {
    return (
      <>
        <InvalidTokenModal
          isOpen={showInvalidModal}
          message="Invalid or expired token. Please contact admin for a new registration link."
        />
        <div className="w-full max-w-[440px] flex flex-col gap-6"></div>
      </>
    );
  }

  return (
    <>
      <InvalidTokenModal
        isOpen={showInvalidModal && !isTokenValid}
        message="Invalid or expired token. Please contact admin for a new registration link."
      />
      {isTokenValid && (
        <div className="w-full max-w-[440px] flex flex-col gap-6">
        {/* Header / Logo Area */}
        <div className="flex flex-col items-center justify-center gap-2 mb-2">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/20 text-primary mb-2">
            <span className="material-symbols-outlined text-3xl">person_add</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Complete Registration
          </h1>
          <p className="text-sm text-slate-500 dark:text-[#92adc9] text-center">
            {isSubmitted
              ? "Registration successful! Redirecting..."
              : "Complete your profile to get started"}
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
                  Registration Successful
                </h2>
                <p className="text-sm text-slate-500 dark:text-[#92adc9]">
                  Your account has been created successfully
                </p>
              </div>
            </div>
          ) : (
            <form action="#" className="flex flex-col gap-5" onSubmit={handleSubmit}>
              {/* Profile Picture */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium leading-none text-slate-700 dark:text-white">
                  Profile Picture (Optional)
                </label>
                <div className="flex items-center gap-4">
                  <div
                    className="relative w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden cursor-pointer group"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {profilePicPreview ? (
                      <img
                        src={profilePicPreview}
                        alt="Profile preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-2xl font-bold text-primary">
                        {email.charAt(0).toUpperCase()}
                      </span>
                    )}
                    {/* Upload icon overlay on hover */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="material-symbols-outlined text-white text-2xl">
                        upload
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 rounded-lg border border-slate-300 dark:border-[#324d67] bg-slate-50 dark:bg-[#101922] text-sm font-medium text-slate-700 dark:text-white hover:bg-slate-100 dark:hover:bg-[#1a232e] transition-colors"
                  >
                    Choose File
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
                <div className="min-h-[20px]">
                  {errors.profilePic && (
                    <p className="text-sm text-red-500 dark:text-red-400 mt-1">
                      {errors.profilePic}
                    </p>
                  )}
                </div>
              </div>

              {/* Email Field (Disabled) */}
              <div className="flex flex-col gap-2">
                <label
                  className="text-sm font-medium leading-none text-slate-700 dark:text-white"
                  htmlFor="email"
                >
                  Email address
                </label>
                <input
                  className="flex w-full rounded-lg border border-slate-300 dark:border-[#324d67] bg-slate-100 dark:bg-[#0a0f14] h-12 px-4 text-base dark:text-slate-400 text-slate-500 cursor-not-allowed"
                  id="email"
                  type="email"
                  value={email}
                  disabled
                />
              </div>

              {/* Name Field */}
              <div className="flex flex-col gap-2">
                <label
                  className="text-sm font-medium leading-none text-slate-700 dark:text-white"
                  htmlFor="name"
                >
                  Full Name
                </label>
                <input
                  className={`flex w-full rounded-lg border ${
                    errors.name
                      ? "border-red-500 dark:border-red-500 focus:border-red-500 focus:ring-red-500"
                      : "border-slate-300 dark:border-[#324d67] focus:border-primary focus:ring-primary"
                  } bg-slate-50 dark:bg-[#101922] focus:ring-1 h-12 px-4 placeholder:text-slate-400 dark:placeholder:text-[#92adc9] text-base dark:text-white transition-colors outline-none`}
                  id="name"
                  placeholder="John Doe"
                  type="text"
                  value={name}
                  onChange={handleNameChange}
                />
                <div className="min-h-[20px]">
                  {errors.name && (
                    <p className="text-sm text-red-500 dark:text-red-400 mt-1">
                      {errors.name}
                    </p>
                  )}
                </div>
              </div>

              {/* Password Field */}
              <div className="flex flex-col gap-2">
                <label
                  className="text-sm font-medium leading-none text-slate-700 dark:text-white"
                  htmlFor="password"
                >
                  Password
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
                {isLoading ? "Registering..." : "Complete Registration"}
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-sm text-slate-500 dark:text-[#92adc9]">
            Already have an account?{" "}
            <Link
              className="font-medium text-slate-900 dark:text-white hover:underline"
              href="/signin"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
      )}
    </>
  );
}

