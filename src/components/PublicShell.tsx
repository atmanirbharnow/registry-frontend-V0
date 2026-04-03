"use client";

import React from "react";
import PublicHeader from "./PublicHeader";
import PublicFooter from "./PublicFooter";

export default function PublicShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className='min-h-screen flex flex-col bg-gradient-to-b from-[#f9faf5] via-white to-white'>
      <PublicHeader />

      <main className='flex-1 w-full'>
        <div className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16'>
          <div className='bg-white/50 backdrop-blur-sm rounded-none p-6 sm:p-10 md:p-14 text-gray-900 shadow-sm border border-[#003527]/5'>{children}</div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
