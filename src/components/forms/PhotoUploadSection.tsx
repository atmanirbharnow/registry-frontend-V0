"use client";

import React, { useRef, useState } from "react";
import Spinner from "../ui/Spinner";
import { compressImage } from "@/lib/imageCompression";

export interface PhotoSlot {
    key: string;
    label: string;
}

interface PhotoUploadSectionProps {
    slots: PhotoSlot[];
    photos: Record<string, string | null>;
    userId: string;
    onPhotoChange: (key: string, url: string | null) => void;
}

async function uploadViaProxy(file: File, path: string): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("path", path);

    const response = await fetch("/api/storage-proxy", {
        method: "POST",
        body: formData,
    });

    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Upload failed");
    }

    const data = await response.json();
    return data.url;
}

export default function PhotoUploadSection({
    slots,
    photos,
    userId,
    onPhotoChange,
}: PhotoUploadSectionProps) {
    const [uploading, setUploading] = useState<Record<string, boolean>>({});
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [localPreviewUrls, setLocalPreviewUrls] = useState<Record<string, string>>({});
    const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

    const handleUpload = async (key: string, file: File) => {
        // Create local preview immediately
        const localUrl = URL.createObjectURL(file);
        setLocalPreviewUrls(prev => ({ ...prev, [key]: localUrl }));

        setUploading((prev) => ({ ...prev, [key]: true }));
        try {
            // Compress image before upload
            const processedFile = await compressImage(file);
            
            const path = `actions/${userId}/${key}-${Date.now()}-${file.name}`;
            const url = await uploadViaProxy(processedFile, path);
            onPhotoChange(key, url);
        } catch (error) {
            console.error("Upload failed", error);
        } finally {
            setUploading((prev) => ({ ...prev, [key]: false }));
        }
    };

    const clearPhoto = (key: string) => {
        if (localPreviewUrls[key]) {
            URL.revokeObjectURL(localPreviewUrls[key]);
            setLocalPreviewUrls(prev => {
                const next = { ...prev };
                delete next[key];
                return next;
            });
        }
        onPhotoChange(key, null);
        if (fileRefs.current[key]) {
            fileRefs.current[key]!.value = "";
        }
    };

    // Cleanup local URLs on unmount
    React.useEffect(() => {
        return () => {
            Object.values(localPreviewUrls).forEach(url => URL.revokeObjectURL(url));
        };
    }, []);

    return (
        <>
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider ml-1">
                        Verification Photos
                    </label>
                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#eff7f2] rounded-full border border-[#b0f0d6]">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#003527" strokeWidth="3">
                            <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" />
                            <path d="M12 16V12" />
                            <circle cx="12" cy="8" r="1" />
                        </svg>
                        <span className="text-[10px] font-bold text-[#003527] uppercase tracking-tight">
                            Images are automatically optimized for fast processing
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {slots.map((slot) => (
                        <div key={slot.key} className="space-y-1">
                            <span className="text-xs text-gray-500 font-medium ml-1">
                                {slot.label}
                            </span>
                            <div className="relative h-32 rounded-lg border-2 border-dashed border-gray-200 bg-gray-50/50 overflow-hidden">
                                {uploading[slot.key] ? (
                                    <div className="flex items-center justify-center h-full">
                                        <Spinner size="sm" />
                                    </div>
                                ) : photos[slot.key] ? (
                                    <>
                                        <img
                                            src={localPreviewUrls[slot.key] || photos[slot.key] || ""}
                                            alt={slot.label}
                                            className="w-full h-full object-cover cursor-pointer"
                                            onClick={() => setPreviewUrl(localPreviewUrls[slot.key] || photos[slot.key])}
                                        />
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                clearPhoto(slot.key);
                                            }}
                                            className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/60 hover:bg-black/80 text-white rounded-lg flex items-center justify-center transition-colors cursor-pointer"
                                            aria-label="Remove photo"
                                        >
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                                                <line x1="18" y1="6" x2="6" y2="18" />
                                                <line x1="6" y1="6" x2="18" y2="18" />
                                            </svg>
                                        </button>
                                    </>
                                ) : (
                                    <div
                                        onClick={() => fileRefs.current[slot.key]?.click()}
                                        className="flex items-center justify-center h-full hover:border-[#b0f0d6] hover:bg-[#eff7f2]/30 transition-all cursor-pointer"
                                    >
                                        <span className="text-gray-400 text-xs">+ Upload</span>
                                    </div>
                                )}
                            </div>
                            <input
                                ref={(el) => { fileRefs.current[slot.key] = el; }}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                aria-label={`Upload ${slot.label}`}
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleUpload(slot.key, file);
                                }}
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* Full-screen Preview Modal */}
            {previewUrl && (
                <div
                    className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
                    onClick={() => setPreviewUrl(null)}
                >
                    <button
                        type="button"
                        onClick={() => setPreviewUrl(null)}
                        className="absolute top-4 right-4 w-10 h-10 bg-white/20 hover:bg-white/30 text-white rounded-lg flex items-center justify-center transition-colors cursor-pointer z-10"
                        aria-label="Close preview"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                    <img
                        src={previewUrl}
                        alt="Preview"
                        className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}
        </>
    );
}
