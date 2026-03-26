"use client";

import React from "react";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useAuth } from "@/context/AuthContext";
import ProfileSetup from "@/components/ProfileSetup";
import Spinner from "@/components/ui/Spinner";

export default function ProfilePage() {
    const { user } = useAuth();
    const { profile, loading, refreshProfile } = useUserProfile();

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[calc(100vh-82px)] bg-slate-50">
                <div className="flex flex-col items-center gap-4">
                    <Spinner size="lg" />
                    <p className="text-lg font-medium text-slate-500">Loading profile details...</p>
                </div>
            </div>
        );
    }

    if (!user) return null;

    return (
        <ProfileSetup
            uid={user.uid}
            profile={profile}
            onComplete={refreshProfile}
        />
    );
}
