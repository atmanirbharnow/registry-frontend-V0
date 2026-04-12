"use client";

import { useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export const useSignIn = () => {
  const { user, loginWithGoogle, loading } = useAuth();
  const router = useRouter();
  const redirectAttempted = useRef(false);

  const attemptRedirect = useCallback(() => {
    if (redirectAttempted.current) return;
    if (document.cookie.includes("session=")) {
      redirectAttempted.current = true;
      router.replace("/profile");
    }
  }, [router]);

  useEffect(() => {
    if (!user || loading) return;

    // If cookie is already set, redirect immediately
    if (document.cookie.includes("session=")) {
      attemptRedirect();
      return;
    }

    // Poll for the session cookie — it's set asynchronously in AuthContext
    // after fetching the user profile from Firestore
    let elapsed = 0;
    const interval = setInterval(() => {
      elapsed += 100;
      if (document.cookie.includes("session=")) {
        clearInterval(interval);
        attemptRedirect();
      } else if (elapsed >= 5000) {
        // Fallback: force redirect even without cookie after 5s
        clearInterval(interval);
        if (!redirectAttempted.current) {
          redirectAttempted.current = true;
          router.replace("/profile");
        }
      }
    }, 100);

    return () => clearInterval(interval);
  }, [user, loading, router, attemptRedirect]);

  const handleSignIn = async () => {
    try {
      redirectAttempted.current = false;
      await loginWithGoogle();
    } catch (error) {
      console.error("Sign in failed:", error);
    }
  };

  return { loading, handleSignIn };
};
