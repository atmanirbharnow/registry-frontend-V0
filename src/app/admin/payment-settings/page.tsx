"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useUserProfile } from "@/hooks/useUserProfile";
import { usePaymentSettings } from "@/hooks/usePaymentSettings";
import { updatePaymentSettings } from "@/lib/firestoreService";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import Navbar from "@/components/Navbar";
import PublicFooter from "@/components/PublicFooter";

export default function PaymentSettingsPage() {
    const { user, loading: authLoading } = useAuth();
    const { profile, loading: profileLoading } = useUserProfile();
    const { settings, loading: settingsLoading, refreshSettings } = usePaymentSettings();
    const router = useRouter();

    const [individualPrice, setIndividualPrice] = useState<string>("1");
    const [schoolPrice, setSchoolPrice] = useState<string>("1");
    const [isSaving, setIsSaving] = useState(false);
    const [hasChanged, setHasChanged] = useState(false);

    useEffect(() => {
        if (settings) {
            setIndividualPrice(settings.individualPrice.toString());
            setSchoolPrice(settings.schoolPrice.toString());
            setHasChanged(false);
        }
    }, [settings]);

    useEffect(() => {
        if (!settings) return;
        const currentInd = settings.individualPrice.toString();
        const currentSch = settings.schoolPrice.toString();
        setHasChanged(individualPrice !== currentInd || schoolPrice !== currentSch);
    }, [individualPrice, schoolPrice, settings]);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push("/signin");
        } else if (!profileLoading && profile && profile.role !== "admin") {
            router.push("/profile");
        }
    }, [user, profile, authLoading, profileLoading, router]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            await updatePaymentSettings({
                individualPrice: parseFloat(individualPrice),
                schoolPrice: parseFloat(schoolPrice),
            });
            await refreshSettings();
            toast.success("Payment settings updated successfully!", {
                style: {
                    background: "#003527",
                    color: "#fff",
                    borderRadius: "8px",
                    fontWeight: "bold",
                },
            });
        } catch (error) {
            console.error("Error updating payment settings:", error);
            toast.error("Failed to update payment settings.");
        } finally {
            setIsSaving(false);
        }
    };

    if (authLoading || profileLoading || settingsLoading) {
        return (
            <div className="min-h-screen bg-[#f8fafc] flex flex-col">
                <Navbar />
                <div className="flex-grow flex items-center justify-center">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-12 h-12 border-4 border-[#003527]/10 border-t-[#a8f928] rounded-full animate-spin"></div>
                        <p className="text-[#003527] font-bold text-sm tracking-widest uppercase">
                            Loading Settings...
                        </p>
                    </div>
                </div>
                <PublicFooter />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8fafc] flex flex-col">
            <Navbar />

            <main className="flex-grow container mx-auto px-4 py-12">
                <div className="max-w-2xl mx-auto">
                    {/* Header */}
                    <div className="mb-10 text-center md:text-left">
                        <h1 className="text-2xl md:text-3xl font-black text-[#003527] tracking-tight mb-2 italic uppercase">
                            Payment Settings
                        </h1>

                    </div>

                    <div className="bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-gray-100 overflow-hidden">
                        <div className="bg-[#003527] px-8 py-6">
                            <h2 className="text-[#a8f928] font-black text-xs uppercase tracking-[0.2em] flex items-center gap-3">
                                <span className="w-8 h-[2px] bg-[#a8f928]"></span>
                                PRICING CONFIGURATION
                            </h2>
                        </div>

                        <form onSubmit={handleSave} className="p-8 space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Individual Action Price */}
                                <div className="space-y-3">
                                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest block px-1">
                                        Individual Action Price
                                    </label>
                                    <div className="relative group">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-lg group-focus-within:text-[#003527] transition-colors">
                                            ₹
                                        </div>
                                        <input
                                            type="number"
                                            value={individualPrice}
                                            onChange={(e) => setIndividualPrice(e.target.value)}
                                            step="0.01"
                                            required
                                            className="w-full pl-10 pr-4 py-4 bg-gray-50 border-2 border-transparent rounded-xl text-[#003527] font-black text-lg focus:outline-none focus:border-[#a8f928] focus:bg-white transition-all"
                                            placeholder="0.00"
                                        />
                                    </div>
                                    <p className="text-[10px] text-gray-400 font-bold px-1 italic">
                                        Fee charged for single individual action registration.
                                    </p>
                                </div>

                                {/* School Action Price */}
                                <div className="space-y-3">
                                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest block px-1">
                                        School/Entity Action Price
                                    </label>
                                    <div className="relative group">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-lg group-focus-within:text-[#003527] transition-colors">
                                            ₹
                                        </div>
                                        <input
                                            type="number"
                                            value={schoolPrice}
                                            onChange={(e) => setSchoolPrice(e.target.value)}
                                            step="0.01"
                                            required
                                            className="w-full pl-10 pr-4 py-4 bg-gray-50 border-2 border-transparent rounded-xl text-[#003527] font-black text-lg focus:outline-none focus:border-[#a8f928] focus:bg-white transition-all"
                                            placeholder="0.00"
                                        />
                                    </div>
                                    <p className="text-[10px] text-gray-400 font-bold px-1 italic">
                                        Fee charged for institutional or school-wide actions.
                                    </p>
                                </div>
                            </div>

                            {/* Save Button */}
                            <div className="pt-4 border-t border-gray-50 flex flex-col sm:flex-row items-center justify-between gap-6">
                                <div className="flex items-center gap-3 text-gray-400">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                    </svg>
                                    <span className="text-[10px] uppercase font-black tracking-widest">Administrator Access Only</span>
                                </div>
                                <button
                                    type="submit"
                                    disabled={isSaving || !hasChanged}
                                    className="w-full sm:w-auto px-10 py-4 bg-[#003527] text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 active:scale-95 transition-all disabled:opacity-30 disabled:translate-y-0 disabled:cursor-not-allowed group overflow-hidden relative"
                                >
                                    <span className="relative z-10">
                                        {isSaving ? "Updating System..." : "Save Configuration"}
                                    </span>
                                    {hasChanged && !isSaving && (
                                        <div className="absolute inset-0 bg-[#a8f928] translate-y-full group-hover:translate-y-[90%] transition-transform duration-300"></div>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>

                </div>
            </main>

            <PublicFooter />
        </div>
    );
}
