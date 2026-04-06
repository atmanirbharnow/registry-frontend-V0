import React from "react";
import Link from "next/link";
import Image from "next/image";

interface ActionHubSectionProps {
  onStartStructuring: () => void;
}

export default function ActionHubSection({ onStartStructuring }: ActionHubSectionProps) {
  return (
    <>
    <section className="w-full bg-[#fcfdfe] py-12 px-4 md:px-8 lg:px-16 overflow-hidden border-b border-slate-100">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">

        {/* Card 1: Low Carbon Action Hub */}
        <div className="group relative bg-white border border-slate-200 p-8 md:p-10 flex flex-col justify-between overflow-hidden transition-all duration-500 hover:border-emerald-600/30">
          {/* Branded Background Watermark */}
          <div className="absolute right-0 bottom-0 w-3/4 h-3/4 opacity-[0.12] pointer-events-none group-hover:scale-110 transition-transform duration-1000">
             <Image 
               src="/plant-carbon-bg.png" 
               alt="Plant Carbon Background" 
               fill 
               className="object-cover grayscale" 
             />
          </div>

          <div className="relative z-10">
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[#003527]/40 mb-4">
              For Individuals & Schools
            </p>
            <h2
              className="text-xl md:text-2xl font-black text-[#003527] leading-tight mb-4"
              style={{ fontFamily: "Manrope, sans-serif", letterSpacing: "-0.01em" }}
            >
              Low Carbon <br />Action Hub
            </h2>
            <p className="text-sm md:text-base text-slate-500 font-semibold leading-relaxed mb-8 max-w-md opacity-90">
              Democratizing climate finance. Validate classroom recycling projects
              or personal commuting shifts as micro-credits.
            </p>

            <ul className="space-y-4 mb-10">
              <li className="flex items-start gap-4">
                <div className="w-8 h-8 bg-emerald-50 flex items-center justify-center text-[#003527] border border-emerald-100 flex-shrink-0">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" /></svg>
                </div>
                <div>
                  <span className="font-black text-sm text-[#003527] block">School Certification</span>
                  <p className="text-xs font-bold text-slate-400">Structured curriculum-based carbon tracking.</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <div className="w-8 h-8 bg-emerald-50 flex items-center justify-center text-[#003527] border border-emerald-100 flex-shrink-0">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="m9 12 2 2 4-4" /></svg>
                </div>
                <div>
                  <span className="font-black text-sm text-[#003527] block">Micro-Offsetting</span>
                  <p className="text-xs font-bold text-slate-400">Instant digital certificates for small-scale contributions.</p>
                </div>
              </li>
            </ul>
          </div>

          <div className="relative z-10 flex">
            <Link href="/signin" className="w-full sm:w-auto">
              <button className="w-full flex items-center justify-center gap-2 px-8 py-3.5 bg-[#b0f0d6] text-[#003527] font-black text-sm rounded-lg hover:bg-[#9debc8] transition-all border border-[#003527]/5">
                Register Action
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M7 7h10v10M7 17L17 7" /></svg>
              </button>
            </Link>
          </div>
        </div>

          {/* Card 2: Carbon Asset Structuring */}
          <div className="group relative bg-[#003527] p-8 md:p-10 flex flex-col justify-between overflow-hidden border border-[#003527]">
            {/* Technical Solar Blueprint Background */}
            <div className="absolute inset-0 z-0 opacity-10 pointer-events-none group-hover:scale-105 transition-transform duration-1000">
               <Image 
                 src="/solar-plant-bg.png" 
                 alt="Solar Asset Blueprint" 
                 fill 
                 className="object-cover mix-blend-overlay" 
               />
            </div>

            <div className="relative z-10">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#a8f928]/50 mb-4">
                For SMEs & EPCS
              </p>
              <h2
                className="text-xl md:text-2xl font-black text-white leading-tight mb-4"
                style={{ fontFamily: "Manrope, sans-serif", letterSpacing: "-0.01em" }}
              >
                Carbon Asset<br />Structuring
              </h2>
              <p className="text-sm md:text-base text-white/50 font-semibold leading-relaxed mb-8 max-w-sm opacity-90">
                Turn industrial efficiency and solar installations into bankable assets. Institutional-grade validation.
              </p>

              <ul className="space-y-4 mb-10">
                <li className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-white/5 flex items-center justify-center text-[#a8f928] border border-white/10 flex-shrink-0">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /></svg>
                  </div>
                  <div>
                    <span className="font-black text-sm text-white block">Registry-Ready Framework</span>
                    <p className="text-xs font-bold text-white/30">Pre-audit alignment with international credit standards.</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-white/5 flex items-center justify-center text-[#a8f928] border border-white/10 flex-shrink-0">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v2" /><path d="M12 20v2" /><path d="m4.93 4.93 1.41 1.41" /><path d="m17.66 17.66 1.41 1.41" /><path d="M2 12h2" /><path d="M20 12h2" /><path d="m6.34 17.66-1.41 1.41" /><path d="m19.07 4.93-1.41 1.41" /></svg>
                  </div>
                  <div>
                    <span className="font-black text-sm text-white block">Data Validation Logic</span>
                    <p className="text-xs font-bold text-white/30">Automated IoT integration for real-time emission tracking.</p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="relative z-10 flex">
              <button
                onClick={onStartStructuring}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 bg-[#a8f928] text-[#112000] font-black text-sm rounded-lg hover:bg-[#96e020] transition-all border border-transparent group"
              >
                Contact Us
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-y-[-1px] transition-transform"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>
              </button>
            </div>
          </div>

        </div>
      </section>
    </>
  );
}
