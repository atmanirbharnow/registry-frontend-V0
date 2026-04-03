"use client";
import React, { useRef } from "react";
import { useLiveStats } from "@/hooks/useLiveStats";
import { useCountUp, useInView } from "@/hooks/useAnimations";

export default function KPIGrid() {
  const { 
    totalRegisteredActions, 
    totalVerifiedActions, 
    totalCO2eTonnes, 
    totalOrganizations, 
    loading 
  } = useLiveStats();
  const ref = useRef(null);
  const isInView = useInView(ref);

  const displayedCO2 = useCountUp(isInView ? totalCO2eTonnes : 0);
  const displayedRegistered = useCountUp(isInView ? totalRegisteredActions : 0);
  const displayedVerified = useCountUp(isInView ? totalVerifiedActions : 0);
  const displayedOrgs = useCountUp(isInView ? totalOrganizations : 0);

  const stats = [
    { 
      label: "Total Registered Actions", 
      value: displayedRegistered, 
      suffix: "", 
      sub: "Across all sectors" 
    },
    { 
      label: "Total Verified Actions", 
      value: displayedVerified, 
      suffix: "", 
      sub: "Independently audited" 
    },
    { 
      label: "tCO₂e Reduced", 
      value: displayedCO2, 
      suffix: "t", 
      sub: "Verified carbon reduction" 
    },
    { 
      label: "Registered Organizations", 
      value: displayedOrgs, 
      suffix: "+", 
      sub: "Climate action leaders" 
    },
  ];

  return (
    <section id="stats" className="w-full bg-white px-4 md:px-8 lg:px-16 py-12 md:py-16 border-b border-slate-100">
      {/* Section Header */}
      <div className="max-w-7xl mx-auto mb-10 flex flex-col items-center text-center">
        <h2
          className="text-xl md:text-2xl font-black text-[#003527] mb-3"
          style={{ fontFamily: "Manrope, sans-serif" }}
        >
          Built on High-Trust Logic
        </h2>
        <p className="text-xs md:text-sm text-[#414942] max-w-xl leading-relaxed opacity-70">
          Every gram of carbon registered is backed by a verifiable chain of
          custody and rigorous environmental math.
        </p>
      </div>

      {/* Stats Grid — 4 columns on desktop with high-trust gaps */}
      <div
        ref={ref}
        className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8"
      >
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className="bg-[#003527] p-8 flex flex-col justify-between min-h-[180px] border border-white/5 rounded-none shadow-xl hover:shadow-[#003527]/10 transition-all duration-300"
            style={{ transitionDelay: `${idx * 100}ms` }}
          >
            <p className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] text-white/40 mb-6 leading-tight">
              {stat.label}
            </p>
            <div className="flex flex-col flex-grow justify-end">
              <div className="flex items-baseline gap-1 flex-wrap">
                <span className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-white leading-none tracking-tight">
                  {loading ? "—" : stat.value}
                </span>
                <span className="text-lg md:text-xl font-black text-[#a8f928] leading-none">
                  {loading ? "" : stat.suffix}
                </span>
              </div>
              <p className="text-[10px] text-white/30 mt-4 font-bold uppercase tracking-widest leading-tight">{stat.sub}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
