"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";

export default function LandingFooter() {
  return (
    <footer className="bg-slate-950 text-white py-16 px-4 md:px-8">
      <div className="max-w-6xl mx-auto h-full">
        {/* Top Row: 3 columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* Brand */}
          <div className="flex flex-col gap-6">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="relative h-10 w-16 bg-white p-0.5 rounded-sm">
                <Image
                  src="/earth carbon logo bw.jpg"
                  alt="Earth Carbon Registry Logo"
                  fill
                  className="object-contain"
                />
              </div>
              <span className="text-xl font-black text-white tracking-tight group-hover:opacity-80 transition-opacity">
                 Earth Carbon Registry
              </span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed">
              Indias verified low-carbon action registry, providing transparency and permanent impact tracking.
            </p>
            <div className="text-xs text-slate-400 space-y-1">
              <p>358 Saraswatinagar, Ahmedabad 380015</p>
              <p>Email: support@earthcarbonfoundation.org</p>
            </div>
          </div>

          {/* Registry Links */}
          <div className="flex flex-col gap-4">
            <h4 className="text-[#bfdbfe] text-xs font-bold uppercase tracking-widest">
              Registry
            </h4>
            <div className="flex flex-col gap-3 text-sm font-medium text-[#f1f5f9] opacity-80">
              <Link href="/signin" className="hover:text-[#bfdbfe] transition-colors">Register Action</Link>
              <Link href="/signin" className="hover:text-[#bfdbfe] transition-colors">Verify Certificate</Link>
              <a href="#how-it-works" className="hover:text-[#bfdbfe] transition-colors">How It Works</a>
              <a href="#scope" className="hover:text-[#bfdbfe] transition-colors">Scope of Actions</a>
            </div>
          </div>

          {/* Connect */}
          <div className="flex flex-col gap-4">
            <h4 className="text-[#bfdbfe] text-xs font-bold uppercase tracking-widest">
              Connect
            </h4>
            <div className="flex flex-col gap-3 text-sm font-medium text-[#f1f5f9] opacity-80 mb-4">
              <Link href="/about" className="hover:text-[#bfdbfe] transition-colors">About Earth Carbon Foundation</Link>
              <Link href="/contact" className="hover:text-[#bfdbfe] transition-colors">Contact Us</Link>
              <a href="https://moef.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-[#bfdbfe] transition-colors">MoEF&CC</a>
              <a href="https://verra.org" target="_blank" rel="noopener noreferrer" className="hover:text-[#bfdbfe] transition-colors">Verra Standards</a>
            </div>
            
            {/* Social Icons */}
            <div className="flex gap-4">
              <Link href="/signin" className="w-8 h-8 rounded-full bg-[#1e40af] flex items-center justify-center hover:bg-[#bfdbfe] hover:text-[rgb(32,38,130)] transition-all">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
              </Link>
              <Link href="/signin" className="w-8 h-8 rounded-full bg-[#1e40af] flex items-center justify-center hover:bg-[#bfdbfe] hover:text-[rgb(32,38,130)] transition-all">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </Link>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-slate-800 border-t pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-500 text-xs font-semibold">
            © 2026 Earth Carbon Foundation. All rights reserved.
          </p>
          <p className="text-slate-500 text-xs font-bold tracking-widest uppercase">
            climateassetregistry.org
          </p>
        </div>
      </div>
    </footer>
  );
}
