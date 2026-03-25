"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { getActionByRegistryId, getActionsByUserId } from "@/lib/firestoreService";
import { ACTION_LABELS } from "@/lib/constants";
import { Action } from "@/types/action";
import { calculatePortfolioMetrics, PortfolioMetrics } from "@/lib/portfolioCalculator";
import VerificationBadge from "@/components/VerificationBadge";
import QRCode from "@/components/QRCode";
import Spinner from "@/components/ui/Spinner";
import PublicShell from "@/components/PublicShell";
import PerformanceBreakdownModal from "@/components/PerformanceBreakdownModal";
import Link from "next/link";
import ImpactCertificate, { Highlight } from "@/components/ImpactCertificate";
import ShareButtons from "@/components/ShareButtons";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://registryearthcarbon.org";

export default function VerifyPage() {
    const params = useParams();
    const registryId = params.id as string;
    const [action, setAction] = useState<Action | null>(null);
    const [portfolio, setPortfolio] = useState<PortfolioMetrics | null>(null);
    const [isBreakdownModalOpen, setIsBreakdownModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        async function fetchAction() {
            setLoading(true);
            try {
                const data = await getActionByRegistryId(registryId);
                if (data) {
                    setAction(data);
                    if (data.userId) {
                        try {
                            const userActions = await getActionsByUserId(data.userId);
                            if (userActions.length > 0) {
                                setPortfolio(calculatePortfolioMetrics(userActions));
                            }
                        } catch (err) {
                            console.error("Failed to fetch user portfolio", err);
                        }
                    }
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
        if (!timestamp) return "N/A";
        const date = typeof timestamp === "string"
            ? new Date(timestamp)
            : timestamp?.toDate?.()
                ? timestamp.toDate()
                : null;
        if (!date || isNaN(date.getTime())) return "N/A";
        return date.toLocaleString("en-IN", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            timeZone: "Asia/Kolkata",
        });
    };

    const tco2e = action.co2eKg != null ? (action.co2eKg / 1000).toFixed(2) : null;
    const atmanirbhar = action.atmanirbharPercent != null ? action.atmanirbharPercent.toFixed(0) : null;
    const circularity = action.circularityPercent != null ? action.circularityPercent.toFixed(1) : null;
    const year = new Date().getFullYear();
    const verifyUrl = `${APP_URL}/verify/${action.registryId}`;

    const shareText = tco2e && atmanirbhar
        ? `Verified low-carbon action on Earth Carbon Registry!\nReduced: ${tco2e} tCO2e\n${atmanirbhar}% Atmanirbhar | ${year}\nVerify: ${verifyUrl}`
        : `Verified carbon action on Earth Carbon Registry!\nRegistry ID: ${action.registryId}\nVerify: ${verifyUrl}`;
    
    // Build highlights
    const highlights: Highlight[] = [];
    if (action.actionType) {
        highlights.push({ icon: "✅", text: `Action Type: ${ACTION_LABELS[action.actionType] || action.actionType}` });
    }
    if (action.quantity) {
        highlights.push({ icon: "⚡", text: `Capacity / Quantity: ${action.quantity} ${action.unit || ""}`.trim() });
    }
    if (action.localPercent != null || action.indigenousPercent != null) {
        highlights.push({ icon: "🇮🇳", text: `${action.localPercent || 0}% Local Sourcing, ${action.indigenousPercent || 0}% Indigenous Tech` });
    }

    return (
        <PublicShell>
            <div className="max-w-4xl mx-auto space-y-12 pb-20">
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
                    tco2e={tco2e ? tco2e.toString() : "N/A"}
                    atmanirbhar={atmanirbhar ? atmanirbhar.toString() : "N/A"}
                    circularity={circularity ? circularity.toString() : "N/A"}
                    highlights={highlights}
                    methodology="Earth Carbon Verified Registry Protocol"
                    emissionFactors="MoEF&CC Guidelines / Custom Registry Factors"
                    verifyUrl={verifyUrl}
                    sha256Hash={action.sha256Hash}
                    qrCodeType="action"
                />
                
                {action.status === "pending" && (
                    <div className="max-w-4xl mx-auto bg-yellow-50 rounded-xl p-4 border border-yellow-200 flex items-center gap-3">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-yellow-600 flex-shrink-0">
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                        </svg>
                        <p className="text-sm text-yellow-800">
                            <strong>Under Review</strong> — This action is awaiting verification. The certificate shows provisional data until formally verified.
                        </p>
                    </div>
                )}

                {action.status === "verified" && portfolio && (
                    <div className="max-w-4xl mx-auto">
                        <div className="mt-8 bg-gradient-to-br from-[rgb(32,38,130)] to-[rgb(20,24,90)] rounded-[2rem] shadow-2xl overflow-hidden relative">
                            {/* Portfolio Content */}
                            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                                <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M22 12A10 10 0 1 1 12 2a10 10 0 0 1 10 10z" />
                                    <path d="M12 2v20" />
                                    <path d="M2 12h20" />
                                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                                </svg>
                            </div>
                            <div className="px-8 py-6 border-b border-blue-800/50 flex justify-between items-center relative z-10">
                                <h2 className="text-sm font-bold text-blue-200 uppercase tracking-wider">
                                    Digital Climate Signature (Total Portfolio)
                                </h2>
                            </div>
                            <div className="px-8 py-6 relative z-10">
                                <p className="text-blue-100 mb-6 text-sm">
                                    This user's holistic impact across Energy, Water, and Waste resource pillars.
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <Link
                                        href={`/portfolio/${action.userId}`}
                                        className="group bg-white/10 hover:bg-white/20 border-2 border-transparent hover:border-blue-400 transition-all rounded-2xl p-4 text-left backdrop-blur-sm cursor-pointer block"
                                    >
                                        <div className="text-xs font-bold text-blue-200 uppercase tracking-wider mb-1">Total Impact</div>
                                        <div className="text-2xl font-black text-white group-hover:text-blue-200 transition-colors">-{portfolio.totalTCO2e.toFixed(3)}</div>
                                        <div className="text-xs font-bold text-blue-400">Total tCO₂e Reduced <span className="text-white/50 inline-block ml-1">→</span></div>
                                    </Link>

                                    <Link
                                        href={`/portfolio/${action.userId}`}
                                        className="group bg-white/10 hover:bg-white/20 border-2 border-transparent hover:border-cyan-400 transition-all rounded-2xl p-4 text-left backdrop-blur-sm cursor-pointer block"
                                    >
                                        <div className="text-xs font-bold text-blue-200 uppercase tracking-wider mb-1">Total Atmanirbhar</div>
                                        <div className="text-2xl font-black text-white group-hover:text-cyan-300 transition-colors">{portfolio.totalAtmanirbharPercent.toFixed(1)}%</div>
                                        <div className="text-xs font-bold text-cyan-400">Resource Independence <span className="text-white/50 inline-block ml-1">→</span></div>
                                    </Link>
                                </div>

                                {/* 3 Pillar Mini Badges */}
                                <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 mt-5">
                                    <div className="flex items-center gap-2 bg-gradient-to-br from-orange-400/10 to-orange-500/5 border border-orange-400/20 px-3 py-1.5 rounded-full text-xs font-medium">
                                        <span className="text-orange-400 font-bold">Energy:</span>
                                        <span className="text-white">-{portfolio.energy.tCO2e.toFixed(1)}t</span>
                                        <span className="text-orange-300 font-mono">|</span>
                                        <span className="text-white">{portfolio.energy.atmanirbharAvg.toFixed(0)}%</span>
                                    </div>
                                    <div className="flex items-center gap-2 bg-gradient-to-br from-cyan-400/10 to-cyan-500/5 border border-cyan-400/20 px-3 py-1.5 rounded-full text-xs font-medium">
                                        <span className="text-cyan-400 font-bold">Water:</span>
                                        <span className="text-white">-{portfolio.water.tCO2e.toFixed(1)}t</span>
                                        <span className="text-cyan-300 font-mono">|</span>
                                        <span className="text-white">{portfolio.water.atmanirbharAvg.toFixed(0)}%</span>
                                    </div>
                                    <div className="flex items-center gap-2 bg-gradient-to-br from-blue-400/10 to-blue-500/5 border border-blue-400/20 px-3 py-1.5 rounded-full text-xs font-medium">
                                        <span className="text-blue-400 font-bold">Waste:</span>
                                        <span className="text-white">-{portfolio.waste.tCO2e.toFixed(1)}t</span>
                                        <span className="text-blue-300 font-mono">|</span>
                                        <span className="text-white">{portfolio.waste.atmanirbharAvg.toFixed(0)}%</span>
                                    </div>
                                </div>

                                <p className="text-center text-xs text-blue-300/60 mt-4">* Click metrics to view full 3-pillar breakdown</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Extended Disclaimer */}
                <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 max-w-4xl mx-auto">
                    <p className="text-sm text-gray-600">
                        The values shown above are estimated based on user-submitted data.
                        Earth Carbon Foundation verifies all registered actions in good faith.
                        Actual impact may vary depending on real-world conditions.
                    </p>
                </div>

                <ShareButtons shareText={shareText} verifyUrl={verifyUrl} />
            </div>
            <PerformanceBreakdownModal
                isOpen={isBreakdownModalOpen}
                onClose={() => setIsBreakdownModalOpen(false)}
                portfolio={portfolio}
            />
        </PublicShell >
    );
}

// Remove unused DetailRow to clean up the code

