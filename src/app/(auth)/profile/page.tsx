"use client";

import React, { useEffect } from "react";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useAuth } from "@/context/AuthContext";

import ProfileSetup from "@/components/ProfileSetup";
import ActionTypeCards from "@/components/forms/ActionTypeCards";
import Spinner from "@/components/ui/Spinner";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { toast } from "react-toastify";

export default function ProfilePage() {
    const { user } = useAuth();
    const { profile, loading, needsSetup, refreshProfile } = useUserProfile();
    const searchParams = useSearchParams();

    useEffect(() => {
        if (searchParams.get("access_denied") === "true") {
            toast.error("Access denied — Admin only");
            window.history.replaceState(null, "", "/profile");
        }
    }, [searchParams]);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[calc(100vh-82px)] bg-slate-50">
                <div className="flex flex-col items-center gap-4">
                    <Spinner size="lg" />
                    <p className="text-lg font-medium text-slate-500">Loading...</p>
                </div>
            </div>
        );
    }

    if (!user) return null;

    const isAdmin = profile?.role === "admin";


    if (needsSetup) {
        return (
            <ProfileSetup
                uid={user.uid}
                onComplete={refreshProfile}
            />
        );
    }

    return (
        <>
            <div className="min-h-[calc(100vh-82px)] bg-gray-50 px-4 md:px-8 py-8">
                <div className="w-full space-y-8">
                    {isAdmin && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-5 py-3 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-600">
                                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                </svg>
                                <span className="text-sm font-semibold text-yellow-700">
                                    You are viewing as Admin
                                </span>
                            </div>
                            <Link
                                href="/admin"
                                className="text-sm font-bold text-yellow-700 hover:text-yellow-800 underline"
                            >
                                Go to Admin Panel
                            </Link>
                        </div>
                    )}

                    {profile && !needsSetup && (
                        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] px-8 py-6">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h2 className="text-lg font-bold text-gray-800">
                                            {profile.displayName || "Account"}
                                        </h2>
                                        {isAdmin && (
                                            <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-[10px] font-bold rounded">
                                                Admin
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-500">{profile.email}</p>
                                    {profile.socialHandles &&
                                        profile.socialHandles.some((h) => h.trim() !== "") && (
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {profile.socialHandles
                                                    .filter((h) => h.trim() !== "")
                                                    .map((handle, i) => (
                                                        <span
                                                            key={i}
                                                            className="text-xs text-[rgb(32,38,130)] bg-blue-50 px-2 py-1 rounded"
                                                        >
                                                            {handle}
                                                        </span>
                                                    ))}
                                            </div>
                                        )}
                                </div>

                                <div className="flex flex-col gap-1.5 w-full sm:w-48 mt-4 sm:mt-0 relative group">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider cursor-default">
                                        Base State
                                    </label>
                                    <div
                                        className="w-full bg-gray-50 border border-gray-200 text-gray-500 rounded-lg px-3 py-2 text-sm cursor-default font-medium"
                                    >
                                        Gujarat
                                    </div>
                                    {/* Custom Tooltip */}
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-gray-900 text-white text-[10px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 text-center shadow-xl border border-white/10 leading-tight">
                                        Currently locked to Gujarat for the pilot phase. This calculates your regional financial energy/water savings.
                                        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}





                    <div className="space-y-6">
                        <div className="text-center space-y-2">
                            <h2 className="text-2xl font-black text-gray-800 tracking-tight">
                                Register Your Impact
                            </h2>
                            <p className="text-gray-500 font-medium">
                                Choose the type of action you want to register to start building your environmental portfolio.
                            </p>
                        </div>
                        
                        <ActionTypeCards />
                    </div>
                </div>
            </div >
        </>
    );
}
