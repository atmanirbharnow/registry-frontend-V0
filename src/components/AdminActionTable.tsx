"use client";

import React, { useState, useEffect, useMemo } from "react";
import { toast } from "react-toastify";
import Spinner from "./ui/Spinner";
import StatusBadge from "./ui/StatusBadge";
import CustomDropdown from "./ui/CustomDropdown";
import { ACTION_LABELS, ACTION_STATUS_OPTIONS, ACTION_TYPES } from "@/lib/constants";
import { Action, ActionStatus } from "@/types/action";
import { getAllActionsRealtime, updateActionStatus, getAllActions } from "@/lib/firestoreService";

export default function AdminActionTable() {
    const [actions, setActions] = useState<Action[]>([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [typeFilter, setTypeFilter] = useState<string>("all");

    useEffect(() => {
        const unsubscribe = getAllActionsRealtime((fetchedActions) => {
            setActions(fetchedActions);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const stats = useMemo(() => {
        const total = actions.length;
        const verified = actions.filter((a) => a.status === "verified").length;
        const pending = actions.filter((a) => a.status === "pending").length;
        const totalCo2e = actions.reduce((sum, a) => sum + (a.co2eKg || 0), 0);
        const totalRevenue = actions.filter((a) => a.registryId).length * 199;
        return { total, verified, pending, totalCo2e, totalRevenue };
    }, [actions]);

    const filteredActions = useMemo(() => {
        return actions.filter((a) => {
            if (statusFilter !== "all" && (a.status || "pending") !== statusFilter) return false;
            if (typeFilter !== "all" && a.actionType !== typeFilter) return false;
            return true;
        });
    }, [actions, statusFilter, typeFilter]);

    const handleStatusChange = async (actionId: string, newStatus: ActionStatus) => {
        setUpdatingId(actionId);
        setActions((prev) => prev.map((a) => (a.id === actionId ? { ...a, status: newStatus } : a)));
        try {
            await updateActionStatus(actionId, newStatus);
            toast.success(`Status updated to ${newStatus}`);
        } catch {
            toast.error("Failed to update status.");
            const allActions = await getAllActions();
            setActions(allActions);
        } finally {
            setUpdatingId(null);
        }
    };

    const handleExportCSV = () => {
        const headers = [
            "Registry ID",
            "Action Type",
            "Quantity",
            "Unit",
            "Actor Name",
            "Actor Type",
            "Email",
            "Phone",
            "Address",
            "CO2e (kg)",
            "Atmanirbhar %",
            "Status",
            "Created At",
        ];

        const rows = filteredActions.map((a) => [
            a.registryId || "",
            ACTION_LABELS[a.actionType] || a.actionType,
            String(a.quantity),
            a.unit,
            a.actorName || "",
            a.actorType || "",
            a.email || a.userEmail || "",
            a.phone || "",
            a.address || "",
            a.co2eKg != null ? a.co2eKg.toFixed(3) : "",
            a.atmanirbharPercent != null ? a.atmanirbharPercent.toFixed(1) : "",
            a.status || "pending",
            a.createdAt?.toDate?.().toISOString() || "",
        ]);

        const csvContent = [
            headers.join(","),
            ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `ecf-actions-${new Date().toISOString().split("T")[0]}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    };

    const formatDate = (timestamp: Action["createdAt"]) => {
        if (!timestamp) return "N/A";
        // Handle Firestore Timestamp object
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

    if (loading) {
        return (
            <div className="flex justify-center items-center p-12">
                <Spinner size="lg" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-2xl border border-gray-100 px-6 py-5 shadow-sm">
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Total Actions</p>
                    <p className="text-3xl font-black text-gray-800 mt-1">{stats.total}</p>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 px-6 py-5 shadow-sm">
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Verified</p>
                    <p className="text-3xl font-black text-green-600 mt-1">{stats.verified}</p>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 px-6 py-5 shadow-sm">
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Total CO₂e</p>
                    <p className="text-3xl font-black text-[rgb(32,38,130)] mt-1">{stats.totalCo2e.toLocaleString("en-IN", { maximumFractionDigits: 2 })} <span className="text-sm font-bold text-gray-400">kg</span></p>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 px-6 py-5 shadow-sm">
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Revenue</p>
                    <p className="text-3xl font-black text-gray-800 mt-1">₹{stats.totalRevenue.toLocaleString("en-IN")}</p>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
                <div className="flex flex-wrap items-center gap-3">
                    <CustomDropdown
                        size="md"
                        placeholder="All Statuses"
                        value={statusFilter}
                        onChange={setStatusFilter}
                        options={[
                            { value: "all", label: "All Statuses" },
                            ...ACTION_STATUS_OPTIONS.map((opt) => ({ value: opt.value, label: opt.label }))
                        ]}
                        className="w-48"
                    />
                    <CustomDropdown
                        size="md"
                        placeholder="All Action Types"
                        value={typeFilter}
                        onChange={setTypeFilter}
                        options={[
                            { value: "all", label: "All Action Types" },
                            ...ACTION_TYPES.map((type) => ({ value: type.value, label: type.label }))
                        ]}
                        className="w-56"
                    />
                </div>
                <button
                    onClick={handleExportCSV}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-100 bg-transparent text-[rgb(32,38,130)] hover:bg-[rgba(32,38,130,0.05)] transition-colors text-sm font-medium"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    Export CSV
                </button>
            </div>

            {filteredActions.length === 0 ? (
                <div className="bg-white/50 border-2 border-dashed border-gray-300 rounded-2xl p-12 flex flex-col items-center justify-center text-center">
                    <h3 className="text-gray-500 font-semibold text-lg">No actions found</h3>
                    <p className="text-gray-400 text-sm mt-1">
                        {statusFilter !== "all" || typeFilter !== "all"
                            ? "Try changing your filters."
                            : "Actions will appear here once users submit them."}
                    </p>
                </div>
            ) : (
                <div className="bg-white rounded-[2rem] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden flex flex-col">
                    <div className="w-full overflow-x-auto rounded-lg">
                        <table className="min-w-[900px] w-full">
                            <colgroup>
                                <col style={{ width: '110px' }} />
                                <col style={{ width: '160px' }} />
                                <col style={{ width: '140px' }} />
                                <col style={{ width: '100px' }} />
                                <col style={{ width: '200px' }} />
                                <col style={{ width: '110px' }} />
                                <col style={{ width: '130px' }} />
                                <col style={{ width: '160px' }} />
                            </colgroup>
                            <thead>
                                <tr className="bg-gray-50/50 border-b border-gray-100/50">
                                    <th className="py-5 px-6 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Registry ID</th>
                                    <th className="py-5 px-6 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Action Type</th>
                                    <th className="py-5 px-6 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Actor</th>
                                    <th className="py-5 px-6 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">CO₂e (kg)</th>
                                    <th className="py-5 px-6 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">User Email</th>
                                    <th className="py-5 px-6 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Date</th>
                                    <th className="py-5 px-6 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                                    <th className="py-5 px-6 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredActions.map((action) => (
                                    <tr key={action.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="py-4 px-6 text-sm font-mono font-semibold text-[rgb(32,38,130)]">
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
                                                <span className="text-gray-300">ECF-????</span>
                                            )}
                                        </td>
                                        <td className="py-4 px-6 text-sm font-medium text-gray-700">
                                            {ACTION_LABELS[action.actionType] || action.actionType}
                                        </td>
                                        <td className="py-4 px-6 text-sm text-gray-500">
                                            {action.actorName || <span className="text-gray-300">N/A</span>}
                                        </td>
                                        <td className="py-4 px-6 text-sm font-medium">
                                            {action.co2eKg != null ? (
                                                <span className="text-gray-600">{action.co2eKg.toFixed(3)}</span>
                                            ) : (
                                                <span className="text-gray-300">N/A</span>
                                            )}
                                        </td>
                                        <td className="py-4 px-6 text-sm text-gray-400">
                                            {action.userEmail || <span className="text-gray-300">N/A</span>}
                                        </td>
                                        <td className="py-4 px-6 text-sm text-gray-400 whitespace-nowrap">
                                            {formatDate(action.createdAt)}
                                        </td>
                                        <td className="py-4 px-6">
                                            <StatusBadge status={action.status || "pending"} />
                                        </td>
                                        <td className="px-4 py-3">
                                            <CustomDropdown
                                                size="sm"
                                                value={action.status || "pending"}
                                                disabled={updatingId === action.id}
                                                options={[
                                                    { value: "pending", label: "Pending" },
                                                    { value: "verified", label: "Verified" },
                                                    { value: "rejected", label: "Rejected" },
                                                ]}
                                                onChange={(newStatus) => handleStatusChange(action.id, newStatus as ActionStatus)}
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
