"use client";

import React from "react";
import Link from "next/link";
import PublicHeader from "@/components/PublicHeader";

export default function EnterpriseContactPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans relative overflow-x-hidden">
      <PublicHeader />

      {/* Background purely aesthetic graphics */}
      <div className="absolute top-0 right-0 -mr-48 -mt-48 w-[40rem] h-[40rem] bg-blue-200/50 rounded-full blur-[100px] opacity-70 z-0 pointer-events-none mix-blend-multiply"></div>
      <div className="absolute bottom-10 left-0 -ml-48 w-[35rem] h-[35rem] bg-indigo-200/50 rounded-full blur-[100px] opacity-70 z-0 pointer-events-none mix-blend-multiply"></div>

      <main className="flex-1 flex flex-col items-center justify-center p-6 sm:p-8 md:p-12 relative z-10 w-full mb-10">
        <div className="max-w-7xl w-full mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out">
          
          {/* Header Section */}
          <div className="text-center space-y-6 mb-16 lg:mb-24">
            <div className="inline-flex items-center justify-center px-6 py-3 bg-white/60 backdrop-blur-sm border border-white shadow-sm text-blue-800 font-bold rounded-full mb-4 transform hover:scale-105 transition-transform">
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                  Profile Setup Complete
                </span>
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-slate-800 tracking-tight leading-tight">
              Let's get your <br className="hidden md:block"/>
              organization <span className="text-transparent bg-clip-text bg-gradient-to-r from-[rgb(32,38,130)] to-blue-500">registered.</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-600 max-w-3xl mx-auto font-medium leading-relaxed bg-white/70 p-6 md:p-8 rounded-3xl border border-white shadow-lg backdrop-blur-xl mt-8">
              To ensure an accurate and tailored integration for enterprise carbon tracking, we ask larger entities to contact our support team directly. We are excited to partner with you!
            </p>
          </div>

          {/* Contact Methods - Responsive Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full max-w-6xl mx-auto">
            
            {/* Office Card */}
            <div className="w-full h-full group bg-white/80 backdrop-blur-xl hover:bg-white border-2 border-white hover:border-blue-100 transition-all duration-500 rounded-[2rem] p-8 md:p-10 flex flex-col items-center text-center gap-6 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-2">
              <div className="w-20 h-20 md:w-24 md:h-24 flex-shrink-0 bg-blue-50 group-hover:bg-[rgb(32,38,130)] transition-colors duration-500 rounded-2xl md:rounded-[2rem] flex items-center justify-center text-[rgb(32,38,130)] group-hover:text-white rotate-3 group-hover:-rotate-3 shadow-inner">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
              </div>
              <div className="space-y-3 flex-1 flex flex-col justify-center">
                <h3 className="text-sm font-black text-blue-500 uppercase tracking-widest">Head Office</h3>
                <p className="text-xl font-bold text-slate-800 leading-snug">
                  358 Saraswatinagar, <br/>
                  Azad Society Rd, Ambawadi,<br/> 
                  Ahmedabad 380015, India
                </p>
              </div>
            </div>

            {/* Phone Card */}
            <div className="w-full h-full group bg-white/80 backdrop-blur-xl hover:bg-white border-2 border-white hover:border-blue-100 transition-all duration-500 rounded-[2rem] p-8 md:p-10 flex flex-col items-center text-center gap-6 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-2">
              <div className="w-20 h-20 md:w-24 md:h-24 flex-shrink-0 bg-blue-50 group-hover:bg-[rgb(32,38,130)] transition-colors duration-500 rounded-2xl md:rounded-[2rem] flex items-center justify-center text-[rgb(32,38,130)] group-hover:text-white -rotate-3 group-hover:rotate-3 shadow-inner">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                </svg>
              </div>
              <div className="space-y-3 flex-1 flex flex-col justify-center">
                <h3 className="text-sm font-black text-blue-500 uppercase tracking-widest">Call Us Directly</h3>
                <a href="tel:+919824025431" className="text-2xl lg:text-3xl font-black text-slate-800 hover:text-[rgb(32,38,130)] transition-colors inline-block mt-2">
                  +91 9824025431
                </a>
              </div>
            </div>

            {/* Email Card */}
            <div className="w-full h-full group bg-white/80 backdrop-blur-xl hover:bg-white border-2 border-white hover:border-blue-100 transition-all duration-500 rounded-[2rem] p-8 md:p-10 flex flex-col items-center text-center gap-6 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-2">
              <div className="w-20 h-20 md:w-24 md:h-24 flex-shrink-0 bg-blue-50 group-hover:bg-[rgb(32,38,130)] transition-colors duration-500 rounded-2xl md:rounded-[2rem] flex items-center justify-center text-[rgb(32,38,130)] group-hover:text-white rotate-3 group-hover:-rotate-3 shadow-inner">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
              </div>
              <div className="space-y-3 flex-1 flex flex-col justify-center">
                <h3 className="text-sm font-black text-blue-500 uppercase tracking-widest">Email Support</h3>
                <a href="mailto:support@earthcarbonfoundation.org" className="text-lg md:text-xl font-bold text-slate-800 hover:text-[rgb(32,38,130)] transition-colors break-all">
                  support@
                  earthcarbonfoundation.org
                </a>
              </div>
            </div>

          </div>

          {/* Footer Action */}
          <div className="mt-20 text-center">
             <Link href="/profile" className="inline-flex items-center gap-3 text-white bg-[rgb(32,38,130)] hover:bg-[rgb(44,53,176)] shadow-lg hover:shadow-xl hover:-translate-y-1 text-sm font-bold uppercase tracking-widest px-8 py-4 rounded-2xl transition-all duration-300">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                Return to Dashboard
             </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
