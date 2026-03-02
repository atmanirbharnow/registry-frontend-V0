"use client";

import React, { useEffect } from "react";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useInstitutions } from "@/hooks/useInstitutions";
import { useAuth } from "@/context/AuthContext";
import { useActionRecordTable } from "@/hooks/useActionRecordTable";
import ProfileSetup from "@/components/ProfileSetup";
import InstitutionForm from "@/components/InstitutionForm";
import Spinner from "@/components/ui/Spinner";
import StatusBadge from "@/components/ui/StatusBadge";
import SkeletonRow from "@/components/ui/SkeletonRow";
import Link from "next/link";
import Button from "@/components/ui/Button";
import { ACTION_LABELS } from "@/lib/constants";
import { useSearchParams } from "next/navigation";
import { toast } from "react-toastify";

export default function ProfilePage() {
    const { user } = useAuth();
    const { profile, loading, needsSetup, refreshProfile } = useUserProfile();
    const { institutions, loading: instLoading } = useInstitutions(user?.uid);
    const { actions, loading: actionsLoading } = useActionRecordTable();
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
    const hasInstitution = institutions.length > 0;

    const formatDate = (timestamp: { toDate?: () => Date } | undefined) => {
        if (!timestamp?.toDate) return "N/A";
        return timestamp.toDate().toLocaleString("en-IN", {
            year: "numeric",
            month: "short",
            day: "numeric",
            timeZone: "Asia/Kolkata",
        });
    };

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
                            </div>
                        </div>
                    )}

                    {!hasInstitution && !instLoading && (
                        <div className="flex items-center gap-4 px-6 py-4 bg-blue-50 border border-blue-100 rounded-xl">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-[rgb(32,38,130)] text-white flex items-center justify-center text-sm font-bold">1</div>
                                <span className="text-sm font-semibold text-[rgb(32,38,130)]">Create Institution</span>
                            </div>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-300">
                                <polyline points="9 18 15 12 9 6" />
                            </svg>
                            <div className="flex items-center gap-3 opacity-40">
                                <div className="w-8 h-8 rounded-full bg-gray-300 text-white flex items-center justify-center text-sm font-bold">2</div>
                                <span className="text-sm font-semibold text-gray-400">Register Actions</span>
                            </div>
                        </div>
                    )}

                    <InstitutionForm userId={user.uid} />

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold text-gray-800">Registered Carbon Actions</h2>
                            <Link href="/register">
                                <Button size="sm">Register Action</Button>
                            </Link>
                        </div>

                        {actionsLoading ? (
                            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
                                <div className="p-6 space-y-3">
                                    <SkeletonRow />
                                    <SkeletonRow />
                                    <SkeletonRow />
                                </div>
                            </div>
                        ) : actions.length === 0 ? (
                            <div className="bg-white/50 border-2 border-dashed border-gray-300 rounded-2xl p-12 flex flex-col items-center justify-center text-center">
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300 mb-4">
                                    <path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2" />
                                    <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
                                </svg>
                                <h3 className="text-gray-500 font-semibold text-lg">No actions registered yet</h3>
                                <p className="text-gray-400 text-sm mt-1">
                                    Register your first carbon action to start building your portfolio.
                                </p>
                            </div>
                        ) : (
                            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full min-w-[800px]">
                                        <thead>
                                            <tr className="bg-gray-50/50 border-b border-gray-100/50">
                                                <th className="py-4 px-5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Registry ID</th>
                                                <th className="py-4 px-5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Action Type</th>
                                                <th className="py-4 px-5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Quantity</th>
                                                <th className="py-4 px-5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">CO₂e (kg)</th>
                                                <th className="py-4 px-5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                                                <th className="py-4 px-5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Date</th>
                                                <th className="py-4 px-5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Signature</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {actions.map((action) => (
                                                <tr key={action.id} className="hover:bg-gray-50/50 transition-colors">
                                                    <td className="py-3.5 px-5 text-sm font-mono font-semibold text-[rgb(32,38,130)]">
                                                        {action.registryId ? (
                                                            <a
                                                                href={`/verify/${action.registryId}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="hover:underline"
                                                            >
                                                                {action.registryId}
                                                            </a>
                                                        ) : (
                                                            <span className="text-gray-300">Pending ID</span>
                                                        )}
                                                    </td>
                                                    <td className="py-3.5 px-5 text-sm font-medium text-gray-700">
                                                        {ACTION_LABELS[action.actionType] || action.actionType}
                                                    </td>
                                                    <td className="py-3.5 px-5 text-sm text-gray-600">
                                                        {action.quantity} {action.unit}
                                                    </td>
                                                    <td className="py-3.5 px-5 text-sm">
                                                        {action.co2eKg != null ? (
                                                            <a
                                                                href={action.registryId ? `/verify/${action.registryId}` : undefined}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-[rgb(32,38,130)] font-medium hover:underline"
                                                            >
                                                                {action.co2eKg.toFixed(3)}
                                                            </a>
                                                        ) : (
                                                            <span className="text-gray-300">N/A</span>
                                                        )}
                                                    </td>
                                                    <td className="py-3.5 px-5">
                                                        <StatusBadge status={action.status || "pending"} />
                                                    </td>
                                                    <td className="py-3.5 px-5 text-sm text-gray-400 whitespace-nowrap">
                                                        {formatDate(action.createdAt)}
                                                    </td>
                                                    <td className="py-3.5 px-5 text-sm">
                                                        {action.sha256Hash ? (
                                                            <a
                                                                href={action.registryId ? `/verify/${action.registryId}` : undefined}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-[rgb(32,38,130)] font-mono text-xs hover:underline"
                                                                title={action.sha256Hash}
                                                            >
                                                                {action.sha256Hash.substring(0, 12)}...
                                                            </a>
                                                        ) : (
                                                            <span className="text-gray-300">N/A</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
