"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import PublicShell from "@/components/PublicShell";

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && !loading) {
      router.replace("/profile");
    }
  }, [user, loading, router]);

  // If loading or and logged in (redirecting), show nothing or a subtle loader to prevent flicker
  if (loading || user) {
    return (
      <div className='flex justify-center items-center min-h-screen bg-slate-50'>
        <div className='w-10 h-10 border-2 border-[rgb(32,38,130)] border-t-transparent rounded-full animate-spin'></div>
      </div>
    );
  }

  return (
    <PublicShell>
      <section className='max-w-4xl mx-auto'>
        <h1 className='text-4xl font-black mb-6'>Earth Carbon Registry</h1>

        <p className='text-lg mb-4'>
          A public registry for verified low-carbon actions and carbon-credit
          preparedness.
        </p>

        <p className='text-lg'>
          This platform tracks emissions reduction, readiness, and impact — not
          instant carbon credits.
        </p>
      </section>
    </PublicShell>
  );
}
