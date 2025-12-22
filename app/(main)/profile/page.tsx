"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import axiosInstance from "@/lib/axios";
import { useToast } from "@/hooks/useToast";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";

interface UserProfile {
  email: string;
  name?: string;
  profilePic?: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const toast = useToast();
  const { user: authUser, updateCredentials, token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUserProfile] = useState<UserProfile | null>(null);
  const [name, setName] = useState("");
  const [profilePicPreview, setProfilePicPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ name?: string; profilePic?: string }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/user/profile");
      const userData = response.data.data;
      setUserProfile(userData);
      setName(userData.name || "");
      setProfilePicPreview(userData.profilePic || null);
    } catch (error: any) {
      console.error("Error fetching profile:", error);
      toast.error(error.response?.data?.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setErrors((prev) => ({
        ...prev,
        profilePic: "Profile picture must be less than 5MB",
      }));
      return;
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setErrors((prev) => ({
        ...prev,
        profilePic: "Profile picture must be a JPEG, PNG, or WebP image",
      }));
      return;
    }

    // Clear error
    setErrors((prev) => ({ ...prev, profilePic: undefined }));

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfilePicPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    const newErrors: { name?: string; profilePic?: string } = {};
    if (name.trim() === "") {
      newErrors.name = "Name is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setSaving(true);
      setErrors({});

      const formData = new FormData();
      formData.append("name", name.trim());
      
      // Add profile picture if a new one was selected
      const fileInput = fileInputRef.current;
      if (fileInput?.files?.[0]) {
        formData.append("profilePic", fileInput.files[0]);
      }
      
      // Include existing profile pic URL for deletion if needed
      if (user?.profilePic) {
        formData.append("existingProfilePicUrl", user.profilePic);
      }

      const response = await axiosInstance.put("/user/profile", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Update auth user state
      if (updateCredentials && token) {
        updateCredentials(token, {
          id: response.data.data._id || response.data.data.id,
          email: response.data.data.email,
          name: response.data.data.name || "",
          profilePic: response.data.data.profilePic,
        });
      }

      toast.success(response.data.message || "Profile updated successfully");
      
      // Refresh profile data
      await fetchProfile();
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center">
        <div className="text-slate-500 dark:text-[#92adc9]">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark p-4 md:p-8 flex items-center justify-center">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
            Profile Settings
          </h1>
          <p className="text-sm text-slate-500 dark:text-[#92adc9] mt-1">
            Manage your profile information and picture
          </p>
        </div>

        {/* Profile Card */}
        <div className="bg-white dark:bg-[#1a232e] rounded-xl shadow-lg dark:shadow-none border border-slate-200 dark:border-[#324d67] p-6 md:p-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {/* Profile Picture */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium leading-none text-slate-700 dark:text-white">
                Profile Picture
              </label>
              <div className="flex items-center gap-4">
                <div
                  className="relative w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden cursor-pointer group"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {profilePicPreview ? (
                    <img
                      src={profilePicPreview}
                      alt="Profile preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-3xl font-bold text-primary">
                      {(user?.name || user?.email || "U").charAt(0).toUpperCase()}
                    </span>
                  )}
                  {/* Upload icon overlay on hover */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="material-symbols-outlined text-white text-2xl">
                      upload
                    </span>
                  </div>
                </div>
                <div className="flex-1">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 rounded-lg border border-slate-300 dark:border-[#324d67] bg-slate-50 dark:bg-[#101922] text-sm font-medium text-slate-700 dark:text-white hover:bg-slate-100 dark:hover:bg-[#1a232e] transition-colors"
                  >
                    Choose File
                  </button>
                  <p className="text-xs text-slate-500 dark:text-[#92adc9] mt-1">
                    JPEG, PNG, or WebP (max 5MB)
                  </p>
                </div>
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

            {/* Name Field */}
            <div className="flex flex-col gap-2">
              <label
                className="text-sm font-medium leading-none text-slate-700 dark:text-white"
                htmlFor="name"
              >
                Name
              </label>
              <input
                className={`flex w-full rounded-lg border ${
                  errors.name
                    ? "border-red-500 dark:border-red-500 focus:border-red-500 focus:ring-red-500"
                    : "border-slate-300 dark:border-[#324d67] focus:border-primary focus:ring-primary"
                } bg-slate-50 dark:bg-[#101922] focus:ring-1 h-12 px-4 placeholder:text-slate-400 dark:placeholder:text-[#92adc9] text-base dark:text-white transition-colors outline-none`}
                id="name"
                placeholder="Enter your name"
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) {
                    setErrors((prev) => ({ ...prev, name: undefined }));
                  }
                }}
              />
              <div className="min-h-[20px]">
                {errors.name && (
                  <p className="text-sm text-red-500 dark:text-red-400 mt-1">
                    {errors.name}
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
                Email
              </label>
              <input
                className="flex w-full rounded-lg border border-slate-300 dark:border-[#324d67] bg-slate-100 dark:bg-[#0f172a] h-12 px-4 text-slate-500 dark:text-[#64748b] text-base cursor-not-allowed"
                id="email"
                type="email"
                value={user?.email || ""}
                disabled
              />
              <p className="text-xs text-slate-500 dark:text-[#92adc9]">
                Email cannot be changed
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-primary hover:bg-blue-600 text-white text-base font-bold leading-normal tracking-wide transition-all shadow-md shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <span className="material-symbols-outlined text-lg animate-spin">
                      refresh
                    </span>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-lg">save</span>
                    <span>Save Changes</span>
                  </>
                )}
              </button>
              <Link
                href="/dashboard"
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

