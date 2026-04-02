"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { useUserProfile } from "@/hooks/useUserProfile";
import Link from "next/link";
import SignOutIcon from "./svg/SignOutIcon";

export default function Navbar() {
  const { user, logout, loading } = useAuth();
  const { profile } = useUserProfile();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isAdmin = profile?.role === "admin";

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  return (
    <>
      <nav className="sticky top-0 z-[1000] flex justify-between items-center px-4 md:px-8 py-5 bg-[#003527] backdrop-blur-xl border-b border-gray-100 shadow-sm transition-all duration-300">
        <Link
          href="/profile"
          className="flex items-center gap-3 no-underline group"
        >
          <div className="relative h-10 w-[60px] bg-white overflow-hidden rounded-sm">
            <Image
              src="/earth carbon logo bw.jpg"
              alt="Earth Carbon Registry Logo"
              fill
              className="object-cover"
              priority
            />
          </div>
          <div className="font-black text-xl tracking-tighter text-white flex flex-col leading-none group-hover:opacity-80 transition-opacity">
            <span>Earth Carbon Registry</span>
          </div>
        </Link>

        <div className="flex items-center gap-4">
          {loading ? (
            <div className="flex items-center gap-2 text-gray-200">
              <div className="w-4 h-4 border-2 border-gray-400 border-t-white rounded-full animate-spin"></div>
              <span className="text-sm font-bold uppercase tracking-widest">
                Loading
              </span>
            </div>
          ) : user ? (
            <>
              <Link
                href="/profile/my-actions"
                className="hidden md:inline-flex px-4 py-2 bg-white/10 text-white text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-white/20 transition-colors no-underline flex items-center gap-2"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2" />
                  <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
                </svg>
                VIEW ACTIONS
              </Link>

              {isAdmin && (
                <Link
                  href="/admin"
                  className="hidden md:inline-flex items-center gap-1.5 px-4 py-2 bg-[#a8f928]/20 text-[#a8f928] text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-[#a8f928]/30 transition-colors no-underline"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                  Admin Panel
                </Link>
              )}

              {/* Desktop Profile Dropdown */}
              <div
                className="hidden md:flex items-center gap-4 relative cursor-pointer"
                ref={dropdownRef}
              >
                <div
                  className="flex flex-col items-end"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-white leading-none max-w-[160px] truncate">
                      {user.displayName || "User Account"}
                    </span>
                    {isAdmin && (
                      <span className="px-1.5 py-0.5 bg-[#a8f928] text-[#112000] text-[9px] font-bold uppercase tracking-wider rounded">
                        Admin
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] font-bold text-gray-200 tracking-wider mt-1 max-w-[200px] truncate">
                    {user.email}
                  </span>
                </div>

                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="relative group focus:outline-none cursor-pointer"
                >
                  <div
                    className={`absolute inset-0 bg-[#a8f928]/20 blur-lg rounded-full transition-opacity duration-300 ${isDropdownOpen ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
                  ></div>
                  <div
                    className={`relative w-11 h-11 rounded-full bg-gradient-to-br from-[#003527] to-[#064e3b] border-2 shadow-md overflow-hidden transition-all duration-300 flex items-center justify-center ${isDropdownOpen ? "border-[#a8f928] scale-95" : "border-white"}`}
                  >
                    {user.photoURL ? (
                      <Image
                        src={user.photoURL}
                        alt="Profile"
                        width={44}
                        height={44}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <span className="text-white font-black text-sm">
                        {(user.displayName || user.email || "U")
                          .charAt(0)
                          .toUpperCase()}
                      </span>
                    )}
                  </div>
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 top-full mt-4 w-64 bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-gray-50 p-3 transform transition-all animate-in fade-in slide-in-from-top-4 duration-300 origin-top-right overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-50 mb-2">
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">
                        Signed in as
                      </p>
                      <p className="text-sm font-bold text-gray-900 truncate">
                        {user.email}
                      </p>
                      {isAdmin && (
                        <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 bg-[#b0f0d6] text-[#003527] text-[10px] font-bold rounded">
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                          </svg>
                          Administrator
                        </span>
                      )}
                    </div>

                    <Link
                      href="/profile"
                      className="w-full flex items-center gap-3 px-5 py-3 rounded-[1.25rem] text-gray-700 font-bold text-xs uppercase tracking-widest hover:bg-gray-50 transition-colors no-underline"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      DASHBOARD
                    </Link>

                    <Link
                      href="/profile/my-actions"
                      className="w-full flex items-center gap-3 px-5 py-3 rounded-[1.25rem] text-gray-700 font-bold text-xs uppercase tracking-widest hover:bg-gray-50 transition-colors no-underline"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      VIEW ACTIONS
                    </Link>

                    {isAdmin && (
                      <Link
                        href="/admin"
                        className="w-full flex items-center gap-3 px-5 py-3 rounded-[1.25rem] text-[#112000] font-bold text-xs uppercase tracking-widest hover:bg-[#b0f0d6]/20 transition-colors no-underline"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                        </svg>
                        Admin Panel
                      </Link>
                    )}

                    <button
                      onClick={logout}
                      className="w-full flex items-center gap-3 px-5 py-4 rounded-[1.25rem] text-red-500 font-black text-xs uppercase tracking-widest hover:bg-red-50 transition-colors duration-200 group/item cursor-pointer mt-2 border-t border-gray-50 pt-3"
                    >
                      <div className="p-2 bg-red-100 rounded-lg group-hover/item:bg-red-200 transition-colors">
                        <SignOutIcon />
                      </div>
                      Sign Out
                    </button>
                  </div>
                )}
              </div>

              {/* Mobile Hamburger Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
                aria-label="Open mobile menu"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  {isMobileMenuOpen ? (
                    <>
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </>
                  ) : (
                    <>
                      <line x1="3" y1="6" x2="21" y2="6" />
                      <line x1="3" y1="12" x2="21" y2="12" />
                      <line x1="3" y1="18" x2="21" y2="18" />
                    </>
                  )}
                </svg>
              </button>
            </>
          ) : (
            <Link
              href="/signin"
              className="px-7 py-3 bg-[#a8f928] text-[#112000] font-black text-xs uppercase tracking-widest rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-95 transition-all duration-300"
            >
              Sign In
            </Link>
          )}
        </div>
      </nav>

      {/* Mobile Drawer */}
      {user && isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-[82px] z-[999]">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="relative bg-white w-full max-h-[calc(100vh-82px)] overflow-y-auto shadow-2xl">
            <div className="px-6 py-5 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#003527] to-[#064e3b] flex items-center justify-center overflow-hidden flex-shrink-0">
                  {user.photoURL ? (
                    <Image
                      src={user.photoURL}
                      alt="Profile"
                      width={48}
                      height={48}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <span className="text-white font-black text-lg">
                      {(user.displayName || user.email || "U").charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-gray-800 truncate">
                    {user.displayName || "User Account"}
                  </p>
                  <p className="text-xs text-gray-400 truncate">{user.email}</p>
                  {isAdmin && (
                    <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 bg-[#b0f0d6] text-[#003527] text-[10px] font-bold rounded">
                      Admin
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="p-4 space-y-1">
              <Link
                href="/profile"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-colors no-underline"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                  <rect x="3" y="3" width="7" height="7" />
                  <rect x="14" y="3" width="7" height="7" />
                  <rect x="14" y="14" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" />
                </svg>
                Dashboard
              </Link>

              <Link
                href="/profile/my-actions"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-colors no-underline"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                  <path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2" />
                  <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
                </svg>
                VIEW ACTIONS
              </Link>

              {isAdmin && (
                <Link
                  href="/admin"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-[#003527] font-semibold text-sm hover:bg-[#b0f0d6]/20 transition-colors no-underline"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#a8f928]">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                  Admin Panel
                </Link>
              )}

              <div className="border-t border-gray-100 mt-3 pt-3">
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-red-500 font-bold text-sm hover:bg-red-50 transition-colors cursor-pointer"
                >
                  <div className="p-1.5 bg-red-100 rounded-lg">
                    <SignOutIcon />
                  </div>
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
