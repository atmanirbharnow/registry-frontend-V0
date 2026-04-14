"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { getSchoolByRegistryId } from "@/lib/schoolFirestoreService";
import { ACTION_TYPES, APP_URL } from "@/lib/constants";
import { School } from "@/types/school";
import ImpactCertificate, { Highlight } from "@/components/ImpactCertificate";
import ShareButtons from "@/components/ShareButtons";
import Spinner from "@/components/ui/Spinner";
import Button from "@/components/ui/Button";
import Link from "next/link";

export default function SchoolRegisterSuccessPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const registryId = searchParams.get("id");
    
    const [school, setSchool] = useState<School | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchSchool() {
            if (!registryId) {
                setError("No Registry ID found");
                setLoading(false);
                return;
            }

            try {
                const data = await getSchoolByRegistryId(registryId);
                if (data) {
                    setSchool(data);
                } else {
                    setError("School record not found");
                }
            } catch (err) {
                console.error("Error fetching school:", err);
                setError("Failed to load registration details");
            } finally {
                setLoading(false);
            }
        }

        fetchSchool();
    }, [registryId]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Spinner size="lg" />
            </div>
        );
    }

    if (error || !school) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
                <div className="max-w-md w-full bg-white rounded-[2.5rem] p-12 shadow-2xl text-center space-y-6">
                    <h1 className="text-2xl font-black text-slate-800">Something went wrong</h1>
                    <p className="text-slate-500 font-bold">{error || "Could not find your school registration."}</p>
                    <Link href="/profile">
                        <Button className="w-full">Go to Dashboard</Button>
                    </Link>
                </div>
            </div>
        );
    }

    const year = new Date().getFullYear();
    const verifyUrl = `${APP_URL}/verify/${school.registryId}`;
    const summaryUrl = `${APP_URL}/summary/${school.registryId}`;

    const sectorLabel = school.action_type ? ACTION_TYPES.find(a => a.value === school.action_type)?.label || school.action_type : school.sector || "Education Institute / School";

    const highlights: Highlight[] = [
        { icon: "🏫", text: `Educational Institution: ${school.students_count || 0} Students` }
    ];
    
    const energyConsumed = ((school.baselineEnergyGrid || 0) + (school.baselineEnergyDiesel || 0) + (school.baselineEnergySolar || 0)) * 12;
    const finalEnergy = energyConsumed || school.electricity_kWh_year || 0;
    highlights.push({ icon: "⚡", text: `${finalEnergy} kWh Energy consumed / yr` });

    let wasteDiverted = 0;
    const type = (school.action_type || school.action_id || "").toLowerCase();
    if (type.includes("waste") || type.includes("compost") || type.includes("biogas") || type.includes("recycl")) {
        wasteDiverted = (school as any).actionQuantity || 0;
    } else {
        wasteDiverted = school.waste_diverted_kg || 0;
    }
    if (wasteDiverted > 0) {
        highlights.push({ icon: "♻️", text: `${wasteDiverted} kg Waste diverted from landfill` });
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="text-center space-y-4 mb-8">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#b0f0d6] text-[#003527] rounded-full text-xs font-black uppercase tracking-widest shadow-sm">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                        {school.status === "verified" ? "Verification Successful" : "School Registered Successfully"}
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">
                        {school.status === "verified" ? "School Action Verified" : "Verification Pending"}
                    </h1>
                    <p className="text-slate-500 font-bold max-w-lg mx-auto leading-relaxed">
                        {school.status === "verified" 
                            ? "Your school's action has been verified and your official certificate is ready below." 
                            : "Your school's action has been registered. Our team is now verifying the details. Your official certificate will be updated once verified."}
                    </p>
                </div>

                <ImpactCertificate
                    registryId={school.registryId}
                    clientDetails={{
                        name: school.schoolName || "School Name",
                        email: school.email,
                        contact: school.phone,
                        type: 'Education Institute / School',
                    }}
                    sector={sectorLabel}
                    location={`${school.city || 'City'}, ${school.pincode || ''}`}
                    reportingPeriod={`Year ${year}`}
                    verificationStatus={school.status || "pending"}
                    tco2e={school.tco2e_annual != null ? Math.abs(school.tco2e_annual).toFixed(2) : "N/A"}
                    atmanirbhar={school.atmanirbhar_pct != null ? school.atmanirbhar_pct.toFixed(0) : "N/A"}
                    circularity={school.circularity_pct != null ? school.circularity_pct.toFixed(1) : "N/A"}
                    highlights={highlights}
                    methodology="Climate Asset Verified Registry Protocol (School Module)"
                    emissionFactors="MoEF&CC Guidelines / Custom Registry Factors"
                    verifyUrl={verifyUrl}
                    summaryUrl={summaryUrl}
                    sha256Hash={school.sha256Hash}
                    qrCodeType="school"
                />

                {school.status === "verified" && (
                    <div className="mt-12 bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
                        <ShareButtons
                            shareText={`Check out ${school.schoolName}'s climate action on the Climate Asset Registry: ${verifyUrl}`}
                            verifyUrl={verifyUrl}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
