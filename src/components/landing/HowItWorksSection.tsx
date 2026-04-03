"use client";
import React, { useRef } from "react";
import { useInView } from "@/hooks/useAnimations";
import { User, BarChart3, Zap, CheckCircle } from "lucide-react";

const STEPS = [
  {
    number: "01",
    title: "Create Your Profile",
    description: "Register as an Individual, School, MSME, or Institution. Add your contact details and location.",
    icon: <User className="w-6 h-6" />,
    accent: "bg-[#f1f5f9]",
  },
  {
    number: "02",
    title: "Enter Baseline Usage",
    description: "Tell us your current energy (kWh), water (L), and waste (kg) consumption per year.",
    icon: <BarChart3 className="w-6 h-6" />,
    accent: "bg-[#f1f5f9]",
  },
  {
    number: "03",
    title: "Register Your Action",
    description: "Select your low-carbon action — Solar, Biogas, Rainwater, Composting, Recycling. Upload proof photos.",
    icon: <Zap className="w-6 h-6" />,
    accent: "bg-[#bfdbfe]",
  },
  {
    number: "04",
    title: "Get Verified Certificate",
    description: "Receive your Registry ID (ECF-XXXX), QR Code, Digital Signature, and Impact Certificate.",
    icon: <CheckCircle className="w-6 h-6" />,
    accent: "bg-[#bfdbfe]",
  },
];

export default function HowItWorksSection() {
  const ref = useRef(null);
  const isInView = useInView(ref);

  return (
    <section id="how-it-works" className="py-12 md:py-16 bg-[#f9faf5] px-4 md:px-8 border-b border-slate-100">
      <div className="max-w-7xl mx-auto" ref={ref}>
        <div className="flex flex-col items-center text-center mb-12">
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#003527]/50 mb-3">
            The Process
          </span>
          <h2 className="text-xl md:text-2xl font-black text-[#003527] mb-4" style={{ fontFamily: "Manrope, sans-serif" }}>
            How Registration Works
          </h2>
          <p className="text-[#414942] max-w-xl text-sm md:text-base font-medium leading-relaxed opacity-70">
            Four steps to get your low-carbon action on Indias permanent climate record.
          </p>
        </div>

        <div className="relative">
          {/* Connector Line (Desktop) */}
          <div className="hidden md:block absolute top-8 left-[10%] right-[10%] h-[1px] bg-slate-200 z-0" />

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative z-10">
            {STEPS.map((step, idx) => (
              <div
                key={idx}
                className={`flex flex-col items-center text-center group transition-all duration-700 relative`}
              >
                <div className={`relative w-16 h-16 ${idx < 2 ? 'bg-[#f0f3ee]' : 'bg-[#b0f0d6]'} rounded-none flex items-center justify-center text-[#003527] mb-6 shadow-sm group-hover:scale-105 transition-transform z-10`}>
                  {/* Step Number Badge */}
                  <div className="absolute -top-1.5 -left-1.5 bg-[#003527] text-white text-[8px] font-black w-6 h-6 rounded-none flex items-center justify-center z-20">
                    {step.number}
                  </div>
                  <span className="relative z-10">{step.icon}</span>
                </div>

                <div className="relative px-4 text-center">
                  <h3 className="text-sm font-black text-[#003527] mb-2">{step.title}</h3>
                  <p className="text-xs md:text-sm text-[#414942] font-bold leading-relaxed opacity-60 group-hover:opacity-100 transition-opacity">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 text-center flex flex-col items-center gap-4">
          <p className="text-[10px] md:text-xs text-[#414942] font-black tracking-widest uppercase opacity-40">
            Standardized via CEA India 2024 Emission Factors
          </p>
        </div>
      </div>
    </section>
  );
}
