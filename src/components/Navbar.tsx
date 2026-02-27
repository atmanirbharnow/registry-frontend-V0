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

  return (
    <nav className="sticky top-0 z-[1000] flex justify-between items-center px-8 py-5 bg-[rgb(32,38,130)] backdrop-blur-xl border-b border-gray-100 shadow-sm transition-all duration-300">
      <Link
        href="/profile"
        className="flex items-center gap-3 no-underline group"
      >
        <div className="font-black text-xl tracking-tighter text-white flex flex-col leading-none">
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
              href="/register"
              className="hidden md:inline-flex px-4 py-2 bg-white/10 text-white text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-white/20 transition-colors no-underline"
            >
              Register Action
            </Link>

            {isAdmin && (
              <Link
                href="/admin"
                className="hidden md:inline-flex items-center gap-1.5 px-4 py-2 bg-yellow-400/20 text-yellow-300 text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-yellow-400/30 transition-colors no-underline"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                Admin Panel
              </Link>
            )}

            <div
              className="flex items-center gap-4 relative cursor-pointer"
              ref={dropdownRef}
            >
              <div
                className="hidden md:flex flex-col items-end"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black text-white leading-none">
                    {user.displayName || "User Account"}
                  </span>
                  {isAdmin && (
                    <span className="px-1.5 py-0.5 bg-yellow-400 text-yellow-900 text-[9px] font-black uppercase tracking-wider rounded">
                      Admin
                    </span>
                  )}
                </div>
                <span className="text-[11px] font-bold text-gray-300 tracking-wider mt-1">
                  {user.email}
                </span>
              </div>

              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="relative group focus:outline-none cursor-pointer"
              >
                <div
                  className={`absolute inset-0 bg-blue-500/20 blur-lg rounded-full transition-opacity duration-300 ${isDropdownOpen ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
                ></div>
                <div
                  className={`relative w-11 h-11 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 border-2 shadow-md overflow-hidden transition-all duration-300 flex items-center justify-center ${isDropdownOpen ? "border-blue-500 scale-95" : "border-white"}`}
                >
                  {user.photoURL ? (
                    <Image
                      src={user.photoURL}
                      alt="Profile"
                      fill
                      className="object-cover"
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
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                      Signed in as
                    </p>
                    <p className="text-sm font-bold text-gray-900 truncate">
                      {user.email}
                    </p>
                    {isAdmin && (
                      <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 bg-yellow-100 text-yellow-700 text-[10px] font-bold rounded">
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
                    Dashboard
                  </Link>

                  <Link
                    href="/register"
                    className="w-full flex items-center gap-3 px-5 py-3 rounded-[1.25rem] text-gray-700 font-bold text-xs uppercase tracking-widest hover:bg-gray-50 transition-colors no-underline"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    Register Action
                  </Link>

                  {isAdmin && (
                    <Link
                      href="/admin"
                      className="w-full flex items-center gap-3 px-5 py-3 rounded-[1.25rem] text-yellow-700 font-bold text-xs uppercase tracking-widest hover:bg-yellow-50 transition-colors no-underline"
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
          </>
        ) : (
          <Link
            href="/signin"
            className="px-7 py-3 bg-white text-[rgb(32,38,130)] font-black text-xs uppercase tracking-widest rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-95 transition-all duration-300"
          >
            Sign In
          </Link>
        )}
      </div>
    </nav>
  );
}
