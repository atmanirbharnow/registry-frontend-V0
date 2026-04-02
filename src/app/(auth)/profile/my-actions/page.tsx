"use client";

import React from "react";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useAuth } from "@/context/AuthContext";
import { useActionRecordTable } from "@/hooks/useActionRecordTable";
import Spinner from "@/components/ui/Spinner";
import StatusBadge from "@/components/ui/StatusBadge";
import SkeletonRow from "@/components/ui/SkeletonRow";
import Link from "next/link";
import { ACTION_LABELS } from "@/lib/constants";
import { calculatePortfolioMetrics } from "@/lib/portfolioCalculator";
import PerformanceBreakdownModal from "@/components/PerformanceBreakdownModal";

import UserSchoolTable from "@/components/UserSchoolTable";

export default function MyActionsPage() {
    const { user } = useAuth();
    const { profile, loading, needsSetup } = useUserProfile();
    const { actions, loading: actionsLoading } = useActionRecordTable();
    const [isBreakdownModalOpen, setIsBreakdownModalOpen] = React.useState(false);
    const [activeTab, setActiveTab] = React.useState<"climate" | "school">("climate");

    const portfolio = React.useMemo(() => {
        return actions.length > 0 ? calculatePortfolioMetrics(actions) : null;
    }, [actions]);

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

    const formatDate = (timestamp: { toDate?: () => Date } | string | undefined) => {
        if (!timestamp) return "N/A";
        const date = typeof timestamp === "string"
            ? new Date(timestamp)
            : timestamp?.toDate?.()
                ? timestamp.toDate()
                : null;
        if (!date || isNaN(date.getTime())) return "N/A";
        return date.toLocaleString("en-IN", {
            year: "numeric",
            month: "short",
            day: "numeric",
            timeZone: "Asia/Kolkata",
        });
    };

    return (
        <div className="min-h-[calc(100vh-82px)] bg-gray-50 px-4 md:px-8 py-8">
            <div className="w-full space-y-8">
                {/* Profile Header (minimal) */}
                {profile && (
                    <div className="bg-white rounded-[2rem] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] px-8 py-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-lg font-bold text-gray-800">
                                    {profile.displayName || "Account"}
                                </h2>
                                {isAdmin && (
                                    <span className="px-2 py-0.5 bg-yellow-100 text-[#112000] text-[10px] font-bold rounded">
                                        Admin
                                    </span>
                                )}
                            </div>
                            <p className="text-sm text-gray-500">{profile.email}</p>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="flex p-1 bg-gray-100 rounded-xl">
                                <button
                                    onClick={() => setActiveTab("climate")}
                                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === "climate"
                                        ? "bg-white text-[#003527] shadow-sm"
                                        : "text-gray-500 hover:text-gray-700"
                                        }`}
                                >
                                    Individuals
                                </button>
                                <button
                                    onClick={() => setActiveTab("school")}
                                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === "school"
                                        ? "bg-white text-[#003527] shadow-sm"
                                        : "text-gray-500 hover:text-gray-700"
                                        }`}
                                >
                                    Schools/Education Institutes
                                </button>
                            </div>
                            <Link href="/profile">
                                <button className="px-4 py-2 bg-gray-100 text-gray-600 font-bold text-xs uppercase tracking-widest rounded-lg hover:bg-gray-200 transition-colors">
                                    ← Back
                                </button>
                            </Link>
                        </div>
                    </div>
                )}

                {/* Performance Metrics (Only for Individual Actions for now) */}
                {activeTab === "climate" && portfolio && portfolio.totalTCO2e > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-gradient-to-br from-[#003527] to-[#002219] rounded-2xl p-5 text-white">
                            <div className="text-[10px] font-bold text-blue-200 uppercase tracking-wider mb-1">Total Impact Managed</div>
                            <div className="text-3xl font-black">-{portfolio.totalTCO2e.toFixed(3)} <span className="text-xs">tCO₂e</span></div>
                        </div>
                        <div className="bg-gradient-to-br from-[#003527] to-[#002219] rounded-2xl p-5 text-white">
                            <div className="text-[10px] font-bold text-blue-200 uppercase tracking-wider mb-1">Portfolio Efficiency</div>
                            <div className="text-3xl font-black">{portfolio.totalAtmanirbharPercent.toFixed(1)}% <span className="text-xs">Avg. Atmanirbhar</span></div>
                        </div>
                    </div>
                )}

                {/* Actions Table Content */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold text-gray-800">
                            {activeTab === "climate" ? "My Registered Individual Actions" : "My Registered School/Institute Actions"}
                        </h2>
                    </div>

                    {activeTab === "climate" ? (
                        <>
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
                                    <p className="text-gray-400 text-sm mt-1">Visit the profile page to register your first action.</p>
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
                                                    <th className="py-4 px-5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">View</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50">
                                                {actions.map((action) => (
                                                    <tr key={action.id} className="hover:bg-gray-50/50 transition-colors">
                                                        <td className="py-3.5 px-5 text-sm font-mono font-semibold text-[#003527]">
                                                            {action.registryId ? (
                                                                <a href={`/verify/${action.registryId}`} target="_blank" rel="noopener noreferrer" className="hover:underline">
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
                                                                <a href={action.registryId ? `/verify/${action.registryId}` : undefined} target="_blank" rel="noopener noreferrer" className="text-[#003527] font-medium hover:underline">
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
                                                                <span className="text-[#003527] font-mono text-xs" title={action.sha256Hash}>
                                                                    {action.sha256Hash.substring(0, 12)}...
                                                                </span>
                                                            ) : (
                                                                <span className="text-gray-300">N/A</span>
                                                            )}
                                                        </td>
                                                        <td className="py-3.5 px-5 text-sm">
                                                            {action.registryId ? (
                                                                <a href={`/verify/${action.registryId}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-[#003527] font-medium hover:underline text-xs">
                                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                        <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
                                                                        <polyline points="15 3 21 3 21 9" />
                                                                        <line x1="10" y1="14" x2="21" y2="3" />
                                                                    </svg>
                                                                    Verify
                                                                </a>
                                                            ) : (
                                                                <span className="text-gray-300">—</span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <UserSchoolTable />
                    )}
                </div>
            </div>
            
            <PerformanceBreakdownModal
                isOpen={isBreakdownModalOpen}
                onClose={() => setIsBreakdownModalOpen(false)}
                portfolio={portfolio}
            />
        </div>
    );
}
