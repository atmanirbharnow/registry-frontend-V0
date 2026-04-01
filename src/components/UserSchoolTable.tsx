"use client";

import React, { useEffect, useState } from "react";
import { getUserSchoolsRealtime } from "@/lib/schoolFirestoreService";
import { School } from "@/types/school";
import Spinner from "@/components/ui/Spinner";
import StatusBadge from "@/components/ui/StatusBadge";
import { useAuth } from "@/context/AuthContext";
import SkeletonRow from "@/components/ui/SkeletonRow";

export default function UserSchoolTable() {
    const { user } = useAuth();
    const [schools, setSchools] = useState<School[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        const unsubscribe = getUserSchoolsRealtime(
            user.uid,
            (data) => {
                setSchools(data);
                setLoading(false);
            },
            (error) => {
                console.error("Firestore Error in UserSchoolTable:", error);
                setLoading(false);
            }
        );
        return () => unsubscribe();
    }, [user]);

    if (loading) {
        return (
            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
                <div className="p-6 space-y-3">
                    <SkeletonRow />
                    <SkeletonRow />
                    <SkeletonRow />
                </div>
            </div>
        );
    }

    if (schools.length === 0) {
        return (
            <div className="bg-white/50 border-2 border-dashed border-gray-300 rounded-2xl p-12 flex flex-col items-center justify-center text-center">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300 mb-4">
                    <path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2" />
                    <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
                </svg>
                <h3 className="text-gray-500 font-semibold text-lg">No school actions registered yet</h3>
                <p className="text-gray-400 text-sm mt-1">Visit the profile page to register your school action.</p>
            </div>
        );
    }

    const formatDate = (timestamp: any) => {
        if (!timestamp) return "N/A";
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString("en-IN", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    return (
        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full min-w-[800px]">
                    <thead>
                        <tr className="bg-gray-50/50 border-b border-gray-100/50">
                            <th className="py-4 px-5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Registry ID</th>
                            <th className="py-4 px-5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">School Name</th>
                            <th className="py-4 px-5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                            <th className="py-4 px-5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">CO₂e Reduced (tCO₂e)</th>
                            <th className="py-4 px-5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Atmanirbhar Index</th>
                            <th className="py-4 px-5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Date</th>
                            <th className="py-4 px-5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">View</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {schools.map((school) => (
                            <tr key={school.id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="py-3.5 px-5 text-sm font-mono font-semibold text-[rgb(32,38,130)]">
                                    {school.registryId ? (
                                        <a href={`/verify/${school.registryId}`} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                            {school.registryId}
                                        </a>
                                    ) : (
                                        <span className="text-gray-300">Pending ID</span>
                                    )}
                                </td>
                                <td className="py-3.5 px-5 text-sm font-bold text-gray-800">
                                    {school.schoolName}
                                </td>
                                <td className="py-3.5 px-5">
                                    <StatusBadge status={school.status || "pledged"} />
                                </td>
                                <td className="py-3.5 px-5 text-sm font-semibold text-gray-700">
                                    {school.tco2e_annual != null ? (school.tco2e_annual).toFixed(2) : "N/A"}
                                </td>
                                <td className="py-3.5 px-5 text-sm font-medium text-orange-600">
                                    {school.atmanirbhar_pct != null ? `${school.atmanirbhar_pct}%` : "N/A"}
                                </td>
                                <td className="py-3.5 px-5 text-sm text-gray-400 whitespace-nowrap">
                                    {formatDate(school.createdAt)}
                                </td>
                                <td className="py-3.5 px-5 text-sm">
                                    {school.registryId ? (
                                        <a href={`/verify/school/${school.registryId}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-[rgb(32,38,130)] font-medium hover:underline text-xs">
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
                                                <polyline points="15 3 21 3 21 9" />
                                                <line x1="10" y1="14" x2="21" y2="3" />
                                            </svg>
                                            View Certificate
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
    );
}
