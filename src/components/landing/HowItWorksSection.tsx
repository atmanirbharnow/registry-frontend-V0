"use client";
import React, { useRef } from "react";
import { useInView } from "@/hooks/useAnimations";

const STEPS = [
  {
    number: "01",
    title: "Create Your Profile",
    description: "Register as an Individual, School, MSME, or Institution. Add your contact details and location.",
    icon: "👤",
    accent: "bg-[#f1f5f9]",
  },
  {
    number: "02",
    title: "Enter Baseline Usage",
    description: "Tell us your current energy (kWh), water (L), and waste (kg) consumption per month.",
    icon: "📊",
    accent: "bg-[#f1f5f9]",
  },
  {
    number: "03",
    title: "Register Your Action",
    description: "Select your low-carbon action — Solar, Biogas, Rainwater, Composting, Recycling. Upload proof photos.",
    icon: "⚡",
    accent: "bg-[#bfdbfe]",
  },
  {
    number: "04",
    title: "Get Verified Certificate",
    description: "Receive your Registry ID (ECF-XXXX), QR Code, Digital Signature, and Impact Certificate.",
    icon: "✅",
    accent: "bg-[#bfdbfe]",
  },
];

export default function HowItWorksSection() {
  const ref = useRef(null);
  const isInView = useInView(ref);

  return (
    <section id="how-it-works" className="py-12 md:py-32 bg-[#f8fafc] px-4 md:px-8">
      <div className="max-w-7xl mx-auto" ref={ref}>
        <div className="flex flex-col items-center text-center mb-20">
          <span className="text-xs font-bold uppercase tracking-widest text-[#414942] mb-4">
            The Process
          </span>
          <h2 className="text-3xl md:text-5xl font-black text-[rgb(32,38,130)] mb-6">
            How Registration Works
          </h2>
          <p className="text-[#414942] max-w-2xl text-lg font-medium leading-relaxed">
            Four steps to get your low-carbon action on Indias permanent climate record.
          </p>
        </div>

        <div className="relative">
          {/* Connector Line (Desktop) */}
          <div className="hidden md:block absolute top-12 left-[10%] right-[10%] h-[2px] border-t-2 border-dashed border-[#bfdbfe] z-0" />

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative z-10">
            {STEPS.map((step, idx) => (
              <div 
                key={idx}
                className={`flex flex-col items-center text-center group transition-all duration-700 delay-[${idx * 150}ms] ${
                  isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                } relative`}
              >
                {/* Arrow Icon (Desktop Only, except for last item) */}
                {idx < STEPS.length - 1 && (
                  <div className="hidden md:flex absolute top-12 -right-4 translate-x-1/2 -translate-y-1/2 z-20 text-[#bfdbfe] animate-pulse">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                )}

                <div className={`relative w-24 h-24 ${step.accent} rounded-[2.5rem] flex items-center justify-center text-4xl mb-8 shadow-xl group-hover:scale-110 transition-transform z-10`}>
                  {/* Step Number Badge */}
                  <div className="absolute -top-2 -left-2 bg-[rgb(32,38,130)] text-white text-[10px] font-black w-8 h-8 rounded-full flex items-center justify-center shadow-lg z-20">
                    {step.number}
                  </div>
                  <span className="relative z-10">{step.icon}</span>
                </div>
                
                <div className="relative px-4 text-center">
                  <span className="absolute -top-12 left-1/2 -translate-x-1/2 text-[120px] font-black text-slate-100/50 -z-10 select-none pointer-events-none group-hover:text-[rgb(32,38,130)]/5 transition-colors duration-500">
                    {step.number}
                  </span>
                  <h3 className="text-xl font-black text-[rgb(32,38,130)] mb-3">{step.title}</h3>
                  <p className="text-sm text-[#414942] font-semibold leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-20 text-center flex flex-col items-center gap-4">
          <p className="text-xs text-[#414942] font-semibold italic max-w-xl">
             All calculations use CEA India 2024 emission factors. Admin verification ensures data accuracy.
          </p>
        </div>
      </div>
    </section>
  );
}
