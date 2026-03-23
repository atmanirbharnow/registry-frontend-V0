"use client";

import React from "react";
import SchoolRegistrationForm from "@/components/SchoolRegistrationForm";
import { useRouter } from "next/navigation";
import { useUserProfile } from "@/hooks/useUserProfile";
import Spinner from "@/components/ui/Spinner";

export default function SchoolRegisterPage() {
    const { profile, loading } = useUserProfile();
    const router = useRouter();

    if (loading) return <div className="flex justify-center items-center min-h-screen"><Spinner size="lg" /></div>;

    if (!profile) {
        router.replace("/profile");
        return null;
    }

    return (
        <main className="min-h-screen bg-slate-50 pt-12 px-4 sm:px-6 pb-32 opacity-100">
            <div className="max-w-6xl mx-auto space-y-12">
                <div className="flex flex-col items-center text-center space-y-8 relative">
                    <button 
                        onClick={() => router.back()}
                        className="self-start md:absolute md:left-0 md:top-2 flex items-center gap-1.5 text-slate-400 hover:text-[rgb(32,38,130)] transition-all group font-bold px-2 py-1"
                    >
                        <span className="text-xl group-hover:-translate-x-1 transition-transform">←</span>
                        <span className="text-xs">Back</span>
                    </button>
                    
                    <div className="space-y-4 max-w-4xl">
                        <h1 
                            className="text-2xl md:text-3xl lg:text-4xl font-black text-slate-800 tracking-tight leading-tight"
                            style={{ wordSpacing: '0.15em' }}
                        >
                            School Climate Action Module
                        </h1>
                        <div className="flex justify-center">
                            <p className="text-slate-500 font-black uppercase text-[10px] md:text-xs tracking-[0.2em] bg-white px-4 py-2 rounded-2xl shadow-sm border border-slate-100/50">
                                Step-by-Step Concierge Flow
                            </p>
                        </div>
                    </div>
                </div>

                <SchoolRegistrationForm />
            </div>
        </main>
    );
}
