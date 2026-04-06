"use client";

import React, { useState, useEffect } from "react";
import Input from "./ui/Input";
import Button from "./ui/Button";
import Card from "./ui/Card";
import CustomDropdown from "./ui/CustomDropdown";
import { updateUserProfile } from "@/lib/firestoreService";
import { toast } from "react-toastify";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserProfile } from "@/types/user";
import { usePincodeLookup } from "@/hooks/usePincodeLookup";
import Spinner from "./ui/Spinner";



import LocationAutocomplete from "./LocationAutocomplete";
import UnifiedAddressSection from "./forms/UnifiedAddressSection";
import UnifiedSchoolSection from "./forms/UnifiedSchoolSection";

interface ProfileSetupProps {
    uid: string;
    profile?: UserProfile | null;
    onComplete: () => void;
}

const INSTITUTION_TYPES = [
    { value: "Individual", label: "Individual Actor" },
    { value: "School", label: "Educational Institution (School/College)" },
] as const;

const BHARAT_STATES = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat",
    "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh",
    "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
    "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh",
    "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands", "Chandigarh",
    "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir",
    "Ladakh", "Lakshadweep", "Puducherry"
].map(s => ({ value: s, label: s }));

export default function ProfileSetup({ uid, profile, onComplete }: ProfileSetupProps) {
    const { user } = useAuth();
    const router = useRouter();

    // Check if profile is complete
    const isProfileIncomplete = !profile ||
        !profile.phone || profile.phone === '+91' ||
        !profile.contactPerson ||
        !profile.institutionType ||
        !profile.state ||
        !profile.city;

    const [isEditing, setIsEditing] = useState(isProfileIncomplete);
    const [formData, setFormData] = useState({
        displayName: profile?.displayName || user?.displayName || "",
        email: profile?.email || user?.email || "",
        phone: profile?.phone || "+91",
        contactPerson: profile?.contactPerson || "",
        institutionType: profile?.institutionType || "" as any,
        state: profile?.state || "",
        pincode: profile?.pincode || "",
        address: profile?.address || "",
        city: profile?.city || "",
        lat: profile?.lat ?? null,
        lng: profile?.lng ?? null,
        place_id: profile?.place_id || "",
        sector: profile?.sector || "",
        consentVerified: !!profile?.consentVerified,
        socialHandles: profile?.socialHandles || ["", "", ""],
    });
    const [saving, setSaving] = useState(false);

    // Pincode auto-detection logic
    const { state: pinState, city: pinCity, loading: pinLoading, error: pinError } = usePincodeLookup(formData.pincode);

    useEffect(() => {
        if (pinState && pinState !== formData.state) {
            setFormData(prev => ({ ...prev, state: pinState }));
        }
        if (pinCity && pinCity !== formData.city) {
            setFormData(prev => ({ ...prev, city: pinCity }));
        }
    }, [pinState, pinCity]);

    useEffect(() => {
        if (!formData.pincode || formData.pincode.trim().length !== 6) {
            if (formData.state) setFormData(prev => ({ ...prev, state: "" }));
            if (formData.city) setFormData(prev => ({ ...prev, city: "" }));
        }
    }, [formData.pincode]);

    // Update form when profile changes (e.g. after refresh)
    useEffect(() => {
        if (profile) {
            setFormData(prev => ({
                ...prev,
                displayName: profile.displayName || prev.displayName,
                phone: profile.phone || prev.phone,
                contactPerson: profile.contactPerson || prev.contactPerson,
                institutionType: profile.institutionType || prev.institutionType,
                state: profile.state || prev.state,
                pincode: profile.pincode || prev.pincode,
                address: profile.address || prev.address,
                city: profile.city || prev.city,
                sector: profile.sector || prev.sector,
                socialHandles: profile.socialHandles || prev.socialHandles,
                consentVerified: !!profile.consentVerified,
            }));

            // Only exit editing mode if the fetched profile is actually complete
            if (!isProfileIncomplete) {
                setIsEditing(false);
            }
        }
    }, [profile, isProfileIncomplete]);

    const handleTypeChange = (newType: string) => {
        setFormData(prev => ({
            ...prev,
            institutionType: newType as any,
            displayName: "",
            address: "",
            city: "",
            pincode: "",
            state: "",
            lat: null,
            lng: null,
            place_id: "",
        }));
    };

    const handleChange = (field: string, value: any) => {
        if (field === "institutionType") {
            handleTypeChange(value);
        } else {
            setFormData(prev => ({ ...prev, [field]: value }));
        }
    };

    const handleSocialChange = (index: number, value: string) => {
        const updated = [...formData.socialHandles];
        updated[index] = value;
        handleChange("socialHandles", updated);
    };

    const getNameLabel = () => {
        switch (formData.institutionType) {
            case "Individual": return "Individual Name";
            case "School": return "School / Institution Name";
            case "MSME": return "MSME Name";
            case "Commercial": return "Entity Name";
            case "NGO": return "NGO Name";
            case "Government": return "Government Body Name";
            default: return "Full Name / Entity Name";
        }
    };

    const handleSubmit = async () => {
        const trimmedPhone = formData.phone.trim();
        const trimmedEmail = formData.email.trim();
        const trimmedDisplayName = formData.displayName.trim();
        const trimmedContactPerson = formData.contactPerson.trim();
        const trimmedAddress = formData.address.trim();
        const trimmedCity = formData.city.trim();

        if (
            !trimmedDisplayName ||
            !trimmedPhone ||
            !trimmedContactPerson ||
            !formData.institutionType ||
            !formData.state ||
            !formData.pincode ||
            !trimmedAddress ||
            !trimmedCity ||
            !formData.consentVerified
        ) {
            toast.error("Please fill in all required fields and accept the consent.");
            return;
        }

        if (formData.pincode.length !== 6) {
            toast.error("Pincode must be exactly 6 digits.");
            return;
        }

        if (!/^\+91[0-9]{10}$/.test(trimmedPhone)) {
            toast.error("Invalid phone number. Must start with +91 followed by 10 digits.");
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
            toast.error("Invalid email address format.");
            return;
        }

        setSaving(true);
        try {
            await updateUserProfile(uid, {
                displayName: trimmedDisplayName,
                email: trimmedEmail,
                phone: trimmedPhone,
                contactPerson: trimmedContactPerson,
                institutionType: formData.institutionType,
                state: formData.state,
                pincode: formData.pincode,
                address: trimmedAddress,
                city: trimmedCity,
                ...(formData.lat !== null && { lat: formData.lat }),
                ...(formData.lng !== null && { lng: formData.lng }),
                place_id: formData.place_id,
                sector: formData.sector || formData.institutionType,
                consentVerified: formData.consentVerified,
                socialHandles: formData.socialHandles as [string, string, string],
            });
            // Clear any lingering drafts to prevent form data contamination
            localStorage.removeItem("school_onboarding_draft");
            localStorage.removeItem("register_action_draft"); // future proofing
            toast.success("Profile updated successfully!");
            setIsEditing(false);
            onComplete();
        } catch (err) {
            console.error(err);
            toast.error("Failed to save profile. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    const handleProceed = () => {
        if (formData.institutionType === "School") {
            router.push("/school-register");
        } else {
            router.push("/register/action");
        }
    };

    return (
        <div className="min-h-[calc(100vh-82px)] bg-slate-50 py-10 px-4 sm:px-6">
            <div className="max-w-4xl mx-auto space-y-10">
                <div className="text-center space-y-4">
                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6 border-b border-slate-200 pb-8">
                        <div className="space-y-2 text-center md:text-left">
                            <h1 className="text-3xl md:text-5xl font-black text-slate-800 tracking-tight text-center md:text-left">
                                {profile && !isProfileIncomplete ? "User Profile" : "Create Your Profile"}
                            </h1>
                            <p className="text-lg text-slate-500 font-medium text-center md:text-left">
                                {profile && !isProfileIncomplete
                                    ? "Manage your identity and organization details."
                                    : "Tell us a bit more about yourself or your organization to get started."}
                            </p>
                        </div>
                        {profile && !isEditing && (
                            <Button
                                onClick={handleProceed}
                                className="bg-[#003527] hover:bg-[#064e3b] !px-8 !py-4 !rounded-xl shadow-lg transform hover:-translate-y-1 transition-all"
                            >
                                Proceed to Register Action <span>&rarr;</span>
                            </Button>
                        )}
                    </div>
                </div>

                {/* Main Form Card */}
                <Card className="!p-6 sm:!p-10 md:!p-12 shadow-2xl border-2 border-slate-100 bg-white overflow-hidden rounded-[2rem]">
                    <div className="space-y-8 sm:space-y-10">
                        <div className="flex justify-between items-center border-b border-slate-100 pb-6">
                            <h2 className="text-2xl font-black text-slate-800 uppercase tracking-wider">
                                {isProfileIncomplete ? "Fill Information" : (isEditing ? "Edit Information" : "Identity Details")}
                            </h2>
                            {profile && !isEditing && (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="text-[#003527] font-bold text-sm uppercase tracking-widest hover:underline flex items-center gap-2"
                                >
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                                    Edit Details
                                </button>
                            )}
                        </div>

                        {isEditing ? (
                            <div className="space-y-10">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="md:col-span-2 space-y-2">
                                        <label className="block text-xs font-black text-slate-500 uppercase tracking-widest ml-1">
                                            Entity Type
                                        </label>
                                        <CustomDropdown
                                            options={INSTITUTION_TYPES}
                                            value={formData.institutionType}
                                            onChange={(val) => handleChange("institutionType", val)}
                                            placeholder="Select type..."
                                            size="lg"
                                        />
                                    </div>

                                    {formData.institutionType && (
                                        <div className="md:col-span-2 p-8 bg-slate-50/50 rounded-2xl border-2 border-slate-200">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                {formData.institutionType === 'School' ? (
                                                    <UnifiedSchoolSection
                                                        label={getNameLabel()}
                                                        value={formData.displayName}
                                                        onChange={(name) => handleChange("displayName", name)}
                                                        onPlaceSelect={(loc) => {
                                                            handleChange("displayName", loc.schoolName);
                                                            handleChange("address", loc.address);
                                                            handleChange("city", loc.city);
                                                            handleChange("pincode", loc.pincode);
                                                            handleChange("lat", loc.lat);
                                                            handleChange("lng", loc.lng);
                                                            handleChange("place_id", loc.place_id);
                                                        }}
                                                        placeholder={getNameLabel()}
                                                        className="md:col-span-2"
                                                    />
                                                ) : (
                                                    <div className="md:col-span-2">
                                                        <Input
                                                            label={getNameLabel()}
                                                            value={formData.displayName}
                                                            onChange={(e) => handleChange("displayName", e.target.value)}
                                                            className="!py-4 !rounded-xl !border-slate-300 focus:!border-blue-500"
                                                        />
                                                    </div>
                                                )}

                                                <div className="md:col-span-2 space-y-6">
                                                    <div className="flex items-center justify-between">
                                                        <label className="block text-xs font-black text-slate-500 uppercase tracking-widest ml-1">
                                                            Address Details
                                                        </label>
                                                        {pinLoading && <Spinner size="sm" className="text-blue-500" />}
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                        <div>
                                                            <Input
                                                                label="Pincode"
                                                                value={formData.pincode}
                                                                onChange={(e) => handleChange("pincode", e.target.value.replace(/\D/g, "").slice(0, 6))}
                                                                className="!py-4 !rounded-xl !border-slate-300 focus:!border-blue-500"
                                                                maxLength={6}
                                                                placeholder="6-digit Pincode"
                                                            />
                                                            {pinError && <p className="text-[10px] text-red-500 mt-1 font-bold px-1">{pinError}</p>}
                                                        </div>
                                                        <Input label="City" value={formData.city} placeholder="Auto-filled" disabled className="!py-4 !rounded-xl bg-slate-100/80 border-slate-200" />
                                                        <div className="space-y-2">
                                                            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest ml-1">State</label>
                                                            <CustomDropdown options={BHARAT_STATES} value={formData.state} onChange={(val) => handleChange("state", val)} placeholder="Auto-filled" size="lg" disabled className="bg-slate-100/80 !border-slate-200" />
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                        <Input label="Primary Contact Person" value={formData.contactPerson} onChange={(e) => handleChange("contactPerson", e.target.value)} className="!py-4 !rounded-xl !border-slate-300 focus:!border-blue-500" />
                                                        <Input label="Email Address" value={formData.email} disabled className="!py-4 !rounded-xl bg-slate-100 !border-slate-300 opacity-80" />
                                                        <Input label="Phone Number" value={formData.phone} onChange={(e) => handleChange("phone", e.target.value)} className="!py-4 !rounded-xl !border-slate-300 focus:!border-blue-500" />
                                                    </div>

                                                    <UnifiedAddressSection
                                                        label={`Full Address ${formData.institutionType !== 'Individual' ? '/ Location (Google Search)' : ''}`}
                                                        isIndividual={formData.institutionType === 'Individual'}
                                                        value={formData.address}
                                                        onChange={(val) => handleChange("address", val)}
                                                        onLocationSelect={(loc) => {
                                                            handleChange("address", loc.address);
                                                            if (loc.lat) handleChange("lat", loc.lat);
                                                            if (loc.lng) handleChange("lng", loc.lng);
                                                        }}
                                                        placeholder={formData.institutionType === 'Individual' ? "Enter your full address..." : "Search for your full building/street address..."}
                                                        className="w-full"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="bg-slate-50 p-6 rounded-2xl border-2 border-slate-200">
                                    <label className="flex items-start gap-4 cursor-pointer group">
                                        <div className="mt-0.5 relative">
                                            <input type="checkbox" checked={formData.consentVerified} onChange={(e) => handleChange("consentVerified", (e.target.checked as any))} className="peer appearance-none w-6 h-6 border-2 border-slate-400 rounded-lg checked:border-[#003527] checked:bg-[#003527] transition-all cursor-pointer" />
                                            <svg className="absolute top-1 left-1 opacity-0 peer-checked:opacity-100 text-white w-4 h-4 pointer-events-none transition-opacity" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                                        </div>
                                        <span className="text-sm font-bold text-slate-600 group-hover:text-slate-900 transition-colors leading-relaxed">
                                            I authorize Climate Asset Foundation to process my data for the purpose of carbon verification and registry maintenance.
                                        </span>
                                    </label>
                                </div>

                                <div className="flex flex-col-reverse sm:flex-row gap-4 pt-6 border-t border-slate-100">
                                    <Button
                                        variant="secondary"
                                        onClick={() => setIsEditing(false)}
                                        className="w-full sm:w-auto px-8 py-4 uppercase tracking-widest font-black text-xs"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={handleSubmit}
                                        disabled={saving}
                                        className="flex-1 px-8 py-4 bg-[#003527] text-white uppercase tracking-widest font-black text-xs shadow-xl shadow-emerald-900/20 active:scale-95 transition-all"
                                    >
                                        {saving ? "Saving..." : "Create Profile & Continue"}
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-12 animate-in fade-in duration-500">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                                    <div className="space-y-2">
                                        <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Entity Type</p>
                                        <p className="text-xl font-bold text-slate-800">{formData.institutionType}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Name</p>
                                        <p className="text-xl font-bold text-slate-800">{formData.displayName}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Contact Person</p>
                                        <p className="text-xl font-bold text-slate-800">{formData.contactPerson}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Phone Number</p>
                                        <p className="text-xl font-bold text-slate-800">{formData.phone}</p>
                                    </div>
                                    <div className="space-y-2 text-wrap break-words">
                                        <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Email Address</p>
                                        <p className="text-xl font-bold text-slate-800">{formData.email}</p>
                                    </div>
                                    <div className="space-y-2 md:col-span-2 lg:col-span-1">
                                        <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Location</p>
                                        <p className="text-xl font-bold text-slate-800 leading-relaxed">
                                            {formData.city}, {formData.state} {formData.pincode}
                                        </p>
                                    </div>
                                    <div className="md:col-span-2 lg:col-span-3 space-y-2 pt-6 border-t border-slate-50">
                                        <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Full Address</p>
                                        <p className="text-xl font-bold text-slate-800 leading-relaxed max-w-4xl">
                                            {formData.address}
                                        </p>
                                    </div>
                                </div>

                                {formData.socialHandles.some(h => h) && (
                                    <div className="pt-10 border-t border-slate-100">
                                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Web & Social Presence</p>
                                        <div className="flex flex-wrap gap-4">
                                            {formData.socialHandles.map((handle, idx) => handle && (
                                                <div key={idx} className="bg-slate-50 px-6 py-3 rounded-xl text-sm font-bold text-slate-600 border-2 border-slate-200">
                                                    {handle}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </Card>

                {/* Footer Component */}
                <div className="text-center space-y-2 pt-8">
                    <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">
                        Climate Asset Foundation Registry System
                    </p>
                    <p className="text-xs text-slate-300 font-medium">
                        Secure and verified carbon action tracking infrastructure.
                    </p>
                </div>
            </div>
        </div>
    );
}
