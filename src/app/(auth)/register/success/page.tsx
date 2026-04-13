"use client";

import React from "react";
import Button from "@/components/ui/Button";
import Link from "next/link";

export default function RegisterSuccessPage() {
    return (
        <div className="min-h-[calc(100vh-82px)] bg-gray-50 flex items-center justify-center px-4">
            <div className="max-w-md w-full bg-white rounded-[2.5rem] p-12 shadow-2xl shadow-slate-200 border border-slate-100 text-center space-y-8 animate-in fade-in zoom-in duration-500">
                <div className="space-y-6">
                    <div className="w-24 h-24 bg-[#b0f0d6] rounded-[2rem] flex items-center justify-center mx-auto shadow-sm transform transition-transform hover:scale-110">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-[#003527]">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                            <polyline points="22 4 12 14.01 9 11.01" />
                        </svg>
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-3xl font-black text-slate-800 tracking-tight">
                            Action Registered!
                        </h1>
                        <p className="text-slate-500 font-bold">
                            Your action has been successfully registered and added to the Climate Asset Registry.
                        </p>
                    </div>
                </div>

                <div className="pt-4">
                    <Link href="/profile">
                        <Button className="w-full py-6 text-lg rounded-2xl shadow-xl shadow-emerald-900/20">
                            Go to Dashboard
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
