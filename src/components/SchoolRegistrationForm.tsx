"use client";

import React, { useState, useEffect, useRef } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { SchoolFormData } from "@/types/school";
import {
    BASELINE_SOURCE_OPTIONS,
    REPORTING_YEAR_OPTIONS,
} from "@/lib/constants/schoolConstants";
import { ACTION_TYPES, ACTION_PHOTO_LABELS } from "@/lib/constants";
import { toast } from "react-toastify";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useRouter } from "next/navigation";
import Spinner from "@/components/ui/Spinner";
import { auth } from "@/lib/firebaseConfig";
import SchoolAutocomplete from "./SchoolAutocomplete";
import { getProjects, getSchoolActions, checkDuplicateSchool } from "@/lib/schoolFirestoreService";
import CustomDropdown from "./ui/CustomDropdown";
import ImpactSummaryStep from "./ImpactSummaryStep";
import Card from "./ui/Card";
import PhotoUploadSection from "./forms/PhotoUploadSection";

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
        action_type: Yup.string().required("Please select an action type"),
        actionQuantity: Yup.number().required("Quantity is required"), // Standardized name
        installation_date: Yup.date().required("Required"),
        address: Yup.string().required("Location is required"),
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
    const [currentStep, setCurrentStep] = useState(1);
    const [projects, setProjects] = useState<any[]>([]);
    const [actions, setActions] = useState<any[]>([]);
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

    // Sync profile data to formik
    useEffect(() => {
        if (profile) {
            formik.setValues(prev => ({
                ...prev,
                schoolName: profile.displayName || prev.schoolName,
                address: profile.address || prev.address,
                city: profile.city || prev.city,
                pincode: profile.pincode || prev.pincode,
                place_id: profile.place_id || prev.place_id,
                lat: profile.lat || prev.lat,
                lng: profile.lng || prev.lng,
                contactPerson: profile.contactPerson || prev.contactPerson,
                phone: profile.phone || prev.phone,
                email: profile.email || prev.email,
            }));
        }
    }, [profile]);

    const formik = useFormik<SchoolFormData>({
        initialValues: {
            schoolName: "",
            address: "",
            city: "",
            pincode: "",
            place_id: "",
            contactPerson: "",
            phone: "",
            email: "",
            baselineEnergyGrid: "0",
            baselineEnergyDiesel: "0",
            baselineEnergySolar: "0",
            baselineWaterMunicipal: "0",
            baselineWaterRain: "0",
            baselineWaterWaste: "0",
            baselineWasteOrganic: "0",
            baselineWasteInorganic: "0",
            baselineWasteHazardous: "0",
            students_count: "",
            reporting_year: "2025",
            baseline_source: "school_shared",

            action_type: "",
            actionQuantity: "", // Standardized as quantity
            installation_date: "",
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
            waste_diverted_kg: "",
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
                const dupCheck = await checkDuplicateSchool(values.place_id, values.schoolName, values.lat || 0, values.lng || 0);
                if (dupCheck.isDuplicate && dupCheck.type === 'BLOCK') {
                    toast.error(`This school is already registered as ${dupCheck.registryId}. View profile: /verify/school/${dupCheck.registryId}`, { autoClose: 10000 });
                    setSubmitting(false);
                    return;
                }

                const orderRes = await fetch("/api/school/payment/create", { method: "POST" });
                const orderData = await orderRes.json();
                if (orderData.error) throw new Error(orderData.error);

                const options = {
                    key: orderData.key,
                    amount: 19900, // Rs. 199 in paise
                    currency: "INR",
                    name: "Earth Carbon Registry",
                    description: "School Onboarding - Rs.199",
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
                    theme: { color: "rgb(32,38,130)" },
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
        <div className="max-w-5xl mx-auto pb-20 px-4">
            {/* Step Progress Bar */}
            <div className="mb-12">
                <div className="flex justify-between items-center mb-4 overflow-x-auto pb-2 scrollbar-none">
                    {[1, 2, 3, 4].map((step) => (
                        <div key={step} className="flex flex-col items-center flex-1 min-w-[90px] px-2 text-center">
                            <div className={`text-[9px] sm:text-[10px] font-bold mb-2 uppercase tracking-widest leading-tight h-4 flex flex-col justify-center ${currentStep >= step ? "text-[rgb(32,38,130)]" : "text-gray-400"}`}>
                                {step === 1 && "Baseline Usage"}
                                {step === 2 && "Low-Carbon Action"}
                                {step === 3 && "Impact Summary"}
                                {step === 4 && "Payment"}
                            </div>
                            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border-4 transition-all duration-300 shadow-sm ${currentStep === step ? "bg-[rgb(32,38,130)] border-blue-100 text-white scale-110" :
                                    currentStep > step ? "bg-green-500 border-green-100 text-white" :
                                        "bg-white border-gray-100 text-gray-300"
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

            <form onSubmit={(e) => { e.preventDefault(); formik.handleSubmit(); }} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {currentStep === 1 && (
                    <StepWrapper title="Baseline Usage (Monthly Average)" icon={<EnergyIcon />}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InputField label="Student/Staff Count" name="students_count" type="number" formik={formik} />
                            <DropdownField label="Reporting Year" name="reporting_year" options={REPORTING_YEAR_OPTIONS} formik={formik} />
                            <DropdownField label="Data Source" name="baseline_source" options={BASELINE_SOURCE_OPTIONS} formik={formik} />

                            <div className="md:col-span-2 mt-6">
                                <h3 className="text-sm font-black uppercase tracking-widest text-[#202682] mb-4">
                                    Energy Usage (Monthly)
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-slate-50 rounded-2xl border-2 border-slate-100">
                                    <InputField label="Electricity (kWh)" name="baselineEnergyGrid" type="number" formik={formik} />
                                    <InputField label="Diesel/Fuel (Liters)" name="baselineEnergyDiesel" type="number" formik={formik} />
                                    <InputField label="Solar/Biomass (kWh)" name="baselineEnergySolar" type="number" formik={formik} />
                                </div>
                            </div>

                            <div className="md:col-span-2 mt-4">
                                <h3 className="text-sm font-black uppercase tracking-widest text-[#202682] mb-4">
                                    Water Usage (Monthly)
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-slate-50 rounded-2xl border-2 border-slate-100">
                                    <InputField label="Municipal Intake (AMC) (Liters)" name="baselineWaterMunicipal" type="number" formik={formik} />
                                    <InputField label="Borewell (Liters)" name="baselineWaterRain" type="number" formik={formik} />
                                    <InputField label="Community Source (Liters)" name="baselineWaterWaste" type="number" formik={formik} />
                                </div>
                            </div>

                            <div className="md:col-span-2 mt-4">
                                <h3 className="text-sm font-black uppercase tracking-widest text-[#202682] mb-4">
                                    Waste Generated: Organic, Plastic, Packaging and paper waste in Kgs.
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-slate-50 rounded-2xl border-2 border-slate-100">
                                    <InputField label="Organic Waste (kg)" name="baselineWasteOrganic" type="number" formik={formik} />
                                    <InputField label="Inorganic (kg)" name="baselineWasteInorganic" type="number" formik={formik} />
                                    <InputField label="Hazardous (kg)" name="baselineWasteHazardous" type="number" formik={formik} />
                                </div>
                            </div>
                        </div>
                    </StepWrapper>
                )}

                {currentStep === 2 && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <StepWrapper title="Low-Carbon Action Details" icon={<RegistryIcon />}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <DropdownField
                                    label="Select Action Type"
                                    name="action_type"
                                    options={ACTION_TYPES.map(a => ({ value: a.value, label: a.label }))}
                                    formik={formik}
                                />
                                <InputField
                                    label="Installed Capacity / Quantity"
                                    name="actionQuantity"
                                    type="number"
                                    formik={formik}
                                    suffix={ACTION_TYPES.find(a => a.value === formik.values.action_type)?.unit || "Units"}
                                />
                                <InputField
                                    label="Commissioning Date"
                                    name="installation_date"
                                    type="date"
                                    formik={formik}
                                />

                                <div className="md:col-span-2 h-px bg-gray-100 my-2" />

                                <div className="md:col-span-2">
                                    <InputField
                                        label="Site/Action Location"
                                        name="address"
                                        textarea
                                        formik={formik}
                                        placeholder="Enter the specific address where the action is installed..."
                                    />
                                </div>
                            </div>
                        </StepWrapper>

                        <PhotoUploadSection
                            userId={auth.currentUser?.uid || "anonymous"}
                            slots={[
                                { key: "energyBillCopy", label: "Energy Bill Copy" },
                                { key: "meterPhoto", label: "Meter Photo" },
                                { key: "moreDetailsPhoto", label: "More Details Photo" },
                                { key: "siteOverviewPhoto", label: "Site Overview of System" },
                            ]}
                            photos={{
                                energyBillCopy: formik.values.energyBillCopy || null,
                                meterPhoto: formik.values.meterPhoto || null,
                                moreDetailsPhoto: formik.values.moreDetailsPhoto || null,
                                siteOverviewPhoto: formik.values.siteOverviewPhoto || null,
                            }}
                            onPhotoChange={(key, url) => {
                                formik.setFieldValue(key, url);
                                // Set photo_file as a flag for Yup if needed, 
                                // but we manually check in handleNext
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
                            <div className="bg-slate-50 p-6 rounded-2xl border-2 border-slate-100 space-y-4">
                                <label className="flex items-start gap-4 cursor-pointer group">
                                    <div className="mt-1 relative">
                                        <input
                                            type="checkbox"
                                            name="consent_confirmed"
                                            checked={formik.values.consent_confirmed}
                                            onChange={formik.handleChange}
                                            className="peer appearance-none w-6 h-6 border-2 border-slate-300 rounded-lg checked:border-[rgb(32,38,130)] checked:bg-[rgb(32,38,130)] transition-all cursor-pointer"
                                        />
                                        <svg className="absolute top-1 left-1 opacity-0 peer-checked:opacity-100 text-white w-4 h-4 pointer-events-none transition-opacity" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                                    </div>
                                    <span className="text-sm font-bold text-slate-500 group-hover:text-slate-800 transition-colors leading-relaxed">
                                        I verify that the data provided above is correct. I authorize Earth Carbon to process this information for registry verification.
                                    </span>
                                </label>
                            </div>

                            <div className="flex flex-col md:flex-row items-center justify-between gap-8 p-8 bg-gradient-to-br from-white to-blue-50/50 rounded-3xl border-2 border-blue-100 shadow-xl">
                                <div>
                                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Registration Fee</p>
                                    <p className="text-4xl font-black text-[rgb(32,38,130)]">₹199</p>
                                </div>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full md:w-auto px-12 py-5 bg-[rgb(32,38,130)] text-white rounded-2xl font-black shadow-2xl shadow-blue-900/20 hover:scale-[1.02] transition-all active:scale-[0.98] disabled:opacity-50"
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
                            className="w-full sm:w-40 px-6 py-3 rounded-xl bg-white border-2 border-gray-100 text-gray-500 font-bold text-sm hover:bg-gray-50 transition-all active:scale-[0.98]"
                        >
                            Back
                        </button>
                    )}

                    {currentStep < totalSteps && (
                        <button
                            type="button"
                            onClick={handleNext}
                            className="w-full sm:w-40 px-6 py-3 rounded-xl bg-[rgb(32,38,130)] text-white font-bold text-sm shadow-xl shadow-blue-900/20 hover:scale-[1.02] transition-all active:scale-[0.98]"
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
        <div className="bg-white rounded-3xl p-6 shadow-2xl shadow-gray-200 border border-gray-100 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-lg font-black text-white bg-[rgb(32,38,130)] -mx-6 -mt-6 p-5 rounded-t-3xl flex items-center gap-3">
                <span className="p-2 bg-white/20 rounded-lg">{icon}</span>
                {title}
            </h2>
            <div className="px-2">{children}</div>
        </div>
    );
}

function InputField({ label, name, type = "text", formik, textarea = false, placeholder = "", icon, maxLength, suffix, ...props }: any) {
    const error = formik.touched[name] && formik.errors[name];
    return (
        <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-bold text-gray-600 px-1">
                {icon && <span className="opacity-50">{icon}</span>}
                {label}
            </label>
            <div className="relative">
                {textarea ? (
                    <textarea
                        name={name}
                        placeholder={placeholder}
                        maxLength={maxLength}
                        className={`w-full px-4 py-3 bg-gray-50 rounded-xl border-2 transition-all outline-none font-semibold text-gray-900 min-h-[120px] text-base ${error ? "border-red-500 bg-red-50" : "border-gray-200 focus:border-[rgb(32,38,130)] focus:bg-white"
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
                            className={`w-full px-4 py-3 bg-gray-50 rounded-xl border-2 transition-all outline-none font-semibold text-gray-900 text-base ${error ? "border-red-500 bg-red-50" : "border-gray-200 focus:border-[rgb(32,38,130)] focus:bg-white"
                                } ${suffix ? "pr-12" : ""}`}
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
            <label className="block text-sm font-bold text-gray-500 px-1">{label}</label>
            <CustomDropdown
                options={options}
                value={formik.values[name]}
                onChange={(val) => formik.setFieldValue(name, val)}
                placeholder={placeholder}
                size="lg"
                className={error ? "border-red-500 rounded-xl" : ""}
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

