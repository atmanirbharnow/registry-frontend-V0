import React, { useState } from "react";
import { Search, Pencil } from "lucide-react";
import SchoolAutocomplete from "../SchoolAutocomplete";
import Input from "../ui/Input";

interface SchoolLocationData {
    schoolName: string;
    address: string;
    city: string;
    pincode: string;
    lat?: number;
    lng?: number;
    place_id?: string;
}

interface UnifiedSchoolSectionProps {
    value: string;
    onChange: (name: string) => void;
    onPlaceSelect: (location: SchoolLocationData) => void;
    placeholder?: string;
    error?: string;
    label?: string;
    className?: string;
}

export default function UnifiedSchoolSection({
    value,
    onChange,
    onPlaceSelect,
    placeholder = "Search for school name...",
    error,
    label = "School / Institution Name",
    className = "",
}: UnifiedSchoolSectionProps) {
    const [mode, setMode] = useState<"search" | "manual">("search");

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
                        className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all flex items-center gap-2 ${
                            mode === "search" 
                            ? "bg-white text-[#003527] shadow-sm" 
                            : "text-slate-400 hover:text-slate-600"
                        }`}
                    >
                        <Search className="w-3 h-3" />
                        Search & Fill
                    </button>
                    <button
                        type="button"
                        onClick={() => setMode("manual")}
                        className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all flex items-center gap-2 ${
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

            <div className="relative">
                {mode === "search" ? (
                    <SchoolAutocomplete
                        value={value}
                        onPlaceSelect={onPlaceSelect}
                        onManualEntry={onChange}
                        placeholder={placeholder}
                        error={error}
                    />
                ) : (
                    <Input
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder="Type your school name manually..."
                        className="!py-2 !rounded-lg !border-slate-300 focus:!border-[#003527] !text-lg !font-bold"
                        error={error}
                    />
                )}
            </div>

            {mode === "manual" && (
                <div className="flex items-center gap-2 p-3 bg-[#eff7f2]/50 border border-[#b0f0d6] rounded-lg text-[10px] text-[#003527] font-bold uppercase tracking-widest leading-tight">
                    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Manual entry allows you to type any institution name. Note that this won't auto-fill address details.
                </div>
            )}
        </div>
    );
}
