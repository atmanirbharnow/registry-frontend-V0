"use client";

import React from "react";
import { ACTION_LABELS } from "@/lib/constants";
import { calculateImpactPhase2 } from "@/lib/calculationEngine";
import { calculateSchoolImpact } from "@/lib/schoolCalculationEngine";

interface ImpactSummaryStepProps {
    isSchool?: boolean;
    formValues: Record<string, any>;
    userProfile?: any;
    agreed: boolean;
    onAgreeChange: (checked: boolean) => void;
}

export default function ImpactSummaryStep({
    isSchool = false,
    formValues,
    userProfile,
    agreed,
    onAgreeChange,
}: ImpactSummaryStepProps) {
    const heading = isSchool
        ? "School Action — Impact Summary"
        : "Individual Action — Impact Summary";

    const subheading = isSchool
        ? "Review your school's submitted data and understand the benefits of registering on the Earth Carbon Registry."
        : "Review your submitted data and understand the benefits of registering on the Earth Carbon Registry.";

    // Calculate Impact
    let impactData = { tCO2e: 0, atmanirbhar: 0, circularity: 0, carbonIntensity: 0, actionSavings: 0 };
    if (isSchool) {
        try {
            const res = calculateSchoolImpact({
                baselineEnergyGrid: Number(formValues.baselineEnergyGrid) || 0,
                baselineEnergyDiesel: Number(formValues.baselineEnergyDiesel) || 0,
                baselineEnergySolar: Number(formValues.baselineEnergySolar) || 0,
                baselineWaterMunicipal: Number(formValues.baselineWaterMunicipal) || 0,
                baselineWaterRain: Number(formValues.baselineWaterRain) || 0,
                baselineWaterWaste: Number(formValues.baselineWaterWaste) || 0,
                baselineWasteOrganic: Number(formValues.baselineWasteOrganic) || 0,
                baselineWasteInorganic: Number(formValues.baselineWasteInorganic) || 0,
                baselineWasteHazardous: Number(formValues.baselineWasteHazardous) || 0,
                waste_diverted_kg: Number(formValues.waste_diverted_kg) || 0,
                students_count: Number(formValues.students_count) || 1,
                actionType: formValues.action_type || "",
                actionQuantity: Number(formValues.actionQuantity || formValues.electricity_kWh_year) || 0,
            });
            impactData = { 
                tCO2e: res.tco2e_annual, 
                atmanirbhar: res.atmanirbhar_pct, 
                circularity: res.circularity_pct,
                carbonIntensity: res.carbon_intensity,
                actionSavings: res.tco2e_annual // Schools use reduction as main metric
            };
        } catch (e) {
            console.error(e);
        }
    } else {
        const res = calculateImpactPhase2({
            actionType: formValues.actionType || "",
            quantity: Number(formValues.quantity) || 0,
            unit: formValues.unit || "",
            // 9-field baseline
            baselineEnergyGrid: Number(formValues.baselineEnergyGrid) || 0,
            baselineEnergyDiesel: Number(formValues.baselineEnergyDiesel) || 0,
            baselineEnergySolar: Number(formValues.baselineEnergySolar) || 0,
            baselineWaterMunicipal: Number(formValues.baselineWaterMunicipal) || 0,
            baselineWaterRain: Number(formValues.baselineWaterRain) || 0,
            baselineWaterWaste: Number(formValues.baselineWaterWaste) || 0,
            baselineWasteOrganic: Number(formValues.baselineWasteOrganic) || 0,
            baselineWasteInorganic: Number(formValues.baselineWasteInorganic) || 0,
            baselineWasteHazardous: Number(formValues.baselineWasteHazardous) || 0,
            baselineWasteDiverted: Number(formValues.baselineWasteDiverted) || 0,
            beneficiariesCount: Number(formValues.beneficiariesCount) || 1,
        });
        impactData = { 
            tCO2e: res.tCO2e, 
            atmanirbhar: res.atmanirbharScore, 
            circularity: res.circularityScore,
            carbonIntensity: res.carbonIntensity,
            actionSavings: res.actionImpactTCO2e
        };
    }

    // If school has students but no baseline data, use sectoral averages
    if (isSchool && impactData.tCO2e === 0) {
        const students = Number(formValues.students_count) || 0;
        if (students > 0) {
            // Sectoral average fallback: 150 kWh/student/yr grid electricity
            const estimatedKwh = students * 150;
            const estimatedCO2eKg = estimatedKwh * 0.82;
            impactData = {
                ...impactData,
                tCO2e: Math.round(estimatedCO2eKg / 1000 * 100) / 100,
            };
        }
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="bg-[rgb(32,38,130)] text-white p-5 rounded-xl">
                <div className="flex items-center gap-3 mb-2">
                    <span className="p-2 bg-white/15 rounded-lg">
                        <SummaryIcon />
                    </span>
                    <h2 className="text-lg font-bold">{heading}</h2>
                </div>
                <p className="text-sm text-blue-200 leading-relaxed">{subheading}</p>
            </div>



            {/* Sections Grid - Stacked Vertically */}
            <div className="flex flex-col gap-6">
                {/* Personal Details */}
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                    <div className="px-5 py-3 bg-gray-50 border-b border-gray-200">
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Personal Details</h3>
                    </div>
                    <div className="p-5">
                        <PersonalDetailsGrid userProfile={userProfile} />
                    </div>
                </div>

                {/* Submitted Details */}
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                    <div className="px-5 py-3 bg-gray-50 border-b border-gray-200">
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                            {isSchool ? "School Details" : "Action Details"}
                        </h3>
                    </div>
                    <div className="p-5">
                        <UnifiedDetailsGrid isSchool={isSchool} values={formValues} userProfile={userProfile} />
                    </div>
                </div>
            </div>

            {/* What You Will Receive */}
            <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                <div className="px-5 py-3 bg-gray-50/50 border-b border-gray-100">
                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Benefits of Registration</h3>
                </div>
                <div className="p-4 sm:p-6">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                        <BenefitCard
                            icon={<CertificateIcon />}
                            title="Digital Certificate"
                            description="Tamper-proof certificate with unique QR code."
                            bgColor="bg-blue-50"
                            iconColor="text-blue-600"
                        />
                        <BenefitCard
                            icon={<CO2Icon />}
                            title="CO2e Carbon Reduction Score"
                            description="Calculated carbon reduction impact."
                            bgColor="bg-emerald-50"
                            iconColor="text-emerald-600"
                        />
                        <BenefitCard
                            icon={<AtmanirbharIcon />}
                            title="Atmanirbhar % Score"
                            description="Your Atmanirbhar (Self-Reliance) score."
                            bgColor="bg-cyan-50"
                            iconColor="text-cyan-600"
                        />
                        <BenefitCard
                            icon={<CircularityIcon />}
                            title="Circularity Score"
                            description="Percentage of waste diverted from landfill."
                            bgColor="bg-indigo-50"
                            iconColor="text-indigo-600"
                        />
                        <BenefitCard
                            icon={<SignatureIcon />}
                            title="Secure Signature"
                            description="Cryptographic hash for data integrity."
                            bgColor="bg-violet-50"
                            iconColor="text-violet-600"
                        />
                        <BenefitCard
                            icon={<ShareIcon />}
                            title="Social Share"
                            description="Easily share your verified climate action."
                            bgColor="bg-rose-50"
                            iconColor="text-rose-600"
                        />
                    </div>
                </div>
            </div>

            {/* Impact Message */}
            <div className="bg-blue-50/50 rounded-2xl p-5 border border-blue-100">
                <p className="text-sm text-blue-700 font-medium leading-relaxed">
                    By registering, you join a transparent record of climate-positive activities in India. 
                    Your {isSchool ? "school's" : "individual"} action helps build a national baseline for grassroots environmental impact, 
                    verified using standardized methodologies.
                </p>
            </div>

            {/* Agreement Checkbox */}
            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                <label className="flex items-start gap-4 cursor-pointer group">
                    <div className="mt-0.5 relative flex-shrink-0">
                        <input
                            type="checkbox"
                            checked={agreed}
                            onChange={(e) => onAgreeChange(e.target.checked)}
                            className="peer appearance-none w-6 h-6 border-2 border-gray-200 rounded-lg checked:border-[rgb(32,38,130)] checked:bg-[rgb(32,38,130)] transition-all cursor-pointer"
                        />
                        <svg className="absolute top-1 left-1 opacity-0 peer-checked:opacity-100 text-white w-4 h-4 pointer-events-none transition-opacity" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                    </div>
                    <span className="text-sm font-bold text-gray-500 group-hover:text-gray-800 transition-colors leading-relaxed">
                        I have reviewed all the details and agree to proceed with the registration and payment.
                    </span>
                </label>
            </div>
        </div>
    );
}

/* ===== Detail Grids ===== */

function PersonalDetailsGrid({ userProfile }: { userProfile: any }) {
    const rows: [string, string][] = [
        ["Contact Name", userProfile?.displayName || "—"],
        ["Email Address", userProfile?.email || "—"],
        ["Phone Number", userProfile?.phone || "—"],
        ["Sector", userProfile?.institutionType || "—"],
        ["State", userProfile?.state || "—"],
        ["Pincode", userProfile?.pincode || "—"],
        ["Contact Person", userProfile?.contactPerson || "—"],
    ];

    return <DetailTable rows={rows} />;
}

function UnifiedDetailsGrid({ isSchool, values, userProfile }: { isSchool: boolean; values: Record<string, any>; userProfile?: any }) {
    // Collect categories
    const categories = [];
    const hasEnergy = Number(values.baselineEnergyGrid || 0) + Number(values.baselineEnergyDiesel || 0) + Number(values.baselineEnergySolar || 0) > 0;
    const hasWater = Number(values.baselineWaterMunicipal || 0) + Number(values.baselineWaterRain || 0) + Number(values.baselineWaterWaste || 0) > 0;
    const hasWaste = Number(values.baselineWasteOrganic || 0) + Number(values.baselineWasteInorganic || 0) + Number(values.baselineWasteHazardous || 0) > 0;
    if (hasEnergy) categories.push("Energy");
    if (hasWater) categories.push("Water");
    if (hasWaste) categories.push("Waste");

    const reportingYear = values.reporting_year || values.reportingYear || "—";
    const beneficiaryLabel = isSchool ? "Students/Staff" : "Number of Beneficiaries";
    const beneficiaryValue = values.students_count || values.beneficiariesCount || "—";

    // Actions List
    const actionTypes = values.actionTypes || (values.action_type || values.actionType ? [values.action_type || values.actionType] : []);
    
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-4">
                <DetailRow label={isSchool ? "School / Org" : "Contact Person"} value={values.schoolName || values.actorName || userProfile?.displayName || "—"} />
                <DetailRow label="Location" value={values.address || userProfile?.address || "—"} />
                <DetailRow label={beneficiaryLabel} value={beneficiaryValue} />
                <DetailRow label="Reporting Duration" value={`Year ${reportingYear}`} />
                <DetailRow label="Baseline Categories Provided" value={categories.length > 0 ? categories.join(", ") : "No Baseline Data provided"} />
            </div>

            <div className="pt-4 border-t border-gray-100">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Actions Registered</span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {actionTypes.length > 0 ? (
                        actionTypes.map((type: string, idx: number) => {
                            const label = ACTION_LABELS[type] || type;
                            const details = values.actionDetails?.[type];
                            const date = details?.commissioningDate || values.commissioningDate || "—";
                            const quantity = details?.quantity || values.actionQuantity || values.quantity || "";
                            const unit = details?.unit || values.unit || "";
                            
                            return (
                                <div key={idx} className="flex flex-col p-3 bg-slate-50 rounded-xl border border-slate-100 transition-all hover:border-[rgb(32,38,130)]/30 group">
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="text-xs font-black text-slate-800 uppercase tracking-tight group-hover:text-[rgb(32,38,130)] transition-colors">
                                            {label}
                                        </span>
                                        {quantity && (
                                            <span className="text-[10px] font-bold text-[rgb(32,38,130)] bg-white px-2 py-0.5 rounded-full border border-slate-200">
                                                {quantity} {unit}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold italic">
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                                        Commissioned: {date}
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="text-xs text-gray-400 font-medium italic py-2">No actions registered</div>
                    )}
                </div>
            </div>
        </div>
    );
}

function DetailRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex flex-col py-1 border-b border-gray-50 last:border-0 sm:last:border-b">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">{label}</span>
            <span className="text-sm font-black text-gray-800 break-all sm:break-normal" title={value}>{value}</span>
        </div>
    );
}

function DetailTable({ rows }: { rows: [string, string][] }) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-4">
            {rows.map(([label, value], i) => (
                <div key={i} className="flex flex-col py-1 border-b border-gray-50 last:border-0 sm:last:border-b">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">{label}</span>
                    <span className="text-sm font-black text-gray-800 break-all sm:break-normal" title={value}>{value}</span>
                </div>
            ))}
        </div>
    );
}

function BenefitCard({ icon, title, description, bgColor, iconColor }: { icon: React.ReactNode; title: string; description: string; bgColor: string; iconColor: string }) {
    return (
        <div className={`flex flex-col gap-2 p-4 rounded-2xl ${bgColor} transition-transform hover:scale-[1.02] border border-white shadow-sm`}>
            <div className={`w-10 h-10 rounded-xl bg-white flex items-center justify-center ${iconColor} shadow-sm`}>
                {icon}
            </div>
            <div>
                <h4 className="text-xs font-black text-gray-800 mb-1 uppercase tracking-tight">{title}</h4>
                <p className="text-[10px] text-gray-500 font-bold leading-tight line-clamp-2">{description}</p>
            </div>
        </div>
    );
}

const SummaryIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
    </svg>
);

const CertificateIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M7 7h10" /><path d="M7 12h10" /><path d="M7 17h6" />
    </svg>
);

const CO2Icon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 12a5 5 0 0 0 5 5 8 8 0 0 1 5 2 8 8 0 0 1 5-2 5 5 0 0 0 5-5V7H2Z" /><path d="M6 11c1.5 0 3-0.5 3-2 0-1.5-1-2-2-2S5 7.5 5 9c0 1.5 1.5 2 3 2" />
    </svg>
);

const AtmanirbharIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
);

const CircularityIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" /><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10" /><path d="M20.49 15a9 9 0 0 1-14.85 3.36L1 14" />
    </svg>
);

const SignatureIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
);

const ShareIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
);
