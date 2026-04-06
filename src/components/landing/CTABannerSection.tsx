import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function CTABannerSection() {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      window.location.href = `/signin?email=${encodeURIComponent(email)}`;
    }
  };

  return (
    <section className="w-full bg-[#f9faf5] px-4 md:px-8 lg:px-16 py-16 md:py-24">
      <div className="max-w-7xl mx-auto relative w-full border border-white/5 rounded-none overflow-hidden shadow-2xl bg-zinc-900">
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

          {/* Email input + CTA */}
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-0 max-w-lg mx-auto shadow-2xl">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your business email"
              className="flex-1 px-6 py-4 bg-white/10 border border-white/20 rounded-none text-white placeholder:text-white/40 text-sm font-bold outline-none focus:bg-white/20 focus:border-[#a8f928] transition-all"
            />
            <button 
              type="submit"
              className="px-10 py-4 bg-[#a8f928] border border-[#a8f928] text-[#003527] font-black text-xs uppercase tracking-widest rounded-none hover:bg-[#96e020] transition-all whitespace-nowrap"
            >
              Request Access
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
