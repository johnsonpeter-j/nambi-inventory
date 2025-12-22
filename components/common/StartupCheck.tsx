"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useToast } from "@/hooks/useToast";

export default function StartupCheck() {
  const pathname = usePathname();
  const toast = useToast();
  const hasChecked = useRef(false);

  useEffect(() => {
    // Skip check on register route
    if (pathname?.includes("/register")) {
      return;
    }

    // Only run once per app session
    if (hasChecked.current) return;
    hasChecked.current = true;

    const checkDefaultUser = async () => {
      try {
        const response = await fetch("/api/auth/check-default-user");
        const data = await response.json();

        if (!response.ok) {
          console.error("Startup check failed:", data.message);
          return;
        }

        // Only show toast in development or if user doesn't exist
        if (!data.exists && process.env.NODE_ENV === "development") {
          toast.info(
            `Default user invitation sent to ${data.email}`,
            { autoClose: 5000 }
          );
        }
      } catch (error) {
        console.error("Error checking default user:", error);
      }
    };

    // Small delay to avoid blocking initial render
    setTimeout(checkDefaultUser, 1000);
  }, [pathname, toast]);

  return null;
}

