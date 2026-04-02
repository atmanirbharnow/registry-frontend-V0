"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import GoogleIcon from "@/components/svg/GoogleIcon";
import { useSignIn } from "@/hooks/useSignIn";
import { useAuth } from "@/context/AuthContext";
import PublicShell from "@/components/PublicShell";

export default function SignInPage() {
  const router = useRouter();
  const { user: authUser, loading: authLoading } = useAuth();
  const { loading, handleSignIn } = useSignIn();

  // Redirect to profile if already authenticated
  useEffect(() => {
    if (!authLoading && authUser) {
      router.replace("/profile");
    }
  }, [authUser, authLoading, router]);

  if (loading || authLoading) {
    return (
      <div className='flex justify-center items-center min-h-screen bg-[#f9faf5]'>
        <div className='flex flex-col items-center gap-4'>
          <div className='w-12 h-12 border-2 border-[#003527] border-t-transparent rounded-none animate-spin'></div>
          <div className='text-[10px] font-black uppercase tracking-[0.3em] text-[#003527]/40'>
            Establishing Secure Link...
          </div>
        </div>
      </div>
    );
  }

  return (
    <PublicShell>
      <div className='min-h-[calc(100vh-80px)] flex flex-col lg:flex-row bg-[#f9faf5]'>
        
        {/* Left Side: Credibility / Technical Context (Hidden on mobile) */}
        <div className="hidden lg:flex flex-1 bg-[#003527] relative overflow-hidden items-center justify-center p-16">
          <div className="absolute inset-0 opacity-[0.05] pointer-events-none">
             <div className="absolute inset-0 bg-[radial-gradient(#a8f928_1px,transparent_1px)] [background-size:32px_32px]" />
          </div>
          
          <div className="relative z-10 max-w-md space-y-12">
            <div className="space-y-4">
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#a8f928]/60">
                Institutional Access
              </p>
              <h1 className="text-4xl font-black text-white leading-tight">
                Indias Verified <br />Carbon Registry.
              </h1>
              <p className="text-base text-white/50 font-bold leading-relaxed">
                Log in to manage your low-carbon assets, verify digital signatures, 
                and scale your environmental audit data.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 pt-8 border-t border-white/10">
              <div className="flex items-start gap-4">
                 <div className="w-10 h-10 border border-[#a8f928]/30 flex items-center justify-center text-[#a8f928] bg-[#a8f928]/5">
                   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect width="18" height="11" x="3" y="11" rx="0" ry="0"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                 </div>
                 <div>
                   <span className="text-sm font-black text-white block">SHA-256 Integrity</span>
                   <p className="text-xs font-bold text-white/30">Immutable data logs for every action.</p>
                 </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Authentication Box */}
        <div className="flex-1 flex items-center justify-center p-6 md:p-16">
          <div className='w-full max-w-sm bg-white p-8 md:p-12 border border-[#003527]/5 rounded-none shadow-2xl relative overflow-hidden'>
            {/* Subtle Brand Watermark */}
            <div className="absolute -right-16 -top-16 w-48 h-48 opacity-[0.03] scale-150 rotate-12">
               <img src="/earth carbon logo bw.jpg" alt="Watermark" className="w-full h-full object-contain" />
            </div>

            <div className='relative z-10 text-center mb-10'>
              <h2 className='text-xl font-black text-[#003527] tracking-tight mb-2 uppercase'>
                Access Registry
              </h2>
              <p className='text-[#414942]/60 text-xs font-bold leading-relaxed px-2 uppercase tracking-widest'>
                Sign in to manage your profile
              </p>
            </div>

            <button
              onClick={handleSignIn}
              className='flex items-center justify-center gap-4 w-full py-4 px-6 bg-[#003527] text-white font-black text-xs uppercase tracking-widest rounded-none hover:bg-[#004d39] transition-all cursor-pointer border border-[#003527] group'
            >
              <img
                src='https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg'
                alt='Google icon'
                className='w-5 h-5 grayscale group-hover:grayscale-0 transition-all'
              />
              <span>Sign in with Google</span>
            </button>

            <div className='mt-12 pt-8 border-t border-[#003527]/5 text-center'>
              <p className='text-[10px] font-bold text-[#414942]/30 max-w-[240px] mx-auto leading-relaxed uppercase tracking-widest'>
                By accessing this portal, you agree to the{" "}
                <a href='#' className='text-[#003527] hover:underline'>Terms</a> 
                {" "} & {" "}
                <a href='#' className='text-[#003527] hover:underline'>Privacy Policy</a>
                .
              </p>
            </div>
          </div>
        </div>

      </div>
    </PublicShell>
  );
}
