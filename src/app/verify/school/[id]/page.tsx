"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { getSchoolByRegistryIdRealtime } from "@/lib/schoolFirestoreService";
import { School } from "@/types/school";
import VerificationBadge from "@/components/VerificationBadge";
import QRCode from "@/components/QRCode";
import Spinner from "@/components/ui/Spinner";
import PublicShell from "@/components/PublicShell";
import Link from "next/link";
import { APP_URL } from "@/lib/constants";
import ImpactCertificate, { Highlight } from "@/components/ImpactCertificate";
import ShareButtons from "@/components/ShareButtons";

export default function SchoolVerifyPage() {
    const params = useParams();
    const registryId = params.id as string;
    const [school, setSchool] = useState<School | null>(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        if (!registryId) return;

        setLoading(true);
        const unsubscribe = getSchoolByRegistryIdRealtime(
            registryId,
            (data) => {
                if (data) {
                    setSchool(data);
                    setNotFound(false);
                } else {
                    setNotFound(true);
                }
                setLoading(false);
            },
            (err) => {
                console.error(err);
                setNotFound(true);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [registryId]);

    if (loading) return <PublicShell><div className="flex justify-center py-20"><Spinner size="lg" /></div></PublicShell>;

    if (notFound || !school) {
        return (
            <PublicShell>
                <div className="max-w-2xl mx-auto text-center py-20">
                    <h1 className="text-3xl font-black text-gray-800 mb-4">School Not Found</h1>
                    <p className="text-gray-500">No school found with Registry ID: <span className="font-mono font-bold">{registryId}</span></p>
                    <Link href="/" className="inline-block mt-8 text-[rgb(32,38,130)] font-bold hover:underline">
                        Return to homepage
                    </Link>
                </div>
            </PublicShell>
        );
    }

    const tco2e = school.tco2e_annual != null ? Math.abs(school.tco2e_annual).toFixed(2) : "N/A";

    // Convert carbon intensity to Kg for better readability if student count is large
    const intensityRaw = (school.tco2e_annual || 0) * 1000 / (school.students_count || 1);
    const intensityVal = intensityRaw.toFixed(2);

    const verifyUrl = `${APP_URL}/verify/school/${school.registryId}`;
    const shareText = `Check out ${school.schoolName}'s climate action on the Earth Carbon Registry: ${verifyUrl}`;

    const highlights: Highlight[] = [
        { icon: "🏫", text: `Educational Institution: ${school.students_count || 0} Students` },
        { icon: "⚡", text: `${school.electricity_kWh_year || 0} kWh Energy consumed / yr` },
        { icon: "♻️", text: `${school.waste_diverted_kg || 0} kg Waste diverted from landfill` }
    ];

    return (
        <PublicShell>
            <div className="max-w-4xl mx-auto space-y-12 pb-20 px-4 sm:px-0">
                <ImpactCertificate
                    registryId={school.registryId}
                    clientDetails={{
                        name: school.schoolName || "School Name",
                        email: school.email,
                        contact: school.phone,
                        type: 'Education Institute / School'
                    }}
                    sector="Education Institute / School"
                    location={`${school.city || 'City'}, ${school.pincode || ''}`}
                    reportingPeriod={`Year ${new Date().getFullYear()}`}
                    verificationStatus={school.status || "pledged"}
                    tco2e={tco2e}
                    atmanirbhar={school.atmanirbhar_pct != null ? school.atmanirbhar_pct.toFixed(0) : "N/A"}
                    circularity={school.circularity_pct != null ? school.circularity_pct.toFixed(1) : "N/A"}
                    highlights={highlights}
                    methodology="Earth Carbon Verified Registry Protocol (School Module)"
                    emissionFactors="MoEF&CC Guidelines / Custom Registry Factors"
                    verifyUrl={verifyUrl}
                    sha256Hash={school.sha256Hash}
                    qrCodeType="school"
                />

                {school.status === "verified" && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <div className="bg-white p-6 rounded-[2rem] border-2 border-emerald-100 shadow-sm flex flex-col items-center text-center">
                            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-2">Verified Carbon Reduced</span>
                            <div className="text-3xl font-black text-emerald-800">{tco2e || "0.00"} <span className="text-sm opacity-50">tCO2e</span></div>
                        </div>
                        <div className="bg-white p-6 rounded-[2rem] border-2 border-cyan-100 shadow-sm flex flex-col items-center text-center">
                            <span className="text-[10px] font-black text-cyan-600 uppercase tracking-widest mb-2">Verified Atmanirbhar</span>
                            <div className="text-3xl font-black text-cyan-800">{school.atmanirbhar_pct != null ? school.atmanirbhar_pct.toFixed(0) : "0"}%</div>
                        </div>
                        <div className="bg-white p-6 rounded-[2rem] border-2 border-indigo-100 shadow-sm flex flex-col items-center text-center">
                            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-2">Verified Circularity</span>
                            <div className="text-3xl font-black text-indigo-800">{school.circularity_pct != null ? school.circularity_pct.toFixed(1) : "0"}%</div>
                        </div>
                    </div>
                )}

                {school.status === "pledged" && (
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

                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="space-y-0.5 text-center sm:text-left">
                        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Carbon Intensity</h3>
                        <p className="text-gray-500 text-[11px] font-medium italic">Emissions per student per year</p>
                    </div>
                    <div className="flex items-baseline gap-1.5">
                        <span className="text-3xl font-black text-gray-900">{intensityVal}</span>
                        <span className="text-xs font-bold text-gray-400">Kg CO₂e / student</span>
                    </div>
                </div>



                <ShareButtons shareText={shareText} verifyUrl={verifyUrl} />

                <div className="text-center pt-8">
                    <Link href="https://climateassetregistry.org" className="text-sm font-bold text-gray-400 hover:text-[rgb(32,38,130)] transition-colors">
                        ← Back to Climate Asset Registry
                    </Link>
                </div>
            </div>
        </PublicShell>
    );
}

// Remove previously unused subcomponents




