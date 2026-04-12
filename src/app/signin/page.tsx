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

  // Note: Redirection is now handled centrally by the useSignIn hook
  // which ensures the session cookie is correctly set before moving to /profile

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

  // Show loading state while redirect is in progress (prevents white screen)
  if (authUser) {
    return (
      <div className='flex justify-center items-center min-h-screen bg-[#f9faf5]'>
        <div className='flex flex-col items-center gap-4'>
          <div className='w-12 h-12 border-2 border-[#003527] border-t-transparent rounded-none animate-spin'></div>
          <div className='text-[10px] font-black uppercase tracking-[0.3em] text-[#003527]/40'>
            Redirecting to Dashboard...
          </div>
        </div>
      </div>
    );
  }

  return (
    <PublicShell>
      <div className='min-h-[calc(100vh-120px)] flex items-center justify-center bg-transparent py-4'>

        <div className="flex flex-col lg:flex-row max-w-5xl w-full gap-8 lg:gap-12 items-center lg:items-stretch justify-center">

          {/* Left Card: Credibility / Technical Context */}
          <div className="w-full lg:flex-1 bg-[#003527] relative overflow-hidden flex flex-col justify-center p-8 md:p-14 rounded-none shadow-2xl min-h-[280px] lg:min-h-[480px] lg:aspect-square">
            <div className="absolute inset-0 opacity-[0.05] pointer-events-none">
              <div className="absolute inset-0 bg-[radial-gradient(#a8f928_1px,transparent_1px)] [background-size:24px_24px]" />
            </div>

            <div className="relative z-10 space-y-6 md:space-y-8">
              <div className="space-y-3 md:space-y-4">
                <p className="text-[10px] font-black uppercase tracking-[0.5em] text-[#a8f928]/60">
                  Institutional Access
                </p>
                <h1 className="text-3xl md:text-5xl font-black text-white leading-[1.1]">
                  Global Verified <br />Carbon Registry.
                </h1>
                <p className="text-xs md:text-lg text-white/50 font-bold leading-relaxed max-w-md">
                  Secure access to manage your low-carbon assets, verify digital signatures,
                  and scale your environmental audit data.
                </p>
              </div>
            </div>
          </div>

          {/* Right Card: Authentication Box */}
          <div className="w-full lg:flex-1 flex items-center justify-center p-0">
            <div className='w-full bg-white p-8 md:p-14 border border-[#003527]/5 rounded-none shadow-2xl relative overflow-hidden flex flex-col justify-center min-h-[360px] md:min-h-[480px]'>
              {/* Subtle Brand Watermark */}
              <div className="absolute -right-20 -top-20 w-56 h-56 opacity-[0.03] scale-150 rotate-12">
                <img src="/climate asset logo bw.jpg" alt="Watermark" className="w-full h-full object-contain" />
              </div>

              <div className='relative z-10 text-center mb-8 md:mb-12'>
                <h2 className='text-xl md:text-2xl font-black text-[#003527] tracking-tight mb-3 uppercase font-[Manrope]'>
                  Climate Asset Registry
                </h2>
                <p className='text-[#414942]/60 text-[10px] font-black leading-relaxed px-2 uppercase tracking-[0.3em]'>
                  Sign in to manage your profile
                </p>
              </div>

              <button
                onClick={handleSignIn}
                className='flex items-center justify-center gap-4 w-full py-4 md:py-5 px-8 bg-[#003527] text-white font-black text-xs md:text-sm uppercase tracking-widest rounded-none hover:bg-[#004d39] transition-all cursor-pointer border border-[#003527] group shadow-lg shadow-[#003527]/20 hover:shadow-none'
              >
                <img
                  src='https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg'
                  alt='Google icon'
                  className='w-5 h-5 md:w-6 md:h-6 transition-all group-hover:scale-110'
                />
                <span>Sign in with Google</span>
              </button>

              <div className='mt-10 md:mt-16 pt-8 md:pt-10 border-t border-[#003527]/5 text-center'>
                <p className='text-[10px] font-bold text-[#414942]/30 max-w-[280px] mx-auto leading-relaxed uppercase tracking-[0.2em]'>
                  By accessing this portal, you agree to the{" "}
                  <a href='#' className='text-[#003527] hover:underline font-black'>Terms</a>
                  {" "} & {" "}
                  <a href='#' className='text-[#003527] hover:underline font-black'>Privacy Policy</a>
                  .
                </p>
              </div>
            </div>
          </div>

        </div>

      </div>
    </PublicShell>
  );
}
