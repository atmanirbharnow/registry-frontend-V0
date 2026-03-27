"use client";

import React, { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import ActionTypeSelector from "./forms/ActionTypeSelector";
import ActorDetailsSection from "./forms/ActorDetailsSection";
import LocationPickerSection from "./forms/LocationPickerSection";
import PhotoUploadSection from "./forms/PhotoUploadSection";
import ImpactSummaryStep from "./ImpactSummaryStep";
import Input from "./ui/Input";
import Button from "./ui/Button";
import Card from "./ui/Card";
import CustomDropdown from "./ui/CustomDropdown";
import MultiSelectDropdown from "./ui/MultiSelectDropdown";
import { useAuth } from "@/context/AuthContext";
import { useUserProfile } from "@/hooks/useUserProfile";
import { PAYMENT_AMOUNT_DISPLAY, ACTION_UNITS } from "@/lib/constants";
import { getUserActions } from "@/lib/firestoreService";


declare global {
    interface Window {
        Razorpay: new (options: Record<string, unknown>) => {
            open: () => void;
            on: (event: string, handler: (response: Record<string, unknown>) => void) => void;
        };
    }
}

const validationSchema = [
    // Step 1: Baseline Usage
    Yup.object({
        baselineEnergyGrid: Yup.number().required("Required"),
        baselineEnergyDiesel: Yup.number().required("Required"),
        baselineEnergySolar: Yup.number().required("Required"),
        baselineWaterMunicipal: Yup.number().required("Required"),
        baselineWaterRain: Yup.number().required("Required"),
        baselineWaterWaste: Yup.number().required("Required"),
        baselineWasteOrganic: Yup.number().required("Required"),
        baselineWasteInorganic: Yup.number().required("Required"),
        baselineWasteHazardous: Yup.number().required("Required"),
    }),
    // Step 2: Low-Carbon Action
    Yup.object({
        actionTypes: Yup.array().of(Yup.string()).min(1, "Please select at least one action type").required("Required"),
        address: Yup.string().required("Location is required"),
        photo_file: Yup.mixed().required("At least 1 photo is required"),
    }),
    // Step 3: Impact Summary
    Yup.object({
        summaryAgreed: Yup.boolean().oneOf([true], "Agreement required").required(),
    }),
    // Step 4: Finalization & Payment
    Yup.object({
        consentGiven: Yup.boolean().oneOf([true], "Consent required").required(),
        disclaimerAccepted: Yup.boolean().oneOf([true], "Acceptance required").required(),
    })
];

export default function RegisterActionForm() {
    const { user } = useAuth();
    const { profile } = useUserProfile();
    const router = useRouter();
    const [submitting, setSubmitting] = useState(false);
    const [isSimulationMode, setIsSimulationMode] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const [registeredActionTypes, setRegisteredActionTypes] = useState<string[]>([]);
    const totalSteps = 4;

    useEffect(() => {
        const existing = document.querySelector(
            'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
        );
        if (!existing) {
            const script = document.createElement("script");
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.async = true;
            document.body.appendChild(script);
        }
    }, []);

    // Fetch existing actions to disable their dropdown options
    useEffect(() => {
        if (!user) return;
        const unsub = getUserActions(user.uid, (fetchedActions) => {
            const types = fetchedActions.map(a => a.actionType).filter(Boolean);
            setRegisteredActionTypes(types);
        });
        return () => unsub();
    }, [user]);

    // Sync profile data to formik (Safe merge)
    useEffect(() => {
        if (profile) {
            formik.setValues(prev => ({
                ...prev,
                address: prev.address || profile.address || "",
                lat: prev.lat || profile.lat || null,
                lng: prev.lng || profile.lng || null,
            }));
        }
    }, [profile]);

    const processPaymentVerification = async (
        paymentDetails: {
            razorpay_order_id: string;
            razorpay_payment_id: string;
            razorpay_signature: string;
        },
        values: typeof formik.values
    ) => {
        try {
            const idToken = await user?.getIdToken();

            const verifyRes = await fetch("/api/payment/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...paymentDetails,
                    userIdToken: idToken,
                    formData: {
                        ...values,
                        // Profile Data
                        sector: profile?.institutionType || null,
                        state: profile?.state || null,
                        pincode: profile?.pincode || null,
                        lat: profile?.lat || values.lat,
                        lng: profile?.lng || values.lng,
                        // Baseline Usage (New 9 Fields)
                        baselineEnergyGrid: Number(values.baselineEnergyGrid) || 0,
                        baselineEnergyDiesel: Number(values.baselineEnergyDiesel) || 0,
                        baselineEnergySolar: Number(values.baselineEnergySolar) || 0,
                        baselineWaterMunicipal: Number(values.baselineWaterMunicipal) || 0,
                        baselineWaterRain: Number(values.baselineWaterRain) || 0,
                        baselineWaterWaste: Number(values.baselineWaterWaste) || 0,
                        baselineWasteOrganic: Number(values.baselineWasteOrganic) || 0,
                        baselineWasteHazardous: Number(values.baselineWasteHazardous) || 0,
                        // Legacy/Compatibility (mapped for safety)
                        electricityUseKwh: Number(values.baselineEnergyGrid),
                        waterUsageKLD: Number(values.baselineWaterMunicipal),

                        // Action Specific
                        actionsData: JSON.stringify(
                            values.actionTypes.map(type => ({
                                actionType: type,
                                quantity: Number((values.actionDetails as any)[type]?.quantity) || 0,
                                unit: (values.actionDetails as any)[type]?.unit || "",
                                commissioningDate: (values.actionDetails as any)[type]?.commissioningDate || ""
                            }))
                        ),

                        // Photos
                        energyBillCopy: values.energyBillCopy,
                        meterPhoto: values.meterPhoto,
                        moreDetailsPhoto: values.moreDetailsPhoto,
                        siteOverviewPhoto: values.siteOverviewPhoto,
                        userId: user?.uid,
                        userEmail: user?.email,
                        // Pull actor info from profile
                        actorType: profile?.institutionType === "Individual" ? "Individual" : "Organization",
                        actorName: profile?.displayName || user?.displayName || "",
                        contactPerson: profile?.contactPerson || "",
                        phone: profile?.phone || "",
                        email: profile?.email || user?.email || "",
                    },
                }),
            });

            if (!verifyRes.ok) {
                const errData = await verifyRes.json();
                throw new Error(errData.error || "Payment verification failed");
            }

            const result = await verifyRes.json();
            toast.success("Action registered successfully!");
            router.push(`/register/success?id=${result.registryId}`);
        } catch (err) {
            const message = err instanceof Error ? err.message : "Payment verification failed";
            toast.error(message);
            setSubmitting(false);
        }
    };

    const formik = useFormik({
        initialValues: {
            // Organisation Details
            entityType: "",
            sector: "",
            reportingYear: "2026",
            beneficiariesCount: "",

            // Baseline Usage (Monthly)
            baselineEnergyGrid: "",
            baselineEnergyDiesel: "",
            baselineEnergySolar: "",
            baselineWaterMunicipal: "",
            baselineWaterRain: "",
            baselineWaterWaste: "",
            baselineWasteOrganic: "",
            baselineWasteInorganic: "",
            baselineWasteHazardous: "",

            // Low-Carbon Action
            actionTypes: [] as string[],
            actionDetails: {} as Record<string, { quantity: string, unit: string, commissioningDate: string }>,
            address: "",
            lat: null as number | null,
            lng: null as number | null,
            commissioningDate: "",
            photo_file: null as File | null,

            consentGiven: false,
            disclaimerAccepted: false,
            summaryAgreed: false,

            // Photos
            energyBillCopy: null as string | null,
            meterPhoto: null as string | null,
            moreDetailsPhoto: null as string | null,
            siteOverviewPhoto: null as string | null,
        },
        validationSchema: validationSchema[currentStep - 1],
        onSubmit: async (values) => {
            if (!user) {
                toast.error("You must be signed in.");
                return;
            }

            setSubmitting(true);

            try {
                const orderRes = await fetch("/api/payment/create", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                });

                if (!orderRes.ok) {
                    throw new Error("Failed to create payment order");
                }

                const orderData = await orderRes.json();

                if (orderData.simulated) {
                    setIsSimulationMode(true);
                    await processPaymentVerification(
                        {
                            razorpay_order_id: orderData.orderId,
                            razorpay_payment_id: `pay_SIM_${Date.now()}`,
                            razorpay_signature: "SIMULATED_SIGNATURE",
                        },
                        values
                    );
                    return;
                }

                const options = {
                    key: orderData.key,
                    amount: orderData.amount,
                    currency: orderData.currency,
                    name: "Earth Carbon Registry",
                    description: "Action Registration Fee",
                    order_id: orderData.orderId,
                    handler: async (response: {
                        razorpay_order_id: string;
                        razorpay_payment_id: string;
                        razorpay_signature: string;
                    }) => {
                        await processPaymentVerification(response, values);
                    },
                    prefill: {
                        name: profile?.displayName || user?.displayName || "",
                        email: profile?.email || user?.email || "",
                        contact: profile?.phone || "",
                    },
                    theme: { color: "rgb(32,38,130)" },
                    modal: {
                        ondismiss: () => {
                            setSubmitting(false);
                        },
                        escape: false,
                        animation: true,
                    },
                };

                const razorpay = new window.Razorpay(options);
                razorpay.on("payment.failed", (resp: Record<string, unknown>) => {
                    const err = resp?.error as Record<string, unknown> | undefined;
                    toast.error(
                        `Payment failed: ${err?.description || err?.reason || "Unknown error"}`
                    );
                    setSubmitting(false);
                });

                razorpay.open();
            } catch (err) {
                const message = err instanceof Error ? err.message : "Failed to initiate payment";
                toast.error(message);
                setSubmitting(false);
            }
        },
    });

    const handleNext = async () => {
        const errors = await formik.validateForm();
        const stepFields: Record<number, string[]> = {
            1: [
                "baselineEnergyGrid", "baselineEnergyDiesel", "baselineEnergySolar",
                "baselineWaterMunicipal", "baselineWaterRain", "baselineWaterWaste",
                "baselineWasteOrganic", "baselineWasteInorganic", "baselineWasteHazardous",
                "entityType", "sector", "reportingYear", "beneficiariesCount"
            ],
            2: ["actionTypes", "address", "photo_file"],
            3: ["summaryAgreed"],
            4: ["consentGiven", "disclaimerAccepted"]
        };

        const currentStepFields = stepFields[currentStep as keyof typeof stepFields] || [];
        const hasStepErrors = currentStepFields.some(field => errors[field as keyof typeof errors]);

        if (!hasStepErrors) {
            setCurrentStep(s => Math.min(s + 1, totalSteps));
        } else {
            const touched = currentStepFields.reduce((acc, field) => ({ ...acc, [field]: true }), {});
            formik.setTouched({ ...formik.touched, ...touched });
            toast.warning("Please fill required fields to proceed");
        }
    };

    const handlePrev = () => setCurrentStep(s => Math.max(s - 1, 1));

    const handlePlaceSelect = (location: { address: string; lat?: number; lng?: number }) => {
        formik.setFieldValue("address", location.address);
        if (location.lat && location.lng) {
            formik.setFieldValue("lat", location.lat);
            formik.setFieldValue("lng", location.lng);
        }
    };

    const progress = (currentStep / totalSteps) * 100;

    return (
        <div className="space-y-8">
            {/* Progress Bar */}
            <div className="mb-12">
                <div className="flex justify-between items-center mb-4 overflow-x-auto pb-2 scrollbar-none">
                    {[1, 2, 3, 4].map((step) => (
                        <div key={step} className="flex flex-col items-center flex-1 min-w-[100px] px-2 text-center">
                            <div className={`text-[10px] font-black mb-2 uppercase tracking-widest leading-tight h-4 flex flex-col justify-center ${currentStep >= step ? "text-[rgb(32,38,130)]" : "text-gray-300"}`}>
                                {step === 1 && "Baseline Usage"}
                                {step === 2 && "Low-Carbon Action"}
                                {step === 3 && "Impact Summary"}
                                {step === 4 && "Payment"}
                            </div>
                            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border-4 transition-all duration-300 shadow-sm ${currentStep === step ? "bg-[rgb(32,38,130)] border-blue-100 text-white scale-110" :
                                currentStep > step ? "bg-green-500 border-green-100 text-white" :
                                    "bg-white border-gray-50 text-gray-200"
                                }`}>
                                {currentStep > step ? (
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                                ) : step}
                            </div>
                        </div>
                    ))}
                </div>
                <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden p-1 shadow-inner">
                    <div
                        className="h-full bg-gradient-to-r from-[rgb(32,38,130)] to-blue-500 rounded-full transition-all duration-700 ease-out shadow-[0_0_15px_rgba(32,38,130,0.4)]"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            <form onSubmit={formik.handleSubmit} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {isSimulationMode && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-5 py-3 flex items-center gap-2">
                        <span className="text-xl flex items-center justify-center">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-600">
                                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
                            </svg>
                        </span>
                        <span className="text-sm font-semibold text-yellow-700">
                            Payment Simulation Mode — No real charges
                        </span>
                    </div>
                )}

                {currentStep === 1 && (
                    <StepWrapper title="Step 1: Baseline Usage" icon={<EnergyIcon />}>
                        <div className="space-y-6">
                            <p className="text-xs text-blue-600 bg-blue-50 p-3 rounded-xl font-medium border border-blue-100">
                                Note: Baseline Usage represents your EXISTING usage BEFORE the new low-carbon action.
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <InputField label="Number of Beneficiaries" name="beneficiariesCount" type="number" formik={formik} placeholder="e.g. 1 for self, 4 for family" />
                                <DropdownField label="Reporting Year" name="reportingYear" options={[{ value: "2024", label: "2024" }, { value: "2025", label: "2025" }, { value: "2026", label: "2026" }, { value: "2027", label: "2027" }, { value: "2028", label: "2028" }]} formik={formik} />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <h3 className="text-sm font-black uppercase tracking-widest text-[#202682] mb-4">
                                        Energy Usage (Monthly)
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-slate-50 rounded-[2rem] border-2 border-slate-100">
                                        <InputField label="Electricity (kWh)" name="baselineEnergyGrid" type="number" formik={formik} />
                                        <InputField label="Fuel (Liters)" name="baselineEnergyDiesel" type="number" formik={formik} />
                                        <InputField label="LPG(KG)" name="baselineEnergySolar" type="number" formik={formik} />
                                    </div>
                                </div>

                                <div className="md:col-span-2 mt-4">
                                    <h3 className="text-sm font-black uppercase tracking-widest text-[#202682] mb-4">
                                        Water Usage (Monthly)
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-slate-50 rounded-[2rem] border-2 border-slate-100">
                                        <InputField label="Municipal (AMC) (L)" name="baselineWaterMunicipal" type="number" formik={formik} />
                                        <InputField label="Borewell (L)" name="baselineWaterRain" type="number" formik={formik} />
                                        <InputField label="Community Source (L)" name="baselineWaterWaste" type="number" formik={formik} />
                                    </div>
                                </div>

                                <div className="md:col-span-2 mt-4">
                                    <h3 className="text-sm font-black uppercase tracking-widest text-[#202682] mb-4">
                                        Waste Generated (Monthly)
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-slate-50 rounded-[2rem] border-2 border-slate-100">
                                        <InputField label="Organic (kg)" name="baselineWasteOrganic" type="number" formik={formik} />
                                        <InputField label="Plastic(Kg)" name="baselineWasteInorganic" type="number" formik={formik} />
                                        <InputField label="Packaging and paper waste(Kg)" name="baselineWasteHazardous" type="number" formik={formik} />
                                    </div>
                                </div>

                            </div>
                        </div>
                    </StepWrapper>
                )}

                {currentStep === 2 && (
                    <StepWrapper title="Phase 2: Low-Carbon Action Details" icon={<ActionIcon />}>
                        <div className="space-y-8">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Action Types
                                </label>
                                <MultiSelectDropdown
                                    options={ACTION_TYPE_OPTIONS}
                                    selectedValues={formik.values.actionTypes}
                                    onChange={(vals) => formik.setFieldValue("actionTypes", vals)}
                                />
                                {formik.touched.actionTypes && formik.errors.actionTypes && typeof formik.errors.actionTypes === 'string' && (
                                    <p className="mt-1 text-sm text-red-500">{formik.errors.actionTypes}</p>
                                )}
                            </div>

                            {formik.values.actionTypes && formik.values.actionTypes.map((type, index) => {
                                const actionOpt = ACTION_TYPE_OPTIONS.find(a => a.value === type);
                                const label = actionOpt ? actionOpt.label : type;
                                const defaultUnit = ACTION_UNITS[type] || "units";

                                return (
                                    <div key={type} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
                                        <h4 className="font-semibold text-[rgb(32,38,130)]">{index + 1}. {label}</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">Quantity / Capacity</label>
                                                <div className="relative">
                                                    <input
                                                        type="number"
                                                        value={formik.values.actionDetails?.[type]?.quantity || ""}
                                                        onChange={(e) => {
                                                            const current = formik.values.actionDetails || {};
                                                            formik.setFieldValue("actionDetails", {
                                                                ...current,
                                                                [type]: { ...(current[type] || {}), quantity: e.target.value, unit: defaultUnit }
                                                            });
                                                        }}
                                                        className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[rgb(32,38,130)]/20 focus:border-[rgb(32,38,130)] transition-all text-sm font-medium text-slate-900 placeholder-slate-400"
                                                        required
                                                    />
                                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-black uppercase tracking-widest text-[#202682]/50 pointer-events-none">
                                                        {defaultUnit}
                                                    </span>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">Installation / Commissioning Date</label>
                                                <input
                                                    type="date"
                                                    value={formik.values.actionDetails?.[type]?.commissioningDate || ""}
                                                    onChange={(e) => {
                                                        const current = formik.values.actionDetails || {};
                                                        formik.setFieldValue("actionDetails", {
                                                            ...current,
                                                            [type]: { ...(current[type] || {}), commissioningDate: e.target.value, unit: defaultUnit }
                                                        });
                                                    }}
                                                    className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[rgb(32,38,130)]/20 focus:border-[rgb(32,38,130)] transition-all text-sm font-medium text-slate-900 placeholder-slate-400"
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}

                            <LocationPickerSection
                                address={formik.values.address}
                                lat={formik.values.lat || undefined}
                                lng={formik.values.lng || undefined}
                                onPlaceSelect={handlePlaceSelect}
                                onAddressChange={(val) => formik.setFieldValue("address", val)}
                                onCoordsChange={(lat, lng) => {
                                    formik.setFieldValue("lat", lat);
                                    formik.setFieldValue("lng", lng);
                                }}
                                error={formik.touched.address ? (formik.errors.address as string) : undefined}
                            />

                            {profile?.address && formik.values.address !== profile.address && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        formik.setFieldValue("address", profile.address);
                                        formik.setFieldValue("lat", profile.lat || null);
                                        formik.setFieldValue("lng", profile.lng || null);
                                    }}
                                    className="mt-2 text-xs font-bold text-[rgb(32,38,130)] hover:underline flex items-center gap-1"
                                >
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" /><path d="M3 21v-5h5" /></svg>
                                    Reset to Profile Address
                                </button>
                            )}

                            <div className="pt-6 border-t border-gray-100">
                                <h3 className="text-sm font-black uppercase tracking-widest text-[#202682] mb-6">
                                    Verification Photos (System Photos)
                                </h3>
                                <PhotoUploadSection
                                    slots={[
                                        {
                                            key: "energyBillCopy",
                                            label: "Energy Bill Copy"
                                        },
                                        { key: "meterPhoto", label: "Meter Photo" },
                                        { key: "moreDetailsPhoto", label: "More Details Photo" },
                                        { key: "siteOverviewPhoto", label: "Site Overview of System" },
                                    ]}
                                    photos={{
                                        energyBillCopy: formik.values.energyBillCopy,
                                        meterPhoto: formik.values.meterPhoto,
                                        moreDetailsPhoto: formik.values.moreDetailsPhoto,
                                        siteOverviewPhoto: formik.values.siteOverviewPhoto,
                                    }}
                                    userId={user?.uid || ""}
                                    onPhotoChange={(key, url) => {
                                        formik.setFieldValue(key, url);
                                        // Set photo_file flag if ANY photo is present
                                        const hasAny = url || formik.values.energyBillCopy || formik.values.meterPhoto || formik.values.moreDetailsPhoto || formik.values.siteOverviewPhoto;
                                        formik.setFieldValue("photo_file", hasAny ? "uploaded" : null);
                                    }}
                                />
                            </div>
                        </div>
                    </StepWrapper>
                )}

                {currentStep === 3 && (
                    <ImpactSummaryStep
                        isSchool={formik.values.entityType === "School"}
                        formValues={formik.values}
                        userProfile={profile}
                        agreed={formik.values.summaryAgreed}
                        onAgreeChange={(checked) => formik.setFieldValue("summaryAgreed", checked)}
                    />
                )}

                {currentStep === 4 && (
                    <StepWrapper title="Phase 4: Payment & Completion" icon={<RegistryIcon />}>
                        <div className="space-y-8 text-center sm:text-left">
                            <div className="bg-slate-50 p-6 rounded-[2rem] border border-gray-100 space-y-4">
                                <label className="flex items-start gap-4 cursor-pointer group">
                                    <div className="mt-1 relative">
                                        <input
                                            type="checkbox"
                                            name="consentGiven"
                                            checked={formik.values.consentGiven}
                                            onChange={formik.handleChange}
                                            className="peer appearance-none w-6 h-6 border-2 border-gray-300 rounded-lg checked:border-[rgb(32,38,130)] checked:bg-[rgb(32,38,130)] transition-all cursor-pointer"
                                        />
                                        <svg className="absolute top-1 left-1 opacity-0 peer-checked:opacity-100 text-white w-4 h-4 pointer-events-none transition-opacity" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                                    </div>
                                    <span className="text-sm font-bold text-gray-500 group-hover:text-gray-800 transition-colors leading-relaxed">
                                        I verify that the data provided above is correct to the best of my knowledge.
                                    </span>
                                </label>

                                <label className="flex items-start gap-4 cursor-pointer group">
                                    <div className="mt-1 relative">
                                        <input
                                            type="checkbox"
                                            name="disclaimerAccepted"
                                            checked={formik.values.disclaimerAccepted}
                                            onChange={formik.handleChange}
                                            className="peer appearance-none w-6 h-6 border-2 border-gray-300 rounded-lg checked:border-[rgb(32,38,130)] checked:bg-[rgb(32,38,130)] transition-all cursor-pointer"
                                        />
                                        <svg className="absolute top-1 left-1 opacity-0 peer-checked:opacity-100 text-white w-4 h-4 pointer-events-none transition-opacity" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                                    </div>
                                    <span className="text-sm font-bold text-gray-500 group-hover:text-gray-800 transition-colors leading-relaxed">
                                        I accept that impact metrics are estimates based on standard methodologies.
                                    </span>
                                </label>
                            </div>

                            <div className="flex flex-col sm:flex-row items-center justify-between gap-8 p-6 bg-gradient-to-br from-white to-blue-50/30 rounded-3xl border border-gray-100 shadow-xl">
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Registration Fee</p>
                                    <p className="text-4xl font-black text-[#202682]">{PAYMENT_AMOUNT_DISPLAY}</p>
                                </div>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full sm:w-auto px-12 py-5 bg-[rgb(32,38,130)] text-white rounded-2xl font-black shadow-2xl shadow-blue-900/30 hover:scale-[1.02] transition-all active:scale-[0.98] disabled:opacity-50"
                                >
                                    {submitting ? "Processing..." : "Pay & Complete"}
                                </button>
                            </div>
                        </div>
                    </StepWrapper>
                )}

                {/* Navigation */}
                <div className="flex flex-col sm:flex-row sm:justify-end gap-4 pt-6">
                    {currentStep > 1 && (
                        <button
                            type="button"
                            onClick={handlePrev}
                            className="w-full sm:w-40 py-3 px-6 rounded-xl bg-white border-2 border-gray-100 text-gray-500 font-bold text-sm hover:bg-gray-50 transition-all active:scale-95"
                        >
                            Back
                        </button>
                    )}

                    {currentStep < totalSteps && (
                        <button
                            type="button"
                            onClick={handleNext}
                            className="w-full sm:w-40 py-3 px-6 rounded-xl bg-[rgb(32,38,130)] text-white font-bold text-sm shadow-lg shadow-blue-900/10 hover:shadow-blue-900/20 hover:-translate-y-0.5 transition-all active:scale-95"
                        >
                            Next Step
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
}

const getAvailableActionTypes = () => [
    { value: 'solar_rooftop', label: 'Solar Rooftop (PV)', unit: 'kW' },
    { value: 'solar_water_heater', label: 'Solar Water Heater', unit: 'Liters' },
    { value: 'borewell_water', label: 'Borewell Water Pumping', unit: 'HP' },
    { value: 'rainwater_harvesting', label: 'Rainwater Harvesting', unit: 'KL' },
    { value: 'biogas', label: 'Biogas Plant', unit: 'm3' },
    { value: 'composting', label: 'Waste Composting', unit: 'kg/day' },
    { value: 'plastic_recycling', label: 'Plastic Recycling', unit: 'kg' },
    { value: 'paper_recycling', label: 'Paper Recycling', unit: 'kg' },
    { value: 'textile_recycling', label: 'Textile Recycling', unit: 'kg' },
    { value: 'metal_recycling', label: 'Metal Recycling', unit: 'kg' },
    { value: 'turn_off_bulb', label: 'Lighting Efficiency', unit: 'points' },
    { value: 'turn_off_fan', label: 'Fan Efficiency', unit: 'points' },
];

const ACTION_TYPE_OPTIONS = [
    { value: 'solar_rooftop', label: 'Solar Rooftop (PV)' },
    { value: 'solar_water_heater', label: 'Solar Water Heater' },
    { value: 'borewell_water', label: 'Borewell Water Pumping' },
    { value: 'rainwater_harvesting', label: 'Rainwater Harvesting' },
    { value: 'biogas', label: 'Biogas Plant' },
    { value: 'composting', label: 'Waste Composting' },
    { value: 'plastic_recycling', label: 'Plastic Recycling' },
    { value: 'paper_recycling', label: 'Paper Recycling' },
    { value: 'textile_recycling', label: 'Textile Recycling' },
    { value: 'metal_recycling', label: 'Metal Recycling' },
    { value: 'turn_off_bulb', label: 'Lighting Efficiency' },
    { value: 'turn_off_fan', label: 'Fan Efficiency' },
];

const ACTION_PHOTO_LABELS: Record<string, string> = {
    solar_rooftop: "Solar Panel & Inverter Photo",
    solar_water_heater: "Solar Tank & Collector Photo",
    borewell_water: "Pump & Meter Photo",
    rainwater_harvesting: "Storage Tank & Filter Photo",
    biogas: "Digester & Stove Photo",
    composting: "Compost Bin Photo",
    plastic_recycling: "Recycled Plastic Batch Photo",
    paper_recycling: "Paper Collection Point Photo",
    textile_recycling: "Textile Waste Storage Photo",
    metal_recycling: "Metal Scrap Storage Photo",
    turn_off_bulb: "LED Installation Photo",
    turn_off_fan: "Efficient Fan Photo",
};

function StepWrapper({ title, icon, children }: { title: string, icon: React.ReactNode, children: React.ReactNode }) {
    return (
        <div className="bg-white rounded-3xl p-6 shadow-2xl shadow-gray-200 border border-gray-100 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-lg font-black text-white bg-[rgb(32,38,130)] -mx-6 -mt-6 p-5 rounded-t-3xl flex items-center gap-3 text-left">
                <span className="p-2 bg-white/20 rounded-lg">{icon}</span>
                {title}
            </h2>
            <div className="px-2 text-left">{children}</div>
        </div>
    );
}

function InputField({ label, name, type = "text", formik, textarea = false, placeholder = "", icon, maxLength, suffix, ...props }: any) {
    const error = formik.touched[name] && formik.errors[name];
    return (
        <div className="space-y-2 text-left">
            <label className="flex items-center gap-2 text-sm font-bold text-gray-400 px-1 uppercase tracking-widest">
                {icon && <span className="opacity-50">{icon}</span>}
                {label}
            </label>
            <div className="relative">
                {textarea ? (
                    <textarea
                        name={name}
                        placeholder={placeholder}
                        maxLength={maxLength}
                        className={`w-full px-4 py-3 bg-gray-50 rounded-xl border-2 transition-all outline-none font-bold text-gray-900 min-h-[120px] text-base ${error ? "border-red-500 bg-red-50" : "border-gray-100 focus:border-[rgb(32,38,130)] focus:bg-white"
                            }`}
                        {...formik.getFieldProps(name)}
                    />
                ) : (
                    <>
                        <input
                            type={type}
                            name={name}
                            placeholder={placeholder}
                            maxLength={maxLength}
                            className={`w-full px-4 py-3 bg-gray-50 rounded-xl border-2 transition-all outline-none font-bold text-gray-900 text-base ${error ? "border-red-500 bg-red-50" : "border-gray-100 focus:border-[rgb(32,38,130)] focus:bg-white"
                                } ${suffix ? "pr-12" : ""}`}
                            {...formik.getFieldProps(name)}
                            {...props}
                        />
                        {suffix && (
                            <div className="absolute right-5 top-1/2 -translate-y-1/2 font-black text-gray-300 pointer-events-none text-xs uppercase">
                                {suffix}
                            </div>
                        )}
                    </>
                )}
            </div>
            {error && <p className="text-xs font-bold text-red-500 px-1">{error}</p>}
        </div>
    );
}

function DropdownField({ label, name, options, formik, placeholder = "Select option" }: any) {
    const error = formik.touched[name] && formik.errors[name];
    return (
        <div className="space-y-2 text-left">
            <label className="block text-xs font-black text-gray-400 px-1 uppercase tracking-widest leading-none mb-1">{label}</label>
            <CustomDropdown
                options={options}
                value={formik.values[name]}
                onChange={(val) => {
                    formik.setFieldValue(name, val);
                    // Auto-set unit based on action type
                    const selected = getAvailableActionTypes().find(a => a.value === val);
                    if (selected) formik.setFieldValue("unit", selected.unit);
                }}
                placeholder={placeholder}
                size="lg"
                className={error ? "border-red-500 rounded-xl" : "rounded-xl border-gray-100"}
            />
            {error && <p className="text-xs font-bold text-red-500 px-1">{error}</p>}
        </div>
    );
}

const ActionIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>
);
const EnergyIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5" /><path d="M12 1v2" /><path d="M12 21v2" /><path d="M4.22 4.22l1.42 1.42" /><path d="M18.36 18.36l1.42 1.42" /><path d="M1 12h2" /><path d="M21 12h2" /><path d="M4.22 19.78l1.42-1.42" /><path d="M18.36 5.64l1.42-1.42" /></svg>
);
const RegistryIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>
);
