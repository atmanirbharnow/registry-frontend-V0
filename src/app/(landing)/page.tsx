"use client";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import HeroSection from "@/components/landing/HeroSection";
import ActionHubSection from "@/components/landing/ActionHubSection";

import KPIGrid from "@/components/landing/KPIGrid";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import TrustAndScopeSection from "@/components/landing/ScopeSection";
import WhyRegisterSection from "@/components/landing/WhyRegisterSection";
import CTABannerSection from "@/components/landing/CTABannerSection";
import ContactSection from "@/components/landing/ContactSection";
import ContactModal from "@/components/landing/ContactModal";

export default function LandingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = React.useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = React.useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && user && !loading) {
      router.replace("/profile");
    }
  }, [user, loading, router, mounted]);

  if (loading || !mounted) {
     return (
       <div className="min-h-screen bg-[#f9faf5] flex items-center justify-center">
         <div className="w-10 h-10 border-2 border-[#144227] border-t-transparent rounded-full animate-spin" />
       </div>
     );
  }

  return (
    <div className="flex flex-col w-full bg-[#f9faf5]">
      {/* Sections with unique IDs for scroll-spy and anchors */}
      <HeroSection onStartStructuring={() => setIsContactModalOpen(true)} />           {/* id="home" */}
      <ActionHubSection onStartStructuring={() => setIsContactModalOpen(true)} />

      <KPIGrid />               {/* id="stats" */}
      <TrustAndScopeSection />  {/* id="trust-scope" */}
      <HowItWorksSection />     {/* id="how-it-works" */}
      <WhyRegisterSection />    {/* id="why-register" */}
      <CTABannerSection />      {/* (no anchor) */}
      <ContactSection />        {/* id="contact" */}
      
      {/* Hidden Modals */}
      <ContactModal 
        isOpen={isContactModalOpen} 
        onClose={() => setIsContactModalOpen(false)} 
      />
    </div>
  );
}
