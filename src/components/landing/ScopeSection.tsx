import React from "react";
import Image from "next/image";
import { Zap, Droplets, Recycle, ShieldCheck } from "lucide-react";

const PILLARS = [
  {
    title: "Energy",
    icon: <Zap className="w-5 h-5 text-[#a8f928]" />,
    actions: [
      "Rooftop Solar (kW)",
      "Solar Water Heating",
      "LED Retrofit",
      "Biogas (cooking)",
    ],
  },
  {
    title: "Water",
    icon: <Droplets className="w-5 h-5 text-[#a8f928]" />,
    actions: [
      "Rain Water Harvesting",
      "Waste Water Recycled",
      "Waterless Urinals",
    ],
  },
  {
    title: "Waste",
    icon: <Recycle className="w-5 h-5 text-[#a8f928]" />,
    actions: [
      "Waste Composting",
    ],
  },
];

export default function TrustAndScopeSection() {
  return (
    <section id="scope" className="py-12 md:py-20 bg-[#f8faf7] px-4 md:px-8">
      <div className="max-w-7xl mx-auto space-y-8 md:space-y-12">
        
        {/* Header (Optional, if needed, but the user asked for cards) */}
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-stretch">
          
          {/* Left Card: The Digital Conservator Framework */}
          <div className="group bg-white p-8 md:p-10 flex flex-col items-start justify-between border border-[#003527]/5 relative h-full overflow-hidden">
            {/* Branded Background Watermark */}
            <div className="absolute inset-0 z-0 opacity-[0.14] pointer-events-none group-hover:scale-105 transition-transform duration-1000">
               <Image 
                 src="/plant-carbon-bg.png" 
                 alt="Plant Carbon Framework Background" 
                 fill 
                 className="object-cover grayscale" 
               />
            </div>
            <div className="space-y-8">
              {/* Animated Technical Icon */}
              <div className="w-12 h-12 bg-[#eff7f2] flex items-center justify-center text-[#003527] relative">
                <ShieldCheck className="w-6 h-6 relative z-10" strokeWidth={2.5} />
                <div className="absolute inset-0 bg-[#003527]/5 animate-ping rounded-none" />
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[#003527]/40">
                    Transparent by Design
                  </p>
                  <h2 className="text-xl md:text-2xl font-black text-[#003527] leading-tight" style={{ fontFamily: "Manrope, sans-serif" }}>
                    Digital Conservator <br />Framework
                  </h2>
                </div>
                
                <div className="space-y-4 text-[13px] md:text-sm text-[#414942] font-semibold leading-relaxed opacity-90 max-w-sm">
                  <p>
                    Our proprietary data logic engine processes complex environmental
                    data into clean, trustable assets. We eliminate greenwashing with
                    institutional-grade, immutable data logs.
                  </p>
                  <p>
                    Every action receives a unique Registry ID and a
                    SHA-256 digital signature, ensuring permanent record integrity.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Card: Registry Scope */}
          <div className="group bg-[#003527] p-8 md:p-10 text-white relative overflow-hidden flex flex-col justify-between h-full border border-[#003527]">
            {/* Technical Solar Blueprint Background */}
            <div className="absolute inset-0 z-0 opacity-[0.14] pointer-events-none group-hover:scale-105 transition-transform duration-1000">
               <Image 
                 src="/solar-plant-bg.png" 
                 alt="Solar Asset Blueprint" 
                 fill 
                 className="object-cover mix-blend-overlay" 
               />
            </div>

            <div className="relative z-10 space-y-10">
              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#a8f928]/60">
                  Registry Scope
                </p>
                <h3 className="text-xl md:text-2xl font-black leading-tight text-white">What Actions Can Be Registered</h3>
              </div>

              {/* Grid 2-Column */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-10">
                {/* Column 1: Energy */}
                <div className="space-y-5">
                  <div className="flex items-center gap-3 border-b border-white/10 pb-2">
                    {PILLARS[0].icon}
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-[#a8f928]/80">{PILLARS[0].title}</h4>
                  </div>
                  <ul className="space-y-2.5">
                    {PILLARS[0].actions.map((action, i) => (
                      <li key={i} className="flex items-start gap-2 text-[12px] text-white/70 font-bold hover:text-[#a8f928] cursor-default transition-colors">
                        <span className="text-[#a8f928]">•</span>
                        {action}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Column 2: Water & Waste */}
                <div className="space-y-8">
                  {/* Water */}
                  <div className="space-y-5">
                    <div className="flex items-center gap-3 border-b border-white/10 pb-2">
                      {PILLARS[1].icon}
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-[#a8f928]/80">{PILLARS[1].title}</h4>
                    </div>
                    <ul className="space-y-2.5">
                      {PILLARS[1].actions.map((action, i) => (
                        <li key={i} className="flex items-start gap-2 text-[12px] text-white/70 font-bold hover:text-[#a8f928] transition-colors">
                          <span className="text-[#a8f928]">•</span>
                          {action}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Waste */}
                  <div className="space-y-5">
                    <div className="flex items-center gap-3 border-b border-white/10 pb-2">
                      {PILLARS[2].icon}
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-[#a8f928]/80">{PILLARS[2].title}</h4>
                    </div>
                    <ul className="space-y-2.5">
                      {PILLARS[2].actions.map((action, i) => (
                        <li key={i} className="flex items-start gap-2 text-[12px] text-white/70 font-bold hover:text-[#a8f928] transition-colors">
                          <span className="text-[#a8f928]">•</span>
                          {action}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
