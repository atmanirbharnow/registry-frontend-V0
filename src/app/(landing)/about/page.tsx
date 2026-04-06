"use client";
import React from "react";
import ScopeSection from "@/components/landing/ScopeSection";
import WhyRegisterSection from "@/components/landing/WhyRegisterSection";

export default function AboutPage() {
  return (
    <div className="pt-24 space-y-20">
      <section className="max-w-4xl mx-auto px-4 md:px-8">
        <h1 className="text-4xl md:text-5xl font-black text-[#144227] mb-8 text-center">
            About Climate Asset Registry
        </h1>
        <div className="space-y-6 text-[#414942] text-lg font-medium leading-relaxed">
            <p>
                Climate Asset Registry tracks verified low-carbon actions and
                carbon-credit preparedness — not instant credits.
            </p>
            <p>
                We help projects assess eligibility early and avoid rejection,
                retroactive risks, and reputational exposure. Our platform is 
                designed to bring transparency to Indias climate action landscape.
            </p>
        </div>
      </section>

      {/* Re-using sections as info pieces for About page */}
      <WhyRegisterSection />
      <ScopeSection />
    </div>
  );
}
