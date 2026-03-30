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
      label: "Total Registered Action",
      value: displayedRegistered,
      suffix: "",
      sub: "Across all sectors",
      accent: "from-blue-600 to-indigo-600",
      icon: "📋"
    },
    {
      label: "Total Verified Action",
      value: displayedVerified,
      suffix: "",
      sub: "Independently audited",
      accent: "from-emerald-600 to-teal-600",
      icon: "✅"
    },
    {
      label: "tCO₂e Reduced",
      value: displayedCO2,
      suffix: "t",
      sub: "Verified carbon reduction",
      accent: "from-cyan-600 to-blue-600",
      icon: "🌱"
    },
    {
      label: "Registered Organizations",
      value: displayedOrgs,
      suffix: "+",
      sub: "Climate action leaders",
      accent: "from-purple-600 to-indigo-600",
      icon: "🏢"
    }
  ];

  return (
    <section id="stats" className="py-24 bg-[#f8fafc] px-4 md:px-8">
      <div className="max-w-7xl mx-auto" ref={ref}>
        <div className="mb-16 flex flex-col items-center text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-[#414942] mb-4">
            Live Dashboard
          </span>
          <h2 className="text-3xl md:text-5xl font-black text-[rgb(32,38,130)]">
            Registry at a Glance
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {stats.map((stat, idx) => (
            <div 
              key={idx}
              className={`relative bg-white rounded-[2.5rem] p-8 shadow-[0_20px_50px_rgba(32,38,130,0.05)] border border-slate-100 flex flex-col items-center text-center group hover:-translate-y-2 transition-all duration-500 overflow-hidden ${
                isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
              }`}
              style={{ transitionDelay: `${idx * 100}ms` }}
            >
              <div className={`absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r ${stat.accent}`} />
              
              <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform">
                {stat.icon}
              </div>

              <span className="text-4xl md:text-5xl font-black text-[rgb(32,38,130)] mb-1">
                {loading ? "..." : <>{stat.value}{stat.suffix}</>}
              </span>
              
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#414942] mb-3">
                {stat.label}
              </span>

              <p className="text-xs font-medium text-slate-400">
                {stat.sub}
              </p>

              {/* Decorative Glow */}
              <div className={`absolute -bottom-12 -right-12 w-24 h-24 bg-gradient-to-br ${stat.accent} opacity-0 group-hover:opacity-10 rounded-full blur-2xl transition-opacity`} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
