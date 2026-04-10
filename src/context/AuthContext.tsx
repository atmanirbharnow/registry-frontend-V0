"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  User,
} from "firebase/auth";
import { toast } from "react-toastify";
import { auth, googleProvider } from "@/lib/firebaseConfig";
import { getUserProfile } from "@/lib/firestoreService";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser) => {
        try {
          setUser(firebaseUser);
          if (firebaseUser) {
            // Absolute session timeout enforcement (1 hour)
            const issuedAt = localStorage.getItem("auth_issued_at");
            const now = Date.now();
            const ONE_HOUR = 3600000;

            if (issuedAt && (now - parseInt(issuedAt) > ONE_HOUR)) {
              // Session really expired
              await logout();
              return;
            }

            // If no timestamp, this is the first time we see the user in this session
            if (!issuedAt) {
              localStorage.setItem("auth_issued_at", now.toString());
            }

            let role = "user";
            const profile = await getUserProfile(firebaseUser.uid);
            if (profile?.role) {
                role = profile.role;
            }
            const isRegistered = !!(profile?.phone && profile?.institutionType);
            const sessionData = JSON.stringify({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              role,
              isRegistered,
              issuedAt: parseInt(issuedAt || now.toString())
            });
            // Set cookie for middleware (1 hour)
            document.cookie = `session=${encodeURIComponent(sessionData)}; path=/; max-age=3600`;
          } else {
            document.cookie = "session=; path=/; max-age=0";
            localStorage.removeItem("auth_issued_at");
          }
        } catch (err) {
          console.error("Auth callback error:", err);
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        console.error("Auth listener error:", error);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      toast.success("Successfully logged in with Google!");
    } catch (error: unknown) {
      const firebaseError = error as { code?: string; message?: string };
      if (firebaseError.code === "auth/popup-closed-by-user") {
        return;
      }
      console.error("Login failed:", error);
      toast.error(firebaseError.message || "Failed to sign in with Google");
    }
  };

  const logout = async () => {
    try {
      document.cookie = "session=; path=/; max-age=0";
      await signOut(auth);
      // Redirect to landing page after logout
      window.location.href = "/";
    } catch (error: unknown) {
      console.error("Logout failed:", error);
      const message = error instanceof Error ? error.message : "Failed to log out";
      toast.error(message);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
