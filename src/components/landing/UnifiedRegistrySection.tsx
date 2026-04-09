// src/components/landing/UnifiedRegistrySection.tsx
"use client";
import React from "react";

export default function UnifiedRegistrySection() {
  return (
    <section className="w-full bg-[#f9faf5] px-4 md:px-8 lg:px-16 py-14">
      <div className="max-w-7xl mx-auto flex flex-col items-center text-center gap-6">
        {/* Icon */}
        <div className="flex-shrink-0">
          <div className="w-20 h-20 bg-[#a8f928] rounded-lg flex items-center justify-center">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#112000" strokeWidth="2.5">
              <circle cx="12" cy="12" r="3" />
              <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
            </svg>
          </div>
        </div>
        <div className="max-w-3xl">
          <h3 className="text-2xl md:text-3xl font-bold text-[#003527] mb-3"
            style={{ fontFamily: "var(--font-manrope), sans-serif" }}>
            Unified Registry
          </h3>
          <p className="text-base text-[#414942] leading-relaxed">
            Connect real assets, regenerative soil data, and forest protection
            projects in one single point of truth.
          </p>
        </div>
      </div>
    </section>
  );
}
