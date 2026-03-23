"use client";

import React, { useState } from "react";
import Input from "./ui/Input";
import Button from "./ui/Button";
import Card from "./ui/Card";
import CustomDropdown from "./ui/CustomDropdown";
import ActionTypeCards from "./forms/ActionTypeCards";
import { updateUserProfile } from "@/lib/firestoreService";
import { toast } from "react-toastify";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

interface ProfileSetupProps {
    uid: string;
    onComplete: () => void;
}

const INSTITUTION_TYPES = [
    { value: "School", label: "Educational Institution (School/College)" },
    { value: "Corporate", label: "Corporate / Business Entity" },
    { value: "NGO", label: "Non-Profit Organization (NGO)" },
    { value: "Government", label: "Government Body" },
    { value: "Individual", label: "Individual Actor" },
] as const;

export default function ProfileSetup({ uid, onComplete }: ProfileSetupProps) {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        displayName: user?.displayName || "",
        email: user?.email || "",
        phone: "+91",
        contactPerson: "",
        institutionType: "" as any,
        socialHandles: ["", "", ""],
    });
    const [saving, setSaving] = useState(false);

    const handleChange = (field: string, value: string | string[]) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSocialChange = (index: number, value: string) => {
        const updated = [...formData.socialHandles];
        updated[index] = value;
        handleChange("socialHandles", updated);
    };

    const handleSubmit = async () => {
        const phoneRegex = /^\+91[0-9]{10}$/;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (
            !formData.displayName.trim() || 
            !formData.phone.trim() || 
            !formData.contactPerson.trim() || 
            !formData.institutionType
        ) {
            toast.error("Please fill in all required fields.");
            return;
        }

        if (!phoneRegex.test(formData.phone)) {
            toast.error("Invalid phone number. Must start with +91 followed by 10 digits.");
            return;
        }

        if (!emailRegex.test(formData.email)) {
            toast.error("Invalid email address format.");
            return;
        }

        setSaving(true);
        try {
            await updateUserProfile(uid, {
                displayName: formData.displayName,
                email: formData.email,
                phone: formData.phone,
                contactPerson: formData.contactPerson,
                institutionType: formData.institutionType,
                socialHandles: formData.socialHandles as [string, string, string],
            });
            toast.success("Profile updated successfully!");
            onComplete();
        } catch (err) {
            console.error(err);
            toast.error("Failed to save profile. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-82px)] bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
            <div className="max-w-2xl w-full space-y-8">
                {/* Header Section */}
                <div className="text-center space-y-3">
                    <h1 className="text-3xl md:text-4xl font-black text-gray-800 tracking-tight">
                        Complete Your Profile
                    </h1>
                    <p className="text-lg text-gray-500 max-w-md mx-auto">
                        Tell us a bit more about yourself or your organization to get started with the registry.
                    </p>
                </div>

                {/* Main Form Card */}
                <Card className="!p-8 md:!p-10 shadow-2xl shadow-blue-500/5 border-t-4 border-t-[rgb(32,38,130)]">
                    <div className="space-y-8">
                        {/* Welcome Alert */}
                        <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-100/50 flex items-start gap-4">
                            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-xl shrink-0">
                                ✨
                            </div>
                            <p className="text-sm font-medium text-blue-800 leading-relaxed pt-1">
                                Welcome to Earth Carbon Registry! Your profile details are required to ensure the transparency and verification of your environmental actions.
                            </p>
                        </div>

                        {/* Form Fields */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <Input
                                    label="Full Name / Entity Name"
                                    placeholder="e.g., Green Valley School or John Doe"
                                    value={formData.displayName}
                                    onChange={(e) => handleChange("displayName", e.target.value)}
                                    className="!py-4 !rounded-xl"
                                />
                            </div>

                            <Input
                                label="Email Address"
                                value={formData.email}
                                disabled
                                className="!py-4 !rounded-xl bg-gray-50/50 opacity-70 cursor-not-allowed"
                            />

                            <Input
                                label="Phone Number"
                                placeholder="+91 XXXXX XXXXX"
                                value={formData.phone}
                                onChange={(e) => handleChange("phone", e.target.value)}
                                className="!py-4 !rounded-xl"
                            />

                            <div className="md:col-span-1 space-y-1.5">
                                <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">
                                    Institution Type
                                </label>
                                <CustomDropdown
                                    options={INSTITUTION_TYPES}
                                    value={formData.institutionType}
                                    onChange={(val) => handleChange("institutionType", val)}
                                    placeholder="Select type..."
                                    size="lg"
                                />
                            </div>

                            <Input
                                label="Primary Contact Person"
                                placeholder="Name of the person managing the account"
                                value={formData.contactPerson}
                                onChange={(e) => handleChange("contactPerson", e.target.value)}
                                className="!py-4 !rounded-xl"
                            />
                        </div>

                        {/* Social Media Section */}
                        <div className="space-y-4 pt-4 border-t border-gray-100">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-1 bg-blue-400 h-4 rounded-full"></div>
                                <h3 className="text-xs font-black text-gray-500 uppercase tracking-[0.2em]">
                                    Social Media & Website (Optional)
                                </h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input
                                    placeholder="Website or Social Link 1"
                                    value={formData.socialHandles[0]}
                                    onChange={(e) => handleSocialChange(0, e.target.value)}
                                    className="!py-3 !rounded-xl bg-gray-50/50 border-gray-100 focus:bg-white transition-colors"
                                />
                                <Input
                                    placeholder="Social Link 2"
                                    value={formData.socialHandles[1]}
                                    onChange={(e) => handleSocialChange(1, e.target.value)}
                                    className="!py-3 !rounded-xl bg-gray-50/50 border-gray-100 focus:bg-white transition-colors"
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="pt-6">
                            <Button 
                                loading={saving} 
                                onClick={handleSubmit} 
                                className="w-full !py-3.5 !text-base !rounded-xl shadow-lg shadow-blue-500/10 bg-[rgb(32,38,130)] hover:bg-[rgb(40,48,160)] transition-all transform hover:-translate-y-0.5"
                            >
                                Complete Profile Setup <span>&rarr;</span>
                            </Button>
                        </div>
                    </div>
                </Card>

                {/* Trusted By Footer */}
                <p className="text-center text-sm text-gray-400 font-medium">
                    Verified data builds trust in the voluntary carbon market.
                </p>
            </div>
        </div>
    );
}
