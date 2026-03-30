"use client";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import HeroSection from "@/components/landing/HeroSection";
import LiveStatsBar from "@/components/landing/LiveStatsBar";
import KPIGrid from "@/components/landing/KPIGrid";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import ScopeSection from "@/components/landing/ScopeSection";
import WhyRegisterSection from "@/components/landing/WhyRegisterSection";
import VerificationSection from "@/components/landing/VerificationSection";
import CTABannerSection from "@/components/landing/CTABannerSection";
import ContactSection from "@/components/landing/ContactSection";

export default function LandingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && !loading) {
      router.replace("/profile");
    }
  }, [user, loading, router]);

  if (loading || user) {
     return <div className="min-h-screen bg-[#f9faf5] flex items-center justify-center">
       <div className="w-10 h-10 border-2 border-[#144227] border-t-transparent rounded-full animate-spin" />
     </div>
  }

  return (
    <div className="flex flex-col w-full bg-[#f9faf5]">
      {/* Sections with unique IDs for scroll-spy and anchors */}
      <HeroSection />           {/* id="home" */}
      <LiveStatsBar />          {/* (no anchor, follows hero) */}
      <KPIGrid />               {/* id="stats" */}
      <HowItWorksSection />     {/* id="how-it-works" */}
      <ScopeSection />          {/* id="scope" */}
      <WhyRegisterSection />    {/* id="why-register" */}
      <VerificationSection />   {/* id="verification" */}
      <CTABannerSection />      {/* (no anchor) */}
      <ContactSection />        {/* id="contact" */}
    </div>
  );
}
