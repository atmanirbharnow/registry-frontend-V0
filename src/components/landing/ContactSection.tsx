"use client";
import React from "react";
import Link from "next/link";

const CONTACT_INFO = [
  {
    title: "Office",
    icon: "📍",
    content: "358 Saraswatinagar, Azad Society Rd, Ambawadi, Ahmedabad 380015, India",
    href: "https://maps.app.goo.gl/9uK8iV57bZ8x8L8C9", // Placeholder
  },
  {
    title: "Call Us",
    icon: "📞",
    content: "+91 9824025431",
    href: "tel:+919824025431",
  },
  {
    title: "Email",
    icon: "✉️",
    content: "support@earthcarbonfoundation.org",
    href: "mailto:support@earthcarbonfoundation.org",
  },
];

const QUICK_ACTIONS = [
  { label: "Already registered?", sub: "Go to your Profile", href: "/profile" },
  { label: "Want to verify an action?", sub: "Enter Registry ID", href: "/verify" },
  { label: "New to the registry?", sub: "Get Started Now", href: "/signin" },
];

export default function ContactSection() {
  return (
    <section id="contact" className="py-12 md:py-32 bg-[#f8fafc] px-4 md:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16">
        
        {/* Left Side: Contact Info */}
        <div className="flex flex-col gap-12">
          <div className="flex flex-col gap-4">
            <span className="text-xs font-bold uppercase tracking-widest text-[#414942]">
              Get In Touch
            </span>
            <h2 className="text-3xl md:text-5xl font-black text-[rgb(32,38,130)]">
              Contact Us
            </h2>
          </div>

          <div className="space-y-6">
            {CONTACT_INFO.map((info) => (
              <a 
                key={info.title}
                href={info.href}
                target={info.href.startsWith("http") ? "_blank" : undefined}
                rel="noopener noreferrer"
                className="group bg-white rounded-[2rem] p-6 flex gap-6 items-start hover:shadow-xl transition-all hover:scale-[1.01] border border-[#f1f5f9]"
              >
                <div className="w-14 h-14 bg-[#bfdbfe] text-[rgb(32,38,130)] rounded-full flex items-center justify-center text-2xl flex-shrink-0 group-hover:scale-110 transition-transform">
                  {info.icon}
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className="text-sm font-black text-[rgb(32,38,130)] opacity-60 uppercase tracking-widest">{info.title}</h3>
                  <p className="text-base font-bold text-[#1a1c1a] leading-relaxed group-hover:text-[rgb(32,38,130)] transition-colors">{info.content}</p>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Right Side: Quick Action Cards */}
        <div className="flex flex-col gap-12">
          <div className="bg-[rgb(32,38,130)] rounded-[2.5rem] p-10 text-[#bfdbfe] flex flex-col gap-4">
             <h3 className="text-2xl font-black text-white">Join the Community</h3>
             <p className="text-sm font-medium leading-relaxed opacity-80">
               Earth Carbon Foundation is a climate tech initiative under validation with MoEF&CC and Verra. Build Indias most comprehensive climate action database.
             </p>
          </div>

          <div className="space-y-4">
            {QUICK_ACTIONS.map((action) => (
              <Link 
                key={action.label}
                href={action.href}
                className="group bg-white rounded-[2rem] p-6 flex justify-between items-center text-[rgb(32,38,130)] hover:bg-[rgb(32,38,130)] hover:text-white transition-all shadow-[0_10px_30px_rgba(26,28,26,0.04)] border border-[#f1f5f9]"
              >
                <div className="flex flex-col gap-1">
                  <h4 className="text-base font-black leading-tight text-inherit">{action.label}</h4>
                  <p className="text-xs font-bold opacity-60 tracking-widest uppercase text-slate-500 group-hover:text-[#bfdbfe]">
                    {action.sub}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-full border border-[#f1f5f9] flex items-center justify-center group-hover:border-[#bfdbfe] transition-colors">
                  <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </div>

      </div>
      
      <div className="mt-20 flex flex-col items-center text-center gap-4 border-t border-[#f1f5f9] pt-12">
        <p className="text-xs text-[#414942] font-semibold tracking-wide">
          Earth Carbon Foundation is a climate tech initiative under validation with MoEF&CC and Verra.
        </p>
      </div>
    </section>
  );
}
