import React from "react";
import Link from "next/link";
import { MapPin, Phone, Mail } from "lucide-react";

const CONTACT_INFO = [
  {
    title: "Office",
    icon: <MapPin className="w-5 h-5" />,
    content: "358 Saraswatinagar, Azad Society Rd, Ambawadi, Ahmedabad 380015, India",
    href: "https://maps.app.goo.gl/9uK8iV57bZ8x8L8C9", // Placeholder
  },
  {
    title: "Call Us",
    icon: <Phone className="w-5 h-5" />,
    content: "+91 9824025431",
    href: "tel:+919824025431",
  },
  {
    title: "Email",
    icon: <Mail className="w-5 h-5" />,
    content: "support@climateassetregistry.org",
    href: "mailto:support@climateassetregistry.org",
  },
];

const QUICK_ACTIONS = [
  { label: "Already registered?", sub: "Go to your Profile", href: "/profile" },
  { label: "Want to verify an action?", sub: "Enter Registry ID", href: "/verify" },
  { label: "New to the registry?", sub: "Get Started Now", href: "/signin" },
];

export default function ContactSection() {
  return (
    <section id="contact" className="py-12 md:py-16 bg-[#f9faf5] px-4 md:px-8 border-b border-slate-100">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-16">
        
        {/* Left Side: Contact Info */}
        <div className="flex flex-col gap-8 items-center text-center lg:items-start lg:text-left">
          <div className="flex flex-col gap-3 items-center lg:items-start">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#003527]/50">
              Get In Touch
            </span>
            <h2 className="text-xl md:text-2xl lg:text-3xl font-black text-[#003527]" style={{ fontFamily: "Manrope, sans-serif" }}>
              Contact Us
            </h2>
          </div>

          <div className="space-y-4 w-full max-w-lg mx-auto lg:mx-0">
            {CONTACT_INFO.map((info) => (
              <a 
                key={info.title}
                href={info.href}
                target={info.href.startsWith("http") ? "_blank" : undefined}
                rel="noopener noreferrer"
                className="group bg-white rounded-none p-6 flex gap-6 items-center hover:bg-emerald-50/50 transition-all border border-[#f1f5f9] text-left"
              >
                <div className="w-10 h-10 bg-[#b0f0d6] text-[#003527] rounded-none flex items-center justify-center text-lg flex-shrink-0 group-hover:scale-105 transition-transform">
                  {info.icon}
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className="text-xs font-black text-[#003527] opacity-40 uppercase tracking-widest">{info.title}</h3>
                  <p className="text-sm md:text-base font-bold text-[#1a1c1a] leading-snug group-hover:text-[#003527] transition-colors">{info.content}</p>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Right Side: Quick Action Cards */}
        <div className="flex flex-col gap-8">
          <div className="bg-[#003527] rounded-none p-8 md:p-10 text-white flex flex-col gap-4">
             <h3 className="text-lg font-black text-white" style={{ fontFamily: "Manrope, sans-serif" }}>Join the Community</h3>
             <p className="text-xs font-medium leading-relaxed opacity-60">
               Climate Asset Foundation is a climate tech initiative under validation with MoEF&CC and Verra. Build Indias most comprehensive climate action database.
             </p>
          </div>

          <div className="space-y-2">
            {QUICK_ACTIONS.map((action) => (
              <Link
                key={action.label}
                href={action.href}
                className="group bg-white rounded-none p-5 flex justify-between items-center text-[#003527] hover:bg-[#003527] hover:text-white transition-all border border-[#f1f5f9]"
              >
                <div className="flex flex-col gap-1">
                  <h4 className="text-sm font-black leading-tight text-inherit">{action.label}</h4>
                  <p className="text-[10px] font-bold opacity-40 tracking-wider uppercase text-slate-500 group-hover:text-[#b0f0d6]">
                    {action.sub}
                  </p>
                </div>
                <div className="w-8 h-8 rounded-none border border-[#f1f5f9] flex items-center justify-center group-hover:border-[#b0f0d6] transition-colors">
                  <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </div>

      </div>

      <div className="mt-20 flex flex-col items-center text-center gap-4 border-t border-[#f1f5f9] pt-12">
        <p className="text-xs text-[#414942] font-semibold tracking-wide">
          Climate Asset Foundation is a climate tech initiative under validation with MoEF&CC and Verra.
        </p>
      </div>
    </section>
  );
}
