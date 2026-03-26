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
    
    // Usage Valdiation
    electricityUseKwh: Yup.number().min(0).typeError("Must be a number"),
    waterUsageKLD: Yup.number().min(0).typeError("Must be a number"),
    
    // Baseline Validation
    baselineElectricityKwh: Yup.number().min(0).typeError("Must be a number"),
    baselineWaterKL: Yup.number().min(0).typeError("Must be a number"),
    
    wasteGeneratedKg: Yup.number().min(0).typeError("Must be a number"),
    wasteDivertedKg: Yup.number().min(0).typeError("Must be a number"),
    consentGiven: Yup.boolean().oneOf([true], "You must verify this data is correct"),
    disclaimerAccepted: Yup.boolean().oneOf([true], "You must accept the disclaimer to proceed"),
    summaryAgreed: Yup.boolean().oneOf([true], "You must agree to proceed"),
});

export default function RegisterActionForm() {
    const { user } = useAuth();
    const { profile } = useUserProfile();
    const router = useRouter();
    const [submitting, setSubmitting] = useState(false);
    const [isSimulationMode, setIsSimulationMode] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const totalSteps = 5;

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
                        // Profile Data
                        sector: profile?.institutionType || null,
                        state: profile?.state || null,
                        pincode: profile?.pincode || null,
                        // Usage & Baseline
                        electricityUseKwh: Number(values.electricityUseKwh) || null,
                        fuelDieselLiters: Number(values.fuelDieselLiters) || null,
                        fuelPetrolLiters: Number(values.fuelPetrolLiters) || null,
                        fuelKeroseneLiters: Number(values.fuelKeroseneLiters) || null,
                        waterUsageKLD: Number(values.waterUsageKLD) || null,
                        wasteOrganicKg: Number(values.wasteOrganicKg) || null,
                        wasteTextileKg: Number(values.wasteTextileKg) || null,
                        wastePlasticKg: Number(values.wastePlasticKg) || null,
                        wasteElectronicKg: Number(values.wasteElectronicKg) || null,

                        baselineElectricityKwh: Number(values.baselineElectricityKwh) || null,
                        baselineWaterKL: Number(values.baselineWaterKL) || null,
                        baselineWasteOrganicKg: Number(values.baselineWasteOrganicKg) || null,
                        baselineWastePaperKg: Number(values.baselineWastePaperKg) || null,
                        baselineWastePlasticKg: Number(values.baselineWastePlasticKg) || null,
                        baselineWasteTextileKg: Number(values.baselineWasteTextileKg) || null,
                        baselineWasteEWasteKg: Number(values.baselineWasteEWasteKg) || null,

                        wasteGeneratedKg: Number(values.wasteGeneratedKg) || null,
                        wasteDivertedKg: Number(values.wasteDivertedKg) || null,
                        
                        // Action Specific
                        capacityKw: Number(values.capacityKw) || null,
                        installationDate: values.installationDate,
                        capacity: values.capacity,
                        tankCapacityKL: Number(values.tankCapacityKL) || null,
                        capacityM3: values.capacityM3,

                        // Photos
                        energyBillCopy: values.energyBillCopy,
                        meterPhoto: values.meterPhoto,
                        moreDetailsPhoto: values.moreDetailsPhoto,
                        siteOverviewPhoto: values.siteOverviewPhoto,
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
            
            // Current Usage
            electricityUseKwh: "",
            fuelDieselLiters: "",
            fuelPetrolLiters: "",
            fuelKeroseneLiters: "",
            waterUsageKLD: "",
            wasteOrganicKg: "",
            wasteTextileKg: "",
            wastePlasticKg: "",
            wasteElectronicKg: "",

            // Action Specific
            capacityKw: "",
            installationDate: "",
            capacity: "",
            tankCapacityKL: "",
            capacityM3: "",

            // Baseline Data
            baselineElectricityKwh: "",
            baselineWaterKL: "",
            baselineWasteOrganicKg: "",
            baselineWastePaperKg: "",
            baselineWastePlasticKg: "",
            baselineWasteTextileKg: "",
            baselineWasteEWasteKg: "",

            wasteGeneratedKg: "",
            wasteDivertedKg: "",
            consentGiven: false,
            disclaimerAccepted: false,
            summaryAgreed: false,

            // Photos
            energyBillCopy: null as string | null,
            meterPhoto: null as string | null,
            moreDetailsPhoto: null as string | null,
            siteOverviewPhoto: null as string | null,
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
            3: ["baselineElectricityKwh", "baselineWaterKL", "wasteGeneratedKg", "wasteDivertedKg"], // Assessment Details
            4: ["summaryAgreed"], // Impact Summary
            5: ["consentGiven", "disclaimerAccepted"] // Finalize/Payment
        };

        const currentStepFields = stepFields[currentStep];
        const hasStepErrors = currentStepFields.some(field => errors[field as keyof typeof errors]);

        if (!hasStepErrors) {
            if (currentStep === 2) {
                const requiredPhotos = ["energyBillCopy", "meterPhoto", "moreDetailsPhoto", "siteOverviewPhoto"];
                const missingPhotos = requiredPhotos.some(key => !formik.values[key as keyof typeof formik.values]);
                if (missingPhotos) {
                    toast.error("Please upload all 4 verification photos to proceed");
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
                    {[1, 2, 3, 4, 5].map((step) => (
                        <div key={step} className="flex flex-col items-center flex-1 min-w-[100px] px-2 text-center">
                            <div className={`text-[10px] font-black mb-2 uppercase tracking-widest leading-tight h-4 flex flex-col justify-center ${currentStep >= step ? "text-[rgb(32,38,130)]" : "text-gray-300"}`}>
                                {step === 1 && "Action Details"}
                                {step === 2 && "Location & Photos"}
                                {step === 3 && "Assessment Details"}
                                {step === 4 && "Impact Summary"}
                                {step === 5 && "Payment"}
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
                    <div className="space-y-8">
                        <Card header={<div className="flex items-center gap-3"><span className="p-2 bg-blue-50 rounded-lg text-blue-600"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg></span> <h3 className="text-xl font-bold text-gray-800">Action Details</h3></div>}>
                            <div className="space-y-8">
                                <ActionTypeSelector
                                    value={formik.values.actionType}
                                    unitValue={formik.values.unit}
                                    onChange={(val) => formik.setFieldValue("actionType", val)}
                                    onUnitChange={(unit) => formik.setFieldValue("unit", unit)}
                                    error={formik.errors.actionType}
                                    touched={formik.touched.actionType}
                                />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <label htmlFor="quantity" className="block text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Capacity / Quantity</label>
                                        <div className="relative">
                                            <input
                                                id="quantity"
                                                name="quantity"
                                                type="number"
                                                step="0.01"
                                                className={`w-full px-5 py-4 pr-24 rounded-2xl border-2 bg-gray-50/50 focus:bg-white transition-all duration-300 outline-none font-black text-lg text-gray-900 placeholder:text-gray-300 ${formik.touched.quantity && formik.errors.quantity ? "border-red-400" : "border-gray-100 focus:border-[rgb(32,38,130)]"}`}
                                                value={formik.values.quantity}
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                                placeholder="0.00"
                                            />
                                            <div className="absolute right-5 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-white border border-gray-100 rounded-xl text-gray-500 font-black text-xs shadow-sm">
                                                {formik.values.unit || "UNITS"}
                                            </div>
                                        </div>
                                    </div>

                                    <Input
                                        label="Commissioning Date"
                                        name="commissioningDate"
                                        type="date"
                                        className="!py-4 !rounded-xl !text-base !font-bold"
                                        value={formik.values.commissioningDate}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                    />
                                </div>

                                {/* Action-Specific Dynamic Fields removed as they are redundant with top-level Quantity and Commissioning Date */}
                            </div>
                        </Card>

                        <Card header={<div className="flex items-center gap-3"><span className="p-2 bg-amber-50 rounded-lg text-amber-600"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /></svg></span> <h3 className="text-xl font-bold text-gray-800">Current Usage</h3></div>}>
                            <div className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Input label="Electricity Use (Kwh)" name="electricityUseKwh" type="number" value={formik.values.electricityUseKwh} onChange={formik.handleChange} className="!py-4" />
                                    <Input label="Water usage (KLD)" name="waterUsageKLD" type="number" value={formik.values.waterUsageKLD} onChange={formik.handleChange} className="!py-4" />
                                </div>
                                <div className="space-y-4">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Fuel Use (Liters)</p>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <Input label="Diesel" name="fuelDieselLiters" type="number" value={formik.values.fuelDieselLiters} onChange={formik.handleChange} className="!py-4" />
                                        <Input label="Petrol" name="fuelPetrolLiters" type="number" value={formik.values.fuelPetrolLiters} onChange={formik.handleChange} className="!py-4" />
                                        <Input label="Kerosene" name="fuelKeroseneLiters" type="number" value={formik.values.fuelKeroseneLiters} onChange={formik.handleChange} className="!py-4" />
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Waste Generated (Kgs)</p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                        <Input label="Organic" name="wasteOrganicKg" type="number" value={formik.values.wasteOrganicKg} onChange={formik.handleChange} className="!py-4" />
                                        <Input label="Textile" name="wasteTextileKg" type="number" value={formik.values.wasteTextileKg} onChange={formik.handleChange} className="!py-4" />
                                        <Input label="Plastic" name="wastePlasticKg" type="number" value={formik.values.wastePlasticKg} onChange={formik.handleChange} className="!py-4" />
                                        <Input label="Electronic" name="wasteElectronicKg" type="number" value={formik.values.wasteElectronicKg} onChange={formik.handleChange} className="!py-4" />
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>
                )}

                {currentStep === 2 && (
                    <div className="space-y-8">
                        <Card header={<div className="flex items-center gap-3"><span className="p-2 bg-green-50 rounded-lg text-green-600"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg></span> <h3 className="text-xl font-bold text-gray-800">Location</h3></div>}>
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

                        <Card header={<div className="flex items-center gap-3"><span className="p-2 bg-indigo-50 rounded-lg text-indigo-600"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></svg></span> <h3 className="text-xl font-bold text-gray-800">Verification Photos</h3></div>}>
                            <PhotoUploadSection
                                slots={[
                                    { key: "energyBillCopy", label: "Energy Bill Copy" },
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
                                onPhotoChange={(key, url) => formik.setFieldValue(key, url)}
                            />
                        </Card>
                    </div>
                )}

                {currentStep === 3 && (
                    <div className="space-y-8">
                        <Card header={
                            <div className="flex items-center justify-between group cursor-default">
                                <div className="flex items-center gap-3">
                                    <span className="p-2 bg-cyan-50 rounded-lg text-cyan-600">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                                    </span>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-800">Baseline Data</h3>
                                    </div>
                                </div>
                            </div>
                        }>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <Input
                                    label="Electricity Usage (Kwh)"
                                    name="baselineElectricityKwh"
                                    type="number"
                                    className="!py-4 !rounded-xl !font-bold"
                                    value={formik.values.baselineElectricityKwh}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    placeholder="Total Kwh"
                                    error={formik.touched.baselineElectricityKwh ? formik.errors.baselineElectricityKwh : undefined}
                                />
                                <Input
                                    label="Water Consumption (Kilo Liters)"
                                    name="baselineWaterKL"
                                    type="number"
                                    className="!py-4 !rounded-xl !font-bold"
                                    value={formik.values.baselineWaterKL}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    placeholder="Total KL"
                                    error={formik.touched.baselineWaterKL ? formik.errors.baselineWaterKL : undefined}
                                />
                            </div>

                            <div className="border-t border-gray-100 pt-6 mt-6">
                                <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1 mb-4">Waste Generated current period (Kgs)</p>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <Input label="Organic" name="baselineWasteOrganicKg" type="number" value={formik.values.baselineWasteOrganicKg} onChange={formik.handleChange} />
                                    <Input label="Paper" name="baselineWastePaperKg" type="number" value={formik.values.baselineWastePaperKg} onChange={formik.handleChange} />
                                    <Input label="Plastic" name="baselineWastePlasticKg" type="number" value={formik.values.baselineWastePlasticKg} onChange={formik.handleChange} />
                                    <Input label="Textile" name="baselineWasteTextileKg" type="number" value={formik.values.baselineWasteTextileKg} onChange={formik.handleChange} />
                                    <Input label="E-Waste" name="baselineWasteEWasteKg" type="number" value={formik.values.baselineWasteEWasteKg} onChange={formik.handleChange} />
                                </div>
                            </div>

                            {/* Circularity divider */}
                            <div className="border-t border-gray-100 pt-6 mt-8">
                                <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1 mb-4">Circularity Data</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <Input
                                        label="Total waste generated (kg/yr)"
                                        name="wasteGeneratedKg"
                                        type="number"
                                        className="!py-4 !rounded-xl !font-bold"
                                        value={formik.values.wasteGeneratedKg}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        placeholder="Total waste generated"
                                        error={formik.touched.wasteGeneratedKg ? formik.errors.wasteGeneratedKg : undefined}
                                    />
                                    <Input
                                        label="Waste Diverted / Recycled (kg/yr)"
                                        name="wasteDivertedKg"
                                        type="number"
                                        className="!py-4 !rounded-xl !font-bold"
                                        value={formik.values.wasteDivertedKg}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        placeholder="Waste recycled or composted"
                                        error={formik.touched.wasteDivertedKg ? formik.errors.wasteDivertedKg : undefined}
                                    />
                                </div>
                                <p className="text-xs text-gray-400 mt-2 ml-1">Used to calculate your Circularity Score — the % of waste diverted from landfill.</p>
                            </div>
                        </Card>
                    </div>
                )}

                {currentStep === 4 && (
                    <ImpactSummaryStep
                        isSchool={false}
                        formValues={formik.values}
                        userProfile={profile}
                        agreed={formik.values.summaryAgreed}
                        onAgreeChange={(checked) => formik.setFieldValue("summaryAgreed", checked)}
                    />
                )}

                {currentStep === 5 && (
                    <div className="space-y-8">
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
                                            <svg className="absolute top-1 left-1 opacity-0 peer-checked:opacity-100 text-white w-4 h-4 pointer-events-none transition-opacity" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
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
                                            <svg className="absolute top-1 left-1 opacity-0 peer-checked:opacity-100 text-white w-4 h-4 pointer-events-none transition-opacity" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
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
