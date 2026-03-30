"use client";
import React from "react";
import { useLiveStats } from "@/hooks/useLiveStats";

export default function LiveStatsBar() {
  const { verifiedActions, totalCO2eTonnes, totalSchools, loading } = useLiveStats();

  const stats = [
    { label: "Verified Actions", value: verifiedActions },
    { label: "tCO₂e Reduced", value: totalCO2eTonnes },
    { label: "Schools Registered", value: totalSchools },
    { label: "Transparency", value: "100%" },
  ];

  return (
    <section className="w-full bg-[#f8fafc] py-12 px-4 border-y border-slate-100">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
          {stats.map((stat, i) => (
            <div 
              key={i} 
              className={`bg-white p-6 md:p-8 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-50 flex flex-col items-center text-center transition-all duration-500 hover:-translate-y-1 hover:shadow-xl ${
                loading ? "animate-pulse" : ""
              }`}
            >
               <span className="text-3xl md:text-5xl font-black text-[rgb(32,38,130)] mb-2">
                {loading ? "..." : stat.value}
              </span>
              <span className="text-[10px] md:text-xs uppercase tracking-[0.2em] font-black text-slate-400">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
