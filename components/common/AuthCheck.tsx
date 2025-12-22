"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";

export default function AuthCheck() {
  const { verifyToken, token } = useAuth();
  const hasChecked = useRef(false);

  useEffect(() => {
    // Only run once per app session and only if token exists
    if (hasChecked.current || !token) {
      return;
    }
    hasChecked.current = true;

    // Verify token with backend
    verifyToken();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return null;
}

