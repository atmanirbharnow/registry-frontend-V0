"use client";

import React from "react";
import Link from "next/link";
import Card from "@/components/ui/Card";
import ActionTypeCards from "@/components/forms/ActionTypeCards";

export default function RegisterSelectionPage() {
    return (
        <div className="min-h-[calc(100vh-82px)] bg-gray-50 px-4 md:px-8 py-12">
            <div className="max-w-5xl mx-auto space-y-12">
                {/* Header with Dashboard Link */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="text-center md:text-left space-y-2">
                        <h1 className="text-3xl md:text-4xl font-black text-gray-800 tracking-tight">
                            Register Your Impact
                        </h1>
                        <p className="text-lg text-gray-500 max-w-2xl">
                            Choose the type of action you want to register. Join our mission to hit critical climate targets.
                        </p>
                    </div>
                    <Link href="/profile">
                        <button className="px-6 py-3 bg-white border border-gray-200 text-gray-700 font-bold text-sm uppercase tracking-widest rounded-xl shadow-sm hover:shadow-md hover:bg-gray-50 transition-all flex items-center gap-2">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="3" width="7" height="7" />
                                <rect x="14" y="3" width="7" height="7" />
                                <rect x="14" y="14" width="7" height="7" />
                                <rect x="3" y="14" width="7" height="7" />
                            </svg>
                            View Dashboard
                        </button>
                    </Link>
                </div>

                {/* Action Type Selection Cards */}
                <ActionTypeCards />

                {/* Footer Info */}
                <div className="text-center pt-8 border-t border-gray-100">
                    <p className="text-sm text-gray-400 font-medium">
                        Verified data builds trust in the voluntary carbon market.
                    </p>
                </div>
            </div>
        </div>
    );
}
