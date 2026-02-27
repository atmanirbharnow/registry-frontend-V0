"use client";

import React from "react";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useAuth } from "@/context/AuthContext";
import ActionsPage from "@/components/AddNewActions";
import ProfileSetup from "@/components/ProfileSetup";
import InstitutionForm from "@/components/InstitutionForm";
import Spinner from "@/components/ui/Spinner";
import Link from "next/link";
import Button from "@/components/ui/Button";

export default function ProfilePage() {
    const { user } = useAuth();
    const { profile, loading, needsSetup, refreshProfile } = useUserProfile();

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

    return (
        <>
            {needsSetup && (
                <ProfileSetup
                    uid={user.uid}
                    isOpen={needsSetup}
                    onComplete={refreshProfile}
                />
            )}

            <div className="min-h-[calc(100vh-82px)] bg-gray-50 px-4 md:px-8 py-8">
                <div className="w-full space-y-8">
                    {isAdmin && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-5 py-3 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="text-lg">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-600">
                                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                    </svg>
                                </span>
                                <span className="text-sm font-semibold text-yellow-700">
                                    You are viewing as Admin
                                </span>
                            </div>
                            <Link
                                href="/admin"
                                className="text-sm font-bold text-yellow-700 hover:text-yellow-800 underline"
                            >
                                Go to Admin Panel →
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
                                <Link href="/register">
                                    <Button>Register Action</Button>
                                </Link>
                            </div>
                        </div>
                    )}

                    <InstitutionForm userId={user.uid} />

                    <ActionsPage />
                </div>
            </div>
        </>
    );
}
