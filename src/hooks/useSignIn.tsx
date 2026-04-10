"use client";

import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export const useSignIn = () => {
  const { user, loginWithGoogle, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Only redirect if we have a user AND the auth loading state is false (cookie-set complete)
    if (user && !loading) {
      // Final guard: ensure the session cookie is visible to the browser 
      // before triggering navigation that middleware will intercept.
      if (document.cookie.includes("session=")) {
        router.replace("/profile");
      }
    }
  }, [user, loading, router]);

  const handleSignIn = async () => {
    try {
      await loginWithGoogle();
      // Manual redirect removed here to prevent race condition with middleware
    } catch (error) {
      console.error("Sign in failed:", error);
    }
  };

  return { loading, handleSignIn };
};
