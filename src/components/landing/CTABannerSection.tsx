import React from "react";
import Link from "next/link";
import Image from "next/image";

export default function CTABannerSection() {
  return (
    <section className="w-full bg-[#f9faf5] px-4 md:px-8 lg:px-16 py-16 md:py-24">
      <div className="max-w-7xl mx-auto relative w-full border border-white/5 rounded-lg overflow-hidden shadow-2xl bg-zinc-900">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <Image 
            src="/climate asset logo bw.jpg" 
            alt="Registry Logo Background" 
            fill 
            priority={true}
            className="object-cover opacity-60" 
          />
        </div>
        <div className="absolute inset-0 z-10 bg-gradient-to-br from-black/90 via-black/40 to-transparent" />

        <div className="relative z-20 px-8 py-16 md:py-24 text-center">
          <h2
            className="text-2xl md:text-4xl font-black text-white mb-6 leading-tight max-w-2xl mx-auto"
            style={{ fontFamily: "Manrope, sans-serif", letterSpacing: "-0.01em" }}
          >
            Ready to quantify your impact?
          </h2>
          <p className="text-sm md:text-lg text-white/70 mb-12 max-w-xl mx-auto leading-relaxed font-medium">
            Join 1,200+ organizations building a more structured green economy. 
            Secure your digital certificate today.
          </p>

          <div className="flex justify-center">
            <Link 
              href="/signin"
              className="px-12 py-5 bg-[#a8f928] border border-[#a8f928] text-[#003527] font-black text-xs md:text-sm uppercase tracking-[0.2em] rounded-lg hover:bg-[#96e020] transition-all shadow-xl hover:shadow-[#a8f928]/20 flex items-center gap-3 group"
            >
              Get Started Now
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
