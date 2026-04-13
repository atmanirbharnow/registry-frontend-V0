"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { getActionByRegistryId, getActionsByUserId } from "@/lib/firestoreService";
import { getSchoolByRegistryId } from "@/lib/schoolFirestoreService";
import { ACTION_LABELS, ACTION_TYPES, APP_URL } from "@/lib/constants";
import { Action } from "@/types/action";
import { School } from "@/types/school";
import { calculatePortfolioMetrics, PortfolioMetrics } from "@/lib/portfolioCalculator";
import VerificationBadge from "@/components/VerificationBadge";
import QRCode from "@/components/QRCode";
import Spinner from "@/components/ui/Spinner";
import PublicShell from "@/components/PublicShell";
import PerformanceBreakdownModal from "@/components/PerformanceBreakdownModal";
import Link from "next/link";
import ImpactCertificate, { Highlight } from "@/components/ImpactCertificate";
import ShareButtons from "@/components/ShareButtons";



export default function VerifyPage() {
    const params = useParams();
    const registryId = params.id as string;
    const [action, setAction] = useState<Action | null>(null);
    const [school, setSchool] = useState<School | null>(null);
    const [portfolio, setPortfolio] = useState<PortfolioMetrics | null>(null);
    const [isBreakdownModalOpen, setIsBreakdownModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            try {
                // 1. Try Individual Action first
                const actionData = await getActionByRegistryId(registryId);
                if (actionData) {
                    setAction(actionData);
                    if (actionData.userId) {
                        try {
                            const userActions = await getActionsByUserId(actionData.userId);
                            if (userActions.length > 0) {
                                setPortfolio(calculatePortfolioMetrics(userActions));
                            }
                        } catch (err) {
                            console.error("Failed to fetch user portfolio", err);
                        }
                    }
                    return;
                }

                // 2. Try School if not found
                const schoolData = await getSchoolByRegistryId(registryId);
                if (schoolData) {
                    setSchool(schoolData);
                    return;
                }

                setNotFound(true);
            } catch (error) {
                console.error("Verification fetch error:", error);
                setNotFound(true);
            } finally {
                setLoading(false);
            }
        }
        if (registryId) {
            fetchData();
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

    if (notFound || (!action && !school)) {
        return (
            <PublicShell>
                <div className="max-w-2xl mx-auto text-center py-20 px-4">
                    <h1 className="text-3xl font-black text-gray-800 mb-4">
                        Record Not Found
                    </h1>
                    <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                        <p className="text-gray-500 mb-6">
                            No action or school found with Registry ID: <span className="font-mono font-bold text-[#003527]">{registryId}</span>
                        </p>
                        <Link href="/" className="inline-flex items-center gap-2 text-[#003527] font-bold hover:underline">
                            Return to Homepage
                        </Link>
                    </div>
                </div>
            </PublicShell>
        );
    }

    const year = new Date().getFullYear();

    // Map data for either Action or School
    const displayData = action ? {
        registryId: action.registryId,
        name: action.actorName || action.contactPerson || "Anonymous Actor",
        email: action.email,
        contact: action.phone,
        type: action.actorType === 'individual' ? 'Individual' : 'Organization',
        sector: ACTION_LABELS[action.actionType] || action.actionType || "Action",
        location: action.address || "N/A",
        status: action.status || "pending",
        tco2e: action.co2eKg != null ? (action.co2eKg / 1000).toFixed(2) : "N/A",
        atmanirbhar: action.atmanirbharPercent != null ? action.atmanirbharPercent.toFixed(0) : "N/A",
        circularity: action.circularityPercent != null ? action.circularityPercent.toFixed(1) : "N/A",
        sha256Hash: action.sha256Hash,
        qrCodeType: "action" as any,
        methodology: "Climate Asset Verified Registry Protocol",
        highlights: (() => {
            const h: Highlight[] = [];
            if (action.actionType) h.push({ icon: "", text: `Action Type: ${ACTION_LABELS[action.actionType] || action.actionType}` });
            if (action.quantity) h.push({ icon: "", text: `Capacity / Quantity: ${action.quantity} ${action.unit || ""}`.trim() });
            if (action.localPercent != null || action.indigenousPercent != null) {
                h.push({ icon: "", text: `${action.localPercent || 0}% Local Sourcing, ${action.indigenousPercent || 0}% Indigenous Tech` });
            }
            return h;
        })()
    } : {
        registryId: school!.registryId,
        name: school!.schoolName || "School Name",
        email: school!.email,
        contact: school!.phone,
        type: 'Education Institute / School',
        sector: school!.action_type ? ACTION_TYPES.find(a => a.value === school!.action_type)?.label || school!.action_type : school!.sector || "Education Institute / School",
        location: `${school!.city || 'City'}, ${school!.pincode || ''}`,
        status: school!.status || "pledged",
        tco2e: school!.tco2e_annual != null ? Math.abs(school!.tco2e_annual).toFixed(2) : "N/A",
        atmanirbhar: school!.atmanirbhar_pct != null ? school!.atmanirbhar_pct.toFixed(0) : "N/A",
        circularity: school!.circularity_pct != null ? school!.circularity_pct.toFixed(1) : "N/A",
        sha256Hash: school!.sha256Hash,
        qrCodeType: "school" as any,
        methodology: "Climate Asset Verified Registry Protocol (School Module)",
        highlights: (() => {
            const h: Highlight[] = [];
            h.push({ icon: "", text: `Educational Institution: ${school!.students_count || 0} Students` });
            const energyConsumed = ((school!.baselineEnergyGrid || 0) + (school!.baselineEnergyDiesel || 0) + (school!.baselineEnergySolar || 0)) * 12;
            const finalEnergy = energyConsumed || school!.electricity_kWh_year || 0;
            h.push({ icon: "", text: `${finalEnergy} kWh Energy consumed / yr` });
            
            let wasteDiverted = 0;
            const type = (school!.action_type || school!.action_id || "").toLowerCase();
            if (type.includes("waste") || type.includes("compost") || type.includes("biogas") || type.includes("recycl")) {
                wasteDiverted = (school! as any).actionQuantity || 0;
            } else {
                wasteDiverted = school!.waste_diverted_kg || 0;
            }
            if (wasteDiverted > 0) {
                h.push({ icon: "", text: `${wasteDiverted} kg Waste diverted from landfill` });
            }
            return h;
        })()
    };

    const verifyUrl = `${APP_URL}/verify/${displayData.registryId}`;
    const summaryUrl = `${APP_URL}/summary/${displayData.registryId}`;

    return (
        <PublicShell>
            <div className="max-w-4xl mx-auto space-y-12 pb-20 px-4 md:px-0">
                <ImpactCertificate
                    registryId={displayData.registryId}
                    clientDetails={{
                        name: displayData.name,
                        email: displayData.email,
                        contact: displayData.contact,
                        type: displayData.type,
                    }}
                    sector={displayData.sector}
                    location={displayData.location}
                    reportingPeriod={`Year ${year}`}
                    verificationStatus={displayData.status}
                    tco2e={displayData.tco2e}
                    atmanirbhar={displayData.atmanirbhar}
                    circularity={displayData.circularity}
                    highlights={displayData.highlights}
                    methodology={displayData.methodology}
                    emissionFactors="MoEF&CC Guidelines / Custom Registry Factors"
                    verifyUrl={verifyUrl}
                    summaryUrl={summaryUrl}
                    sha256Hash={displayData.sha256Hash}
                    qrCodeType={displayData.qrCodeType}
                />
                
                {(displayData.status === "pending" || displayData.status === "pledged") && (
                    <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200 flex items-center gap-3">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-yellow-600 flex-shrink-0">
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                        </svg>
                        <p className="text-sm text-yellow-800">
                            <strong>Under Review</strong> — This action is awaiting verification. The certificate shows provisional data until formally verified.
                        </p>
                    </div>
                )}

                <ShareButtons
                    shareText={action
                        ? (displayData.tco2e !== "N/A" && displayData.atmanirbhar !== "N/A"
                            ? `Verified low-carbon action on Climate Asset Registry!\nReduced: ${displayData.tco2e} tCO2e\n${displayData.atmanirbhar}% Atmanirbhar | ${year}\nVerify: ${verifyUrl}`
                            : `Verified carbon action on Climate Asset Registry!\nRegistry ID: ${displayData.registryId}\nVerify: ${verifyUrl}`)
                        : `Check out ${displayData.name}'s climate action on the Climate Asset Registry: ${verifyUrl}`
                    }
                    verifyUrl={verifyUrl}
                />
            </div>
            <PerformanceBreakdownModal
                isOpen={isBreakdownModalOpen}
                onClose={() => setIsBreakdownModalOpen(false)}
                portfolio={portfolio}
            />
        </PublicShell >
    );
}
