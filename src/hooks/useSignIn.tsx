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
      router.push("/profile");
      // Redirect is handled by the handleSignIn and the useEffect above as fallback
    } catch (error) {
      console.error("Sign in failed:", error);
    }
  };

  return { loading, handleSignIn };
};
