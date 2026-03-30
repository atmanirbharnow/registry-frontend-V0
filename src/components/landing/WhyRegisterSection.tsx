"use client";
import React from "react";

const BENEFITS = [
  {
    title: "Verified Certificate",
    icon: "📜",
    description: "Download a tamper-proof Impact Certificate with your Registry ID, QR code, and SHA-256 digital signature.",
  },
  {
    title: "Public Verification",
    icon: "🔍",
    description: "Anyone can verify your action at climateassetregistry.org/verify/[ID]. Fully transparent and permanent.",
  },
  {
    title: "Track 3 Metrics",
    icon: "📊",
    description: "See your CO₂e reduction, Atmanirbhar % (self-reliance), and Circularity % (waste diverted) in real-time.",
  },
  {
    title: "Social Recognition",
    icon: "🌱",
    description: "Share your verified climate action on LinkedIn, Twitter, and WhatsApp. Show your commitment to the planet.",
  },
  {
    title: "Carbon Credit Pipeline",
    icon: "💰",
    description: "Verified actions contribute to Indias carbon project aggregation pipeline aligned with Verra and MoEF&CC.",
  },
  {
    title: "Community Impact",
    icon: "🏫",
    description: "Schools, hospitals, MSMEs — all entities can register. Build Indias most comprehensive climate action database.",
  },
];

export default function WhyRegisterSection() {
  return (
    <section id="why-register" className="py-12 md:py-32 bg-[#f8fafc] px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col items-center text-center mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-[#414942] mb-4">
            Why Register
          </span>
          <h2 className="text-3xl md:text-5xl font-black text-[rgb(32,38,130)] mb-6">
            Beyond a Certificate
          </h2>
          <p className="text-[#414942] max-w-2xl text-lg font-medium">
             Your data builds Indias climate ledger, providing verifiable proof of your environmental impact.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {BENEFITS.map((benefit, idx) => (
            <div 
              key={idx}
              className="bg-[#f1f5f9] rounded-[2rem] p-6 md:p-8 group transition-all duration-300 hover:bg-[#f1f5f9] hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="text-4xl mb-6">{benefit.icon}</div>
              <h3 className="text-xl font-black text-[rgb(32,38,130)] mb-3">{benefit.title}</h3>
              <p className="text-sm text-[#414942] leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity font-medium">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
