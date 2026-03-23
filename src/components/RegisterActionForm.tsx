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
import Input from "./ui/Input";
import Button from "./ui/Button";
import Card from "./ui/Card";
import { useAuth } from "@/context/AuthContext";
import { useUserProfile } from "@/hooks/useUserProfile";
import { PAYMENT_AMOUNT_DISPLAY } from "@/lib/constants";


declare global {
    interface Window {
        Razorpay: new (options: Record<string, unknown>) => {
            open: () => void;
            on: (event: string, handler: (response: Record<string, unknown>) => void) => void;
        };
    }
}

const validationSchema = Yup.object().shape({
    actionType: Yup.string().required("Action type is required"),
    quantity: Yup.number()
        .min(0.01, "Quantity must be greater than 0")
        .required("Quantity is required")
        .typeError("Must be a number"),
    unit: Yup.string().required("Unit is required"),
    address: Yup.string().required("Address is required"),
    commissioningDate: Yup.date()
        .min(new Date("2025-01-01"), "Year must be 2025 or later")
        .max(new Date("2099-12-31"), "Invalid year")
        .required("Commissioning date is required"),
    localPercent: Yup.number().min(0).max(100).typeError("Must be a number"),
    indigenousPercent: Yup.number().min(0).max(100).typeError("Must be a number"),
    communityPercent: Yup.number().min(0).max(100).typeError("Must be a number"),
    jobsCreated: Yup.number().min(0).typeError("Must be a number"),
    consentGiven: Yup.boolean().oneOf([true], "You must verify this data is correct"),
    disclaimerAccepted: Yup.boolean().oneOf([true], "You must accept the disclaimer to proceed"),
});

export default function RegisterActionForm() {
    const { user } = useAuth();
    const { profile } = useUserProfile();
    const router = useRouter();
    const [submitting, setSubmitting] = useState(false);
    const [isSimulationMode, setIsSimulationMode] = useState(false);
    const [meterPhotos, setMeterPhotos] = useState<string[]>(["", "", ""]);
    const [sitePhoto, setSitePhoto] = useState<string | null>(null);
    const [currentStep, setCurrentStep] = useState(1);
    const totalSteps = 3;

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
                        quantity: Number(values.quantity),
                        localPercent: Number(values.localPercent) || 0,
                        indigenousPercent: Number(values.indigenousPercent) || 0,
                        communityPercent: Number(values.communityPercent) || 0,
                        jobsCreated: Number(values.jobsCreated) || 0,
                        meterPhotos: meterPhotos.filter(Boolean),
                        sitePhoto,
                        userId: user?.uid,
                        userEmail: user?.email,
                        // Pull actor info from profile
                        actorType: "Individual/Organization",
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
            actionType: "",
            quantity: "",
            unit: "",
            address: "",
            lat: null as number | null,
            lng: null as number | null,
            commissioningDate: "",
            localPercent: "",
            indigenousPercent: "",
            communityPercent: "",
            jobsCreated: "",
            consentGiven: false,
            disclaimerAccepted: false,
        },
        validationSchema,
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
            1: ["actionType", "quantity", "unit", "commissioningDate"],
            2: ["address"],
            3: ["consentGiven", "disclaimerAccepted"]
        };

        const currentStepFields = stepFields[currentStep];
        const hasStepErrors = currentStepFields.some(field => errors[field as keyof typeof errors]);

        if (!hasStepErrors) {
            if (currentStep === 2) {
                const hasPhotos = sitePhoto || meterPhotos.some(p => p && p.trim() !== "");
                if (!hasPhotos) {
                    toast.error("Please upload at least one verification photo (Site or Meter)");
                    return;
                }
            }
            setCurrentStep(s => Math.min(s + 1, totalSteps));
        } else {
            // Mark fields as touched to show errors
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
                    {[1, 2, 3].map((step) => (
                        <div key={step} className="flex flex-col items-center min-w-[100px]">
                            <span className={`text-[10px] font-black mb-2 whitespace-nowrap uppercase tracking-widest ${currentStep >= step ? "text-[rgb(32,38,130)]" : "text-gray-300"}`}>
                                {step === 1 && "Action Details"}
                                {step === 2 && "Location & Photos"}
                                {step === 3 && "Finalize"}
                            </span>
                            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border-4 transition-all duration-300 shadow-sm ${
                                currentStep === step ? "bg-[rgb(32,38,130)] border-blue-100 text-white scale-110" : 
                                currentStep > step ? "bg-green-500 border-green-100 text-white" : 
                                "bg-white border-gray-50 text-gray-200"
                            }`}>
                                {currentStep > step ? (
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
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
                    <Card header={<div className="flex items-center gap-3"><span className="p-2 bg-blue-50 rounded-lg text-blue-600">⚡</span> <h3 className="text-xl font-bold text-gray-800">Action Details</h3></div>}>
                        <div className="space-y-8">
                            <ActionTypeSelector
                                value={formik.values.actionType}
                                unitValue={formik.values.unit}
                                onChange={(val) => formik.setFieldValue("actionType", val)}
                                onUnitChange={(unit) => formik.setFieldValue("unit", unit)}
                                error={formik.errors.actionType}
                                touched={formik.touched.actionType}
                            />

                            <div className="space-y-3">
                                <label
                                    htmlFor="quantity"
                                    className="block text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1"
                                >
                                    Capacity / Quantity
                                </label>
                                <div className="relative">
                                    <input
                                        id="quantity"
                                        name="quantity"
                                        type="number"
                                        step="0.01"
                                        className={`
                                            w-full px-5 py-5 pr-24 rounded-2xl border-2 bg-gray-50/50
                                            focus:bg-white transition-all duration-300 outline-none
                                            font-black text-xl text-gray-900 placeholder:text-gray-300
                                            ${formik.touched.quantity && formik.errors.quantity
                                                ? "border-red-400 focus:border-red-400"
                                                : "border-gray-100 focus:border-[rgb(32,38,130)]"
                                            }
                                        `}
                                        value={formik.values.quantity}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        placeholder="0.00"
                                    />
                                    <div className="absolute right-5 top-1/2 -translate-y-1/2 px-4 py-2 bg-white border border-gray-100 rounded-xl text-gray-500 font-black text-sm shadow-sm">
                                        {formik.values.unit || "UNITS"}
                                    </div>
                                </div>
                                {formik.touched.quantity && formik.errors.quantity && (
                                    <p className="text-red-500 text-xs font-bold ml-1">{formik.errors.quantity}</p>
                                )}
                            </div>

                            <Input
                                label="Commissioning Date"
                                name="commissioningDate"
                                type="date"
                                className="!py-4 !rounded-xl !text-base !font-bold"
                                min="2025-01-01"
                                max="2099-12-31"
                                value={formik.values.commissioningDate}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                            />
                        </div>
                    </Card>
                )}

                {currentStep === 2 && (
                    <div className="space-y-8">
                        <Card header={<div className="flex items-center gap-3"><span className="p-2 bg-green-50 rounded-lg text-green-600">📍</span> <h3 className="text-xl font-bold text-gray-800">Location</h3></div>}>
                            <LocationPickerSection
                                address={formik.values.address}
                                lat={formik.values.lat}
                                lng={formik.values.lng}
                                onAddressChange={formik.handleChange}
                                onPlaceSelect={handlePlaceSelect}
                                onCoordsChange={(lat, lng) => {
                                    formik.setFieldValue("lat", lat);
                                    formik.setFieldValue("lng", lng);
                                }}
                                error={formik.errors.address}
                                touched={formik.touched.address}
                            />
                        </Card>

                        <Card header={<div className="flex items-center gap-3"><span className="p-2 bg-indigo-50 rounded-lg text-indigo-600">📸</span> <h3 className="text-xl font-bold text-gray-800">Verification Photos</h3></div>}>
                            <PhotoUploadSection
                                meterPhotos={meterPhotos}
                                sitePhoto={sitePhoto}
                                userId={user?.uid || ""}
                                onMeterPhotosChange={setMeterPhotos}
                                onSitePhotoChange={setSitePhoto}
                            />
                        </Card>
                    </div>
                )}

                {currentStep === 3 && (
                    <div className="space-y-8">
                        <Card header={
                            <div className="flex items-center justify-between group cursor-default">
                                <div className="flex items-center gap-3">
                                    <span className="p-2 bg-cyan-50 rounded-lg text-cyan-600">🇮🇳</span>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-800">Atmanirbhar Assessment</h3>
                                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">Optional — help us measure self-reliance impact</p>
                                    </div>
                                </div>
                            </div>
                        }>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <Input
                                    label="Local Sourcing %"
                                    name="localPercent"
                                    type="number"
                                    className="!py-4 !rounded-xl !font-bold"
                                    value={formik.values.localPercent}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    placeholder="0 - 100"
                                    error={formik.touched.localPercent ? formik.errors.localPercent : undefined}
                                />
                                <Input
                                    label="Indigenous Tech %"
                                    name="indigenousPercent"
                                    type="number"
                                    className="!py-4 !rounded-xl !font-bold"
                                    value={formik.values.indigenousPercent}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    placeholder="0 - 100"
                                    error={formik.touched.indigenousPercent ? formik.errors.indigenousPercent : undefined}
                                />
                                <Input
                                    label="Community Ownership %"
                                    name="communityPercent"
                                    type="number"
                                    className="!py-4 !rounded-xl !font-bold"
                                    value={formik.values.communityPercent}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    placeholder="0 - 100"
                                    error={formik.touched.communityPercent ? formik.errors.communityPercent : undefined}
                                />
                                <Input
                                    label="Jobs Created"
                                    name="jobsCreated"
                                    type="number"
                                    className="!py-4 !rounded-xl !font-bold"
                                    value={formik.values.jobsCreated}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    placeholder="Number of jobs"
                                    error={formik.touched.jobsCreated ? formik.errors.jobsCreated : undefined}
                                />
                            </div>
                        </Card>

                        <Card>
                            <div className="space-y-8">
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
                                            <svg className="absolute top-1 left-1 opacity-0 peer-checked:opacity-100 text-white w-4 h-4 pointer-events-none transition-opacity" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                                        </div>
                                        <span className="text-sm font-bold text-gray-500 group-hover:text-gray-800 transition-colors leading-relaxed">
                                            I verify that the data provided above is correct to the best of my knowledge.
                                            I understand that this submission will generate a tamper-evident digital signature.
                                        </span>
                                    </label>
                                    {formik.touched.consentGiven && formik.errors.consentGiven && (
                                        <p className="text-red-500 text-[10px] font-black uppercase tracking-widest ml-10">{formik.errors.consentGiven}</p>
                                    )}

                                    <label className="flex items-start gap-4 cursor-pointer group">
                                        <div className="mt-1 relative">
                                            <input
                                                type="checkbox"
                                                name="disclaimerAccepted"
                                                checked={formik.values.disclaimerAccepted}
                                                onChange={formik.handleChange}
                                                className="peer appearance-none w-6 h-6 border-2 border-gray-300 rounded-lg checked:border-[rgb(32,38,130)] checked:bg-[rgb(32,38,130)] transition-all cursor-pointer"
                                            />
                                            <svg className="absolute top-1 left-1 opacity-0 peer-checked:opacity-100 text-white w-4 h-4 pointer-events-none transition-opacity" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                                        </div>
                                        <span className="text-sm font-bold text-gray-500 group-hover:text-gray-800 transition-colors leading-relaxed">
                                            I understand that the carbon reduction (tCO₂e) and Atmanirbhar
                                            values displayed are <span className="text-blue-600">estimates</span> based on my submitted data.
                                            Earth Carbon Foundation verifies all actions in good faith.
                                        </span>
                                    </label>
                                    {formik.touched.disclaimerAccepted && formik.errors.disclaimerAccepted && (
                                        <p className="text-red-500 text-[10px] font-black uppercase tracking-widest ml-10">{formik.errors.disclaimerAccepted}</p>
                                    )}
                                </div>

                                <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-2">
                                    <div className="text-center sm:text-left">
                                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Registration Fee</p>
                                        <p className="text-4xl font-black text-gray-800">{PAYMENT_AMOUNT_DISPLAY}</p>
                                    </div>
                                    <Button type="submit" className="w-full sm:w-auto px-8 py-3.5 text-base rounded-xl shadow-lg shadow-blue-500/10" loading={submitting}>
                                        Pay & Register Action
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    </div>
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
