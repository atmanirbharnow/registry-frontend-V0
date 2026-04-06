"use client";

import React, { useState, useEffect, useRef } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { SchoolFormData } from "@/types/school";
import {
    BASELINE_SOURCE_OPTIONS,
    REPORTING_YEAR_OPTIONS,
} from "@/lib/constants/schoolConstants";
import { ACTION_TYPES, PAYMENT_AMOUNT_PAISE, PAYMENT_AMOUNT_DISPLAY, ACTION_UNITS, ACTION_LABELS } from "@/lib/constants";
import { toast } from "react-toastify";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useRouter } from "next/navigation";
import Spinner from "@/components/ui/Spinner";
import { auth } from "@/lib/firebaseConfig";
import { usePincodeLookup } from "@/hooks/usePincodeLookup";
import SchoolAutocomplete from "./SchoolAutocomplete";
import { getProjects, getSchoolActions, checkDuplicateSchool, getUserSchoolsRealtime } from "@/lib/schoolFirestoreService";
import CustomDropdown from "./ui/CustomDropdown";
import MultiSelectDropdown from "./ui/MultiSelectDropdown";
import ImpactSummaryStep from "./ImpactSummaryStep";
import Card from "./ui/Card";
import PhotoUploadSection from "./forms/PhotoUploadSection";
import LocationPickerSection from "./forms/LocationPickerSection";
import UnifiedAddressSection from "./forms/UnifiedAddressSection";

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
        students_count: Yup.number().min(1, "Students count must be at least 1").required("Req"),
        baselineEnergyGrid: Yup.number().required("Req"),
        baselineEnergyDiesel: Yup.number().required("Req"),
        baselineEnergySolar: Yup.number().required("Req"),
        baselineWaterMunicipal: Yup.number().required("Req"),
        baselineWaterRain: Yup.number().required("Req"),
        baselineWaterWaste: Yup.number().required("Req"),
        baselineWasteOrganic: Yup.number().required("Req"),
        baselineWasteInorganic: Yup.number().required("Req"),
        baselineWasteHazardous: Yup.number().required("Req"),
        reporting_year: Yup.string().required("Req"),
    }),
    // Step 2: Low-Carbon Action
    Yup.object({
        schoolName: Yup.string().required("School name is required"),
        pincode: Yup.string().matches(/^[0-9]{6}$/, "Must be 6 digits").required("Required"),
        state: Yup.string().required("Required"),
        city: Yup.string().required("Required"),
        address: Yup.string().required("Address is required"),
        actionTypes: Yup.array().of(Yup.string()).min(1, "Please select at least one action type").required("Required"),
    }),
    // Step 3: Impact Summary
    Yup.object({
        summaryAgreed: Yup.boolean().oneOf([true], "Agreement required").required(),
    }),
    // Step 4: Finalization & Payment
    Yup.object({
        consent_confirmed: Yup.boolean().oneOf([true], "Consent required").required(),
    })
];

const DRAFT_KEY = "school_onboarding_draft";

export default function SchoolRegistrationForm() {
    const { profile } = useUserProfile();
    const router = useRouter();
    const [submitting, setSubmitting] = useState(false);
    const [isSimulationMode, setIsSimulationMode] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const [projects, setProjects] = useState<any[]>([]);
    const [actions, setActions] = useState<any[]>([]);
    const [registeredActionTypes, setRegisteredActionTypes] = useState<string[]>([]);
    const totalSteps = 4;

    useEffect(() => {
        // Load Razorpay Script
        const existing = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
        if (!existing) {
            const script = document.createElement("script");
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.async = true;
            document.body.appendChild(script);
        }

        // Load Projects
        getProjects().then(p => {
            setProjects(p);
            if (p.length > 0 && !formik.values.projectId) {
                formik.setFieldValue("projectId", p[0].id);
            }
        });

        // Load Draft
        const savedDraft = localStorage.getItem(DRAFT_KEY);
        if (savedDraft) {
            try {
                const parsed = JSON.parse(savedDraft);
                formik.setValues(parsed);
                if (parsed.currentStep) setCurrentStep(Math.min(parsed.currentStep, totalSteps));
            } catch (e) {
                console.error("Failed to load draft", e);
            }
        }
    }, []);

    // Check for existing user actions to disable from dropdown
    useEffect(() => {
        if (!auth.currentUser) return;
        const unsub = getUserSchoolsRealtime(auth.currentUser.uid, (schools) => {
            const types = schools.map((s: any) => s.action_id || s.actionType).filter(Boolean);
            setRegisteredActionTypes(types as string[]);
        });
        return () => unsub();
    }, []);

    // Sync profile data to formik (Safe merge - only if fields are empty)
    useEffect(() => {
        if (profile) {
            formik.setValues(prev => ({
                ...prev,
                schoolName: prev.schoolName || profile.displayName || "",
                address: prev.address || profile.address || "",
                city: prev.city || profile.city || "",
                pincode: prev.pincode || profile.pincode || "",
                place_id: prev.place_id || profile.place_id || "",
                lat: prev.lat || profile.lat || null,
                lng: prev.lng || profile.lng || null,
                contactPerson: prev.contactPerson || profile.contactPerson || "",
                phone: prev.phone || profile.phone || "",
                email: prev.email || profile.email || "",
            }));
        }
    }, [profile]);

    const formik = useFormik<SchoolFormData>({
        initialValues: {
            schoolName: "",
            address: "",
            city: "",
            state: "",
            pincode: "",
            place_id: "",
            contactPerson: "",
            phone: "",
            email: "",
            baselineEnergyGrid: "",
            baselineEnergyDiesel: "",
            baselineEnergySolar: "",
            baselineWaterMunicipal: "",
            baselineWaterRain: "",
            baselineWaterWaste: "",
            baselineWasteOrganic: "",
            baselineWasteInorganic: "",
            baselineWasteHazardous: "",
            students_count: "",
            reporting_year: "2025",
            baseline_source: "school_shared",

            actionTypes: [] as string[],
            actionDetails: {} as Record<string, any>,
            lat: null,
            lng: null,

            consent_confirmed: false,
            summaryAgreed: false,

            // Legacy/Unused
            projectId: "",
            action_id: "",
            fuel_type: "None",
            fuel_consumption_litres: "",
            renewable_energy_type: "None",
            renewable_energy_kwh: "",
            waste_generated_kg: "",
            water_consumption_m3: "",
            attribution_pct_energy: "100",
            attribution_pct_waste: "100",
            attribution_pct_water: "100",

            // Verification Photos
            energyBillCopy: "",
            meterPhoto: "",
            moreDetailsPhoto: "",
            siteOverviewPhoto: "",
        },
        validationSchema: validationSchema[currentStep - 1],
        onSubmit: async (values) => {
            // Final Step Submission
            setSubmitting(true);
            try {
                // Feature 2: Final Duplicate Check
                const dupCheck = await checkDuplicateSchool(values.place_id, values.schoolName, values.lat || 0, values.lng || 0, auth.currentUser?.uid, values.action_type);
                if (dupCheck.isDuplicate && dupCheck.type === 'BLOCK') {
                    toast.error(`This school is already registered as ${dupCheck.registryId}. View profile: /verify/${dupCheck.registryId}`, { autoClose: 10000 });
                    setSubmitting(false);
                    return;
                }

                const orderRes = await fetch("/api/school/payment/create", { method: "POST" });
                const orderData = await orderRes.json();
                if (orderData.error) throw new Error(orderData.error);

                if (orderData.simulated) {
                    setIsSimulationMode(true);
                    const finalValues = {
                        ...values,
                        contactPerson: profile?.contactPerson || "",
                        phone: profile?.phone || "",
                        email: profile?.email || auth.currentUser?.email || "",
                        sector: profile?.institutionType || "School",
                        state: profile?.state || null,
                        pincode: profile?.pincode || null,
                    };

                    await processPaymentVerification(
                        {
                            razorpay_order_id: orderData.orderId,
                            razorpay_payment_id: `pay_SIM_${Date.now()}`,
                            razorpay_signature: "SIMULATED_SIGNATURE",
                        },
                        finalValues
                    );
                    return;
                }

                const options = {
                    key: orderData.key,
                    amount: PAYMENT_AMOUNT_PAISE, // Rs. 199 in paise
                    currency: "INR",
                    name: "Climate Asset Registry",
                    description: "School Onboarding - Rs.1",
                    order_id: orderData.orderId,
                    handler: async (response: any) => {
                        // Pre-fill profile data before verification
                        const finalValues = {
                            ...values,
                            contactPerson: profile?.contactPerson || "",
                            phone: profile?.phone || "",
                            email: profile?.email || auth.currentUser?.email || "",
                            sector: profile?.institutionType || "School",
                            state: profile?.state || null,
                            pincode: profile?.pincode || null,
                        };
                        await processPaymentVerification(response, finalValues);
                    },
                    prefill: {
                        name: profile?.displayName || auth.currentUser?.displayName || values.schoolName,
                        email: profile?.email || auth.currentUser?.email || "",
                        contact: profile?.phone || "",
                    },
                    theme: { color: "#003527" },
                    modal: {
                        ondismiss: () => setSubmitting(false),
                    },
                };

                const razorpay = new window.Razorpay(options);
                razorpay.open();
            } catch (error: any) {
                console.error(error);
                toast.error(error.message || "Registration failed");
                setSubmitting(false);
            }
        },
    });

    // Auto-save draft
    useEffect(() => {
        localStorage.setItem(DRAFT_KEY, JSON.stringify({ ...formik.values, currentStep }));
    }, [formik.values, currentStep]);

    // Fetch actions when project changes
    useEffect(() => {
        if (formik.values.projectId) {
            getSchoolActions(formik.values.projectId).then(setActions);
        } else {
            setActions([]);
        }
    }, [formik.values.projectId]);

    const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        // Deprecated: replaced by PhotoUploadSection
    };

    const compressImage = (file: File): Promise<File> => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target?.result as string;
                img.onload = () => {
                    const canvas = document.createElement("canvas");
                    let width = img.width;
                    let height = img.height;
                    const max = 1200;
                    if (width > height && width > max) {
                        height *= max / width;
                        width = max;
                    } else if (height > max) {
                        width *= max / height;
                        height = max;
                    }
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext("2d");
                    ctx?.drawImage(img, 0, 0, width, height);
                    canvas.toBlob((blob) => {
                        resolve(new File([blob!], file.name, { type: "image/jpeg" }));
                    }, "image/jpeg", 0.8);
                };
            };
        });
    };

    const processPaymentVerification = async (paymentDetails: any, values: SchoolFormData) => {
        try {
            const formData = new FormData();
            Object.entries(values).forEach(([key, val]) => {
                if (key === 'photo_file' && val) {
                    formData.append(key, val);
                } else if (val !== null && val !== undefined) {
                    formData.append(key, typeof val === 'object' ? JSON.stringify(val) : String(val));
                }
            });

            formData.append("razorpay_order_id", paymentDetails.razorpay_order_id);
            formData.append("razorpay_payment_id", paymentDetails.razorpay_payment_id);
            formData.append("razorpay_signature", paymentDetails.razorpay_signature);
            formData.append("userIdToken", await auth.currentUser?.getIdToken() || "");
            formData.append("userId", auth.currentUser?.uid || "");

            // Ensure photo fields are sent
            ["energyBillCopy", "meterPhoto", "moreDetailsPhoto", "siteOverviewPhoto"].forEach(key => {
                const val = (values as any)[key];
                if (val) formData.set(key, val);
            });

            const verifyRes = await fetch("/api/school/payment/verify", {
                method: "POST",
                body: formData,
            });

            const verifyData = await verifyRes.json();
            if (verifyData.error) throw new Error(verifyData.error);

            toast.success("School registered successfully!");
            localStorage.removeItem(DRAFT_KEY);
            router.push("/school-register/success?id=" + verifyData.registryId);
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Verification failed");
        } finally {
            setSubmitting(false);
        }
    };

    const { state: pinState, city: pinCity, loading: pinLoading, error: pinError } = usePincodeLookup(formik.values.pincode);

    useEffect(() => {
        if (pinState && pinState !== formik.values.state) formik.setFieldValue("state", pinState);
        if (pinCity && pinCity !== formik.values.city) formik.setFieldValue("city", pinCity);
    }, [pinState, pinCity]);

    useEffect(() => {
        if (!formik.values.pincode || String(formik.values.pincode).trim().length !== 6) {
            if (formik.values.state) formik.setFieldValue("state", "");
            if (formik.values.city) formik.setFieldValue("city", "");
        }
    }, [formik.values.pincode]);

    // Reset action details when action types change
    useEffect(() => {
        if (formik.values.actionTypes.length === 0) {
            formik.setFieldValue("actionDetails", {});
        }
    }, [formik.values.actionTypes]);

    const handleNext = async () => {
        const errors = await formik.validateForm();
        if (Object.keys(errors).length === 0) {
            setCurrentStep(currentStep + 1);
        } else {
            if (currentStep === 2 && !formik.values.energyBillCopy && !formik.values.meterPhoto && !formik.values.moreDetailsPhoto && !formik.values.siteOverviewPhoto) {
                toast.error("Please upload at least one proof photo to proceed.", { position: "top-center" });
            }
            formik.setTouched(
                Object.keys(errors).reduce((acc, key) => ({ ...acc, [key]: true }), {})
            );
        }
    };

    const handlePrev = () => setCurrentStep(Math.max(1, currentStep - 1));

    const progress = (currentStep / totalSteps) * 100;

    return (
        <div className="max-w-6xl mx-auto pb-20 px-4">
            {/* Step Progress Bar */}
            <div className="mb-12">
                <div className="flex justify-between items-center mb-4 overflow-x-auto pb-2 scrollbar-none">
                    {[1, 2, 3, 4].map((step) => (
                        <div key={step} className="flex flex-col items-center flex-1 min-w-[90px] px-2 text-center">
                            <div className={`text-[9px] sm:text-[10px] font-bold mb-2 uppercase tracking-widest leading-tight h-4 flex flex-col justify-center ${currentStep >= step ? "text-[#003527]" : "text-gray-400"}`}>
                                {step === 1 && "Baseline Usage"}
                                {step === 2 && "Low-Carbon Action"}
                                {step === 3 && "Impact Summary"}
                                {step === 4 && "Payment"}
                            </div>
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center border-4 transition-all duration-300 shadow-sm ${currentStep === step ? "bg-[#003527] border-[#eff7f2] text-white scale-110" :
                                currentStep > step ? "bg-[#a8f928] border-green-100 text-white" :
                                    "bg-white border-gray-100 text-gray-300"
                                }`}>
                                {currentStep > step ? (
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                                ) : step}
                            </div>
                        </div>
                    ))}
                </div>
                <div className="h-3 w-full bg-gray-100 rounded-lg overflow-hidden p-1 shadow-inner">
                    <div
                        className="h-full bg-gradient-to-r from-[#003527] to-[#a8f928] rounded-lg transition-all duration-700 ease-out shadow-[0_0_15px_rgba(0,53,39,0.4)]"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); formik.handleSubmit(); }} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {isSimulationMode && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-5 py-3 flex items-center gap-2">
                        <span className="text-xl flex items-center justify-center">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-600">
                                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
                            </svg>
                        </span>
                        <span className="text-sm font-semibold text-[#112000]">
                            Payment Simulation Mode — No real charges
                        </span>
                    </div>
                )}
                {currentStep === 1 && (
                    <StepWrapper title="Baseline Usage (Monthly Average)" icon={<EnergyIcon />}>
                        <p className="text-[10px] text-[#003527] bg-[#eff7f2] p-3 rounded-lg font-medium border border-[#b0f0d6] mb-6">
                            Note: Baseline Usage represents your EXISTING usage BEFORE the new low-carbon action.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InputField label="Student/Staff Count" name="students_count" type="number" formik={formik} />
                            <DropdownField label="Reporting Year" name="reporting_year" options={REPORTING_YEAR_OPTIONS} formik={formik} />
                            <DropdownField label="Data Source" name="baseline_source" options={BASELINE_SOURCE_OPTIONS} formik={formik} />

                            <div className="md:col-span-2 mt-6">
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-[#003527] mb-4">
                                    Energy Usage (Yearly)
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-slate-50 rounded-lg border-2 border-slate-100">
                                    <InputField label="Electricity (kWh)" name="baselineEnergyGrid" type="number" formik={formik} />
                                    <InputField label="Diesel/Fuel (Liters)" name="baselineEnergyDiesel" type="number" formik={formik} />
                                    <InputField label="LPG(KG)" name="baselineEnergySolar" type="number" formik={formik} />
                                </div>
                            </div>

                            <div className="md:col-span-2 mt-4">
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-[#003527] mb-4">
                                    Water Usage (Yearly)
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-slate-50 rounded-lg border-2 border-slate-100">
                                    <InputField label="Municipal Intake (AMC) (Liters)" name="baselineWaterMunicipal" type="number" formik={formik} />
                                    <InputField label="Borewell (Liters)" name="baselineWaterRain" type="number" formik={formik} />
                                    <InputField label="Community Source (Liters)" name="baselineWaterWaste" type="number" formik={formik} />
                                </div>
                            </div>

                            <div className="md:col-span-2 mt-4">
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-[#003527] mb-4">
                                    Waste Generated (Yearly)
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-slate-50 rounded-lg border-2 border-slate-100">
                                    <InputField label="Organic Waste (kg)" name="baselineWasteOrganic" type="number" formik={formik} />
                                    <InputField label="Plastic(Kg)" name="baselineWasteInorganic" type="number" formik={formik} />
                                    <InputField label="Packaging and paper waste(Kg)" name="baselineWasteHazardous" type="number" formik={formik} />
                                </div>
                            </div>

                        </div>
                    </StepWrapper>
                )}

                {currentStep === 2 && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <StepWrapper title="Low-Carbon Action Details" icon={<RegistryIcon />}>
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-widest">
                                        Select Action Types
                                    </label>
                                    <MultiSelectDropdown
                                        options={ACTION_TYPES}
                                        selectedValues={formik.values.actionTypes}
                                        onChange={(vals) => formik.setFieldValue("actionTypes", vals)}
                                    />
                                    {formik.touched.actionTypes && formik.errors.actionTypes && typeof formik.errors.actionTypes === 'string' && (
                                        <p className="mt-1 text-xs text-red-500">{formik.errors.actionTypes}</p>
                                    )}
                                </div>

                                {formik.values.actionTypes && formik.values.actionTypes.map((type, index) => {
                                    const actionOpt = ACTION_TYPES.find(a => a.value === type);
                                    const label = actionOpt ? actionOpt.label : type;
                                    const defaultUnit = ACTION_UNITS[type] || "units";

                                    return (
                                        <div key={type} className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-4">
                                            <h4 className="font-semibold text-[#003527]">{index + 1}. {label}</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Installed Capacity / Quantity</label>
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
                                                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003527]/20 focus:border-[#003527] transition-all text-sm font-medium text-slate-900 placeholder-slate-400"
                                                            required
                                                        />
                                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-black uppercase tracking-widest text-[#003527]/50 pointer-events-none">
                                                            {defaultUnit}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Commissioning Date</label>
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
                                                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003527]/20 focus:border-[#003527] transition-all text-sm font-medium text-slate-900 placeholder-slate-400"
                                                        required
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}

                                <div>
                                    <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">
                                        School Search
                                    </label>
                                    <SchoolAutocomplete
                                        value={formik.values.schoolName}
                                        onPlaceSelect={(loc) => {
                                            formik.setFieldValue("schoolName", loc.schoolName);
                                            formik.setFieldValue("address", loc.address);
                                            formik.setFieldValue("city", loc.city);
                                            formik.setFieldValue("pincode", loc.pincode);
                                            formik.setFieldValue("lat", loc.lat);
                                            formik.setFieldValue("lng", loc.lng);
                                            formik.setFieldValue("place_id", loc.place_id);
                                        }}
                                        onManualEntry={(name) => formik.setFieldValue("schoolName", name)}
                                        error={formik.touched.schoolName ? formik.errors.schoolName : undefined}
                                    />
                                </div>

                                <div className="h-px bg-gray-100 my-4" />

                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-[10px] font-black uppercase tracking-widest text-[#003527]">
                                            Location Details
                                        </h3>
                                        {pinLoading && <Spinner className="w-4 h-4 text-[#003527]" />}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-slate-50 border-2 border-slate-100 rounded-lg">
                                        <div className="md:col-span-2">
                                            <InputField label="Pincode" name="pincode" type="text" formik={formik} placeholder="Enter 6-digit Pincode" maxLength={6} />
                                            {pinError && <p className="text-xs text-red-500 mt-1 font-bold px-1">{pinError}</p>}
                                        </div>
                                        <InputField label="State" name="state" type="text" formik={formik} placeholder="Auto-filled" disabled className="bg-slate-100/80 !border-slate-200" />
                                        <InputField label="City/District" name="city" type="text" formik={formik} placeholder="Auto-filled" disabled className="bg-slate-100/80 !border-slate-200" />
                                        <div className="md:col-span-2">
                                            <UnifiedAddressSection
                                                label="Full Address (Google Search / GPS Recommended)"
                                                isIndividual={false}
                                                value={formik.values.address}
                                                onChange={(val) => formik.setFieldValue("address", val)}
                                                onLocationSelect={(loc) => {
                                                    formik.setFieldValue("address", loc.address);
                                                    if (loc.lat) formik.setFieldValue("lat", loc.lat);
                                                    if (loc.lng) formik.setFieldValue("lng", loc.lng);
                                                }}
                                                error={formik.touched.address ? (formik.errors.address as string) : undefined}
                                                touched={formik.touched.address}
                                                placeholder="Street, landmark, or search school location..."
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </StepWrapper>

                        <PhotoUploadSection
                            userId={auth.currentUser?.uid || "anonymous"}
                            slots={formik.values.actionTypes.map(type => ({
                                key: type,
                                label: ACTION_LABELS[type] || type
                            }))}
                            photos={formik.values.actionTypes.reduce((acc, type) => ({
                                ...acc,
                                [type]: (formik.values as any)[type] || null
                            }), {})}
                            onPhotoChange={(key, url) => {
                                formik.setFieldValue(key, url);
                            }}
                        />
                    </div>
                )}

                {currentStep === 3 && (
                    <ImpactSummaryStep
                        isSchool={true}
                        formValues={formik.values}
                        userProfile={profile}
                        agreed={formik.values.summaryAgreed}
                        onAgreeChange={(checked) => formik.setFieldValue("summaryAgreed", checked)}
                    />
                )}

                {currentStep === 4 && (
                    <StepWrapper title="Finalization & Payment" icon={<RegistryIcon />}>
                        <div className="space-y-8">
                            <div className="bg-slate-50 p-6 rounded-lg border-2 border-slate-100 space-y-4">
                                <label className="flex items-start gap-4 cursor-pointer group">
                                    <div className="mt-1 relative">
                                        <input
                                            type="checkbox"
                                            name="consent_confirmed"
                                            checked={formik.values.consent_confirmed}
                                            onChange={formik.handleChange}
                                            className="peer appearance-none w-6 h-6 border-2 border-slate-300 rounded-lg checked:border-[#003527] checked:bg-[#003527] transition-all cursor-pointer"
                                        />
                                        <svg className="absolute top-1 left-1 opacity-0 peer-checked:opacity-100 text-white w-4 h-4 pointer-events-none transition-opacity" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                                    </div>
                                    <span className="text-sm font-bold text-slate-500 group-hover:text-slate-800 transition-colors leading-relaxed">
                                        I verify that the data provided above is correct. I authorize Climate Asset to process this information for registry verification.
                                    </span>
                                </label>
                            </div>

                            <div className="flex flex-col md:flex-row items-center justify-between gap-8 p-8 bg-gradient-to-br from-white to-[#eff7f2]/50 rounded-lg border-2 border-[#b0f0d6] shadow-xl">
                                <div>
                                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Registration Fee</p>
                                    <p className="text-4xl font-black text-[#003527]">₹1</p>
                                </div>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full md:w-auto px-12 py-5 bg-[#003527] text-white rounded-lg font-black shadow-2xl shadow-emerald-900/20 hover:scale-[1.02] transition-all active:scale-[0.98] disabled:opacity-50"
                                >
                                    {submitting ? "Processing..." : "Pay & Register School"}
                                </button>
                            </div>
                        </div>
                    </StepWrapper>
                )}

                {/* Navigation Buttons */}
                <div className="flex flex-col sm:flex-row items-center sm:justify-end gap-4 pt-8">
                    {currentStep > 1 && (
                        <button
                            type="button"
                            onClick={handlePrev}
                            className="w-full sm:w-40 px-6 py-3 rounded-lg bg-white border-2 border-gray-100 text-gray-500 font-bold text-sm hover:bg-gray-50 transition-all active:scale-[0.98]"
                        >
                            Back
                        </button>
                    )}

                    {currentStep < totalSteps && (
                        <button
                            type="button"
                            onClick={handleNext}
                            className="w-full sm:w-40 px-6 py-3 rounded-lg bg-[#003527] text-white font-bold text-sm shadow-xl shadow-emerald-900/20 hover:scale-[1.02] transition-all active:scale-[0.98]"
                        >
                            Next Step
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
}

function StepWrapper({ title, icon, children }: { title: string, icon: React.ReactNode, children: React.ReactNode }) {
    return (
        <div className="bg-white rounded-lg p-6 shadow-2xl shadow-gray-200 border border-gray-100 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-base font-black text-white bg-[#003527] -mx-6 -mt-6 p-5 rounded-lg flex items-center gap-3">
                <span className="p-2 bg-white/20 rounded-lg">{icon}</span>
                {title}
            </h2>
            <div className="px-2">{children}</div>
        </div>
    );
}

function InputField({ label, name, type = "text", formik, textarea = false, placeholder = "", icon, maxLength, suffix, className = "", ...props }: any) {
    const error = formik.touched[name] && formik.errors[name];
    const isDisabled = props.disabled;

    const baseInputStyles = `w-full px-3 py-2 bg-gray-50 rounded-lg border-2 transition-all outline-none font-semibold text-gray-900 text-sm ${error ? "border-red-500 bg-red-50" : "border-gray-200 focus:border-[#003527] focus:bg-white"
        } ${suffix ? "pr-12" : ""} ${isDisabled ? "disabled:opacity-100 disabled:text-gray-900 cursor-not-allowed" : ""}`;

    // Merge base styles with custom className if provided
    const mergedClassName = `${baseInputStyles} ${className}`.trim();

    return (
        <div className="space-y-2">
            <label className="flex items-center gap-2 text-[10px] font-bold text-gray-600 px-1 uppercase tracking-widest leading-none mb-1">
                {icon && <span className="opacity-50">{icon}</span>}
                {label}
            </label>
            <div className="relative">
                {textarea ? (
                    <textarea
                        name={name}
                        placeholder={placeholder}
                        maxLength={maxLength}
                        className={`${mergedClassName} min-h-[120px]`}
                        {...formik.getFieldProps(name)}
                        {...props}
                    />
                ) : (
                    <>
                        <input
                            type={type}
                            name={name}
                            placeholder={placeholder}
                            maxLength={maxLength}
                            className={mergedClassName}
                            {...formik.getFieldProps(name)}
                            {...props}
                        />
                        {suffix && (
                            <div className="absolute right-5 top-1/2 -translate-y-1/2 font-black text-gray-300 pointer-events-none text-xl">
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
        <div className="space-y-2">
            <label className="block text-[10px] font-bold text-gray-500 px-1 uppercase tracking-widest leading-none mb-1">{label}</label>
            <CustomDropdown
                options={options}
                value={formik.values[name]}
                onChange={(val) => formik.setFieldValue(name, val)}
                placeholder={placeholder}
                size="lg"
                className={error ? "border-red-500 rounded-lg" : "rounded-lg"}
            />
            {error && <p className="text-xs font-bold text-red-500 px-1">{error}</p>}
        </div>
    );
}

// Icons
const SchoolIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m22 10-10-5L2 10l10 5 10-5z" /><path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" /></svg>
);
const IdentityIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="7" r="4" /><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /></svg>
);
const EnergyIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>
);
const WasteIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></svg>
);
const RegistryIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>
);

