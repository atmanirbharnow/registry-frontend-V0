"use client";
import React, { useRef } from "react";
import { useLiveStats } from "@/hooks/useLiveStats";
import { useCountUp, useInView } from "@/hooks/useAnimations";

export default function KPIGrid() {
  const { totalActions, verifiedActions, totalCO2eTonnes, totalEntities, loading } = useLiveStats();
  const ref = useRef(null);
  const isInView = useInView(ref);

  const displayedCO2 = useCountUp(isInView ? totalCO2eTonnes : 0);
  const displayedActions = useCountUp(isInView ? verifiedActions : 0);
  const displayedEntities = useCountUp(isInView ? totalEntities : 0);
  const pendingActions = totalActions - verifiedActions;

  // Placeholder static stats
  const atmanirbharAvg = 68.4;
  const totalSavingsCr = Math.round((totalCO2eTonnes * 7) / 10000000 * 100) / 100; // Estimated ₹7/kg savings

  return (
    <section id="stats" className="py-12 md:py-32 bg-[#f8fafc] px-4 md:px-8">
      <div className="max-w-7xl mx-auto" ref={ref}>
        <div className="mb-16 flex flex-col items-center text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-[#414942] mb-4">
            Live Dashboard
          </span>
          <h2 className="text-3xl md:text-5xl font-black text-[rgb(32,38,130)]">
            Registry at a Glance
          </h2>
        </div>

        <div className={`grid grid-cols-1 md:grid-cols-5 gap-6 transition-all duration-700 ${isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
          
          {/* Card 1: Large Primary Stat */}
          <div className="md:col-span-2 relative overflow-hidden bg-[#f1f5f9] rounded-[2rem] p-5 md:p-8 min-h-[180px] md:min-h-[224px] flex flex-col justify-between group">
            <div className="z-10">
              <span className="text-[10px] font-bold text-[#414942] uppercase tracking-[0.2em]">Total tCO₂e Reduced</span>
              <div className="flex items-baseline gap-2 mt-2 md:mt-2 md:mt-4">
                <span className="text-4xl md:text-6xl font-black text-[rgb(32,38,130)]">
                  {displayedCO2}
                </span>
                <span className="text-lg md:text-xl font-bold text-[rgb(32,38,130)]">tCO₂e</span>
              </div>
            </div>
            <p className="text-[#0060ac] text-xs font-bold z-10 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-[#0060ac] rounded-full" />
              Real-time Impact Data
            </p>
            {/* Ambient Blob */}
            <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-[#bfdbfe] opacity-20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-1000" />
          </div>

          {/* Card 2: Verified Actions */}
          <div className="bg-white rounded-[2rem] p-6 md:p-6 md:p-8 shadow-[0_20px_40px_rgba(26,28,26,0.04)] flex flex-col justify-between hover:scale-[1.02] transition-all">
             <span className="text-[10px] font-bold text-[#414942] uppercase tracking-widest">Verified Actions</span>
             <div className="mt-2 md:mt-4">
               <span className="text-3xl md:text-4xl font-black text-[rgb(32,38,130)]">{displayedActions}</span>
               <p className="text-[10px] md:text-xs text-[#414942] font-semibold mt-1">Actions Registered</p>
             </div>
          </div>

          {/* Card 3: Atmanirbhar Score */}
          <div className="bg-white rounded-[2rem] p-6 md:p-6 md:p-8 shadow-[0_20px_40px_rgba(26,28,26,0.04)] flex flex-col justify-between hover:scale-[1.02] transition-all">
             <span className="text-[10px] font-bold text-[#414942] uppercase tracking-widest">Atmanirbhar %</span>
             <div className="mt-2 md:mt-4">
               <span className="text-3xl md:text-4xl font-black text-[#0060ac]">{atmanirbharAvg}%</span>
               <p className="text-[10px] md:text-xs text-[#414942] font-semibold mt-1">Avg. Self-Reliance</p>
             </div>
          </div>

          {/* Card 4: Dark Accent Stat */}
          <div className="bg-[rgb(32,38,130)] rounded-[2rem] p-6 md:p-8 text-[#bfdbfe] flex flex-col justify-between hover:scale-[1.02] transition-all">
             <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">Pending Verification</span>
             <div className="mt-2 md:mt-4 text-white">
               <span className="text-3xl md:text-4xl font-black">{pendingActions}</span>
               <p className="text-[10px] md:text-xs font-semibold mt-1 opacity-70">Awaiting Review</p>
             </div>
          </div>

          {/* Card 5: Large Savings Stat */}
          <div className="md:col-span-2 relative overflow-hidden bg-white border border-[#e2e8f0] rounded-[2rem] p-6 md:p-8 flex flex-col justify-between hover:shadow-xl transition-all group">
            <div>
              <span className="text-[10px] font-bold text-[#414942] uppercase tracking-[0.2em]">Total ₹ Savings</span>
              <div className="flex items-baseline gap-2 mt-2 md:mt-2 md:mt-4">
                <span className="text-3xl md:text-5xl font-black text-[rgb(32,38,130)]">
                  ₹{totalSavingsCr.toFixed(2)}
                </span>
                <span className="text-lg md:text-xl font-bold text-[rgb(32,38,130)]">Cr</span>
              </div>
            </div>
            <p className="text-[#414942] text-xs font-medium opacity-60 italic">
              Estimated cumulative savings from resource efficiency.
            </p>
            <div className="absolute top-0 right-0 w-24 h-24 bg-[rgb(32,38,130)] opacity-0 group-hover:opacity-[0.03] rounded-bl-full transition-opacity" />
          </div>

          {/* Card 6: Small entity stat (bonus) */}
           <div className="md:col-span-3 bg-[#f1f5f9] rounded-[2rem] p-6 md:p-8 flex items-center justify-between group">
             <div className="flex flex-col gap-1">
               <span className="text-[10px] font-bold text-[#414942] uppercase tracking-widest tracking-widest">Active Entities</span>
               <span className="text-2xl md:text-3xl font-black text-[rgb(32,38,130)]">{displayedEntities}+</span>
             </div>
             <div className="flex -space-x-4">
               {[1,2,3,4].map(i => (
                 <div key={i} className="w-12 h-12 rounded-full border-4 border-[#f1f5f9] bg-[#1e40af] flex items-center justify-center text-[10px] text-white font-bold overflow-hidden">
                   {i === 4 ? "+1k" : <div className="w-full h-full bg-[rgb(32,38,130)]/20" />}
                 </div>
               ))}
             </div>
           </div>

        </div>
      </div>
    </section>
  );
}
