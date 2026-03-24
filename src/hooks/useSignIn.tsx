"use client";

import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export const useSignIn = () => {
  const { user, loginWithGoogle, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && !loading) {
      router.replace("/profile");
    }
  }, [user, loading, router]);

  const handleSignIn = async () => {
    try {
      await loginWithGoogle();
      // Redirect is handled by the useEffect above once loading is false
    } catch (error) {
      console.error("Sign in failed:", error);
    }
  };

  return { loading, handleSignIn };
};
