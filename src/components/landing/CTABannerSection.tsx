"use client";
import React from "react";
import Link from "next/link";

export default function CTABannerSection() {
  return (
    <section className="py-24 px-4 md:px-8 bg-slate-50">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-[2.5rem] p-8 md:p-14 shadow-[0_40px_100px_rgba(0,0,0,0.06)] border border-slate-100 flex flex-col items-center text-center gap-8 group transition-all duration-700 hover:shadow-[0_40px_100px_rgba(0,0,0,0.1)]">

          <div className="flex flex-col gap-4">
            <span className="text-xs font-black uppercase tracking-[0.4em] text-[rgb(32,38,130)] opacity-60">
              Join the Registry
            </span>
            <h2 className="text-3xl md:text-5xl font-black leading-tight text-[rgb(32,38,130)]">
              Start Your Climate <br /> Journey Today
            </h2>
            <p className="text-base md:text-xl text-slate-500 font-bold max-w-2xl leading-relaxed">
              Verified. Transparent. Permanent climate records for India.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Link
              href="/signin"
              className="bg-[rgb(32,38,130)] text-white font-black px-8 py-4 rounded-xl hover:bg-[#1e40af] transition-all hover:scale-[1.05] text-lg shadow-2xl shadow-blue-900/20"
            >
              Register Your Action →
            </Link>
            <Link
              href="/signin"
              className="border-2 border-slate-200 text-[rgb(32,38,130)] font-black px-8 py-4 rounded-xl hover:bg-slate-50 transition-all hover:scale-[1.05] text-lg"
            >
              Explore the Registry
            </Link>
          </div>

        </div>
      </div>
    </section>
  );
}
