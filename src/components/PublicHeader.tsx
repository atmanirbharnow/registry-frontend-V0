"use client";

import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
import { usePathname } from "next/navigation";

export default function PublicHeader() {
  const { user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const isSignInPage = pathname === "/signin";

  return (
    <header className='w-full bg-[#003527] text-white relative z-50'>
      <div className='max-w-6xl mx-auto px-4 py-3 md:py-4 flex items-center justify-between'>
        <Link href="/" className="flex items-center gap-3 group no-underline">
          <div className="relative h-9 w-[54px] bg-white overflow-hidden rounded-none shadow-sm group-hover:scale-105 transition-transform">
            <Image
              src="/climate asset logo bw.jpg"
              alt="Logo"
              fill
              className="object-cover"
              priority
            />
          </div>
          <span className="text-xl font-black tracking-tighter text-white group-hover:opacity-80 transition-opacity">
            Climate Asset Registry
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className='hidden md:flex items-center gap-6'>
          {user ? (
            <Link
              href='/profile'
              className='px-5 py-2 bg-[#a8f928] text-[#112000] text-sm font-black rounded-none shadow-sm hover:bg-[#96e020] transition whitespace-nowrap'
            >
              Go To Dashboard
            </Link>
          ) : (
            !isSignInPage && (
              <Link
                href='/signin'
                className='px-5 py-2 bg-[#a8f928] text-[#112000] text-sm font-bold rounded-none shadow-sm hover:bg-[#96e020] transition whitespace-nowrap'
              >
                Sign In
              </Link>
            )
          )}
        </nav>

        {/* Mobile Toggle Button */}
        <button
          className="md:hidden p-2 -mr-2 text-white hover:bg-white/10 rounded-none transition-colors flex-shrink-0 ml-auto"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {isMobileMenuOpen ? (
              <>
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </>
            ) : (
              <>
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </>
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-[#003527] border-t border-white/10 shadow-xl pb-6 px-4 flex flex-col gap-4 animate-in slide-in-from-top-2 duration-200">
          <div className="pt-4">
            {user ? (
              <Link
                href='/profile'
                onClick={() => setIsMobileMenuOpen(false)}
                className='block w-full text-center px-4 py-3 bg-[#a8f928] text-[#112000] text-base font-bold rounded-none shadow-lg transition'
              >
                Go To Dashboard
              </Link>
            ) : (
              !isSignInPage && (
                <Link
                  href='/signin'
                  onClick={() => setIsMobileMenuOpen(false)}
                  className='block w-full text-center px-4 py-3 bg-[#a8f928] text-[#112000] text-base font-bold rounded-none shadow-lg transition'
                >
                  Sign In
                </Link>
              )
            )}
          </div>
        </div>
      )}
    </header>
  );
}
