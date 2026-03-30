"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useScrollSpy } from "@/hooks/useScrollSpy";

const NAV_LINKS = [
  { name: "Home", href: "#home" },
  { name: "How It Works", href: "#how-it-works" },
  { name: "Scope", href: "#scope" },
  { name: "Why Register", href: "#why-register" },
  { name: "Contact", href: "#contact" },
];

export default function LandingNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const activeSection = useScrollSpy(NAV_LINKS.map(l => l.href.substring(1)));

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 h-16 flex items-center bg-[rgb(32,38,130)] shadow-lg shadow-blue-900/20`}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8 w-full flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group no-underline">
          <div className="relative h-10 w-16 bg-white p-0.5 rounded-sm shadow-sm">
            <Image
              src="/earth carbon logo bw.jpg"
              alt="Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
          <span className="text-xl font-black text-white tracking-tighter group-hover:opacity-80 transition-opacity">
            Earth Carbon Registry
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => {
            const isActive = activeSection === link.href.substring(1);
            return (
              <a
                key={link.name}
                href={link.href}
                className={`text-sm tracking-wide transition-all ${
                  isActive ? "text-white border-b-2 border-white pb-1 font-black" : "text-white/80 hover:text-white font-bold"
                }`}
              >
                {link.name}
              </a>
            );
          })}
        </div>

        {/* CTA & Mobile Toggle */}
        <div className="flex items-center gap-4">
          <Link
            href="/signin"
            className="hidden md:block bg-white text-[rgb(32,38,130)] px-6 py-2 rounded-xl font-black text-sm shadow-xl hover:bg-[#bfdbfe] transition-all hover:scale-[1.02]"
          >
            Register Action →
          </Link>
          
          <button
            className="md:hidden p-2 text-white"
            onClick={() => setIsOpen(!isOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"} />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="absolute top-16 left-0 w-full bg-[rgb(32,38,130)] border-t border-white/10 shadow-2xl md:hidden overflow-hidden transition-all">
          <div className="flex flex-col p-6 gap-6">
            {NAV_LINKS.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="text-white font-bold text-xl py-2 block border-b border-white/10 last:border-0"
              >
                {link.name}
              </a>
            ))}
            <Link
              href="/signin"
              onClick={() => setIsOpen(false)}
              className="mt-4 bg-white text-[rgb(32,38,130)] text-center px-6 py-4 rounded-xl font-black text-xl shadow-2xl"
            >
              Register Action →
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
