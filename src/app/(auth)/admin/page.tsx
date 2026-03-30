"use client";

import React, { useEffect, useState } from "react";
import { useUserProfile } from "@/hooks/useUserProfile";
import AdminActionTable from "@/components/AdminActionTable";
import AdminUserTable from "@/components/AdminUserTable";
import AdminSchoolTable from "@/components/AdminSchoolTable";
import Spinner from "@/components/ui/Spinner";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { getDocs, collection, query, where, doc, setDoc, getFirestore } from "firebase/firestore";
import { db } from "@/lib/firebaseConfig";

export default function AdminPage() {
    const { profile, loading } = useUserProfile();
    const router = useRouter();

    const [activeTab, setActiveTab] = useState<"actions" | "users" | "schools">("actions");

    const [syncing, setSyncing] = useState(false);

    useEffect(() => {
        if (!loading && profile && profile.role !== "admin") {
            toast.error("Access denied — Admin only");
            router.replace("/profile");
        }
    }, [loading, profile, router]);

    const handleSyncStats = async () => {
        if (!profile?.uid) return;
        setSyncing(true);
        const toastId = toast.loading("Syncing platform stats in-browser...");
        try {
            // 1. Fetch Registered Actions (Individual + School)
            const actionsSnap = await getDocs(collection(db, "actions"));
            const schoolActionsSnap = await getDocs(collection(db, "schoolActions"));
            const totalRegisteredActions = actionsSnap.size + schoolActionsSnap.size;

            // 2. Fetch Verified Actions and Sum CO2e
            let totalVerifiedActions = 0;
            let totalCO2eKg = 0;

            actionsSnap.forEach(docSnap => {
                const data = docSnap.data();
                if (data.status === "verified" || data.status === "Verified") {
                    totalVerifiedActions++;
                    totalCO2eKg += data.co2eKg || (data.actionImpactTCO2e * 1000) || 0;
                }
            });

            schoolActionsSnap.forEach(docSnap => {
                const data = docSnap.data();
                if (data.status === "verified" || data.status === "Verified") {
                    totalVerifiedActions++;
                    totalCO2eKg += data.co2eKg || (data.actionImpactTCO2e * 1000) || 0;
                }
            });

            // 3. Fetch Total Organizations (Users count)
            const usersSnap = await getDocs(collection(db, "users"));
            const totalOrganizations = usersSnap.size;

            // 4. Update Public Stats Summary Document (Requires Rule Update)
            const statsData = {
                totalRegisteredActions,
                totalVerifiedActions,
                totalCO2eTonnes: Math.round((totalCO2eKg / 1000) * 100) / 100,
                totalOrganizations,
                lastUpdated: new Date().toISOString(),
                updatedBy: profile.uid,
                syncMode: "manual-browser"
            };

            await setDoc(doc(db, "public_stats", "totals"), statsData);

            toast.update(toastId, { render: "Stats synced successfully!", type: "success", isLoading: false, autoClose: 3000 });
        } catch (error: any) {
            console.error("Manual Sync Error:", error);
            const message = error.code === 'permission-denied' 
                ? "Permission Denied. Please ensure you have updated the Security Rules."
                : error.message;
            toast.update(toastId, { render: `Sync failed: ${message}`, type: "error", isLoading: false, autoClose: 5000 });
        } finally {
            setSyncing(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[calc(100vh-82px)] bg-slate-50">
                <Spinner size="lg" />
            </div>
        );
    }

    if (!profile || profile.role !== "admin") return null;

    // Visibility check for any user with admin role
    const canSync = profile?.role === "admin";

    return (
        <main className="min-h-[calc(100vh-82px)] bg-gray-50 px-4 sm:px-6 lg:px-8 py-6">
            <div className="w-full space-y-6">
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-gray-800 tracking-tight">
                            Admin Dashboard
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Manage registry operations, oversee actions, and view registered users.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-3">
                        {canSync && (
                            <button
                                onClick={handleSyncStats}
                                disabled={syncing}
                                className={`w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-sm border-2 border-[rgb(32,38,130)] text-[rgb(32,38,130)] hover:bg-[rgb(32,38,130)] hover:text-white transition-all flex items-center justify-center gap-2 ${syncing ? "opacity-50 cursor-not-allowed" : ""}`}
                            >
                                <span>{syncing ? "Syncing..." : "🔄 Sync Platform Stats"}</span>
                            </button>
                        )}

                        <div className="flex w-full sm:w-fit p-1 bg-gray-200/60 rounded-xl">
                            <button
                                onClick={() => setActiveTab("actions")}
                                className={`flex-1 sm:flex-none px-6 py-3 min-h-[44px] rounded-lg text-sm font-bold transition-all ${activeTab === "actions"
                                    ? "bg-white text-[rgb(32,38,130)] shadow-sm"
                                    : "text-gray-500 hover:text-gray-700 hover:bg-white/50"
                                    }`}
                            >
                                Individuals
                            </button>
                            <button
                                onClick={() => setActiveTab("schools")}
                                className={`flex-1 sm:flex-none px-6 py-3 min-h-[44px] rounded-lg text-sm font-bold transition-all ${activeTab === "schools"
                                    ? "bg-white text-[rgb(32,38,130)] shadow-sm"
                                    : "text-gray-500 hover:text-gray-700 hover:bg-white/50"
                                    }`}
                            >
                                Schools
                            </button>
                            <button
                                onClick={() => setActiveTab("users")}
                                className={`flex-1 sm:flex-none px-6 py-3 min-h-[44px] rounded-lg text-sm font-bold transition-all ${activeTab === "users"
                                    ? "bg-white text-[rgb(32,38,130)] shadow-sm"
                                    : "text-gray-500 hover:text-gray-700 hover:bg-white/50"
                                    }`}
                            >
                                Users
                            </button>
                        </div>
                    </div>
                </div>

                {activeTab === "actions" && <AdminActionTable />}
                {activeTab === "schools" && (
                    <div className="space-y-6">
                        <div className="flex justify-end">
                            <Link 
                                href="/school-register"
                                className="bg-[rgb(32,38,130)] text-white px-6 py-3 rounded-xl font-black text-sm shadow-xl shadow-blue-900/10 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
                            >
                                <span>+ Register New School</span>
                            </Link>
                        </div>
                        <AdminSchoolTable />
                    </div>
                )}
                {activeTab === "users" && <AdminUserTable />}
            </div>
        </main>
    );
}
