"use client";

import React, { useRef, useState } from "react";
import * as htmlToImage from "html-to-image";
import QRCode from "@/components/QRCode";
import { SECTOR_LABELS } from "@/lib/constants";

export interface Highlight {
    icon: string;
    text: string;
}

export interface ImpactCertificateProps {
    registryId: string;
    clientDetails: {
        name: string;
        contactPerson?: string;
        type?: string;
        email?: string;
        contact?: string;
    };
    sector: string;
    location: string;
    reportingPeriod: string;
    verificationStatus: "verified" | "pending" | "rejected" | string;
    tco2e: string;
    atmanirbhar: string;
    circularity: string;
    highlights: Highlight[];
    methodology: string;
    emissionFactors: string;
    verifyUrl: string;
    sha256Hash?: string;
    qrCodeType?: "action" | "school";
    shareText?: string;
}

export default function ImpactCertificate({
    registryId,
    clientDetails,
    sector,
    location,
    reportingPeriod,
    verificationStatus,
    tco2e,
    atmanirbhar,
    circularity,
    highlights,
    methodology,
    emissionFactors,
    verifyUrl,
    sha256Hash,
    qrCodeType = "action",
    shareText = "Check out my climate action on the Earth Carbon Registry!"
}: ImpactCertificateProps) {
    const certificateRef = useRef<HTMLDivElement>(null);
    const [isDownloading, setIsDownloading] = useState(false);

    const handleDownload = async () => {
        if (!certificateRef.current) return;
        setIsDownloading(true);
        try {
            await new Promise((resolve) => setTimeout(resolve, 100)); // wait for font load
            const dataUrl = await htmlToImage.toPng(certificateRef.current, {
                quality: 1,
                pixelRatio: 2,
                backgroundColor: "#ffffff",
                style: {
                    transform: 'scale(1)',
                    transformOrigin: 'top left'
                }
            });
            const link = document.createElement("a");
            link.download = `Certificate_${registryId}.png`;
            link.href = dataUrl;
            link.click();
        } catch (error) {
            console.error("Failed to download certificate:", error);
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
            {/* The Certificate Wrapper to Capture */}
            <div
                ref={certificateRef}
                className="bg-white text-gray-800 rounded-none sm:rounded-2xl border-2 border-[rgb(32,38,130)] p-6 sm:p-10 shadow-2xl relative overflow-hidden"
            >
                {/* Background Pattern */}
                <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                    <svg width="200" height="200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 12A10 10 0 1 1 12 2a10 10 0 0 1 10 10z" />
                        <path d="M12 2v20" />
                        <path d="M2 12h20" />
                        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                    </svg>
                </div>

                {/* 1. Header */}
                <div className="border-b-2 border-gray-900 pb-4 mb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4 relative z-10">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-xl">🌍</span>
                            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-gray-900">
                                EARTH CARBON REGISTRY <span className="text-gray-400 font-light">|</span> IMPACT CERTIFICATE
                            </h1>
                        </div>
                        <p className="font-mono text-sm text-gray-500 font-bold">
                            Verified Summary | ID: {registryId}
                        </p>
                    </div>
                </div>

                {/* 2. Client Info */}
                <div className="border-b border-gray-200 pb-6 mb-6 relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 text-sm">
                        <div>
                            <span className="text-gray-400 uppercase tracking-widest text-[10px] font-bold block mb-1">Client Details</span>
                            <span className="font-bold text-gray-900 text-lg uppercase block mb-1">{clientDetails.name}</span>
                            {clientDetails.contactPerson && <div className="text-gray-700 text-sm font-bold mb-1 italic">Attn: {clientDetails.contactPerson}</div>}
                            {clientDetails.email && <div className="text-gray-600 text-xs">{clientDetails.email}</div>}
                            {clientDetails.contact && <div className="text-gray-600 text-xs">{clientDetails.contact}</div>}
                            {clientDetails.type && <div className="text-gray-500 text-[10px] font-bold uppercase mt-1">({clientDetails.type})</div>}
                        </div>
                        <div>
                            <span className="text-gray-400 uppercase tracking-widest text-[10px] font-bold block mb-1">Verification Status</span>
                            <div className="flex items-center gap-2">
                                {verificationStatus === "verified" ? (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-800 text-xs font-black uppercase rounded-sm border border-green-200">
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                                        Verified
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-black uppercase rounded-sm border border-yellow-200">
                                        <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                                        Pending / Self-Reported
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="col-span-1 md:col-span-2 flex flex-wrap gap-x-8 gap-y-4">
                            <div>
                                <span className="text-gray-400 uppercase tracking-widest text-[10px] font-bold block mb-1">Sector / Action Type</span>
                                <span className="font-semibold text-gray-700">{SECTOR_LABELS[sector] || sector}</span>
                            </div>
                            <div>
                                <span className="text-gray-400 uppercase tracking-widest text-[10px] font-bold block mb-1">Location</span>
                                <span className="font-semibold text-gray-700">{location}</span>
                            </div>
                            <div>
                                <span className="text-gray-400 uppercase tracking-widest text-[10px] font-bold block mb-1">Reporting Period</span>
                                <span className="font-semibold text-gray-700">{reportingPeriod}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. Core Impact Metrics */}
                <div className="border-b border-gray-200 pb-6 mb-6 relative z-10">
                    <h2 className="text-xs font-black uppercase tracking-widest text-gray-500 mb-4">
                        CORE IMPACT METRICS
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* CO2e */}
                        <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-xl p-5 text-white shadow-md relative overflow-hidden">
                            <div className="absolute -right-4 -bottom-4 opacity-10 text-8xl"></div>
                            <h3 className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-2">tCO₂e REDUCED</h3>
                            <div className="flex items-baseline gap-1 relative z-10">
                                <span className="text-3xl font-black">{tco2e}</span>
                                <span className="text-xs font-bold opacity-80">t</span>
                            </div>
                            <div className="mt-2 pt-2 border-t border-white/20 text-[10px] font-bold text-emerald-100 relative z-10">
                                {verificationStatus === 'verified' ? '▼ vs Baseline' : 'Estimated Offset'}
                            </div>
                        </div>
                        {/* Atmanirbhar */}
                        <div className="bg-gradient-to-br from-blue-600 to-[rgb(32,38,130)] rounded-xl p-5 text-white shadow-md relative overflow-hidden">
                            <div className="absolute -right-4 -bottom-4 opacity-10 text-8xl"></div>
                            <h3 className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-2">ATMANIRBHAR % SCORE</h3>
                            <div className="flex items-baseline gap-1 relative z-10">
                                <span className="text-3xl font-black">{atmanirbhar}</span>
                                <span className="text-xs font-bold opacity-80">%</span>
                            </div>
                            <div className="mt-2 pt-2 border-t border-white/20 text-[10px] font-bold text-blue-100 relative z-10">
                                {verificationStatus === 'verified' ? '▲ Local Impact' : 'Self-Sustaining Rate'}
                            </div>
                        </div>
                        {/* Circularity */}
                        <div className="bg-gradient-to-br from-sky-400 to-sky-600 rounded-xl p-5 text-white shadow-md relative overflow-hidden">
                            <div className="absolute -right-4 -bottom-4 opacity-10 text-8xl"></div>
                            <h3 className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-2">CIRCULARITY SCORE</h3>
                            <div className="flex items-baseline gap-1 relative z-10">
                                <span className="text-3xl font-black">{circularity}</span>
                                <span className="text-xs font-bold opacity-80">%</span>
                            </div>
                            <div className="mt-2 pt-2 border-t border-white/20 text-[10px] font-bold text-sky-100 relative z-10">
                                {verificationStatus === 'verified' ? '▲ Diverted Waste' : 'Resource Re-use Rate'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 4. Action Highlights */}
                <div className="border-b border-gray-200 pb-6 mb-6 relative z-10">
                    <h2 className="text-xs font-black uppercase tracking-widest text-gray-500 mb-4">
                        ACTION HIGHLIGHTS (Top 3)
                    </h2>
                    <ul className="space-y-3 mb-6">
                        {highlights.map((highlight, index) => (
                            <li key={index} className="flex items-start gap-3">
                                <span className="text-base mt-0.5">{highlight.icon}</span>
                                <span className="text-sm font-medium text-gray-800 leading-relaxed">{highlight.text}</span>
                            </li>
                        ))}
                        {highlights.length === 0 && (
                            <li className="text-sm italic text-gray-400">No specific highlights provided.</li>
                        )}
                    </ul>
                    <div className="flex flex-wrap gap-x-8 gap-y-2 text-xs">
                        <div>
                            <span className="font-bold text-gray-500">Methodology: </span>
                            <span className="text-gray-700">{methodology}</span>
                        </div>
                        <div>
                            <span className="font-bold text-gray-500">Emission Factors: </span>
                            <span className="text-gray-700">{emissionFactors}</span>
                        </div>
                    </div>
                </div>


                {/* 7. Share & Validate Footer */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10 pt-4">
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-white rounded-xl shadow-sm border border-gray-200">
                            <QRCode registryId={registryId} size={80} type={qrCodeType} />
                        </div>
                        <div className="text-xs space-y-1 text-gray-600">
                            <div className="font-bold text-gray-900 uppercase">Public Badge</div>
                            <div>Verify Online: <span className="text-[rgb(32,38,130)] break-all">{verifyUrl}</span></div>
                            <div>Contact: info@earthcarbonfoundation.org</div>
                        </div>
                    </div>
                    
                    {/* Timestamp and signatures */}
                    <div className="text-right space-y-3 flex flex-col justify-end">
                        {sha256Hash && (
                            <div className="inline-block text-left p-2.5 border border-dashed border-gray-300 rounded-md bg-gray-50 shadow-inner">
                                <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">DIGITAL SIGNATURE footprint</div>
                                <div className="font-mono text-xs text-gray-800 break-all max-w-[280px]">
                                    {sha256Hash}
                                </div>
                            </div>
                        )}
                        <div className="text-[10px] text-gray-400 font-bold uppercase">© {new Date().getFullYear()} Earth Carbon Foundation | Non-Transferable</div>
                    </div>
                </div>
            </div>

            {/* Action Buttons (outside the certificate to avoid capturing them in the image) */}
            <div className="flex flex-col sm:flex-row justify-end gap-3 px-2 sm:px-0 mt-6">
                <button
                    onClick={handleDownload}
                    disabled={isDownloading}
                    className="flex items-center justify-center gap-2 bg-[rgb(32,38,130)] text-white font-bold text-sm px-6 py-3 rounded-xl hover:bg-blue-900 transition-colors shadow-lg shadow-blue-900/20 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {isDownloading ? (
                        <>
                            <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Processing...
                        </>
                    ) : (
                        <>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                            Download High-Res Image
                        </>
                    )}
                </button>
            </div>
            
            <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 flex items-start gap-3 mt-4 text-sm text-blue-800">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mt-0.5 shrink-0"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
                <p>
                    <strong>Sharing to Social Media:</strong> First, download your certificate as an image using the button above. Then, use the share buttons below to compose your post and manually attach the downloaded image for the best visual impact.
                </p>
            </div>
        </div>
    );
}
