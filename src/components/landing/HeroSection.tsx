"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";

export default function HeroSection() {
  return (
    <section 
      id="home" 
      className="relative min-h-screen flex items-center pt-10 md:pt-16 pb-16 px-4 md:px-8 bg-[#f8fafc] overflow-hidden"
    >
      {/* Background Blob */}
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-[#bfdbfe] opacity-15 blur-3xl rounded-full" />

      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-12 gap-8 items-center relative z-10">
        
        {/* Left Side: Content */}
        <div className="md:col-span-7 flex flex-col items-start gap-4">
          <span className="text-xs font-bold uppercase tracking-widest text-[#414942]">
            Earth Carbon Foundation
          </span>
          <h1 className="text-4xl md:text-6xl font-black text-[rgb(32,38,130)] leading-tight">
            Indias First Verified <br /> 
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[rgb(32,38,130)] to-[#1e40af]">
              Low-Carbon Action Registry
            </span>
          </h1>
          <p className="text-lg text-[#414942] max-w-xl leading-relaxed">
            Track CO₂e reduction, Atmanirbhar %, and Circularity Score. 
            Transparent. Verifiable. Permanent climate records for India.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 mt-6 w-full sm:w-auto">
            <Link
              href="/signin"
              className="bg-gradient-to-br from-[rgb(32,38,130)] to-[#1e40af] text-white px-8 py-4 rounded-xl font-bold text-base shadow-xl hover:shadow-2xl transition-all hover:scale-[1.02] text-center"
            >
              Register Your Action →
            </Link>
            <Link
              href="/signin"
              className="border-2 border-[rgb(32,38,130)] text-[rgb(32,38,130)] px-8 py-4 rounded-xl font-bold text-base hover:bg-[rgb(32,38,130)] hover:text-white transition-all text-center"
            >
              Verify a Certificate →
            </Link>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap gap-3 mt-8">
            {["🔒 SHA-256 Verified", "📋 Verra-Aligned", "🇮🇳 MoEF&CC Aligned"].map((badge) => (
              <span 
                key={badge}
                className="bg-[#f1f5f9] text-[#414942] text-[10px] md:text-xs font-bold px-3 py-1.5 rounded-full"
              >
                {badge}
              </span>
            ))}
          </div>
        </div>

        {/* Right Side: Animated Cool Hero Illustration */}
        <div className="md:col-span-5 flex justify-center items-center">
          <div className="relative group animate-[float_6s_ease-in-out_infinite]">
            <div className="relative w-80 h-80 md:w-[450px] md:h-[450px] bg-white rounded-[2rem] shadow-[0_40px_120px_rgba(32,38,130,0.1)] p-4 border border-slate-100 flex items-center justify-center overflow-hidden">
              <div className="relative w-full h-full">
                <Image
                  src="/hero-illustration.png"
                  alt="Earth Carbon Registry Illustration"
                  fill
                  className="object-cover rounded-xl"
                  priority
                />
              </div>
            </div>
            
            {/* Soft Ambient Glows */}
            <div className="absolute -top-12 -left-12 w-32 h-32 bg-blue-100/40 rounded-full blur-3xl" />
            <div className="absolute -bottom-12 -right-12 w-40 h-40 bg-slate-100/50 rounded-full blur-3xl" />
          </div>
        </div>

      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(1deg); }
        }
      `}</style>
    </section>
  );
}
