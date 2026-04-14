"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { getActionByRegistryId } from "@/lib/firestoreService";
import { ACTION_LABELS, APP_URL } from "@/lib/constants";
import { Action } from "@/types/action";
import ImpactCertificate, { Highlight } from "@/components/ImpactCertificate";
import ShareButtons from "@/components/ShareButtons";
import Spinner from "@/components/ui/Spinner";
import Button from "@/components/ui/Button";
import Link from "next/link";

export default function RegisterSuccessPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const registryId = searchParams.get("id");
    
    const [action, setAction] = useState<Action | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchAction() {
            if (!registryId) {
                setError("No Registry ID found");
                setLoading(false);
                return;
            }

            try {
                const data = await getActionByRegistryId(registryId);
                if (data) {
                    setAction(data);
                } else {
                    setError("Action record not found");
                }
            } catch (err) {
                console.error("Error fetching action:", err);
                setError("Failed to load registration details");
            } finally {
                setLoading(false);
            }
        }

        fetchAction();
    }, [registryId]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Spinner size="lg" />
            </div>
        );
    }

    if (error || !action) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
                <div className="max-w-md w-full bg-white rounded-[2.5rem] p-12 shadow-2xl text-center space-y-6">
                    <h1 className="text-2xl font-black text-slate-800">Something went wrong</h1>
                    <p className="text-slate-500 font-bold">{error || "Could not find your registration."}</p>
                    <Link href="/profile">
                        <Button className="w-full">Go to Dashboard</Button>
                    </Link>
                </div>
            </div>
        );
    }

    const year = new Date().getFullYear();
    const verifyUrl = `${APP_URL}/verify/${action.registryId}`;
    const summaryUrl = `${APP_URL}/summary/${action.registryId}`;

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="text-center space-y-4 mb-8">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#b0f0d6] text-[#003527] rounded-full text-xs font-black uppercase tracking-widest shadow-sm">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                        {action.status === "verified" ? "Verification Successful" : "Registration Successful"}
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">
                        {action.status === "verified" ? "Action Verified" : "Verification Pending"}
                    </h1>
                    <p className="text-slate-500 font-bold max-w-lg mx-auto leading-relaxed">
                        {action.status === "verified" 
                            ? "Your action has been verified and your official certificate is ready below." 
                            : "Your action has been registered. Our team is now verifying the details. Your official certificate will be updated once verified."}
                    </p>
                </div>

                <ImpactCertificate
                    registryId={action.registryId}
                    clientDetails={{
                        name: action.actorName || action.contactPerson || "Anonymous Actor",
                        email: action.email,
                        contact: action.phone,
                        type: action.actorType === 'individual' ? 'Individual' : 'Organization',
                    }}
                    sector={ACTION_LABELS[action.actionType] || action.actionType || "Action"}
                    location={action.address || "N/A"}
                    reportingPeriod={`Year ${year}`}
                    verificationStatus={action.status || "pending"}
                    tco2e={action.co2eKg != null ? (action.co2eKg / 1000).toFixed(2) : "N/A"}
                    atmanirbhar={action.atmanirbharPercent != null ? action.atmanirbharPercent.toFixed(0) : "N/A"}
                    circularity={action.circularityPercent != null ? action.circularityPercent.toFixed(1) : "N/A"}
                    highlights={[
                        { icon: "🌱", text: `Action Type: ${ACTION_LABELS[action.actionType] || action.actionType}` },
                        { icon: "📊", text: `Capacity / Quantity: ${action.quantity} ${action.unit || ""}`.trim() }
                    ]}
                    methodology="Climate Asset Verified Registry Protocol"
                    emissionFactors="MoEF&CC Guidelines / Custom Registry Factors"
                    verifyUrl={verifyUrl}
                    summaryUrl={summaryUrl}
                    sha256Hash={action.sha256Hash}
                    qrCodeType="action"
                />

                {action.status === "verified" && (
                    <div className="mt-12 bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
                        <ShareButtons
                            shareText={`Verified low-carbon action on Climate Asset Registry!\nReduced: ${(action.co2eKg! / 1000).toFixed(2)} tCO2e\n${action.atmanirbharPercent?.toFixed(0)}% Atmanirbhar | ${year}\nVerify: ${verifyUrl}`}
                            verifyUrl={verifyUrl}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
