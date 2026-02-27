"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { getActionByRegistryId } from "@/lib/firestoreService";
import { ACTION_LABELS } from "@/lib/constants";
import { Action } from "@/types/action";
import VerificationBadge from "@/components/VerificationBadge";
import QRCode from "@/components/QRCode";
import Spinner from "@/components/ui/Spinner";
import PublicShell from "@/components/PublicShell";

export default function VerifyPage() {
    const params = useParams();
    const registryId = params.id as string;
    const [action, setAction] = useState<Action | null>(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        async function fetchAction() {
            setLoading(true);
            try {
                const data = await getActionByRegistryId(registryId);
                if (data) {
                    setAction(data);
                } else {
                    setNotFound(true);
                }
            } catch {
                setNotFound(true);
            } finally {
                setLoading(false);
            }
        }

        if (registryId) {
            fetchAction();
        }
    }, [registryId]);

    if (loading) {
        return (
            <PublicShell>
                <div className="flex justify-center items-center py-20">
                    <Spinner size="lg" />
                </div>
            </PublicShell>
        );
    }

    if (notFound || !action) {
        return (
            <PublicShell>
                <div className="max-w-2xl mx-auto text-center py-20">
                    <h1 className="text-3xl font-black text-gray-800 mb-4">
                        Action Not Found
                    </h1>
                    <p className="text-gray-500">
                        No action found with Registry ID: <span className="font-mono font-bold">{registryId}</span>
                    </p>
                </div>
            </PublicShell>
        );
    }

    const formatDate = (timestamp: Action["createdAt"]) => {
        if (!timestamp?.toDate) return "N/A";
        return timestamp.toDate().toLocaleString("en-IN", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            timeZone: "Asia/Kolkata",
        });
    };

    return (
        <PublicShell>
            <div className="max-w-3xl mx-auto space-y-8">
                <div className="text-center space-y-4">
                    <h1 className="text-3xl font-black text-gray-800">
                        Verification Page
                    </h1>
                    <p className="text-lg font-mono font-bold text-[rgb(32,38,130)]">
                        {action.registryId}
                    </p>
                    <VerificationBadge status={action.status || "pending"} />
                </div>

                <div className="bg-white rounded-[2rem] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
                    <div className="px-8 py-6 bg-gray-50/50 border-b border-gray-100">
                        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider">
                            Action Details
                        </h2>
                    </div>
                    <div className="px-8 py-6 space-y-4">
                        <DetailRow label="Action Type" value={ACTION_LABELS[action.actionType] || action.actionType} />
                        <DetailRow label="Capacity / Quantity" value={`${action.quantity} ${action.unit}`} />
                        <DetailRow label="Location" value={action.address} />
                        {action.lat && action.lng && (
                            <DetailRow label="Geo-tag" value={`${action.lat.toFixed(6)}, ${action.lng.toFixed(6)}`} mono />
                        )}
                        <DetailRow label="Actor Type" value={action.actorType} />
                        <DetailRow label="Submitted" value={formatDate(action.createdAt)} />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-[2rem] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] px-8 py-6 space-y-3">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">
                            CO₂e Reduction
                        </h3>
                        <p className="text-3xl font-black text-gray-800">
                            {action.co2eKg != null ? (
                                `${action.co2eKg.toFixed(3)} kg`
                            ) : (
                                <span className="text-gray-400">N/A</span>
                            )}
                        </p>
                    </div>

                    <div className="bg-white rounded-[2rem] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] px-8 py-6 space-y-3">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">
                            Atmanirbhar Score
                        </h3>
                        <p className="text-3xl font-black text-gray-800">
                            {action.atmanirbharPercent != null
                                ? `${action.atmanirbharPercent.toFixed(1)}%`
                                : "Pending"}
                        </p>
                    </div>
                </div>

                <div className="bg-white rounded-[2rem] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] px-8 py-6 space-y-3">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">
                        Digital Signature (SHA-256)
                    </h3>
                    <p className="font-mono text-xs text-gray-600 break-all bg-gray-50 px-4 py-3 rounded-xl">
                        {action.sha256Hash || "Not generated"}
                    </p>
                    <p className="text-xs text-gray-400">
                        This hash proves the data has not been tampered with since submission.
                    </p>
                </div>

                <div className="flex justify-center">
                    <QRCode registryId={action.registryId} size={180} />
                </div>
            </div>
        </PublicShell>
    );
}

function DetailRow({
    label,
    value,
    mono = false,
}: {
    label: string;
    value: string;
    mono?: boolean;
}) {
    return (
        <div className="flex items-start justify-between py-2 border-b border-gray-50 last:border-0">
            <span className="text-sm font-medium text-gray-400 shrink-0">
                {label}
            </span>
            <span
                className={`text-sm text-gray-700 text-right ml-4 ${mono ? "font-mono" : "font-medium"}`}
            >
                {value}
            </span>
        </div>
    );
}
