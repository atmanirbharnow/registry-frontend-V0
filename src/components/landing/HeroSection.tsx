"use client";
import React from "react";
import Link from "next/link";

interface HeroSectionProps {
  onStartStructuring: () => void;
}

export default function HeroSection({ onStartStructuring }: HeroSectionProps) {
  return (
    <section
      id="home"
      className="relative w-full bg-white pt-16 pb-12 px-4 md:px-8 lg:px-16 overflow-hidden border-b border-slate-100"
    >
      {/* Sharp Decorative Elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50/40 -translate-y-12 translate-x-12 rotate-45 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-50/30 translate-y-12 -translate-x-12 -rotate-12 pointer-events-none" />

      {/* Badge container centered */}
      <div className="mb-6 flex justify-center animate-in fade-in slide-in-from-top-4 duration-700">
        <span className="inline-flex items-center gap-2 bg-[#003527]/5 border border-[#003527]/10 text-[#003527] text-[9px] font-black uppercase tracking-[0.3em] px-4 py-2 rounded-none">
          <span className="w-1 h-1 bg-[#a8f928]" />
          Global Carbon Standard V2.4
        </span>
      </div>

      {/* Headline centered */}
      <div className="max-w-4xl mx-auto text-center space-y-6 relative z-10">
        <h1
          className="text-2xl md:text-3xl lg:text-4xl font-black text-[#003527] leading-[1.1] tracking-tight animate-in fade-in zoom-in-95 duration-1000 delay-100"
          style={{ fontFamily: "Manrope, sans-serif", letterSpacing: "-0.01em" }}
        >
          We convert climate actions into structured assets.
        </h1>
        <p className="mt-6 text-sm md:text-lg text-slate-500 font-semibold max-w-xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300 opacity-90">
          Earth Carbon Registry bridges the gap between grassroots environmentalism and institutional finance. Unlock the intrinsic value of every carbon-saving effort.
        </p>
      </div>

      {/* CTA Buttons centered */}
      <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500">
        <Link href="/signin" className="w-full sm:w-auto">
          <button className="w-full flex items-center justify-center gap-3 px-8 py-3.5 bg-[#a8f928] text-[#112000] font-black text-sm rounded-none hover:bg-[#96e020] transition-all border border-[#112000]/5 shadow-sm group">
            Start Small Climate Action
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </button>
        </Link>

        <button 
          onClick={onStartStructuring}
          className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-3.5 bg-[#003527] text-white font-black text-sm rounded-none hover:bg-[#002219] transition-all border border-transparent shadow-sm cursor-pointer group"
        >
          Structure Your Carbon Assets
          <span className="opacity-60 group-hover:scale-110 transition-transform">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="0" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
          </span>
        </button>
      </div>
    </section>
  );
}
