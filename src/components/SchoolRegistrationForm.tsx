"use client";

import React, { useState, useEffect, useRef } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { SchoolFormData } from "@/types/school";
import { 
    BASELINE_SOURCE_OPTIONS, 
    FUEL_TYPE_OPTIONS, 
    RENEWABLE_TYPE_OPTIONS,
    REPORTING_YEAR_OPTIONS,
    RECYCLING_PROGRAM_OPTIONS,
    ACTION_TYPE_OPTIONS
} from "@/lib/constants/schoolConstants";
import { toast } from "react-toastify";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useRouter } from "next/navigation";
import Spinner from "@/components/ui/Spinner";
import { auth } from "@/lib/firebaseConfig";
import SchoolAutocomplete from "./SchoolAutocomplete";
import { getProjects, getSchoolActions, checkDuplicateSchool } from "@/lib/schoolFirestoreService";
import CustomDropdown from "./ui/CustomDropdown";

declare global {
    interface Window {
        Razorpay: new (options: Record<string, unknown>) => {
            open: () => void;
            on: (event: string, handler: (response: Record<string, unknown>) => void) => void;
        };
    }
}

const validationSchema = [
    // Step 1: Identity
    Yup.object({
        schoolName: Yup.string().required("School name is required"),
        address: Yup.string().required("Address is required"),
        city: Yup.string().required("City is required"),
        pincode: Yup.string().matches(/^[0-9]{6}$/, "Must be a 6-digit pincode").required("Required"),
    }),
    // Step 2: Energy & Fuel
    Yup.object({
        students_count: Yup.number().min(1, "Students count must be at least 1").required("Required"),
        reporting_year: Yup.string().required("Required"),
        action_id: Yup.string().required("Please select an action"),
        electricity_kWh_year: Yup.number().required("Required"),
        fuel_type: Yup.string().required("Required"),
    }),
    // Step 3: Waste & Water
    Yup.object({
        waste_generated_kg: Yup.number().required("Required"),
        water_consumption_m3: Yup.number().required("Required"),
        attribution_pct_energy: Yup.number().min(0, "Min 0").max(100, "Max 100").required("Required"),
        attribution_pct_waste: Yup.number().min(0, "Min 0").max(100, "Max 100").required("Required"),
        attribution_pct_water: Yup.number().min(0, "Min 0").max(100, "Max 100").required("Required"),
        photo_file: Yup.mixed().required("Proof photo is required"),
    }),
    // Step 4: Finalization
    Yup.object({
        consent_confirmed: Yup.boolean().oneOf([true], "Please provide consent to proceed").required(),
        installation_date: Yup.date()
            .transform((value, originalValue) => originalValue === "" ? null : value)
            .nullable()
            .min(new Date("2025-01-01"), "Year must be 2025 or later")
            .max(new Date("2099-12-31"), "Invalid year"),
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
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
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
            projectId: "",
            
            electricity_kWh_year: "",
            fuel_type: "None",
            fuel_consumption_litres: "",
            renewable_energy_type: "None",
            renewable_energy_kwh: "",
            attribution_pct_energy: "",
            students_count: "",
            reporting_year: "2025",
            action_id: "",

            waste_generated_kg: "",
            waste_diverted_kg: "",
            recycling_programs: [],
            water_consumption_m3: "",
            attribution_pct_waste: "",
            attribution_pct_water: "",
            calculation_notes: "",
            baseline_source: "school_shared",

            has_existing_actions: "No",
            action_type: "",
            installation_date: "",
            capacity_description: "",
            photo_file: null,
            planned_action_type: "",
            target_date: "",
            
            consent_confirmed: false,
            lat: null,
            lng: null,
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
        const file = e.target.files?.[0];
        if (!file) return;

        if (!["image/jpeg", "image/png"].includes(file.type)) {
            toast.error("Please upload an image file (JPG or PNG).");
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            toast.error("Image too large. Please upload a photo under 10MB.");
            return;
        }

        // Feature 9: Compression
        const compressed = await compressImage(file);
        formik.setFieldValue("photo_file", compressed);
        
        const reader = new FileReader();
        reader.onloadend = () => setPhotoPreview(reader.result as string);
        reader.readAsDataURL(compressed);
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
            if (currentStep === 1) {
                // Feature 2: Duplicate Check
                const dupCheck = await checkDuplicateSchool(formik.values.place_id, formik.values.schoolName, formik.values.lat || 0, formik.values.lng || 0);
                if (dupCheck.isDuplicate) {
                    if (dupCheck.type === 'BLOCK') {
                        toast.error(`This school is already registered as ${dupCheck.registryId}. View profile: /verify/school/${dupCheck.registryId}`, { autoClose: 10000 });
                        return;
                    } else if (dupCheck.type === 'WARNING') {
                        if (!confirm("Another school with this name exists in a different location. Confirm to proceed?")) {
                            return;
                        }
                    }
                }
            }
            setCurrentStep(currentStep + 1);
        } else {
            if (currentStep === 3 && errors.photo_file) {
                toast.error("Please upload a proof photo of the action to proceed.", { position: "top-center" });
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
                        <div key={step} className="flex flex-col items-center min-w-[100px]">
                            <span className={`text-[10px] sm:text-xs font-bold mb-2 whitespace-nowrap uppercase tracking-widest ${currentStep >= step ? "text-[rgb(32,38,130)]" : "text-gray-400"}`}>
                                {step === 1 && "Identity"}
                                {step === 2 && "Energy & Fuel"}
                                {step === 3 && "Waste & Water"}
                                {step === 4 && "Finalize"}
                            </span>
                            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border-4 transition-all duration-300 shadow-sm ${
                                currentStep === step ? "bg-[rgb(32,38,130)] border-blue-100 text-white scale-110" : 
                                currentStep > step ? "bg-green-500 border-green-100 text-white" : 
                                "bg-white border-gray-100 text-gray-300"
                            }`}>
                                {currentStep > step ? "✓" : step}
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
                    <StepWrapper title="Step 1: School Identity" icon={<IdentityIcon />}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2 space-y-2">
                                <label className="flex items-center gap-2 text-sm font-bold text-gray-600 px-1">
                                    <span className="opacity-50"><SchoolIcon /></span>
                                    School Name
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
                                    error={formik.touched.schoolName ? (formik.errors.schoolName as string) : ""}
                                />
                            </div>
                            <InputField label="City" name="city" formik={formik} />
                            <InputField label="Pincode" name="pincode" formik={formik} maxLength={6} />
                            <div className="md:col-span-2">
                                <InputField label="Full Address" name="address" formik={formik} textarea />
                            </div>
                        </div>
                    </StepWrapper>
                )}

                {currentStep === 2 && (
                    <StepWrapper title="Step 2: Energy & Fuel Data" icon={<EnergyIcon />}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InputField label="Students Count" name="students_count" type="number" formik={formik} />
                            <DropdownField label="Reporting Year" name="reporting_year" options={REPORTING_YEAR_OPTIONS} formik={formik} />
                            
                            <DropdownField label="Primary Action Type" name="action_id" options={actions.map(a => ({ value: a.id, label: `${a.type} - ${a.id}` }))} formik={formik} placeholder="Select Action" />
                            <DropdownField label="Data Source" name="baseline_source" options={BASELINE_SOURCE_OPTIONS} formik={formik} />

                            <div className="md:col-span-2 h-px bg-gray-100 my-4" />

                            <InputField label="Electricity Use (kWh/yr)" name="electricity_kWh_year" type="number" formik={formik} />
                            <DropdownField label="Main Fuel Type" name="fuel_type" options={FUEL_TYPE_OPTIONS} formik={formik} />
                            
                            {formik.values.fuel_type !== "None" && (
                                <InputField 
                                    label="Annual Fuel Consumption (Litres)" 
                                    name="fuel_consumption_litres" 
                                    type="number" 
                                    formik={formik} 
                                />
                            )}

                            <div className="md:col-span-2 h-px bg-gray-100 my-4" />

                            <DropdownField label="Renewable Energy (if any)" name="renewable_energy_type" options={RENEWABLE_TYPE_OPTIONS} formik={formik} />
                            {formik.values.renewable_energy_type !== "None" && (
                                <InputField label="Renewable Gen (kWh/yr)" name="renewable_energy_kwh" type="number" formik={formik} />
                            )}
                        </div>
                    </StepWrapper>
                )}

                {currentStep === 3 && (
                    <div className="space-y-8">
                        <StepWrapper title="Step 3: Waste & Water Data" icon={<WasteIcon />}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <InputField label="Waste Generated (kg/yr)" name="waste_generated_kg" type="number" formik={formik} />
                                <InputField label="Water Consumption (m3/yr)" name="water_consumption_m3" type="number" formik={formik} />

                                <div className="md:col-span-2 h-px bg-gray-100 my-4 text-center">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Attribution Percentages</p>
                                </div>

                                <InputField 
                                    label="Energy Attribution" 
                                    name="attribution_pct_energy" 
                                    type="number" 
                                    formik={formik} 
                                    suffix="%"
                                />
                                <InputField 
                                    label="Waste Attribution" 
                                    name="attribution_pct_waste" 
                                    type="number" 
                                    formik={formik} 
                                    suffix="%"
                                />
                                <InputField 
                                    label="Water Attribution" 
                                    name="attribution_pct_water" 
                                    type="number" 
                                    formik={formik} 
                                    suffix="%"
                                />
                            </div>
                        </StepWrapper>

                        <StepWrapper title="Action Verification" icon={<WasteIcon />}>
                            <div className="space-y-6">
                                <label className="block text-sm font-bold text-gray-500 px-1 text-center">Proof Photo (JPG/PNG only, max 10MB)</label>
                                <input type="file" onChange={handlePhotoChange} className="hidden" id="photo-upload" accept="image/jpeg,image/png" />
                                <label htmlFor="photo-upload" className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-3xl p-8 hover:border-[rgb(32,38,130)] hover:bg-blue-50/20 cursor-pointer transition-all">
                                    {photoPreview ? (
                                        <img src={photoPreview} alt="Preview" className="h-40 w-auto rounded-xl object-cover shadow-xl" />
                                    ) : (
                                        <div className="text-center space-y-3">
                                            <span className="text-4xl">📷</span>
                                            <p className="text-sm font-bold text-gray-400">Click to upload photo of the action</p>
                                        </div>
                                    )}
                                </label>
                            </div>
                        </StepWrapper>
                    </div>
                )}

                {currentStep === 4 && (
                    <StepWrapper title="Step 4: Registry Finalization" icon={<RegistryIcon />}>
                        <div className="space-y-8">
                            <div className="bg-slate-50 p-6 rounded-[2rem] border border-gray-100 space-y-6">
                                <div className="flex items-center justify-between">
                                    <span className="font-bold text-gray-700">Has existing low-carbon actions?</span>
                                    <button
                                        type="button"
                                        onClick={() => formik.setFieldValue("has_existing_actions", formik.values.has_existing_actions === "Yes" ? "No" : "Yes")}
                                        className={`relative w-14 h-8 rounded-full transition-all ${formik.values.has_existing_actions === "Yes" ? "bg-[rgb(32,38,130)]" : "bg-gray-300"}`}
                                    >
                                        <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all shadow-md ${formik.values.has_existing_actions === "Yes" ? "left-7" : "left-1"}`} />
                                    </button>
                                </div>

                                {formik.values.has_existing_actions === "Yes" && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
                                        <DropdownField label="Action Type" name="action_type" options={ACTION_TYPE_OPTIONS} formik={formik} />
                                        <InputField label="Installation Date" name="installation_date" type="date" formik={formik} min="2025-01-01" max="2099-12-31" />
                                    </div>
                                )}

                                {formik.values.has_existing_actions === "No" && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
                                        <InputField label="Planned Action" name="planned_action_type" formik={formik} placeholder="e.g., Solar panels" />
                                        <InputField label="Target Date" name="target_date" type="date" formik={formik} min="2025-01-01" max="2099-12-31" />
                                    </div>
                                )}
                            </div>

                            <div className="pt-6 border-t border-gray-100">
                                <label className="flex gap-4 cursor-pointer group">
                                    <input 
                                        type="checkbox" 
                                        className="w-6 h-6 mt-1 rounded-lg border-2 border-gray-300 accent-[rgb(32,38,130)]"
                                        checked={formik.values.consent_confirmed}
                                        onChange={(e) => formik.setFieldValue("consent_confirmed", e.target.checked)}
                                    />
                                    <span className={`text-sm font-bold leading-relaxed transition-colors ${formik.touched.consent_confirmed && formik.errors.consent_confirmed ? "text-red-500" : "text-gray-500 group-hover:text-gray-800"}`}>
                                        I authorize Earth Carbon Foundation to collect, verify, and publicly display this school's low-carbon action data for transparency and climate accountability purposes.
                                    </span>
                                </label>
                            </div>

                            <div className="bg-slate-50 border border-gray-100 p-6 rounded-[2rem] flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl shadow-gray-200/50">
                                <div className="space-y-1 text-center sm:text-left font-bold">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Onboarding Fee</span>
                                    <div className="flex items-baseline justify-center sm:justify-start gap-1">
                                        <span className="text-xl text-gray-400">₹</span>
                                        <span className="text-4xl text-gray-900">199</span>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => formik.handleSubmit()}
                                    disabled={submitting}
                                    className="w-full sm:w-auto px-10 py-4 bg-[rgb(32,38,130)] text-white rounded-2xl font-black shadow-xl shadow-blue-900/20 hover:scale-[1.05] transition-all active:scale-[0.98] disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-3"
                                >
                                    {submitting ? <Spinner size="sm" /> : "Pay & Register"}
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
                        className={`w-full px-4 py-3 bg-gray-50 rounded-xl border-2 transition-all outline-none font-semibold text-gray-900 min-h-[120px] text-base ${
                            error ? "border-red-500 bg-red-50" : "border-gray-200 focus:border-[rgb(32,38,130)] focus:bg-white"
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
                            className={`w-full px-4 py-3 bg-gray-50 rounded-xl border-2 transition-all outline-none font-semibold text-gray-900 text-base ${
                                error ? "border-red-500 bg-red-50" : "border-gray-200 focus:border-[rgb(32,38,130)] focus:bg-white"
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
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m22 10-10-5L2 10l10 5 10-5z"/><path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"/></svg>
);
const IdentityIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="7" r="4"/><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/></svg>
);
const EnergyIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
);
const WasteIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
);
const RegistryIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
);

