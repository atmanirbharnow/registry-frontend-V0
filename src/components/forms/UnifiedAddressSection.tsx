"use client";

import React, { useState, useCallback } from "react";
import { Pencil } from "lucide-react";
import LocationAutocomplete from "../LocationAutocomplete";
import Spinner from "../ui/Spinner";
import { toast } from "react-toastify";

interface LocationData {
    address: string;
    lat?: number;
    lng?: number;
    city?: string;
    state?: string;
    pincode?: string;
}

interface UnifiedAddressSectionProps {
    value: string;
    onChange: (address: string) => void;
    onLocationSelect: (location: LocationData) => void;
    placeholder?: string;
    error?: string;
    touched?: boolean;
    label?: string;
    className?: string;
    isIndividual?: boolean;
}

export default function UnifiedAddressSection({
    value,
    onChange,
    onLocationSelect,
    placeholder = "Enter your full address...",
    error,
    touched,
    label = "Full Address",
    className = "",
    isIndividual = false
}: UnifiedAddressSectionProps) {
    const [mode, setMode] = useState<"search" | "manual">("search");
    const [loadingGPS, setLoadingGPS] = useState(false);

    const handleUseGPS = useCallback(() => {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser");
            return;
        }

        setLoadingGPS(true);
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const gpsLat = position.coords.latitude;
                const gpsLng = position.coords.longitude;

                try {
                    const response = await fetch(
                        `/api/google/geocode?lat=${gpsLat}&lng=${gpsLng}`
                    );
                    
                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.details || "API Error");
                    }
                    
                    const data = await response.json();
                    
                    if (data.results?.[0]) {
                        const result = data.results[0];
                        const address = result.formatted_address;
                        
                        // Parse address components
                        let city = "";
                        let state = "";
                        let pincode = "";
                        
                        result.address_components?.forEach((component: any) => {
                            const types = component.types || [];
                            if (types.includes("locality") || types.includes("administrative_area_level_2")) {
                                city = component.long_name;
                            }
                            if (types.includes("administrative_area_level_1")) {
                                state = component.long_name;
                            }
                            if (types.includes("postal_code")) {
                                pincode = component.long_name;
                            }
                        });

                        onLocationSelect({
                            address,
                            lat: gpsLat,
                            lng: gpsLng,
                            city,
                            state,
                            pincode
                        });
                        onChange(address);
                        toast.success("Location detected!");
                    } else {
                        throw new Error("No address found for these coordinates.");
                    }
                } catch (err: any) {
                    console.error("GPS Geocoding error:", err);
                    toast.error(`Geocoding failed: ${err.message}`);
                    const fallbackAddress = `${gpsLat.toFixed(6)}, ${gpsLng.toFixed(6)}`;
                    onLocationSelect({
                        address: fallbackAddress,
                        lat: gpsLat,
                        lng: gpsLng,
                    });
                    onChange(fallbackAddress);
                } finally {
                    setLoadingGPS(false);
                }
            },
            (error) => {
                console.error("GPS Error Details:", {
                    code: error.code,
                    message: error.message,
                    PERMISSION_DENIED: error.PERMISSION_DENIED,
                    POSITION_UNAVAILABLE: error.POSITION_UNAVAILABLE,
                    TIMEOUT: error.TIMEOUT
                });
                
                let errorMsg = "Could not get your location.";
                if (error.code === error.PERMISSION_DENIED) {
                    errorMsg = "Location permission denied. Please allow location access in your browser settings.";
                } else if (error.code === error.TIMEOUT) {
                    errorMsg = "Location request timed out. Please try again or enter your address manually.";
                }
                
                toast.error(errorMsg);
                setLoadingGPS(false);
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
        );
    }, [onChange, onLocationSelect]);

    return (
        <div className={`space-y-4 ${className}`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest ml-1">
                    {label}
                </label>
                <div className="flex p-1 bg-slate-100 rounded-lg w-fit self-end sm:self-auto">
                    <button
                        type="button"
                        onClick={() => setMode("search")}
                        className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${
                            mode === "search" 
                            ? "bg-white text-[#003527] shadow-sm" 
                            : "text-slate-400 hover:text-slate-600"
                        }`}
                    >
                        🔍 Search & Fill
                    </button>
                    <button
                        type="button"
                        onClick={() => setMode("manual")}
                        className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${
                            mode === "manual" 
                            ? "bg-white text-[#003527] shadow-sm" 
                            : "text-slate-400 hover:text-slate-600"
                        }`}
                    >
                        <Pencil className="w-3 h-3" />
                        Manual Entry
                    </button>
                </div>
            </div>

            <div className="relative group">
                {mode === "search" ? (
                    <div className="space-y-3">
                            <LocationAutocomplete
                                value={value}
                                onChange={(e) => onChange(e.target.value)}
                                onPlaceSelect={onLocationSelect}
                                placeholder={placeholder}
                                disableValidation={isIndividual}
                                className="!py-2 !rounded-lg !border-slate-200 focus:!border-[#003527] shadow-sm"
                            />
                            <button
                                type="button"
                                onClick={handleUseGPS}
                                disabled={loadingGPS}
                                className="flex items-center gap-2 px-5 py-2.5 bg-[#eff7f2] hover:bg-[#b0f0d6] text-[#003527] text-xs font-black uppercase tracking-widest rounded-lg transition-all active:scale-95 disabled:opacity-50"
                            >
                            {loadingGPS ? (
                                <Spinner size="sm" className="text-[#003527]" />
                            ) : (
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            )}
                            {loadingGPS ? "Detecting..." : "Detect my precise location"}
                        </button>
                    </div>
                ) : (
                    <textarea
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder="Type your full address manually..."
                        className={`w-full min-h-[120px] px-5 py-2 bg-white border-2 border-slate-200 rounded-lg outline-none font-semibold text-slate-800 placeholder-slate-300 focus:border-[#003527] transition-all shadow-sm ${
                            touched && error ? "border-red-500 bg-red-50" : ""
                        }`}
                    />
                )}
                
                {touched && error && (
                    <p className="mt-1.5 text-[10px] text-red-500 font-bold px-2 uppercase tracking-widest">
                        {error}
                    </p>
                )}
            </div>

            {mode === "manual" && (
                <div className="flex items-center gap-2 p-3 bg-[#eff7f2]/50 border border-[#b0f0d6] rounded-lg text-[10px] text-[#003527] font-bold uppercase tracking-widest leading-tight">
                    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Manual entry saves your address text. Switch to Search if you need precise carbon credit coordinates.
                </div>
            )}
        </div>
    );
}
